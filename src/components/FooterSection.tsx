import React from 'react';
import { SpiderLilySVG, SunflowerSVG } from './FloralDecorations';
import { ArrowUp, Heart } from 'lucide-react';

interface FooterProps {
  title: string;
  text: string;
  signature: string;
  onEasterEggClick?: () => void;
}

export function FooterSection({ title, text, signature, onEasterEggClick }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="final" className="relative py-28 px-4 sm:px-6 overflow-hidden bg-[#090708] border-t border-[#230C15]">
      {/* Background garden glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#14080F] via-[#090708] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-[#A9162F]/10 blur-3xl pointer-events-none" />

      {/* Decorative Floral Embellishment in Background */}
      <div className="flex items-center justify-center gap-6 mb-10 opacity-70">
        <SpiderLilySVG className="w-12 sm:w-16 h-auto text-[#A9162F]" />
        <span className="text-xl text-[#F0C95A]">✦</span>
        <SunflowerSVG className="w-12 sm:w-16 h-auto text-[#DFAE27]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F6EBDD] font-normal tracking-wide mb-4">
          {title || "Essa história ainda está só começando."}
        </h3>
        <p className="text-base sm:text-lg text-[#B9A8A0] font-light leading-relaxed max-w-lg mx-auto mb-10">
          {text || "Obrigado por fazer parte de cada amanhecer e entardecer da minha vida."}
        </p>

        {/* Signature */}
        <div className="mb-12">
          <p className="font-script text-3xl sm:text-5xl text-[#F0C95A] tracking-wider">
            {signature || "[SEU NOME] ♥ [NOME DELA]"}
          </p>
        </div>

        {/* Action: Voltar ao começo */}
        <button
          onClick={scrollToTop}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B9A8A0] hover:text-[#F6EBDD] border border-[#3A0D18] hover:border-[#641329] px-6 py-3 rounded-full transition-all duration-300 hover:-translate-y-0.5 cursor-pointer bg-[#12090D]"
        >
          <ArrowUp className="w-3.5 h-3.5 text-[#D92E45]" />
          <span>Voltar ao começo</span>
        </button>

        {/* Hidden Easter Egg in footer */}
        {onEasterEggClick && (
          <div className="mt-12">
            <button
              onClick={onEasterEggClick}
              className="opacity-20 hover:opacity-100 transition-opacity p-2 text-[#A9162F] hover:scale-125 transition-transform cursor-pointer"
              title="Um detalhe escondido..."
              aria-label="Flor secreta"
            >
              <SpiderLilySVG className="w-5 h-5" glow={false} />
            </button>
          </div>
        )}

        <div className="mt-12 text-[11px] text-[#B9A8A0]/40 font-light flex items-center justify-center gap-1">
          Feito com amor, lírios e girassóis.
        </div>
      </div>
    </footer>
  );
}
