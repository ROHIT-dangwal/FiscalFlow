import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar/Navbar.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Transactions from "./pages/Transactions.jsx"
import Insights from "./pages/Insights.jsx"

function App() {
  return (
    <div className="flex min-h-screen">
      <Navbar />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/insights" element={<Insights />} />
        </Routes>
      </div>
    </div>
  )
}

export default App