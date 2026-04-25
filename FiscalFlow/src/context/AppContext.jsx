import { createContext, useContext, useState, useEffect } from "react";
import { initialTransactions } from "../assets/mockdata.js";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    return localStorage.getItem("app_role") || "Viewer";
  });

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("app_theme") === "dark";
  });

  // const [transactions, setTransactions] = useState(() => {
  //   const data = localStorage.getItem("transactions");
  //   return data ? JSON.parse(data) : initialTransactions;
  // });
  const [transactions, setTransactions] = useState(initialTransactions);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // listen for logins/logouts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();

          // sync the user with our Postgres Database
          await fetch("http://localhost:5000/api/sync-user", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });

          fetchTransactions(currentUser);
        } catch (error) {
          console.error("Error during login sync:", error);
        }
      } else {
        // if logged out, clear data
        setTransactions(initialTransactions);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchTransactions = async (currentUser = user) => {
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();

      const response = await fetch("http://localhost:5000/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.log("Not logged in yet, using mock data.");
        setTransactions(initialTransactions);
        return;
      }

      const data = await response.json();

      // if DB is empty, use mock data. Otherwise, use real data.
      if (data.length === 0) {
        setTransactions(initialTransactions);
      } else {
        setTransactions(data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions(initialTransactions);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // fetch data when app loads
  // useEffect(() => {
  //   fetchTransactions();
  // }, []);

  const [filters, setFilters] = useState({
    type: "all",
    search: "",
    sort: "latest",
  });

  // useEffect(() => {
  //   localStorage.setItem("transactions", JSON.stringify(transactions));
  // }, [transactions]);

  useEffect(() => {
    localStorage.setItem("app_role", role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem("app_theme", isDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const addTransaction = async (txn) => {
    if (!user) {
      setTransactions((prev) => [{ ...txn, id: Date.now() }, ...prev]);
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(txn),
      });

      if (response.ok) {
        const newTxn = await response.json();
        newTxn.amount = parseFloat(newTxn.amount);
        setTransactions((prev) => [newTxn, ...prev]);
      } else {
        alert("Failed to save transaction to database.");
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const deleteTransaction = async (id) => {
    if (!user) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `http://localhost:5000/api/transactions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert("Failed to delete transaction from database.");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const toggleTheme = () => setIsDark(!isDark);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        isDark,
        toggleTheme,
        transactions,
        addTransaction,
        deleteTransaction,
        filters,
        setFilters,
        totalIncome,
        totalExpense,
        totalBalance,
        fetchTransactions,
        user,
        authLoading,
        handleLogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
