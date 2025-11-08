import React, { useState } from 'react';
import XIcon from './icons/XIcon';
import { Logo } from './Logo';

interface LoginModalProps {
  onLogin: (user: string, pass: string) => void;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    onLogin(username, password);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="p-6 flex justify-between items-center border-b border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-800">Acesso Administrador</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-slate-200/60" aria-label="Fechar formulário">
            <XIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-600">Usuário</label>
            <input 
              type="text" 
              name="username" 
              id="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              className="mt-2 block w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-base text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/30" 
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-slate-600">Senha</label>
            <input 
              type="password" 
              name="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="mt-2 block w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-base text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/30"
              autoComplete="current-password"
            />
          </div>
          <div className="pt-3">
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-hover transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;