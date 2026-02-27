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
            <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                <div className="p-6 border-b flex justify-between items-center bg-white">
                    <img src={`${API_BASE}/PB_logo.png`} alt="Logo" className="h-10 w-auto" />
                    <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <nav className="p-6 flex flex-col gap-6 font-bold text-lg text-[var(--color-chocolate)]">
                    <Link href="/" onClick={onClose} className="hover:text-[var(--color-primary)] transition-colors flex items-center gap-3">
                        <span className="text-xl">🏠</span> Inicio
                    </Link>
                    <button
                        onClick={() => {
                            document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
                            onClose();
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
                            <button onClick={() => { onLogout(); onClose(); }} className="text-left text-red-500 hover:text-red-700 transition-colors flex items-center gap-3 px-2">
                                <span className="text-xl">🚪</span> Salir
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                onLoginClick();
                                onClose();
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
    );
}
