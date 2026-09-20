import React from 'react';
import { SpiderLilySVG, SunflowerSVG } from './FloralDecorations';
import { ChevronDown, Sparkles } from 'lucide-react';

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  heroImage?: string;
  coupleNames: string;
  onCtaClick: () => void;
}

export function HeroSection({
  title,
  subtitle,
  ctaText,
  heroImage,
  coupleNames,
  onCtaClick,
}: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6">
      {/* Cinematic Background with depth, bokeh and subtle dark garden photography overlay */}
      <div className="absolute inset-0 -z-20">
        {heroImage ? (
          <img
            src={heroImage}
            alt="Jardim ao entardecer"
            className="w-full h-full object-cover filter brightness-[0.22] contrast-[1.1] scale-105"
            fetchPriority="high"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-[#090708]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#090708]/90 via-[#12090D]/80 to-[#090708]" />
        <div className="absolute inset-0 bokeh-layer opacity-75 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#090708] to-transparent" />
      </div>

      {/* Foreground Left Botanical Elements (Lycoris Radiata / Red Spider Lilies) */}
      <div className="absolute left-[-20px] sm:left-4 bottom-[-10px] sm:bottom-4 pointer-events-none z-10 opacity-75 sm:opacity-90">
        <div className="relative">
          <SpiderLilySVG className="w-32 sm:w-48 md:w-64 h-auto text-[#D92E45]" />
          <div className="absolute -top-12 left-16 sm:left-24">
            <SpiderLilySVG className="w-24 sm:w-36 h-auto text-[#A9162F]" glow={false} />
          </div>
        </div>
      </div>

      {/* Foreground Right Botanical Elements (Subtle Sunflower transition) */}
      <div className="absolute right-[-20px] sm:right-4 bottom-[-10px] sm:bottom-4 pointer-events-none z-10 opacity-60 sm:opacity-85">
        <div className="relative">
          <SunflowerSVG className="w-28 sm:w-44 md:w-56 h-auto text-[#DFAE27]" />
          <div className="absolute -top-10 right-14 sm:right-20">
            <SpiderLilySVG className="w-20 sm:w-28 h-auto text-[#A9162F]" glow={false} />
          </div>
        </div>
      </div>

      {/* Hero Center Text & Journey CTA */}
      <div className="relative z-20 max-w-4xl mx-auto text-center pt-20 sm:pt-24 pb-16">
        {/* Subtle romantic label */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A0A12]/80 border border-[#3A0D18] mb-8 backdrop-blur-sm animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-[#F0C95A]" />
          <span className="text-xs uppercase tracking-[0.25em] text-[#F0C95A] font-medium">
            {coupleNames || "Nosso Jardim de Memórias"}
          </span>
          <Sparkles className="w-3.5 h-3.5 text-[#F0C95A]" />
        </div>

        {/* Grand Editorial Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif text-[#F6EBDD] font-normal tracking-wide leading-[1.12] mb-6 drop-shadow-2xl">
          {title || "Para a pessoa que fez meu mundo florescer"}
        </h1>

        {/* Poetic Subtitle */}
        <p className="text-base sm:text-xl text-[#B9A8A0] font-light max-w-2xl mx-auto leading-relaxed mb-12">
          {subtitle || "Dizem que onde florescem lírios e girassóis, o tempo aprende a desacelerar. Bem-vinda ao nosso refúgio."}
        </p>

        {/* Main CTA */}
        <div>
          <button
            onClick={onCtaClick}
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#A9162F] to-[#641329] hover:from-[#D92E45] hover:to-[#A9162F] text-[#F6EBDD] px-8 py-4 rounded-full text-sm font-medium tracking-wider uppercase transition-all duration-500 shadow-[0_0_25px_rgba(169,22,47,0.4)] hover:shadow-[0_0_35px_rgba(217,46,69,0.6)] hover:scale-105 cursor-pointer"
          >
            <span>{ctaText || "Começar nossa história"}</span>
            <ChevronDown className="w-4 h-4 text-[#F0C95A] transition-transform group-hover:translate-y-1" />
          </button>
        </div>
      </div>

      {/* Floating Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#B9A8A0]">Role para descobrir</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-[#F0C95A] to-transparent animate-pulse" />
      </div>
    </section>
  );
}
