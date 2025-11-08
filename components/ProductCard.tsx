import React from 'react';
import { Product } from '../types';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';

interface ProductCardProps {
  product: Product;
  index: number;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  isAdminMode?: boolean;
  onEdit?: (product: Product) => void;
  onSetMarca?: (marca: string) => void;
  onSetCategory?: (category: string) => void;
  isUserLoggedIn: boolean;
  onLoginClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index, onAddToCart, onViewDetails, isAdminMode, onEdit, onSetMarca, onSetCategory, isUserLoggedIn, onLoginClick }) => {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);

  const isOutOfStock = product.variants && product.variants.length > 0
    ? product.variants.every(v => v.isOutOfStock)
    : product.isOutOfStock;

  const handleCardClick = () => {
    if (!isAdminMode) {
      onViewDetails(product);
    }
  };

  const handleMarcaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSetMarca?.(product.marca);
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSetCategory?.(product.category);
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
    >
      <div onClick={handleCardClick} className="cursor-pointer">
        <div className="relative overflow-hidden aspect-[1/1]">
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${isOutOfStock ? 'grayscale' : ''}`}
          />
          {isOutOfStock && (
             <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <span className="bg-red-600 text-white text-sm font-bold uppercase px-4 py-1 rounded-full tracking-wider">Esgotado</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <div className="flex-grow" onClick={handleCardClick} >
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-1 h-12 sm:h-14 overflow-hidden cursor-pointer">{product.name}</h2>
          <div className="flex items-center mb-2 flex-wrap gap-2">
              <button onClick={handleMarcaClick} className="text-sm font-semibold text-primary mr-2 hover:underline focus:underline focus:outline-none">
                {product.marca}
              </button>
              <button onClick={handleCategoryClick} className="inline-block bg-secondary text-primary text-xs font-medium px-2.5 py-0.5 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary">
                {product.category}
              </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-auto pt-2">
          {(isUserLoggedIn || isAdminMode) ? (
            <span className="text-lg sm:text-xl font-extrabold text-primary">{formattedPrice}</span>
          ) : (
            <button
              onClick={onLoginClick}
              className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Faça login para ver o preço
            </button>
          )}

          {isAdminMode ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit?.(product)}
                className="bg-blue-500 text-white rounded-full p-3 flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors"
                aria-label={`Editar ${product.name}`}
              >
                <EditIcon />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className={`bg-accent text-white rounded-full p-3 flex items-center justify-center shadow-md transition-colors duration-300 transform group-hover:scale-110 ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-accent-hover'}`}
              aria-label={`Adicionar ${product.name} ao carrinho`}
            >
              <PlusIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;