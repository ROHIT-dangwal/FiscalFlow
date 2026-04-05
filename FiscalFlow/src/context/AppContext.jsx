import { createContext, useContext, useState, useEffect } from "react";
import { initialTransactions } from "../assets/mockdata.js";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    return localStorage.getItem("app_role") || "Viewer";
  });

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("app_theme") === "dark";
  });

  const [transactions, setTransactions] = useState(() => {
    const data = localStorage.getItem("transactions");
    return data ? JSON.parse(data) : initialTransactions;
  });

  const [filters, setFilters] = useState({
    type: "all",
    search: "",
    sort: "latest"
  });

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("app_role", role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem("app_theme", isDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const addTransaction = (txn) => {
    setTransactions((prev) => [{ ...txn, id: Date.now() }, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
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
        role, setRole,
        isDark, toggleTheme,
        transactions,
        addTransaction, deleteTransaction,
        filters, setFilters,
        totalIncome, totalExpense, totalBalance
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);