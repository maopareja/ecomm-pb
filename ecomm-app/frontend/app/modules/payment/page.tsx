"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function PaymentPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleActivate = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/modules/activate`, {
                method: "POST",
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                alert("Módulos activados correctamente!");
                // Redirect to the tenant's home
                // We assume we are on the subdomain or can get it from the user context
                window.location.href = "/"; // If on subdomain, this is fine
            } else {
                alert("Error al activar módulos");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white py-20 px-6 flex items-center justify-center">
            <div className="max-w-md w-full p-8 rounded-3xl border border-gray-100 shadow-2xl text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">💳</div>
                <h1 className="text-3xl font-bold mb-4">Finaliza tu Pago</h1>
                <p className="text-gray-500 mb-8">Estás a un paso de activar tu plataforma veterinaria profesional.</p>

                <div className="bg-gray-50 p-6 rounded-2xl mb-8 text-left">
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-bold">Calculando...</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t border-gray-200 pt-4">
                        <span>Total a Pagar</span>
                        <span>Confirmar en Backend</span>
                    </div>
                </div>

                <button
                    onClick={handleActivate}
                    disabled={loading}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                >
                    {loading ? "Procesando..." : "Pagar y Activar Ahora"}
                </button>

                <p className="mt-6 text-xs text-gray-400">Pago simulado para entorno de desarrollo.</p>
            </div>
        </div>
    );
}
