import React from 'react';
import { CartItem } from '../types';
import XIcon from './icons/XIcon';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';
import TrashIcon from './icons/TrashIcon';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  isUserLoggedIn: boolean;
  onLoginClick: () => void;
  subtotal: number;
  discountAmount: number;
  total: number;
}

const Cart: React.FC<CartProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isUserLoggedIn,
  onLoginClick,
  subtotal,
  discountAmount,
  total,
}) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        <div className="p-6 flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold text-gray-800">Seu Carrinho</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100" aria-label="Fechar carrinho">
            <XIcon />
          </button>
        </div>
        {cartItems.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
            <p className="text-gray-500 text-lg">Seu carrinho está vazio.</p>
            <button onClick={onClose} className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">
              Continuar Comprando
            </button>
          </div>
        ) : (
          <>
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-md object-cover" />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    {isUserLoggedIn ? (
                      <p className="text-primary font-bold text-sm">
                        {formatCurrency(item.price)}
                      </p>
                    ) : (
                       <button
                          onClick={onLoginClick}
                          className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1 hover:bg-gray-200 hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          Faça login para ver o preço
                       </button>
                    )}
                    <div className="flex items-center mt-2">
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300" aria-label="Diminuir quantidade">
                        <MinusIcon />
                      </button>
                      <span className="px-3 font-semibold">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300" aria-label="Aumentar quantidade">
                        <PlusIcon />
                      </button>
                    </div>
                  </div>
                  <button onClick={() => onRemoveItem(item.id)} className="text-gray-400 hover:text-red-500" aria-label={`Remover ${item.name}`}>
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-6 border-t bg-gray-50 space-y-3">
               <div className="flex justify-between items-center text-gray-600">
                <span>Subtotal</span>
                <span>{isUserLoggedIn ? formatCurrency(subtotal) : '-'}</span>
              </div>
              
              {discountAmount > 0 && isUserLoggedIn && (
                <div className="flex justify-between items-center text-green-600 font-semibold">
                  <span>Descontos Aplicados</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-lg font-semibold text-gray-800">Total</span>
                {isUserLoggedIn ? (
                  <span className="text-2xl font-extrabold text-primary">{formatCurrency(total)}</span>
                ) : (
                  <span className="text-sm font-semibold text-gray-700">Faça login para ver</span>
                )}
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-accent text-white py-3 rounded-lg font-semibold text-lg hover:bg-accent-hover transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isUserLoggedIn ? 'Finalizar Compra' : 'Fazer Login para Continuar'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;
