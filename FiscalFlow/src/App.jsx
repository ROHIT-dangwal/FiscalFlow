import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar/Navbar.jsx";
import PageTransition from "./components/PageTransition.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Analytics from "./pages/Analytics.jsx";
import Transactions from "./pages/Transactions.jsx";
import Login from "./pages/Login";

function App() {
  const { user, authLoading } = useApp();
  const location = useLocation();

  if (authLoading) {
    return <div className="min-h-screen bg-bg"></div>;
  }

  if (location.pathname === "/login") {
    return user ? <Navigate to="/" replace /> : <Login />;
  }

  return (
    <Navbar>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Dashboard />
              </PageTransition>
            }
          />
          <Route
            path="/analytics"
            element={
              <PageTransition>
                <Analytics />
              </PageTransition>
            }
          />
          <Route
            path="/transactions"
            element={
              <PageTransition>
                <Transactions />
              </PageTransition>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Navbar>
  );
}

export default App;
