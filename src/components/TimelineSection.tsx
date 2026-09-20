import React from 'react';
import { TimelineItem } from '../types';
import { SpiderLilySVG, SunflowerSVG } from './FloralDecorations';
import { Sparkles, Heart } from 'lucide-react';

interface TimelineProps {
  items: TimelineItem[];
  title: string;
  subtitle: string;
}

export function TimelineSection({ items, title, subtitle }: TimelineProps) {
  if (!items || items.length === 0) return null;

  return (
    <section id="historia" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-3">
          <SpiderLilySVG className="w-5 h-5 text-[#A9162F]" glow={false} />
          <span className="text-xs uppercase tracking-[0.25em] text-[#DFAE27] font-medium">
            Capítulos do Nosso Amor
          </span>
          <SunflowerSVG className="w-5 h-5 text-[#DFAE27]" glow={false} />
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

      {/* Timeline Tree */}
      <div className="relative">
        {/* Central glowing vertical line */}
        <div className="absolute left-4 sm:left-1/2 top-4 bottom-4 w-[2px] -translate-x-1/2 bg-gradient-to-b from-[#A9162F] via-[#DFAE27] to-[#641329] opacity-40 shadow-[0_0_10px_rgba(217,46,69,0.3)]" />

        <div className="space-y-12 sm:space-y-20">
          {items.map((item, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={item.id}
                className={`relative flex flex-col sm:flex-row items-start ${
                  isEven ? 'sm:flex-row-reverse' : ''
                } group`}
              >
                {/* Node Center Marker */}
                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 top-1 z-20 flex items-center justify-center">
                  <div className={`w-8 h-8 rounded-full border-2 ${
                    item.is_highlight
                      ? 'border-[#F0C95A] bg-[#3A0D18] shadow-[0_0_15px_rgba(240,201,90,0.5)]'
                      : 'border-[#A9162F] bg-[#12090D]'
                  } flex items-center justify-center transition-transform duration-300 group-hover:scale-125`}>
                    {item.is_highlight ? (
                      <Sparkles className="w-3.5 h-3.5 text-[#F0C95A]" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-[#A9162F]" />
                    )}
                  </div>
                </div>

                {/* Content Card Container */}
                <div className="ml-12 sm:ml-0 w-full sm:w-[calc(50%-2rem)]">
                  <div className={`bg-[#140a10]/90 border ${
                    item.is_highlight ? 'border-[#641329] shadow-[0_10px_30px_rgba(100,19,41,0.2)]' : 'border-[#2D0F18]'
                  } hover:border-[#A9162F] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1`}>
                    {/* Header: Date badge + Tag */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#DFAE27] bg-[#DFAE27]/10 px-2.5 py-1 rounded-full">
                        {item.date}
                      </span>
                      {item.tag && (
                        <span className="text-[11px] text-[#B9A8A0] italic">
                          #{item.tag}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl font-serif text-[#F6EBDD] font-normal tracking-wide mb-3 group-hover:text-[#F0C95A] transition-colors">
                      {item.title}
                    </h3>

                    {/* Image if available */}
                    {item.image_url && (
                      <div className="mb-4 overflow-hidden rounded-xl border border-[#3A0D18]">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-48 sm:h-56 object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-sm text-[#B9A8A0] font-light leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>

                    {item.is_highlight && (
                      <div className="mt-4 pt-3 border-t border-[#3A0D18]/50 flex items-center gap-1.5 text-[11px] text-[#F0C95A] font-script text-base">
                        <Heart className="w-3.5 h-3.5 text-[#D92E45] fill-current inline" />
                        Momento eterno gravado em nós
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
