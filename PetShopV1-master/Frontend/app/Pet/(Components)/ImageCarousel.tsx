"use client";
import React from 'react';

interface ImageCarouselProps {
    images?: string[];
}

const ImageCarousel = ({ images = [] }: ImageCarouselProps) => {
    const displayImages = images.length > 0 ? images : [
        "https://placehold.co/800x600/e2e8f0/64748b?text=No+Photo+1",
        "https://placehold.co/800x600/e2e8f0/64748b?text=No+Photo+2"
    ];

    return (
        <div className="md:col-span-7 lg:col-span-8 bg-surface-container-lowest rounded-lg overflow-hidden editorial-shadow relative group">
            <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth h-[600px]" id="hero-carousel">
                {displayImages.map((src, idx) => (
                    <div key={idx} className="snap-center shrink-0 w-full h-full">
                        <img alt={`Pet image ${idx + 1}`} className="w-full h-full object-cover" src={src} />
                    </div>
                ))}
            </div>
            
            {displayImages.length > 1 && (
                <>
                    <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-surface/80 backdrop-blur p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => document.getElementById('hero-carousel')?.scrollBy({left: -600, behavior: 'smooth'})}>
                        <span className="material-symbols-outlined text-primary">chevron_left</span>
                    </button>
                    <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-surface/80 backdrop-blur p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => document.getElementById('hero-carousel')?.scrollBy({left: 600, behavior: 'smooth'})}>
                        <span className="material-symbols-outlined text-primary">chevron_right</span>
                    </button>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {displayImages.map((_, idx) => (
                            <div key={idx} className="w-2 h-2 rounded-full bg-primary/30"></div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ImageCarousel;