import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import { Product, CartItem, Variant, User } from './types';
import MarcaFilter from './components/MarcaFilter';
import CategoryFilter from './components/CategoryFilter';
import ProductForm from './components/ProductForm';
import PlusIcon from './components/icons/PlusIcon';
import VariantSelector from './components/VariantSelector';
import ProductDetail from './components/ProductDetail';
import LoginModal from './components/LoginModal';
import UserAuthModal from './components/UserAuthModal';
import Footer from './components/Footer';
import UserManagement from './components/UserManagement';
import { 
  getProducts, 
  getUsers, 
  getMarcas, 
  getCategories,
  saveProduct,
  deleteProduct as deleteProductFromDb,
  addUser,
  updateUser,
  deleteUser as deleteUserFromDb,
  addMarca,
  deleteMarca,
  updateMarca,
  addCategory,
  deleteCategory,
  updateCategory,
  restoreInitialData,
} from './services/dataService';
import AdminNotification from './components/AdminNotification';
import BrandCategoryManagement from './components/BrandCategoryManagement';
import { isFirebaseConfigured } from './firebase/config';
import FirebaseNotConfigured from './components/FirebaseNotConfigured';
import FirebaseRulesInstructions from './components/FirebaseRulesInstructions';
import FirebaseHealthCheck from './components/FirebaseHealthCheck';
import FeaturedCarousel from './components/FeaturedCarousel';


const ADMIN_USERNAME = 'GEOVANI';
const ADMIN_PASSWORD = '140890';

type AdminView = 'products' | 'users' | 'marcas' | 'categories';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedMarca, setSelectedMarca] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserAuthModalOpen, setIsUserAuthModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForVariants, setProductForVariants] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [adminView, setAdminView] = useState<AdminView>('products');
  const [showAdminNotification, setShowAdminNotification] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showRulesInstructions, setShowRulesInstructions] = useState(true);


  useEffect(() => {
    if (!isFirebaseConfigured) {
        setIsLoading(false);
        return;
    }
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [loadedProducts, loadedUsers, loadedMarcas, loadedCategories] = await Promise.all([
          getProducts(),
          getUsers(),
          getMarcas(),
          getCategories()
        ]);
        setProducts(loadedProducts);
        setUsers(loadedUsers);
        setMarcas(loadedMarcas);
        setCategories(loadedCategories);
      } catch (error) {
        console.error("Erro ao carregar dados do Firebase:", error);
        alert("Não foi possível carregar os dados. Verifique sua conexão e a configuração do Firebase.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  
  const featuredProducts = useMemo(() => products.filter(p => p.isFeatured).sort((a, b) => a.name.localeCompare(b.name)), [products]);
  const regularProducts = useMemo(() => products.filter(p => !p.isFeatured), [products]);

  const handleMarcaSelect = (marca: string) => {
    setSelectedMarca(prev => (prev === marca ? null : marca));
  };
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(prev => (prev === category ? null : category));
  };

  const handleSetMarca = (marca: string) => {
    setSelectedMarca(marca);
    setSearchTerm('');
    window.scrollTo(0, 0);
  };

  const handleSetCategory = (category: string) => {
    setSelectedCategory(category);
    setSearchTerm('');
    window.scrollTo(0, 0);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (viewingProduct) {
      setViewingProduct(null);
    }
  };

  const filteredProducts = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    
    return regularProducts.filter(product => {
      const brandMatch = !selectedMarca || product.marca === selectedMarca;
      const categoryMatch = !selectedCategory || product.category === selectedCategory;
      
      const searchMatch = lowercasedSearchTerm.trim() === '' ||
        product.name.toLowerCase().includes(lowercasedSearchTerm) ||
        product.marca.toLowerCase().includes(lowercasedSearchTerm) ||
        product.category.toLowerCase().includes(lowercasedSearchTerm);

      return brandMatch && categoryMatch && searchMatch;
    });
  }, [regularProducts, selectedMarca, selectedCategory, searchTerm]);

  const handleAddToCart = (product: Product) => {
    const isProductOutOfStock = product.variants && product.variants.length > 0
        ? product.variants.every(v => v.isOutOfStock)
        : product.isOutOfStock;

    if (isProductOutOfStock) {
      alert('Este produto está esgotado e não pode ser adicionado ao carrinho.');
      return;
    }
    
    if (product.variants && product.variants.length > 0) {
      setProductForVariants(product);
      return;
    }
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    setTimeout(() => setIsCartOpen(true), 100);
  };

  const handleAddVariantToCart = (product: Product, variant: Variant) => {
    if (variant.isOutOfStock) {
      alert('Esta variação do produto está esgotada.');
      return;
    }
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === variant.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      const newVariantItem: CartItem = {
        ...product,
        id: variant.id,
        name: `${product.name} ${variant.name}`,
        quantity: 1,
      };
      return [...prevItems, newVariantItem];
    });
    setTimeout(() => setIsCartOpen(true), 100);
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const cartCalculation = useMemo(() => {
    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    let totalDiscountAmount = 0;

    const itemsGroupedByProduct = cartItems.reduce((acc, cartItem) => {
      const originalProduct = products.find(p => 
          p.id === cartItem.id || (p.variants && p.variants.some(v => v.id === cartItem.id))
      );
      
      if (originalProduct) {
          const productId = originalProduct.id;
          if (!acc[productId]) {
              acc[productId] = { totalQuantity: 0, items: [], product: originalProduct };
          }
          acc[productId].totalQuantity += cartItem.quantity;
          acc[productId].items.push(cartItem);
      }
      return acc;
    }, {} as Record<string, { totalQuantity: number; items: CartItem[], product: Product }>);
    
    for (const productId in itemsGroupedByProduct) {
      const group = itemsGroupedByProduct[productId];
      const product = group.product;

      if (product.discounts && product.discounts.length > 0) {
        const sortedDiscounts = [...product.discounts].sort((a, b) => b.quantity - a.quantity);
        let applicableDiscount = null;
        
        for (const tier of sortedDiscounts) {
          if (group.totalQuantity >= tier.quantity) {
            applicableDiscount = tier;
            break; 
          }
        }

        if (applicableDiscount) {
          if (applicableDiscount.type === 'percentage') {
            const groupSubtotal = group.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            totalDiscountAmount += groupSubtotal * applicableDiscount.value;
          } else { // 'value'
            totalDiscountAmount += group.totalQuantity * applicableDiscount.value;
          }
        }
      }
    }

    const total = subtotal - totalDiscountAmount;

    return {
      subtotal,
      itemCount,
      discountAmount: totalDiscountAmount,
      total,
    };
  }, [cartItems, products]);


  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }
    
    if (!currentUser) {
      alert("Por favor, faça login para finalizar a compra.");
      setIsUserAuthModalOpen(true);
      return;
    }

    const { subtotal, discountAmount, total } = cartCalculation;
    const phoneNumber = '5566996970685';

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

    let message = `Olá! Meu nome é ${currentUser.name}.\n\nGostaria de fazer o seguinte pedido:\n\n`;
    cartItems.forEach(item => {
      message += `*${item.quantity}x* - ${item.name} (${formatCurrency(item.price)} cada)\n`;
    });

    message += `\n---------------------\n`;
    message += `*Subtotal:* ${formatCurrency(subtotal)}\n`;
    
    if (discountAmount > 0) {
      message += `*Descontos Aplicados:* -${formatCurrency(discountAmount)}\n`;
    }

    message += `*Total do Pedido: ${formatCurrency(total)}*`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    
    setCartItems([]);
    setIsCartOpen(false);
  };
  
  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    if (productToDelete && window.confirm('Tem certeza que deseja remover este produto?')) {
      try {
        await deleteProductFromDb(productToDelete);
        setProducts(prev => prev.filter(p => p.id !== productId));
        setIsFormOpen(false);
        setEditingProduct(null);
      } catch (error) {
        console.error("Erro ao deletar produto:", error);
        alert("Falha ao deletar o produto.");
      }
    }
  };

  const handleSaveProduct = async (
    productData: Omit<Product, 'id'> & { id?: string }
  ): Promise<void> => {
      const hasVariants = productData.variants && productData.variants.length > 0;
      const allVariantsOutOfStock = hasVariants ? productData.variants.every(v => v.isOutOfStock) : false;

      const baseProductData = {
          ...productData,
          isOutOfStock: hasVariants ? allVariantsOutOfStock : productData.isOutOfStock,
          discounts: productData.discounts?.filter(d => d.quantity > 0 && d.value > 0),
      };
      
      try {
        const savedProduct = await saveProduct(baseProductData);
        if (baseProductData.id) { // Editing
            setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
        } else { // Adding
            setProducts(prev => [savedProduct, ...prev]);
        }
        setIsFormOpen(false);
        setEditingProduct(null);
        // Se o salvamento for bem-sucedido, talvez as regras estejam corretas.
        // O usuário pode dispensar a notificação.
        setShowRulesInstructions(false);
      } catch (error) {
          console.error("Erro ao salvar produto:", error);
          // Re-throw the error so the form can catch it and display a message
          throw error;
      }
  };
  
  const handleViewDetails = (product: Product) => {
    setViewingProduct(product);
    window.scrollTo(0, 0);
  };

  const handleCloseDetails = () => {
    setViewingProduct(null);
  };
  
  const handleGoHome = () => {
    setSelectedMarca(null);
    setSelectedCategory(null);
    setViewingProduct(null);
    setSearchTerm('');
    window.scrollTo(0, 0);
  };

  const handleAdminLoginAttempt = (user: string, pass: string) => {
    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
        setIsAdminMode(true);
        setIsLoginModalOpen(false);
        setAdminView('products');
        setShowAdminNotification(true);
        setShowRulesInstructions(true); // Mostra as instruções ao logar
    } else {
        alert('Usuário ou senha de administrador inválidos.');
    }
  };

  const handleAdminLogout = () => {
      setIsAdminMode(false);
  };

  const handleAdminClick = () => {
      if (isAdminMode) {
          handleAdminLogout();
      } else {
          setIsLoginModalOpen(true);
      }
  };
  
  const handleUserLogin = (whatsapp: string) => {
    const existingUser = users.find(u => u.whatsapp === whatsapp);
    
    if (existingUser) {
        if (existingUser.status === 'approved') {
            setCurrentUser(existingUser);
            setIsUserAuthModalOpen(false);
            alert(`Bem-vindo(a) de volta, ${existingUser.name}!`);
        } else { // 'pending'
            alert('Seu cadastro ainda está pendente de aprovação. Por favor, aguarde.');
        }
    } else {
        alert('WhatsApp não encontrado. Por favor, verifique o número ou cadastre-se.');
    }
  };

  const handleUserRegister = async (name: string, whatsapp: string) => {
    const existingUser = users.find(u => u.whatsapp === whatsapp);
    const adminPhoneNumber = '5566996970685';

    if (existingUser) {
      alert('Este número de WhatsApp já está cadastrado. Por favor, tente entrar.');
      return;
    }
    
    const newUser: User = { name, whatsapp, status: 'pending' };
    try {
      await addUser(newUser);
      setUsers(prev => [...prev, newUser]);

      const message = `Olá! Meu nome é ${name} e meu WhatsApp é ${whatsapp}. Sou um(a) profissional cabeleireiro(a) e gostaria de solicitar a liberação para acessar o catálogo da KI CHARME.`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
      
      alert('Sua solicitação de acesso foi enviada! Você será notificado assim que seu cadastro for aprovado pelo administrador.');
      setIsUserAuthModalOpen(false);
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      alert("Falha ao registrar. Tente novamente.");
    }
  };

  const handleApproveUser = async (whatsapp: string) => {
    const userToUpdate = users.find(u => u.whatsapp === whatsapp);
    if (!userToUpdate) return;
    
    const updatedUser = { ...userToUpdate, status: 'approved' as const };
    try {
      await updateUser(updatedUser);
      setUsers(prevUsers => prevUsers.map(user => user.whatsapp === whatsapp ? updatedUser : user));
      alert('Cliente aprovado com sucesso!');
    } catch (error) {
      console.error("Erro ao aprovar usuário:", error);
      alert("Falha ao aprovar cliente.");
    }
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
  };
  
  const handleDeleteUser = async (whatsapp: string) => {
    if (window.confirm('Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.')) {
      try {
        await deleteUserFromDb(whatsapp);
        if (currentUser?.whatsapp === whatsapp) {
            setCurrentUser(null);
        }
        setUsers(prev => prev.filter(u => u.whatsapp !== whatsapp));
      } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        alert("Falha ao deletar cliente.");
      }
    }
  };

  const handleAddItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, addFn: (item: string) => Promise<void>) => async (item: string) => {
    try {
      await addFn(item);
      setter(prev => [...prev, item].sort());
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      alert("Falha ao adicionar item.");
    }
  };

  const handleDeleteItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, deleteFn: (item: string) => Promise<void>) => async (item: string) => {
    try {
      await deleteFn(item);
      setter(prev => prev.filter(i => i !== item));
    } catch (error) {
      console.error("Erro ao deletar item:", error);
      alert("Falha ao deletar item.");
    }
  };
  
  const handleEditItem = (
    itemType: 'marca' | 'category',
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    updateFn: (old: string, newI: string) => Promise<void>
  ) => async (oldItem: string, newItem: string) => {
    try {
      await updateFn(oldItem, newItem);
      setter(prev => prev.map(item => (item === oldItem ? newItem : item)).sort());

      // Reload products to reflect changes, as Firebase functions now handle this atomically
      const loadedProducts = await getProducts();
      setProducts(loadedProducts);

    } catch (error) {
      console.error("Erro ao editar item:", error);
      alert("Falha ao editar item e atualizar produtos.");
    }
  };
  
  const handleRestoreData = async () => {
      const confirmationMessage = `Tem certeza que deseja restaurar os dados padrão?

TUDO o que está no banco de dados (produtos, marcas, categorias) será APAGADO e substituído pelos dados originais do aplicativo.

Esta ação não pode ser desfeita.`;

      if (!window.confirm(confirmationMessage)) {
          return;
      }
      setIsLoading(true);
      try {
          await restoreInitialData();
          alert('Restauração concluída com sucesso! Os dados padrão foram carregados no Firebase. A página será recarregada.');
          window.location.reload();
      } catch (error: any) {
          console.error("Erro na restauração:", error);
          alert(`Ocorreu um erro durante a restauração: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
  };

  const showSearchBar = viewingProduct ? true : !isAdminMode;
  const isUserLoggedIn = !!currentUser;
  const filterKey = `${selectedMarca}-${selectedCategory}`;

  const adminTitle = {
    products: 'Gerenciar Catálogo',
    users: 'Gerenciar Clientes',
    marcas: 'Gerenciar Marcas',
    categories: 'Gerenciar Categorias',
  };
  
  if (!isFirebaseConfigured) {
    return <FirebaseNotConfigured />;
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl font-semibold text-gray-700">Carregando catálogo...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      <Header
        cartItemCount={cartCalculation.itemCount}
        onCartClick={() => setIsCartOpen(true)}
        onGoHome={handleGoHome}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        showSearchBar={showSearchBar}
        currentUser={currentUser}
        onLoginClick={() => setIsUserAuthModalOpen(true)}
        onLogoutClick={handleUserLogout}
      />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {viewingProduct && !isAdminMode ? (
          <ProductDetail 
            product={viewingProduct}
            allProducts={products}
            onClose={handleCloseDetails}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
            isUserLoggedIn={isUserLoggedIn}
            onLoginClick={() => setIsUserAuthModalOpen(true)}
          />
        ) : (
          <>
            {!isAdminMode ? (
              <>
                {featuredProducts.length > 0 && (
                  <FeaturedCarousel
                    products={featuredProducts}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                    isUserLoggedIn={isUserLoggedIn}
                    onLoginClick={() => setIsUserAuthModalOpen(true)}
                    onSetMarca={handleSetMarca}
                    onSetCategory={handleSetCategory}
                  />
                )}
                <div className="space-y-8 my-8">
                  <MarcaFilter 
                    marcas={marcas}
                    selectedMarca={selectedMarca}
                    onMarcaSelect={handleMarcaSelect}
                  />
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                  />
                </div>
                 <h2 className="text-2xl font-bold text-gray-800 mb-6">Todos os Produtos</h2>
                <div key={filterKey}>
                    <ProductList
                    products={filteredProducts}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                    onSetMarca={handleSetMarca}
                    onSetCategory={handleSetCategory}
                    isUserLoggedIn={isUserLoggedIn}
                    onLoginClick={() => setIsUserAuthModalOpen(true)}
                    />
                </div>
              </>
            ) : (
              <>
                {showAdminNotification && <AdminNotification onDismiss={() => setShowAdminNotification(false)} />}
                <FirebaseHealthCheck />
                {showRulesInstructions && (
                    <FirebaseRulesInstructions 
                      onDismiss={() => setShowRulesInstructions(false)}
                    />
                )}
                <div className="flex justify-between items-center my-8">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                    {adminTitle[adminView]}
                  </h1>
                   <div className="flex items-center gap-4">
                      <button
                        onClick={handleRestoreData}
                        className="bg-warning text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-warning-hover transition-colors"
                      >
                        Restaurar Dados Padrão
                      </button>
                      {adminView === 'products' && (
                        <button
                          onClick={handleAddNewProduct}
                          className="bg-accent text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-accent-hover transition-colors"
                        >
                          <PlusIcon />
                          Adicionar Novo Produto
                        </button>
                      )}
                   </div>
                </div>

                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {Object.keys(adminTitle).map((view) => (
                           <button
                             key={view}
                             onClick={() => setAdminView(view as AdminView)}
                             className={`capitalize whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                 adminView === view
                                 ? 'border-primary text-primary'
                                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                             }`}
                           >
                             {view === 'users' ? 'Clientes' : view}
                           </button>
                        ))}
                    </nav>
                </div>

                {adminView === 'products' && (
                  <ProductList
                    products={products}
                    onAddToCart={() => {}}
                    onViewDetails={() => {}}
                    isAdminMode={true}
                    onEdit={handleEditProduct}
                    isUserLoggedIn={true}
                    onLoginClick={() => {}}
                  />
                )}
                {adminView === 'users' && (
                  <UserManagement users={users} onDeleteUser={handleDeleteUser} onApproveUser={handleApproveUser} />
                )}
                {adminView === 'marcas' && (
                  <BrandCategoryManagement 
                    title="Gerenciar Marcas"
                    items={marcas}
                    onAddItem={handleAddItem(setMarcas, addMarca)}
                    onDeleteItem={handleDeleteItem(setMarcas, deleteMarca)}
                    onEditItem={handleEditItem('marca', setMarcas, updateMarca)}
                  />
                )}
                {adminView === 'categories' && (
                  <BrandCategoryManagement 
                    title="Gerenciar Categorias"
                    items={categories}
                    onAddItem={handleAddItem(setCategories, addCategory)}
                    onDeleteItem={handleDeleteItem(setCategories, deleteCategory)}
                    onEditItem={handleEditItem('category', setCategories, updateCategory)}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>
      <Footer 
        isAdminMode={isAdminMode}
        onAdminClick={handleAdminClick}
      />
      <Cart
        isOpen={isCartOpen && !isAdminMode}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
        isUserLoggedIn={isUserLoggedIn}
        onLoginClick={() => setIsUserAuthModalOpen(true)}
        subtotal={cartCalculation.subtotal}
        discountAmount={cartCalculation.discountAmount}
        total={cartCalculation.total}
      />
      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => setIsFormOpen(false)}
          onDelete={handleDeleteProduct}
          marcas={marcas}
          categories={categories}
        />
      )}
      {productForVariants && (
        <VariantSelector
          product={productForVariants}
          onClose={() => setProductForVariants(null)}
          onAddVariant={handleAddVariantToCart}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          isUserLoggedIn={isUserLoggedIn}
          onLoginClick={() => setIsUserAuthModalOpen(true)}
        />
      )}
      {isLoginModalOpen && (
        <LoginModal
          onLogin={handleAdminLoginAttempt}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
      {isUserAuthModalOpen && !currentUser && (
        <UserAuthModal
          onLogin={handleUserLogin}
          onRegister={handleUserRegister}
          onClose={() => setIsUserAuthModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;