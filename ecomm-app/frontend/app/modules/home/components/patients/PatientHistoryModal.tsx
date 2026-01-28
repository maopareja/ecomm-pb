"use client";
import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../utils/api';
import NewClinicalRecordModal from '../clinical_records/NewClinicalRecordModal';

interface PatientHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: any;
}

export default function PatientHistoryModal({ isOpen, onClose, patient }: PatientHistoryModalProps) {
    const [records, setRecords] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && patient) {
            fetchRecords();
        }
    }, [isOpen, patient]);

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const response = await fetchWithAuth(`/api/clinical-records/?patient_id=${patient.id}`);
            if (response.ok) {
                const data = await response.json();
                setRecords(Array.isArray(data) ? data : (data.data || []));
            } else {
                console.error("Error response from records API:", response.status);
                setRecords([]);
            }
        } catch (error) {
            console.error("Error fetching records:", error);
            setRecords([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditRecord = (record: any) => {
        setSelectedRecord(record);
        setIsRecordModalOpen(true);
    };

    const handleAddRecord = () => {
        setSelectedRecord(null);
        setIsRecordModalOpen(true);
    };

    const handleDeleteRecord = async (recordId: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este registro médico? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            const response = await fetchWithAuth(`/api/clinical-records/${recordId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchRecords();
            } else {
                alert("Error al eliminar el registro.");
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    if (!isOpen || !patient) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex justify-center items-center p-4 overflow-y-auto">
                <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                    {/* Header */}
                    <div className="bg-white px-8 py-6 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            {patient.photo_url ? (
                                <img src={patient.photo_url} alt={patient.name} className="w-14 h-14 rounded-xl object-cover border border-gray-100" />
                            ) : (
                                <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-400 text-2xl">🐾</div>
                            )}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Historial de {patient.name}</h2>
                                <p className="text-gray-500 text-sm">{patient.species} {patient.breed && `• ${patient.breed}`}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleAddRecord}
                                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                Nueva Consulta
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-500 font-medium">Buscando registros médicos...</p>
                            </div>
                        ) : records.length > 0 ? (
                            <div className="space-y-6">
                                {records.map((record) => (
                                    <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-blue-200 transition-colors group">
                                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Consulta</span>
                                                <span className="font-bold text-gray-700">{new Date(record.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditRecord(record)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar registro"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRecord(record.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar registro"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                                <span className="text-gray-400 font-mono text-xs">#{record.id.substring(0, 8)}</span>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                                <div>
                                                    <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                                        Motivo
                                                    </h4>
                                                    <p className="text-gray-900 font-semibold leading-relaxed">{record.reason || 'Consulta general'}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                        Diagnóstico
                                                    </h4>
                                                    <p className="text-gray-900 font-semibold leading-relaxed">{record.diagnosis || 'Pendiente de evaluación detallada'}</p>
                                                </div>
                                            </div>
                                            <div className="mb-6">
                                                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.051.546A2 2 0 004 17.168V20a2 2 0 002 2h1.828a2 2 0 001.414-.586L12 18.586l2.758 2.758a2 2 0 001.414.586H18a2 2 0 002-2v-2.832a2 2 0 00-.572-1.414l-1.414-1.414z"></path></svg>
                                                    Tratamiento y Plan
                                                </h4>
                                                <p className="text-gray-700 bg-blue-50/30 p-4 rounded-lg border border-blue-50 leading-relaxed italic">{record.treatment || 'No registrado aún'}</p>
                                            </div>

                                            <div className="flex flex-wrap gap-4">
                                                {record.weight && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-bold text-gray-600">
                                                        <span>⚖️</span> {record.weight} kg
                                                    </div>
                                                )}
                                                {record.temperature && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-bold text-gray-600">
                                                        <span>🌡️</span> {record.temperature} °C
                                                    </div>
                                                )}
                                            </div>

                                            {record.notes && (
                                                <div className="mt-6 pt-6 border-t border-gray-100">
                                                    <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">Observaciones Adicionales</h4>
                                                    <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{record.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-20 px-4 text-center">
                                <div className="text-6xl mb-6 grayscale opacity-40">📄</div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">Sin registros clínicos</h4>
                                <p className="text-gray-500 max-w-sm mx-auto">Esta mascota no tiene historial médico registrado en el sistema. Puedes añadir una nueva visita desde el botón superior.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-white px-8 py-5 border-t border-gray-200 flex justify-end">
                        <button
                            onClick={onClose}
                            className="bg-gray-900 text-white font-bold py-2.5 px-8 rounded-xl hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            <NewClinicalRecordModal
                isOpen={isRecordModalOpen}
                onClose={() => setIsRecordModalOpen(false)}
                onRecordSaved={fetchRecords}
                patientId={patient.id}
                record={selectedRecord}
            />
        </>
    );
}
