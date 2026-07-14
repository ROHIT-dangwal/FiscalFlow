# FiscalFlow 💹

FiscalFlow is a full-stack personal finance dashboard. A **React + Vite** frontend delivers real-time spending insights through interactive charts and transaction management, backed by a **Node.js/Express API** that persists data in **PostgreSQL** and authenticates users through **Firebase Auth**.

---

## 🚀 Live Demo
[View Live Project](https://fiscal-flow-seven.vercel.app/)

## ✨ Key Features

### 📊 Dynamic Dashboard
- **Real-time Analytics:** Summary cards for Total Balance, Income, and Expenses that update instantly upon data modification.
- **Visual Spend Activity:** A custom-styled Area Chart showing monthly cash flow trends using `Recharts`.
- **Intelligent Categorization:** A specialized Donut Chart that automatically groups smaller expenses into an "Others" category to maintain UI clarity.

### 🔍 Advanced Transaction Management
- **Search & Filter:** Instant "as-you-type" search by merchant or category names.
- **Type Filtering:** Toggle between "Income Only," "Expenses Only," or "All Transactions."
- **Multi-Criteria Sorting:** Sort history by Date (Newest/Oldest) or Amount (Highest/Lowest).
- **CSV Import/Export:** Upload a CSV to bulk-load transactions into the database, or export your current history for external use.

### 🔐 Authentication & Role-Based UI
- **Firebase Authentication:** Email/password and Google sign-in, with ID tokens verified server-side on every protected request.
- **Viewer Mode:** A read-only experience where charts and tables are visible, but modification actions are restricted.
- **Admin Mode:** Grants full permissions to add new transactions via a global modal and delete specific entries.

### 🌓 Theme & Persistence
- **Dark/Light Mode:** A sleek theme engine that responds to user preference and persists via `localStorage`.
- **Cloud-backed Data:** Once logged in, transactions live in PostgreSQL rather than the browser, so data survives across devices and sessions. Logged-out users see local mock data as a preview.

---

## 🏗️ Architecture Overview

FiscalFlow is split into two independently deployable projects in this monorepo:

```
├── FiscalFlow/            # React frontend (Vite, deployed on Vercel)
└── FiscalFlow-Backend/    # Express API (deployed on Render)
```

The frontend never talks to PostgreSQL directly. Instead:

1. The user authenticates with **Firebase Auth** in the browser.
2. The frontend fetches a Firebase **ID token** and sends it as a `Bearer` token on every API request.
3. The backend verifies that token server-side with the **Firebase Admin SDK**, then executes the corresponding SQL query scoped to that user's `firebase_uid`.

This means Postgres credentials and all data-access logic stay entirely on the server — the client only ever holds a short-lived identity token, never a database credential.

---

## 🖥️ Frontend (`FiscalFlow/`)

### Tech Stack
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4 (CSS variables power the dark/light theme)
- **Routing:** React Router v7
- **Icons:** FontAwesome (SVG)
- **Charts:** Recharts (D3-based)
- **Animations:** Framer Motion
- **Auth client:** Firebase JS SDK

### State Management & Architecture
The application is architected around a **Centralized State Pattern** using the **React Context API** (`AppContext.jsx`):
- **Single Source of Truth**: Auth state, transactions, user role, and theme are managed in one place, keeping Dashboard, Analytics, and Transactions pages in sync.
- **Prop-Drilling Elimination**: Any component can read or update global state without passing props through intermediate layers.
- **Sync-on-login**: When Firebase reports an authenticated user, `AppContext` calls `/api/sync-user` to upsert the user into Postgres, then immediately fetches that user's transactions from the backend. Logged-out users fall back to local mock data so the UI is always populated.

### Component Design & Philosophy
- **Declarative UI**: Sidebar and modal visibility are controlled by state (`menuOpen`, `isModalOpen`) rather than direct DOM manipulation.
- **Data Processing Hooks**: `useMemo` handles heavier derived data — monthly trend calculations, category grouping — to avoid unnecessary re-computation.
- **Logic Isolation**: Page-specific logic stays in its view; shared formatters (currency, date) live in shared utilities.

### Responsive Layout & UX
- **Utility-First Styling**: Tailwind CSS with CSS variables enables instant, system-wide Dark/Light Mode.
- **Adaptive Navigation**: A sidebar that transitions from a permanent desktop rail to a touch-optimized mobile drawer with a blurred backdrop.
- **Data Accessibility**: Horizontally scrollable tables keep dense financial data usable on small screens.
- **Fluid Motion**: Framer Motion drives page and element transitions.

---

## ⚙️ Backend (`FiscalFlow-Backend/`)

A lightweight **Express** REST API responsible for authentication verification, transaction persistence, and CSV ingestion.

### Tech Stack
- **Runtime/Framework:** Node.js + Express 5
- **Database:** PostgreSQL, accessed via the `pg` connection pool
- **Auth verification:** `firebase-admin` (validates ID tokens issued by the frontend's Firebase project)
- **File uploads:** `multer` (handles multipart CSV uploads) + `csv-parser` (streams and parses rows)
- **Config:** `dotenv` for local environment variables, `cors` for cross-origin requests from the Vercel-hosted frontend

### Request Flow & Middleware
Every data route is protected by an `authenticateToken` middleware that:
1. Reads the `Authorization: Bearer <token>` header.
2. Verifies the token via `admin.auth().verifyIdToken(token)`.
3. Attaches the decoded Firebase user (`uid`, `email`) to `req.user`.
4. Rejects the request with `401`/`403` if the token is missing or invalid.

All subsequent database queries are scoped by `req.user.uid`, so one user can never read or modify another user's transactions — this check happens both in the `WHERE` clause of each query and, for deletes, in the `RETURNING` check that confirms a row actually belonged to that user.

### API Endpoints

| Method | Route | Auth required | Description |
|---|---|---|---|
| `POST` | `/api/sync-user` | ✅ | Upserts the authenticated Firebase user into the `users` table (no-op if already present). |
| `GET` | `/api/transactions` | ✅ | Returns all transactions for the authenticated user, newest first. |
| `POST` | `/api/transactions` | ✅ | Inserts a new transaction (`date`, `merchant`, `category`, `type`, `amount`) for the authenticated user. |
| `DELETE` | `/api/transactions/:id` | ✅ | Deletes a transaction by id, only if it belongs to the authenticated user. |
| `POST` | `/api/upload` | ✅ | Accepts a CSV file (`multipart/form-data`, field `file`), parses it row by row, and bulk-inserts valid rows as transactions. Invalid rows (missing date/type or non-numeric amount) are skipped. |

### Database Schema (expected tables)
The backend expects a PostgreSQL database with (at minimum) tables shaped like:

```sql
CREATE TABLE users (
  firebase_uid TEXT PRIMARY KEY,
  email TEXT NOT NULL
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  merchant TEXT,
  category TEXT,
  type TEXT NOT NULL,       -- 'income' | 'expense'
  amount NUMERIC NOT NULL,
  firebase_uid TEXT REFERENCES users(firebase_uid)
);
```

### Environment Variables
Create a `.env` file inside `FiscalFlow-Backend/`:

```env
DB_USER=your_postgres_user
DB_HOST=your_postgres_host
DB_DATABASE=your_postgres_database
DB_PASSWORD=your_postgres_password
DB_PORT=5432
PORT=5000

# Either provide the full service account JSON as one line...
FIREBASE_SERVICE_ACCOUNT={"type":"service_account", ...}
# ...or drop a firebase-service-account.json file in the project root instead.
```

- `DB_HOST` also toggles SSL: if set, the pool connects with `ssl: { require: true, rejectUnauthorized: false }` (suitable for most managed Postgres providers like Render, Supabase, or Neon).
- Firebase credentials can be supplied either as a raw JSON string in `FIREBASE_SERVICE_ACCOUNT` (used in the deployed Render environment) or as a local `firebase-service-account.json` file (used for local development). The server exits on startup if neither is available.

### Running the Backend Locally

```bash
cd FiscalFlow-Backend
npm install
# add your .env file as described above
node server.js
```

The API will start on `http://localhost:5000` (or the port set via `PORT`).

---

## 📦 Full Project Setup

### 1. Clone the repository
```bash
git clone https://github.com/rohit-dangwal/fiscalflow.git
cd fiscalflow
```

### 2. Set up the backend
```bash
cd FiscalFlow-Backend
npm install
# configure .env as documented above, then:
node server.js
```

### 3. Set up the frontend
```bash
cd ../FiscalFlow
npm install
```
Configure `src/firebase.js` with your Firebase web app config, and point the frontend's `fetch` calls (in `AppContext.jsx`) at your backend URL if not using the deployed Render instance.

```bash
npm run dev       # start dev server
npm run build      # production build
npm run preview    # preview the production build
```

---

## 📁 Project Structure

```text
FiscalFlow/                  # Frontend
└── src/
    ├── components/          # Reusable UI (Navbar, PageTransitions)
    ├── context/             # Centralized state + backend API calls (AppContext)
    ├── pages/               # Views (Dashboard, Analytics, Transactions, Login)
    ├── assets/              # Static files, mock data
    ├── firebase.js          # Firebase client SDK config
    ├── App.jsx              # Routing logic and provider wrapping
    └── index.css            # Tailwind directives

FiscalFlow-Backend/          # Backend
├── server.js                # Express app: routes, auth middleware, DB pool
└── package.json
```

## 🧪 Tech Stack Summary

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router, Tailwind CSS v4, Framer Motion, Recharts, FontAwesome |
| **Backend** | Node.js, Express 5, PostgreSQL (`pg`), Multer, csv-parser |
| **Auth** | Firebase Authentication (client SDK) + Firebase Admin SDK (server-side token verification) |
| **Hosting** | Vercel (frontend), Render (backend) |

---

## 👤 Authors
**Rohit Dangwal**
* [GitHub](https://github.com/ROHIT-dangwal)
* [LinkedIn](https://www.linkedin.com/in/rohit-dangwal)

**Manan Kasturia**
- [GitHub](https://github.com/manankasturia)
- [LinkedIn](https://www.linkedin.com/in/manankasturia)

---

## 📝 License
This project is licensed under the MIT License.
