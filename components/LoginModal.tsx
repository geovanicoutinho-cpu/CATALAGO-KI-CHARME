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
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm">
        <div className="p-6 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold text-gray-800">Acesso Administrador</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100" aria-label="Fechar formulário">
            <XIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuário</label>
            <input 
              type="text" 
              name="username" 
              id="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" 
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700">Senha</label>
            <input 
              type="password" 
              name="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              autoComplete="current-password"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-primary text-white py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
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
