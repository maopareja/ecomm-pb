"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE } from '../utils/api';
import Header from '../components/Header';
import MobileMenu from '../components/MobileMenu';

/**
 * Propósito: Esta página muestra el catálogo completo de productos agrupados por categorías.
 * Sigue un diseño premium con títulos rojos, divisores amarillos y un layout de 2 columnas.
 */

export default function MenuPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState<any>(null);
    const [currentCart, setCurrentCart] = useState<any>({});
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [cartMsg, setCartMsg] = useState("");

    useEffect(() => {
        fetchUser();
        fetchData();
        fetchCart();
    }, []);

    const fetchUser = () => {
        fetch(`${API_BASE}/api/auth/me`, { credentials: "include" })
            .then(res => res.ok ? res.json() : null)
            .then(setUser)
            .catch(() => setUser(null));
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes] = await Promise.all([
                fetch(`${API_BASE}/api/products`, { credentials: "include" }),
                fetch(`${API_BASE}/api/categories`, { credentials: "include" })
            ]);

            const prods = await prodRes.json();
            const cats = await catRes.json();

            setProducts(prods);
            setCategories(cats);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
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
    };

    const addToCart = async (product: any) => {
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
        }
    };

    const handleLogout = async () => {
        await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
        window.location.reload();
    };

    const cartCount = Object.values(currentCart).reduce((acc: number, val: any) => acc + parseInt(val), 0);

    // Group products by category
    const groupedProducts = categories.map(cat => ({
        ...cat,
        items: products.filter(p => p.category_id === cat._id || p.category === cat.name)
    })).filter(group => group.items.length > 0);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-xl font-bold animate-pulse text-[var(--color-primary)]">Cargando Menú...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans text-[var(--color-chocolate)]">
            <Header
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                cartCount={cartCount}
                user={user}
                onLogout={handleLogout}
                onLoginClick={() => { }} // Handle redirection if needed
                onMobileMenuClick={() => setIsMobileMenuOpen(true)}
            />

            <main className="container mx-auto px-4 md:px-8 py-12 max-w-6xl">
                <h1 className="text-center text-4xl md:text-5xl font-serif mb-2 text-[var(--color-chocolate)]">Menu</h1>

                {groupedProducts.map((group) => (
                    <section key={group._id} className="mb-16">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-primary)] mb-2 uppercase tracking-wide">
                                {group.name}
                            </h2>
                            <div className="h-0.5 w-full bg-[var(--color-accent)] max-w-4xl mx-auto shadow-sm"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {group.items.map((product: any) => (
                                <div key={product._id} className="flex gap-4 group cursor-pointer" onClick={() => addToCart(product)}>
                                    <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden relative border border-gray-100">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0].startsWith('/') ? `${API_BASE}${product.images[0]}` : product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl">🧁</div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-start">
                                        <h3 className="text-lg md:text-xl font-bold text-[#4a3933] group-hover:text-[var(--color-primary)] transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mt-1">
                                            {product.description || "Delicioso producto artesanal hecho con los mejores ingredientes."}
                                        </p>
                                        <p className="text-[var(--color-primary)] font-bold mt-2">
                                            ${product.price.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </main>

            <footer className="py-12 bg-[#2a221d] text-white">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-sm opacity-50">&copy; 2026 Pinecrest Bakery. Todos los derechos reservados.</p>
                </div>
            </footer>

            {cartMsg && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-[var(--color-chocolate)] text-white px-6 py-3 rounded-full shadow-2xl font-bold">
                        {cartMsg}
                    </div>
                </div>
            )}

            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                user={user}
                onLogout={handleLogout}
                onLoginClick={() => { }}
            />
        </div>
    );
}
