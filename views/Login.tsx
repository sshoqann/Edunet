
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../data';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simplified login logic: find user by role from mock data
    const user = MOCK_USERS.find(u => u.role === selectedRole);
    if (user) {
      onLogin(user);
    }
  };

  const roles = [
    { type: UserRole.STUDENT, label: 'Ученик', icon: '🎓' },
    { type: UserRole.TEACHER, label: 'Учитель', icon: '👨‍🏫' },
    { type: UserRole.PARENT, label: 'Родитель', icon: '👨‍👩‍👧' },
  ];

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
            EN
          </div>
          <h1 className="text-2xl font-bold text-gray-800">EduNexus</h1>
          <p className="text-gray-500 text-sm">Образовательная платформа будущего</p>
        </div>

        <div className="flex justify-between mb-8 gap-2">
          {roles.map((r) => (
            <button
              key={r.type}
              onClick={() => setSelectedRole(r.type)}
              className={`flex-1 py-3 px-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                selectedRole === r.type
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                  : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
              }`}
            >
              <span className="text-2xl">{r.icon}</span>
              <span className="text-xs font-semibold uppercase">{r.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="user@edu.com"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition-all transform active:scale-[0.98]"
          >
            Войти в систему
          </button>
        </form>
        
        <p className="mt-6 text-center text-xs text-gray-400">
          Забыли пароль? Обратитесь к администратору школы.
        </p>
      </div>
    </div>
  );
};

export default Login;
