"use client";
import React, { useEffect, useState } from 'react';

export default function HeroCarousel({ images }: { images: string[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images]);

    const defaultHero = "https://images.unsplash.com/photo-1626803775151-61d756612fcd?q=80&w=2070&auto=format&fit=crop";
    const displayImages = images.length > 0 ? images : [defaultHero];

    return (
        <section className="relative h-[220px] md:h-[700px] overflow-hidden bg-gray-900 shadow-inner">
            {displayImages.map((img, idx) => (
                <div
                    key={img}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 transform scale-100"
                        style={{ backgroundImage: `url('${img}')` }}
                    />
                    <div className="absolute inset-0 bg-black/10" />
                </div>
            ))}

            {/* Navigation elements */}
            <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-4 py-2">
                {displayImages.length > 1 && (
                    <div className="flex gap-1.5 md:gap-2">
                        {displayImages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${idx === currentIndex ? "bg-white w-6 md:w-8" : "bg-white/40 hover:bg-white/60"
                                    }`}
                            />
                        ))}
                    </div>
                )}
                <button
                    onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
                    className="bg-[var(--color-primary)] text-white px-4 py-1.5 md:px-6 md:py-2 rounded-full font-bold text-xs md:text-sm shadow-lg hover:bg-white hover:text-[var(--color-primary)] transition-all transform hover:scale-105"
                >
                    Ver Catálogo
                </button>
            </div>
        </section>
    );
}
