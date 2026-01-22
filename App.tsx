import { supabase } from './lib/supabaseClient'
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import TeacherDashboard from './views/TeacherDashboard';
import StudentDashboard from './views/StudentDashboard';
import ParentDashboard from './views/ParentDashboard';
import AdminDashboard from './views/AdminDashboard';
import { User, UserRole } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Проверка сохраненной сессии при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('edu_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ ВХОДА
  const handleLogin = async (loginValue: string, passwordValue: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('login', loginValue)
        .eq('password', passwordValue)
        .single();

      if (error) {
        console.error("Ошибка Supabase:", error.message);
        alert('Неверный логин или пароль');
        return;
      }

      if (data) {
        setUser(data);
        localStorage.setItem('edu_user', JSON.stringify(data));
      }
    } catch (err) {
      console.error("Критическая ошибка:", err);
      alert('Ошибка при подключении к базе данных');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('edu_user');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Загрузка...</div>;

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
          />
          
          <Route 
            path="/" 
            element={
              user ? (
                user.role === UserRole.ADMIN ? <AdminDashboard user={user} onLogout={handleLogout} /> :
                user.role === UserRole.TEACHER ? <TeacherDashboard user={user} onLogout={handleLogout} /> :
                user.role === UserRole.STUDENT ? <StudentDashboard user={user} onLogout={handleLogout} /> :
                <ParentDashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
