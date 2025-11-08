import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  isAdminMode?: boolean;
  onEdit?: (product: Product) => void;
  onSetBrand?: (brand: string) => void;
  onSetCategory?: (category: string) => void;
  isUserLoggedIn: boolean;
  onLoginClick: () => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onAddToCart, onViewDetails, isAdminMode, onEdit, onSetBrand, onSetCategory, isUserLoggedIn, onLoginClick }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          onAddToCart={onAddToCart}
          onViewDetails={onViewDetails}
          isAdminMode={isAdminMode}
          onEdit={onEdit}
          onSetBrand={onSetBrand}
          onSetCategory={onSetCategory}
          isUserLoggedIn={isUserLoggedIn}
          onLoginClick={onLoginClick}
        />
      ))}
    </div>
  );
};

export default ProductList;