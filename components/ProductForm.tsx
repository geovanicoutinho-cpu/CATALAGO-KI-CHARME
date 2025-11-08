import React, { useState, useEffect, useRef } from 'react';
import { Product, Variant, DiscountTier } from '../types';
import XIcon from './icons/XIcon';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import ImageIcon from './icons/ImageIcon';

interface ProductFormProps {
  product: Product | null;
  onSave: (productData: Omit<Product, 'id'> & { id?: string }, imageFile: File | null) => void;
  onClose: () => void;
  onDelete?: (productId: string) => void;
  brands: string[];
  categories: string[];
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onClose, onDelete, brands, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    description: '',
    price: 0,
    imageUrl: '',
    isOutOfStock: false,
    variants: [] as Variant[],
    discounts: [] as DiscountTier[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
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
        discounts: product.discounts?.map(d => ({ ...d, id: Math.random() })) || [],
      });
      setImagePreview(product.imageUrl);
      setImageFile(null);
    } else {
      setFormData({
        name: '',
        brand: brands.length > 0 ? brands[0] : '',
        category: categories.length > 0 ? categories[0] : '',
        description: '',
        price: 0,
        imageUrl: '',
        isOutOfStock: false,
        variants: [],
        discounts: [],
      });
      setImagePreview('');
      setImageFile(null);
    }
  }, [product, brands, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
        setImagePreview(reader.result as string);
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
      variants: [...prev.variants, { id: Date.now().toString(), name: '', isOutOfStock: false }],
    }));
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };
  
  const handleAddDiscountTier = () => {
    setFormData(prev => ({
        ...prev,
        discounts: [...prev.discounts, { id: Date.now(), quantity: 0, value: 0, type: 'percentage' }],
    }));
  };

  const handleRemoveDiscountTier = (index: number) => {
      const newDiscounts = formData.discounts.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, discounts: newDiscounts }));
  };

  const handleDiscountTierChange = (index: number, field: 'quantity' | 'value' | 'type', value: string) => {
      const newDiscounts = [...formData.discounts];
      const targetTier = { ...newDiscounts[index] };
      
      if (field === 'quantity') {
          targetTier.quantity = Math.max(0, parseInt(value, 10) || 0);
      } else if (field === 'value') {
          let numericValue = Math.max(0, parseFloat(value) || 0);
          if (targetTier.type === 'percentage') {
              targetTier.value = numericValue / 100;
          } else {
              targetTier.value = numericValue;
          }
      } else if (field === 'type') {
          targetTier.type = value as 'percentage' | 'value';
          targetTier.value = 0;
      }
      
      newDiscounts[index] = targetTier;
      setFormData(prev => ({ ...prev, discounts: newDiscounts }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Por favor, preencha o nome e a descrição do produto.');
      return;
    }
    if (!imagePreview) {
        alert('Por favor, adicione uma imagem para o produto.');
        return;
    }
    if (!formData.brand || !formData.category) {
        alert('Por favor, selecione uma marca e uma categoria.');
        return;
    }

    const dataToSave = {
      ...formData,
      id: product?.id,
    };
    onSave(dataToSave, imageFile);
  };

  const sectionTitleStyle = "text-lg font-semibold text-slate-700 border-b border-slate-200 pb-3 mb-5";
  const labelStyle = "block text-sm font-medium text-slate-600 mb-1";
  const inputStyle = "block w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-base text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/30";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 flex justify-between items-center border-b border-slate-200 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-slate-800">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-slate-200/60" aria-label="Fechar formulário">
            <XIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
          <div className="flex-grow overflow-y-auto p-6 space-y-8">
            <section>
              <h3 className={sectionTitleStyle}>Informações Básicas</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className={labelStyle}>Nome do Produto</label>
                  <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputStyle} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="brand" className={labelStyle}>Marca</label>
                    <select name="brand" id="brand" value={formData.brand} onChange={handleChange} required className={inputStyle}>
                      <option value="" disabled>Selecione uma marca</option>
                      {brands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="category" className={labelStyle}>Categoria</label>
                    <select name="category" id="category" value={formData.category} onChange={handleChange} required className={inputStyle}>
                      <option value="" disabled>Selecione uma categoria</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className={labelStyle}>Descrição</label>
                  <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} required className={inputStyle}></textarea>
                </div>
                <div>
                  <label htmlFor="price" className={labelStyle}>Preço (R$)</label>
                  <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required step="0.01" min="0" className={inputStyle} />
                </div>
              </div>
            </section>

            <section>
              <h3 className={sectionTitleStyle}>Imagem do Produto</h3>
               <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/png, image/jpeg, image/gif, image/webp"
              />
              {imagePreview ? (
                <div className="flex items-center gap-4">
                  <img
                    src={imagePreview}
                    alt="Pré-visualização"
                    className="h-20 w-20 rounded-lg object-cover border-2 border-slate-200 bg-white p-1"
                  />
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-slate-700 truncate">{imageFile?.name || 'Imagem existente'}</p>
                     <div className="mt-2 flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          Alterar
                        </button>
                         <button
                            type="button"
                            onClick={() => {
                                setImagePreview('');
                                setImageFile(null);
                            }}
                            className="text-sm font-semibold text-red-600 hover:underline"
                          >
                            Remover
                          </button>
                      </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="flex justify-center px-6 py-8 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors bg-white hover:bg-slate-50" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-1 text-center">
                    <ImageIcon />
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold text-primary">Adicionar Imagem</span>
                    </p>
                    <p className="text-xs text-slate-500">Clique para selecionar um arquivo</p>
                  </div>
                </div>
              )}
            </section>

            <section>
              <h3 className={sectionTitleStyle}>Variações e Estoque</h3>
              <div className="space-y-3">
                {formData.variants.map((variant, index) => (
                  <div key={variant.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                    <input
                      type="text"
                      placeholder={`Nome da Variação ${index + 1}`}
                      value={variant.name}
                      onChange={(e) => handleVariantChange(index, e.target.value)}
                      className={`flex-grow ${inputStyle}`}
                    />
                    <label htmlFor={`variant-stock-${index}`} className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer">
                      <span className='whitespace-nowrap'>Esgotado</span>
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
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-200/60 rounded-full transition-colors"
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
                className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors p-2 rounded-lg hover:bg-primary/10"
              >
                <PlusIcon />
                Adicionar Variação
              </button>
              {(formData.variants.length === 0) && (
                <div className="mt-4">
                    <label htmlFor="isOutOfStock" className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer p-3 bg-white border border-slate-200 rounded-lg">
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
            </section>
            
            <section>
                <h3 className={sectionTitleStyle}>Descontos Progressivos</h3>
                <div className="space-y-3">
                    {formData.discounts.map((tier, index) => (
                         <div key={tier.id} className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                            <div className="sm:col-span-4">
                                <label className="block text-xs font-medium text-slate-500">A partir de (unid.)</label>
                                <input
                                    type="number"
                                    placeholder="Ex: 10"
                                    value={tier.quantity}
                                    onChange={(e) => handleDiscountTierChange(index, 'quantity', e.target.value)}
                                    className={inputStyle}
                                />
                            </div>
                            <div className="sm:col-span-7">
                                <label className="block text-xs font-medium text-slate-500">Valor do Desconto</label>
                                <div className="flex">
                                    <input
                                        type="number"
                                        step={tier.type === 'percentage' ? '1' : '0.01'}
                                        placeholder={tier.type === 'percentage' ? "Ex: 15" : "Ex: 5.50"}
                                        value={tier.type === 'percentage' ? tier.value * 100 : tier.value}
                                        onChange={(e) => handleDiscountTierChange(index, 'value', e.target.value)}
                                        className="block w-full rounded-l-lg border-2 border-r-0 border-slate-300 bg-white px-3 py-2 text-base text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/30 z-10"
                                    />
                                    <div className="flex -ml-px">
                                        <button 
                                            type="button"
                                            onClick={() => handleDiscountTierChange(index, 'type', 'value')}
                                            className={`relative inline-flex items-center px-3 text-sm font-medium border-2 transition-colors ${tier.type === 'value' ? 'bg-primary text-white border-primary z-20' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'}`}
                                            >
                                            R$
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => handleDiscountTierChange(index, 'type', 'percentage')}
                                            className={`relative inline-flex items-center px-3 rounded-r-lg text-sm font-medium border-2 transition-colors ${tier.type === 'percentage' ? 'bg-primary text-white border-primary z-20' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'}`}
                                            >
                                            %
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="sm:col-span-1 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveDiscountTier(index)}
                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-200/60 rounded-full transition-colors"
                                    aria-label={`Remover faixa de desconto ${index + 1}`}
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                 <button
                    type="button"
                    onClick={handleAddDiscountTier}
                    className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors p-2 rounded-lg hover:bg-primary/10"
                >
                    <PlusIcon />
                    Adicionar Faixa de Desconto
                </button>
            </section>
          </div>
          <div className="p-6 border-t border-slate-200 bg-slate-50/80 flex justify-between items-center flex-shrink-0">
            <div>
              {product && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(product.id)}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  aria-label="Excluir produto"
                >
                  <TrashIcon />
                  Excluir
                </button>
              )}
            </div>
            <div className="flex gap-3">
                <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white text-gray-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
                    Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors">
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
