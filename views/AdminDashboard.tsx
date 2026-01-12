
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, Subject, Group, LessonPlan, SubjectTeacherLink, SystemLog, Grade } from '../types';
import { MOCK_SUBJECTS, MOCK_GROUPS, MOCK_USERS, MOCK_LESSONS, MOCK_LINKS, MOCK_LOGS, MOCK_GRADES } from '../data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'structure' | 'academic' | 'logs'>('users');
  
  // States from LocalStorage (mimicking a DB)
  const [users, setUsers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [lessons, setLessons] = useState<LessonPlan[]>([]);
  const [links, setLinks] = useState<SubjectTeacherLink[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState<'user' | 'subject' | 'group' | 'link' | null>(null);

  useEffect(() => {
    const getOrInit = (key: string, mock: any) => {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(key, JSON.stringify(mock));
      return mock;
    };

    setUsers(getOrInit('school_users_db', MOCK_USERS));
    setSubjects(getOrInit('school_subjects_db', MOCK_SUBJECTS));
    setGroups(getOrInit('school_groups_db', MOCK_GROUPS));
    setLessons(getOrInit('school_lessons_db', MOCK_LESSONS));
    setLinks(getOrInit('school_links_db', MOCK_LINKS));
    setLogs(getOrInit('school_logs_db', MOCK_LOGS));
    setGrades(getOrInit('school_grades_db', MOCK_GRADES));
  }, []);

  const persist = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addLog = (action: string, details: string) => {
    const newLog: SystemLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      action,
      details
    };
    const updated = [newLog, ...logs];
    setLogs(updated);
    persist('school_logs_db', updated);
  };

  const handleUserUpdate = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    persist('school_users_db', updatedUsers);
  };

  const handleApprove = (userId: string, role: UserRole) => {
    const target = users.find(u => u.id === userId);
    const updated = users.map(u => u.id === userId ? { ...u, isApproved: true, role } : u);
    handleUserUpdate(updated);
    addLog('Назначение роли', `Пользователю ${target?.name} назначена роль ${role}`);
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    if (target.isAdmin) return alert("Нельзя удалить администратора");
    const updated = users.filter(u => u.id !== userId);
    handleUserUpdate(updated);
    addLog('Удаление пользователя', `Удален пользователь ${target.name}`);
  };

  const handleLinkParent = (parentId: string, studentId: string) => {
    const updated = users.map(u => {
      if (u.id === parentId) {
        const currentChildren = u.childrenIds || [];
        if (!currentChildren.includes(studentId)) {
          return { ...u, childrenIds: [...currentChildren, studentId] };
        }
      }
      return u;
    });
    handleUserUpdate(updated);
    const parent = users.find(u => u.id === parentId);
    const student = users.find(u => u.id === studentId);
    addLog('Привязка родителя', `Родитель ${parent?.name} привязан к ученику ${student?.name}`);
  };

  const handleGroupOperation = (updatedGroups: Group[]) => {
    setGroups(updatedGroups);
    persist('school_groups_db', updatedGroups);
  };

  const handleMoveStudent = (studentId: string, fromGroupId: string, toGroupId: string) => {
    const updated = groups.map(g => {
      if (g.id === fromGroupId) return { ...g, studentIds: g.studentIds.filter(id => id !== studentId) };
      if (g.id === toGroupId) return { ...g, studentIds: [...g.studentIds, studentId] };
      return g;
    });
    handleGroupOperation(updated);
    const student = users.find(u => u.id === studentId);
    addLog('Перевод ученика', `Ученик ${student?.name} переведен в группу ${groups.find(g => g.id === toGroupId)?.name}`);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.contactInfo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      pending: users.filter(u => !u.isApproved).length,
      avgScore: groups.reduce((acc, g) => acc + g.averageScore, 0) / (groups.length || 1)
    };
  }, [users, groups]);

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Nav (Desktop) */}
      <div className="flex flex-1">
        <aside className="w-72 bg-slate-900 text-white flex flex-col p-6 shadow-2xl z-30">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg">EN</div>
            <div>
              <h1 className="font-black text-lg leading-tight">AdminPanel</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">EduNexus Global</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              <span>👥</span> Пользователи
            </button>
            <button 
              onClick={() => setActiveTab('structure')}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'structure' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              <span>🏛️</span> Структура
            </button>
            <button 
              onClick={() => setActiveTab('academic')}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'academic' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              <span>📖</span> Учебный Процесс
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              <span>📋</span> Логи Системы
            </button>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800">
             <div className="flex items-center gap-4 mb-6">
                <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-slate-700" alt="" />
                <div className="min-w-0">
                   <p className="text-xs font-black truncate">{user.name}</p>
                   <p className="text-[9px] text-indigo-400 font-bold uppercase">Root Admin</p>
                </div>
             </div>
             <button onClick={onLogout} className="w-full py-4 rounded-xl bg-slate-800 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Выход</button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative p-4 lg:p-10">
          
          {/* Dashboard Header Context */}
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-8">
              <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                  {activeTab === 'users' && 'Менеджмент Пользователей'}
                  {activeTab === 'structure' && 'Управление Структурой'}
                  {activeTab === 'academic' && 'Контроль Обучения'}
                  {activeTab === 'logs' && 'Журнал Действий'}
                </h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">EduNexus Smart School System v2.4</p>
              </div>

              <div className="flex gap-4">
                <div className="bg-white p-4 px-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                   <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Всего душ</p>
                      <p className="text-xl font-black text-slate-800">{stats.totalUsers}</p>
                   </div>
                   <div className="w-[1px] h-8 bg-slate-100" />
                   <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">В ожидании</p>
                      <p className="text-xl font-black text-orange-500">{stats.pending}</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            {activeTab === 'users' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center gap-4">
                  <div className="relative flex-1 max-w-md group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">🔍</span>
                    <input 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Поиск по базе пользователей..."
                      className="w-full bg-white border-2 border-slate-100 focus:border-indigo-500 rounded-3xl py-4 pl-14 pr-6 text-sm font-bold outline-none shadow-sm transition-all"
                    />
                  </div>
                  <button onClick={() => setShowModal('user')} className="bg-slate-900 text-white px-8 py-4 rounded-3xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 active:scale-95 transition-all">+ Новый Пользователь</button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   {filteredUsers.map(u => (
                     <div key={u.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all flex flex-col md:flex-row items-center justify-between gap-6 group">
                        <div className="flex items-center gap-5 flex-1 min-w-0">
                           <img src={u.avatar} className="w-16 h-16 rounded-[24px] shadow-lg group-hover:scale-110 transition-transform" />
                           <div className="min-w-0">
                              <h4 className="text-lg font-black text-slate-800 truncate">{u.name}</h4>
                              <p className="text-sm font-bold text-slate-400">{u.contactInfo}</p>
                              <div className="flex gap-2 mt-2">
                                 {u.isApproved ? (
                                   <span className="text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded-lg">Одобрен</span>
                                 ) : (
                                   <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">Ожидает подтверждения</span>
                                 )}
                                 <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{u.role || 'Нет роли'}</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           {!u.isAdmin && !u.isApproved && (
                             <>
                               <button onClick={() => handleApprove(u.id, UserRole.TEACHER)} className="bg-indigo-50 text-indigo-600 px-4 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all">Учитель</button>
                               <button onClick={() => handleApprove(u.id, UserRole.STUDENT)} className="bg-blue-50 text-blue-600 px-4 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all">Ученик</button>
                               <button onClick={() => handleApprove(u.id, UserRole.PARENT)} className="bg-orange-50 text-orange-600 px-4 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-orange-600 hover:text-white transition-all">Родитель</button>
                             </>
                           )}
                           
                           {u.role === UserRole.PARENT && (
                             <select 
                               onChange={(e) => handleLinkParent(u.id, e.target.value)}
                               className="bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-[10px] font-black uppercase outline-none"
                               defaultValue=""
                             >
                               <option value="" disabled>Привязать к ученику</option>
                               {users.filter(usr => usr.role === UserRole.STUDENT).map(s => (
                                 <option key={s.id} value={s.id}>{s.name}</option>
                               ))}
                             </select>
                           )}

                           <button onClick={() => handleDeleteUser(u.id)} className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {activeTab === 'structure' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-500">
                <section className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black text-slate-800">Предметы</h3>
                    <button onClick={() => setShowModal('subject')} className="text-indigo-600 font-black text-xs uppercase">+ Добавить</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {subjects.map(s => (
                      <div key={s.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-xl transition-all">
                        <div className={`w-14 h-14 ${s.color} rounded-[20px] flex items-center justify-center text-2xl shadow-lg`}>{s.icon}</div>
                        <div>
                           <h4 className="font-black text-slate-800">{s.name}</h4>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">Кураторы: {links.filter(l => l.subjectId === s.id).length}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black text-slate-800">Группы и Классы</h3>
                    <button onClick={() => setShowModal('group')} className="text-indigo-600 font-black text-xs uppercase">+ Создать</button>
                  </div>
                  <div className="space-y-4">
                    {groups.map(g => (
                      <div key={g.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-5xl opacity-5 group-hover:scale-110 transition-transform">🎓</div>
                        <h4 className="text-xl font-black text-slate-800 mb-2">{g.name}</h4>
                        <div className="flex gap-4 mb-6">
                           <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full uppercase">{g.grade}</span>
                           <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full uppercase">{g.studentIds.length} учеников</span>
                        </div>
                        <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                           <button className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Перевести ученика →</button>
                           <button className="text-slate-300 hover:text-red-500 text-lg">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
                    <h3 className="text-2xl font-black text-slate-800 mb-10">Прогресс по предметам</h3>
                    <div className="h-64">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={subjects.map(s => ({ 
                           name: s.name, 
                           score: grades.filter(g => lessons.find(l => l.id === g.lessonId)?.subjectId === s.id).reduce((acc, g) => acc + g.score, 0) / (grades.filter(g => lessons.find(l => l.id === g.lessonId)?.subjectId === s.id).length || 1)
                         }))}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="name" hide />
                           <YAxis domain={[0, 100]} />
                           <Tooltip cursor={{fill: '#f8fafc'}} />
                           <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={40}>
                             {subjects.map((s, idx) => (
                               <Cell key={idx} fill={s.color.includes('indigo') ? '#6366f1' : '#3b82f6'} />
                             ))}
                           </Bar>
                         </BarChart>
                       </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl text-white">
                     <h3 className="text-2xl font-black mb-8">Активность Учителей</h3>
                     <div className="space-y-6">
                        {users.filter(u => u.role === UserRole.TEACHER).map(teacher => (
                          <div key={teacher.id} className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <img src={teacher.avatar} className="w-12 h-12 rounded-2xl border-2 border-slate-700" />
                                <div>
                                   <p className="text-sm font-black">{teacher.name}</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase">{lessons.filter(l => l.teacherId === teacher.id).length} уроков проведено</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <span className="text-[10px] font-black text-green-400 uppercase">Активен</span>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
                   <h3 className="text-2xl font-black text-slate-800 mb-8">Все Последние Уроки</h3>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                          <tr>
                            <th className="px-6 py-4">Дата</th>
                            <th className="px-6 py-4">Урок</th>
                            <th className="px-6 py-4">Предмет</th>
                            <th className="px-6 py-4">Учитель</th>
                            <th className="px-6 py-4">Группа</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {lessons.slice(0, 5).map(l => (
                            <tr key={l.id} className="text-sm hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-400">{l.date}</td>
                              <td className="px-6 py-4 font-black text-slate-800">{l.title}</td>
                              <td className="px-6 py-4">
                                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">{subjects.find(s => s.id === l.subjectId)?.name}</span>
                              </td>
                              <td className="px-6 py-4 font-bold">{users.find(u => u.id === l.teacherId)?.name}</td>
                              <td className="px-6 py-4 font-bold">{groups.find(g => g.id === l.groupId)?.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm animate-in fade-in duration-500">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black text-slate-800">Журнал Изменений</h3>
                    <button onClick={() => { setLogs([]); persist('school_logs_db', []); }} className="text-red-500 font-black text-[10px] uppercase tracking-widest">Очистить историю</button>
                 </div>
                 <div className="space-y-4">
                    {logs.map(log => (
                      <div key={log.id} className="flex gap-6 p-6 rounded-3xl border border-slate-50 hover:bg-slate-50/50 transition-all">
                        <div className="text-slate-300 font-bold text-xs uppercase tracking-tighter w-24 shrink-0">
                           {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                        <div>
                           <p className="text-sm font-black text-slate-800 mb-1">{log.action}</p>
                           <p className="text-xs text-slate-500 font-medium mb-2">{log.details}</p>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Инициатор: {log.userName}</p>
                        </div>
                      </div>
                    ))}
                    {logs.length === 0 && <p className="text-center py-20 text-slate-300 font-black uppercase text-xs tracking-widest">Логов пока нет</p>}
                 </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Basic Modals Simulation */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
           <div className="bg-white rounded-[48px] w-full max-w-xl p-12 shadow-2xl animate-in zoom-in duration-300 relative">
              <button onClick={() => setShowModal(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-800 text-2xl font-black">✕</button>
              <h2 className="text-3xl font-black text-slate-800 mb-8">
                 {showModal === 'user' && 'Добавить Пользователя'}
                 {showModal === 'subject' && 'Новый Предмет'}
                 {showModal === 'group' && 'Создать Группу'}
              </h2>
              
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Название / Имя</label>
                    <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-sm font-bold outline-none transition-all" />
                 </div>
                 {showModal === 'user' && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Роль</label>
                      <select className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-sm font-bold outline-none appearance-none">
                         <option>TEACHER</option>
                         <option>STUDENT</option>
                         <option>PARENT</option>
                         <option>ADMIN</option>
                      </select>
                    </div>
                 )}
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowModal(null)} className="flex-1 py-5 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all">Отмена</button>
                    <button onClick={() => { setShowModal(null); addLog('Ручное создание', 'Администратор создал новую сущность вручную'); }} className="flex-2 bg-indigo-600 text-white px-10 py-5 rounded-3xl font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">Сохранить</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
