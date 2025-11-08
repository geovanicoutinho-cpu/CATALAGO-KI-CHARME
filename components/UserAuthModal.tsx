import React, { useState } from 'react';
import XIcon from './icons/XIcon';
import { Logo } from './Logo';

interface UserAuthModalProps {
  onLogin: (whatsapp: string) => void;
  onRegister: (name: string, whatsapp: string) => void;
  onClose: () => void;
}

const UserAuthModal: React.FC<UserAuthModalProps> = ({ onLogin, onRegister, onClose }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (view === 'login') {
      if (!whatsapp) {
        setError('Por favor, informe seu número de WhatsApp.');
        return;
      }
      onLogin(whatsapp);
    } else { // register
      if (!name || !whatsapp) {
        setError('Por favor, preencha todos os campos.');
        return;
      }
      onRegister(name, whatsapp);
    }
  };
  
  const handleSwitchView = (newView: 'login' | 'register') => {
      setView(newView);
      setError('');
      setName('');
      setWhatsapp('');
  }

  const inputStyle = "mt-2 block w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-base text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/30";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-slate-200">
           <h2 className="text-2xl font-semibold text-slate-800">
             {view === 'login' ? 'Bem-vindo(a)!' : 'Crie sua conta'}
           </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-slate-200/60" aria-label="Fechar formulário">
            <XIcon />
          </button>
        </div>

        <div className="flex border-b border-slate-200">
            <button
                onClick={() => handleSwitchView('login')}
                className={`w-1/2 py-4 text-sm font-semibold transition-colors focus:outline-none ${
                    view === 'login' ? 'bg-white text-primary border-b-2 border-primary' : 'text-slate-500 hover:bg-slate-100'
                }`}
            >
                Entrar
            </button>
            <button
                onClick={() => handleSwitchView('register')}
                className={`w-1/2 py-4 text-sm font-semibold transition-colors focus:outline-none ${
                    view === 'register' ? 'bg-white text-primary border-b-2 border-primary' : 'text-slate-500 hover:bg-slate-100'
                }`}
            >
                Cadastrar
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          {error && <p className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg">{error}</p>}
          
          {view === 'register' && (
            <div>
              <label htmlFor="name-auth" className="block text-sm font-medium text-slate-600">Seu Nome</label>
              <input 
                type="text" 
                name="name" 
                id="name-auth" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={view === 'register'}
                className={inputStyle} 
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label htmlFor="whatsapp-auth" className="block text-sm font-medium text-slate-600">Seu WhatsApp</label>
            <input 
              type="tel" 
              name="whatsapp" 
              id="whatsapp-auth" 
              placeholder="(99) 99999-9999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required 
              className={inputStyle}
              autoComplete="tel"
            />
          </div>
          <div className="pt-3">
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-hover transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {view === 'login' ? 'Entrar' : 'Solicitar Acesso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAuthModal;
