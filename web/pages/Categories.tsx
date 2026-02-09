
import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Category, TransactionType } from '../types';

const Categories: React.FC = () => {
  const { categories, addCategory, editCategory, removeCategory, refreshData, loading } = useFinance();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    type: 'EXPENSE' as TransactionType,
    budget: ''
  });

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({ 
        name: cat.name, 
        color: cat.color, 
        type: cat.type,
        budget: cat.budget?.toString() || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', color: '#3b82f6', type: 'EXPENSE', budget: '' });
    }
    setApiError(null);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (cat: Category) => {
    setCategoryToDelete(cat);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      await removeCategory(categoryToDelete.id);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : undefined
    };

    try {
      if (editingCategory) {
        await editCategory(editingCategory.id, payload);
      } else {
        await addCategory(payload);
      }
      setApiError(null);
      setIsModalOpen(false);
    } catch (err: any) {
      const status = err?.response?.status || err?.status;
      const message = err?.response?.data?.message || err?.message || 'Erro ao salvar categoria';
      if (status === 409 || /already in use|duplicate|unique/i.test(message)) {
        setApiError('Já existe uma categoria com esse nome');
      } else {
        setApiError(message);
      }
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Categorias</h2>
          <p className="text-slate-500 dark:text-slate-400">Organize suas movimentações financeiras e defina orçamentos</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleOpenModal()} icon="fa-plus">
            Nova Categoria
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Card key={cat.id} className="relative group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: cat.color }}
                >
                  <i className={`fa-solid ${cat.type === 'INCOME' ? 'fa-plus' : 'fa-minus'}`}></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">{cat.name}</h4>
                  <p className="text-xs font-medium uppercase text-slate-400 dark:text-slate-500">
                    {cat.type === 'INCOME' ? 'Receita' : 'Despesa'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal(cat)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
                <button 
                  onClick={() => handleOpenDeleteModal(cat)}
                  className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>

            <div className="mt-6">
              {cat.type === 'EXPENSE' && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Meta Mensal</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {cat.budget ? formatCurrency(cat.budget) : 'Sem meta definida'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full" 
                  style={{ backgroundColor: cat.color, width: '100%' }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-600 font-mono uppercase">{cat.color}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Confirmation Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border dark:border-slate-800 p-6 text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-tags text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Excluir Categoria?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Deseja mesmo excluir a categoria <span className="font-bold">"{categoryToDelete?.name}"</span>?
            </p>
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button onClick={() => { setIsModalOpen(false); setApiError(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {apiError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded p-3 text-sm">
                  {apiError}
                </div>
              )}
              <Input 
                label="Nome da Categoria" 
                placeholder="Ex: Mercado, Lazer, Saúde..."
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  isSelect 
                  label="Tipo"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="EXPENSE">Despesa</option>
                  <option value="INCOME">Receita</option>
                </Input>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cor</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      className="w-10 h-10 p-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                    />
                    <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{formData.color.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {formData.type === 'EXPENSE' && (
                <Input 
                  label="Meta de Gastos Mensal (Opcional)" 
                  type="number"
                  placeholder="Ex: 500.00"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  icon="fa-bullseye"
                />
              )}

              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800" type="button" onClick={() => { setIsModalOpen(false); setApiError(null); }}>
                  Cancelar
                </Button>
                <Button className="flex-1" type="submit">
                  {editingCategory ? 'Salvar' : 'Criar Categoria'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
