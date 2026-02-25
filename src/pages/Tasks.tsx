import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Filter, MoreVertical, CheckCircle2, 
  Circle, Trash2, Edit2, Calendar, Download, Loader2,
  AlertTriangle, Clock, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'baixa' | 'média' | 'alta';
  status: 'pendente' | 'concluída';
  due_date: string;
  created_at: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pendente' | 'concluída'>('todos');
  const [filterPriority, setFilterPriority] = useState<'todas' | 'baixa' | 'média' | 'alta'>('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'média',
    due_date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask.id}`, { ...formData, status: editingTask.status });
      } else {
        await axios.post('/api/tasks', formData);
      }
      fetchTasks();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === 'pendente' ? 'concluída' : 'pendente';
    try {
      await axios.put(`/api/tasks/${task.id}`, { ...task, status: newStatus });
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        due_date: task.due_date || format(new Date(), 'yyyy-MM-dd')
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'média',
        due_date: format(new Date(), 'yyyy-MM-dd')
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Título', 'Descrição', 'Prioridade', 'Status', 'Prazo', 'Criado em'];
    const rows = tasks.map(t => [
      t.id, t.title, t.description, t.priority, t.status, t.due_date, t.created_at
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tarefas_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || t.status === filterStatus;
    const matchesPriority = filterPriority === 'todas' || t.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Minhas Tarefas</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Gerencie suas atividades diárias.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-sm font-medium"
          >
            <Download size={18} />
            Exportar CSV
          </button>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all text-sm font-semibold"
          >
            <Plus size={18} />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            value={filterStatus}
            onChange={(e: any) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-sm outline-none dark:text-white"
          >
            <option value="todos">Todos Status</option>
            <option value="pendente">Pendentes</option>
            <option value="concluída">Concluídas</option>
          </select>
          <select 
            value={filterPriority}
            onChange={(e: any) => setFilterPriority(e.target.value)}
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl text-sm outline-none dark:text-white"
          >
            <option value="todas">Todas Prioridades</option>
            <option value="baixa">Baixa</option>
            <option value="média">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-400 mb-4">
            <Info size={32} />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Nenhuma tarefa encontrada</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Tente ajustar seus filtros ou crie uma nova tarefa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group bg-white dark:bg-zinc-900 p-5 rounded-2xl border ${task.status === 'concluída' ? 'border-zinc-100 dark:border-zinc-800 opacity-75' : 'border-zinc-200 dark:border-zinc-800'} shadow-sm hover:shadow-md transition-all flex items-start gap-4`}
              >
                <button 
                  onClick={() => toggleStatus(task)}
                  className={`mt-1 transition-colors ${task.status === 'concluída' ? 'text-emerald-500' : 'text-zinc-300 hover:text-emerald-500'}`}
                >
                  {task.status === 'concluída' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold text-lg truncate ${task.status === 'concluída' ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-white'}`}>
                      {task.title}
                    </h3>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <p className={`text-sm mb-3 line-clamp-2 ${task.status === 'concluída' ? 'text-zinc-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                    {task.description || 'Sem descrição'}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {task.due_date ? format(new Date(task.due_date), 'dd MMM yyyy', { locale: ptBR }) : 'Sem prazo'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      Criado em {format(new Date(task.created_at), 'dd/MM/yy')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openModal(task)}
                    className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
                </h2>
                <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                  <MoreVertical size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Título</label>
                  <input 
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    placeholder="O que precisa ser feito?"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Descrição</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white h-24 resize-none"
                    placeholder="Adicione mais detalhes..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Prioridade</label>
                    <select 
                      value={formData.priority}
                      onChange={(e: any) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    >
                      <option value="baixa">Baixa</option>
                      <option value="média">Média</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Prazo</label>
                    <input 
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    {editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles = {
    alta: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30',
    média: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30',
    baixa: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30',
  }[priority] || '';

  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles}`}>
      {priority}
    </span>
  );
}
