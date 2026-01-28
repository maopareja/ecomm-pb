"use client";
import React, { useState } from 'react';
import { fetchWithAuth } from '../../utils/api';

interface NewClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClientCreated: (client: any) => void;
}

export default function NewClientModal({ isOpen, onClose, onClientCreated }: NewClientModalProps) {
    const [formData, setFormData] = useState({ name: '', id_card: '', email: '', phone: '' });
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetchWithAuth('/api/clients/', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create client');
            }
            const newClient = await response.json();
            onClientCreated(newClient);
            onClose();
        } catch (err: any) {
            setError(err.message || 'No se pudo crear el cliente.');
            console.error(err);
        }
    };

    const inputClasses = "shadow appearance-none border border-gray-300 rounded w-full py-2.5 px-3 text-gray-900 bg-white placeholder-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-2 sm:p-4">
            <div className="bg-white p-4 sm:p-8 rounded-lg shadow-2xl w-[95vw] sm:w-full sm:max-w-lg">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">Registrar Nuevo Cliente</h2>
                {error && <p className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg mb-4 text-sm font-medium">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-1">Nombre Completo</label>
                            <input type="text" name="name" id="name" onChange={handleChange} required className={inputClasses} />
                        </div>
                        <div>
                            <label htmlFor="id_card" className="block text-sm font-semibold text-gray-900 mb-1">Cédula / ID</label>
                            <input type="text" name="id_card" id="id_card" onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-1">Email</label>
                            <input type="email" name="email" id="email" onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-1">Teléfono</label>
                            <input type="text" name="phone" id="phone" onChange={handleChange} className={inputClasses} />
                        </div>
                    </div>
                    <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 px-4 rounded-lg transition-colors w-full sm:w-auto">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors w-full sm:w-auto">
                            Guardar Cliente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
