
import React, { useMemo, useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Sankey, ResponsiveContainer, Tooltip, Layer, Rectangle } from 'recharts';

// Componente customizado para renderizar os nós do Sankey com labels visíveis
const DemoSankeyNode = (props: any) => {
  const { x, y, width, height, index, payload, containerWidth } = props;
  const isOut = x + width < containerWidth / 2;
  const { theme } = props.payload.settings;
  const isDark = theme === 'dark';

  return (
    <Layer key={`sankey-node-${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={payload.color}
        fillOpacity={0.9}
        stroke={isDark ? '#1e293b' : '#fff'}
        strokeWidth={1}
      />
      <text
        x={isOut ? x + width + 6 : x - 6}
        y={y + height / 2}
        fontSize="12"
        fill={isDark ? '#cbd5e1' : '#334155'}
        textAnchor={isOut ? 'start' : 'end'}
        dominantBaseline="middle"
        className="font-medium"
      >
        {payload.name}
      </text>
    </Layer>
  );
};

const Flow: React.FC = () => {
  const { transactions, categories } = useFinance();
  const { theme } = useTheme();
  const [period, setPeriod] = useState<'current' | 'all'>('current');

  const isDark = theme === 'dark';
  const now = new Date();
  const currentMonthStr = String(now.getMonth() + 1).padStart(2, '0');
  const currentYearStr = String(now.getFullYear());
  const monthYearPrefix = `${currentYearStr}-${currentMonthStr}`;

  const sankeyData = useMemo(() => {
    // Corrigido: Filtragem de data usando string para evitar problemas de fuso horário (UTC vs Local)
    const filteredTransactions = period === 'current' 
      ? transactions.filter(t => t.date.startsWith(monthYearPrefix))
      : transactions;

    if (filteredTransactions.length === 0) return { nodes: [], links: [] };

    const nodes: any[] = [];
    const links: any[] = [];

    // 1. Hub Central
    nodes.push({ name: 'Carteira', color: '#3b82f6', settings: { theme } });
    const hubIndex = 0;

    // 2. Fontes de Receita -> Hub
    const incomeCategories = categories.filter(c => c.type === 'INCOME');
    incomeCategories.forEach(cat => {
      const amount = filteredTransactions
        .filter(t => t.categoryId === cat.id && t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);
      
      if (amount > 0) {
        nodes.push({ name: cat.name, color: cat.color, settings: { theme } });
        const sourceIndex = nodes.length - 1;
        links.push({
          source: sourceIndex,
          target: hubIndex,
          value: amount
        });
      }
    });

    // 3. Hub -> Categorias de Despesa
    const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
    expenseCategories.forEach(cat => {
      const amount = filteredTransactions
        .filter(t => t.categoryId === cat.id && t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);
      
      if (amount > 0) {
        nodes.push({ name: cat.name, color: cat.color, settings: { theme } });
        const targetIndex = nodes.length - 1;
        links.push({
          source: hubIndex,
          target: targetIndex,
          value: amount
        });
      }
    });

    // 4. Hub -> Economia (Saldo positivo no período)
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    if (balance > 0) {
      nodes.push({ name: 'Saldo Positivo', color: '#10b981', settings: { theme } });
      const balanceIndex = nodes.length - 1;
      links.push({
        source: hubIndex,
        target: balanceIndex,
        value: balance
      });
    }

    return { nodes, links };
  }, [transactions, categories, period, monthYearPrefix, theme]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Diagrama de Fluxo</h2>
          <p className="text-slate-500 dark:text-slate-400">Visualize a distribuição do seu capital</p>
        </div>
        <div className="w-full md:w-48">
          <Input 
            isSelect 
            label="Período" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value as any)}
          >
            <option value="current">Mês Atual</option>
            <option value="all">Todo Histórico</option>
          </Input>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card title="Fluxo de Caixa (Sankey Diagram)">
          <div className="h-[550px] w-full mt-4">
            {sankeyData.links.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <Sankey
                  data={sankeyData}
                  nodeWidth={15}
                  nodePadding={40}
                  margin={{ top: 20, left: 100, right: 100, bottom: 20 }}
                  node={<DemoSankeyNode />}
                  link={{ 
                    stroke: isDark ? '#334155' : '#e2e8f0',
                    strokeOpacity: 0.2,
                    fillOpacity: 0.2
                  }}
                >
                  <Tooltip 
                    formatter={(v: any) => formatCurrency(v)}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      backgroundColor: isDark ? '#0f172a' : '#fff',
                      color: isDark ? '#f1f5f9' : '#0f172a',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }}
                  />
                </Sankey>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <i className="fa-solid fa-diagram-project text-5xl mb-4 opacity-20"></i>
                <p className="text-center max-w-xs">
                  {period === 'current' 
                    ? "Nenhuma transação encontrada para este mês." 
                    : "Nenhuma transação registrada no sistema."}
                </p>
                <p className="text-xs mt-2">Dica: Adicione receitas e despesas para ver o fluxo.</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Entradas</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Origens do Capital</span>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
              <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block mb-1">Nó Central</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gestão na Carteira</span>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
              <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block mb-1">Saídas</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Destino dos Gastos</span>
            </div>
            <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/20">
              <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 block mb-1">Resíduo</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Acúmulo de Saldo</span>
            </div>
          </div>
        </Card>

        <Card title="Guia de Visualização">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-600 dark:text-slate-400">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-blue-500"></i> O que é um Diagrama de Sankey?
              </h4>
              <p>
                É um tipo de fluxograma em que a <strong>largura das setas</strong> é proporcional à quantidade de fluxo. No seu caso, a largura representa o valor em Reais (R$).
              </p>
              <p>
                Ele é ideal para identificar rapidamente quais são as suas maiores fontes de renda e para onde a maior parte do seu dinheiro está "escapando".
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <i className="fa-solid fa-lightbulb text-amber-500"></i> Como analisar?
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Lado Esquerdo:</strong> Suas receitas.</li>
                <li><strong>Centro (Carteira):</strong> O ponto de convergência de todo seu capital.</li>
                <li><strong>Lado Direito:</strong> Para onde o dinheiro foi (Categorias de despesa e o Saldo Positivo restante).</li>
                <li><strong>Equilíbrio:</strong> Se a linha de "Saldo Positivo" for grossa, você está economizando bem!</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Flow;
