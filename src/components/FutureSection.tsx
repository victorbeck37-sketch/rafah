import React from 'react';
import { FutureItem } from '../types';
import { SunflowerSVG, SpiderLilySVG } from './FloralDecorations';
import { Compass, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface FutureProps {
  items: FutureItem[];
  title: string;
  subtitle: string;
}

export function FutureSection({ items, title, subtitle }: FutureProps) {
  if (!items || items.length === 0) return null;

  const getStatusBadge = (status: FutureItem['status']) => {
    switch (status) {
      case 'conquistado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#17251B] text-[#86efac] border border-[#2d5a37] px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Conquistado
          </span>
        );
      case 'planejado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#2A1D07] text-[#F0C95A] border border-[#6B470D] px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Planejado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#2D0D18] text-[#fca5a5] border border-[#641329] px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" /> Sonho Nosso
          </span>
        );
    }
  };

  return (
    <section id="futuro" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-3">
          <SunflowerSVG className="w-5 h-5 text-[#DFAE27]" glow={false} />
          <span className="text-xs uppercase tracking-[0.25em] text-[#DFAE27] font-medium">
            Próximos Capítulos
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

      {/* Grid of future cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative bg-[#140A10]/80 hover:bg-[#1A0E16] border border-[#2D0F18] hover:border-[#641329] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col sm:flex-row"
          >
            {item.image_url && (
              <div className="sm:w-2/5 h-48 sm:h-auto overflow-hidden relative">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#140A10] via-transparent to-transparent opacity-80" />
              </div>
            )}

            <div className={`p-6 flex-1 flex flex-col justify-between ${!item.image_url ? 'w-full' : ''}`}>
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  {getStatusBadge(item.status)}
                  {item.target_date && (
                    <span className="text-[11px] text-[#B9A8A0] font-light">
                      {item.target_date}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-serif text-[#F6EBDD] font-normal group-hover:text-[#F0C95A] transition-colors mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#B9A8A0] font-light leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-[#3A0D18]/50 flex items-center gap-2 text-xs text-[#DFAE27]">
                <Compass className="w-3.5 h-3.5" />
                <span>Rumo ao nosso amanhã</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
