import React from 'react';

interface MarcaFilterProps {
  marcas: string[];
  selectedMarca: string | null;
  onMarcaSelect: (marca: string) => void;
}

const MarcaFilter: React.FC<MarcaFilterProps> = ({ marcas, selectedMarca, onMarcaSelect }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">MARCAS</h3>
      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {marcas.map(marca => {
          const isSelected = selectedMarca === marca;
          return (
            <button
              key={marca}
              onClick={() => onMarcaSelect(marca)}
              className={`w-24 h-24 rounded-full text-center p-2 text-sm font-semibold uppercase tracking-wider transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-center transform hover:scale-105
                ${
                  isSelected
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-gray-800 border-2 border-gray-200 hover:bg-gray-100 hover:shadow-md hover:border-primary'
                }`}
              title={`Filtrar por ${marca}`}
            >
              <span>{marca}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MarcaFilter;