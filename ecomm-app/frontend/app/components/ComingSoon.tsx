"use client";
import React from 'react';
import Link from 'next/link';
import { API_BASE } from '../utils/api';

interface ComingSoonProps {
    title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
    return (
        <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="mb-8 animate-bounce">
                <img src={`${API_BASE}/PB_logo.png`} alt="Pinecrest Bakery" className="h-20 w-auto opacity-20" />
            </div>

            <h1 className="text-4xl md:text-5xl font-serif text-[var(--color-chocolate)] mb-4">{title}</h1>
            <div className="h-1 w-24 bg-[var(--color-primary)] mb-8 mx-auto rounded-full"></div>

            <p className="text-xl text-gray-400 font-medium max-w-md mx-auto mb-10">
                Estamos horneando algo increíble para esta sección. ¡Próximamente disponible!
            </p>

            <Link
                href="/"
                className="bg-[var(--color-chocolate)] text-white px-8 py-3 rounded-full font-bold hover:bg-[var(--color-primary)] transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
                Regresar al Inicio
            </Link>

            <div className="mt-16 text-[var(--color-accent)] text-4xl opacity-30 select-none">
                🥐 🧁 🍰 🥯
            </div>
        </div>
    );
}
