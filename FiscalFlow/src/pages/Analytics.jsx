import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faArrowTrendUp, faArrowTrendDown, faCrown, faChartSimple } from "@fortawesome/free-solid-svg-icons";

function Analytics() {
  const { transactions } = useApp();

  const monthlyData = useMemo(() => {
    const stats = transactions.reduce((acc, curr) => {
      const dateObj = new Date(curr.date);
      const sortKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      
      const monthName = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' }); 
      
      if (!acc[sortKey]) {
        acc[sortKey] = { sortKey, name: monthName, Income: 0, Expense: 0 };
      }
      
      if (curr.type === 'income') acc[sortKey].Income += curr.amount;
      else acc[sortKey].Expense += curr.amount;
      
      return acc;
    }, {});

    return Object.values(stats).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [transactions]);

  const topCategory = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return { name: "N/A", amount: 0 };
    
    const catStats = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
    
    const sorted = Object.entries(catStats).sort((a, b) => b[1] - a[1]);
    return { name: sorted[0][0], amount: sorted[0][1] };
  }, [transactions]);

  const monthlyComparison = useMemo(() => {
    if (monthlyData.length < 2) return { trend: 'neutral', percentage: 0, text: "Not enough data" };
    
    const currentMonth = monthlyData[monthlyData.length - 1].Expense;
    const previousMonth = monthlyData[monthlyData.length - 2].Expense;
    
    if (previousMonth === 0) return { trend: 'up', percentage: 100, text: "Increased from $0" };
    
    const diff = currentMonth - previousMonth;
    const percentage = Math.abs((diff / previousMonth) * 100).toFixed(1);
    
    if (diff > 0) return { trend: 'up', percentage, text: `${percentage}% more than last month` };
    if (diff < 0) return { trend: 'down', percentage, text: `${percentage}% less than last month` };
    return { trend: 'neutral', percentage: 0, text: "Same as last month" };
  }, [monthlyData]);

  const smartObservation = useMemo(() => {
    if (transactions.length === 0) return "Add some transactions to see insights.";
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1);

    if (savingsRate > 20) return `Great job! You are saving ${savingsRate}% of your income overall. Your biggest drain is ${topCategory.name}.`;
    if (savingsRate > 0) return `You are keeping your head above water, saving ${savingsRate}% of your income. Consider reducing your ${topCategory.name} expenses to save more.`;
    return `Warning: You are spending more than you earn. Take a close look at your ${topCategory.name} budget!`;
  }, [transactions, topCategory]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="flex flex-col gap-8 font-sans fade-in">
      
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Analytics & Insights</h1>
        <p className="text-text-secondary text-sm mt-1">Deep dive into your spending patterns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="bg-sidebar border border-border/40 rounded-3xl p-6 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center text-text-primary text-lg shrink-0 border border-border/50">
            <FontAwesomeIcon icon={faCrown} className="text-warning" />
          </div>
          <div>
            <h3 className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-1">Top Spend Category</h3>
            <p className="text-2xl font-black text-text-primary">{topCategory.name}</p>
            <p className="text-sm font-medium text-text-secondary mt-1">{formatCurrency(topCategory.amount)} total</p>
          </div>
        </div>

        <div className="bg-sidebar border border-border/40 rounded-3xl p-6 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center text-lg shrink-0 border border-border/50">
            <FontAwesomeIcon 
              icon={monthlyComparison.trend === 'down' ? faArrowTrendDown : faArrowTrendUp} 
              className={monthlyComparison.trend === 'down' ? "text-success" : "text-danger"} 
            />
          </div>
          <div>
            <h3 className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-1">Expense Trend</h3>
            <p className="text-2xl font-black text-text-primary">
              {monthlyComparison.trend === 'down' ? '-' : '+'}{monthlyComparison.percentage}%
            </p>
            <p className="text-sm font-medium text-text-secondary mt-1">{monthlyComparison.text}</p>
          </div>
        </div>
        <div className="bg-sidebar border border-border/40 rounded-3xl p-6 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center text-text-primary text-lg shrink-0 border border-border/50">
            <FontAwesomeIcon icon={faChartSimple} />
          </div>
          <div>
            <h3 className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-1">Total Entries</h3>
            <p className="text-2xl font-black text-text-primary">{transactions.length}</p>
            <p className="text-sm font-medium text-text-secondary mt-1">Recorded transactions</p>
          </div>
        </div>
      </div>
      <div className="bg-bg border border-border/40 rounded-3xl p-6 shadow-inner relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-text-primary"></div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-text-primary/10 flex items-center justify-center text-text-primary shrink-0">
            <FontAwesomeIcon icon={faLightbulb} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary mb-1">Smart Observation</h3>
            <p className="text-text-secondary leading-relaxed font-medium">{smartObservation}</p>
          </div>
        </div>
      </div>

      <div className="bg-sidebar border border-border/40 rounded-3xl p-6 shadow-sm mt-2">
        <h3 className="text-lg font-bold text-text-primary mb-6">Cashflow Overview</h3>
        <div className="h-100 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" opacity={0.15} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} dy={10} />
              <YAxis tickLine={false} axisLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
              <Tooltip 
                cursor={{ fill: 'var(--text-secondary)', opacity: 0.1 }}
                contentStyle={{ backgroundColor: 'var(--sidebar)', borderRadius: '12px', border: '1px solid var(--border)' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', color: 'var(--text-primary)', paddingBottom: '20px' }} />
              <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

export default Analytics;