
import React, { useState, useEffect, useMemo } from 'react';
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
    return saved ? JSON.parse(saved) : MOCK_GROUPS;
  });

  // Navigation State for Structure Tab
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [studentGradeFilter, setStudentGradeFilter] = useState<string>('');

  // Modals State
  const [showUserModal, setShowUserModal] = useState<{ mode: 'add' | 'edit', role?: UserRole, user?: User } | null>(null);
  const [modalAvatar, setModalAvatar] = useState<string>('');
  const [modalChildrenIds, setModalChildrenIds] = useState<string[]>([]);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);

  // Persistence side effects
  useEffect(() => localStorage.setItem('school_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('school_subjects', JSON.stringify(subjects)), [subjects]);
  useEffect(() => localStorage.setItem('school_groups', JSON.stringify(groups)), [groups]);

  // Handle Modal Initialization
  useEffect(() => {
    if (showUserModal) {
      setModalAvatar(showUserModal.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`);
      setModalChildrenIds(showUserModal.user?.childrenIds || []);
    }
  }, [showUserModal]);

  // When a group is selected, default the filter to that group's grade
  useEffect(() => {
    if (selectedGroup) {
      setStudentGradeFilter(selectedGroup.grade);
    }
  }, [selectedGroup]);

  // Derived data
  const students = useMemo(() => users.filter(u => u.role === UserRole.STUDENT), [users]);
  const teachers = useMemo(() => users.filter(u => u.role === UserRole.TEACHER), [users]);
  
  const allGrades = useMemo(() => {
    const grades = students.map(s => s.grade).filter(Boolean) as string[];
    return Array.from(new Set(grades)).sort();
  }, [students]);

  // User Handlers
  const handleSaveUser = (formData: any) => {
    if (showUserModal?.mode === 'add') {
      const newUser: User = {
        id: `u_${Date.now()}`,
        name: formData.name,
        contactInfo: formData.login,
        password: formData.password,
        role: formData.role,
        avatar: modalAvatar,
        isApproved: true,
        isAdmin: formData.role === UserRole.ADMIN,
        grade: formData.grade,
        childrenIds: formData.role === UserRole.PARENT ? modalChildrenIds : undefined
      };
      setUsers([...users, newUser]);
    } else if (showUserModal?.mode === 'edit' && showUserModal.user) {
      setUsers(users.map(u => u.id === showUserModal.user!.id ? {
        ...u,
        name: formData.name,
        contactInfo: formData.login,
        password: formData.password,
        grade: formData.grade,
        avatar: modalAvatar,
        childrenIds: u.role === UserRole.PARENT ? modalChildrenIds : u.childrenIds
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
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const f = e.target as any;
    const newSub: Subject = { 
      id: `sub_${Date.now()}`, 
      name: f.name.value, 
      icon: f.icon.value || '📚', 
      color: 'bg-indigo-500' 
    };
    setSubjects([...subjects, newSub]);
    setShowAddSubject(false);
  };

  const handleAddGroupToSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    const f = e.target as any;
    const newGrp: Group = { 
      id: `grp_${Date.now()}`, 
      name: f.name.value, 
      grade: f.grade.value, 
      subjectId: selectedSubject.id, 
      studentIds: [] 
    };
    setGroups([...groups, newGrp]);
    setShowAddGroup(false);
  };

  const handleAssignTeacher = (groupId: string, teacherId: string) => {
    const updated = groups.map(g => g.id === groupId ? { ...g, teacherId: g.teacherId === teacherId ? undefined : teacherId } : g);
    setGroups(updated);
    const current = updated.find(g => g.id === groupId);
    if (current) setSelectedGroup(current);
  };

  const handleToggleStudentInGroup = (groupId: string, studentId: string) => {
    const updated = groups.map(g => {
      if (g.id === groupId) {
        const isSelected = g.studentIds.includes(studentId);
        return { ...g, studentIds: isSelected ? g.studentIds.filter(id => id !== studentId) : [...g.studentIds, studentId] };
      }
      return g;
    });
    setGroups(updated);
    const current = updated.find(g => g.id === groupId);
    if (current) setSelectedGroup(current);
  };

  return (
    <div className="flex-1 flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shrink-0 z-30 shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center text-xl font-black">EN</div>
          <div><h2 className="font-black text-lg">AdminPanel</h2><span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Управление</span></div>
        </div>
        <nav className="flex-1 py-8 px-4 space-y-2">
          <button onClick={() => { setActiveTab('structure'); setSelectedSubject(null); setSelectedGroup(null); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'structure' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>🏛️ Структура школы</button>
          <button onClick={() => { setActiveTab('users'); setSelectedUserRole(null); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>👥 Пользователи</button>
        </nav>
        <div className="p-8 border-t border-slate-800"><button onClick={onLogout} className="w-full py-4 rounded-xl bg-slate-800 text-red-400 text-xs font-black uppercase hover:bg-red-500 transition-all">Выйти</button></div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 bg-slate-50">
        {activeTab === 'users' && (
          <div className="animate-in fade-in duration-500">
            {!selectedUserRole ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { role: UserRole.STUDENT, label: 'Ученики', icon: '🎓', color: 'bg-blue-500', count: students.length },
                  { role: UserRole.TEACHER, label: 'Учителя', icon: '👨‍🏫', color: 'bg-indigo-500', count: teachers.length },
                  { role: UserRole.PARENT, label: 'Родители', icon: '👨‍👩‍👧', color: 'bg-emerald-500', count: users.filter(u => u.role === UserRole.PARENT).length },
                  { role: UserRole.ADMIN, label: 'Админы', icon: '🔑', color: 'bg-rose-500', count: users.filter(u => u.role === UserRole.ADMIN).length }
                ].map(cat => (
                  <div key={cat.role} onClick={() => setSelectedUserRole(cat.role)} className="group bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden">
                    <div className={`w-20 h-20 ${cat.color} rounded-3xl flex items-center justify-center text-4xl shadow-lg text-white mb-6`}>{cat.icon}</div>
                    <h3 className="text-3xl font-black text-slate-800 mb-1">{cat.label}</h3>
                    <p className="text-4xl font-black text-slate-200">{cat.count}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-8 duration-500">
                <header className="flex justify-between items-center mb-10">
                  <button onClick={() => setSelectedUserRole(null)} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm hover:bg-slate-50 transition-all">←</button>
                  <button onClick={() => setShowUserModal({ mode: 'add', role: selectedUserRole })} className="bg-indigo-600 text-white px-10 py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100">+ Добавить</button>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {users.filter(u => u.role === selectedUserRole).map(u => (
                     <div key={u.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative group overflow-hidden">
                        <div className="flex items-center gap-4 mb-6">
                          <img src={u.avatar} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-50 shadow-sm" />
                          <div>
                            <h4 className="font-black text-slate-800 truncate w-32">{u.name}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.grade || u.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setShowUserModal({ mode: 'edit', user: u, role: u.role as UserRole })} className="flex-1 bg-slate-50 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-50 hover:text-indigo-600 transition-all">Правка</button>
                          <button onClick={() => handleDeleteUser(u.id)} className="w-12 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'structure' && (
          <div className="animate-in fade-in duration-500">
            {!selectedSubject ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {subjects.map(s => (
                  <div key={s.id} onClick={() => setSelectedSubject(s)} className="bg-white p-10 rounded-[48px] shadow-sm cursor-pointer hover:shadow-2xl transition-all border border-slate-100 group">
                    <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">{s.icon}</div>
                    <h3 className="text-3xl font-black text-slate-800">{s.name}</h3>
                    <p className="text-[10px] font-black text-slate-300 uppercase mt-4 tracking-widest">Управление предметом →</p>
                  </div>
                ))}
                <button onClick={() => setShowAddSubject(true)} className="border-4 border-dashed border-slate-200 rounded-[48px] p-10 text-slate-300 font-black uppercase text-xl hover:bg-white hover:text-indigo-600 hover:border-indigo-600 transition-all flex flex-col items-center justify-center gap-4">
                  <span className="text-4xl">+</span>
                  Новый предмет
                </button>
              </div>
            ) : !selectedGroup ? (
              <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                <header className="flex justify-between items-center bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                  <div className="flex items-center gap-6">
                    <button onClick={() => setSelectedSubject(null)} className="w-14 h-14 bg-slate-50 rounded-2xl text-2xl flex items-center justify-center hover:bg-slate-200 transition-all shadow-sm">←</button>
                    <div>
                      <h1 className="text-3xl font-black text-slate-800 tracking-tight">{selectedSubject.name}</h1>
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Список учебных групп</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAddGroup(true)} className="bg-indigo-600 text-white px-10 py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700">+ Новая группа</button>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {groups.filter(g => g.subjectId === selectedSubject.id).map(g => (
                     <div key={g.id} onClick={() => setSelectedGroup(g)} className="bg-white p-10 rounded-[48px] shadow-sm cursor-pointer hover:shadow-2xl transition-all border border-slate-100 group">
                       <div className="flex justify-between items-start mb-6">
                          <h3 className="text-3xl font-black text-slate-800">{g.name}</h3>
                          <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{g.grade}</span>
                       </div>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Учеников в составе: <span className="text-slate-800">{g.studentIds.length}</span></p>
                       <p className="text-[10px] font-black text-indigo-600 uppercase mt-8 tracking-widest group-hover:translate-x-2 transition-transform underline">Настроить состав учеников и учителя →</p>
                     </div>
                   ))}
                   {groups.filter(g => g.subjectId === selectedSubject.id).length === 0 && (
                     <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-200 rounded-[56px] text-slate-300 font-black uppercase tracking-widest">Групп пока нет</div>
                   )}
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-500">
                <header className="flex items-center gap-6 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                  <button onClick={() => setSelectedGroup(null)} className="w-14 h-14 bg-slate-50 rounded-2xl text-2xl flex items-center justify-center hover:bg-slate-200 transition-all shadow-sm">←</button>
                  <div>
                    <h1 className="text-3xl font-black text-slate-800">{selectedGroup.name}</h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1 ml-1">{selectedSubject.name} • Редактирование состава</p>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                   {/* Teacher Assignment Section */}
                   <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100">
                     <h3 className="text-xl font-black text-slate-800 mb-8 border-b border-slate-50 pb-4 tracking-tight">Ведущий учитель</h3>
                     <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                       {teachers.map(t => (
                         <button 
                           key={t.id} 
                           onClick={() => handleAssignTeacher(selectedGroup.id, t.id)} 
                           className={`w-full flex items-center gap-4 p-4 rounded-3xl border-4 transition-all ${selectedGroup.teacherId === t.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
                         >
                           <img src={t.avatar} className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm" />
                           <div className="text-left min-w-0">
                             <p className="text-sm font-black text-slate-800 truncate">{t.name}</p>
                             <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{selectedGroup.teacherId === t.id ? 'Назначен' : 'Свободен'}</p>
                           </div>
                         </button>
                       ))}
                       {teachers.length === 0 && <p className="text-center text-slate-300 text-xs py-10 font-black uppercase">Нет учителей в системе</p>}
                     </div>
                   </div>

                   {/* Student Assignment Section with Grade Filter */}
                   <div className="md:col-span-2 bg-white p-10 rounded-[48px] shadow-sm border border-slate-100">
                     <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Добавление учеников</h3>
                        <div className="flex flex-wrap gap-2">
                           {allGrades.map(grade => (
                             <button 
                                key={grade}
                                onClick={() => setStudentGradeFilter(grade)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${studentGradeFilter === grade ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-200'}`}
                             >
                               {grade}
                             </button>
                           ))}
                           <button 
                              onClick={() => setStudentGradeFilter('')}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${studentGradeFilter === '' ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-200'}`}
                           >
                             Все
                           </button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide p-1">
                       {(studentGradeFilter ? students.filter(s => s.grade === studentGradeFilter) : students).map(s => (
                         <button 
                           key={s.id} 
                           onClick={() => handleToggleStudentInGroup(selectedGroup.id, s.id)} 
                           className={`flex items-center gap-4 p-4 rounded-[32px] border-4 transition-all text-left ${selectedGroup.studentIds.includes(s.id) ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
                         >
                           <img src={s.avatar} className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm" />
                           <div className="min-w-0">
                             <p className="text-sm font-black text-slate-800 leading-tight truncate">{s.name}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.grade}</p>
                           </div>
                         </button>
                       ))}
                       {students.length === 0 && (
                         <div className="col-span-full py-10 text-center text-slate-300 font-black uppercase text-xs">Ученики не найдены</div>
                       )}
                     </div>
                     
                     <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Выбрано учеников: <span className="text-indigo-600">{selectedGroup.studentIds.length}</span></p>
                        <p className="text-[10px] font-black text-blue-500 uppercase italic opacity-60">Нажмите на карточку для добавления/удаления</p>
                     </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODAL: ADD SUBJECT */}
        {showAddSubject && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
             <div className="bg-white rounded-[56px] w-full max-w-lg p-12 shadow-2xl relative animate-in zoom-in duration-300">
                <button onClick={() => setShowAddSubject(false)} className="absolute top-10 right-10 text-3xl text-slate-300 hover:text-slate-800">✕</button>
                <h2 className="text-3xl font-black text-slate-800 mb-10 text-center tracking-tight">Новый предмет</h2>
                <form onSubmit={handleAddSubject} className="space-y-8">
                   <div className="group">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Название предмета</label>
                      <input name="name" required placeholder="Напр: Физика, Химия..." className="w-full bg-slate-50 p-5 rounded-[28px] font-black outline-none border-4 border-transparent focus:border-indigo-100 transition-all shadow-sm" />
                   </div>
                   <div className="group">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Иконка (Emoji)</label>
                      <input name="icon" placeholder="🧪" className="w-full bg-slate-50 p-5 rounded-[28px] font-black outline-none border-4 border-transparent focus:border-indigo-100 transition-all text-4xl text-center shadow-sm" />
                   </div>
                   <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black uppercase shadow-2xl shadow-indigo-100 tracking-widest text-xs hover:bg-indigo-700 transition-all">Создать предмет</button>
                </form>
             </div>
          </div>
        )}

        {/* MODAL: ADD GROUP */}
        {showAddGroup && selectedSubject && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
             <div className="bg-white rounded-[56px] w-full max-w-lg p-12 shadow-2xl relative animate-in zoom-in duration-300">
                <button onClick={() => setShowAddGroup(false)} className="absolute top-10 right-10 text-3xl text-slate-300 hover:text-slate-800">✕</button>
                <h2 className="text-3xl font-black text-slate-800 mb-10 text-center tracking-tight">Новая группа для: {selectedSubject.name}</h2>
                <form onSubmit={handleAddGroupToSubject} className="space-y-8">
                   <div className="group">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Название группы</label>
                      <input name="name" required placeholder="Напр: 8-А Физика" className="w-full bg-slate-50 p-5 rounded-[28px] font-black outline-none border-4 border-transparent focus:border-indigo-100 transition-all shadow-sm" />
                   </div>
                   <div className="group">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Основной класс (напр: 8-А)</label>
                      <input name="grade" required placeholder="Напр: 8-А" className="w-full bg-slate-50 p-5 rounded-[28px] font-black outline-none border-4 border-transparent focus:border-indigo-100 transition-all shadow-sm" />
                      <p className="text-[9px] text-slate-400 font-bold mt-2 ml-4 italic">Это значение определит начальный фильтр учеников.</p>
                   </div>
                   <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black uppercase shadow-2xl shadow-indigo-100 tracking-widest text-xs hover:bg-indigo-700 transition-all">Создать группу</button>
                </form>
             </div>
          </div>
        )}

        {/* MODAL: USER MANAGEMENT */}
        {showUserModal && (activeTab === 'users') && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-center p-6 overflow-y-auto">
             <div className="bg-white rounded-[56px] w-full max-w-2xl p-12 shadow-2xl relative my-auto animate-in zoom-in duration-300">
                <button onClick={() => setShowUserModal(null)} className="absolute top-10 right-10 text-3xl text-slate-300 hover:text-slate-800">✕</button>
                <div className="text-center mb-10">
                   <img src={modalAvatar} className="w-32 h-32 rounded-[40px] mx-auto mb-6 object-cover border-4 border-white shadow-xl" />
                   <button type="button" onClick={() => setModalAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`)} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">🎲 Генерировать фото</button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); const f = e.target as any; handleSaveUser({ name: f.name.value, login: f.login.value, password: f.password.value, role: showUserModal.role || f.role?.value, grade: f.grade?.value }); }} className="space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="group">
                         <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">ФИО</label>
                         <input name="name" required defaultValue={showUserModal.user?.name} className="w-full bg-slate-50 p-5 rounded-[28px] font-black outline-none border-4 border-transparent focus:border-indigo-50 shadow-sm" />
                      </div>
                      <div className="group">
                         <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Логин</label>
                         <input name="login" required defaultValue={showUserModal.user?.contactInfo} className="w-full bg-slate-50 p-5 rounded-[28px] font-black outline-none border-4 border-transparent focus:border-indigo-50 shadow-sm" />
                      </div>
                   </div>
                   <div className="group">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Пароль</label>
                      <input name="password" required defaultValue={showUserModal.user?.password || '123'} className="w-full bg-slate-50 p-5 rounded-[28px] font-black outline-none border-4 border-transparent focus:border-indigo-50 shadow-sm" />
                   </div>
                   {showUserModal.role === UserRole.STUDENT && (
                      <div className="group">
                         <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Класс (напр. 8-А)</label>
                         <input name="grade" required defaultValue={showUserModal.user?.grade} className="w-full bg-slate-50 p-5 rounded-[28px] font-black outline-none border-4 border-transparent focus:border-indigo-50 shadow-sm" />
                      </div>
                   )}
                   {showUserModal.role === UserRole.PARENT && (
                     <div className="group">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Дети</label>
                        <div className="bg-slate-50 p-6 rounded-[28px] max-h-48 overflow-y-auto space-y-2 border border-slate-100 shadow-inner scrollbar-hide">
                           {students.map(s => (
                             <button 
                               type="button" 
                               key={s.id} 
                               onClick={() => setModalChildrenIds(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id])} 
                               className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border-2 ${modalChildrenIds.includes(s.id) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white hover:bg-indigo-50 border-transparent text-slate-700'}`}
                             >
                                <div className="flex items-center gap-3">
                                   <img src={s.avatar} className="w-6 h-6 rounded-full" />
                                   <span className="text-xs font-bold">{s.name}</span>
                                </div>
                                <span className="text-[10px] font-black opacity-60">{s.grade}</span>
                             </button>
                           ))}
                           {students.length === 0 && <p className="text-center text-[10px] text-slate-300 font-black uppercase py-4">Сначала добавьте учеников</p>}
                        </div>
                     </div>
                   )}
                   <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black uppercase shadow-2xl shadow-indigo-100 tracking-widest text-xs hover:bg-indigo-700 transition-all">Сохранить</button>
                </form>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
