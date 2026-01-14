
import React, { useState, useEffect } from 'react';
import { User, LessonPlan, Grade, Group, Submission, ChatMessage, QuizQuestion } from '../types';
import { MOCK_LESSONS, MOCK_USERS, MOCK_GROUPS } from '../data';
import DrawingTask from '../components/DrawingTask';

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'planning' | 'lessons' | 'journal' | 'summary'>('planning');
  
  // App State with Persistence
  const [lessons, setLessons] = useState<LessonPlan[]>(() => {
    const saved = localStorage.getItem('school_lessons');
    return saved ? JSON.parse(saved) : MOCK_LESSONS;
  });
  const [grades, setGrades] = useState<Grade[]>(() => {
    const saved = localStorage.getItem('school_grades');
    return saved ? JSON.parse(saved) : [];
  });
  const [submissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('school_submissions');
    return saved ? JSON.parse(saved) : [];
  });
  const [groups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('school_groups');
    const all = saved ? JSON.parse(saved) : MOCK_GROUPS;
    // ONLY groups assigned to THIS teacher
    return all.filter((g: Group) => g.teacherId === user.id);
  });

  // UI States
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonPlan | null>(null);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [copyTarget, setCopyTarget] = useState<LessonPlan | null>(null);
  
  // Quiz Editor State within the modal
  const [editorQuestions, setEditorQuestions] = useState<QuizQuestion[]>([]);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const [quizFile, setQuizFile] = useState<string | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem('school_lessons', JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem('school_grades', JSON.stringify(grades));
  }, [grades]);

  const students = MOCK_USERS.filter(u => u.role === 'STUDENT');

  // Open Editor Modal
  const openEditor = (lesson: LessonPlan | null = null) => {
    if (lesson) {
      setSelectedLesson(lesson);
      setEditorQuestions(lesson.questions || []);
      setIsDrawingEnabled(lesson.isDrawingEnabled || false);
      setQuizFile(lesson.quizFile);
    } else {
      setSelectedLesson(null);
      setEditorQuestions([]);
      setIsDrawingEnabled(false);
      setQuizFile(undefined);
    }
    setShowAddLesson(true);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    const f = e.target as any;
    const newLesson: LessonPlan = {
      id: selectedLesson ? selectedLesson.id : `l_${Date.now()}`,
      subjectId: selectedGroup?.subjectId || selectedLesson?.subjectId || 'sub1',
      groupId: selectedGroup?.id || selectedLesson?.groupId || '',
      teacherId: user.id,
      title: f.title.value,
      date: f.date.value,
      description: f.description.value,
      newHomework: f.homework.value,
      videoUrl: f.videoUrl.value,
      meetingLink: f.meetingLink.value,
      zoomLink: f.zoomLink.value,
      isDrawingEnabled: isDrawingEnabled,
      quizFile: quizFile,
      questions: editorQuestions,
      attendance: selectedLesson?.attendance || [],
      chat: selectedLesson?.chat || []
    };

    if (selectedLesson) {
      setLessons(prev => prev.map(l => l.id === selectedLesson.id ? newLesson : l));
    } else {
      setLessons([...lessons, newLesson]);
    }
    setShowAddLesson(false);
  };

  const addQuestion = () => {
    const q: QuizQuestion = {
      id: `q_${Date.now()}`,
      text: '',
      options: ['', '', '', ''],
      correctIndex: 0
    };
    setEditorQuestions([...editorQuestions, q]);
  };

  const startLesson = (lesson: LessonPlan) => {
    setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, isStarted: true } : l));
    setSelectedLesson(lesson);
    setIsLiveMode(true);
    setActiveTab('lessons');
    setSelectedGroup(null);
  };

  const copyLessonToGroup = (targetGroupId: string) => {
    if (!copyTarget) return;
    const copied: LessonPlan = {
      ...copyTarget,
      id: `l_${Date.now()}`,
      groupId: targetGroupId,
      isStarted: false,
      chat: [],
      attendance: []
    };
    setLessons([...lessons, copied]);
    setCopyTarget(null);
    alert('Урок успешно скопирован в выбранную группу!');
  };

  const handleSendLink = () => {
    if (!selectedLesson || !chatInput.trim()) return;
    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setLessons(prev => prev.map(l => l.id === selectedLesson.id ? { ...l, chat: [...(l.chat || []), msg] } : l));
    setChatInput('');
  };

  const updateGrade = (sid: string, lid: string, score: number) => {
    const newGrade: Grade = { studentId: sid, lessonId: lid, score, date: new Date().toISOString(), type: 'formative' };
    setGrades(prev => {
      const filtered = prev.filter(g => !(g.studentId === sid && g.lessonId === lid));
      return [...filtered, newGrade];
    });
  };

  return (
    <div className="flex-1 flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shrink-0 z-30 shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl font-black">EN</div>
          <div><h2 className="font-black text-lg">EduNexus</h2><p className="text-[10px] text-indigo-400 font-bold uppercase">Учитель</p></div>
        </div>
        <nav className="flex-1 py-8 px-4 space-y-2">
          <button onClick={() => { setActiveTab('planning'); setIsLiveMode(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'planning' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>🗓️ Планирование</button>
          <button onClick={() => setActiveTab('lessons')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'lessons' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>📖 Журнал урока</button>
          <button onClick={() => { setActiveTab('summary'); setIsLiveMode(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'summary' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>📊 Сводный журнал</button>
        </nav>
        <div className="p-8 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <img src={user.avatar} className="w-10 h-10 rounded-full border border-indigo-500" />
            <div className="min-w-0"><p className="text-xs font-black truncate">{user.name}</p></div>
          </div>
          <button onClick={onLogout} className="w-full py-4 rounded-xl bg-slate-800 text-red-400 text-xs font-black uppercase hover:bg-red-500 transition-all">Выйти</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 bg-slate-50">
        
        {/* PLANNING TAB */}
        {activeTab === 'planning' && (
          <div className="animate-in fade-in duration-500">
            <header className="mb-12">
               <h1 className="text-4xl font-black text-slate-800 tracking-tight">Ваши группы</h1>
               <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 ml-1">Только назначенные администратором классы</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {groups.map(g => (
                 <div key={g.id} className="bg-white p-8 rounded-[48px] shadow-sm border border-slate-100 hover:shadow-2xl transition-all group cursor-pointer" onClick={() => setSelectedGroup(g)}>
                    <div className="flex justify-between items-start mb-10">
                       <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-3xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">📚</div>
                       <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">{g.grade}</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">{g.name}</h3>
                    <p className="text-sm text-slate-400 mb-6">{lessons.filter(l => l.groupId === g.id).length} запланированных уроков</p>
                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-2 transition-transform">Управление планом →</div>
                 </div>
               ))}
            </div>

            {selectedGroup && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
                 <div className="bg-white rounded-[56px] w-full max-w-4xl p-12 max-h-[90vh] overflow-y-auto relative shadow-2xl animate-in zoom-in duration-300">
                    <button onClick={() => setSelectedGroup(null)} className="absolute top-10 right-10 text-3xl font-black text-slate-300 hover:text-slate-800">✕</button>
                    <h2 className="text-3xl font-black text-slate-800 mb-10">План занятий: {selectedGroup.name}</h2>
                    
                    <div className="space-y-4 mb-10">
                       {lessons.filter(l => l.groupId === selectedGroup.id).map(l => (
                         <div key={l.id} className="bg-slate-50 p-6 rounded-3xl border-l-8 border-indigo-600 flex justify-between items-center hover:bg-white hover:shadow-xl transition-all">
                            <div>
                               <p className="text-[10px] font-black text-indigo-500 uppercase">{l.date}</p>
                               <h4 className="text-lg font-black text-slate-800">{l.title}</h4>
                            </div>
                            <div className="flex gap-2">
                               <button onClick={() => setCopyTarget(l)} className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase hover:text-indigo-600">Копировать</button>
                               <button onClick={() => openEditor(l)} className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase hover:text-indigo-600">Редактор</button>
                               <button onClick={() => startLesson(l)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg">Начать урок</button>
                            </div>
                         </div>
                       ))}
                    </div>
                    <button onClick={() => openEditor(null)} className="w-full bg-slate-900 text-white py-6 rounded-[32px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">+ Создать новое занятие</button>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* LESSONS / LIVE JOURNAL TAB */}
        {activeTab === 'lessons' && (
           <div className="animate-in fade-in duration-500">
              {selectedLesson && isLiveMode ? (
                <div className="space-y-10">
                   <header className="flex justify-between items-center bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-6">
                         <button onClick={() => setIsLiveMode(false)} className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl">←</button>
                         <div>
                            <h1 className="text-3xl font-black text-slate-800">{selectedLesson.title}</h1>
                            <p className="text-indigo-600 font-black uppercase text-[10px] mt-1">Идет урок • {selectedLesson.date}</p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         {selectedLesson.meetingLink && <a href={selectedLesson.meetingLink} target="_blank" className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg">Google Meet</a>}
                         {selectedLesson.zoomLink && <a href={selectedLesson.zoomLink} target="_blank" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg">Zoom</a>}
                      </div>
                   </header>

                   <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                      <div className="lg:col-span-3 bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden p-8">
                         <h3 className="text-2xl font-black text-slate-800 mb-8">Журнал группы</h3>
                         <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                               <tr>
                                  <th className="px-6 py-4">Ученик</th>
                                  <th className="px-6 py-4 text-center">ДЗ (фото)</th>
                                  <th className="px-6 py-4 text-center">Тест</th>
                                  <th className="px-6 py-4 text-center">Оценка (0-100)</th>
                                  <th className="px-6 py-4 text-center">Присутствие</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                               {students.filter(s => {
                                 const grp = MOCK_GROUPS.find(g => g.id === selectedLesson.groupId);
                                 return grp?.studentIds.includes(s.id);
                               }).map(student => {
                                 const submission = submissions.find(sub => sub.studentId === student.id && sub.lessonId === selectedLesson.id);
                                 const grade = grades.find(g => g.studentId === student.id && g.lessonId === selectedLesson.id);
                                 return (
                                   <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-6 py-6 flex items-center gap-4">
                                         <img src={student.avatar} className="w-10 h-10 rounded-full border border-slate-200 shadow-sm" />
                                         <p className="text-sm font-black text-slate-800">{student.name}</p>
                                      </td>
                                      <td className="px-6 py-6 text-center">
                                         {submission?.homeworkImageUrl ? <button onClick={() => window.open(submission.homeworkImageUrl)} className="text-2xl">🖼️</button> : <span className="text-[10px] text-slate-300 font-bold uppercase">Нет</span>}
                                      </td>
                                      <td className="px-6 py-6 text-center">
                                         <span className={`text-xs font-black ${submission?.testFinished ? 'text-green-600' : 'text-slate-300'}`}>
                                            {submission?.testScore !== undefined ? `${submission.testScore}%` : submission?.testFinished ? 'Сдано' : '—'}
                                         </span>
                                      </td>
                                      <td className="px-6 py-6 text-center">
                                         <input 
                                           type="number" 
                                           defaultValue={grade?.score || 0}
                                           onBlur={(e) => updateGrade(student.id, selectedLesson.id, parseInt(e.target.value))}
                                           className="w-16 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-xl p-2 text-center font-black text-indigo-600 outline-none" 
                                         />
                                      </td>
                                      <td className="px-6 py-6 text-center">
                                         <input type="checkbox" className="w-5 h-5 rounded-lg text-indigo-600" defaultChecked />
                                      </td>
                                   </tr>
                                 );
                               })}
                            </tbody>
                         </table>
                      </div>

                      <div className="lg:col-span-1">
                         <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm h-[600px] flex flex-col sticky top-10">
                            <h3 className="text-xl font-black text-slate-800 mb-6">Чат ссылок</h3>
                            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-hide">
                               {selectedLesson.chat?.map(msg => (
                                 <div key={msg.id} className="bg-indigo-50 p-4 rounded-3xl border border-indigo-100">
                                    <p className="text-sm text-slate-700 font-medium break-words leading-relaxed">{msg.text}</p>
                                    <span className="text-[9px] font-black text-indigo-300 uppercase block mt-2">{msg.timestamp}</span>
                                 </div>
                               ))}
                               {!selectedLesson.chat?.length && <p className="text-center text-slate-300 py-10 font-bold uppercase text-[10px]">Ваши ссылки появятся здесь</p>}
                            </div>
                            <div className="space-y-4">
                               <textarea 
                                 value={chatInput} 
                                 onChange={(e) => setChatInput(e.target.value)} 
                                 placeholder="Вставьте ссылку для учеников..." 
                                 className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold outline-none h-24 resize-none border-2 border-transparent focus:border-indigo-100 shadow-inner" 
                               />
                               <button onClick={handleSendLink} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg">Отправить всем</button>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="h-[600px] flex flex-col items-center justify-center text-slate-200 border-4 border-dashed border-slate-100 rounded-[64px] bg-white">
                  <div className="text-8xl mb-8 opacity-5">📓</div>
                  <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Выберите урок для работы</h3>
                  <button onClick={() => setActiveTab('planning')} className="mt-8 text-indigo-600 font-black uppercase text-sm hover:underline">Перейти в планирование</button>
                </div>
              )}
           </div>
        )}

        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
           <div className="animate-in fade-in duration-500 space-y-10">
              <header><h1 className="text-4xl font-black text-slate-800 tracking-tight">Сводный журнал</h1><p className="text-slate-400 font-bold uppercase text-[10px] mt-2">Статистика успеваемости по вашим группам</p></header>
              {groups.map(g => (
                <div key={g.id} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
                   <h3 className="text-2xl font-black text-slate-800 mb-8">{g.name}</h3>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
                            <tr><th className="px-6 py-4">Ученик</th><th className="px-6 py-4 text-center">Ср. Формативки</th><th className="px-6 py-4 text-center">Ср. Тесты</th><th className="px-6 py-4 text-center">Итоговая</th></tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {students.filter(s => g.studentIds.includes(s.id)).map(student => (
                              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-6 py-4 flex items-center gap-3"><img src={student.avatar} className="w-8 h-8 rounded-full border border-slate-100" /><span className="text-sm font-black">{student.name}</span></td>
                                 <td className="px-6 py-4 text-center font-bold text-slate-600">92</td><td className="px-6 py-4 text-center font-bold text-slate-600">88</td>
                                 <td className="px-6 py-4 text-center"><span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-sm">90</span></td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              ))}
           </div>
        )}

        {/* LESSON EDITOR MODAL */}
        {showAddLesson && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-center p-6 overflow-y-auto">
             <div className="bg-white rounded-[56px] w-full max-w-5xl p-12 shadow-2xl animate-in zoom-in duration-300 my-auto relative">
                <button onClick={() => setShowAddLesson(false)} className="absolute top-10 right-10 text-3xl font-black text-slate-300 hover:text-slate-800">✕</button>
                <h2 className="text-4xl font-black text-slate-800 mb-10 text-center tracking-tight">{selectedLesson ? 'Редактировать урок' : 'Создать занятие'}</h2>
                
                <form onSubmit={handleSaveLesson} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   {/* Left Column: Basic Info */}
                   <div className="space-y-8">
                      <div className="group"><label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Название темы</label><input name="title" required defaultValue={selectedLesson?.title} className="w-full bg-slate-50 p-5 rounded-[28px] font-black outline-none border-4 border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-sm" /></div>
                      <div className="group"><label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Дата занятия</label><input name="date" type="date" required defaultValue={selectedLesson?.date} className="w-full bg-slate-50 p-5 rounded-[28px] font-black outline-none border-4 border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-sm" /></div>
                      <div className="group"><label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Описание (План урока)</label><textarea name="description" defaultValue={selectedLesson?.description} className="w-full bg-slate-50 p-5 rounded-[28px] font-bold text-sm outline-none border-4 border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-sm h-32" /></div>
                      <div className="group"><label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Домашнее задание (Инструкция)</label><textarea name="homework" required defaultValue={selectedLesson?.newHomework} className="w-full bg-slate-50 p-5 rounded-[28px] font-bold text-sm outline-none border-4 border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-sm h-32" /></div>
                      
                      <div className="bg-slate-50 p-8 rounded-[40px] space-y-6 shadow-inner border border-slate-100">
                         <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ссылки на занятие</h4>
                         <input name="videoUrl" placeholder="📽️ Ссылка на Видеоурок" defaultValue={selectedLesson?.videoUrl} className="w-full bg-white p-4 rounded-2xl text-xs font-bold outline-none border border-slate-100 shadow-sm" />
                         <input name="meetingLink" placeholder="🌐 Google Meet" defaultValue={selectedLesson?.meetingLink} className="w-full bg-white p-4 rounded-2xl text-xs font-bold outline-none border border-slate-100 shadow-sm" />
                         <input name="zoomLink" placeholder="🎥 Zoom" defaultValue={selectedLesson?.zoomLink} className="w-full bg-white p-4 rounded-2xl text-xs font-bold outline-none border border-slate-100 shadow-sm" />
                      </div>
                   </div>

                   {/* Right Column: Tests & Drawings */}
                   <div className="space-y-8">
                      {/* Drawing Toggle */}
                      <div className={`p-8 rounded-[40px] border-4 transition-all ${isDrawingEnabled ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-50 bg-slate-50/30'}`}>
                         <div className="flex justify-between items-center mb-4">
                            <div><h3 className="text-xl font-black text-slate-800">Графическое задание</h3><p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Рисование на платформе</p></div>
                            <button type="button" onClick={() => setIsDrawingEnabled(!isDrawingEnabled)} className={`w-14 h-8 rounded-full transition-all relative ${isDrawingEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${isDrawingEnabled ? 'right-1' : 'left-1'}`} /></button>
                         </div>
                         {isDrawingEnabled && (
                           <div className="p-4 bg-white rounded-3xl border-2 border-indigo-100 animate-in zoom-in duration-300">
                              <p className="text-[9px] font-black text-indigo-500 uppercase mb-4 text-center italic">Вы можете загрузить фоновый рисунок для задания ниже</p>
                              <DrawingTask baseImage={selectedLesson?.drawingBaseImage} onSave={(data) => { if(selectedLesson) selectedLesson.drawingBaseImage = data }} />
                           </div>
                         )}
                      </div>

                      {/* Quiz Builder */}
                      <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-100/50 space-y-6">
                         <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-800">Проверка знаний</h3>
                            <div className="flex gap-2">
                               <button type="button" onClick={() => setQuizFile(undefined)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${!quizFile ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>Тест</button>
                               <label className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase cursor-pointer transition-all ${quizFile ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>Файл<input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if(f) setQuizFile(URL.createObjectURL(f)); }} /></label>
                            </div>
                         </div>

                         {quizFile ? (
                           <div className="p-10 bg-indigo-50 rounded-[32px] border-2 border-indigo-100 text-center animate-in zoom-in duration-300">
                              <span className="text-4xl mb-4 block">📄</span>
                              <p className="text-xs font-black text-indigo-600 uppercase">Загружен файл задания</p>
                              <p className="text-[9px] text-slate-400 mt-2">При загруженном файле интерактивный тест будет скрыт.</p>
                              <button type="button" onClick={() => setQuizFile(undefined)} className="mt-4 text-red-400 font-black uppercase text-[10px]">Удалить файл</button>
                           </div>
                         ) : (
                           <div className="space-y-6">
                              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                                 {editorQuestions.map((q, qIdx) => (
                                   <div key={q.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 relative group">
                                      <button type="button" onClick={() => setEditorQuestions(editorQuestions.filter(item => item.id !== q.id))} className="absolute top-4 right-4 text-red-300 hover:text-red-500 transition-colors">✕</button>
                                      <input 
                                        placeholder={`Вопрос ${qIdx + 1}`} 
                                        value={q.text} 
                                        onChange={(e) => { const newQ = [...editorQuestions]; newQ[qIdx].text = e.target.value; setEditorQuestions(newQ); }}
                                        className="w-full bg-white p-3 rounded-xl text-sm font-bold border border-slate-100 shadow-sm" 
                                      />
                                      <div className="grid grid-cols-2 gap-3">
                                         {q.options.map((opt, oIdx) => (
                                           <div key={oIdx} className="flex items-center gap-2">
                                              <input type="radio" checked={q.correctIndex === oIdx} onChange={() => { const newQ = [...editorQuestions]; newQ[qIdx].correctIndex = oIdx; setEditorQuestions(newQ); }} />
                                              <input 
                                                placeholder={`Вариант ${oIdx + 1}`} 
                                                value={opt} 
                                                onChange={(e) => { const newQ = [...editorQuestions]; newQ[qIdx].options[oIdx] = e.target.value; setEditorQuestions(newQ); }}
                                                className="w-full bg-white p-2 rounded-lg text-[11px] font-bold border border-slate-100" 
                                              />
                                           </div>
                                         ))}
                                      </div>
                                      {/* Media URL Field */}
                                      <div className="pt-2 border-t border-slate-200 mt-2">
                                        <input 
                                          placeholder="URL для медиа (фото/видео/аудио)" 
                                          value={q.mediaUrl || ''} 
                                          onChange={(e) => { const newQ = [...editorQuestions]; newQ[qIdx].mediaUrl = e.target.value; setEditorQuestions(newQ); }}
                                          className="w-full bg-white p-2 rounded-lg text-[10px] font-medium border border-slate-100" 
                                        />
                                      </div>
                                   </div>
                                 ))}
                                 {editorQuestions.length === 0 && <p className="text-center py-10 text-slate-300 font-bold uppercase text-[10px]">Тест еще не создан</p>}
                              </div>
                              <button type="button" onClick={addQuestion} className="w-full py-4 rounded-2xl bg-slate-800 text-white font-black uppercase text-[10px] hover:bg-slate-900 transition-all">+ Добавить вопрос</button>
                           </div>
                         )}
                      </div>

                      <button type="submit" className="w-full bg-indigo-600 text-white py-8 rounded-[40px] font-black uppercase text-sm shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]">Сохранить все изменения</button>
                   </div>
                </form>
             </div>
          </div>
        )}

        {/* COPY MODAL */}
        {copyTarget && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[250] flex items-center justify-center p-6">
              <div className="bg-white rounded-[56px] w-full max-w-md p-12 shadow-2xl animate-in zoom-in duration-300">
                 <h3 className="text-2xl font-black text-slate-800 mb-6 text-center">Копировать урок в:</h3>
                 <div className="space-y-3">
                    {groups.filter(g => g.id !== copyTarget.groupId).map(g => (
                      <button key={g.id} onClick={() => copyLessonToGroup(g.id)} className="w-full p-6 bg-slate-50 rounded-[32px] text-left hover:bg-indigo-600 hover:text-white transition-all group">
                         <p className="font-black text-lg">{g.name}</p><p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{g.grade}</p>
                      </button>
                    ))}
                    {groups.filter(g => g.id !== copyTarget.groupId).length === 0 && <p className="text-center text-slate-300 py-10 font-bold uppercase text-[10px]">Нет других групп для копирования</p>}
                    <button onClick={() => setCopyTarget(null)} className="w-full mt-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Отмена</button>
                 </div>
              </div>
           </div>
        )}

      </main>
    </div>
  );
};

export default TeacherDashboard;
