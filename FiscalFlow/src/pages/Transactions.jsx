import { useApp } from "../context/AppContext"

function Transactions() {
  const { filteredTransactions, deleteTransaction } = useApp()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>

      <div className="bg-card p-4 rounded-xl border border-border">
        {filteredTransactions.length === 0 ? (
          <p className="text-text-secondary">No transactions found</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-text-secondary">
                <th className="py-2">Date</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="border-t border-border">
                  <td className="py-2">{t.date}</td>
                  <td>{t.category}</td>
                  <td className={t.type === "income" ? "text-success" : "text-danger"}>
                    {t.type}
                  </td>
                  <td>₹ {t.amount}</td>
                  <td>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="text-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Transactions