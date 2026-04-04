import { useApp } from "../context/AppContext"

function Dashboard() {
  const { totalBalance, totalIncome, totalExpense } = useApp()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-text-secondary">Total Balance</p>
          <h2 className="text-xl font-semibold">₹ {totalBalance}</h2>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-text-secondary">Income</p>
          <h2 className="text-xl font-semibold text-success">₹ {totalIncome}</h2>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border">
          <p className="text-text-secondary">Expenses</p>
          <h2 className="text-xl font-semibold text-danger">₹ {totalExpense}</h2>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border border-border">
        <p className="text-text-secondary">Charts coming next...</p>
      </div>
    </div>
  )
}

export default Dashboard