import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import { Product, CartItem, Variant, User } from './types';
import BrandFilter from './components/BrandFilter';
import CategoryFilter from './components/CategoryFilter';
import ProductForm from './components/ProductForm';
import PlusIcon from './components/icons/PlusIcon';
import VariantSelector from './components/VariantSelector';
import ProductDetail from './components/ProductDetail';
import LoginModal from './components/LoginModal';
import UserAuthModal from './components/UserAuthModal';
import Footer from './components/Footer';
import UserManagement from './components/UserManagement';
import { getProducts, saveProducts, getUsers, saveUsers } from './services/dataService';
import AdminNotification from './components/AdminNotification';

const ADMIN_USERNAME = 'GEOVANI';
const ADMIN_PASSWORD = '140890';

type AdminView = 'products' | 'users';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
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
  
  const [adminView, setAdminView] = useState<AdminView>('products');
  const [showAdminNotification, setShowAdminNotification] = useState(true);


  useEffect(() => {
    const loadData = async () => {
      const loadedProducts = await getProducts();
      setProducts(loadedProducts);
      const loadedUsers = await getUsers();
      setUsers(loadedUsers);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (products.length > 0) { // Evita salvar o estado inicial vazio
        saveProducts(products);
    }
  }, [products]);

  useEffect(() => {
    if (users.length > 0) { // Evita salvar o estado inicial vazio
        saveUsers(users);
    }
  }, [users]);

  const allBrands = useMemo(() => [...new Set(products.map(p => p.brand))], [products]);
  const allCategories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(prev => (prev === brand ? null : brand));
  };
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(prev => (prev === category ? null : category));
  };

  const handleSetBrand = (brand: string) => {
    setSelectedBrand(brand);
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
  };

  const filteredProducts = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    
    return products.filter(product => {
      const brandMatch = !selectedBrand || product.brand === selectedBrand;
      const categoryMatch = !selectedCategory || product.category === selectedCategory;
      
      const searchMatch = lowercasedSearchTerm.trim() === '' ||
        product.name.toLowerCase().includes(lowercasedSearchTerm) ||
        product.brand.toLowerCase().includes(lowercasedSearchTerm) ||
        product.category.toLowerCase().includes(lowercasedSearchTerm);

      return brandMatch && categoryMatch && searchMatch;
    });
  }, [products, selectedBrand, selectedCategory, searchTerm]);

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

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
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

  const handleRemoveFromCart = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

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

    const phoneNumber = '5566996970685';
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const formattedTotalPrice = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(totalPrice);

    let message = `Olá! Meu nome é ${currentUser.name}.\n\nGostaria de fazer o seguinte pedido:\n\n`;
    cartItems.forEach(item => {
      const formattedItemPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price);
      message += `*${item.quantity}x* - ${item.name} (${formattedItemPrice} cada)\n`;
    });
    message += `\n*Total do Pedido: ${formattedTotalPrice}*`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    
    setCartItems([]);
    setIsCartOpen(false);
  };

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);
  
  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (productId: number) => {
    if (window.confirm('Tem certeza que deseja remover este produto?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      setIsFormOpen(false);
      setEditingProduct(null);
    }
  };

  const handleSaveProduct = (productData: Omit<Product, 'id'> & { id?: number }) => {
    const hasVariants = productData.variants && productData.variants.length > 0;
    const allVariantsOutOfStock = hasVariants ? productData.variants.every(v => v.isOutOfStock) : false;

    const finalProductData = {
      ...productData,
      isOutOfStock: hasVariants ? allVariantsOutOfStock : productData.isOutOfStock,
    };
    
    if (finalProductData.id) { // Editing existing product
      setProducts(prev => prev.map(p => p.id === finalProductData.id ? { ...p, ...finalProductData } as Product : p));
    } else { // Adding new product
      const newProduct: Product = {
        ...finalProductData,
        id: Date.now(), // simple id generation
      };
      setProducts(prev => [newProduct, ...prev]);
    }
    setIsFormOpen(false);
    setEditingProduct(null);
  };
  
  const handleViewDetails = (product: Product) => {
    setViewingProduct(product);
  };

  const handleCloseDetails = () => {
    setViewingProduct(null);
  };
  
  const handleGoHome = () => {
    setSelectedBrand(null);
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
  
  const handleUserAuth = (name: string, whatsapp: string) => {
    const existingUser = users.find(u => u.whatsapp === whatsapp);
    const adminPhoneNumber = '5566996970685';

    if (existingUser) {
        if (existingUser.status === 'approved') {
            setCurrentUser(existingUser);
            setIsUserAuthModalOpen(false);
        } else { // 'pending'
            alert('Seu cadastro ainda está pendente de aprovação. Por favor, aguarde.');
        }
    } else { // New user
        const newUser: User = { name, whatsapp, status: 'pending' };
        setUsers(prev => [...prev, newUser]);
        
        const message = `Olá! Meu nome é ${name} e meu WhatsApp é ${whatsapp}. Sou um(a) profissional cabeleireiro(a) e gostaria de solicitar a liberação para acessar o catálogo da KI CHARME.`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
        
        alert('Sua solicitação de acesso foi enviada! Você será notificado assim que seu cadastro for aprovado pelo administrador.');
        setIsUserAuthModalOpen(false);
    }
  };

  const handleApproveUser = (whatsapp: string) => {
    setUsers(prevUsers => 
        prevUsers.map(user => 
            user.whatsapp === whatsapp ? { ...user, status: 'approved' } : user
        )
    );
    alert('Cliente aprovado com sucesso!');
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
  };
  
  const handleDeleteUser = (whatsapp: string) => {
    if (window.confirm('Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.')) {
        if (currentUser?.whatsapp === whatsapp) {
            setCurrentUser(null);
        }
        setUsers(prev => prev.filter(u => u.whatsapp !== whatsapp));
    }
  };

  const showSearchBar = !viewingProduct && !isAdminMode;
  const isUserLoggedIn = !!currentUser;

  const filterKey = `${selectedBrand}-${selectedCategory}`;

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      <Header
        cartItemCount={cartItemCount}
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
            onClose={handleCloseDetails}
            onAddToCart={handleAddToCart}
            isUserLoggedIn={isUserLoggedIn}
            onLoginClick={() => setIsUserAuthModalOpen(true)}
          />
        ) : (
          <>
            {!isAdminMode ? (
              <>
                <div className="space-y-8 mb-8">
                  <BrandFilter 
                    brands={allBrands}
                    selectedBrand={selectedBrand}
                    onBrandSelect={handleBrandSelect}
                  />
                  <CategoryFilter
                    categories={allCategories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                  />
                </div>
                <div key={filterKey}>
                    <ProductList
                    products={filteredProducts}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                    onSetBrand={handleSetBrand}
                    onSetCategory={handleSetCategory}
                    isUserLoggedIn={isUserLoggedIn}
                    onLoginClick={() => setIsUserAuthModalOpen(true)}
                    />
                </div>
              </>
            ) : (
              <>
                {showAdminNotification && <AdminNotification onDismiss={() => setShowAdminNotification(false)} />}
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                    {adminView === 'products' ? 'Gerenciar Catálogo' : 'Gerenciar Clientes'}
                  </h1>
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

                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setAdminView('products')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                adminView === 'products'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Produtos
                        </button>
                        <button
                             onClick={() => setAdminView('users')}
                             className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                 adminView === 'users'
                                 ? 'border-primary text-primary'
                                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                             }`}
                        >
                            Clientes
                        </button>
                    </nav>
                </div>

                {adminView === 'products' ? (
                  <ProductList
                    products={products}
                    onAddToCart={() => {}}
                    onViewDetails={() => {}}
                    isAdminMode={true}
                    onEdit={handleEditProduct}
                    isUserLoggedIn={true}
                    onLoginClick={() => {}}
                  />
                ) : (
                  <UserManagement users={users} onDeleteUser={handleDeleteUser} onApproveUser={handleApproveUser} />
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
      />
      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => setIsFormOpen(false)}
          onDelete={handleDeleteProduct}
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
          onAuth={handleUserAuth}
          onClose={() => setIsUserAuthModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
