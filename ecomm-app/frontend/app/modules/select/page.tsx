"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const AVAILABLE_MODULES = [
    {
        id: "online_sales",
        name: "Venta en Línea",
        price: 29.99,
        icon: "🛒",
        desc: "Tienda online completa para vender productos veterinarios",
        features: ["Catálogo de productos", "Carrito de compras", "Pasarela de pagos", "Gestión de inventario"]
    },
    {
        id: "pos",
        name: "Punto de Venta",
        price: 39.99,
        icon: "📟",
        desc: "Sistema POS para ventas presenciales en tu clínica",
        features: ["Ventas presenciales", "Inventario en tiempo real", "Reportes de caja", "Control de turnos"]
    },
    {
        id: "home_package",
        name: "Historia Clinica",
        price: 49.99,
        icon: "🏠",
        desc: "Gestión de servicios veterinarios a domicilio",
        features: ["Historia clínica básica", "Gestión de citas", "Recordatorios automáticos", "Seguimiento de pacientes"]
    },
    {
        id: "vet_clinic",
        name: "Clínica Veterinaria",
        price: 79.99,
        icon: "🏥",
        desc: "Suite completa para gestión de clínica veterinaria",
        features: ["Historia clínica completa", "Sistema de citas", "Inventario de medicamentos", "Reportes médicos", "Cirugías y procedimientos"]
    }
];

const API_BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

function ModuleSelectContent() {
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Use effect removed as sync_token is no longer used for HttpOnly cookies
    useEffect(() => {
        setSyncing(false);
    }, []);

    const toggleModule = (id: string) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleActivate = async () => {
        if (selected.length === 0) {
            alert("Selecciona al menos un módulo para continuar");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/modules/activate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ modules: selected })
            });

            if (res.ok) {
                // Redirect based on selection
                if (selected.includes("home_package")) {
                    window.location.href = "/modules/home";
                } else {
                    window.location.href = "/";
                }
            } else {
                const data = await res.json();
                alert(`Error: ${data.detail || "No se pudieron activar los módulos"}`);
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    if (syncing) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Configurando tu cuenta...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-20 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 mb-6 tracking-wide uppercase">
                        Paso 1 de 2
                    </div>
                    <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Activa tus Módulos</h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Selecciona los servicios que tu clínica veterinaria necesita. Puedes activar más módulos en cualquier momento.
                    </p>
                </div>

                {/* Modules Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {AVAILABLE_MODULES.map(module => (
                        <div
                            key={module.id}
                            onClick={() => toggleModule(module.id)}
                            className={`p-8 rounded-3xl border-2 cursor-pointer transition-all duration-200 ${selected.includes(module.id)
                                ? "border-black bg-white shadow-2xl scale-[1.02]"
                                : "border-gray-200 bg-white hover:border-gray-400 shadow-sm hover:shadow-lg"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-5xl">{module.icon}</span>
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${selected.includes(module.id) ? "bg-black border-black" : "border-gray-300"
                                    }`}>
                                    {selected.includes(module.id) && <span className="text-white font-bold">✓</span>}
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{module.name}</h3>
                            <p className="text-gray-600 mb-4">{module.desc}</p>

                            {/* Features */}
                            <ul className="space-y-2 mb-6">
                                {module.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
                                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex items-baseline gap-1 pt-4 border-t border-gray-100">
                                <span className="text-3xl font-extrabold">${module.price}</span>
                                <span className="text-gray-400 font-medium">/mes</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary and Action */}
                <div className="max-w-md mx-auto">
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-lg mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600 font-medium">Módulos seleccionados:</span>
                            <span className="font-bold">{selected.length}</span>
                        </div>
                        <div className="flex justify-between items-center text-2xl font-extrabold py-4 border-t border-gray-100">
                            <span>Total mensual:</span>
                            <span>${AVAILABLE_MODULES.filter(m => selected.includes(m.id)).reduce((acc, curr) => acc + curr.price, 0).toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleActivate}
                        disabled={loading || selected.length === 0}
                        className="w-full bg-black text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95"
                    >
                        {loading ? "Activando..." : selected.length === 0 ? "Selecciona al menos un módulo" : "Activar Módulos →"}
                    </button>

                    <p className="text-center text-sm text-gray-400 mt-4">
                        Podrás gestionar y cambiar tus módulos después
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ModuleSelectPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>}>
            <ModuleSelectContent />
        </Suspense>
    );
}
