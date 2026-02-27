"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '../components/AdminDashboard';
import { API_BASE } from '../utils/api';

export default function AdminPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cartMsg, setCartMsg] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetch(`${API_BASE}/api/auth/me`, { credentials: "include" })
            .then(res => res.ok ? res.json() : null)
            .then(userData => {
                if (!userData || !(['OWNER', 'ADMIN', 'MANAGER', 'PRODUCT_MANAGER', 'INVENTORY_MANAGER'].includes(userData.role) || userData.is_owner)) {
                    router.push('/');
                } else {
                    setUser(userData);
                }
                setLoading(false);
            })
            .catch(() => {
                router.push('/');
                setLoading(false);
            });
    }, [router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">Loading...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {cartMsg && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl font-bold">
                        {cartMsg}
                    </div>
                </div>
            )}
            <AdminDashboard
                currentUser={user}
                setCartMsg={setCartMsg}
                onClose={() => router.push('/')}
            />
        </div>
    );
}
