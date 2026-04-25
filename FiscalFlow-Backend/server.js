const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// firebase setup
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (err) {
    console.error(
      "CRITICAL: Failed to parse FIREBASE_SERVICE_ACCOUNT. Check Render dashboard.",
    );
    process.exit(1);
  }
} else {
  try {
    serviceAccount = require("./firebase-service-account.json");
  } catch (err) {
    console.error("CRITICAL: Missing Firebase credentials.");
    process.exit(1);
  }
}
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.DB_HOST
    ? { require: true, rejectUnauthorized: false }
    : false,
});

pool.connect((err, client, release) => {
  if (err) return console.error("Error acquiring client", err.stack);
  console.log("Successfully connected to the PostgreSQL database!");
  release();
});

// middleware (the lock)
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if token exists
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // verify with firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // user info(uid, email)
    next(); // pass the lock, proceed to the route
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(403).json({ error: "Unauthorized: Invalid token" });
  }
};

// Routes

app.post("/api/sync-user", authenticateToken, async (req, res) => {
  const { uid, email } = req.user;
  try {
    await pool.query(
      "INSERT INTO users (firebase_uid, email) VALUES ($1, $2) ON CONFLICT (firebase_uid) DO NOTHING",
      [uid, email],
    );
    res.json({ message: "User synced securely!" });
  } catch (err) {
    console.error("Error syncing user:", err);
    res.status(500).json({ error: "Failed to sync user" });
  }
});

app.get("/api/transactions", authenticateToken, async (req, res) => {
  try {
    // Fetch all transactions, newest first
    const result = await pool.query(
      "SELECT * FROM transactions WHERE firebase_uid = $1 ORDER BY date DESC",
      [req.user.uid],
    );
    // convert string to js numbers for amount field
    const formattedTransactions = result.rows.map((row) => ({
      ...row,
      amount: parseFloat(row.amount),
    }));

    res.json(formattedTransactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// add new transaction
app.post("/api/transactions", authenticateToken, async (req, res) => {
  const { date, merchant, category, type, amount } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO transactions (date, merchant, category, type, amount, firebase_uid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [date, merchant, category, type, amount, req.user.uid],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding transaction:", err);
    res.status(500).json({ error: "Failed to add transaction" });
  }
});

// delete a transaction
app.delete("/api/transactions/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM transactions WHERE id = $1 AND firebase_uid = $2 RETURNING *",
      [id, req.user.uid],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Transaction not found or unauthorized" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("Error deleting transaction:", err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

app.post(
  "/api/upload",
  authenticateToken,
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userUid = req.user.uid;
    const results = [];

    // Read the uploaded CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          for (let row of results) {
            const date = row["Date"];
            const merchant = row["Merchant"]
              ? row["Merchant"].replace(/"/g, "")
              : "Unknown";
            const category = row["Category"]
              ? row["Category"].replace(/"/g, "")
              : "Uncategorized";
            const type = row["Type"];
            const amount = parseFloat(row["Amount"]);

            if (date && type && !isNaN(amount)) {
              await pool.query(
                "INSERT INTO transactions (date, merchant, category, type, amount, firebase_uid) VALUES ($1, $2, $3, $4, $5, $6)",
                [date, merchant, category, type, amount, req.user.uid],
              );
            }
          }

          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }

          res.json({ message: "File successfully uploaded and data saved!" });
        } catch (err) {
          console.error("Database Error:", err);
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          res.status(500).json({ error: "Failed to save data to database" });
        }
      });
  },
);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
