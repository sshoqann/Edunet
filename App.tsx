
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

  // Persistence simulation
  useEffect(() => {
    const savedUser = localStorage.getItem('edu_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
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
