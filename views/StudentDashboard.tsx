
import React, { useState } from 'react';
import { User, LessonPlan, HomeworkStatus, Subject } from '../types';
import { MOCK_LESSONS, MOCK_QUIZ, MOCK_SUBJECTS } from '../data';
import DrawingTask from '../components/DrawingTask';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'homework' | 'tests' | 'grades'>('homework');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonPlan | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizResults, setQuizResults] = useState<{ score: number, total: number } | null>(null);

  const getStatusColor = (status: HomeworkStatus) => {
    switch(status) {
      case HomeworkStatus.COMPLETE: return 'bg-green-500';
      case HomeworkStatus.PARTIAL: return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  // Filter lessons based on selected subject
  const filteredLessons = selectedSubject 
    ? MOCK_LESSONS.filter(l => l.subjectId === selectedSubject.id)
    : [];

  const handleFinishQuiz = () => {
    setQuizResults({ score: 2, total: 2 });
    setQuizStarted(false);
  };

  const resetSelection = () => {
    setSelectedSubject(null);
    setSelectedLesson(null);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">EN</div>
          <div>
            <h2 className="font-bold text-gray-800 leading-tight">EduNexus</h2>
            <span className="text-xs text-indigo-600 font-medium">УЧЕНИК</span>
          </div>
        </div>

        <nav className="flex-1 py-4">
          <button 
            onClick={() => { setActiveTab('homework'); resetSelection(); }}
            className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'homework' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            📚 Мои предметы
          </button>
          <button 
            onClick={() => setActiveTab('tests')}
            className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'tests' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            🧩 Тесты
          </button>
          <button 
            onClick={() => setActiveTab('grades')}
            className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'grades' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            📊 Успеваемость
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <img src={user.avatar} className="w-8 h-8 rounded-full" alt="" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full text-left text-sm text-red-500 hover:text-red-700 font-medium px-2 py-1">
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {activeTab === 'homework' && (
          <div className="max-w-6xl mx-auto">
            {!selectedSubject ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h1 className="text-2xl font-bold mb-8 text-gray-800">Выберите предмет</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {MOCK_SUBJECTS.map(subject => (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject)}
                      className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left"
                    >
                      <div className={`w-14 h-14 ${subject.color} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-100`}>
                        {subject.icon}
                      </div>
                      <h3 className="font-bold text-lg text-gray-800">{subject.name}</h3>
                      <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">2 задания</p>
                      <div className="mt-4 flex -space-x-2">
                         <div className="w-2 h-2 rounded-full bg-red-500 border border-white"/>
                         <div className="w-2 h-2 rounded-full bg-yellow-500 border border-white"/>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                <div className="lg:col-span-1 space-y-4">
                  <button 
                    onClick={() => setSelectedSubject(null)}
                    className="text-sm font-bold text-indigo-600 flex items-center gap-2 mb-4 hover:underline"
                  >
                    ← Назад к предметам
                  </button>
                  <div className="flex items-center gap-3 mb-6">
                     <div className={`w-10 h-10 ${selectedSubject.color} rounded-xl flex items-center justify-center text-xl`}>
                        {selectedSubject.icon}
                     </div>
                     <h1 className="text-2xl font-bold">{selectedSubject.name}</h1>
                  </div>
                  
                  <div className="space-y-3">
                    {filteredLessons.map(lesson => (
                      <button 
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        className={`w-full text-left bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 transition-all ${selectedLesson?.id === lesson.id ? 'ring-2 ring-indigo-500 shadow-md scale-[1.02]' : 'hover:border-gray-300'}`}
                      >
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(lesson.id === 'l1' ? HomeworkStatus.PARTIAL : HomeworkStatus.NOT_DONE)}`} />
                        <div className="flex-1">
                           <p className="font-bold text-sm text-gray-800">{lesson.title}</p>
                           <p className="text-[10px] text-gray-400 uppercase font-bold">{lesson.date}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  {selectedLesson ? (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm mb-6">
                         <h2 className="text-2xl font-bold mb-4">{selectedLesson.title}</h2>
                         <p className="text-gray-500 mb-6 text-sm">{selectedLesson.description}</p>
                         
                         <h3 className="font-bold text-gray-800 mb-2">Видеоурок</h3>
                         <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 mb-8">
                            {selectedLesson.videoUrl ? (
                              <iframe width="100%" height="100%" src={selectedLesson.videoUrl} title="Video" frameBorder="0" allowFullScreen></iframe>
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400 italic">Видео к этому уроку не добавлено</div>
                            )}
                         </div>

                         <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                            <h3 className="font-bold text-gray-800 mb-2">Домашнее задание</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{selectedLesson.newHomework}</p>
                         </div>

                         <DrawingTask onSave={(data) => console.log('Submission', data)} />
                         
                         <button className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]">
                            Отправить выполненное задание
                         </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-3xl">
                      <div className="text-5xl mb-4 opacity-20">📖</div>
                      <p className="font-medium">Выберите тему урока из списка слева</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="max-w-3xl mx-auto py-12">
            {!quizStarted && !quizResults && (
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-center">
                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner">🧩</div>
                <h1 className="text-2xl font-bold mb-2">{MOCK_QUIZ.title}</h1>
                <p className="text-gray-500 mb-6 font-medium">Количество вопросов: {MOCK_QUIZ.questions.length}</p>
                <button 
                  onClick={() => setQuizStarted(true)}
                  className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                >
                  Начать тестирование
                </button>
              </div>
            )}

            {quizStarted && (
              <div className="space-y-6 animate-in zoom-in duration-300">
                {MOCK_QUIZ.questions.map((q, idx) => (
                  <div key={q.id} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                       <div>
                         <p className="text-xs font-black text-indigo-600 mb-1 uppercase tracking-tighter">Вопрос {idx + 1}</p>
                         <h3 className="text-xl font-bold text-gray-800">{q.text}</h3>
                       </div>
                    </div>

                    {/* Media Display in Quiz */}
                    {(q.mediaUrl || (idx === 0)) && ( // Simulate media for first question as example
                      <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                        {idx === 0 ? (
                           <div className="p-4 flex flex-col items-center">
                             <img src="https://picsum.photos/seed/physics/600/300" className="rounded-xl w-full max-h-64 object-cover mb-2" alt="Question media" />
                             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Изучите изображение для ответа</span>
                           </div>
                        ) : q.mediaType === 'image' ? (
                          <img src={q.mediaUrl} className="w-full max-h-64 object-cover" alt="Question media" />
                        ) : q.mediaType === 'video' ? (
                          <video src={q.mediaUrl} className="w-full max-h-64 object-cover" controls autoPlay loop muted />
                        ) : null}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt, oIdx) => (
                        <button key={oIdx} className="text-left p-5 rounded-2xl border-2 border-gray-50 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-sm font-semibold text-gray-700">
                          <span className="inline-block w-6 h-6 rounded-lg bg-gray-100 text-[10px] text-center leading-6 mr-3 font-black text-gray-400">{String.fromCharCode(65 + oIdx)}</span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button 
                  onClick={handleFinishQuiz}
                  className="w-full bg-green-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-green-100 hover:bg-green-700 transition-all active:scale-[0.98]"
                >
                  Завершить и получить результат
                </button>
              </div>
            )}

            {quizResults && (
              <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-xl text-center animate-in scale-in duration-300">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">🎯</div>
                <h1 className="text-2xl font-bold mb-2 text-gray-800">Отличный результат!</h1>
                <p className="text-5xl font-black text-indigo-600 mb-8">{quizResults.score} / {quizResults.total}</p>
                
                <div className="p-6 bg-slate-50 rounded-2xl mb-8 text-left border border-slate-100">
                  <h4 className="text-xs font-black uppercase text-gray-400 mb-4">Обратная связь</h4>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-600 leading-relaxed">Вы успешно справились с визуальным тестом! Ваши навыки анализа изображений и видео по теме урока на высоком уровне.</p>
                  </div>
                </div>

                <button 
                  onClick={() => setQuizResults(null)}
                  className="text-gray-400 font-bold hover:text-indigo-600 transition-colors uppercase text-xs tracking-widest"
                >
                  Закрыть результаты
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'grades' && (
           <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                 <h1 className="text-2xl font-bold">Табель успеваемости</h1>
                 <div className="flex gap-2">
                    <span className="bg-white px-3 py-1 rounded-full text-xs font-bold border">Все предметы</span>
                 </div>
              </div>
              
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 text-left border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Предмет</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Тема</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Оценка</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Статус</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Комментарий</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {MOCK_LESSONS.map(lesson => (
                      <tr key={lesson.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-6 py-4">
                           <span className="text-xs font-black bg-gray-100 px-2 py-1 rounded-lg uppercase">
                              {MOCK_SUBJECTS.find(s => s.id === lesson.subjectId)?.name}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <p className="font-bold text-sm text-gray-800">{lesson.title}</p>
                           <p className="text-[10px] text-gray-400 font-bold">{lesson.date}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">95/100</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-xs font-bold text-green-600">✅ Присутствовал</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 italic font-medium">"Прекрасная работа с визуальным материалом."</td>
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
