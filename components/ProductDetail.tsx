import React from 'react';
import { Product } from '../types';
import PlusIcon from './icons/PlusIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  isUserLoggedIn: boolean;
  onLoginClick: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose, onAddToCart, isUserLoggedIn, onLoginClick }) => {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);

  const isOutOfStock = product.variants && product.variants.length > 0
    ? product.variants.every(v => v.isOutOfStock)
    : product.isOutOfStock;

  return (
    <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl animate-fade-in">
      <div className="mb-6">
        <button onClick={onClose} className="flex items-center gap-2 text-gray-600 hover:text-primary font-semibold transition-colors">
          <ArrowLeftIcon />
          Voltar ao catálogo
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Image Column */}
        <div className="relative flex items-center justify-center">
          <img src={product.imageUrl} alt={product.name} className={`w-full h-auto object-cover rounded-lg shadow-md aspect-square max-w-md ${isOutOfStock ? 'grayscale' : ''}`} />
          {isOutOfStock && (
             <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg">
                <span className="bg-red-600 text-white text-sm font-bold uppercase px-4 py-1 rounded-full tracking-wider">Esgotado</span>
            </div>
          )}
        </div>
        {/* Details Column */}
        <div className="flex flex-col">
          <span className="inline-block bg-secondary text-primary text-sm font-medium px-3 py-1 rounded-full mb-3 self-start">
            {product.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">{product.name}</h1>
          <p className="text-lg font-semibold text-primary mb-6">{product.brand}</p>
          <p className="text-gray-700 text-base leading-relaxed mb-8 flex-grow">{product.description}</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-4 rounded-lg mt-auto gap-4">
            {isUserLoggedIn ? (
              <span className="text-3xl font-extrabold text-primary">{formattedPrice}</span>
            ) : (
              <button
                onClick={onLoginClick}
                className="text-base font-semibold text-gray-700 hover:text-primary transition-colors"
              >
                Faça login para ver o preço
              </button>
            )}
             <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className={`bg-accent w-full sm:w-auto text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors text-lg shadow-lg transform ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-accent-hover hover:shadow-xl hover:-translate-y-0.5'}`}
            >
              <PlusIcon />
              {isOutOfStock ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;