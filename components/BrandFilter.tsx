import React from 'react';

interface BrandFilterProps {
  brands: string[];
  selectedBrand: string | null;
  onBrandSelect: (brand: string) => void;
}

const BrandFilter: React.FC<BrandFilterProps> = ({ brands, selectedBrand, onBrandSelect }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">MARCAS</h3>
      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {brands.map(brand => {
          const isSelected = selectedBrand === brand;
          return (
            <button
              key={brand}
              onClick={() => onBrandSelect(brand)}
              className={`w-24 h-24 rounded-full text-center p-2 text-sm font-semibold uppercase tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-center transform hover:scale-105
                ${
                  isSelected
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-gray-800 border-2 border-gray-200 hover:bg-gray-100 hover:shadow-md hover:border-primary'
                }`}
              title={`Filtrar por ${brand}`}
            >
              <span>{brand}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BrandFilter;