import React, { useRef } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface FeaturedCarouselProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  isUserLoggedIn: boolean;
  onLoginClick: () => void;
  onSetMarca: (marca: string) => void;
  onSetCategory: (category: string) => void;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ 
    products, 
    onAddToCart, 
    onViewDetails, 
    isUserLoggedIn, 
    onLoginClick,
    onSetMarca,
    onSetCategory
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Produtos em Destaque</h2>
        <div className="hidden sm:flex items-center gap-2">
          <button 
            onClick={() => scroll('left')} 
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors border"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeftIcon />
          </button>
          <button 
            onClick={() => scroll('right')} 
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors border"
            aria-label="Rolar para direita"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
        >
          {products.map((product, index) => (
            <div key={product.id} className="flex-shrink-0 w-64 md:w-72">
                 <ProductCard
                    product={product}
                    index={index}
                    onAddToCart={onAddToCart}
                    onViewDetails={onViewDetails}
                    isUserLoggedIn={isUserLoggedIn}
                    onLoginClick={onLoginClick}
                    onSetMarca={onSetMarca}
                    onSetCategory={onSetCategory}
                />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCarousel;

// Adiciona CSS para esconder a barra de rolagem (opcional, mas melhora a estética)
const style = document.createElement('style');
style.textContent = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
document.head.append(style);
