import React, { useState, useEffect, useRef } from 'react';
import ShoppingCartIcon from './icons/ShoppingCartIcon';
import { Logo } from './Logo';
import SearchBar from './SearchBar';
import LogoutIcon from './icons/LogoutIcon';
import { User } from '../types';
import UserIcon from './icons/UserIcon';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onGoHome: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showSearchBar: boolean;
  currentUser: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  cartItemCount, 
  onCartClick, 
  onGoHome,
  searchTerm,
  onSearchChange,
  showSearchBar,
  currentUser,
  onLoginClick,
  onLogoutClick,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCartItemCount = useRef(cartItemCount);

  useEffect(() => {
    if (cartItemCount > prevCartItemCount.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300); // duration of the pop animation
      return () => clearTimeout(timer);
    }
    prevCartItemCount.current = cartItemCount;
  }, [cartItemCount]);

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold">
              <button onClick={onGoHome} aria-label="Ki Charme Cosméticos - Página Inicial" className="focus:outline-none focus:ring-2 focus:ring-primary rounded">
                <Logo />
              </button>
            </h1>
          </div>
          
          <div className="flex items-center gap-4 flex-shrink-0">
            {currentUser ? (
               <div className="flex items-center gap-3">
                 <span className="text-sm font-medium text-gray-700 hidden sm:inline">Olá, {currentUser.name}!</span>
                 <button 
                    onClick={onLogoutClick} 
                    className="p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                    aria-label="Sair da conta"
                  >
                   <LogoutIcon />
                 </button>
               </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-primary transition-colors p-2 rounded-lg hover:bg-gray-100"
                aria-label="Entrar ou cadastrar"
              >
                <UserIcon />
                <span className="hidden md:inline">Entrar / Cadastrar</span>
              </button>
            )}

            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            
            <button
              onClick={onCartClick}
              className={`relative text-gray-700 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100 ${isAnimating ? 'animate-pop' : ''}`}
              aria-label="Abrir carrinho"
            >
              <ShoppingCartIcon />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-accent rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {showSearchBar && (
          <div className="mt-4">
            <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;