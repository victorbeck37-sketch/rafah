import React, { useState, useEffect, useRef } from 'react';
import { SpiderLilySVG, SunflowerSVG } from './FloralDecorations';
import { Sparkles, Heart } from 'lucide-react';

interface CinematicProps {
  title1: string;
  title2: string;
  description: string;
}

export function CinematicMomentSection({ title1, title2, description }: CinematicProps) {
  const [inView, setInView] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          const timer = setTimeout(() => {
            setShowSecondary(true);
          }, 2400);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.35 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-[85vh] flex items-center justify-center py-28 px-4 sm:px-6 overflow-hidden transition-all duration-1000 ${
        inView
          ? 'bg-gradient-to-b from-[#12090D] via-[#2A0E18] to-[#1E110A]'
          : 'bg-[#090708]'
      }`}
    >
      {/* Background warm golden hour burst */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
          inView ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#DFAE27]/15 via-[#641329]/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t from-[#DFAE27]/10 to-transparent" />
      </div>

      {/* Left Floral Arrangement (Red Spider Lilies transitioning) */}
      <div
        className={`absolute left-0 sm:left-6 md:left-12 bottom-12 z-10 transition-all duration-1000 transform ${
          inView ? 'translate-x-0 opacity-80' : '-translate-x-12 opacity-0'
        }`}
      >
        <div className="relative">
          <SpiderLilySVG className="w-24 sm:w-32 md:w-44 h-auto text-[#D92E45]" />
          <div className="absolute -top-6 -right-4">
            <SpiderLilySVG className="w-16 sm:w-20 h-auto text-[#A9162F]" />
          </div>
        </div>
      </div>

      {/* Right Floral Arrangement (Sunflowers emerging with warm gold) */}
      <div
        className={`absolute right-0 sm:right-6 md:right-12 bottom-12 z-10 transition-all duration-1000 delay-300 transform ${
          inView ? 'translate-x-0 opacity-85' : 'translate-x-12 opacity-0'
        }`}
      >
        <div className="relative">
          <SunflowerSVG className="w-24 sm:w-32 md:w-44 h-auto text-[#DFAE27]" />
          <div className="absolute -top-6 -left-4">
            <SunflowerSVG className="w-16 sm:w-20 h-auto text-[#F0C95A]" />
          </div>
        </div>
      </div>

      {/* Central Emotional Message */}
      <div className="relative z-20 max-w-3xl mx-auto text-center px-4">
        {/* Subtle indicator */}
        <div
          className={`flex items-center justify-center gap-2 mb-6 transition-opacity duration-700 ${
            inView ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#F0C95A]" />
          <span className="text-xs uppercase tracking-[0.3em] text-[#F0C95A] font-medium">
            Momento Eterno
          </span>
          <Sparkles className="w-4 h-4 text-[#F0C95A]" />
        </div>

        {/* Primary line: "Você chegou até aqui." */}
        <p
          className={`text-lg sm:text-2xl font-serif text-[#B9A8A0] font-light tracking-wide mb-4 transition-all duration-1000 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {title1 || "Você chegou até aqui."}
        </p>

        {/* Climax line: "E eu escolheria você de novo." */}
        <h2
          className={`text-3xl sm:text-5xl md:text-6xl font-serif font-normal text-[#F6EBDD] tracking-wide leading-tight transition-all duration-1000 delay-500 ${
            inView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
          }`}
        >
          <span className="bg-gradient-to-r from-[#F6EBDD] via-[#F0C95A] to-[#DFAE27] bg-clip-text text-transparent">
            {title2 || "E eu escolheria você de novo."}
          </span>
        </h2>

        {/* Revealed secondary message */}
        <div
          className={`mt-6 max-w-xl mx-auto transition-all duration-1000 ${
            showSecondary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-base sm:text-lg text-[#F6EBDD]/90 font-serif italic leading-relaxed">
            "{description || "Entre todos os caminhos e jardins do mundo, o meu lugar favorito sempre será ao seu lado."}"
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-4 text-[#D92E45]">
            <Heart className="w-4 h-4 fill-current animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
