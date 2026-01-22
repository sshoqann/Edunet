import React, { useState } from 'react';

interface LoginProps {
  onLogin: (loginValue: string, passwordValue: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Передаем введенные данные в функцию handleLogin, которую мы написали в App.tsx
    onLogin(login, password);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black mb-6 shadow-2xl shadow-indigo-200">
            EN
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">EduNexus</h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Smart School Control</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Логин</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Введите логин"
              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
              required
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-3xl shadow-2xl shadow-indigo-100 transition-all transform active:scale-[0.97] uppercase text-xs tracking-widest"
          >
            Войти в систему
          </button>
        </form>
        
        <div className="mt-10 text-center">
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest leading-relaxed">
               Вход через единую базу данных школы
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
