
import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Transaction, TransactionType } from '../types';

const Transactions: React.FC = () => {
  const { transactions, categories, addTransaction, editTransaction, removeTransaction } = useFinance();
  
  // Filters and Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: ''
  });

  const handleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredTransactions = transactions
    .filter(t => (filterCategory ? t.categoryId === filterCategory : true))
    .filter(t => (filterType !== 'ALL' ? t.type === filterType : true))
    .filter(t => t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const valA = sortBy === 'date' ? new Date(a.date).getTime() : a.amount;
      const valB = sortBy === 'date' ? new Date(b.date).getTime() : b.amount;
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

  const handleOpenModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        description: transaction.description,
        amount: transaction.amount.toString(),
        date: transaction.date,
        categoryId: transaction.categoryId,
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        categoryId: categories[0]?.id || '',
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      await removeTransaction(transactionToDelete);
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.description.trim()) {
      alert('Por favor, preencha a descrição');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }
    if (!formData.categoryId) {
      alert('Por favor, selecione uma categoria');
      return;
    }
    
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    if (editingTransaction) {
      await editTransaction(editingTransaction.id, payload);
    } else {
      await addTransaction(payload);
    }
    setIsModalOpen(false);
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        new Date(t.date).toLocaleDateString('pt-BR'),
        `"${t.description.replace(/"/g, '""')}"`,
        `"${t.category?.name || ''}"`,
        t.type === 'INCOME' ? 'Receita' : 'Despesa',
        t.amount.toFixed(2).replace('.', ',')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `financy-transacoes-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const getSortIcon = (field: 'date' | 'amount') => {
    if (sortBy !== field) return <i className="fa-solid fa-sort ml-1 text-slate-300 dark:text-slate-600"></i>;
    return sortOrder === 'asc' 
      ? <i className="fa-solid fa-sort-up ml-1 text-blue-600 dark:text-blue-400"></i>
      : <i className="fa-solid fa-sort-down ml-1 text-blue-600 dark:text-blue-400"></i>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Transações</h2>
          <p className="text-slate-500 dark:text-slate-400">Gerencie seu histórico financeiro</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} icon="fa-file-export" className="dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
            Exportar CSV
          </Button>
          <Button onClick={() => handleOpenModal()} icon="fa-plus">
            Nova Transação
          </Button>
        </div>
      </div>

      <Card>
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 mb-6">
          <div className="lg:col-span-4">
            <Input 
              label="Buscar descrição" 
              placeholder="Pesquisar..."
              icon="fa-magnifying-glass"
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="lg:col-span-2">
            <Input 
              isSelect 
              label="Categoria" 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Todas</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Input>
          </div>
          
          <div className="lg:col-span-2">
            <Input 
              isSelect 
              label="Tipo" 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="ALL">Todos</option>
              <option value="INCOME">Receitas</option>
              <option value="EXPENSE">Despesas</option>
            </Input>
          </div>

          <div className="lg:col-span-2">
            <Input 
              isSelect 
              label="Ordenar por" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="date">Data</option>
              <option value="amount">Valor</option>
            </Input>
          </div>

          <div className="lg:col-span-2">
            <Input 
              isSelect 
              label="Ordem" 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value as any)}
            >
              <option value="desc">{sortBy === 'date' ? 'Mais recentes' : 'Maior valor'}</option>
              <option value="asc">{sortBy === 'date' ? 'Mais antigos' : 'Menor valor'}</option>
            </Input>
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-sm uppercase">
                <th 
                  className="pb-4 font-medium px-2 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors group"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Data {getSortIcon('date')}
                  </div>
                </th>
                <th className="pb-4 font-medium px-2">Descrição</th>
                <th className="pb-4 font-medium px-2">Categoria</th>
                <th 
                  className="pb-4 font-medium px-2 text-right cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors group"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end">
                    Valor {getSortIcon('amount')}
                  </div>
                </th>
                <th className="pb-4 font-medium px-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-2 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {new Date(t.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-4 px-2">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{t.description}</div>
                  </td>
                  <td className="py-4 px-2">
                    <span 
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ 
                        backgroundColor: `${t.category?.color}20`, 
                        color: t.category?.color || '#64748b' 
                      }}
                    >
                      {t.category?.name || 'Sem categoria'}
                    </span>
                  </td>
                  <td className={`py-4 px-2 text-right font-semibold whitespace-nowrap ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleOpenModal(t)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button 
                        onClick={() => handleOpenDeleteModal(t.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-600">
                    <i className="fa-solid fa-folder-open text-4xl mb-2"></i>
                    <p>Nenhuma transação encontrada</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border dark:border-slate-800 p-6 text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Excluir Transação?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Deseja mesmo excluir esta transação? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => setIsDeleteModalOpen(false)}>
                Não, manter
              </Button>
              <Button variant="danger" className="flex-1" onClick={confirmDelete}>
                Sim, excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input 
                label="Descrição" 
                placeholder="Ex: Almoço, Salário..."
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Valor" 
                  type="number" 
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
                <Input 
                  label="Data" 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <Input 
                    isSelect 
                    label="Categoria"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Input>
              </div>
              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1" type="submit">
                  {editingTransaction ? 'Salvar Alterações' : 'Criar Transação'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
