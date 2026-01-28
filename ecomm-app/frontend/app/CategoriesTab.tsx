
import React, { useState, useEffect } from 'react';

export function CategoriesTab() {
    const [categories, setCategories] = useState<any[]>([]);
    const [newCatName, setNewCatName] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const res = await fetch("/api/categories/", { credentials: "include" });
        if (res.ok) {
            setCategories(await res.json());
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName.trim()) return;

        const res = await fetch("/api/categories/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newCatName }),
            credentials: "include"
        });

        if (res.ok) {
            setNewCatName("");
            fetchCategories();
        } else {
            const d = await res.json();
            alert("Error: " + d.detail);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Eliminar categoría "${name}"?`)) return;

        const res = await fetch(`/api/categories/${id}`, {
            method: "DELETE",
            credentials: "include"
        });

        if (res.ok) {
            fetchCategories();
        } else {
            alert("Error al eliminar");
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-[var(--color-chocolate)] mb-6">Gestión de Categorías</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="bg-gray-50 p-6 rounded-2xl h-fit">
                    <h4 className="font-bold mb-4">Nueva Categoría</h4>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Nombre (ej. Panadería)"
                            className="w-full p-3 border rounded-xl"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            required
                        />
                        <button className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-xl hover:opacity-90">
                            Crear Categoría
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-xl border overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr className="text-xs font-bold uppercase text-gray-400">
                                    <th className="py-3 px-4">Nombre</th>
                                    <th className="py-3 px-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr><td colSpan={2} className="py-8 text-center text-gray-400">No hay categorías.</td></tr>
                                ) : categories.map(cat => (
                                    <tr key={cat._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-bold text-gray-700">{cat.name}</td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => handleDelete(cat._id, cat.name)}
                                                className="text-red-500 hover:text-red-700 font-bold text-sm"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
