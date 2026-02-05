
import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/ui/Card';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const Dashboard: React.FC = () => {
  const { summary, transactions, categories } = useFinance();
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Pie chart data: Expenses by Category (Total Historical)
  const expenseByCategory = categories
    .filter(cat => cat.type === 'EXPENSE')
    .map(cat => {
      const amount = transactions
        .filter(t => t.categoryId === cat.id && t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: cat.name, value: amount, color: cat.color };
    })
    .filter(item => item.value > 0);

  // Budget Data: Spent vs Budget (Current Month)
  const budgetStatus = categories
    .filter(cat => cat.type === 'EXPENSE' && cat.budget && cat.budget > 0)
    .map(cat => {
      const spentThisMonth = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.categoryId === cat.id && 
                 tDate.getMonth() === currentMonth && 
                 tDate.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      const percentage = (spentThisMonth / (cat.budget || 1)) * 100;
      
      return {
        ...cat,
        spent: spentThisMonth,
        percentage: Math.min(percentage, 100),
        rawPercentage: percentage
      };
    })
    .sort((a, b) => b.rawPercentage - a.rawPercentage);

  // Dynamic Monthly Evolution Data (Last 12 Months) + Cumulative Curves
  const monthlyData = React.useMemo(() => {
    const data = [];
    
    let runningIncome = 0;
    let runningExpense = 0;
    
    // Generate data for the last 12 months
    const tempMonths = [];
    for (let i = 11; i >= 0; i--) {
      tempMonths.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
    }

    tempMonths.forEach(dateRef => {
      const monthLabel = String(dateRef.getMonth() + 1).padStart(2, '0');
      const yearLabel = dateRef.getFullYear();
      const label = `${monthLabel}/${yearLabel}`;
      
      const monthIncome = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'INCOME' && 
                 tDate.getMonth() === dateRef.getMonth() && 
                 tDate.getFullYear() === dateRef.getFullYear();
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpense = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'EXPENSE' && 
                 tDate.getMonth() === dateRef.getMonth() && 
                 tDate.getFullYear() === dateRef.getFullYear();
        })
        .reduce((sum, t) => sum + t.amount, 0);

      runningIncome += monthIncome;
      runningExpense += monthExpense;

      data.push({
        name: label,
        receita: monthIncome,
        despesa: monthExpense,
        cumReceita: runningIncome,
        cumDespesa: runningExpense
      });
    });

    return data;
  }, [transactions]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const currentMonthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date());

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-rose-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400">Bem-vindo ao seu controle financeiro</p>
        </div>
        <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2">
          <i className="fa-regular fa-calendar text-blue-500"></i>
          <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{currentMonthName}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase">Saldo Total</p>
              <h4 className={`text-2xl font-bold mt-1 ${summary.totalBalance >= 0 ? 'text-slate-800 dark:text-slate-100' : 'text-red-600'}`}>
                {formatCurrency(summary.totalBalance)}
              </h4>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
              <i className="fa-solid fa-wallet text-xl"></i>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase">Total Receitas</p>
              <h4 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-500">
                {formatCurrency(summary.totalIncome)}
              </h4>
            </div>
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-500">
              <i className="fa-solid fa-arrow-trend-up text-xl"></i>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase">Total Despesas</p>
              <h4 className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-500">
                {formatCurrency(summary.totalExpense)}
              </h4>
            </div>
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-500">
              <i className="fa-solid fa-arrow-trend-down text-xl"></i>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Charts Stack */}
      <div className="flex flex-col gap-6">
        <Card title="Evolução Mensal e Acumulada">
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart 
                data={monthlyData} 
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                barCategoryGap="15%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: textColor, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(v) => `R$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`}
                  tick={{ fontSize: 11, fill: textColor }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(v) => `R$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`}
                  tick={{ fontSize: 11, fill: textColor }}
                />
                <Tooltip 
                  cursor={{ fill: isDark ? '#1e293b' : '#f8fafc' }}
                  formatter={(v: any, name: string) => [formatCurrency(v), name]}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    backgroundColor: isDark ? '#0f172a' : '#fff',
                    color: isDark ? '#f1f5f9' : '#0f172a',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                />
                <Legend 
                  iconType="circle" 
                  verticalAlign="top" 
                  align="center"
                  wrapperStyle={{ paddingBottom: '30px', fontSize: '13px', color: textColor }} 
                />
                <Bar 
                  yAxisId="left"
                  dataKey="receita" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                  name="Receita Mensal" 
                  maxBarSize={40}
                  opacity={0.8}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="despesa" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]} 
                  name="Despesa Mensal" 
                  maxBarSize={40}
                  opacity={0.8}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumReceita"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#0f172a' : '#fff' }}
                  activeDot={{ r: 6 }}
                  name="Receita Acumulada"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumDespesa"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#0f172a' : '#fff' }}
                  activeDot={{ r: 6 }}
                  name="Despesa Acumulada"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Budget Progress Section */}
          <Card title="Orçamentos do Mês">
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {budgetStatus.length > 0 ? (
                budgetStatus.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatCurrency(item.spent)} de {formatCurrency(item.budget || 0)}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${getProgressBarColor(item.rawPercentage)}`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className={item.rawPercentage >= 100 ? 'text-rose-500' : 'text-slate-400'}>
                        {item.rawPercentage >= 100 ? 'Limite Excedido' : `${item.rawPercentage.toFixed(1)}% utilizado`}
                      </span>
                      <span className="text-slate-400">Restante: {formatCurrency(Math.max(0, (item.budget || 0) - item.spent))}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                  <i className="fa-solid fa-bullseye text-4xl mb-2"></i>
                  <p className="text-center">Nenhum orçamento configurado.<br/>Defina metas na página de Categorias.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Pie Chart Section */}
          <Card title="Histórico de Despesas por Categoria">
            <div className="h-80 w-full">
              {expenseByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {expenseByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(v: any) => formatCurrency(v)}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        backgroundColor: isDark ? '#0f172a' : '#fff',
                        color: isDark ? '#f1f5f9' : '#0f172a',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                      }}
                    />
                    <Legend 
                      layout="horizontal" 
                      align="center" 
                      verticalAlign="bottom" 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', color: textColor, paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <i className="fa-solid fa-chart-pie text-4xl mb-2"></i>
                  <p>Nenhuma despesa registrada</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
