
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import TeacherDashboard from './views/TeacherDashboard';
import StudentDashboard from './views/StudentDashboard';
import ParentDashboard from './views/ParentDashboard';
import AdminDashboard from './views/AdminDashboard';
import { User, UserRole } from './types';

const PendingApproval: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
  <div className="h-screen w-full flex items-center justify-center bg-slate-50 p-6">
    <div className="max-w-md w-full bg-white p-12 rounded-[48px] shadow-2xl text-center space-y-8 animate-in zoom-in duration-500">
       <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-[32px] flex items-center justify-center text-5xl mx-auto shadow-inner">⏳</div>
       <div>
         <h1 className="text-2xl font-black text-slate-800">Доступ ограничен</h1>
         <p className="text-slate-400 text-sm mt-3 font-medium leading-relaxed">Ваш аккаунт зарегистрирован, но администратор еще не подтвердил его. Пожалуйста, ожидайте назначения роли.</p>
       </div>
       <button onClick={onLogout} className="w-full py-5 rounded-[24px] bg-slate-100 text-slate-400 font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Выйти из системы</button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('edu_user');
    if (savedUser) {
      // Re-sync with local DB to pick up role changes from Admin
      const dbStr = localStorage.getItem('school_users_db');
      const db: User[] = dbStr ? JSON.parse(dbStr) : [];
      const updatedUser = db.find(u => u.id === JSON.parse(savedUser).id);
      
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('edu_user', JSON.stringify(updatedUser));
      } else {
        setUser(JSON.parse(savedUser));
      }
    }
  }, []);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    localStorage.setItem('edu_user', JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('edu_user');
  };

  const renderDashboard = () => {
    if (!user) return <Navigate to="/login" />;
    
    // Check if approved or admin
    if (!user.isApproved && !user.isAdmin) {
      return <PendingApproval onLogout={handleLogout} />;
    }

    switch (user.role) {
      case UserRole.ADMIN:
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      case UserRole.TEACHER:
        return <TeacherDashboard user={user} onLogout={handleLogout} />;
      case UserRole.STUDENT:
        return <StudentDashboard user={user} onLogout={handleLogout} />;
      case UserRole.PARENT:
        return <ParentDashboard user={user} onLogout={handleLogout} />;
      default:
        return <PendingApproval onLogout={handleLogout} />;
    }
  };

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
            element={renderDashboard()} 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
