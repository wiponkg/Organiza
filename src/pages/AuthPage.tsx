import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Layout, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await axios.post('/api/auth/login', { email, password });
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      } else {
        await axios.post('/api/auth/register', { name, email, password });
        const res = await axios.post('/api/auth/login', { email, password });
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-zinc-950 p-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white mb-4 shadow-lg shadow-emerald-600/20">
            <Layout size={32} />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Organiza+</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            {mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta gratuita'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl shadow-black/5 border border-zinc-200 dark:border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl">
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all dark:text-white"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : 'Criar Conta'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              {mode === 'login' ? 'Não tem uma conta?' : 'Já possui uma conta?'}
              <Link 
                to={mode === 'login' ? '/register' : '/login'} 
                className="ml-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                {mode === 'login' ? 'Cadastre-se' : 'Faça Login'}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
