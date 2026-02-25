import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import AppLayout from './components/AppLayout';
import { ReactNode } from 'react';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { token, isLoading } = useAuth();
  
  if (isLoading) return null;
  return token ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
