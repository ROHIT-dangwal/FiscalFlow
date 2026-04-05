import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

function Dashboard() {
  const { totalBalance, totalIncome, totalExpense, transactions, role, deleteTransaction, addTransaction } = useApp();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTxn, setNewTxn] = useState({
    merchant: '', amount: '', category: '', type: 'expense', date: new Date().toISOString().split('T')[0]
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newTxn.merchant || !newTxn.amount || !newTxn.category) return;
    
    addTransaction({
      ...newTxn,
      amount: parseFloat(newTxn.amount)
    });
    
    setIsModalOpen(false);
    setNewTxn({ merchant: '', amount: '', category: '', type: 'expense', date: new Date().toISOString().split('T')[0] });
  };

  const monthlyData = useMemo(() => {
    const monthlyStats = transactions.reduce((acc, curr) => {
      const dateObj = new Date(curr.date);
      const sortKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      const monthName = dateObj.toLocaleString('default', { month: 'short', year: '2-digit' }); 
      
      if (!acc[sortKey]) acc[sortKey] = { sortKey, name: monthName, Income: 0, Expense: 0 };
      if (curr.type === 'income') acc[sortKey].Income += curr.amount;
      else acc[sortKey].Expense += curr.amount;
      return acc;
    }, {});
    return Object.values(monthlyStats).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [transactions]);

  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const categoryStats = expenses.reduce((acc, curr) => {
      const rawCat = curr.category || "Uncategorized";
      const cleanCategory = rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase();
      
      acc[cleanCategory] = (acc[cleanCategory] || 0) + curr.amount;
      return acc;
    }, {});
    
    let sortedCategories = Object.entries(categoryStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    if (sortedCategories.length > 5) {
      const topFour = sortedCategories.slice(0, 4);
      const othersTotal = sortedCategories
        .slice(4)
        .reduce((sum, item) => sum + item.value, 0);
      
      topFour.push({ name: 'Others', value: othersTotal });
      return topFour;
    }

    return sortedCategories;
  }, [transactions]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col gap-6 font-sans fade-in relative">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard Overview</h1>
          <p className="text-text-secondary text-sm mt-1">Track your financial activity at a glance.</p>
        </div>
        {role === "Admin" && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-text-primary text-bg rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <FontAwesomeIcon icon={faPlus} /> Add Transaction
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-sidebar border border-border/40 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-text-secondary text-sm font-bold mb-3 uppercase tracking-wider">Total Balance</h3>
          <p className="text-4xl font-black text-text-primary tracking-tight">{formatCurrency(totalBalance)}</p>
        </div>
        <div className="bg-sidebar border border-border/40 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-text-secondary text-sm font-bold mb-3 uppercase tracking-wider">Total Income</h3>
          <p className="text-4xl font-black text-success tracking-tight">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-sidebar border border-border/40 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-text-secondary text-sm font-bold mb-3 uppercase tracking-wider">Total Expenses</h3>
          <p className="text-4xl font-black text-danger tracking-tight">{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        <div className="bg-sidebar border border-border/40 rounded-3xl p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-bold text-text-primary mb-6">Spend Activity</h3>
          <div className="flex-1 min-h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" opacity={0.15} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} dy={10} />
                <YAxis tickLine={false} axisLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--sidebar)', borderRadius: '12px', border: '1px solid var(--border)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-sidebar border border-border/40 rounded-3xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-text-primary mb-2">Spending Breakdown</h3>
          <div className="flex-1 w-full flex justify-center items-center min-h-75">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', backgroundColor: 'var(--sidebar)', border: '1px solid var(--border)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', color: 'var(--text-primary)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-text-secondary">
                <div className="w-24 h-24 rounded-full border-4 border-border/50 border-dashed mx-auto mb-4"></div>
                <p>No expenses recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-sidebar border border-border/40 rounded-3xl p-6 shadow-sm mt-2">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-text-primary">Recent Transactions</h3>
          <button 
            onClick={() => navigate('/transactions')} 
            className="text-sm font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>
        
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-left border-collapse min-w-125">
            <thead>
              <tr className="border-b border-border/40 text-text-secondary text-sm">
                <th className="pb-4 font-medium pl-2">Merchant</th>
                <th className="pb-4 font-medium">Date</th>
                <th className="pb-4 font-medium">Category</th>
                <th className="pb-4 font-medium text-right">Amount</th>
                {role === "Admin" && <th className="pb-4 font-medium text-right pr-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((txn) => (
                <tr key={txn.id} className="border-b border-border/20 hover:bg-bg/40 transition-colors group">
                  <td className="py-4 pl-2 font-bold text-text-primary">{txn.merchant || "Unknown"}</td>
                  <td className="py-4 text-text-secondary text-sm">{formatDate(txn.date)}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 bg-bg border border-border/50 rounded-full text-xs font-bold text-text-secondary">
                      {txn.category}
                    </span>
                  </td>
                  <td className={`py-4 text-right font-bold ${txn.type === 'income' ? 'text-success' : 'text-text-primary'}`}>
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </td>
                  {role === "Admin" && (
                    <td className="py-4 text-right pr-2">
                      <button 
                        onClick={() => deleteTransaction(txn.id)}
                        className="text-text-secondary hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete Transaction"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="text-center py-10 text-text-secondary">
              No transactions found. {role === "Admin" && "Click 'Add Transaction' to get started."}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && role === "Admin" && (
        <div className="fixed inset-0 z-2000 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-sidebar border border-border/50 rounded-3xl p-8 shadow-2xl animate-fade-in-up">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-primary">Add Transaction</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Merchant / Title</label>
                <input required type="text" value={newTxn.merchant} onChange={e => setNewTxn({...newTxn, merchant: e.target.value})} className="w-full h-12 px-4 bg-bg border border-border rounded-xl text-text-primary focus:border-text-primary outline-none" placeholder="e.g., Apple Store" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Amount</label>
                  <input required type="number" step="0.01" min="0" value={newTxn.amount} onChange={e => setNewTxn({...newTxn, amount: e.target.value})} className="w-full h-12 px-4 bg-bg border border-border rounded-xl text-text-primary focus:border-text-primary outline-none" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Type</label>
                  <select value={newTxn.type} onChange={e => setNewTxn({...newTxn, type: e.target.value})} className="w-full h-12 px-4 bg-bg border border-border rounded-xl text-text-primary focus:border-text-primary outline-none">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Category</label>
                  <input required type="text" value={newTxn.category} onChange={e => setNewTxn({...newTxn, category: e.target.value})} className="w-full h-12 px-4 bg-bg border border-border rounded-xl text-text-primary focus:border-text-primary outline-none" placeholder="e.g., Food" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Date</label>
                  <input required type="date" value={newTxn.date} onChange={e => setNewTxn({...newTxn, date: e.target.value})} className="w-full h-12 px-4 bg-bg border border-border rounded-xl text-text-primary focus:border-text-primary outline-none style-color-scheme" />
                </div>
              </div>

              <button type="submit" className="w-full h-12 mt-4 bg-text-primary text-bg rounded-xl font-bold hover:opacity-90 transition-opacity">
                Save Transaction
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;