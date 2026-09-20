import React, { useState } from 'react';
import { LoveNote } from '../types';
import { SpiderLilySVG, SunflowerSVG } from './FloralDecorations';
import { Sparkles, Sun, Heart, Shield, Feather, Eye, EyeOff } from 'lucide-react';

interface LoveNotesProps {
  notes: LoveNote[];
  title: string;
  subtitle: string;
}

export function LoveNotesSection({ notes, title, subtitle }: LoveNotesProps) {
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'sun':
        return <Sun className="w-5 h-5 text-[#DFAE27]" />;
      case 'heart':
        return <Heart className="w-5 h-5 text-[#D92E45]" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-[#F0C95A]" />;
      case 'feather':
        return <Feather className="w-5 h-5 text-[#B9A8A0]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#F0C95A]" />;
    }
  };

  if (!notes || notes.length === 0) return null;

  return (
    <section id="momentos" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative">
      {/* Background glow subtle */}
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-[#641329]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-3">
          <SpiderLilySVG className="w-5 h-5 text-[#A9162F]" glow={false} />
          <span className="text-xs uppercase tracking-[0.25em] text-[#DFAE27] font-medium">
            Confissões do Coração
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

      {/* Editorial Blocks (Varied widths and organic placement) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note, index) => {
          const isRevealed = !note.click_to_reveal || !!revealedIds[note.id];

          return (
            <div
              key={note.id}
              className={`relative bg-[#140a10]/80 hover:bg-[#1A0D15] border border-[#2D0F18] hover:border-[#641329] p-7 rounded-2xl transition-all duration-500 flex flex-col justify-between shadow-lg group ${
                index % 3 === 0 ? 'lg:translate-y-2' : index % 3 === 1 ? 'lg:-translate-y-2' : ''
              }`}
            >
              <div>
                {/* Header Icon + Number */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#2A0D16] flex items-center justify-center border border-[#3A0D18] group-hover:scale-110 transition-transform">
                    {getIcon(note.icon)}
                  </div>
                  <span className="text-xs font-serif italic text-[#641329] group-hover:text-[#A9162F] transition-colors">
                    #{index + 1}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-serif text-[#F6EBDD] font-normal leading-snug mb-3 group-hover:text-[#F0C95A] transition-colors">
                  {note.title}
                </h3>

                {/* Content or Click-to-reveal */}
                {note.click_to_reveal && !isRevealed ? (
                  <div
                    onClick={() => toggleReveal(note.id)}
                    className="cursor-pointer py-6 px-4 rounded-xl border border-dashed border-[#641329]/60 hover:border-[#D92E45] bg-[#090708]/60 text-center transition-colors my-2"
                  >
                    <Eye className="w-5 h-5 text-[#F0C95A] mx-auto mb-2 animate-pulse" />
                    <span className="text-xs text-[#B9A8A0] block font-light">
                      Toque para revelar esse segredo...
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-[#B9A8A0] font-light leading-relaxed whitespace-pre-line animate-fadeIn">
                    {note.content}
                  </p>
                )}
              </div>

              {note.click_to_reveal && (
                <div className="mt-4 pt-3 border-t border-[#3A0D18]/40 flex justify-end">
                  <button
                    onClick={() => toggleReveal(note.id)}
                    className="text-[11px] text-[#DFAE27] hover:text-[#F0C95A] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isRevealed ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Esconder
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Ver detalhe
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
