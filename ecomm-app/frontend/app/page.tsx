"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { InventoryManager } from './InventoryManager';
import { API_BASE } from './utils/api';

// Components
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import ProductGrid from './components/ProductGrid';
import AdminDashboard from './components/AdminDashboard';
import MobileMenu from './components/MobileMenu';

// PB Pasteles Store
export default function TenantStore() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cartMsg, setCartMsg] = useState("");

  const [user, setUser] = useState<any>(null);
  const [currentCart, setCurrentCart] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");

  // Auth States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Admin State
  const [showAdmin, setShowAdmin] = useState(false);

  // Hero Carousel State
  const [heroImages, setHeroImages] = useState<string[]>([]);

  useEffect(() => {
    fetchUser();
    fetchCategories();
    fetchLocations();
    fetchProducts();
    fetchCart();
    fetchHeroImages();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, categoryFilter]);

  const fetchUser = () => {
    fetch(`${API_BASE}/api/auth/me`, { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(setUser)
      .catch(() => setUser(null));
  };

  const fetchCategories = () => {
    fetch(`${API_BASE}/api/categories`, { credentials: "include" })
      .then(res => res.ok ? res.json() : [])
      .then(setCategories)
      .catch(console.error);
  };

  const fetchLocations = () => {
    fetch(`${API_BASE}/api/locations`, { credentials: "include" })
      .then(res => res.ok ? res.json() : [])
      .then(setLocations)
      .catch(console.error);
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, categoryFilter, selectedLocation]);

  const fetchProducts = () => {
    let url = `${API_BASE}/api/products?`;
    if (searchQuery) url += `q=${searchQuery}&`;
    if (categoryFilter) url += `category=${categoryFilter}&`;
    if (selectedLocation) url += `location_id=${selectedLocation}&`;

    fetch(url, { credentials: "include" })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  const fetchCart = () => {
    let sessionId = localStorage.getItem("session_id");
    if (!sessionId) return;
    fetch(`${API_BASE}/api/cart`, {
      headers: { "x-session-id": sessionId },
      credentials: "include"
    })
      .then(res => res.ok ? res.json() : {})
      .then(setCurrentCart)
      .catch(console.error);
  }

  const fetchHeroImages = () => {
    fetch(`${API_BASE}/api/upload/hero`, { credentials: "include" })
      .then(res => res.ok ? res.json() : [])
      .then((names: string[]) => setHeroImages(names.map(n => `${API_BASE}/api/static/hero/${n}`)))
      .catch(console.error);
  };

  const addToCart = async (product: any) => {
    if (product.stock <= 0) {
      setCartMsg(`❌ ${product.name} Agotado`);
      setTimeout(() => setCartMsg(""), 3000);
      return;
    }

    let sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(7);
      localStorage.setItem("session_id", sessionId);
    }

    const res = await fetch(`${API_BASE}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId
      },
      body: JSON.stringify({ product_id: product._id, quantity: 1 })
    });

    if (res.ok) {
      setCartMsg(`🍰 ${product.name} agregado!`);
      fetchCart();
      setTimeout(() => setCartMsg(""), 3000);
    } else {
      const d = await res.json();
      setCartMsg(`❌ Error: ${d.detail || 'Failed'}`);
      setTimeout(() => setCartMsg(""), 3000);
    }
  };

  const handleAuth = async (e: React.FormEvent, type: 'login' | 'register') => {
    e.preventDefault();
    const isLogin = type === 'login';
    const endpoint = isLogin ? `${API_BASE}/api/auth/login` : `${API_BASE}/api/auth/register`;

    setAuthMsg("Procesando...");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPass }),
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        window.location.reload();
      } else {
        setAuthMsg("Error: " + data.detail);
      }
    } catch (err) {
      setAuthMsg("Error de conexión");
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
    window.location.reload();
  };

  const cartCount = Object.values(currentCart).reduce((acc: number, val: any) => acc + parseInt(val), 0);

  return (
    <div className="min-h-screen flex flex-col font-sans text-[var(--color-chocolate)] bg-[var(--color-background)]">

      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartCount}
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onMobileMenuClick={() => setIsMobileMenuOpen(true)}
      />

      {/* HERO SECTION */}
      {!searchQuery && (
        <HeroCarousel images={heroImages} />
      )}

      {/* FEEDBACK MSG */}
      {cartMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-[var(--color-chocolate)] text-[var(--color-secondary)] px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-3">
            {cartMsg}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main id="catalogo" className="container mx-auto px-6 py-12 flex-grow">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-extrabold text-[var(--color-chocolate)]">
            {searchQuery ? `Resultados para "${searchQuery}"` : "Nuestras Delicias"}
          </h3>
          {/* Dynamic Categories */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => setCategoryFilter("")}
              className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${categoryFilter === ""
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'border-[var(--color-chocolate)]/20 text-[var(--color-chocolate)] hover:bg-white'
                }`}
            >
              Todos
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat._id}
                onClick={() => setCategoryFilter(cat.name)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${categoryFilter === cat.name
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'border-[var(--color-chocolate)]/20 text-[var(--color-chocolate)] hover:bg-white'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <ProductGrid
          products={products}
          loading={loading}
          addToCart={addToCart}
          setCategoryFilter={setCategoryFilter}
          setSearchQuery={setSearchQuery}
        />

      </main>

      <footer className="py-12 bg-[#2a221d] text-[var(--color-secondary)]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">PB</h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">Excelencia en repostería y atención personalizada. Hacemos tus momentos dulces inolvidables.</p>
          <p className="text-sm text-white/20">&copy; 2026 PB. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* MODALS */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full animate-in zoom-in-95">
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-chocolate)]">Ingresar</h2>
            <form onSubmit={(e) => handleAuth(e, 'login')} className="space-y-4">
              <input type="email" placeholder="Email" className="w-full p-4 bg-gray-50 rounded-xl" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
              <input type="password" placeholder="Contraseña" className="w-full p-4 bg-gray-50 rounded-xl" value={authPass} onChange={e => setAuthPass(e.target.value)} required />
              <button className="w-full bg-[var(--color-primary)] text-white font-bold py-4 rounded-xl hover:opacity-90">Entrar</button>
            </form>
            {authMsg && <p className="mt-4 text-center text-sm font-bold text-red-500">{authMsg}</p>}
            <button onClick={() => setIsLoginModalOpen(false)} className="mt-6 w-full text-gray-400 font-bold hover:text-black">Cerrar</button>
          </div>
        </div>
      )}

      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full animate-in zoom-in-95">
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-chocolate)]">Nuevo Usuario</h2>
            <form onSubmit={(e) => handleAuth(e, 'register')} className="space-y-4">
              <input type="email" placeholder="Email" className="w-full p-4 bg-gray-50 rounded-xl" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
              <input type="password" placeholder="Crea tu contraseña" className="w-full p-4 bg-gray-50 rounded-xl" value={authPass} onChange={e => setAuthPass(e.target.value)} required />
              <button className="w-full bg-[var(--color-chocolate)] text-white font-bold py-4 rounded-xl hover:opacity-90">Registrarse</button>
            </form>
            {authMsg && <p className="mt-4 text-center text-sm font-bold text-red-500">{authMsg}</p>}
            <button onClick={() => setIsRegisterModalOpen(false)} className="mt-6 w-full text-gray-400 font-bold hover:text-black">Cerrar</button>
          </div>
        </div>
      )}

      {/* Admin Button */}
      {(() => {
        const hasAccess = user && (user.is_owner || ['OWNER', 'ADMIN', 'PRODUCT_MANAGER', 'INVENTORY_MANAGER'].includes(user.role));
        return hasAccess;
      })() && (
          <button
            onClick={() => setShowAdmin(true)}
            className="fixed bottom-8 right-8 z-40 bg-[var(--color-primary)] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl text-white text-2xl hover:scale-110 transition-transform border-4 border-white"
          >
            🛠️
          </button>
        )}

      {/* Admin Dashboard Overlay */}
      {showAdmin && (
        <AdminDashboard
          currentUser={user}
          setCartMsg={setCartMsg}
          onClose={() => setShowAdmin(false)}
        />
      )}

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => setIsLoginModalOpen(true)}
      />

    </div>
  );
}
