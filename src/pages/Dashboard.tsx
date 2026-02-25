import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  CheckCircle2, Clock, AlertCircle, TrendingUp, 
  Calendar, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { motion } from 'motion/react';

interface Stats {
  total: number;
  completed: number;
  pending: number;
  priorityStats: { priority: string; count: number }[];
  weeklyStats: { week: string; count: number }[];
}

const PRIORITY_COLORS: Record<string, string> = {
  'alta': '#ef4444',
  'média': '#f59e0b',
  'baixa': '#10b981'
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!stats) return null;

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Painel de Produtividade</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Acompanhe seu desempenho e metas.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <Calendar size={18} className="text-zinc-400" />
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Tarefas" 
          value={stats.total} 
          icon={<Clock className="text-blue-500" />} 
          color="blue"
        />
        <StatCard 
          title="Concluídas" 
          value={stats.completed} 
          icon={<CheckCircle2 className="text-emerald-500" />} 
          color="emerald"
          trend={completionRate > 50 ? 'up' : 'down'}
          trendValue={`${completionRate}%`}
        />
        <StatCard 
          title="Pendentes" 
          value={stats.pending} 
          icon={<AlertCircle className="text-amber-500" />} 
          color="amber"
        />
        <StatCard 
          title="Taxa de Conclusão" 
          value={`${completionRate}%`} 
          icon={<TrendingUp className="text-purple-500" />} 
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Tarefas Concluídas (Semanas)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyStats.reverse()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: '#fff'
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Distribuição por Prioridade</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.priorityStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="priority"
                >
                  {stats.priorityStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend, trendValue }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-${color}-50 dark:bg-${color}-900/20`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-amber-500'}`}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
      </div>
    </motion.div>
  );
}
