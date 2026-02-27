"use client";
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ComingSoon from '../components/ComingSoon';
import MobileMenu from '../components/MobileMenu';
import { API_BASE } from '../utils/api';

export default function GenericComingSoonPage({ title = "Próximamente" }) {
    const [user, setUser] = useState(null);
    const [currentCart, setCurrentCart] = useState({});
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE}/api/auth/me`, { credentials: "include" })
            .then(res => res.ok ? res.json() : null)
            .then(setUser);

        const sessId = localStorage.getItem("session_id");
        if (sessId) {
            fetch(`${API_BASE}/api/cart`, { headers: { "x-session-id": sessId }, credentials: "include" })
                .then(res => res.ok ? res.json() : {})
                .then(setCurrentCart);
        }
    }, []);

    const cartCount = Object.values(currentCart).reduce((acc: number, val: any) => acc + parseInt(val), 0);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header
                searchQuery=""
                setSearchQuery={() => { }}
                cartCount={cartCount}
                user={user}
                onLogout={() => window.location.reload()}
                onLoginClick={() => { }}
                onMobileMenuClick={() => setIsMobileMenuOpen(true)}
            />

            <ComingSoon title={title} />

            <footer className="py-12 bg-[#2a221d] text-white/50 text-center">
                <p className="text-sm font-bold uppercase tracking-widest">&copy; 2026 Pinecrest Bakery</p>
            </footer>

            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                user={user}
                onLogout={() => window.location.reload()}
                onLoginClick={() => { }}
            />
        </div>
    );
}
