
import React, { useState, useMemo } from 'react';
import { User, LessonPlan, Grade, HomeworkStatus, Group } from '../types';
import { MOCK_LESSONS, MOCK_USERS, MOCK_GROUPS, MOCK_GRADES } from '../data';
import DrawingTask from '../components/DrawingTask';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'planning' | 'lessons' | 'groups'>('planning');
  const [localGroups, setLocalGroups] = useState<Group[]>(MOCK_GROUPS);
  const [lessons] = useState<LessonPlan[]>(MOCK_LESSONS);
  const [grades, setGrades] = useState<Grade[]>(MOCK_GRADES);
  
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonPlan | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newQuestionMedia, setNewQuestionMedia] = useState<{url: string, type: 'image' | 'video'} | null>(null);

  // Planning state
  const [planningGroup, setPlanningGroup] = useState<Group | null>(null);
  const [editingGroupNameId, setEditingGroupNameId] = useState<string | null>(null);
  const [tempGroupName, setTempGroupName] = useState("");

  const allStudents = MOCK_USERS.filter(u => u.role === 'STUDENT');

  const filteredPlanningLessons = useMemo(() => {
    if (!planningGroup) return [];
    return lessons.filter(l => l.groupId === planningGroup.id);
  }, [planningGroup, lessons]);

  const studentGrades = useMemo(() => {
    if (!selectedStudent) return [];
    return grades.filter(g => g.studentId === selectedStudent.id);
  }, [selectedStudent, grades]);

  const handleUpdateGroupName = (id: string) => {
    setLocalGroups(prev => prev.map(g => g.id === id ? { ...g, name: tempGroupName } : g));
    setEditingGroupNameId(null);
  };

  const handleMediaUpload = (type: 'image' | 'video') => {
    const mockUrl = type === 'image' 
      ? 'https://picsum.photos/seed/quiz/400/200' 
      : 'https://www.w3schools.com/html/mov_bbb.mp4';
    setNewQuestionMedia({ url: mockUrl, type });
  };

  // Fixed: Allow level to be string or undefined to accommodate optional Group.performanceLevel
  const getPerformanceColor = (level: string | undefined) => {
    if (level === 'Высокая') return 'text-green-600 bg-green-100';
    if (level === 'Средняя') return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 z-20 shadow-xl">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">EN</div>
          <div>
            <h2 className="font-black text-gray-800 leading-tight">EduNexus</h2>
            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Teacher Pro</span>
          </div>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto px-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('planning'); setPlanningGroup(null); setSelectedGroup(null); setSelectedStudent(null); }}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'planning' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <span className="mr-3">🗓️</span> Планирование
          </button>
          <button 
            onClick={() => { setActiveTab('groups'); setSelectedStudent(null); setPlanningGroup(null); }}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'groups' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <span className="mr-3">👥</span> Группы и Ученики
          </button>
          <button 
            onClick={() => { setActiveTab('lessons'); setPlanningGroup(null); }}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'lessons' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <span className="mr-3">📖</span> Уроки и Журнал
          </button>
        </nav>

        <div className="p-6 mt-auto border-t border-gray-100">
          <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-2xl">
            <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Физика и Математика</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full text-center text-xs text-red-500 hover:text-red-700 font-black uppercase tracking-widest p-2 border border-red-50 rounded-xl hover:bg-red-50 transition-all">
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        {activeTab === 'planning' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!planningGroup ? (
              <>
                <div>
                  <h1 className="text-3xl font-black text-slate-800">Планирование по группам</h1>
                  <p className="text-slate-400 text-sm mt-1">Выберите группу, чтобы составить календарный план уроков</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {localGroups.map(group => (
                    <div 
                      key={group.id} 
                      className="group bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col cursor-pointer relative"
                      onClick={() => editingGroupNameId !== group.id && setPlanningGroup(group)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          📚
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingGroupNameId(group.id); setTempGroupName(group.name); }}
                          className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                        >
                          ✎
                        </button>
                      </div>

                      {editingGroupNameId === group.id ? (
                        <div className="flex flex-col gap-2 mb-4" onClick={(e) => e.stopPropagation()}>
                          <input 
                            autoFocus
                            value={tempGroupName}
                            onChange={(e) => setTempGroupName(e.target.value)}
                            className="bg-slate-50 border-2 border-indigo-200 rounded-xl px-3 py-2 text-sm font-bold outline-none"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateGroupName(group.id)} className="bg-indigo-600 text-white text-[10px] px-3 py-1 rounded-lg font-bold">ОК</button>
                            <button onClick={() => setEditingGroupNameId(null)} className="bg-slate-200 text-slate-500 text-[10px] px-3 py-1 rounded-lg font-bold">Отмена</button>
                          </div>
                        </div>
                      ) : (
                        <h3 className="text-xl font-black text-slate-800 mb-1">{group.name}</h3>
                      )}

                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{group.grade} • {group.studentIds.length} учеников</p>
                      
                      <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                         <span className="text-[10px] text-slate-400 font-bold uppercase">Нагрузка: 4 ч/нед</span>
                         <span className="text-indigo-600 text-xs font-black">Открыть план →</span>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={() => setShowCreateGroup(true)}
                    className="border-4 border-dashed border-gray-100 rounded-[32px] p-6 flex flex-col items-center justify-center text-gray-300 hover:text-indigo-400 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all"
                  >
                    <span className="text-4xl mb-2">+</span>
                    <span className="text-xs font-black uppercase tracking-widest">Новая группа</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="animate-in slide-in-from-right-8 duration-500 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setPlanningGroup(null)} 
                      className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 transition-all"
                    >
                      ←
                    </button>
                    <div>
                      <h1 className="text-3xl font-black text-slate-800">План: {planningGroup.name}</h1>
                      <p className="text-slate-400 text-sm mt-1">{planningGroup.grade} • Календарно-тематическое планирование</p>
                    </div>
                  </div>
                  <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">+ Создать урок</button>
                </div>

                <div className="grid gap-4">
                  {filteredPlanningLessons.length > 0 ? filteredPlanningLessons.map(lesson => (
                    <div key={lesson.id} className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between hover:shadow-xl transition-all border-l-8 border-l-indigo-500">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-indigo-500 uppercase">{lesson.date}</span>
                        </div>
                        <h3 className="text-lg font-black text-gray-800">{lesson.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-1">{lesson.description}</p>
                      </div>
                      <div className="flex gap-2 mt-4 sm:mt-0">
                        <button 
                          onClick={() => { setSelectedLesson(lesson); setActiveTab('lessons'); }}
                          className="bg-slate-50 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        >
                          Редактировать контент
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center border-4 border-dashed border-gray-50 rounded-[48px] bg-white">
                       <p className="text-slate-300 font-bold text-lg">В этой группе пока нет запланированных уроков</p>
                       <button className="mt-4 text-indigo-600 font-black uppercase text-xs hover:underline">Добавить первый урок</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
            {!selectedGroup ? (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-black text-slate-800">Управление Учениками</h1>
                    <p className="text-slate-400 text-sm mt-1">Детальная статистика и профили каждого учащегося</p>
                  </div>
                  <button 
                    onClick={() => setShowCreateGroup(true)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-sm font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    + Сформировать Класс
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {localGroups.map(group => (
                    <div key={group.id} className="group bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer overflow-hidden relative" onClick={() => setSelectedGroup(group)}>
                      <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform">👥</div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <h3 className="text-2xl font-black text-gray-800">{group.name}</h3>
                            <div className="flex gap-2 mt-2">
                               <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">{group.grade}</span>
                               <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-widest">{group.ageRange || 'Н/Д'}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest ${getPerformanceColor(group.performanceLevel)}`}>
                            {group.performanceLevel || 'Средняя'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mb-8">
                          <div className="text-center">
                             <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Учеников</p>
                             <p className="text-3xl font-black text-slate-800">{group.studentIds.length}</p>
                          </div>
                          <div className="text-center">
                             <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Ср. балл</p>
                             <p className="text-3xl font-black text-indigo-600">{group.averageScore || 'Н/Д'}</p>
                          </div>
                          <div className="text-center">
                             <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Активность</p>
                             <p className="text-3xl font-black text-green-500">92%</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                           <div className="flex -space-x-3">
                              {group.studentIds.map(sid => (
                                <img key={sid} src={allStudents.find(s => s.id === sid)?.avatar} className="w-10 h-10 rounded-full border-4 border-white shadow-sm" />
                              ))}
                           </div>
                           <button className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:translate-x-1 transition-transform">Профили учеников →</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="flex items-center justify-between">
                   <button onClick={() => { setSelectedGroup(null); setSelectedStudent(null); }} className="text-sm font-black text-indigo-600 flex items-center gap-2 hover:bg-indigo-50 p-3 rounded-2xl transition-all">
                      ← Назад к списку групп
                   </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   {/* Student List Sidebar */}
                   <div className="lg:col-span-1 space-y-4">
                      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                         <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                           <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                           Ученики {selectedGroup.name}
                         </h2>
                         <div className="space-y-3">
                            {selectedGroup.studentIds.map(sid => {
                              const student = allStudents.find(s => s.id === sid);
                              if (!student) return null;
                              return (
                                <button 
                                  key={sid}
                                  onClick={() => setSelectedStudent(student)}
                                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${selectedStudent?.id === student.id ? 'border-indigo-500 bg-indigo-50 shadow-lg' : 'border-gray-50 bg-gray-50 hover:border-indigo-200'}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <img src={student.avatar} className="w-10 h-10 rounded-xl shadow-sm" />
                                    <div className="text-left">
                                      <p className="text-sm font-black text-slate-800 leading-tight">{student.name}</p>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{student.age} лет • {student.grade}</p>
                                    </div>
                                  </div>
                                  <span className="text-xs font-black text-indigo-600">95%</span>
                                </button>
                              );
                            })}
                         </div>
                      </div>
                   </div>

                   {/* Analysis & Detail Area */}
                   <div className="lg:col-span-2">
                      {selectedStudent ? (
                        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                              <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 relative z-10">
                                 <img src={selectedStudent.avatar} className="w-24 h-24 rounded-[32px] border-4 border-indigo-50 shadow-xl shadow-indigo-100" />
                                 <div className="text-center sm:text-left">
                                    <h2 className="text-3xl font-black text-slate-800">{selectedStudent.name}</h2>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Индивидуальная аналитика</p>
                                    <div className="flex gap-4 mt-4">
                                       <div className="bg-green-50 px-4 py-2 rounded-xl">
                                          <p className="text-[10px] font-black text-green-600 uppercase">Ср. балл</p>
                                          <p className="text-xl font-black text-green-700">92.0</p>
                                       </div>
                                       <div className="bg-blue-50 px-4 py-2 rounded-xl">
                                          <p className="text-[10px] font-black text-blue-600 uppercase">Пропуски</p>
                                          <p className="text-xl font-black text-blue-700">1</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <div className="h-[250px] mb-10">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">График успеваемости</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={studentGrades}>
                                    <defs>
                                      <linearGradient id="studentColor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} domain={[0, 100]} />
                                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                    <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#studentColor)" />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>

                              <div>
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Журнал оценок</h3>
                                <div className="space-y-3">
                                   {studentGrades.map((g, idx) => (
                                     <div key={idx} className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-indigo-100 transition-all">
                                        <div className="flex-1">
                                           <div className="flex items-center gap-2 mb-1">
                                              <span className="text-[10px] font-black text-slate-400 uppercase">{g.date}</span>
                                              <p className="text-sm font-black text-slate-700">Урок: {lessons.find(l => l.id === g.lessonId)?.title}</p>
                                           </div>
                                           <p className="text-xs text-slate-500 italic">"{g.feedback || 'Без комментария'}"</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                           <div className="text-xl font-black text-indigo-600">{g.score}</div>
                                           <button className="text-xs font-bold text-slate-300 hover:text-indigo-600 transition-colors">✎</button>
                                        </div>
                                     </div>
                                   ))}
                                </div>
                              </div>
                           </div>
                        </div>
                      ) : (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-gray-300 border-4 border-dashed border-gray-100 rounded-[48px] bg-white">
                           <div className="text-8xl mb-6 opacity-10">🎓</div>
                           <h3 className="text-xl font-black text-slate-300">Выберите ученика</h3>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
               <div className="relative group">
                 <select 
                  className="bg-white border-2 border-gray-100 rounded-3xl px-6 py-4 text-sm font-black shadow-lg outline-none focus:border-indigo-500 transition-all appearance-none pr-12 min-w-[300px]"
                  onChange={(e) => setSelectedLesson(lessons.find(l => l.id === e.target.value) || null)}
                  value={selectedLesson?.id || ""}
                 >
                   <option value="" disabled>Выберите активный урок...</option>
                   {lessons.map(l => <option key={l.id} value={l.id}>{l.title} ({localGroups.find(g => g.id === l.groupId)?.name})</option>)}
                 </select>
                 <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-600 transition-colors">▼</div>
               </div>
               {selectedLesson && (
                 <div className="flex items-center gap-4">
                    <span className="text-xs bg-green-100 text-green-700 px-4 py-2 rounded-2xl font-black uppercase tracking-widest shadow-sm">Урок в процессе</span>
                 </div>
               )}
            </div>

            {selectedLesson ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-slate-100/50">
                    <h2 className="text-xl font-black mb-6 text-slate-800 flex items-center gap-3">
                      <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl text-lg">📝</span>
                      Контент Урока
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Проверка ДЗ</label>
                        <textarea className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold outline-none transition-all h-24" defaultValue={selectedLesson.homeworkCheck} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Новое ДЗ</label>
                        <textarea className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold outline-none transition-all h-24" defaultValue={selectedLesson.newHomework} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="bg-blue-50 text-blue-700 border-2 border-blue-100 py-4 rounded-2xl text-xs font-black flex flex-col items-center hover:bg-blue-100 transition-all group">
                          📽️ Видеоурок
                        </button>
                        <button className="bg-green-50 text-green-700 border-2 border-green-100 py-4 rounded-2xl text-xs font-black flex flex-col items-center hover:bg-green-100 transition-all group">
                          🌐 Google Meet
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-slate-100/50">
                    <h2 className="text-xl font-black mb-6 text-slate-800 flex items-center gap-3">
                      <span className="p-2 bg-orange-50 text-orange-600 rounded-xl text-lg">📐</span>
                      Графическое Задание
                    </h2>
                    <DrawingTask onSave={(data) => console.log('Drawing', data)} />
                  </section>
                </div>

                <div className="space-y-8">
                  <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-slate-100/50">
                    <h2 className="text-xl font-black mb-6 text-slate-800 flex items-center gap-3">
                      <span className="p-2 bg-yellow-50 text-yellow-600 rounded-xl text-lg">🧩</span>
                      Тестирование
                    </h2>
                    <div className="space-y-6">
                      <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 relative group/test">
                        <input placeholder="Текст вопроса..." className="w-full bg-white border-2 border-transparent focus:border-indigo-500 rounded-xl p-4 text-sm font-bold mb-4 outline-none shadow-sm" />
                        
                        <div className="flex gap-3 mb-4">
                          <button onClick={() => handleMediaUpload('image')} className="flex-1 py-3 px-4 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-all">🖼️ Изображение</button>
                          <button onClick={() => handleMediaUpload('video')} className="flex-1 py-3 px-4 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-all">🎞️ Видео</button>
                        </div>

                        {newQuestionMedia && (
                          <div className="mb-4 rounded-2xl overflow-hidden shadow-inner border-2 border-indigo-100">
                             {newQuestionMedia.type === 'image' ? <img src={newQuestionMedia.url} className="w-full h-32 object-cover" /> : <video src={newQuestionMedia.url} className="w-full h-32 object-cover" controls />}
                          </div>
                        )}
                      </div>
                      <button className="w-full bg-slate-800 text-white py-5 rounded-[24px] text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all active:scale-95">
                        Сохранить тест
                      </button>
                    </div>
                  </section>

                  <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-slate-100/50">
                    <h2 className="text-xl font-black mb-6 text-slate-800 flex items-center gap-3">
                      <span className="p-2 bg-green-50 text-green-600 rounded-xl text-lg">📊</span>
                      Журнал: {localGroups.find(g => g.id === selectedLesson.groupId)?.name}
                    </h2>
                    <div className="space-y-3">
                      {allStudents.filter(s => localGroups.find(g => g.id === selectedLesson.groupId)?.studentIds.includes(s.id)).map(student => (
                        <div key={student.id} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-4 rounded-2xl transition-all">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500" defaultChecked={selectedLesson.attendance.includes(student.id)} />
                            <div className="flex flex-col">
                               <span className="text-sm font-black text-slate-700">{student.name}</span>
                               <button onClick={() => { setSelectedStudent(student); setSelectedGroup(localGroups.find(g => g.id === selectedLesson.groupId)!); setActiveTab('groups'); }} className="text-[10px] text-indigo-500 font-bold uppercase text-left hover:underline">Профиль</button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <input 
                              type="number" 
                              placeholder="0-100" 
                              className="w-16 bg-white border-2 border-slate-100 rounded-xl px-2 py-3 text-sm text-center font-black text-indigo-600 focus:border-indigo-500 outline-none shadow-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-8 bg-indigo-600 text-white py-5 rounded-[24px] text-sm font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                      Сохранить Журнал
                    </button>
                  </section>
                </div>
              </div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center text-gray-300 border-4 border-dashed border-gray-100 rounded-[64px] bg-white/50">
                <div className="text-9xl mb-8 opacity-5">📕</div>
                <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Журнал не открыт</h3>
              </div>
            )}
          </div>
        )}
      </main>

      {showCreateGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[48px] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800">Новая группа</h2>
              </div>
              <button onClick={() => setShowCreateGroup(false)} className="text-slate-300 hover:text-slate-800 text-2xl font-black">✕</button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Название</label>
                  <input placeholder="Напр: 8-Б Физмат" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Класс</label>
                  <select className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold outline-none bg-white transition-all">
                     <option>8-А</option>
                     <option>9-Б</option>
                     <option>11-В</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Ученики</label>
                <div className="max-h-60 overflow-y-auto border-2 border-slate-50 rounded-3xl p-4 space-y-2 bg-slate-50/50">
                  {allStudents.map(student => (
                    <label key={student.id} className="flex items-center gap-4 p-3 hover:bg-white hover:shadow-md rounded-2xl cursor-pointer transition-all border-2 border-transparent hover:border-indigo-50">
                       <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded-lg" />
                       <img src={student.avatar} className="w-8 h-8 rounded-lg" />
                       <span className="text-sm font-black text-slate-800">{student.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                 <button onClick={() => setShowCreateGroup(false)} className="flex-1 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all">Отмена</button>
                 <button onClick={() => setShowCreateGroup(false)} className="flex-2 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">Создать</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
