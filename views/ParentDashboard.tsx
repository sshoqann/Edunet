
import React, { useState } from 'react';
import { User, UserRole, HomeworkStatus } from '../types';
import { MOCK_USERS, MOCK_LESSONS } from '../data';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ParentDashboardProps {
  user: User;
  onLogout: () => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ user, onLogout }) => {
  const children = MOCK_USERS.filter(u => user.childrenIds?.includes(u.id));
  const [selectedChild, setSelectedChild] = useState<User>(children[0]);

  const progressData = [
    { date: 'Пн', grade: 85 },
    { date: 'Вт', grade: 92 },
    { date: 'Ср', grade: 78 },
    { date: 'Чт', grade: 95 },
    { date: 'Пт', grade: 100 },
  ];

  const getStatusIndicator = (status: HomeworkStatus) => {
    switch(status) {
      case HomeworkStatus.COMPLETE: return '🟢 Выполнено';
      case HomeworkStatus.PARTIAL: return '🟡 Частично';
      default: return '🔴 Не приступал';
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">EN</div>
          <div>
            <h2 className="font-bold text-gray-800 leading-tight">EduNexus</h2>
            <span className="text-xs text-indigo-600 font-medium uppercase">Родитель</span>
          </div>
        </div>

        <div className="p-6 flex-1">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Мои дети</h3>
          <div className="space-y-4">
            {children.map(child => (
              <button 
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedChild.id === child.id ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-gray-50'}`}
              >
                <img src={child.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
                <div className="text-left">
                  <p className="text-sm font-bold truncate">{child.name}</p>
                  <p className="text-[10px] text-gray-500">8 "А" класс</p>
                </div>
              </button>
            ))}
          </div>
        </div>

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
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
           <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                 <h1 className="text-2xl font-black text-gray-800">Успеваемость: {selectedChild.name}</h1>
                 <p className="text-gray-500 text-sm">Общий прогресс за текущую неделю</p>
              </div>
              <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                 <div className="text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Ср. балл</p>
                    <p className="text-xl font-black text-indigo-600">92.4</p>
                 </div>
                 <div className="h-8 w-[1px] bg-gray-100"/>
                 <div className="text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Посещ.</p>
                    <p className="text-xl font-black text-green-600">98%</p>
                 </div>
              </div>
           </header>

           <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Performance Graph */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Динамика оценок</h3>
                  <div className="flex gap-2">
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg font-bold">+5.2% ↑</span>
                  </div>
                </div>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={progressData}>
                      <defs>
                        <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} domain={[0, 100]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="grade" stroke="#4f46e5" fillOpacity={1} fill="url(#colorGrade)" strokeWidth={4} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Sidebars */}
              <div className="space-y-6">
                 <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Статус домашних заданий</h3>
                    <div className="space-y-3">
                       {MOCK_LESSONS.map((l, idx) => (
                         <div key={l.id} className="flex items-center justify-between">
                            <span className="text-sm font-medium truncate flex-1 pr-2">{l.title}</span>
                            <span className="text-[10px] font-bold">
                               {getStatusIndicator(idx === 0 ? HomeworkStatus.PARTIAL : HomeworkStatus.COMPLETE)}
                            </span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg text-white">
                    <h3 className="font-bold mb-2">Комментарий учителя</h3>
                    <p className="text-sm opacity-90 leading-relaxed italic">
                      "Алексей показывает отличные результаты по физике. Особенно хорошо удаются темы по механике. Рекомендую больше практиковаться в решении расчетных задач."
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                       <img src={MOCK_USERS[0].avatar} className="w-6 h-6 rounded-full border border-white/20" />
                       <span className="text-[10px] font-bold opacity-75">Иван Петрович, учитель физики</span>
                    </div>
                 </div>
              </div>
           </section>

           <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="font-bold text-gray-800">Журнал за последние 7 дней</h3>
                 <button className="text-indigo-600 text-xs font-bold hover:underline">Скачать полный отчет (PDF)</button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400">
                       <tr>
                          <th className="px-6 py-4">Дата</th>
                          <th className="px-6 py-4">Тема</th>
                          <th className="px-6 py-4">Оценка</th>
                          <th className="px-6 py-4">Посещение</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {MOCK_LESSONS.map(l => (
                          <tr key={l.id} className="text-sm">
                             <td className="px-6 py-4 text-gray-500 font-medium">{l.date}</td>
                             <td className="px-6 py-4 font-bold">{l.title}</td>
                             <td className="px-6 py-4">
                                <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-black tracking-tighter">95/100</span>
                             </td>
                             <td className="px-6 py-4 text-green-500 font-bold text-xs uppercase">Присутствовал</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </section>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
