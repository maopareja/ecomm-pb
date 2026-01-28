
import React, { useState, useEffect } from 'react';

export function InventoryManager({ product, onUpdate }: { product: any, onUpdate: () => void }) {
    const [showModal, setShowModal] = useState(false);
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (showModal) {
            loadInventory();
        }
    }, [showModal]);

    const loadInventory = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/products/${product._id}/inventory`, { credentials: "include" });
            if (res.ok) {
                setInventory(await res.json());
            }
        } catch (error) {
            console.error("Error loading inventory", error);
        }
        setLoading(false);
    };

    const handleUpdate = async (locationId: string, newQty: number) => {
        try {
            const res = await fetch(`/api/locations/${locationId}/inventory`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: product._id, quantity: newQty }),
                credentials: "include"
            });
            if (res.ok) {
                // Optimistic update locally
                setInventory(prev => prev.map(item =>
                    item.location_id === locationId ? { ...item, quantity: newQty } : item
                ));
            }
        } catch (error) {
            console.error("Error updating inventory", error);
            alert("Error actualizando inventario");
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold mr-2 transition-colors"
            >
                📦 Inventario
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-[var(--color-chocolate)] mb-2">Inventario por Sede</h3>
                        <p className="text-sm text-gray-500 mb-6 font-bold">{product.name}</p>

                        {loading ? (
                            <div className="py-8 text-center text-gray-400">Cargando datos...</div>
                        ) : (
                            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
                                {inventory.length === 0 ? (
                                    <p className="text-center text-gray-400 py-4">No hay sedes activas.</p>
                                ) : inventory.map((item) => (
                                    <div key={item.location_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex-grow">
                                            <p className="font-bold text-sm text-gray-800">{item.location_name}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleUpdate(item.location_id, Math.max(0, item.quantity - 1))}
                                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-colors font-bold"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                                            <button
                                                onClick={() => handleUpdate(item.location_id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-colors font-bold"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => { setShowModal(false); onUpdate(); }}
                                className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-200"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
