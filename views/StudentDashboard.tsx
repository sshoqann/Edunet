
import React, { useState, useEffect } from 'react';
import { User, LessonPlan, Subject, Submission, ChatMessage } from '../types';
import { MOCK_LESSONS, MOCK_SUBJECTS } from '../data';
import DrawingTask from '../components/DrawingTask';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'homework' | 'grades'>('homework');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonPlan | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('school_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentQuizStep, setCurrentQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Sync lessons from teacher (simulated with localStorage)
  const lessons: LessonPlan[] = JSON.parse(localStorage.getItem('school_lessons') || JSON.stringify(MOCK_LESSONS));

  const handleUploadHW = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedLesson || !e.target.files?.[0]) return;
    const url = URL.createObjectURL(e.target.files[0]);
    const newSub: Submission = { id: `s_${Date.now()}`, studentId: user.id, lessonId: selectedLesson.id, homeworkImageUrl: url, testFinished: false };
    const updated = [...submissions.filter(s => !(s.studentId === user.id && s.lessonId === selectedLesson.id)), newSub];
    setSubmissions(updated);
    localStorage.setItem('school_submissions', JSON.stringify(updated));
    alert('Домашнее задание успешно отправлено!');
  };

  const submitQuiz = () => {
    if (!selectedLesson) return;
    let correct = 0;
    selectedLesson.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) correct++;
    });
    const score = Math.round((correct / selectedLesson.questions.length) * 100);
    
    const newSub: Submission = { 
      id: `s_${Date.now()}`, 
      studentId: user.id, 
      lessonId: selectedLesson.id, 
      testScore: score, 
      testFinished: true,
      homeworkImageUrl: submissions.find(s => s.lessonId === selectedLesson.id)?.homeworkImageUrl
    };
    
    const updated = [...submissions.filter(s => !(s.studentId === user.id && s.lessonId === selectedLesson.id)), newSub];
    setSubmissions(updated);
    localStorage.setItem('school_submissions', JSON.stringify(updated));
    setIsQuizFinished(true);
  };

  const startQuiz = () => {
    setCurrentQuizStep(0);
    setQuizAnswers([]);
    setIsQuizFinished(false);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl">
        <div className="p-8 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg shadow-indigo-100">EN</div>
          <div><h2 className="font-black text-lg text-slate-800 tracking-tight">EduNexus</h2><span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Кабинет ученика</span></div>
        </div>
        <nav className="flex-1 py-8 px-4 space-y-2">
          <button onClick={() => { setActiveTab('homework'); setSelectedSubject(null); setSelectedLesson(null); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'homework' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}>📚 Моё обучение</button>
          <button onClick={() => setActiveTab('grades')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === 'grades' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}>📊 Мои оценки</button>
        </nav>
        <div className="p-8 border-t border-slate-100">
          <div className="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-[24px]"><img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" /><div><p className="text-xs font-black truncate text-slate-800">{user.name}</p><p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{user.grade}</p></div></div>
          <button onClick={onLogout} className="w-full py-3 border border-red-50 rounded-xl text-[10px] text-red-400 hover:bg-red-50 font-black uppercase tracking-widest transition-all">Выйти</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 bg-slate-50">
        {activeTab === 'homework' && (
          <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
            {!selectedSubject ? (
              <>
                <header className="mb-10"><h1 className="text-4xl font-black text-slate-800 tracking-tight">Твои предметы</h1><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 ml-1">Выбери дисциплину для изучения материалов</p></header>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {MOCK_SUBJECTS.map(s => (
                    <button key={s.id} onClick={() => setSelectedSubject(s)} className="group bg-white p-8 rounded-[48px] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all text-left relative overflow-hidden">
                      <div className={`w-16 h-16 ${s.color} rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-lg text-white group-hover:scale-110 transition-transform`}>{s.icon}</div>
                      <h3 className="font-black text-xl text-slate-800 mb-2">{s.name}</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Перейти к урокам →</p>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Lesson List */}
                <div className="lg:col-span-1 space-y-4">
                  <button onClick={() => setSelectedSubject(null)} className="text-[10px] font-black text-indigo-600 uppercase mb-4 flex items-center gap-2 hover:bg-indigo-50 p-3 rounded-xl transition-all w-fit">← К предметам</button>
                  <div className="flex items-center gap-4 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-8"><div className={`w-12 h-12 ${selectedSubject.color} rounded-2xl flex items-center justify-center text-2xl text-white shadow-md`}>{selectedSubject.icon}</div><h2 className="text-2xl font-black text-slate-800">{selectedSubject.name}</h2></div>
                  <div className="space-y-4">
                    {lessons.filter(l => l.subjectId === selectedSubject.id).map(l => (
                      <button key={l.id} onClick={() => { setSelectedLesson(l); setIsQuizFinished(false); }} className={`w-full p-6 rounded-[32px] border-2 text-left transition-all relative overflow-hidden flex items-center gap-4 ${selectedLesson?.id === l.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-50 hover:border-slate-200'}`}>
                        <div className={`w-3 h-3 rounded-full ${l.isStarted ? 'bg-green-400 animate-pulse' : 'bg-slate-300'}`} />
                        <div className="flex-1 min-w-0"><p className="font-black text-sm truncate">{l.title}</p><p className={`text-[9px] font-black uppercase tracking-widest mt-1 opacity-60`}>{l.date}</p></div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Lesson Content */}
                <div className="lg:col-span-2">
                  {selectedLesson ? (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
                         <div className="flex justify-between items-start">
                            <h2 className="text-4xl font-black text-slate-800 leading-tight tracking-tight">{selectedLesson.title}</h2>
                            {selectedLesson.isStarted && <span className="bg-green-100 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase animate-bounce shadow-sm">Урок идет</span>}
                         </div>
                         <p className="text-slate-500 font-medium leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100">{selectedLesson.description}</p>
                         
                         {/* Online Links and Chat */}
                         {selectedLesson.isStarted && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {selectedLesson.videoUrl && <a href={selectedLesson.videoUrl} target="_blank" className="bg-slate-900 text-white p-6 rounded-[32px] flex justify-between items-center group hover:scale-[1.02] transition-all shadow-xl shadow-slate-100"><span className="font-black text-xs uppercase tracking-widest">Смотреть Видеоурок</span><span className="text-2xl">📽️</span></a>}
                               {selectedLesson.meetingLink && <a href={selectedLesson.meetingLink} target="_blank" className="bg-blue-600 text-white p-6 rounded-[32px] flex justify-between items-center group hover:scale-[1.02] transition-all shadow-xl shadow-blue-100"><span className="font-black text-xs uppercase tracking-widest">Войти в Google Meet</span><span className="text-2xl">🌐</span></a>}
                               {selectedLesson.zoomLink && <a href={selectedLesson.zoomLink} target="_blank" className="bg-indigo-600 text-white p-6 rounded-[32px] flex justify-between items-center group hover:scale-[1.02] transition-all shadow-xl shadow-indigo-100"><span className="font-black text-xs uppercase tracking-widest">Войти в Zoom</span><span className="text-2xl">🎥</span></a>}
                            </div>
                         )}

                         {/* Teacher Live Chat Links */}
                         {selectedLesson.isStarted && selectedLesson.chat && selectedLesson.chat.length > 0 && (
                            <div className="bg-indigo-50/50 p-8 rounded-[40px] border-2 border-indigo-100 space-y-4">
                               <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Ссылки и материалы от учителя:</h4>
                               <div className="space-y-3">
                                  {selectedLesson.chat.map(m => (
                                     <div key={m.id} className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-50 flex justify-between items-center group hover:border-indigo-200 transition-all">
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed truncate pr-4">{m.text}</p>
                                        <button className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg uppercase whitespace-nowrap">Открыть</button>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         )}

                         <div className="p-10 bg-slate-50 rounded-[40px] space-y-8 border border-slate-100 shadow-inner">
                            <h3 className="text-2xl font-black text-slate-800">Домашнее задание</h3>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">"{selectedLesson.newHomework}"</p>
                            
                            <div className="space-y-4">
                               <label className="flex flex-col items-center justify-center border-4 border-dashed border-slate-200 p-12 rounded-[40px] cursor-pointer hover:border-indigo-400 hover:bg-white transition-all text-slate-400 hover:text-indigo-600 shadow-sm">
                                  <span className="text-5xl mb-4">📷</span>
                                  <p className="text-[11px] font-black uppercase tracking-widest">Загрузить фото выполненного ДЗ</p>
                                  <input type="file" className="hidden" accept="image/*" onChange={handleUploadHW} />
                               </label>
                               {submissions.find(s => s.studentId === user.id && s.lessonId === selectedLesson.id)?.homeworkImageUrl && (
                                 <div className="flex items-center gap-3 bg-green-50 text-green-600 p-4 rounded-2xl border border-green-100 font-black text-[10px] uppercase tracking-widest animate-in fade-in">
                                    <span>✅ Работа успешно загружена</span>
                                 </div>
                               )}
                            </div>
                         </div>

                         {/* Drawing Task */}
                         {selectedLesson.isDrawingEnabled && (
                           <div className="space-y-6">
                              <h3 className="text-2xl font-black text-slate-800">Графическое задание</h3>
                              <DrawingTask baseImage={selectedLesson.drawingBaseImage} onSave={(data) => console.log('Drawing submitted', data)} />
                              <button className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200">Отправить рисунок</button>
                           </div>
                         )}

                         {/* Test / Quiz Section */}
                         <div className="p-10 bg-white border-2 border-slate-100 rounded-[48px] space-y-8 shadow-sm">
                            <h3 className="text-2xl font-black text-slate-800">Проверка знаний</h3>
                            
                            {selectedLesson.quizFile ? (
                              <div className="p-10 bg-indigo-50 rounded-[40px] text-center border-2 border-indigo-100 animate-in zoom-in duration-300">
                                 <span className="text-5xl mb-4 block">📄</span>
                                 <p className="text-lg font-black text-indigo-700 uppercase mb-4 tracking-tight">Задание в файле</p>
                                 <a href={selectedLesson.quizFile} download className="inline-block bg-indigo-600 text-white px-10 py-5 rounded-3xl text-xs font-black uppercase shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">Скачать файл задания</a>
                              </div>
                            ) : selectedLesson.questions.length > 0 ? (
                              <div className="space-y-6">
                                {isQuizFinished || submissions.find(s => s.lessonId === selectedLesson.id && s.testFinished) ? (
                                  <div className="p-10 bg-green-50 rounded-[40px] text-center border-2 border-green-100 animate-in zoom-in duration-500">
                                     <span className="text-6xl mb-6 block">🏆</span>
                                     <h4 className="text-3xl font-black text-green-600 mb-2">Тест завершен!</h4>
                                     <p className="text-sm font-bold text-green-700 uppercase tracking-widest">Твой результат: {submissions.find(s => s.lessonId === selectedLesson.id)?.testScore}%</p>
                                     <button onClick={startQuiz} className="mt-8 text-[10px] font-black uppercase text-green-600 hover:underline">Пройти еще раз</button>
                                  </div>
                                ) : (
                                  <div className="space-y-8 animate-in slide-in-from-bottom-4">
                                     <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>Вопрос {currentQuizStep + 1} из {selectedLesson.questions.length}</span>
                                        <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 transition-all" style={{width: `${((currentQuizStep + 1) / selectedLesson.questions.length) * 100}%`}}></div></div>
                                     </div>

                                     <div className="space-y-6">
                                        <h4 className="text-xl font-black text-slate-800 leading-tight">{selectedLesson.questions[currentQuizStep].text}</h4>
                                        {selectedLesson.questions[currentQuizStep].mediaUrl && (
                                          <div className="rounded-3xl overflow-hidden border-4 border-slate-50 shadow-sm">
                                             <img src={selectedLesson.questions[currentQuizStep].mediaUrl} className="w-full max-h-64 object-cover" />
                                          </div>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                           {selectedLesson.questions[currentQuizStep].options.map((opt, idx) => (
                                              <button 
                                                key={idx} 
                                                onClick={() => {
                                                   const newAns = [...quizAnswers];
                                                   newAns[currentQuizStep] = idx;
                                                   setQuizAnswers(newAns);
                                                }}
                                                className={`p-6 rounded-[32px] text-sm font-bold text-left transition-all border-4 ${quizAnswers[currentQuizStep] === idx ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 border-transparent hover:bg-slate-100 text-slate-700'}`}
                                              >
                                                 <span className="mr-3 opacity-40 uppercase">{String.fromCharCode(65 + idx)}.</span> {opt}
                                              </button>
                                           ))}
                                        </div>
                                     </div>

                                     <div className="flex justify-between">
                                        <button disabled={currentQuizStep === 0} onClick={() => setCurrentQuizStep(currentQuizStep - 1)} className="px-8 py-4 bg-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 disabled:opacity-0 transition-all">Назад</button>
                                        {currentQuizStep === selectedLesson.questions.length - 1 ? (
                                           <button onClick={submitQuiz} className="px-12 py-4 bg-green-600 text-white rounded-3xl text-[10px] font-black uppercase shadow-xl shadow-green-100 hover:bg-green-700 transition-all">Завершить тест</button>
                                        ) : (
                                           <button disabled={quizAnswers[currentQuizStep] === undefined} onClick={() => setCurrentQuizStep(currentQuizStep + 1)} className="px-12 py-4 bg-indigo-600 text-white rounded-3xl text-[10px] font-black uppercase shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50">Далее</button>
                                        )}
                                     </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-center py-10 text-slate-300 font-bold uppercase text-[10px] tracking-widest">Для этого урока тест не предусмотрен</p>
                            )}
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[600px] flex flex-col items-center justify-center text-slate-200 border-4 border-dashed border-slate-100 rounded-[64px] bg-white animate-pulse">
                      <div className="text-8xl mb-8 opacity-5">📖</div>
                      <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Выбери тему для изучения</h3>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'grades' && (
           <div className="animate-in fade-in duration-500 space-y-10">
              <header><h1 className="text-4xl font-black text-slate-800 tracking-tight">Твой прогресс</h1><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 ml-1">История твоих успехов в обучении</p></header>
              <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden p-8">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr><th className="px-8 py-6">Предмет</th><th className="px-8 py-6">Тема</th><th className="px-8 py-6 text-center">Балл</th><th className="px-8 py-6 text-center">Статус</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {lessons.map(l => (
                      <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-black text-slate-800 text-sm">{MOCK_SUBJECTS.find(s => s.id === l.subjectId)?.name}</td>
                        <td className="px-8 py-6"><p className="text-sm font-bold text-slate-700">{l.title}</p><p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{l.date}</p></td>
                        <td className="px-8 py-6 text-center"><span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black shadow-sm">95 / 100</span></td>
                        <td className="px-8 py-6 text-center"><span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Присутствовал</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
