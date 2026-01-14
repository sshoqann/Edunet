
import React, { useState, useEffect } from 'react';
import { User, UserRole, Group, Subject } from '../types';
import { MOCK_USERS, MOCK_GROUPS, MOCK_SUBJECTS } from '../data';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'structure'>('structure');
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | null>(null);
  
  // Data State with LocalStorage Persistence
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('school_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });
  
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('school_subjects');
    return saved ? JSON.parse(saved) : MOCK_SUBJECTS;
  });
  
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('school_groups');
    return saved ? JSON.parse(saved) : MOCK_GROUPS.map(g => ({ ...g, subjectId: 'sub1' }));
  });

  // Navigation State for Structure Tab
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Modals State
  const [showUserModal, setShowUserModal] = useState<{ mode: 'add' | 'edit', role?: UserRole, user?: User } | null>(null);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);

  // Persistence side effects
  useEffect(() => localStorage.setItem('school_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('school_subjects', JSON.stringify(subjects)), [subjects]);
  useEffect(() => localStorage.setItem('school_groups', JSON.stringify(groups)), [groups]);

  // User Handlers
  const handleSaveUser = (formData: any) => {
    if (showUserModal?.mode === 'add') {
      const newUser: User = {
        id: `u_${Date.now()}`,
        name: formData.name,
        contactInfo: formData.login,
        password: formData.password,
        role: formData.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
        isApproved: true,
        isAdmin: formData.role === UserRole.ADMIN,
        grade: formData.grade
      };
      setUsers([...users, newUser]);
    } else if (showUserModal?.mode === 'edit' && showUserModal.user) {
      setUsers(users.map(u => u.id === showUserModal.user!.id ? {
        ...u,
        name: formData.name,
        contactInfo: formData.login,
        password: formData.password,
        grade: formData.grade
      } : u));
    }
    setShowUserModal(null);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Удалить этого пользователя навсегда?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  // Structure Handlers
  const handleAddSubject = (name: string, icon: string) => {
    const newSub: Subject = { id: `sub_${Date.now()}`, name, icon, color: 'bg-indigo-500' };
    setSubjects([...subjects, newSub]);
    setShowAddSubject(false);
  };

  const handleAddGroupToSubject = (name: string, grade: string) => {
    if (!selectedSubject) return;
    const newGrp: Group = { id: `grp_${Date.now()}`, name, grade, subjectId: selectedSubject.id, studentIds: [] };
    setGroups([...groups, newGrp]);
    setShowAddGroup(false);
  };

  const handleAssignTeacher = (groupId: string, teacherId: string) => {
    setGroups(prevGroups => {
      const updated = prevGroups.map(g => {
        if (g.id === groupId) {
          const updatedGroup = { ...g, teacherId };
          if (selectedGroup?.id === groupId) setSelectedGroup(updatedGroup);
          return updatedGroup;
        }
        return g;
      });
      return updated;
    });
  };

  const handleToggleStudentInGroup = (groupId: string, studentId: string) => {
    setGroups(prevGroups => {
      const updated = prevGroups.map(g => {
        if (g.id === groupId) {
          const isSelected = g.studentIds.includes(studentId);
          const updatedGroup = { 
            ...g, 
            studentIds: isSelected 
              ? g.studentIds.filter(id => id !== studentId) 
              : [...g.studentIds, studentId] 
          };
          // Critical fix: update selectedGroup reference to trigger re-render of detail view
          if (selectedGroup?.id === groupId) setSelectedGroup(updatedGroup);
          return updatedGroup;
        }
        return g;
      });
      return updated;
    });
  };

  const teachers = users.filter(u => u.role === UserRole.TEACHER);
  const students = users.filter(u => u.role === UserRole.STUDENT);

  return (
    <div className="flex-1 flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shrink-0 z-30 shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center text-xl font-black">EN</div>
          <div>
            <h2 className="font-black text-lg tracking-tight">AdminPanel</h2>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">School Root</span>
          </div>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2">
          <button
            onClick={() => setActiveTab('structure')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'structure' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <span>🏛️</span> Структура школы
          </button>
          <button
            onClick={() => { setActiveTab('users'); setSelectedUserRole(null); }}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <span>👥</span> Пользователи
          </button>
        </nav>

        <div className="p-8 border-t border-slate-800">
           <button onClick={onLogout} className="w-full py-4 rounded-xl bg-slate-800 text-red-400 text-xs font-black uppercase hover:bg-red-500 hover:text-white transition-all">Выйти</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 bg-slate-50">
        
        {/* USERS TAB - REWORKED TO WINDOWS (CARDS) */}
        {activeTab === 'users' && (
          <div className="animate-in fade-in duration-500">
            {!selectedUserRole ? (
              <>
                <header className="mb-10">
                  <h1 className="text-4xl font-black text-slate-800 tracking-tight">Управление пользователями</h1>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 ml-1">Разделение по категориям доступа</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { role: UserRole.STUDENT, label: 'Ученики', icon: '🎓', color: 'bg-blue-500', count: users.filter(u => u.role === UserRole.STUDENT).length },
                    { role: UserRole.TEACHER, label: 'Учителя', icon: '👨‍🏫', color: 'bg-indigo-500', count: users.filter(u => u.role === UserRole.TEACHER).length },
                    { role: UserRole.PARENT, label: 'Родители', icon: '👨‍👩‍👧', color: 'bg-emerald-500', count: users.filter(u => u.role === UserRole.PARENT).length },
                    { role: UserRole.ADMIN, label: 'Админы', icon: '🔑', color: 'bg-rose-500', count: users.filter(u => u.role === UserRole.ADMIN).length }
                  ].map(cat => (
                    <div 
                      key={cat.role}
                      onClick={() => setSelectedUserRole(cat.role)}
                      className="group bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className={`absolute -right-4 -top-4 w-40 h-40 ${cat.color} rounded-full opacity-5 group-hover:scale-110 transition-transform`}></div>
                      <div className="flex items-center justify-between relative z-10">
                        <div className={`w-20 h-20 ${cat.color} rounded-[24px] flex items-center justify-center text-4xl shadow-lg text-white mb-6`}>
                          {cat.icon}
                        </div>
                        <div className="text-right">
                          <p className="text-5xl font-black text-slate-800 tracking-tighter">{cat.count}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Аккаунтов</p>
                        </div>
                      </div>
                      <h3 className="text-3xl font-black text-slate-800 mb-3 relative z-10">{cat.label}</h3>
                      <p className="text-sm text-slate-400 font-medium relative z-10">Нажмите, чтобы открыть окно управления, изменить пароли или добавить новых людей в эту категорию.</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="animate-in slide-in-from-right-8 duration-500">
                <header className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10">
                  <div className="flex items-center gap-6">
                    <button onClick={() => setSelectedUserRole(null)} className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl shadow-sm hover:bg-slate-100 transition-all text-2xl">←</button>
                    <div>
                      <h1 className="text-3xl font-black text-slate-800">
                        {selectedUserRole === UserRole.STUDENT && 'Окно: Ученики'}
                        {selectedUserRole === UserRole.TEACHER && 'Окно: Учителя'}
                        {selectedUserRole === UserRole.PARENT && 'Окно: Родители'}
                        {selectedUserRole === UserRole.ADMIN && 'Окно: Администраторы'}
                      </h1>
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1 ml-1">Индивидуальный редактор данных</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowUserModal({ mode: 'add', role: selectedUserRole })}
                    className="bg-indigo-600 text-white px-10 py-5 rounded-[24px] text-sm font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    + Создать {selectedUserRole === UserRole.STUDENT ? 'ученика' : selectedUserRole === UserRole.TEACHER ? 'учителя' : 'пользователя'}
                  </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {users.filter(u => u.role === selectedUserRole).map(u => (
                     <div key={u.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden">
                        <div className="flex items-center gap-5 mb-6">
                           <img src={u.avatar} className="w-16 h-16 rounded-[20px] bg-slate-50 border-2 border-white shadow-sm" />
                           <div className="min-w-0">
                              <h4 className="font-black text-lg text-slate-800 truncate">{u.name}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.grade || (u.role === UserRole.TEACHER ? 'Преподаватель' : 'Доступ разрешен')}</p>
                           </div>
                        </div>

                        <div className="space-y-3 bg-slate-50 p-5 rounded-3xl mb-6">
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-slate-300 uppercase">Логин</span>
                              <span className="text-sm font-bold text-slate-700">{u.contactInfo}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-slate-300 uppercase">Пароль</span>
                              <span className="text-sm font-mono font-bold text-indigo-600">{u.password}</span>
                           </div>
                        </div>

                        <div className="flex gap-3">
                           <button 
                             onClick={() => setShowUserModal({ mode: 'edit', user: u, role: u.role as UserRole })}
                             className="flex-1 bg-white border-2 border-slate-100 text-slate-600 py-3 rounded-2xl text-xs font-black uppercase hover:border-indigo-500 hover:text-indigo-600 transition-all"
                           >
                             Редактировать
                           </button>
                           <button 
                             onClick={() => handleDeleteUser(u.id)}
                             className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                           >
                             🗑️
                           </button>
                        </div>
                     </div>
                   ))}
                   {users.filter(u => u.role === selectedUserRole).length === 0 && (
                     <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-100 rounded-[48px]">
                        <p className="text-slate-300 font-black uppercase text-xs tracking-widest">В этой категории пока нет пользователей</p>
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STRUCTURE TAB - HIERARCHICAL MANAGEMENT */}
        {activeTab === 'structure' && (
          <div className="animate-in fade-in duration-500">
            {/* Level 1: All Subjects */}
            {!selectedSubject && (
              <>
                <header className="flex justify-between items-center mb-10">
                  <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Структура школы</h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 ml-1">Создание предметов и управление группами</p>
                  </div>
                  <button onClick={() => setShowAddSubject(true)} className="bg-indigo-600 text-white px-10 py-5 rounded-[24px] text-sm font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all">+ Создать предмет</button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {subjects.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => setSelectedSubject(s)}
                      className="group bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-50 rounded-full opacity-20 group-hover:scale-125 transition-transform"></div>
                      <div className="text-6xl mb-8 transform group-hover:rotate-12 transition-transform">{s.icon}</div>
                      <h3 className="text-3xl font-black text-slate-800 mb-3">{s.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full w-fit">
                        {groups.filter(g => g.subjectId === s.id).length} групп в системе
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Level 2: Groups in Subject */}
            {selectedSubject && !selectedGroup && (
              <div className="space-y-10">
                <header className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div className="flex items-center gap-6">
                    <button onClick={() => setSelectedSubject(null)} className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl shadow-sm hover:bg-slate-100 transition-all text-2xl">←</button>
                    <div>
                      <h1 className="text-3xl font-black text-slate-800">{selectedSubject.icon} {selectedSubject.name}</h1>
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1 ml-1">Управление группами внутри предмета</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAddGroup(true)} className="bg-indigo-600 text-white px-10 py-5 rounded-[24px] text-sm font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all">+ Новая группа</button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {groups.filter(g => g.subjectId === selectedSubject.id).map(g => {
                    const teacher = teachers.find(t => t.id === g.teacherId);
                    return (
                      <div 
                        key={g.id} 
                        onClick={() => setSelectedGroup(g)}
                        className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between h-full"
                      >
                        <div className="mb-10">
                           <div className="flex justify-between items-start mb-6">
                              <div>
                                 <h3 className="text-3xl font-black text-slate-800 mb-2">{g.name}</h3>
                                 <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full uppercase tracking-widest">{g.grade}</span>
                              </div>
                              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all text-xl">→</div>
                           </div>

                           <div className="space-y-5">
                              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl">
                                 <span className="text-[10px] font-black text-slate-300 uppercase w-20 shrink-0">Учитель:</span>
                                 {teacher ? (
                                   <div className="flex items-center gap-3">
                                      <img src={teacher.avatar} className="w-8 h-8 rounded-xl shadow-sm" />
                                      <span className="text-sm font-black text-slate-800">{teacher.name}</span>
                                   </div>
                                 ) : (
                                   <span className="text-sm font-bold text-red-400 italic">Вакансия открыта</span>
                                 )}
                              </div>
                              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl">
                                 <span className="text-[10px] font-black text-slate-300 uppercase w-20 shrink-0">Ученики:</span>
                                 <span className="text-sm font-black text-slate-800">{g.studentIds.length} чел. в списке</span>
                              </div>
                           </div>
                        </div>
                        
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Нажмите для настройки состава →</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Level 3: Group Detail (Membership Management) */}
            {selectedSubject && selectedGroup && (
              <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                <header className="flex items-center gap-6">
                   <button onClick={() => setSelectedGroup(null)} className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl shadow-sm hover:bg-slate-100 transition-all text-2xl">←</button>
                   <div>
                     <h1 className="text-3xl font-black text-slate-800">Настройка: {selectedGroup.name}</h1>
                     <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1 ml-1">{selectedSubject.name} • {selectedGroup.grade}</p>
                   </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                   {/* Assign Teacher */}
                   <div className="lg:col-span-1">
                      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm sticky top-10">
                         <h3 className="text-2xl font-black text-slate-800 mb-8">Учитель группы</h3>
                         <div className="space-y-4">
                            {teachers.map(t => (
                              <button 
                                key={t.id}
                                onClick={() => handleAssignTeacher(selectedGroup.id, t.id)}
                                className={`w-full flex items-center gap-4 p-5 rounded-[32px] border-2 transition-all ${selectedGroup.teacherId === t.id ? 'border-indigo-600 bg-indigo-50 shadow-lg' : 'border-slate-50 hover:border-slate-200'}`}
                              >
                                 <img src={t.avatar} className="w-14 h-14 rounded-2xl shadow-sm" />
                                 <div className="text-left">
                                    <p className="text-base font-black text-slate-800 leading-tight">{t.name}</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">@{t.contactInfo}</p>
                                 </div>
                              </button>
                            ))}
                            {teachers.length === 0 && <p className="text-xs font-bold text-slate-400 text-center">Сначала создайте учителей в разделе "Пользователи"</p>}
                         </div>
                      </div>
                   </div>

                   {/* Assign Students */}
                   <div className="lg:col-span-2">
                      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
                         <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
                            <h3 className="text-2xl font-black text-slate-800">Состав учеников ({selectedGroup.studentIds.length})</h3>
                            <div className="text-[10px] text-indigo-500 font-black uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full">Выберите участников группы</div>
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {students.map(s => {
                              const isSelected = selectedGroup.studentIds.includes(s.id);
                              return (
                                <button 
                                  key={s.id}
                                  onClick={() => handleToggleStudentInGroup(selectedGroup.id, s.id)}
                                  className={`flex items-center gap-5 p-5 rounded-[32px] border-2 transition-all group/student ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200' : 'border-slate-50 hover:border-slate-100'}`}
                                >
                                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${isSelected ? 'bg-blue-600 text-white scale-110' : 'bg-slate-200 text-slate-400 group-hover/student:bg-slate-300'}`}>
                                      {isSelected ? '✓' : '+'}
                                   </div>
                                   <img src={s.avatar} className="w-12 h-12 rounded-2xl shadow-sm bg-white" />
                                   <div className="text-left">
                                      <p className="text-base font-black text-slate-800 leading-tight">{s.name}</p>
                                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{s.grade || 'Класс не указан'}</p>
                                   </div>
                                </button>
                              );
                            })}
                            {students.length === 0 && <p className="text-xs font-bold text-slate-400 text-center col-span-full py-10">Нет зарегистрированных учеников</p>}
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- MODALS (WINDOWS) --- */}

        {/* COMPREHENSIVE USER EDITOR (ADD/EDIT) */}
        {showUserModal && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-y-auto">
              <div className="bg-white rounded-[56px] w-full max-w-xl p-12 shadow-[0_32px_64px_rgba(0,0,0,0.2)] animate-in zoom-in duration-300 relative my-auto">
                 <button onClick={() => setShowUserModal(null)} className="absolute top-12 right-12 text-slate-300 hover:text-slate-800 text-3xl font-black transition-colors">✕</button>
                 
                 <div className="mb-10 text-center">
                   <div className="w-24 h-24 bg-indigo-50 rounded-[32px] flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner">
                      {showUserModal.role === UserRole.STUDENT ? '🎓' : showUserModal.role === UserRole.TEACHER ? '👨‍🏫' : '👤'}
                   </div>
                   <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                      {showUserModal.mode === 'add' ? 'Новый профиль' : 'Редактор данных'}
                   </h2>
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-3">
                      Категория: {showUserModal.role}
                   </p>
                 </div>

                 <form onSubmit={(e) => {
                    e.preventDefault();
                    const f = e.target as any;
                    handleSaveUser({
                      name: f.name.value,
                      login: f.login.value,
                      password: f.password.value,
                      role: showUserModal.role || f.role?.value,
                      grade: f.grade?.value
                    });
                 }}>
                    <div className="space-y-8">
                       <div className="group">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-4 group-focus-within:text-indigo-600 transition-colors">Полное имя (ФИО)</label>
                          <input name="name" required defaultValue={showUserModal.user?.name} placeholder="Введите ФИО" className="w-full bg-slate-50 border-4 border-transparent focus:border-indigo-100 focus:bg-white rounded-[28px] p-6 text-lg font-black outline-none transition-all" />
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="group">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-4 group-focus-within:text-indigo-600 transition-colors">Логин для входа</label>
                             <input name="login" required defaultValue={showUserModal.user?.contactInfo} placeholder="Login" className="w-full bg-slate-50 border-4 border-transparent focus:border-indigo-100 focus:bg-white rounded-[28px] p-6 text-base font-black outline-none transition-all" />
                          </div>
                          <div className="group">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-4 group-focus-within:text-indigo-600 transition-colors">Пароль системы</label>
                             <input name="password" required defaultValue={showUserModal.user?.password || '12345'} placeholder="Password" className="w-full bg-slate-50 border-4 border-transparent focus:border-indigo-100 focus:bg-white rounded-[28px] p-6 text-base font-black outline-none transition-all text-indigo-600" />
                          </div>
                       </div>
                       
                       {showUserModal.role === UserRole.STUDENT && (
                          <div className="group">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-4 group-focus-within:text-indigo-600 transition-colors">Школьный класс</label>
                             <input name="grade" defaultValue={showUserModal.user?.grade} placeholder="Напр: 10-Б" className="w-full bg-slate-50 border-4 border-transparent focus:border-indigo-100 focus:bg-white rounded-[28px] p-6 text-base font-black outline-none transition-all" />
                          </div>
                       )}

                       <div className="pt-6">
                          <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black uppercase text-sm shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">
                             {showUserModal.mode === 'add' ? 'Создать аккаунт сейчас' : 'Применить изменения'}
                          </button>
                       </div>
                    </div>
                 </form>
              </div>
           </div>
        )}

        {/* SUBJECT CREATOR */}
        {showAddSubject && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
              <div className="bg-white rounded-[56px] w-full max-w-md p-12 shadow-2xl animate-in zoom-in duration-300">
                 <h2 className="text-3xl font-black text-slate-800 mb-10 text-center">Новый предмет</h2>
                 <form onSubmit={(e) => { e.preventDefault(); const f = e.target as any; handleAddSubject(f.name.value, f.icon.value); }}>
                    <div className="space-y-6">
                       <input name="name" required placeholder="Название предмета" className="w-full bg-slate-50 p-6 rounded-[28px] text-lg font-black outline-none" />
                       <div className="flex flex-col items-center gap-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase">Выберите Emoji-иконку</label>
                          <input name="icon" required placeholder="🧪" className="w-24 h-24 bg-slate-50 rounded-[32px] text-center text-5xl font-black outline-none focus:bg-indigo-50" />
                       </div>
                       <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black uppercase text-sm shadow-xl hover:bg-indigo-700 transition-all">Добавить в систему</button>
                       <button type="button" onClick={() => setShowAddSubject(false)} className="w-full text-slate-400 font-bold uppercase text-[10px] mt-2">Отмена</button>
                    </div>
                 </form>
              </div>
           </div>
        )}

        {/* GROUP CREATOR */}
        {showAddGroup && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
              <div className="bg-white rounded-[56px] w-full max-w-md p-12 shadow-2xl animate-in zoom-in duration-300">
                 <h2 className="text-3xl font-black text-slate-800 mb-4 text-center">Новая группа</h2>
                 <p className="text-center text-slate-400 font-bold uppercase text-[10px] mb-10">Предмет: {selectedSubject?.name}</p>
                 <form onSubmit={(e) => { e.preventDefault(); const f = e.target as any; handleAddGroupToSubject(f.name.value, f.grade.value); }}>
                    <div className="space-y-6">
                       <input name="name" required placeholder="Название (напр: 10-А Продвинутый)" className="w-full bg-slate-50 p-6 rounded-[28px] text-lg font-black outline-none" />
                       <input name="grade" required placeholder="Класс (напр: 10-А)" className="w-full bg-slate-50 p-6 rounded-[28px] text-lg font-black outline-none" />
                       <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black uppercase text-sm shadow-xl hover:bg-indigo-700 transition-all">Создать группу</button>
                       <button type="button" onClick={() => setShowAddGroup(false)} className="w-full text-slate-400 font-bold uppercase text-[10px] mt-2">Отмена</button>
                    </div>
                 </form>
              </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
