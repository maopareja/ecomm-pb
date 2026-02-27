"use client";
import React, { useEffect, useState } from 'react';
import { API_BASE } from '../utils/api';
import { InventoryManager } from '../InventoryManager';

interface AdminDashboardProps {
    currentUser: any;
    setCartMsg: (msg: string) => void;
    onClose: () => void;
}

export default function AdminDashboard({ currentUser, setCartMsg, onClose }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState("products");
    const [locations, setLocations] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [showProductForm, setShowProductForm] = useState(false);
    const [showLocationForm, setShowLocationForm] = useState(false);

    // Confirmation Modal
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ show: false, title: '', message: '', onConfirm: () => { } });

    // Edit Product Modal
    const [editProduct, setEditProduct] = useState<any>(null);

    // Product Form State
    const [priceRaw, setPriceRaw] = useState("");
    const [stockRaw, setStockRaw] = useState("");
    const [newProductImage, setNewProductImage] = useState(""); // URL of uploaded image

    const handleFileUpload = async (e: any, setUrl: (url: string) => void) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_BASE}/api/upload`, {
                method: "POST",
                body: formData,
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                setUrl(data.url); // Set the URL in state
            } else {
                alert("Error uploading image");
            }
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        }
    };

    const fetchLocations = async () => {
        const res = await fetch(`${API_BASE}/api/locations`, { credentials: "include" });
        if (res.ok) setLocations(await res.json());
    };

    const fetchUsers = async () => {
        const res = await fetch(`${API_BASE}/api/users`, { credentials: "include" });
        if (res.ok) setUsers(await res.json());
    };

    const fetchProducts = async () => {
        const res = await fetch(`${API_BASE}/api/products`, { credentials: "include" });
        if (res.ok) setProducts(await res.json());
    };

    const fetchCategories = async () => {
        const res = await fetch(`${API_BASE}/api/categories`, { credentials: "include" });
        if (res.ok) setCategories(await res.json());
    };

    const fetchCustomers = async () => {
        const res = await fetch(`${API_BASE}/api/customers`, { credentials: "include" });
        if (res.ok) setCustomers(await res.json());
    };

    useEffect(() => {
        if (activeTab === "locations") fetchLocations();
        if (activeTab === "users") fetchUsers();
        if (activeTab === "customers") fetchCustomers();
        if (activeTab === "categories") fetchCategories();
        if (activeTab === "products") {
            fetchProducts();
            fetchLocations(); // Needed for initial inventory in create form
            fetchCategories(); // Needed for categories select
        }
    }, [activeTab]);

    const handleCreateLocation = async (e: any) => {
        e.preventDefault();
        const name = e.target.locName.value;
        const address = e.target.locAddress.value;
        const phone = e.target.locPhone?.value || "";

        const res = await fetch(`${API_BASE}/api/locations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, address, phone }),
            credentials: "include"
        });
        if (res.ok) {
            e.target.reset();
            setShowLocationForm(false);
            fetchLocations();
        } else {
            const d = await res.json();
            alert("Error: " + d.detail);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        const res = await fetch(`${API_BASE}/api/users/${userId}/role`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole }),
            credentials: "include"
        });
        if (res.ok) fetchUsers();
        else alert("Error updating role");
    };

    const handleCreateUser = async (e: any) => {
        e.preventDefault();
        const email = e.target.uEmail.value;
        const password = e.target.uPass.value;
        const role = e.target.uRole.value;

        const res = await fetch(`${API_BASE}/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role }),
            credentials: "include"
        });
        if (res.ok) {
            e.target.reset();
            fetchUsers();
            alert("Usuario creado exitosamente");
        } else {
            const d = await res.json();
            alert("Error: " + d.detail);
        }
    };

    return (
        <>
            <div className="min-h-screen flex bg-white animate-in fade-in duration-200">
                <div className="w-64 bg-gray-50 border-r border-gray-100 flex flex-col p-6 sticky top-0 h-screen">
                    <div className="mb-8 pl-2">
                        <h2 className="text-xl font-extrabold text-gray-800 uppercase tracking-widest">Admin</h2>
                        <p className="text-xs text-gray-400">PB Pasteles Manager</p>
                        <p className="text-xs font-bold text-[var(--color-primary)] mt-1">{currentUser?.role || "OWNER"}</p>
                    </div>
                    <nav className="space-y-2 flex-grow">
                        <button onClick={() => setActiveTab("products")} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === "products" ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-gray-500 hover:bg-gray-100"}`}><span>📦</span> Products</button>
                        <button onClick={() => setActiveTab("categories")} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === "categories" ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-gray-500 hover:bg-gray-100"}`}><span>🏷️</span> Categories</button>
                        <button onClick={() => setActiveTab("orders")} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === "orders" ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-gray-500 hover:bg-gray-100"}`}><span>📃</span> Orders</button>
                        <button onClick={() => setActiveTab("locations")} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === "locations" ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-gray-500 hover:bg-gray-100"}`}><span>📍</span> Locations</button>
                        <div className="pt-4 pb-2 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">People</div>
                        <button onClick={() => setActiveTab("users")} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === "users" ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-gray-500 hover:bg-gray-100"}`}><span>👥</span> Staff Users</button>
                        <button onClick={() => setActiveTab("customers")} className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === "customers" ? "bg-white shadow-sm text-[var(--color-primary)]" : "text-gray-500 hover:bg-gray-100"}`}><span>🛍️</span> Customers</button>
                    </nav>
                    <button onClick={onClose} className="mt-auto flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm font-bold px-4 py-3 transition-colors">⛔ Back to Store</button>
                </div>
                <div className="flex-grow overflow-y-auto bg-white p-10">

                    {/* CATEGORIES TAB */}
                    {activeTab === "categories" && (
                        <div className="max-w-4xl mx-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-[var(--color-chocolate)]">Category Management</h3>
                            </div>

                            {/* Categories Layout: Form Top, List Bottom */}
                            <div className="max-w-4xl mx-auto space-y-8">
                                {/* Create Form - Top */}
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-[var(--color-chocolate)] mb-4">New Category</h4>
                                    <form onSubmit={async (e: React.FormEvent) => {
                                        e.preventDefault();
                                        const form = e.target as HTMLFormElement;
                                        const name = (form.elements.namedItem('catName') as HTMLInputElement).value;
                                        if (!name.trim()) return;

                                        const res = await fetch(`${API_BASE}/api/categories`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ name }),
                                            credentials: "include"
                                        });

                                        if (res.ok) {
                                            form.reset();
                                            fetchCategories();
                                            setCartMsg("✅ Category created");
                                            setTimeout(() => setCartMsg(""), 3000);
                                        } else {
                                            const d = await res.json();
                                            setCartMsg("❌ Error: " + (d.detail || "Error creating category"));
                                            setTimeout(() => setCartMsg(""), 3000);
                                        }
                                    }} className="flex flex-col md:flex-row gap-4">
                                        <input
                                            type="text"
                                            name="catName"
                                            placeholder="Name (e.g. Bakery)"
                                            className="flex-1 p-3 border rounded-xl"
                                            required
                                        />
                                        <button className="bg-[var(--color-primary)] text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 whitespace-nowrap">
                                            Create Category
                                        </button>
                                    </form>
                                </div>

                                {/* List - Bottom */}
                                <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b">
                                            <tr className="text-xs font-bold uppercase text-gray-400">
                                                <th className="py-3 px-6">Category Name</th>
                                                <th className="py-3 px-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categories.length === 0 ? (
                                                <tr><td colSpan={2} className="py-12 text-center text-gray-400">No categories registered.</td></tr>
                                            ) : categories.map((cat: any) => (
                                                <tr key={cat._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-6 font-bold text-gray-700">{cat.name}</td>
                                                    <td className="py-4 px-6 text-right">
                                                        <button
                                                            onClick={() => {
                                                                setConfirmModal({
                                                                    show: true,
                                                                    title: 'Delete Category',
                                                                    message: `Are you sure you want to delete the category "${cat.name}"?`,
                                                                    onConfirm: async () => {
                                                                        setConfirmModal(prev => ({ ...prev, show: false }));
                                                                        const res = await fetch(`${API_BASE}/api/categories/${cat._id}`, {
                                                                            method: "DELETE",
                                                                            credentials: "include"
                                                                        });
                                                                        if (res.ok) {
                                                                            fetchCategories();
                                                                            setCartMsg("✅ Category deleted");
                                                                            setTimeout(() => setCartMsg(""), 3000);
                                                                        } else {
                                                                            setCartMsg("❌ Error deleting category");
                                                                            setTimeout(() => setCartMsg(""), 3000);
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PRODUCTS TAB */}
                    {activeTab === "products" && (
                        <div className="max-w-6xl mx-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-[var(--color-chocolate)]">Product Management</h3>
                                <button
                                    onClick={() => setShowProductForm(!showProductForm)}
                                    className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl font-bold hover:opacity-90"
                                >
                                    {showProductForm ? "Hide Form" : "+ New Product"}
                                </button>
                            </div>


                            {/* CREATE PRODUCT FORM (Collapsible) */}
                            {showProductForm && (
                                <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                                    <h4 className="font-bold mb-4">New Product</h4>
                                    <form onSubmit={async (e: any) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.target);
                                        const name = formData.get("pname");
                                        const desc = formData.get("pdesc");
                                        const cat = formData.get("pcat");
                                        const price = parseFloat(priceRaw.replace(/,/g, ""));

                                        // Construct initial inventory
                                        const initial_inventory = locations
                                            .filter(loc => loc.is_active)
                                            .map(loc => {
                                                const val = formData.get(`stock_${loc._id}`);
                                                return {
                                                    location_id: loc._id,
                                                    quantity: val ? parseInt(val.toString()) : 0
                                                };
                                            })
                                            .filter(item => item.quantity > 0);

                                        if (isNaN(price)) {
                                            setCartMsg("❌ Invalid price");
                                            setTimeout(() => setCartMsg(""), 3000);
                                            return;
                                        }

                                        const deliveryDays = formData.get("pdelivery") || "immediate";
                                        const taxRate = parseFloat(formData.get("ptax")?.toString() || "0");

                                        const res = await fetch(`${API_BASE}/api/products`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                name,
                                                description: desc,
                                                price,
                                                initial_inventory,
                                                category: cat,
                                                images: newProductImage ? [newProductImage] : [],
                                                delivery_days: deliveryDays,
                                                tax_rate: isNaN(taxRate) ? 0 : taxRate
                                            }),
                                            credentials: "include"
                                        });
                                        if (res.ok) {
                                            e.target.reset();
                                            setPriceRaw("");
                                            setNewProductImage(""); // Reset image
                                            setShowProductForm(false);
                                            fetchProducts(); // Refresh product list
                                            setCartMsg("✅ Product saved");
                                            setTimeout(() => setCartMsg(""), 3000);
                                        }
                                        else {
                                            setCartMsg("❌ Error saving product");
                                            setTimeout(() => setCartMsg(""), 3000);
                                        }
                                    }} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="block text-xs font-bold uppercase text-gray-500 mb-2">Name</label><input name="pname" className="w-full border p-3 rounded-xl" required /></div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Category</label>
                                                <select name="pcat" className="w-full border p-3 rounded-xl bg-white" required>
                                                    <option value="">Select...</option>
                                                    {categories.map((c: any) => (
                                                        <option key={c._id} value={c.name}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div><label className="block text-xs font-bold uppercase text-gray-500 mb-2">Description</label><textarea name="pdesc" rows={2} className="w-full border p-3 rounded-xl" required></textarea></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Price ($)</label>
                                                <input type="text" value={priceRaw} onChange={(e) => setPriceRaw(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full border p-3 rounded-xl font-bold" required />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Tax / VAT (%)</label>
                                                <input type="number" name="ptax" step="0.01" min="0" max="100" placeholder="0" className="w-full border p-3 rounded-xl font-bold" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Delivery Availability</label>
                                            <select name="pdelivery" className="w-full border p-3 rounded-xl bg-white">
                                                <option value="immediate">Immediate</option>
                                                <option value="1">1 Day</option>
                                                <option value="2">2 Days</option>
                                                <option value="3">3 Days</option>
                                                <option value="5">5 Days</option>
                                                <option value="7">7 Days</option>
                                                <option value="custom">Custom / Inquire</option>
                                            </select>
                                        </div>

                                        {/* Image Upload */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Product Image</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, setNewProductImage)}
                                                    className="w-full border p-3 rounded-xl bg-white"
                                                />
                                                {newProductImage && (
                                                    <img src={newProductImage.startsWith('/') ? `${API_BASE}${newProductImage}` : newProductImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg border shadow-sm" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Inventory per Location */}
                                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                                            <h5 className="text-sm font-bold text-gray-500 uppercase mb-3">Initial Inventory per Location</h5>
                                            {locations.length === 0 ? (
                                                <p className="text-xs text-red-400">No active locations to assign inventory.</p>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {locations.filter(l => l.is_active).map(loc => (
                                                        <div key={loc._id} className="flex items-center gap-2">
                                                            <label className="text-xs font-bold w-1/2 truncate" title={loc.name}>{loc.name}</label>
                                                            <input
                                                                type="number"
                                                                name={`stock_${loc._id}`}
                                                                placeholder="0"
                                                                min="0"
                                                                className="w-1/2 border p-2 rounded-lg text-sm text-center"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <button type="submit" className="w-full bg-[var(--color-chocolate)] text-white p-3 rounded-xl font-bold hover:opacity-90">Save Product</button>
                                    </form>
                                </div>
                            )}


                            {/* PRODUCT LIST */}
                            <div className="bg-white rounded-xl border overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50">
                                        <tr className="text-xs font-bold uppercase text-gray-400">
                                            <th className="py-3 px-4">Product</th>
                                            <th className="py-3 px-4">Category</th>
                                            <th className="py-3 px-4">Price</th>
                                            <th className="py-3 px-4">Global Stock</th>
                                            <th className="py-3 px-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.length === 0 ? (
                                            <tr><td colSpan={5} className="py-8 text-center text-gray-400">No products found. Create a new one.</td></tr>
                                        ) : products.map(p => (
                                            <tr key={p._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-sm">{p.name}</div>
                                                    <div className="text-xs text-gray-400 truncate max-w-xs">{p.description}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">{p.category}</span>
                                                </td>
                                                <td className="py-3 px-4 font-bold text-green-600">${p.price.toLocaleString()}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`font-bold ${p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>{p.stock}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <InventoryManager
                                                        product={p}
                                                        onUpdate={() => fetchProducts()}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            setEditProduct(p);
                                                            setPriceRaw(p.price.toString());
                                                            setStockRaw(p.stock.toString());
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-bold mr-3"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setConfirmModal({
                                                                show: true,
                                                                title: 'Delete product?',
                                                                message: `Confirm that you want to delete "${p.name}". This action cannot be undone.`,
                                                                onConfirm: async () => {
                                                                    setConfirmModal(prev => ({ ...prev, show: false }));
                                                                    const res = await fetch(`${API_BASE}/api/products/${p._id}`, {
                                                                        method: "DELETE",
                                                                        credentials: "include"
                                                                    });
                                                                    if (res.ok) {
                                                                        fetchProducts();
                                                                        setCartMsg("✅ Product deleted");
                                                                        setTimeout(() => setCartMsg(""), 3000);
                                                                    } else {
                                                                        const d = await res.json();
                                                                        setCartMsg(`❌ Error: ${d.detail || "Error deleting"}`);
                                                                        setTimeout(() => setCartMsg(""), 3000);
                                                                    }
                                                                }
                                                            });
                                                        }}
                                                        className="text-red-600 hover:text-red-800 text-sm font-bold"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ORDERS TAB */}
                    {activeTab === "orders" && <div className="text-center py-20 opacity-50"><h3 className="text-xl font-bold">No recent orders</h3></div>}

                    {/* LOCATIONS TAB */}
                    {activeTab === "locations" && (
                        <div className="max-w-6xl mx-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-[var(--color-chocolate)]">Location Management</h3>
                                <button
                                    onClick={() => setShowLocationForm(!showLocationForm)}
                                    className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl font-bold hover:opacity-90"
                                >
                                    {showLocationForm ? "Hide Form" : "+ New Location"}
                                </button>
                            </div>

                            {/* CREATE LOCATION FORM (Collapsible) */}
                            {showLocationForm && (
                                <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                                    <h4 className="font-bold mb-4">New Location</h4>
                                    <form onSubmit={handleCreateLocation} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Name</label>
                                                <input name="locName" placeholder="e.g. North Branch" className="w-full p-3 border rounded-xl" required />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Phone</label>
                                                <input name="locPhone" placeholder="e.g. (123) 456-7890" className="w-full p-3 border rounded-xl" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Address</label>
                                            <input name="locAddress" placeholder="123 Main St" className="w-full p-3 border rounded-xl" required />
                                        </div>
                                        <button type="submit" className="w-full bg-[var(--color-chocolate)] text-white p-3 rounded-xl font-bold hover:opacity-90">Create Location</button>
                                    </form>
                                </div>
                            )}

                            {/* LOCATION LIST */}
                            <div className="bg-white rounded-xl border overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50">
                                        <tr className="text-xs font-bold uppercase text-gray-400">
                                            <th className="py-3 px-4">Location</th>
                                            <th className="py-3 px-4">Address</th>
                                            <th className="py-3 px-4">Phone</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {locations.length === 0 ? (
                                            <tr><td colSpan={5} className="py-8 text-center text-gray-400">No locations registered.</td></tr>
                                        ) : locations.map((loc: any) => (
                                            <tr key={loc._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-sm">{loc.name}</div>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">{loc.address || 'N/A'}</td>
                                                <td className="py-3 px-4 text-sm text-gray-600">{loc.phone || 'N/A'}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${loc.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {loc.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-bold mr-3">✏️ Edit</button>
                                                    <button
                                                        onClick={() => {
                                                            setConfirmModal({
                                                                show: true,
                                                                title: 'Delete Location',
                                                                message: `Are you sure you want to delete the location "${loc.name}"?`,
                                                                onConfirm: async () => {
                                                                    setConfirmModal(prev => ({ ...prev, show: false }));
                                                                    const res = await fetch(`${API_BASE}/api/locations/${loc._id}`, {
                                                                        method: "DELETE",
                                                                        credentials: "include"
                                                                    });
                                                                    if (res.ok) {
                                                                        fetchLocations();
                                                                        setCartMsg("✅ Location deleted");
                                                                        setTimeout(() => setCartMsg(""), 3000);
                                                                    } else {
                                                                        const d = await res.json();
                                                                        setCartMsg(`❌ Error: ${d.detail || "Error deleting"}`);
                                                                        setTimeout(() => setCartMsg(""), 3000);
                                                                    }
                                                                }
                                                            });
                                                        }}
                                                        className="text-red-600 hover:text-red-800 text-sm font-bold"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}



                    {/* CUSTOMERS TAB */}
                    {activeTab === "customers" && (
                        <div className="max-w-6xl mx-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-[var(--color-chocolate)]">Registered Customers</h3>
                            </div>
                            <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b">
                                        <tr className="text-xs font-bold uppercase text-gray-400">
                                            <th className="py-3 px-6">Name</th>
                                            <th className="py-3 px-6">Email</th>
                                            <th className="py-3 px-6">Phone</th>
                                            <th className="py-3 px-6">Address</th>
                                            <th className="py-3 px-6">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.length === 0 ? (
                                            <tr><td colSpan={5} className="py-12 text-center text-gray-400">No customers registered yet.</td></tr>
                                        ) : customers.map((c: any) => (
                                            <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-6 font-bold text-gray-700">{c.full_name}</td>
                                                <td className="py-4 px-6 text-gray-600">{c.email}</td>
                                                <td className="py-4 px-6 text-gray-500">{c.phone || "N/A"}</td>
                                                <td className="py-4 px-6 text-gray-500 truncate max-w-[200px]">{c.address || "N/A"}</td>
                                                <td className="py-4 px-6 text-xs text-gray-400">{c.joined || "N/A"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                    {/* STAFF USERS TAB */}
                    {activeTab === "users" && (
                        <div className="max-w-6xl mx-auto">
                            <div className="flex gap-8">
                                {/* CREATE USER FORM */}
                                <div className="w-1/3 bg-gray-50 p-6 rounded-2xl h-fit border border-gray-100 shadow-sm">
                                    <h4 className="font-bold mb-4">New Staff Member</h4>
                                    <form onSubmit={handleCreateUser} className="space-y-4">
                                        <input name="uEmail" type="email" placeholder="Email" className="w-full p-3 border rounded-xl" required />
                                        <input name="uPass" type="password" placeholder="Password" className="w-full p-3 border rounded-xl" required />
                                        <select name="uRole" className="w-full p-3 border rounded-xl bg-white">
                                            <option value="SALES">Sales (Cashier)</option>
                                            <option value="INVENTORY_MANAGER">Inventory</option>
                                            <option value="PRODUCT_MANAGER">Product Manager</option>
                                            <option value="ADMIN">Administrator</option>
                                        </select>
                                        <button type="submit" className="w-full bg-[var(--color-chocolate)] text-white font-bold py-3 rounded-xl hover:opacity-90">Create User</button>
                                    </form>
                                </div>

                                {/* USER LIST */}
                                <div className="w-2/3">
                                    <h3 className="text-2xl font-bold text-[var(--color-chocolate)] mb-6">Staff Management</h3>
                                    <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50">
                                                <tr className="text-xs font-bold uppercase text-gray-400">
                                                    <th className="py-3 px-4">Email</th>
                                                    <th className="py-3 px-4">Role</th>
                                                    <th className="py-3 px-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((u: any) => (
                                                    <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                                        <td className="py-3 px-4 font-bold text-sm">{u.email}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <select
                                                                defaultValue={u.role}
                                                                onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
                                                                className="bg-white border border-gray-300 rounded-lg text-xs px-2 py-1"
                                                            >
                                                                {["OWNER", "ADMIN", "PRODUCT_MANAGER", "INVENTORY_MANAGER", "SALES"].map(r => (
                                                                    <option key={r} value={r}>{r}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* PREMIUM CONFIRMATION MODAL */}
            {
                confirmModal.show && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 animate-in zoom-in duration-200 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
                                <span className="text-4xl" role="img" aria-label="warning">⚠️</span>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-3">{confirmModal.title}</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed font-medium">{confirmModal.message}</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: () => { } })}
                                    className="flex-1 px-6 py-4 bg-gray-50 text-gray-600 rounded-2xl font-black hover:bg-gray-100 transition-all border border-gray-200 active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* EDIT PRODUCT MODAL */}
            {
                editProduct && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black text-[var(--color-chocolate)]">Edit Product</h3>
                                <button onClick={() => setEditProduct(null)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
                            </div>
                            {editProduct && (
                                <form onSubmit={async (e: any) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const name = formData.get("pname");
                                    const desc = formData.get("pdesc");
                                    const cat = formData.get("pcat");
                                    const price = parseFloat(priceRaw.replace(/,/g, ""));

                                    if (isNaN(price)) {
                                        setCartMsg("❌ Invalid price");
                                        setTimeout(() => setCartMsg(""), 3000);
                                        return;
                                    }

                                    const editDelivery = formData.get("pdelivery") || editProduct.delivery_days || "immediate";
                                    const editTax = parseFloat(formData.get("ptax")?.toString() || "0");

                                    const res = await fetch(`${API_BASE}/api/products/${editProduct._id}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            name,
                                            description: desc,
                                            price,
                                            category: cat,
                                            images: editProduct.images || [],
                                            is_featured: editProduct.is_featured || false,
                                            delivery_days: editDelivery,
                                            tax_rate: isNaN(editTax) ? 0 : editTax
                                        }),
                                        credentials: "include"
                                    });
                                    if (res.ok) {
                                        setEditProduct(null);
                                        fetchProducts();
                                        setCartMsg("✅ Product updated");
                                        setTimeout(() => setCartMsg(""), 3000);
                                    } else {
                                        const d = await res.json();
                                        setCartMsg("❌ Error: " + (d.detail || "Unknown error"));
                                        setTimeout(() => setCartMsg(""), 3000);
                                    }
                                }} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Name</label>
                                            <input name="pname" defaultValue={editProduct.name} className="w-full border p-3 rounded-xl" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Category</label>
                                            <select name="pcat" defaultValue={editProduct.category} className="w-full border p-3 rounded-xl bg-white" required>
                                                <option value="">Select...</option>
                                                {categories.map((c: any) => (
                                                    <option key={c._id} value={c.name}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Description</label>
                                        <textarea name="pdesc" rows={2} defaultValue={editProduct.description} className="w-full border p-3 rounded-xl" required></textarea>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Price ($)</label>
                                            <input type="text" value={priceRaw} onChange={(e) => setPriceRaw(e.target.value.replace(/[^0-9.]/g, ''))} className="w-full border p-3 rounded-xl font-bold" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Tax / VAT (%)</label>
                                            <input type="number" name="ptax" step="0.01" min="0" max="100" defaultValue={editProduct.tax_rate || 0} className="w-full border p-3 rounded-xl font-bold" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Delivery Availability</label>
                                            <select name="pdelivery" defaultValue={editProduct.delivery_days || "immediate"} className="w-full border p-3 rounded-xl bg-white">
                                                <option value="immediate">Immediate</option>
                                                <option value="1">1 Day</option>
                                                <option value="2">2 Days</option>
                                                <option value="3">3 Days</option>
                                                <option value="5">5 Days</option>
                                                <option value="7">7 Days</option>
                                                <option value="custom">Custom / Inquire</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Total Stock (Locations)</label>
                                            <input type="number" value={editProduct.stock} disabled className="w-full border p-3 rounded-xl font-bold bg-gray-100 text-gray-500 cursor-not-allowed" />
                                            <p className="text-[10px] text-blue-500 mt-1 font-bold">Manage in "📦 Inventory"</p>
                                        </div>
                                    </div>

                                    {/* Image Upload for Edit */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Product Image</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(e, (url) => setEditProduct({ ...editProduct, images: [url] }))}
                                                className="w-full border p-3 rounded-xl bg-white"
                                            />
                                            {editProduct.images && editProduct.images.length > 0 && (
                                                <img src={editProduct.images[0].startsWith('/') ? `${API_BASE}${editProduct.images[0]}` : editProduct.images[0]} alt="Preview" className="w-16 h-16 object-cover rounded-lg border shadow-sm" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setEditProduct(null)} className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-xl font-bold hover:bg-gray-200">Cancel</button>
                                        <button type="submit" className="flex-1 bg-[var(--color-chocolate)] text-white p-3 rounded-xl font-bold hover:opacity-90">Save Changes</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )
            }
        </>
    );
}
