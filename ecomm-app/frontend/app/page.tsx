"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { InventoryManager } from './InventoryManager';

const getApiBase = () => {
  // 1. Try environment variable (injected during build)
  const envBase = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (envBase) return envBase;

  // 2. Client-side fallback: Detect from current URL if we are in the known subpath
  if (typeof window !== 'undefined') {
    if (window.location.pathname.startsWith('/prjzdev1092')) {
      return '/prjzdev1092';
    }
  }
  return '';
};

const API_BASE = getApiBase();


// PB Pasteles Store
export default function TenantStore() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cartMsg, setCartMsg] = useState("");

  const siteName = "PB";

  const [user, setUser] = useState<any>(null);
  const [currentCart, setCurrentCart] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]); // New: Locations
  const [selectedLocation, setSelectedLocation] = useState(""); // New: Filter

  // Auth States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hero Carousel State
  const [heroImages, setHeroImages] = useState<string[]>([]);

  useEffect(() => {
    fetchUser();
    fetchCategories();
    fetchLocations(); // Fetch locations
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
  }, [searchQuery, categoryFilter, selectedLocation]); // Trigger on filter change

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
      fetchCart(); // Refresh cart count
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

  // PB Pasteles Header
  // Corporate, Shiny, Pastel colors
  return (
    <div className="min-h-screen flex flex-col font-sans text-[var(--color-chocolate)] bg-[var(--color-background)]">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-[var(--color-primary)]/20">
        <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">

          {/* Hamburger Menu (Mobile) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ☰
          </button>

          {/* Logo (Centered on mobile, Left on desktop) */}
          <div className="flex-grow md:flex-grow-0 flex justify-center md:justify-start">
            <Link href="/" className="flex items-center">
              <img src={`${API_BASE}/PB_logo.png`} alt="Pinecrest Bakery" className="h-12 md:h-16 w-auto transition-all" />
            </Link>
          </div>

          {/* Search Bar (Desktop only) */}
          <div className="flex-grow max-w-xl relative hidden md:flex items-center gap-4">


            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Buscar postres, tortas..."
                className="w-full pl-12 pr-4 py-2.5 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>

          {/* Actions (Login / Cart) */}
          <div className="flex items-center gap-2 md:gap-6">
            {user ? (
              <div className="hidden md:flex items-center gap-2 cursor-pointer group relative text-right">
                <div className="hidden lg:block">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bienvenido</p>
                  <p className="text-sm font-bold truncate max-w-[150px]">{user.email.split('@')[0]}</p>
                </div>
                <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700 font-bold ml-2">Salir</button>
              </div>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="hidden md:block font-bold hover:text-[var(--color-primary)] transition-colors text-sm">Ingresar</button>
            )}

            {/* Cart Icon */}
            <Link href="/checkout" className="relative group">
              <div className="p-2.5 md:p-3 bg-[var(--color-primary)] text-white rounded-full hover:shadow-lg hover:scale-105 transition-all shadow-md">
                <span className="text-lg md:text-xl">🛒</span>
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--color-accent)] text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search & Location (Below Header) */}
        <div className="md:hidden px-4 pb-3 flex gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 border-none outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
          </div>

        </div>
      </header>

      {/* HERO SECTION - Carousel */}
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

        {loading ? (
          <div className="text-center py-20 text-gray-400">Cargando delicias...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300">
            <p className="text-xl text-gray-500">No encontramos productos 🧁</p>
            <button onClick={() => { setSearchQuery(""); setCategoryFilter(""); }} className="text-[var(--color-primary)] font-bold mt-2">Ver todo</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((p: any) => (
              <div key={p._id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
                {/* Image Placeholder */}
                <div className="h-64 bg-gray-100 relative overflow-hidden">
                  {/* Badge */}
                  {p.stock <= 5 && p.stock > 0 && (
                    <span className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">Pocas unidades</span>
                  )}
                  {p.stock === 0 && (
                    <span className="absolute top-4 right-4 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">Agotado</span>
                  )}

                  {p.images && p.images.length > 0 ? (
                    <img
                      src={p.images[0].startsWith('/') ? `${API_BASE}${p.images[0]}` : p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--color-secondary)]/30 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                      🧁
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h4 className="text-xl font-bold text-[var(--color-chocolate)] mb-2 line-clamp-1">{p.name}</h4>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">{p.description || "Delicioso postre artesanal."}</p>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-[var(--color-primary)]">
                      ${p.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => addToCart(p)}
                      disabled={p.stock === 0}
                      className={`px-5 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 ${p.stock === 0
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-chocolate)]'
                        }`}
                    >
                      {p.stock === 0 ? 'Sin Stock' : 'Agregar +'}
                    </button>
                  </div>
                  <div className="mt-30 text-xs text-gray-300 font-medium">
                    Stock: {p.stock}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
            {/* Public Registration Disabled */}
            {/* <div className="mt-4 text-center"><button onClick={() => { setIsLoginModalOpen(false); setIsRegisterModalOpen(true) }} className="text-sm font-bold text-[var(--color-chocolate)] hover:underline">Crear Cuenta</button></div> */}
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

      {user?.is_owner && (
        <Link href="/admin" className="fixed bottom-8 right-8 z-40 bg-[var(--color-primary)] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl text-white text-2xl hover:scale-110 transition-transform">
          🛠️
        </Link>
      )}

      {/* Admin Panel (Simplified Overlay or Redirect?) 
          Actually, let's keep the dashboard inside the page for Owner MVP or separate route.
          For now, keeping it minimal in page.tsx as previous, 
          but ideally should be a separate route /admin.
          
          Adding the previous AdminDashboard inline here again or create a link? 
          Let's create the link to the existing inline if user clicks the button.
          Actually, I reused the link above to just be a button that opens a dialog, let's restore the dialog.
       */}
      <dialog
        id="owner_modal"
        className="modal bg-transparent p-0 w-full h-full max-w-none max-h-none backdrop:bg-white/80 backdrop:backdrop-blur-sm z-50"
        onCancel={(e) => e.preventDefault()}
      >
        <AdminDashboard currentUser={user} setCartMsg={setCartMsg} />
      </dialog>


      {/* Admin panel access for users with management roles */}
      {(() => {
        const hasAccess = user && (user.is_owner || ['OWNER', 'ADMIN', 'PRODUCT_MANAGER', 'INVENTORY_MANAGER'].includes(user.role));
        return hasAccess;
      })() && (
          <button
            onClick={() => (document.getElementById('owner_modal') as HTMLDialogElement)?.showModal()}
            className="fixed bottom-8 right-8 z-40 bg-[var(--color-chocolate)] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl text-white text-2xl hover:scale-110 transition-transform border-4 border-white"
          >
            🛠️
          </button>
        )}
      {/* Side Drawer (Mobile) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer Content */}
          <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-white">
              <img src={`${API_BASE}/PB_logo.png`} alt="Logo" className="h-10 w-auto" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-2xl text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <nav className="p-6 flex flex-col gap-6 font-bold text-lg text-[var(--color-chocolate)]">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--color-primary)] transition-colors flex items-center gap-3">
                <span className="text-xl">🏠</span> Inicio
              </Link>
              <button
                onClick={() => {
                  document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
                  setIsMobileMenuOpen(false);
                }}
                className="text-left hover:text-[var(--color-primary)] transition-colors flex items-center gap-3"
              >
                <span className="text-xl">🍰</span> Catálogo
              </button>

              <div className="border-t my-2" />

              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-[10px] text-gray-400 uppercase mb-1 tracking-wider">Sesión Activa</p>
                    <p className="text-sm font-bold truncate text-[var(--color-chocolate)]">{user.email}</p>
                  </div>
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-left text-red-500 hover:text-red-700 transition-colors flex items-center gap-3 px-2">
                    <span className="text-xl">🚪</span> Salir
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left py-2 hover:text-[var(--color-primary)] transition-colors flex items-center gap-3 px-2"
                >
                  <span className="text-xl">👤</span> Ingresar
                </button>
              )}
            </nav>

            <div className="mt-auto p-6 bg-gray-50 border-t text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center italic">
              — Pinecrest Bakery & Cafe —
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ currentUser, setCartMsg }: { currentUser: any, setCartMsg: (msg: string) => void }) {
  const [activeTab, setActiveTab] = useState("products");
  const [locations, setLocations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: '', message: '', onConfirm: () => { } });

  // Edit Product Modal
  const [editProduct, setEditProduct] = useState<any>(null);

  // Product Form State
  const [priceRaw, setPriceRaw] = useState("");
  const [stockRaw, setStockRaw] = useState("");
  const [newProductImage, setNewProductImage] = useState(""); // URL of uploaded image

  const handleFileUpload = async (e: any, setUrl: (url: string) => void) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setUrl(data.url); // Set the URL in state
      } else {
        alert("Error uploading image");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  const fetchLocations = async () => {
    const res = await fetch(`${API_BASE}/api/locations`, { credentials: "include" });
    if (res.ok) setLocations(await res.json());
  };

  const fetchUsers = async () => {
    const res = await fetch(`${API_BASE}/api/users`, { credentials: "include" });
    if (res.ok) setUsers(await res.json());
  };

  const fetchProducts = async () => {
    const res = await fetch(`${API_BASE}/api/products`, { credentials: "include" });
    if (res.ok) setProducts(await res.json());
  };

  const fetchCategories = async () => {
    const res = await fetch(`${API_BASE}/api/categories`, { credentials: "include" });
    if (res.ok) setCategories(await res.json());
  };

  useEffect(() => {
    if (activeTab === "locations") fetchLocations();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "categories") fetchCategories();
    if (activeTab === "products") {
      fetchProducts();
      fetchLocations(); // Needed for initial inventory in create form
      fetchCategories(); // Needed for categories select
    }
  }, [activeTab]);

  const handleCreateLocation = async (e: any) => {
    e.preventDefault();
    const name = e.target.locName.value;
    const address = e.target.locAddress.value;
    const phone = e.target.locPhone?.value || "";

    const res = await fetch(`${API_BASE}/api/locations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address, phone }),
      credentials: "include"
    });
    if (res.ok) {
      e.target.reset();
      setShowLocationForm(false);
      fetchLocations();
    } else {
      const d = await res.json();
      alert("Error: " + d.detail);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    const res = await fetch(`${API_BASE}/api/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
      credentials: "include"
    });
    if (res.ok) fetchUsers();
    else alert("Error updating role");
  };

  const handleCreateUser = async (e: any) => {
    e.preventDefault();
    const email = e.target.uEmail.value;
    const password = e.target.uPass.value;
    const role = e.target.uRole.value;

    const res = await fetch(`${API_BASE}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
      credentials: "include"
    });
    if (res.ok) {
      e.target.reset();
      fetchUsers();
      alert("Usuario creado exitosamente");
    } else {
      const d = await res.json();
      alert("Error: " + d.detail);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex animate-in fade-in zoom-in duration-200">
        <div className="w-64 bg-gray-50 border-r border-gray-100 flex flex-col p-6">
          <div className="mb-8 pl-2">
            <h2 className="text-xl font-extrabold text-gray-800 uppercase tracking-widest">Admin</h2>
            <p className="text-xs text-gray-400">PB Pasteles Manager</p>
            <p className="text-xs font-bold text-[var(--color-primary)] mt-1">{currentUser?.role || "OWNER"}</p>
          </div>
          <nav className="space-y-2 flex-grow">
            <button onClick={() => setActiveTab("products")} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === "products" ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-gray-500 hover:bg-gray-100"}`}><span>📦</span> Productos</button>
            <button onClick={() => setActiveTab("categories")} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === "categories" ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-gray-500 hover:bg-gray-100"}`}><span>🏷️</span> Categorías</button>
            <button onClick={() => setActiveTab("orders")} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === "orders" ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-gray-500 hover:bg-gray-100"}`}><span>📃</span> Ordenes</button>
            <button onClick={() => setActiveTab("locations")} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === "locations" ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-gray-500 hover:bg-gray-100"}`}><span>📍</span> Sedes</button>
            <button onClick={() => setActiveTab("users")} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === "users" ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-gray-500 hover:bg-gray-100"}`}><span>👥</span> Usuarios</button>
          </nav>
          <button onClick={() => (document.getElementById('owner_modal') as HTMLDialogElement)?.close()} className="mt-auto flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm font-bold px-4 py-3 transition-colors">⛔ Cerrar</button>
        </div>
        <div className="flex-grow overflow-y-auto bg-white p-10">

          {/* CATEGORIES TAB */}
          {activeTab === "categories" && (
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-[var(--color-chocolate)]">Gestión de Categorías</h3>
              </div>

              {/* Categories Layout: Form Top, List Bottom */}
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Create Form - Top */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-[var(--color-chocolate)] mb-4">Nueva Categoría</h4>
                  <form onSubmit={async (e: React.FormEvent) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const name = (form.elements.namedItem('catName') as HTMLInputElement).value;
                    if (!name.trim()) return;

                    const res = await fetch(`${API_BASE}/api/categories`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name }),
                      credentials: "include"
                    });

                    if (res.ok) {
                      form.reset();
                      fetchCategories();
                      setCartMsg("✅ Categoría creada");
                      setTimeout(() => setCartMsg(""), 3000);
                    } else {
                      const d = await res.json();
                      setCartMsg("❌ Error: " + (d.detail || "Error al crear categoría"));
                      setTimeout(() => setCartMsg(""), 3000);
                    }
                  }} className="flex flex-col md:flex-row gap-4">
                    <input
                      type="text"
                      name="catName"
                      placeholder="Nombre (ej. Panadería)"
                      className="flex-1 p-3 border rounded-xl"
                      required
                    />
                    <button className="bg-[var(--color-primary)] text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 whitespace-nowrap">
                      Crear Categoría
                    </button>
                  </form>
                </div>

                {/* List - Bottom */}
                <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                      <tr className="text-xs font-bold uppercase text-gray-400">
                        <th className="py-3 px-6">Nombre de la Categoría</th>
                        <th className="py-3 px-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length === 0 ? (
                        <tr><td colSpan={2} className="py-12 text-center text-gray-400">No hay categorías registradas.</td></tr>
                      ) : categories.map((cat: any) => (
                        <tr key={cat._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 font-bold text-gray-700">{cat.name}</td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => {
                                setConfirmModal({
                                  show: true,
                                  title: 'Eliminar Categoría',
                                  message: `¿Estás seguro de que deseas eliminar la categoría "${cat.name}"?`,
                                  onConfirm: async () => {
                                    setConfirmModal(prev => ({ ...prev, show: false }));
                                    const res = await fetch(`${API_BASE}/api/categories/${cat._id}`, {
                                      method: "DELETE",
                                      credentials: "include"
                                    });
                                    if (res.ok) {
                                      fetchCategories();
                                      setCartMsg("✅ Categoría eliminada");
                                      setTimeout(() => setCartMsg(""), 3000);
                                    } else {
                                      setCartMsg("❌ Error al eliminar categoría");
                                      setTimeout(() => setCartMsg(""), 3000);
                                    }
                                  }
                                });
                              }}
                              className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === "products" && (
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-[var(--color-chocolate)]">Gestión de Productos</h3>
                <button
                  onClick={() => setShowProductForm(!showProductForm)}
                  className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl font-bold hover:opacity-90"
                >
                  {showProductForm ? "Ocultar Formulario" : "+ Nuevo Producto"}
                </button>
              </div>


              {/* CREATE PRODUCT FORM (Collapsible) */}
              {showProductForm && (
                <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                  <h4 className="font-bold mb-4">Nuevo Producto</h4>
                  <form onSubmit={async (e: any) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const name = formData.get("pname");
                    const desc = formData.get("pdesc");
                    const cat = formData.get("pcat");
                    const price = parseFloat(priceRaw.replace(/,/g, ""));

                    // Construct initial inventory
                    const initial_inventory = locations
                      .filter(loc => loc.is_active)
                      .map(loc => {
                        const val = formData.get(`stock_${loc._id}`);
                        return {
                          location_id: loc._id,
                          quantity: val ? parseInt(val.toString()) : 0
                        };
                      })
                      .filter(item => item.quantity > 0);

                    if (isNaN(price)) {
                      setCartMsg("❌ Precio inválido");
                      setTimeout(() => setCartMsg(""), 3000);
                      return;
                    }

                    const deliveryDays = formData.get("pdelivery") || "immediate";
                    const taxRate = parseFloat(formData.get("ptax")?.toString() || "0");

                    const res = await fetch(`${API_BASE}/api/products`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name,
                        description: desc,
                        price,
                        initial_inventory,
                        category: cat,
                        images: newProductImage ? [newProductImage] : [],
                        delivery_days: deliveryDays,
                        tax_rate: isNaN(taxRate) ? 0 : taxRate
                      }),
                      credentials: "include"
                    });
                    if (res.ok) {
                      e.target.reset();
                      setPriceRaw("");
                      setNewProductImage(""); // Reset image
                      setShowProductForm(false);
                      fetchProducts(); // Refresh product list
                      setCartMsg("✅ Producto guardado");
                      setTimeout(() => setCartMsg(""), 3000);
                    }
                    else {
                      setCartMsg("❌ Error al guardar producto");
                      setTimeout(() => setCartMsg(""), 3000);
                    }
                  }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold uppercase text-gray-500 mb-2">Nombre</label><input name="pname" className="w-full border p-3 rounded-xl" required /></div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Categoría</label>
                        <select name="pcat" className="w-full border p-3 rounded-xl bg-white" required>
                          <option value="">Seleccionar...</option>
                          {categories.map((c: any) => (
                            <option key={c._id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div><label className="block text-xs font-bold uppercase text-gray-500 mb-2">Descripción</label><textarea name="pdesc" rows={2} className="w-full border p-3 rounded-xl" required></textarea></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Precio ($)</label>
                        <input type="text" value={priceRaw} onChange={(e) => setPriceRaw(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full border p-3 rounded-xl font-bold" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Tax / Impuesto (%)</label>
                        <input type="number" name="ptax" step="0.01" min="0" max="100" placeholder="0" className="w-full border p-3 rounded-xl font-bold" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Disponibilidad de Entrega</label>
                      <select name="pdelivery" className="w-full border p-3 rounded-xl bg-white">
                        <option value="immediate">Inmediata</option>
                        <option value="1">1 Día</option>
                        <option value="2">2 Días</option>
                        <option value="3">3 Días</option>
                        <option value="5">5 Días</option>
                        <option value="7">7 Días</option>
                        <option value="custom">Personalizado / Consultar</option>
                      </select>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Imagen del Producto</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, setNewProductImage)}
                          className="w-full border p-3 rounded-xl bg-white"
                        />
                        {newProductImage && (
                          <img src={newProductImage.startsWith('/') ? `${API_BASE}${newProductImage}` : newProductImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg border shadow-sm" />
                        )}
                      </div>
                    </div>

                    {/* Inventory per Location */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <h5 className="text-sm font-bold text-gray-500 uppercase mb-3">Inventario Inicial por Sede</h5>
                      {locations.length === 0 ? (
                        <p className="text-xs text-red-400">No hay sedes activas para asignar inventario.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {locations.filter(l => l.is_active).map(loc => (
                            <div key={loc._id} className="flex items-center gap-2">
                              <label className="text-xs font-bold w-1/2 truncate" title={loc.name}>{loc.name}</label>
                              <input
                                type="number"
                                name={`stock_${loc._id}`}
                                placeholder="0"
                                min="0"
                                className="w-1/2 border p-2 rounded-lg text-sm text-center"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button type="submit" className="w-full bg-[var(--color-chocolate)] text-white p-3 rounded-xl font-bold hover:opacity-90">Guardar Producto</button>
                  </form>
                </div>
              )}


              {/* PRODUCT LIST */}
              <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr className="text-xs font-bold uppercase text-gray-400">
                      <th className="py-3 px-4">Producto</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4">Precio</th>
                      <th className="py-3 px-4">Stock Global</th>
                      <th className="py-3 px-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr><td colSpan={5} className="py-8 text-center text-gray-400">No hay productos. Crea uno nuevo.</td></tr>
                    ) : products.map(p => (
                      <tr key={p._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-sm">{p.name}</div>
                          <div className="text-xs text-gray-400 truncate max-w-xs">{p.description}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">{p.category}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-green-600">${p.price.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>{p.stock}</span>
                        </td>
                        <td className="py-3 px-4">
                          <InventoryManager
                            product={p}
                            onUpdate={() => fetchProducts()}
                          />
                          <button
                            onClick={() => {
                              setEditProduct(p);
                              setPriceRaw(p.price.toString());
                              setStockRaw(p.stock.toString());
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-bold mr-3"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                show: true,
                                title: '¿Eliminar producto?',
                                message: `Confirma que deseas eliminar "${p.name}". Esta acción no se puede deshacer.`,
                                onConfirm: async () => {
                                  setConfirmModal(prev => ({ ...prev, show: false }));
                                  const res = await fetch(`${API_BASE}/api/products/${p._id}`, {
                                    method: "DELETE",
                                    credentials: "include"
                                  });
                                  if (res.ok) {
                                    fetchProducts();
                                    setCartMsg("✅ Producto eliminado");
                                    setTimeout(() => setCartMsg(""), 3000);
                                  } else {
                                    const d = await res.json();
                                    setCartMsg(`❌ Error: ${d.detail || "Error al eliminar"}`);
                                    setTimeout(() => setCartMsg(""), 3000);
                                  }
                                }
                              });
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-bold"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && <div className="text-center py-20 opacity-50"><h3 className="text-xl font-bold">No hay ordenes recientes</h3></div>}

          {/* LOCATIONS TAB */}
          {activeTab === "locations" && (
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-[var(--color-chocolate)]">Gestión de Sedes</h3>
                <button
                  onClick={() => setShowLocationForm(!showLocationForm)}
                  className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl font-bold hover:opacity-90"
                >
                  {showLocationForm ? "Ocultar Formulario" : "+ Nueva Sede"}
                </button>
              </div>

              {/* CREATE LOCATION FORM (Collapsible) */}
              {showLocationForm && (
                <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                  <h4 className="font-bold mb-4">Nueva Sede</h4>
                  <form onSubmit={handleCreateLocation} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Nombre</label>
                        <input name="locName" placeholder="Ej. Sede Norte" className="w-full p-3 border rounded-xl" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Teléfono</label>
                        <input name="locPhone" placeholder="Ej. (123) 456-7890" className="w-full p-3 border rounded-xl" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Dirección</label>
                      <input name="locAddress" placeholder="Calle Principal #123" className="w-full p-3 border rounded-xl" required />
                    </div>
                    <button type="submit" className="w-full bg-[var(--color-chocolate)] text-white p-3 rounded-xl font-bold hover:opacity-90">Crear Sede</button>
                  </form>
                </div>
              )}

              {/* LOCATION LIST */}
              <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr className="text-xs font-bold uppercase text-gray-400">
                      <th className="py-3 px-4">Sede</th>
                      <th className="py-3 px-4">Dirección</th>
                      <th className="py-3 px-4">Teléfono</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.length === 0 ? (
                      <tr><td colSpan={5} className="py-8 text-center text-gray-400">No hay sedes registradas.</td></tr>
                    ) : locations.map((loc: any) => (
                      <tr key={loc._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-sm">{loc.name}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{loc.address || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{loc.phone || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${loc.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {loc.is_active ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-bold mr-3">✏️ Editar</button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                show: true,
                                title: 'Eliminar Sede',
                                message: `¿Estás seguro de que deseas eliminar la sede "${loc.name}"?`,
                                onConfirm: async () => {
                                  setConfirmModal(prev => ({ ...prev, show: false }));
                                  const res = await fetch(`${API_BASE}/api/locations/${loc._id}`, {
                                    method: "DELETE",
                                    credentials: "include"
                                  });
                                  if (res.ok) {
                                    fetchLocations();
                                    setCartMsg("✅ Sede eliminada");
                                    setTimeout(() => setCartMsg(""), 3000);
                                  } else {
                                    const d = await res.json();
                                    setCartMsg(`❌ Error: ${d.detail || "Error al eliminar"}`);
                                    setTimeout(() => setCartMsg(""), 3000);
                                  }
                                }
                              });
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-bold"
                          >
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* USERS TAB */}
          {activeTab === "users" && (
            <div className="max-w-6xl mx-auto">
              <div className="flex gap-8">
                {/* CREATE USER FORM */}
                <div className="w-1/3 bg-gray-50 p-6 rounded-2xl h-fit">
                  <h4 className="font-bold mb-4">Nuevo Usuario</h4>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <input name="uEmail" type="email" placeholder="Email" className="w-full p-3 border rounded-xl" required />
                    <input name="uPass" type="password" placeholder="Contraseña" className="w-full p-3 border rounded-xl" required />
                    <select name="uRole" className="w-full p-3 border rounded-xl bg-white">
                      <option value="CUSTOMER">Cliente</option>
                      <option value="SALES">Ventas (Cajero)</option>
                      <option value="INVENTORY_MANAGER">Inventario</option>
                      <option value="PRODUCT_MANAGER">Manager Productos</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                    <button type="submit" className="w-full bg-[var(--color-chocolate)] text-white font-bold py-3 rounded-xl hover:opacity-90">Crear Usuario</button>
                  </form>
                </div>

                {/* USER LIST */}
                <div className="w-2/3">
                  <h3 className="text-2xl font-bold text-[var(--color-chocolate)] mb-6">Usuarios Registrados</h3>
                  <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr className="text-xs font-bold uppercase text-gray-400">
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Rol</th>
                          <th className="py-3 px-4">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u: any) => (
                          <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                            <td className="py-3 px-4 font-bold text-sm">{u.email}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                defaultValue={u.role}
                                onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
                                className="bg-white border border-gray-300 rounded-lg text-xs px-2 py-1"
                              >
                                {["OWNER", "ADMIN", "PRODUCT_MANAGER", "INVENTORY_MANAGER", "SALES", "CUSTOMER"].map(r => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* PREMIUM CONFIRMATION MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 animate-in zoom-in duration-200 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
              <span className="text-4xl" role="img" aria-label="warning">⚠️</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">{confirmModal.title}</h3>
            <p className="text-gray-500 mb-8 leading-relaxed font-medium">{confirmModal.message}</p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: () => { } })}
                className="flex-1 px-6 py-4 bg-gray-50 text-gray-600 rounded-2xl font-black hover:bg-gray-100 transition-all border border-gray-200 active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {
        editProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-[var(--color-chocolate)]">Editar Producto</h3>
                <button onClick={() => setEditProduct(null)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
              </div>
              {editProduct && (
                <form onSubmit={async (e: any) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const name = formData.get("pname");
                  const desc = formData.get("pdesc");
                  const cat = formData.get("pcat");
                  const price = parseFloat(priceRaw.replace(/,/g, ""));

                  if (isNaN(price)) {
                    setCartMsg("❌ Precio inválido");
                    setTimeout(() => setCartMsg(""), 3000);
                    return;
                  }

                  const editDelivery = formData.get("pdelivery") || editProduct.delivery_days || "immediate";
                  const editTax = parseFloat(formData.get("ptax")?.toString() || "0");

                  const res = await fetch(`${API_BASE}/api/products/${editProduct._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name,
                      description: desc,
                      price,
                      category: cat,
                      images: editProduct.images || [],
                      is_featured: editProduct.is_featured || false,
                      delivery_days: editDelivery,
                      tax_rate: isNaN(editTax) ? 0 : editTax
                    }),
                    credentials: "include"
                  });
                  if (res.ok) {
                    setEditProduct(null);
                    fetchProducts();
                    setCartMsg("✅ Producto actualizado");
                    setTimeout(() => setCartMsg(""), 3000);
                  } else {
                    const d = await res.json();
                    setCartMsg("❌ Error: " + (d.detail || "Error desconocido"));
                    setTimeout(() => setCartMsg(""), 3000);
                  }
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Nombre</label>
                      <input name="pname" defaultValue={editProduct.name} className="w-full border p-3 rounded-xl" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Categoría</label>
                      <select name="pcat" defaultValue={editProduct.category} className="w-full border p-3 rounded-xl bg-white" required>
                        <option value="">Seleccionar...</option>
                        {categories.map((c: any) => (
                          <option key={c._id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Descripción</label>
                    <textarea name="pdesc" rows={2} defaultValue={editProduct.description} className="w-full border p-3 rounded-xl" required></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Precio ($)</label>
                      <input type="text" value={priceRaw} onChange={(e) => setPriceRaw(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full border p-3 rounded-xl font-bold" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Tax / Impuesto (%)</label>
                      <input type="number" name="ptax" step="0.01" min="0" max="100" defaultValue={editProduct.tax_rate || 0} className="w-full border p-3 rounded-xl font-bold" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Disponibilidad de Entrega</label>
                      <select name="pdelivery" defaultValue={editProduct.delivery_days || "immediate"} className="w-full border p-3 rounded-xl bg-white">
                        <option value="immediate">Inmediata</option>
                        <option value="1">1 Día</option>
                        <option value="2">2 Días</option>
                        <option value="3">3 Días</option>
                        <option value="5">5 Días</option>
                        <option value="7">7 Días</option>
                        <option value="custom">Personalizado / Consultar</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Stock Total (Sedes)</label>
                      <input type="number" value={editProduct.stock} disabled className="w-full border p-3 rounded-xl font-bold bg-gray-100 text-gray-500 cursor-not-allowed" />
                      <p className="text-[10px] text-blue-500 mt-1 font-bold">Gestionar en "📦 Inventario"</p>
                    </div>
                  </div>

                  {/* Image Upload for Edit */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Imagen del Producto</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, (url) => setEditProduct({ ...editProduct, images: [url] }))}
                        className="w-full border p-3 rounded-xl bg-white"
                      />
                      {editProduct.images && editProduct.images.length > 0 && (
                        <img src={editProduct.images[0].startsWith('/') ? `${API_BASE}${editProduct.images[0]}` : editProduct.images[0]} alt="Preview" className="w-16 h-16 object-cover rounded-lg border shadow-sm" />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setEditProduct(null)} className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-xl font-bold hover:bg-gray-200">Cancelar</button>
                    <button type="submit" className="flex-1 bg-[var(--color-chocolate)] text-white p-3 rounded-xl font-bold hover:opacity-90">Guardar Cambios</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )
      }
    </div>
  );
}

function HeroCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images]);

  const defaultHero = "https://images.unsplash.com/photo-1626803775151-61d756612fcd?q=80&w=2070&auto=format&fit=crop";
  const displayImages = images.length > 0 ? images : [defaultHero];

  return (
    <section className="relative h-[220px] md:h-[700px] overflow-hidden bg-gray-900 shadow-inner">
      {displayImages.map((img, idx) => (
        <div
          key={img}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? "opacity-100" : "opacity-0"
            }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 transform scale-100"
            style={{ backgroundImage: `url('${img}')` }}
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
      ))}

      {/* Navigation elements */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-4 py-2">
        {displayImages.length > 1 && (
          <div className="flex gap-1.5 md:gap-2">
            {displayImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${idx === currentIndex ? "bg-white w-6 md:w-8" : "bg-white/40 hover:bg-white/60"
                  }`}
              />
            ))}
          </div>
        )}
        <button
          onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
          className="bg-[var(--color-primary)] text-white px-4 py-1.5 md:px-6 md:py-2 rounded-full font-bold text-xs md:text-sm shadow-lg hover:bg-white hover:text-[var(--color-primary)] transition-all transform hover:scale-105"
        >
          Ver Catálogo
        </button>
      </div>
    </section>
  );
}
