import { useApp } from "../context/AppContext"

function Insights() {
  const { transactions } = useApp()

  const categoryMap = {}

  transactions.forEach((t) => {
    if (t.type === "expense") {
      categoryMap[t.category] =
        (categoryMap[t.category] || 0) + t.amount
    }
  })

  const highestCategory = Object.keys(categoryMap).reduce(
    (a, b) => (categoryMap[a] > categoryMap[b] ? a : b),
    Object.keys(categoryMap)[0]
  )

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Insights</h1>

      <div className="bg-card p-4 rounded-xl border border-border">
        {highestCategory ? (
          <p>
            Highest spending category:{" "}
            <span className="font-semibold">{highestCategory}</span>
          </p>
        ) : (
          <p className="text-text-secondary">No data available</p>
        )}
      </div>
    </div>
  )
}

export default Insights