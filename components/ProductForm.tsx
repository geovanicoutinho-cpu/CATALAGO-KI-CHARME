import React, { useState, useEffect, useRef } from 'react';
import { Product, Variant, DiscountTier } from '../types';
import XIcon from './icons/XIcon';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import ImageIcon from './icons/ImageIcon';
import StarIcon from './icons/StarIcon';

interface ProductFormProps {
  product: Product | null;
  onSave: (productData: Omit<Product, 'id'> & { id?: string }) => Promise<void>;
  onClose: () => void;
  onDelete?: (productId: string) => void;
  marcas: string[];
  categories: string[];
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onClose, onDelete, marcas, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    marca: '',
    category: '',
    description: '',
    price: 0,
    imageUrl: '',
    isOutOfStock: false,
    isFeatured: false,
    variants: [] as Variant[],
    discounts: [] as DiscountTier[],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        marca: product.marca,
        category: product.category,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        isOutOfStock: !!product.isOutOfStock,
        isFeatured: !!product.isFeatured,
        variants: product.variants?.map(v => ({...v, isOutOfStock: !!v.isOutOfStock})) || [],
        discounts: product.discounts?.map(d => ({ ...d, id: Math.random() })) || [],
      });
    } else {
      setFormData({
        name: '',
        marca: marcas.length > 0 ? marcas[0] : '',
        category: categories.length > 0 ? categories[0] : '',
        description: '',
        price: 0,
        imageUrl: '',
        isOutOfStock: false,
        isFeatured: false,
        variants: [],
        discounts: [],
      });
    }
  }, [product, marcas, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    setError(null); // Limpa o erro ao alterar qualquer campo

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setError(null);

    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Por favor, preencha o nome e a descrição do produto.');
      return;
    }
    if (!formData.imageUrl.trim()) {
        setError('Por favor, adicione uma URL de imagem para o produto.');
        return;
    }
    if (!formData.marca || !formData.category) {
        setError('Por favor, selecione uma marca e uma categoria.');
        return;
    }

    setIsSaving(true);
    try {
        const dataToSave = {
          ...formData,
          id: product?.id,
        };
        await onSave(dataToSave);
    } catch (err: any) {
        console.error("Falha no envio do formulário:", err);
        let friendlyMessage = "Ocorreu um erro desconhecido. Tente novamente.";
        if (err.message) {
            if (err.message.includes('permission-denied')) {
                friendlyMessage = "Erro de permissão. Verifique se as regras de segurança do Firebase estão configuradas corretamente para permitir escrita.";
            } else {
                friendlyMessage = `Falha ao salvar: ${err.message}`;
            }
        }
        setError(friendlyMessage);
    } finally {
        setIsSaving(false);
    }
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
                    <label htmlFor="marca" className={labelStyle}>Marca</label>
                    <select name="marca" id="marca" value={formData.marca} onChange={handleChange} required className={inputStyle}>
                      <option value="" disabled>Selecione uma marca</option>
                      {marcas.map(b => <option key={b} value={b}>{b}</option>)}
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
                <div>
                    <label htmlFor="imageUrl" className={labelStyle}>URL da Imagem</label>
                    <input 
                        type="url" 
                        name="imageUrl" 
                        id="imageUrl" 
                        value={formData.imageUrl} 
                        onChange={handleChange} 
                        required 
                        className={inputStyle} 
                        placeholder="https://exemplo.com/imagem.png"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Use um serviço como <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Imgur</a> para hospedar sua imagem e cole o link direto aqui.
                    </p>
                </div>
                {formData.imageUrl && (
                    <div className="mt-4">
                        <p className="text-sm font-medium text-slate-600 mb-2">Pré-visualização:</p>
                        <img
                            src={formData.imageUrl}
                            alt="Pré-visualização"
                            className="h-24 w-24 rounded-lg object-cover border-2 border-slate-200 bg-white p-1"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            onLoad={(e) => { e.currentTarget.style.display = 'block'; }}
                        />
                    </div>
                )}
            </section>

            <section>
              <h3 className={sectionTitleStyle}>Visibilidade e Estoque</h3>
              <div className="space-y-4">
                <label htmlFor="isFeatured" className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer p-3 bg-white border border-slate-200 rounded-lg">
                    <span className="flex items-center gap-2">
                        <StarIcon />
                        Produto em Destaque (aparece no carrossel inicial)
                    </span>
                    <div className="relative inline-flex items-center">
                        <input
                            type="checkbox"
                            name="isFeatured"
                            id="isFeatured"
                            checked={formData.isFeatured}
                            onChange={handleChange}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                </label>

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
          <div className="p-6 border-t border-slate-200 bg-slate-50/80 flex-shrink-0">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                    <strong className="font-bold">Erro: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div className="flex justify-between items-center">
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
                    <button 
                        type="submit" 
                        className="px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Salvando...
                            </>
                        ) : 'Salvar Produto'}
                    </button>
                </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;