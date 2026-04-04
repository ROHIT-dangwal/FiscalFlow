import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAngleDown } from "@fortawesome/free-solid-svg-icons"
function Navbar() {
  const [isToggled, setIsToggled] = useState(false);
const [roleOpen, setRoleOpen] = useState(false);
const [role, setRole] = useState("User");
  return (
    <div className="flex min-h-screen bg-bg text-text-primary">
      <aside className="w-60 bg-sidebar border-r border-border p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-6 text-center">FiscalFlow</h1>

        <nav className="flex flex-col gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg ${
                isActive
                  ? "bg-primary text-text-primary"
                  : "text-text-secondary hover:bg-card"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg ${
                isActive
                  ? "bg-primary text-text-primary"
                  : "text-text-secondary hover:bg-card"
              }`
            }
          >
            Transactions
          </NavLink>

          <NavLink
            to="/insights"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg ${
                isActive
                  ? "bg-primary text-text-primary"
                  : "text-text-secondary hover:bg-card"
              }`
            }
          >
            Insights
          </NavLink>
        </nav>

        <div className="mt-auto pt-6 border-t border-border">
          <button className="w-full text-left px-4 py-2 text-text-secondary hover:bg-card rounded-lg">
            Settings
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold">Dashboard</h2>

          <div className="flex items-center gap-4">
            <div className="relative">
  <button
    onClick={() => setRoleOpen(!roleOpen)}
    className="flex items-center gap-2 px-3 py-1 bg-card border border-border rounded-lg hover:bg-border transition"
  >
    <span className="text-sm">{role}</span>
    <span className="text-xs"><FontAwesomeIcon icon={faAngleDown} /></span>
  </button>

  {roleOpen && (
    <div className="absolute right-0 mt-2 w-32 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
      <button
        onClick={() => {
          setRole("User");
          setRoleOpen(false);
        }}
        className="w-full text-left px-4 py-2 text-sm hover:bg-border"
      >
        User
      </button>

      <button
        onClick={() => {
          setRole("Admin");
          setRoleOpen(false);
        }}
        className="w-full text-left px-4 py-2 text-sm hover:bg-border"
      >
        Admin
      </button>
    </div>
  )}
</div>
            <label className="flex items-center gap-3 cursor-pointer select-none">

  <div className="relative">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={isToggled}
      onChange={() => setIsToggled(!isToggled)}
    />

    <div className="w-12 h-6 bg-border rounded-full transition-all duration-300 peer-checked:bg-primary"></div>

    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-6"></div>
  </div>

  <span className="text-sm text-text-secondary">
    {isToggled ? "Dark" : "Light"}
  </span>

</label>

            <button className="px-3 py-1 bg-primary text-text-primary rounded-md">
              Export Now
            </button>
          </div>
        </header>
      </div>
    </div>
  );
}

export default Navbar;