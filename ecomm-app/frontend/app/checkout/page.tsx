"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState<any>({});
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false); // Payment processing state
    const [showClearModal, setShowClearModal] = useState(false); // Modal state

    // Checkout Form
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        zip: '',
        card: '4242 4242 4242 4242',
        exp: '12/28',
        cvv: '123'
    });

    useEffect(() => {
        fetchCartAndProducts();
    }, []);

    const fetchCartAndProducts = async () => {
        // ... same fetchCart
        let sessionId = localStorage.getItem("session_id");
        if (!sessionId) {
            setLoading(false);
            return;
        }

        try {
            const [cartRes, prodRes] = await Promise.all([
                fetch(`${API_BASE}/api/cart`, { headers: { "x-session-id": sessionId }, credentials: "include" }),
                fetch(`${API_BASE}/api/products`, { credentials: "include" })
            ]);

            const cartData = cartRes.ok ? await cartRes.json() : {};
            const prodData = prodRes.ok ? await prodRes.json() : [];

            setCart(cartData);
            setProducts(prodData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        let total = 0;
        Object.entries(cart).forEach(([pid, qty]: [string, any]) => {
            const p = products.find((prod: any) => prod._id === pid);
            if (p) {
                total += p.price * parseInt(qty);
            }
        });
        return total;
    };

    const handleClearCart = () => {
        setShowClearModal(true);
    };

    const confirmClearCart = async () => {
        let sessionId = localStorage.getItem("session_id");
        if (!sessionId) return;


        try {
            const res = await fetch(`${API_BASE}/api/cart`, {
                method: "DELETE",
                headers: { "x-session-id": sessionId }
            });

            if (res.ok) {
                setCart({});
                setShowClearModal(false);
            }
        } catch (e) {
            console.error(e);
            alert("Error al vaciar carrito");
        }
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        // ... rest of handleCheckout


        let sessionId = localStorage.getItem("session_id");

        try {
            const res = await fetch(`${API_BASE}/api/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-session-id": sessionId || ""
                },
                body: JSON.stringify({
                    shipping_address: `${formData.address}, ${formData.city}, ${formData.zip}`,
                    payment_method: "credit_card_simulated"
                })
            });

            const data = await res.json();

            if (res.ok) {
                // Success Animation or Redirect
                // For now, let's just clear local state and show success
                localStorage.removeItem("session_id"); // Clear session? Maybe not if we want to keep user logged in. 
                // Actually cart is cleared on backend.
                // Let's redirect to a success page or back to home with success param
                alert(`¡Pago Aprobado! Orden #${data.order_id}`);
                window.location.href = "/";
            } else {
                alert("Error en el pago: " + (data.detail || "Intente nuevamente"));
            }
        } catch (err) {
            alert("Error de conexión");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[var(--color-secondary)]">Cargando...</div>;

    const total = calculateTotal();
    const cartItemsCount = Object.keys(cart).length;

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-chocolate)] font-sans flex flex-col">
            <header className="bg-white border-b border-[var(--color-primary)]/20 py-4 px-6 md:px-12 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <span>←</span> Volver a la tienda
                </Link>
                <div className="font-bold text-2xl tracking-tighter">PB <span className="text-[var(--color-primary)]">Checkout</span></div>
            </header>

            <main className="flex-grow container mx-auto px-6 py-12">
                {cartItemsCount === 0 ? (
                    <div className="text-center py-20">
                        <h2 className="text-3xl font-bold mb-4">Tu carrito está vacío</h2>
                        <p className="text-gray-500 mb-8">Agrega algunas delicias para continuar.</p>
                        <Link href="/" className="bg-[var(--color-chocolate)] text-white px-8 py-3 rounded-full font-bold hover:bg-[var(--color-primary)] transition-colors">
                            Ver Catálogo
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        {/* ORDER SUMMARY */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
                            <h3 className="text-xl font-bold mb-6 border-b pb-4">Resumen de tu Orden</h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {Object.entries(cart).map(([pid, qty]: [string, any]) => {
                                    const p = products.find((prod: any) => prod._id === pid);
                                    if (!p) return null;
                                    return (
                                        <div key={pid} className="flex justify-between items-center py-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[var(--color-secondary)] rounded-lg flex items-center justify-center text-xl">🧁</div>
                                                <div>
                                                    <p className="font-bold">{p.name}</p>
                                                    <p className="text-xs text-gray-400">Cant: {qty}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold">${(p.price * qty).toLocaleString()}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-6 pt-6 border-t border-dashed border-gray-200">
                                <div className="flex justify-between items-center text-xl font-extrabold">
                                    <span>Total</span>
                                    <span className="text-[var(--color-primary)]">${total.toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={handleClearCart}
                                    className="mt-6 w-full py-3 rounded-xl text-red-500 font-bold border-2 border-dashed border-red-100 hover:bg-red-50 hover:border-red-300 text-sm transition-all"
                                >
                                    🗑️ Vaciar Carrito
                                </button>
                            </div>
                        </div>

                        {/* CHECKOUT FORM */}
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-[var(--color-primary)]/20 animate-in slide-in-from-right-8 fade-in duration-500">
                            <h3 className="text-2xl font-bold mb-6">Datos de Envío y Pago</h3>
                            <form onSubmit={handleCheckout} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Nombre Completo</label>
                                        <input type="text" required className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Dirección</label>
                                        <input type="text" required className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                                            value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Ciudad</label>
                                        <input type="text" required className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                                            value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Código Postal</label>
                                        <input type="text" required className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                                            value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <h4 className="font-bold mb-4 flex items-center gap-2">
                                        <span>💳</span> Pago Seguro
                                    </h4>
                                    <div className="space-y-4 opacity-75">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Número de Tarjeta</label>
                                            <input type="text" readOnly className="w-full p-3 bg-gray-100 rounded-xl border-none cursor-not-allowed"
                                                value={formData.card} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Vencimiento</label>
                                                <input type="text" readOnly className="w-full p-3 bg-gray-100 rounded-xl border-none cursor-not-allowed"
                                                    value={formData.exp} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">CVV</label>
                                                <input type="text" readOnly className="w-full p-3 bg-gray-100 rounded-xl border-none cursor-not-allowed"
                                                    value={formData.cvv} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all transform active:scale-[0.98] ${processing
                                        ? 'bg-gray-400 cursor-wait'
                                        : 'bg-[var(--color-chocolate)] hover:bg-[var(--color-primary)]'
                                        }`}
                                >
                                    {processing ? "Procesando Pago..." : `Pagar $${total.toLocaleString()}`}
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-2">Simulación de pago segura. No se realizarán cargos reales.</p>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            {/* Confirmation Modal */}
            {showClearModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-300 text-center border-4 border-red-50 relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-pink-500"></div>

                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            🗑️
                        </div>

                        <h3 className="text-2xl font-bold text-[var(--color-chocolate)] mb-2">¿Vaciar Carrito?</h3>
                        <p className="text-gray-500 mb-8 px-4">
                            Perderás todas las delicias que has seleccionado. ¿Estás seguro?
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowClearModal(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmClearCart}
                                className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-lg hover:scale-105 transition-all"
                            >
                                Sí, vaciar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
