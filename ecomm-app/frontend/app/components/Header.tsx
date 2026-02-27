"use client";
import React from 'react';
import Link from 'next/link';
import { API_BASE } from '../utils/api';

interface HeaderProps {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    cartCount: number;
    user: any;
    onLogout: () => void;
    onLoginClick: () => void;
    onMobileMenuClick: () => void;
}

export default function Header({
    searchQuery,
    setSearchQuery,
    cartCount,
    user,
    onLogout,
    onLoginClick,
    onMobileMenuClick
}: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-[var(--color-primary)]/20">
            <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">

                {/* Hamburger Menu (Mobile) */}
                <button
                    onClick={onMobileMenuClick}
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
                            <button onClick={onLogout} className="text-xs text-red-500 hover:text-red-700 font-bold ml-2">Salir</button>
                        </div>
                    ) : (
                        <button onClick={onLoginClick} className="hidden md:block font-bold hover:text-[var(--color-primary)] transition-colors text-sm">Ingresar</button>
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

            {/* Desktop Navigation Menu */}
            <div className="hidden md:block border-t border-gray-100 py-4">
                <nav className="container mx-auto px-4 md:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/menu" className="text-[var(--color-primary)] font-bold text-sm tracking-wider hover:opacity-80 transition-opacity">MENU</Link>
                        <Link href="/order-party-items" className="text-black font-bold text-sm tracking-wider hover:text-[var(--color-primary)] transition-colors">ORDER PARTY ITEMS</Link>
                        <Link href="/catering" className="text-black font-bold text-sm tracking-wider hover:text-[var(--color-primary)] transition-colors">CATERING</Link>
                        <Link href="/cakes" className="text-black font-bold text-sm tracking-wider hover:text-[var(--color-primary)] transition-colors">CAKES</Link>
                        <Link href="/about-us" className="text-black font-bold text-sm tracking-wider hover:text-[var(--color-primary)] transition-colors">ABOUT US</Link>
                        <Link href="/bounce-back" className="text-black font-bold text-sm tracking-wider hover:text-[var(--color-primary)] transition-colors">BOUNCE BACK FROM CANCER</Link>
                        <Link href="/blog-press" className="text-black font-bold text-sm tracking-wider hover:text-[var(--color-primary)] transition-colors">BLOG | PRESS</Link>
                    </div>
                    <Link
                        href="/order-now"
                        className="bg-[var(--color-primary)] text-white px-6 py-2.5 font-bold text-sm tracking-wider hover:shadow-lg hover:scale-105 transition-all"
                    >
                        ORDER BAKERY NOW
                    </Link>
                </nav>
            </div>

            {/* Mobile Search (Below Header) */}
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
    );
}
