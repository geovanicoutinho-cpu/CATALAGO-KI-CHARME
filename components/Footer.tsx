import React from 'react';
import UserCogIcon from './icons/UserCogIcon';

interface FooterProps {
  isAdminMode: boolean;
  onAdminClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ isAdminMode, onAdminClick }) => {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm mb-4 sm:mb-0 text-center sm:text-left">
          &copy; {new Date().getFullYear()} KI CHARME COSMETICOS. Todos os direitos reservados.
        </p>
        <button
          onClick={onAdminClick}
          className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
          aria-label={isAdminMode ? "Sair do modo administrador" : "Entrar no modo administrador"}
        >
          <UserCogIcon />
          <span>{isAdminMode ? 'Sair do Modo Admin' : 'Acesso Administrador'}</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
