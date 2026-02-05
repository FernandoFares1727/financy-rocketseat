
import React, { useState, useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { SavingsGoal } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Goals: React.FC = () => {
  const { goals, addGoal, editGoal, removeGoal, summary, transactions } = useFinance();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    color: '#3b82f6'
  });
  const [error, setError] = useState<string | null>(null);

  // Cálculos de Cabeçalho
  const totalAccountBalance = summary.totalBalance;
  const totalAllocated = useMemo(() => 
    goals.reduce((sum, g) => sum + g.currentAmount, 0), 
  [goals]);
  const availableToAllocate = Math.max(0, totalAccountBalance - totalAllocated);

  const averageMonthlyBalance = useMemo(() => {
    const months = new Set();
    transactions.forEach(t => months.add(t.date.substring(0, 7)));
    const numMonths = Math.max(1, months.size);
    return summary.totalBalance / numMonths;
  }, [transactions, summary]);

  const handleOpenModal = (goal?: SavingsGoal) => {
    setError(null);
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        deadline: goal.deadline || '',
        color: goal.color
      });
    } else {
      setEditingGoal(null);
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '0',
        deadline: '',
        color: '#3b82f6'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const target = parseFloat(formData.targetAmount);
    const current = parseFloat(formData.currentAmount);
    
    // Validação de Teto
    const otherGoalsTotal = goals
      .filter(g => g.id !== editingGoal?.id)
      .reduce((sum, g) => sum + g.currentAmount, 0);
    
    if (otherGoalsTotal + current > totalAccountBalance) {
      setError(`Limite excedido! Você só possui ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAccountBalance - otherGoalsTotal)} disponíveis para alocar.`);
      return;
    }

    if (current > target) {
      setError("O valor guardado não pode ser maior que a meta final.");
      return;
    }

    const payload = {
      name: formData.name,
      targetAmount: target,
      currentAmount: current,
      deadline: formData.deadline || undefined,
      color: formData.color
    };

    if (editingGoal) {
      await editGoal(editingGoal.id, payload);
    } else {
      await addGoal(payload);
    }
    setIsModalOpen(false);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Metas de Economia</h2>
          <p className="text-slate-500 dark:text-slate-400">Distribua seu saldo real entre seus objetivos</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon="fa-plus">
          Novo Objetivo
        </Button>
      </div>

      {/* Cabeçalho de Resumo de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Total Alocado em Metas</p>
              <h3 className="text-3xl font-bold">{formatCurrency(totalAllocated)}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-piggy-bank text-xl"></i>
            </div>
          </div>
        </Card>
        <Card className={`${availableToAllocate > 0 ? 'bg-emerald-500' : 'bg-slate-400'} border-none text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-50/80 text-xs font-bold uppercase tracking-wider mb-1">Disponível para Alocação</p>
              <h3 className="text-3xl font-bold">{formatCurrency(availableToAllocate)}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-hand-holding-dollar text-xl"></i>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const percentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          
          const data = [
            { name: 'Já Guardado', value: goal.currentAmount, color: goal.color },
            { name: 'Falta', value: remaining, color: isDark ? '#1e293b' : '#f1f5f9' }
          ];

          const monthsRemaining = averageMonthlyBalance > 0 && remaining > 0
            ? Math.ceil(remaining / averageMonthlyBalance) 
            : null;

          return (
            <Card key={goal.id} className="relative group overflow-hidden">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal(goal)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
                <button 
                  onClick={() => removeGoal(goal.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-48 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(v: any) => formatCurrency(v)}
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none', 
                          backgroundColor: isDark ? '#0f172a' : '#fff',
                          color: isDark ? '#f1f5f9' : '#0f172a'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{percentage.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="text-center mt-2 space-y-1 w-full">
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{goal.name}</h4>
                  <div className="flex justify-center gap-6 text-xs font-medium text-slate-500">
                    <div className="text-center">
                      <p className="uppercase tracking-wider text-[10px] mb-0.5">Meta</p>
                      <p className="text-slate-700 dark:text-slate-300 font-bold">{formatCurrency(goal.targetAmount)}</p>
                    </div>
                    <div className="text-center">
                      <p className="uppercase tracking-wider text-[10px] mb-0.5">Alocado</p>
                      <p className="text-blue-600 dark:text-blue-400 font-bold">{formatCurrency(goal.currentAmount)}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                    <i className="fa-solid fa-wand-magic-sparkles text-blue-500"></i>
                    <div>
                      <p className="font-semibold text-xs uppercase tracking-wider text-slate-400">Insight do Financy</p>
                      <p className="text-xs leading-relaxed">
                        {percentage >= 100 
                          ? "Meta atingida! Valor totalmente alocado."
                          : monthsRemaining 
                            ? `Faltam ${formatCurrency(remaining)}. Com sua média atual, você conclui em ${monthsRemaining} meses.`
                            : "Aumente suas economias para acelerar este objetivo."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {editingGoal ? 'Editar Objetivo' : 'Novo Objetivo'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input 
                label="Nome do Objetivo" 
                placeholder="Ex: Reserva, Carro, Viagem..."
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Valor da Meta Final" 
                  type="number"
                  required
                  placeholder="0.00"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                />
                <Input 
                  label="Valor Já Alocado" 
                  type="number"
                  required
                  placeholder="0.00"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({...formData, currentAmount: e.target.value})}
                />
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[11px] text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <i className="fa-solid fa-circle-info mt-0.5"></i>
                <div>
                  <p className="font-bold mb-0.5">Saldo Disponível: {formatCurrency(availableToAllocate + (editingGoal?.currentAmount || 0))}</p>
                  <p>Você retira do seu saldo geral e 'carimba' para este objetivo específico.</p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-start gap-2 border border-red-100 dark:border-red-900/30">
                  <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
                  <p>{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Prazo Alvo (Opcional)" 
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cor</label>
                  <input 
                    type="color" 
                    className="w-full h-10 p-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1" type="submit">
                  {editingGoal ? 'Salvar Alterações' : 'Criar Objetivo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
