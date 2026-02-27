"use client";
import React from 'react';
import Link from 'next/link';
import { API_BASE } from '../utils/api';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onLogout: () => void;
    onLoginClick: () => void;
}

export default function MobileMenu({ isOpen, onClose, user, onLogout, onLoginClick }: MobileMenuProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] md:hidden">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            {/* Drawer Content */}
            <div className="absolute top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                {/* Search Header */}
                <div className="flex items-center border-b">
                    <input
                        type="text"
                        placeholder="Search"
                        className="flex-grow px-4 py-4 text-gray-500 outline-none font-medium"
                    />
                    <button className="bg-[var(--color-primary)] text-white p-4 flex items-center justify-center">
                        <span className="text-xl">🔍</span>
                    </button>
                    <button onClick={onClose} className="p-4 text-2xl text-black border-l">✕</button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-grow overflow-y-auto">
                    <ul className="flex flex-col">
                        {[
                            { name: 'MENU', href: '/menu', hasChevron: false },
                            { name: 'ORDER PARTY ITEMS', href: '/order-party-items', hasChevron: true },
                            { name: 'CATERING', href: '/catering', hasChevron: false },
                            { name: 'CAKES', href: '/cakes', hasChevron: true },
                            { name: 'ABOUT US', href: '/about-us', hasChevron: true },
                            { name: 'BOUNCE BACK FROM CANCER', href: '/bounce-back', hasChevron: false },
                            { name: 'BLOG | PRESS', href: '/blog-press', hasChevron: false },
                            { name: 'ORDER BAKERY NOW', href: '/order-now', hasChevron: false },
                        ].map((item) => (
                            <li key={item.name} className="border-b">
                                <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-bold text-sm tracking-wide text-black uppercase">{item.name}</span>
                                    {item.hasChevron && (
                                        <span className="text-gray-400 text-xs">❯</span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Footer Actions in Menu */}
                    <div className="p-4 flex flex-col gap-4">
                        <Link href="/wishlist" onClick={onClose} className="text-black font-medium text-sm">Wishlist</Link>

                        {user ? (
                            <div className="flex flex-col gap-4">
                                <div className="text-black font-medium text-sm truncate">
                                    {user.email}
                                </div>
                                {['ADMIN', 'OWNER', 'PRODUCT_MANAGER', 'INVENTORY_MANAGER'].includes(user.role) && (
                                    <Link
                                        href="/admin"
                                        onClick={onClose}
                                        className="text-black font-bold text-sm bg-gray-100 p-3 rounded-xl flex items-center gap-2"
                                    >
                                        🛠️ Admin Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={() => { onLogout(); onClose(); }}
                                    className="text-left text-red-500 font-bold text-sm px-1"
                                >
                                    Log out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { onLoginClick(); onClose(); }}
                                className="text-left text-black font-medium text-sm"
                            >
                                Log in
                            </button>
                        )}
                    </div>
                </nav>

                {/* Bottom Banner */}
                <div className="bg-[var(--color-primary)] text-white py-3 px-4 text-center font-bold text-sm">
                    Get 10% Off!
                </div>
            </div>
        </div>
    );
}
