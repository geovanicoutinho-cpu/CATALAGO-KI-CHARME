import React from 'react';
import SearchIcon from './icons/SearchIcon';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon />
      </div>
      <input
        type="text"
        placeholder="Pesquisar produtos, marcas ou categorias..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
        aria-label="Pesquisar produtos"
      />
    </div>
  );
};

export default SearchBar;