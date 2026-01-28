"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '../../utils/api';

interface ClinicalRecordsTableProps {
    onAddPet: (clientId: string) => void;
    onEditPatient: (patient: any) => void;
    onAddClient: () => void;
    onViewHistory: (patient: any) => void;
}

export default function ClinicalRecordsTable({ onAddPet, onEditPatient, onAddClient, onViewHistory }: ClinicalRecordsTableProps) {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [ownerSearch, setOwnerSearch] = useState('');
    const [petSearch, setPetSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    // Debounce search terms
    const [debouncedOwnerSearch, setDebouncedOwnerSearch] = useState('');
    const [debouncedPetSearch, setDebouncedPetSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedOwnerSearch(ownerSearch), 500);
        return () => clearTimeout(timer);
    }, [ownerSearch]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedPetSearch(petSearch), 500);
        return () => clearTimeout(timer);
    }, [petSearch]);

    useEffect(() => {
        fetchData();
    }, [debouncedOwnerSearch, debouncedPetSearch, page]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(debouncedOwnerSearch && { owner_search: debouncedOwnerSearch }),
                ...(debouncedPetSearch && { pet_search: debouncedPetSearch }),
            });

            const response = await fetchWithAuth(`/api/clinical-records-summary/?${params}`);

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Error al obtener datos');
                }
                throw new Error('El servidor respondió con un formato inesperado (posible error de red)');
            }

            const result = await response.json();
            setData(result.data || []);
            setTotal(result.total || 0);
        } catch (error: any) {
            console.error("Error fetching clinical records summary:", error);
            // Evitar que el componente se rompa, limpiar datos
            setData([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    Propietarios y Mascotas
                </h2>
                <button
                    onClick={onAddClient}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Nuevo Propietario
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Propietario</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                        <input
                            type="text"
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border text-gray-900 bg-white placeholder-gray-500"
                            placeholder="Buscar por identificación, teléfono o nombre del propietario"
                            value={ownerSearch}
                            onChange={(e) => setOwnerSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mascota</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <input
                            type="text"
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border text-gray-900 bg-white placeholder-gray-500"
                            placeholder="Buscar por nombre o identificador de la mascota"
                            value={petSearch}
                            onChange={(e) => setPetSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identificador</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mascotas</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Cargando...</td>
                            </tr>
                        ) : data.length > 0 ? (
                            data.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                                {client.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{client.name}</div>
                                                <div className="text-sm text-gray-500">{client.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.id_card || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            {client.pets.map((pet: any) => (
                                                <div key={pet.id} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                                    <div className="flex items-center flex-1">
                                                        <span className="mr-3 flex-shrink-0">
                                                            {pet.photo_url ? (
                                                                <img
                                                                    src={pet.photo_url}
                                                                    alt={pet.name}
                                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                                </div>
                                                            )}
                                                        </span>
                                                        <div className="flex-1">
                                                            <div className="font-medium">{pet.name}</div>
                                                            <div className="text-xs text-gray-500">{pet.species}</div>
                                                        </div>
                                                        <div className="mx-4 text-right">
                                                            {pet.last_visit_date ? (
                                                                <div>
                                                                    <div className="text-xs text-gray-900">{new Date(pet.last_visit_date).toLocaleDateString()}</div>
                                                                    <div className="text-xs text-gray-500 truncate max-w-[150px]">{pet.last_visit_reason}</div>
                                                                </div>
                                                            ) : (
                                                                <span className="flex items-center text-xs text-red-500">
                                                                    <span className="h-1.5 w-1.5 bg-red-500 rounded-full mr-1"></span>
                                                                    Sin visitas
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => onEditPatient(pet)}
                                                            className="text-gray-500 hover:text-blue-600 bg-gray-100 p-1.5 rounded hover:bg-blue-100 transition-colors"
                                                            title="Editar mascota"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => onViewHistory(pet)}
                                                            className="text-blue-600 hover:text-blue-900 bg-blue-100 p-1.5 rounded hover:bg-blue-200 transition-colors"
                                                            title="Ver historial"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {client.pets.length === 0 && <span className="text-sm text-gray-400 italic mb-2 block">Sin mascotas</span>}

                                            <button
                                                onClick={() => onAddPet(client.id)}
                                                className="text-xs flex items-center text-blue-600 hover:text-blue-800 font-medium mt-1"
                                            >
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                                Agregar mascota
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No se encontraron resultados</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                    Visualizando <span className="font-medium">{(page - 1) * limit + 1}</span> - <span className="font-medium">{Math.min(page * limit, total)}</span> de <span className="font-medium">{total}</span> resultados
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page * limit >= total}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
}
