import React, { useState } from 'react';
import XIcon from './icons/XIcon';
import { Logo } from './Logo';

interface UserAuthModalProps {
  onAuth: (name: string, whatsapp: string) => void;
  onClose: () => void;
}

const UserAuthModal: React.FC<UserAuthModalProps> = ({ onAuth, onClose }) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !whatsapp) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    onAuth(name, whatsapp);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm">
        <div className="p-6 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold text-gray-800">Identifique-se para continuar</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100" aria-label="Fechar formulário">
            <XIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
          <div>
            <label htmlFor="name-auth" className="block text-sm font-medium text-gray-700">Seu Nome</label>
            <input 
              type="text" 
              name="name" 
              id="name-auth" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" 
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="whatsapp-auth" className="block text-sm font-medium text-gray-700">Seu WhatsApp</label>
            <input 
              type="tel" 
              name="whatsapp" 
              id="whatsapp-auth" 
              placeholder="(99) 99999-9999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              autoComplete="tel"
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

export default UserAuthModal;