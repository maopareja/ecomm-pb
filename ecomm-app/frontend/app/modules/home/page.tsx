"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function HomeModulePage() {
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchUser();
    }, [router]);

    const fetchUser = () => {
        fetch(`${API_BASE}/api/auth/me`, { credentials: "include" })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setUser(data);
                    setIsCheckingAuth(false);
                } else {
                    console.warn("Auth check failed, redirecting to login");
                    window.location.href = "http://vetnexus.local?mode=login";
                }
            })
            .catch((err) => {
                console.error("Fetch user error:", err);
                window.location.href = "http://vetnexus.local?mode=login";
            });
    };

    const handleLogout = async () => {
        await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
        window.location.href = "/";
    };

    if (isCheckingAuth) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold">Verificando sesión...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                            title="Volver"
                        >
                            ←
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Módulo Home</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        {user && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="font-medium">{user.email}</span>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Módulo en Desarrollo</h2>
                        <p className="text-gray-500">Este módulo se encuentra actualmente en migración o desarrollo.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

