
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../data';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [contactInfo, setContactInfo] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const getUsersFromStorage = (): User[] => {
    const stored = localStorage.getItem('school_users_db');
    return stored ? JSON.parse(stored) : MOCK_USERS;
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsersFromStorage();

    if (isRegistering) {
      // Registration Logic
      const newUser: User = {
        id: `user_${Date.now()}`,
        name,
        contactInfo,
        password,
        role: null,
        isApproved: false,
        isAdmin: false,
        avatar: `https://picsum.photos/seed/${contactInfo}/100`
      };
      const updatedUsers = [...users, newUser];
      localStorage.setItem('school_users_db', JSON.stringify(updatedUsers));
      onLogin(newUser);
    } else {
      // Login Logic with Password Verification
      const foundUser = users.find(u => u.contactInfo === contactInfo);
      
      if (foundUser) {
        if (foundUser.password === password) {
          onLogin(foundUser);
        } else {
          alert('Неверный пароль. Попробуйте снова.');
        }
      } else {
        alert('Пользователь не найден. Пожалуйста, зарегистрируйтесь.');
      }
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-md p-10 rounded-[40px] shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-500 relative z-10 border border-white/20">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white text-4xl font-black mb-6 shadow-2xl shadow-indigo-200 rotate-3 hover:rotate-0 transition-transform cursor-default">
            EN
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">EduNexus</h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Smart School System</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          <button 
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isRegistering ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Вход
          </button>
          <button 
            onClick={() => setIsRegistering(true)}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isRegistering ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {isRegistering && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Как вас зовут?</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ФИО полностью"
                className="w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Телефон или Логин</label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="example@mail.com или admin"
              className="w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
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
              className="w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-indigo-200 transition-all transform active:scale-[0.97] uppercase text-xs tracking-[0.2em]"
          >
            {isRegistering ? 'Создать аккаунт' : 'Войти в EduNexus'}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest leading-relaxed">
          {isRegistering 
            ? 'После регистрации администратор школы должен подтвердить ваш профиль и назначить роль.'
            : 'Забыли данные? Обратитесь к администратору вашего учебного заведения.'}
        </p>
      </div>
    </div>
  );
};

export default Login;
