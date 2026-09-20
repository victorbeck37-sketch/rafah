import React, { useState, useEffect, useCallback } from 'react';
import { GalleryItem } from '../types';
import { X, ChevronLeft, ChevronRight, Maximize2, Calendar, Sparkles } from 'lucide-react';
import { SunflowerSVG, SpiderLilySVG } from './FloralDecorations';

interface GalleryProps {
  items: GalleryItem[];
  title: string;
  subtitle: string;
}

export function GallerySection({ items, title, subtitle }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % items.length);
  }, [selectedIndex, items.length]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
  }, [selectedIndex, items.length]);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev, handleClose]);

  // Touch Swipe for mobile lightbox
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStart(null);
  };

  if (!items || items.length === 0) return null;

  return (
    <section id="galeria" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-3">
          <SunflowerSVG className="w-5 h-5 text-[#DFAE27]" glow={false} />
          <span className="text-xs uppercase tracking-[0.25em] text-[#F0C95A] font-medium">
            Retratos & Lembranças
          </span>
          <SpiderLilySVG className="w-5 h-5 text-[#A9162F]" glow={false} />
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F6EBDD] font-normal tracking-wide">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 text-sm sm:text-base text-[#B9A8A0] max-w-xl mx-auto font-light leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Asymmetric Editorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
        {items.map((item, index) => {
          // Dynamic editorial spans based on aspect or index to break standard corporate grid
          let colSpan = 'md:col-span-6';
          let heightClass = 'h-80 sm:h-96';

          if (item.aspect === 'tall') {
            colSpan = 'md:col-span-4';
            heightClass = 'h-96 sm:h-[480px]';
          } else if (item.aspect === 'wide') {
            colSpan = index % 3 === 0 ? 'md:col-span-8' : 'md:col-span-7';
            heightClass = 'h-72 sm:h-88';
          } else if (item.aspect === 'square') {
            colSpan = 'md:col-span-5';
            heightClass = 'h-80 sm:h-96';
          }

          return (
            <div
              key={item.id}
              className={`${colSpan} group cursor-pointer relative`}
              onClick={() => setSelectedIndex(index)}
            >
              <div className={`relative w-full ${heightClass} overflow-hidden rounded-2xl border border-[#2D0F18] group-hover:border-[#A9162F] transition-all duration-500 shadow-xl bg-[#12090D]`}>
                <img
                  src={item.image_url}
                  alt={item.alt || item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter saturate-[0.9] group-hover:saturate-100"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />

                {/* Editorial Vignette & Warm Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090708] via-[#090708]/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Hover Reveal Button */}
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#12090D]/80 text-[#F0C95A] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 backdrop-blur-sm border border-[#3A0D18]">
                  <Maximize2 className="w-4 h-4" />
                </div>

                {/* Bottom Caption & Date */}
                <div className="absolute bottom-0 inset-x-0 p-5 transform transition-transform duration-300">
                  {item.date && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#DFAE27] tracking-wider uppercase mb-1 font-medium">
                      <Calendar className="w-3 h-3" /> {item.date}
                    </div>
                  )}
                  <h3 className="text-lg sm:text-xl font-serif text-[#F6EBDD] font-normal leading-snug">
                    {item.title}
                  </h3>
                  {item.caption && (
                    <p className="text-xs text-[#B9A8A0] mt-1 font-light line-clamp-2 opacity-90">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-[#090708]/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
          onClick={handleClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-[#1A0D14] border border-[#3A0D18] text-[#F6EBDD] hover:text-[#D92E45] flex items-center justify-center text-lg z-50 cursor-pointer transition-colors"
            aria-label="Fechar galeria"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#1A0D14]/80 border border-[#3A0D18] text-[#F6EBDD] hover:text-[#F0C95A] hover:bg-[#1A0D14] flex items-center justify-center z-50 cursor-pointer transition-all"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#1A0D14]/80 border border-[#3A0D18] text-[#F6EBDD] hover:text-[#F0C95A] hover:bg-[#1A0D14] flex items-center justify-center z-50 cursor-pointer transition-all"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Modal Content Box */}
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden border border-[#3A0D18] shadow-2xl bg-[#090708] max-h-[75vh]">
              <img
                src={selectedItem.image_url}
                alt={selectedItem.alt || selectedItem.title}
                className="w-auto max-h-[72vh] object-contain mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Caption bar */}
            <div className="mt-4 text-center max-w-2xl px-4">
              <h4 className="text-xl font-serif text-[#F6EBDD] font-normal">
                {selectedItem.title}
              </h4>
              {selectedItem.caption && (
                <p className="text-sm text-[#B9A8A0] font-light mt-1 leading-relaxed">
                  {selectedItem.caption}
                </p>
              )}
              {selectedItem.date && (
                <span className="inline-block mt-2 text-xs text-[#DFAE27] tracking-wider uppercase font-medium">
                  {selectedItem.date}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
