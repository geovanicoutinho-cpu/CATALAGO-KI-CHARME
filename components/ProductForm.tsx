import React, { useState, useEffect, useRef } from 'react';
import { Product, Variant } from '../types';
import XIcon from './icons/XIcon';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import ImageIcon from './icons/ImageIcon';

interface ProductFormProps {
  product: Product | null;
  onSave: (productData: Omit<Product, 'id'> & { id?: number }) => void;
  onClose: () => void;
  onDelete?: (productId: number) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onClose, onDelete }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    description: '',
    price: 0,
    imageUrl: '',
    isOutOfStock: false,
    variants: [] as Variant[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        brand: product.brand,
        category: product.category,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        isOutOfStock: !!product.isOutOfStock,
        variants: product.variants?.map(v => ({...v, isOutOfStock: !!v.isOutOfStock})) || [],
      });
      setImageFile(null);
    } else {
      setFormData({
        name: '',
        brand: '',
        category: '',
        description: '',
        price: 0,
        imageUrl: '',
        isOutOfStock: false,
        variants: [],
      });
      setImageFile(null);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target;

    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file); // Armazena o arquivo bruto para upload posterior

    // Gera uma pré-visualização local
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, imageUrl: base64String }));
    };
    reader.readAsDataURL(file);
  };
  
  const handleVariantChange = (index: number, value: string) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], name: value };
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };
  
  const handleVariantStockChange = (index: number, checked: boolean) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], isOutOfStock: checked };
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { id: Date.now(), name: '', isOutOfStock: false }],
    }));
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
        alert('Por favor, adicione uma imagem para o produto.');
        return;
    }

    let finalImageUrl = product?.imageUrl || '';

    // LÓGICA PARA BACKEND:
    // Se uma nova imagem foi selecionada (`imageFile` não é nulo),
    // faça o upload dela para o seu serviço de armazenamento (ex: Firebase Storage)
    if (imageFile) {
        // console.log('Fazendo upload do arquivo:', imageFile.name);
        // const uploadedUrl = await uploadImageToCloud(imageFile); // <-- Função de upload (exemplo)
        // finalImageUrl = uploadedUrl;
        console.warn('Simulando upload de imagem. Usando imagem local (base64). Conecte a um backend para uploads reais.');
        finalImageUrl = formData.imageUrl; // Mantém base64 por enquanto
    }

    const dataToSave = {
      ...formData,
      imageUrl: finalImageUrl,
      id: product?.id,
    };
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-6 flex justify-between items-center border-b flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">
            {product ? 'Editar Produto' : 'Adicionar Novo Produto'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100" aria-label="Fechar formulário">
            <XIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Produto</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marca</label>
                <input type="text" name="brand" id="brand" value={formData.brand} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
                <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"></textarea>
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço (R$)</label>
              <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required step="0.01" min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Imagem do Produto</label>
               <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/png, image/jpeg, image/gif, image/webp"
              />
              {formData.imageUrl ? (
                <div className="mt-2 text-center">
                  <img
                    src={formData.imageUrl}
                    alt="Pré-visualização do produto"
                    className="mt-1 mx-auto h-40 w-auto rounded-md object-contain border p-2 bg-gray-50"
                  />
                  <div className="mt-3 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
                    >
                      Alterar Imagem
                    </button>
                     <button
                        type="button"
                        onClick={() => {
                            setFormData(prev => ({ ...prev, imageUrl: '' }));
                            setImageFile(null);
                        }}
                        className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors"
                      >
                        Remover Imagem
                      </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-1 text-center">
                    <ImageIcon />
                    <div className="flex text-sm text-gray-600">
                      <span className="relative bg-white rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none">
                        <span>Adicionar Imagem</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Clique para selecionar um arquivo</p>
                  </div>
                </div>
              )}
            </div>

            {/* Variants Section */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Variações do Produto</h3>
              <div className="space-y-3">
                {formData.variants.map((variant, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Nome da Variação ${index + 1}`}
                      value={variant.name}
                      onChange={(e) => handleVariantChange(index, e.target.value)}
                      className="flex-grow mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                    <label htmlFor={`variant-stock-${index}`} className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                      <span className='whitespace-nowrap'>Esgotado:</span>
                      <div className="relative inline-flex items-center">
                          <input
                              type="checkbox"
                              id={`variant-stock-${index}`}
                              checked={!!variant.isOutOfStock}
                              onChange={(e) => handleVariantStockChange(index, e.target.checked)}
                              className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </div>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                      aria-label={`Remover variação ${index + 1}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors p-2 rounded-md hover:bg-purple-50"
              >
                <PlusIcon />
                Adicionar Variação
              </button>
            </div>

            {(formData.variants.length === 0) && (
              <div>
                  <label htmlFor="isOutOfStock" className="flex items-center justify-between text-sm font-medium text-gray-700 cursor-pointer">
                      <span>Produto Esgotado? (Sem Variações)</span>
                      <div className="relative inline-flex items-center">
                          <input
                              type="checkbox"
                              name="isOutOfStock"
                              id="isOutOfStock"
                              checked={formData.isOutOfStock}
                              onChange={handleChange}
                              className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </div>
                  </label>
              </div>
            )}
          </div>
          <div className="p-6 border-t bg-gray-50 flex justify-between items-center flex-shrink-0">
            <div>
              {product && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(product.id)}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                  aria-label="Excluir produto"
                >
                  <TrashIcon />
                  Excluir
                </button>
              )}
            </div>
            <div className="flex gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover transition-colors">
                    Salvar Produto
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
