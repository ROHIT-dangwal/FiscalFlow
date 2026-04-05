import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFilter, faPlus, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";

function Transactions() {
  const { transactions, role, deleteTransaction, addTransaction } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTxn, setNewTxn] = useState({
    merchant: '', amount: '', category: '', type: 'expense', date: new Date().toISOString().split('T')[0]
  });


  const processedTransactions = useMemo(() => {
    let result = [...transactions];


    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(t => 
        (t.merchant && t.merchant.toLowerCase().includes(lowerSearch)) || 
        t.category.toLowerCase().includes(lowerSearch)
      );
    }


    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }


    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'highest') return b.amount - a.amount;
      if (sortBy === 'lowest') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, sortBy]);


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

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col gap-6 font-sans fade-in">
      

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Transactions</h1>
          <p className="text-text-secondary text-sm mt-1">View and manage your financial history.</p>
        </div>
        {role === "Admin" && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-text-primary text-bg rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg"
          >
            <FontAwesomeIcon icon={faPlus} /> Add New
          </button>
        )}
      </div>


      <div className="bg-sidebar border border-border/40 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center z-10">
        

        <div className="relative w-full xl:w-96">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input 
            type="text" 
            placeholder="Search merchants or categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-bg border border-border/50 rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-text-primary transition-colors"
          />
        </div>


        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-2 text-text-secondary text-sm font-bold bg-bg px-4 py-2 rounded-xl border border-border/50">
            <FontAwesomeIcon icon={faFilter} className="mr-1" />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-transparent focus:outline-none cursor-pointer">
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-text-secondary text-sm font-bold bg-bg px-4 py-2 rounded-xl border border-border/50">
            <span>Sort:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent focus:outline-none cursor-pointer text-text-primary">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Amount: High to Low</option>
              <option value="lowest">Amount: Low to High</option>
            </select>
          </div>
        </div>
      </div>


      <div className="bg-sidebar border border-border/40 rounded-3xl p-6 shadow-sm flex-1 min-h-125">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-150">
            <thead>
              <tr className="border-b border-border/40 text-text-secondary text-sm">
                <th className="pb-4 font-bold pl-2">Merchant</th>
                <th className="pb-4 font-bold">Date</th>
                <th className="pb-4 font-bold">Category</th>
                <th className="pb-4 font-bold text-right">Amount</th>
                {role === "Admin" && <th className="pb-4 font-bold text-right pr-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {processedTransactions.map((txn) => (
                <tr key={txn.id} className="border-b border-border/20 hover:bg-bg/40 transition-colors group">
                  <td className="py-4 pl-2 font-bold text-text-primary">{txn.merchant || "Unknown"}</td>
                  <td className="py-4 text-text-secondary text-sm font-medium">{formatDate(txn.date)}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 bg-bg border border-border/50 rounded-lg text-xs font-bold text-text-secondary">
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
                        className="p-2 text-text-secondary hover:text-danger opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-danger/10"
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {processedTransactions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
              <div className="w-16 h-16 rounded-full border-2 border-border border-dashed flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faSearch} className="text-xl opacity-50" />
              </div>
              <p className="font-bold">No transactions found.</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && role === "Admin" && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
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

export default Transactions;