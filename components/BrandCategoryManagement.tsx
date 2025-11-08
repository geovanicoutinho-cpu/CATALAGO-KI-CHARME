import React, { useState, useRef, useEffect } from 'react';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';

interface BrandCategoryManagementProps {
  title: string;
  items: string[];
  onAddItem: (item: string) => void;
  onDeleteItem: (item: string) => void;
  onEditItem: (oldItem: string, newItem: string) => void;
}

const BrandCategoryManagement: React.FC<BrandCategoryManagementProps> = ({ title, items, onAddItem, onDeleteItem, onEditItem }) => {
  const [newItem, setNewItem] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingItem && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingItem]);


  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedItem = newItem.trim();
    if (trimmedItem && !items.find(i => i.toLowerCase() === trimmedItem.toLowerCase())) {
      onAddItem(trimmedItem);
      setNewItem('');
    } else {
        alert(`Este item já existe ou é inválido.`);
    }
  };

  const handleDeleteItem = (item: string) => {
      if (window.confirm(`Tem certeza que deseja remover "${item}"?`)) {
          onDeleteItem(item);
      }
  }

  const handleStartEditing = (item: string) => {
    setEditingItem(item);
    setEditedValue(item);
  };

  const handleCancelEditing = () => {
    setEditingItem(null);
    setEditedValue('');
  };

  const handleSaveEditing = () => {
    if (!editingItem) return;
    const trimmedValue = editedValue.trim();

    if (!trimmedValue) {
        alert("O nome não pode ficar em branco.");
        return;
    }

    const isDuplicate = items.some(i => i.toLowerCase() === trimmedValue.toLowerCase() && i.toLowerCase() !== editingItem.toLowerCase());

    if (!isDuplicate) {
      onEditItem(editingItem, trimmedValue);
      handleCancelEditing();
    } else {
      alert(`O nome "${trimmedValue}" já existe.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEditing();
    } else if (e.key === 'Escape') {
      handleCancelEditing();
    }
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in max-w-2xl mx-auto">
      <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-3 mb-6 pb-6 border-b border-gray-200">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={`Adicionar ${title.slice(0, -1).toLowerCase()}`}
          className="flex-grow mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 sm:text-sm"
          aria-label={`Novo item para ${title}`}
        />
        <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors">
          <PlusIcon />
          Adicionar
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Nenhum item cadastrado.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <li key={item} className="py-3 flex justify-between items-center gap-3">
              {editingItem === item ? (
                <>
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editedValue}
                    onChange={(e) => setEditedValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow mt-1 block w-full rounded-md border-2 border-primary shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 sm:text-sm"
                  />
                  <div className="flex items-center gap-1">
                     <button
                        onClick={handleSaveEditing}
                        className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-full transition-colors"
                        aria-label={`Salvar alteração para ${item}`}
                      >
                        <CheckIcon />
                      </button>
                      <button
                        onClick={handleCancelEditing}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        aria-label="Cancelar edição"
                      >
                        <XIcon />
                      </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-gray-800 font-medium break-all">{item}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={() => handleStartEditing(item)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        aria-label={`Editar ${item}`}
                      >
                        <EditIcon />
                    </button>
                    <button
                        onClick={() => handleDeleteItem(item)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        aria-label={`Remover ${item}`}
                      >
                        <TrashIcon />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BrandCategoryManagement;
