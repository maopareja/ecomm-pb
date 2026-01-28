"use client";
import React, { useState, useEffect } from 'react';
import NewClientModal from '../clients/NewClientModal';
import { fetchWithAuth } from '../../utils/api';

interface Client {
    id: string;
    name: string;
    id_card?: string;
    email?: string;
    phone?: string;
}

interface ClientSelectorProps {
    onClientSelect: (client: Client | null) => void;
    initialClient?: Client | null;
}

export default function ClientSelector({ onClientSelect, initialClient }: ClientSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [results, setResults] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(initialClient || null);

    useEffect(() => {
        if (initialClient) {
            setSelectedClient(initialClient);
        }
    }, [initialClient]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [searchTerm]);

    useEffect(() => {
        if (debouncedSearchTerm.length < 2) {
            if (!debouncedSearchTerm) {
                setResults([]);
            }
            setIsLoading(false);
            return;
        }

        const fetchClients = async () => {
            setIsLoading(true);
            try {
                const response = await fetchWithAuth(`/api/clients/?search=${debouncedSearchTerm}`);
                if (!response.ok) throw new Error('Search failed');
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error("Failed to search clients", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClients();
    }, [debouncedSearchTerm]);

    const handleSelect = (client: Client) => {
        setSelectedClient(client);
        setSearchTerm('');
        setResults([]);
        onClientSelect(client);
    };

    const handleClearSelection = () => {
        setSelectedClient(null);
        onClientSelect(null);
        setSearchTerm('');
        setResults([]);
    }

    const handleClientCreated = (newClient: Client) => {
        handleSelect(newClient);
    }

    return (
        <div className="mb-8">
            <NewClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onClientCreated={handleClientCreated}
            />

            {selectedClient ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex justify-between items-center shadow-sm">
                    <div>
                        <h3 className="text-xl font-bold text-blue-900">{selectedClient.name}</h3>
                        <p className="text-blue-700">Cédula: {selectedClient.id_card || 'N/A'}</p>
                        {selectedClient.email && <p className="text-blue-600 text-sm">{selectedClient.email}</p>}
                    </div>
                    <button
                        onClick={handleClearSelection}
                        className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 font-semibold py-2 px-4 rounded shadow-sm transition-colors"
                    >
                        Cambiar Cliente
                    </button>
                </div>
            ) : (
                <>
                    <label htmlFor="client-search" className="block text-lg font-medium text-gray-800 mb-4">Buscar Cliente</label>
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input
                            type="text"
                            id="client-search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nombre, cédula o email..."
                            className="w-full pl-10 p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg text-gray-900"
                        />
                        {isLoading && (
                            <div className="absolute right-4 top-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                    </div>

                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-1">
                            {results.map(client => (
                                <div
                                    key={client.id}
                                    onClick={() => handleSelect(client)}
                                    className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-gray-800 group-hover:text-blue-600 truncate">{client.name}</h4>
                                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 py-1 px-2 rounded group-hover:bg-blue-50 group-hover:text-blue-600">
                                            ID: {client.id_card || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 space-y-1">
                                        {client.email && (
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                <span className="truncate">{client.email}</span>
                                            </div>
                                        )}
                                        {client.phone && (
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                                <span>{client.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        searchTerm.length >= 2 && !isLoading && (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-2">No se encontraron clientes con "{searchTerm}"</p>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-blue-600 hover:text-blue-800 font-semibold"
                                >
                                    + Crear Nuevo Cliente
                                </button>
                            </div>
                        )
                    )}

                    {!searchTerm && (
                        <div className="mt-4 text-center">
                            <p className="text-gray-500 text-sm">Empieza a escribir para buscar un cliente</p>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="mt-2 text-blue-600 hover:underline text-sm font-medium"
                            >
                                ¿No encuentras al cliente? Crear Nuevo
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
