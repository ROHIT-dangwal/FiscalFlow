import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faDownload,
  faUpload,
  faBars,
  faTimes,
  faTableColumns,
  faChartLine,
  faMoneyBillTransfer,
  faRightFromBracket,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../../context/AppContext";

function Navbar({ children }) {
  const {
    role,
    setRole,
    isDark,
    toggleTheme,
    fetchTransactions,
    handleLogout,
    user,
    transactions,
  } = useApp();
  const [roleOpen, setRoleOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [greeting, setGreeting] = useState("Good Morning");

  const navigate = useNavigate();

  const fullName = user?.displayName || user?.email?.split("@")[0] || "User";
  const firstName = fullName.split(" ")[0];
  const userInitial = firstName.charAt(0).toUpperCase();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const navLinks = [
    { name: "Dashboard", icon: faTableColumns },
    { name: "Analytics", icon: faChartLine },
    { name: "Transactions", icon: faMoneyBillTransfer },
  ];

  const handleExport = () => {
    if (!transactions || transactions.length === 0) {
      alert("No data to export.");
      return;
    }

    const headers = ["Date", "Merchant", "Category", "Type", "Amount"];

    const rows = transactions.map((txn) => [
      txn.date,
      `"${txn.merchant || "Unknown"}"`,
      `"${txn.category}"`,
      txn.type,
      txn.amount,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const today = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `fiscalflow_transactions_${today}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplate = () => {
    const headers = "Date,Merchant,Category,Type,Amount\n";
    const sampleRow = "2026-04-25,Sample Merchant,Food,expense,50.00\n";
    const csvContent = headers + sampleRow;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "FiscalFlow_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!user) {
      alert("You must be logged in to upload data.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = await user.getIdToken();

      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Data successfully uploaded and saved to database!");
        fetchTransactions();
      } else {
        alert("Failed to upload data.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error connecting to server. Is the backend running?");
    }

    // clear the input to upload the same file again if needed
    e.target.value = null;
  };

  return (
    <div className="flex h-screen w-full bg-sidebar text-text-primary transition-colors duration-300 overflow-hidden relative font-sans">
      <aside className="hidden lg:flex w-72 min-w-[288px] flex-col h-full p-8 border-r border-border/10">
        <div className="mb-12">
          <LogoSection />
        </div>
        <NavigationLinks
          links={navLinks}
          closeMenu={() => setMenuOpen(false)}
        />
        <FooterLinks />
      </aside>

      <div
        className={`fixed inset-0 z-1000 lg:hidden transition-all duration-300 ${menuOpen ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        ></div>
        <aside
          className={`relative w-72 h-full bg-sidebar p-8 flex flex-col shadow-2xl transition-transform duration-300 transform ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex justify-between items-center mb-10">
            <LogoSection />
            <button
              onClick={() => setMenuOpen(false)}
              className="text-text-secondary hover:text-text-primary transition-colors text-base p-2"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <NavigationLinks
            links={navLinks}
            closeMenu={() => setMenuOpen(false)}
          />
          <FooterLinks />
        </aside>
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-20 flex items-center justify-between px-4 sm:px-6 lg:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <FontAwesomeIcon icon={faBars} className="text-lg" />
            </button>
            <h2 className="hidden sm:block text-xl lg:text-2xl font-bold tracking-tight text-text-primary capitalize">
              {greeting}, {firstName}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 lg:gap-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden md:flex items-center pr-6 border-r border-border/50">
                {user ? (
                  <>
                    <div className="hidden md:flex items-center gap-3 pr-3">
                      <button
                        onClick={handleExport}
                        className="flex items-center gap-2 h-9 px-4 bg-bg border border-border rounded-lg text-sm font-bold hover:bg-border/20 transition-all text-text-primary shadow-sm"
                        title="Download Current Data"
                      >
                        <span>Export</span>
                        <FontAwesomeIcon
                          icon={faDownload}
                          className="text-xs"
                        />
                      </button>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                      <label className="flex items-center gap-2 h-9 px-4 bg-text-primary text-bg rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-sm cursor-pointer">
                        <span>Upload CSV</span>
                        <FontAwesomeIcon icon={faUpload} className="text-xs" />
                        <input
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <span className="text-[11px] uppercase tracking-widest font-black text-text-secondary px-2">
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 h-9 px-4 bg-bg border border-border rounded-lg text-sm font-bold hover:bg-border/20 transition-all text-text-primary shadow-sm"
                      title="Download Current Data"
                    >
                      <span>Export</span>
                      <FontAwesomeIcon icon={faDownload} className="text-xs" />
                    </button>
                  </span>
                )}
              </div>

              {/* <div className="hidden md:flex items-center gap-3 pr-6 border-r border-border/50">
                <label className="flex items-center gap-2 h-9 px-4 bg-text-primary text-bg rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-sm cursor-pointer">
                  <span>Upload CSV</span>
                  <FontAwesomeIcon icon={faUpload} className="text-xs" />
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div> */}

              <div className="relative">
                <button
                  onClick={() => setRoleOpen(!roleOpen)}
                  className="flex items-center gap-2 h-9 px-3 bg-bg border border-border rounded-lg text-[10px] font-black tracking-widest uppercase hover:bg-border/20 transition-all text-text-primary"
                >
                  {role}{" "}
                  <FontAwesomeIcon icon={faAngleDown} className="text-[10px]" />
                </button>
                {roleOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-card border border-border rounded-xl shadow-xl z-[1100] overflow-hidden">
                    <button
                      onClick={() => {
                        setRole("Viewer");
                        setRoleOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-sidebar transition-colors font-medium text-text-primary"
                    >
                      Viewer
                    </button>
                    <button
                      onClick={() => {
                        setRole("Admin");
                        setRoleOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-sidebar transition-colors font-medium text-text-primary"
                    >
                      Admin
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 md:gap-3">
                <FontAwesomeIcon
                  icon={faSun}
                  className={`text-xs transition-colors duration-300 ${!isDark ? "text-text-primary drop-shadow-sm" : "text-text-secondary/40"}`}
                />
                <label className="flex items-center cursor-pointer relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isDark}
                    onChange={toggleTheme}
                  />
                  <div className="w-8 h-4.5 bg-border/80 rounded-full peer transition-all duration-300 peer-checked:bg-text-primary"></div>
                  <div className="absolute top-[2px] left-[2px] w-3.5 h-3.5 bg-card rounded-full transition-transform duration-300 peer-checked:translate-x-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.3)]"></div>{" "}
                </label>

                <FontAwesomeIcon
                  icon={faMoon}
                  className={`text-xs transition-colors duration-300 ${isDark ? "text-text-primary drop-shadow-sm" : "text-text-secondary/40"}`}
                />
              </div>

              <div className="relative flex items-center sm:ml-2 sm:border-l border-border/50 sm:pl-4">
                {user ? (
                  <>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-border hover:border-text-primary/40 bg-sidebar flex items-center justify-center text-text-primary font-bold overflow-hidden text-sm sm:text-base shadow-sm transition-all focus:outline-none"
                      title="Profile Menu"
                    >
                      {userInitial}
                    </button>
                    {profileOpen && (
                      <div className="absolute top-full right-0 mt-3 w-56 bg-card border border-border rounded-xl shadow-xl z-[1100] overflow-hidden flex flex-col">
                        <div className="px-4 py-3 border-b border-border/50 bg-sidebar/30">
                          <p className="text-sm font-bold leading-none text-text-primary capitalize truncate">
                            {fullName}
                          </p>
                          <p className="text-[11px] text-text-secondary mt-1.5 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors font-bold flex items-center gap-3"
                        >
                          <FontAwesomeIcon icon={faRightFromBracket} /> Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="h-9 px-6 ml-2 bg-text-primary text-bg rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full bg-bg lg:rounded-tl-[48px] border-t lg:border-l border-border/40 shadow-2xl shadow-black/5 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}

const LogoSection = () => (
  <div className="flex items-center gap-3 px-2 text-text-primary">
    <div className="w-11 h-11 bg-text-primary rounded-xl flex items-center justify-center shadow-lg shadow-black/10 shrink-0">
      <div className="w-5 h-5 bg-bg rounded-sm rotate-45"></div>
    </div>
    <h1 className="text-2xl font-black tracking-tighter">FiscalFlow</h1>
  </div>
);

const NavigationLinks = ({ links, closeMenu }) => (
  <nav className="flex flex-col gap-2.5 flex-1">
    {links.map((link) => (
      <NavLink
        key={link.name}
        to={link.name === "Dashboard" ? "/" : `/${link.name.toLowerCase()}`}
        onClick={closeMenu}
        className={({ isActive }) =>
          `flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[15px] font-bold transition-all duration-200 ${
            isActive
              ? "bg-bg text-text-primary shadow-md shadow-black/0.03"
              : "text-text-secondary hover:bg-bg/60 hover:text-text-primary"
          }`
        }
      >
        <FontAwesomeIcon icon={link.icon} className="text-lg w-5" />
        {link.name}
      </NavLink>
    ))}
  </nav>
);

const FooterLinks = () => (
  <div className="pt-8 mt-auto border-t border-border/40 flex flex-col gap-1">
    <a
      href="mailto:rdsd21104@gmail.com?cc=manankasturia24@gmail.com"
      className="block w-full text-left px-5 py-3.5 rounded-2xl text-[15px] font-bold transition-all duration-200 text-text-secondary hover:bg-bg/60 hover:text-text-primary"
    >
      Help Center
    </a>
  </div>
);

export default Navbar;
