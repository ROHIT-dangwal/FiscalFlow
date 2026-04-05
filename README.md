# FiscalFlow 💹 

FiscalFlow is a high-performance, responsive Personal Finance Dashboard built with **React**, **Tailwind CSS**, and **Framer Motion**. It provides users with real-time insights into their spending habits through interactive visualizations, simulated asynchronous data fetching, and a role-based administrative environment.

---

## 🚀 Live Demo
[View Live Project]()

## ✨ Key Features

### 📊 Dynamic Dashboard
* **Real-time Analytics:** Summary cards for Total Balance, Income, and Expenses that update instantly upon data modification.
* **Visual Spend Activity:** A custom-styled Area Chart showing monthly cash flow trends using `Recharts`.
* **Intelligent Categorization:** A specialized Donut Chart that automatically groups smaller expenses into an "Others" category to maintain UI clarity and prevent layout breaking.

### 🔍 Advanced Transaction Management
* **Search & Filter:** Instant "as-you-type" search by merchant or category names.
* **Type Filtering:** Toggle between "Income Only," "Expenses Only," or "All Transactions."
* **Multi-Criteria Sorting:** Sort history by Date (Newest/Oldest) or Amount (Highest/Lowest).
* **Export Functionality:** Integrated CSV generator that allows users to download their transaction history for external use.

### 🔐 Simulated Role-Based UI
* **Viewer Mode:** A read-only experience where charts and tables are visible, but modification actions are restricted.
* **Admin Mode:** Grants full permissions to add new transactions via a global modal and delete specific entries.

### 🌓 Theme & Persistence
* **Dark/Light Mode:** A sleek theme engine that responds to user preference.
* **LocalStorage Integration:** Theme choice, user role, and all transaction data are persisted locally, ensuring the app remembers your data even after a page refresh.

---

## 🛠️ Technical Approach

### 1. State Management & Architecture
The application is architected around a **Centralized State Pattern** using the **React Context API** (`AppContext.jsx`). This strategic choice provides:
* **Single Source of Truth**: Global financial data, user roles, and theme settings are managed in one location, ensuring that the Dashboard, Analytics, and Transactions pages remain perfectly synchronized.
* **Prop-Drilling Elimination**: Components at any depth can access or modify global data without passing props through intermediate layers.
* **Persistence Layer**: Integrates with `localStorage` to preserve transaction history, user roles, and theme preferences across browser sessions and page refreshes.

### 2. Component Design & Philosophy
The codebase prioritizes **maintainability and scalability** through specific design principles:
* **Declarative UI**: Interface elements like the sidebar and transaction forms are controlled by state switches (`menuOpen`, `isModalOpen`) rather than direct DOM manipulation, aligning with modern React standards.
* **Data Processing Hooks**: Utilizes `useMemo` for heavy data operations—such as monthly trend calculations and category grouping—to optimize rendering performance and prevent unnecessary re-computations.
* **Logic Isolation**: Page-specific logic is kept within its respective view, while shared utility functions (like currency and date formatters) ensure UI consistency.

### 3. Responsive Layout & UX
Designed for a seamless experience across all device categories:
* **Utility-First Styling**: Built with **Tailwind CSS**, utilizing CSS variables to enable an instant, system-wide **Dark/Light Mode** toggle.
* **Adaptive Navigation**: Features a responsive sidebar that transitions from a permanent desktop view to a touch-optimized mobile drawer with a blurred backdrop.
* **Data Accessibility**: Implements horizontally scrollable containers for data-heavy tables, ensuring financial records remain readable on smaller smartphone screens.
* **Fluid Motion**: Powered by **Framer Motion** to deliver smooth "app-like" transitions between routes and interactive elements.

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/rohit-dangwal/fiscalflow.git](https://github.com/rohit-dangwal/fiscalflow.git)
   ```
2. **Navigate to the project directory:**
```bash
   cd fiscalflow/FiscalFlow
   ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Run in development mode:**
    ```bash
    npm run dev
    ```

5.  **Build for production:**
    ```bash
    npm run build
    ```

---

## 📁 Project Structure

```text
src/
├── components/       # Reusable UI (Navbar, PageTransitions)
├── context/          # Centralized State (AppContext)
├── pages/            # View components (Dashboard, Analytics, Transactions)
├── assets/           # Static files and branding
├── App.jsx           # Routing logic and provider wrapping
└── index.css         # Tailwind directives 
```
### 🧪 Tech Stack
* **Frontend:** React 18 + Vite
* **Styling:** Tailwind CSS
* **Icons:** FontAwesome (SVG)
* **Charts:** Recharts (D3-based)
* **Animations:** Framer Motion

---

### 👤 Author
**Rohit Dangwal**
* [GitHub](https://github.com/rohit-dangwal)
* [LinkedIn](www.linkedin.com/in/rohit-dangwal)

---

### 📝 License
This project is licensed under the MIT License.
