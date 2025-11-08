import React from 'react';
import { Product, Variant, CartItem } from '../types';
import XIcon from './icons/XIcon';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';


interface VariantSelectorProps {
  product: Product;
  onClose: () => void;
  onAddVariant: (product: Product, variant: Variant) => void;
  isUserLoggedIn: boolean;
  onLoginClick: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({ product, onClose, onAddVariant, isUserLoggedIn, onLoginClick, cartItems, onUpdateQuantity }) => {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-6 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold text-gray-800">Selecione uma Variação</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100" aria-label="Fechar seletor">
            <XIcon />
          </button>
        </div>
        
        <div className="p-6 border-b">
            <div className="flex items-start gap-4">
                <img src={product.imageUrl} alt={product.name} className="w-24 h-24 rounded-md object-cover" />
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                    <div className="mt-2">
                      {isUserLoggedIn ? (
                        <p className="text-lg font-bold text-primary">
                          {formattedPrice}
                        </p>
                      ) : (
                        <button
                          onClick={onLoginClick}
                          className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          Faça login para ver o preço
                        </button>
                      )}
                    </div>
                </div>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Cores Disponíveis:</h4>
          <ul className="space-y-2">
            {product.variants?.map(variant => {
              const cartItem = cartItems.find(item => item.id === variant.id);
              const quantityInCart = cartItem?.quantity || 0;
              
              return (
                <li key={variant.id} className={`flex justify-between items-center p-3 rounded-lg ${variant.isOutOfStock ? 'bg-gray-100' : 'bg-gray-50'}`}>
                  <span className={`font-medium ${variant.isOutOfStock ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{variant.name}</span>
                  {variant.isOutOfStock ? (
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">ESGOTADO</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      {quantityInCart > 0 ? (
                        <>
                          <button
                            onClick={() => onUpdateQuantity(variant.id, quantityInCart - 1)}
                            className="bg-gray-200 text-gray-800 rounded-full p-2 flex items-center justify-center shadow-sm hover:bg-gray-300 transition-colors"
                            aria-label={`Remover um ${variant.name} do carrinho`}
                          >
                            <MinusIcon />
                          </button>
                          <span className="font-bold text-lg text-primary w-8 text-center">{quantityInCart}</span>
                          <button
                            onClick={() => onUpdateQuantity(variant.id, quantityInCart + 1)}
                            className="bg-accent text-white rounded-full p-2 flex items-center justify-center shadow-sm hover:bg-accent-hover transition-colors"
                            aria-label={`Adicionar mais um ${variant.name} ao carrinho`}
                          >
                            <PlusIcon />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onAddVariant(product, variant)}
                          className="bg-accent text-white rounded-full p-2 flex items-center justify-center shadow-sm hover:bg-accent-hover transition-colors"
                          aria-label={`Adicionar ${variant.name} ao carrinho`}
                        >
                          <PlusIcon />
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="p-6 border-t bg-gray-50 flex justify-end">
            <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover transition-colors"
            >
                Concluir
            </button>
        </div>
      </div>
    </div>
  );
};

export default VariantSelector;