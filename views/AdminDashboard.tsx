
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('school_users_db');
    if (stored) {
      setUsers(JSON.parse(stored));
    }
  }, []);

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('school_users_db', JSON.stringify(updatedUsers));
  };

  const handleApprove = (userId: string, role: UserRole) => {
    const updated = users.map(u => 
      u.id === userId ? { ...u, isApproved: true, role } : u
    );
    saveUsers(updated);
  };

  const handleBlock = (userId: string) => {
    const updated = users.map(u => 
      u.id === userId ? { ...u, isApproved: false } : u
    );
    saveUsers(updated);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.contactInfo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-10 py-6 flex items-center justify-between shadow-sm relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black">AD</div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Панель управления</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Контроль доступа EduNexus</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="hidden md:flex flex-col text-right">
              <p className="text-sm font-black text-slate-700">{user.name}</p>
              <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Супер-администратор</p>
           </div>
           <button onClick={onLogout} className="bg-slate-100 text-slate-400 hover:text-red-500 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all">Выйти</button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div>
              <h2 className="text-3xl font-black text-slate-800">Пользователи системы</h2>
              <p className="text-slate-400 text-sm mt-1">Одобряйте новые заявки и управляйте ролями</p>
            </div>
            <div className="relative group">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">🔍</span>
               <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск по имени, почте или телефону..." 
                className="bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none shadow-sm min-w-[350px] transition-all"
               />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Header row */}
            <div className="hidden lg:grid grid-cols-6 px-8 py-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
               <div className="col-span-2">Пользователь</div>
               <div>Контакт</div>
               <div>Текущая роль</div>
               <div>Статус</div>
               <div className="text-right">Действия</div>
            </div>

            {filteredUsers.map(u => (
              <div key={u.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all grid grid-cols-1 lg:grid-cols-6 items-center gap-4">
                <div className="col-span-2 flex items-center gap-4">
                  <img src={u.avatar} className="w-12 h-12 rounded-2xl shadow-sm border-2 border-slate-50" />
                  <div>
                    <p className="text-sm font-black text-slate-800">{u.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{u.id}</p>
                  </div>
                </div>

                <div className="text-sm font-bold text-slate-600 truncate">{u.contactInfo}</div>

                <div>
                   {u.isAdmin ? (
                     <span className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200">Admin</span>
                   ) : u.role ? (
                     <span className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">{u.role}</span>
                   ) : (
                     <span className="text-slate-300 italic text-xs font-medium">Не назначена</span>
                   )}
                </div>

                <div>
                   {u.isApproved ? (
                     <span className="text-green-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Одобрен
                     </span>
                   ) : (
                     <span className="text-orange-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                       <span className="w-2 h-2 bg-orange-400 rounded-full"></span> Ожидание
                     </span>
                   )}
                </div>

                <div className="flex justify-end gap-2">
                   {!u.isAdmin && (
                     <>
                       {u.isApproved ? (
                         <button onClick={() => handleBlock(u.id)} className="px-4 py-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase transition-all">Заблокировать</button>
                       ) : (
                         <div className="flex gap-1">
                           <button onClick={() => handleApprove(u.id, UserRole.TEACHER)} className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-all">Учитель</button>
                           <button onClick={() => handleApprove(u.id, UserRole.STUDENT)} className="bg-blue-500 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 transition-all">Ученик</button>
                           <button onClick={() => handleApprove(u.id, UserRole.PARENT)} className="bg-orange-500 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-orange-600 transition-all">Родитель</button>
                         </div>
                       )}
                     </>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
