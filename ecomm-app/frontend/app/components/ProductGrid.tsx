"use client";
import React from 'react';
import { API_BASE } from '../utils/api';

interface ProductGridProps {
    products: any[];
    loading: boolean;
    addToCart: (product: any) => void;
    setCategoryFilter: (cat: string) => void; // Used for "Ver todo" button
    setSearchQuery: (query: string) => void;
}

export default function ProductGrid({ products, loading, addToCart, setCategoryFilter, setSearchQuery }: ProductGridProps) {
    if (loading) {
        return <div className="text-center py-20 text-gray-400">Cargando delicias...</div>;
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300">
                <p className="text-xl text-gray-500">No encontramos productos 🧁</p>
                <button onClick={() => { setSearchQuery(""); setCategoryFilter(""); }} className="text-[var(--color-primary)] font-bold mt-2">Ver todo</button>
            </div>
        );
    }

    return (
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
                        <div className="mt-30 text-xs text-gray-300 font-medium h-4">
                            {p.stock < 10 && p.stock > 0 && `Stock: ${p.stock}`}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
