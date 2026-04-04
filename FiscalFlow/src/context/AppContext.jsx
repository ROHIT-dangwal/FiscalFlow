import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [role, setRole] = useState("User");
  const [transactions, setTransactions] = useState(() => {
    const data = localStorage.getItem("transactions");
    return data
      ? JSON.parse(data)
      : [
          { id: 1, amount: 5000, type: "income", category: "Salary", date: "2026-04-01" },
          { id: 2, amount: 1200, type: "expense", category: "Food", date: "2026-04-02" }
        ];
  });

  const [filters, setFilters] = useState({
    type: "all",
    search: "",
    sort: "latest"
  });

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (txn) => {
    setTransactions((prev) => [...prev, { ...txn, id: Date.now() }]);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTransaction = (id, updated) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
  };

  const filteredTransactions = transactions
    .filter((t) =>
      filters.type === "all" ? true : t.type === filters.type
    )
    .filter((t) =>
      t.category.toLowerCase().includes(filters.search.toLowerCase())
    )
    .sort((a, b) => {
      if (filters.sort === "latest") return new Date(b.date) - new Date(a.date);
      if (filters.sort === "oldest") return new Date(a.date) - new Date(b.date);
      if (filters.sort === "amount") return b.amount - a.amount;
      return 0;
    });

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
        transactions,
        filteredTransactions,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        filters,
        setFilters,
        totalIncome,
        totalExpense,
        totalBalance
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);