"use client";
import React, { useState, useEffect } from 'react';
import ClientSelector from './ClientSelector';
import { fetchWithAuth } from '../../utils/api';

const API_BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

interface NewPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPatientCreated: (patient: any) => void;
    clientId?: string | null;
    patient?: any;
}

export default function NewPatientModal({ isOpen, onClose, onPatientCreated, clientId, patient }: NewPatientModalProps) {
    const [formData, setFormData] = useState({ name: '', species: '', breed: '' });
    const [photo, setPhoto] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [selectedClient, setSelectedClient] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            if (patient) {
                setFormData({
                    name: patient.name,
                    species: patient.species || '',
                    breed: patient.breed || ''
                });
                setSelectedClient(null);
            } else {
                setFormData({ name: '', species: '', breed: '' });
                if (clientId) {
                    setSelectedClient({ id: clientId });
                } else {
                    setSelectedClient(null);
                }
            }
            setPhoto(null);
            setError('');
        }
    }, [isOpen, patient, clientId]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(e.target.files[0]);
        }
    };

    const handleClientSelect = (client: any) => {
        setSelectedClient(client);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let savedPatient = null;

        try {
            if (patient) {
                const response = await fetchWithAuth(`/api/patients/${patient.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to update patient');
                }
                savedPatient = await response.json();

            } else {
                const finalClientId = selectedClient?.id || clientId;

                if (!finalClientId) {
                    setError('Por favor, selecciona un cliente primero.');
                    return;
                }

                const payload = { ...formData, client_id: finalClientId };

                const response = await fetchWithAuth('/api/patients/', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to create patient');
                }
                savedPatient = await response.json();
            }

            if (photo && savedPatient) {
                const formData = new FormData();
                formData.append('file', photo);

                const uploadResponse = await fetchWithAuth(`/api/patients/${savedPatient.id}/photo`, {
                    method: 'POST',
                    body: formData,
                    // fetchWithAuth adds Content-Type: application/json automatically which breaks FormData
                    // We need to remove Content-Type to let browser set boundary
                    headers: {}
                });

                // CORRECTION FOR FORMDATA: fetchWithAuth appends Content-Type json. 
                // We need custom overwrite or handle it manually. 
                // Re-implementing manual fetch for photo upload to avoid Content-Type conflict
                const uploadResponse2 = await fetch(`${API_BASE}/api/patients/${savedPatient.id}/photo`, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });


                if (uploadResponse2.ok) {
                    savedPatient = await uploadResponse2.json();
                } else {
                    console.error("Failed to upload photo");
                }
            }

            onPatientCreated(savedPatient);
            onClose();

        } catch (err: any) {
            setError(err.message || 'Ocurrió un error. Inténtalo de nuevo.');
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-2 sm:p-4">
            <div className="bg-white p-4 sm:p-8 rounded-lg shadow-2xl w-[95vw] sm:w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">{patient ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}</h2>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">{error}</div>}

                {!patient && !clientId && (
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Propietario</label>
                        <ClientSelector onClientSelect={handleClientSelect} initialClient={selectedClient} />
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-1">Nombre</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="shadow appearance-none border border-gray-300 rounded w-full py-2.5 px-3 text-gray-900 bg-white placeholder-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label htmlFor="species" className="block text-sm font-semibold text-gray-900 mb-1">Especie</label>
                            <input type="text" name="species" id="species" value={formData.species} onChange={handleChange} className="shadow appearance-none border border-gray-300 rounded w-full py-2.5 px-3 text-gray-900 bg-white placeholder-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="breed" className="block text-sm font-semibold text-gray-900 mb-1">Raza</label>
                            <input type="text" name="breed" id="breed" value={formData.breed} onChange={handleChange} className="shadow appearance-none border border-gray-300 rounded w-full py-2.5 px-3 text-gray-900 bg-white placeholder-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="photo" className="block text-sm font-semibold text-gray-900 mb-1">Foto {patient && '(Dejar vacío para mantener la actual)'}</label>
                            <input
                                type="file"
                                name="photo"
                                id="photo"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="shadow appearance-none border border-gray-300 rounded w-full py-2.5 px-3 text-gray-900 bg-white placeholder-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">Opcional. Formatos: JPG, PNG.</p>
                        </div>
                    </div>
                    <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 px-4 rounded-lg transition-colors w-full sm:w-auto">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`font-bold py-2.5 px-4 rounded-lg text-white transition-colors w-full sm:w-auto ${(!patient && !selectedClient && !clientId) ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}
                            disabled={!patient && !selectedClient && !clientId}
                        >
                            {patient ? 'Actualizar Paciente' : 'Guardar Paciente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
