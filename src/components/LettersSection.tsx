import React, { useState } from 'react';
import { Letter, SecretLetter } from '../types';
import { Mail, Key, Sparkles, X, Heart, Lock } from 'lucide-react';
import { SpiderLilySVG, SunflowerSVG } from './FloralDecorations';

interface LettersProps {
  letters: Letter[];
  secretLetter: SecretLetter;
  title: string;
  subtitle: string;
}

export function LettersSection({ letters, secretLetter, title, subtitle }: LettersProps) {
  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [secretOpen, setSecretOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [secretUnlocked, setSecretUnlocked] = useState(false);

  const handleOpenLetter = (letter: Letter) => {
    setIsOpening(true);
    setTimeout(() => {
      setActiveLetter(letter);
      setIsOpening(false);
    }, 400);
  };

  const handleUnlockSecret = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim().toLowerCase() === (secretLetter.passcode || 'sempre').trim().toLowerCase()) {
      setSecretUnlocked(true);
      setPasscodeError('');
    } else {
      setPasscodeError('Palavra-chave incorreta. Tente lembrar ou procure o lírio escondido!');
    }
  };

  return (
    <section id="cartas" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-3">
          <SpiderLilySVG className="w-5 h-5 text-[#A9162F]" glow={false} />
          <span className="text-xs uppercase tracking-[0.25em] text-[#DFAE27] font-medium">
            Correspondências do Coração
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

      {/* Tactile Envelope Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {letters.map((letter) => (
          <div
            key={letter.id}
            onClick={() => handleOpenLetter(letter)}
            className="group cursor-pointer perspective-1000"
          >
            <div className="relative bg-[#160B12] hover:bg-[#1E0E18] border border-[#3A0D18] hover:border-[#A9162F] rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 shadow-xl flex flex-col justify-between min-h-[260px] overflow-hidden">
              {/* Envelope flap aesthetic simulation */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#230F1A] border border-[#3A0D18] rotate-45 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity" />

              {/* Wax Seal Marker */}
              <div className="relative z-10 flex items-center justify-between">
                <div
                  className="w-9 h-9 rounded-full shadow-lg flex items-center justify-center text-xs font-serif font-bold text-[#F6EBDD] border border-white/20 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: letter.wax_color || '#A9162F' }}
                >
                  <Mail className="w-4 h-4 text-[#F6EBDD]/90" />
                </div>
                <span className="text-[11px] text-[#B9A8A0] tracking-wider uppercase font-light">
                  {letter.date}
                </span>
              </div>

              {/* Letter Title & Teaser */}
              <div className="relative z-10 my-6">
                <h3 className="text-xl font-serif text-[#F6EBDD] font-normal leading-snug group-hover:text-[#F0C95A] transition-colors mb-2">
                  {letter.title}
                </h3>
                {letter.preview && (
                  <p className="text-xs text-[#B9A8A0] line-clamp-2 font-light">
                    {letter.preview}
                  </p>
                )}
              </div>

              {/* Action Hint */}
              <div className="relative z-10 pt-3 border-t border-[#3A0D18]/50 flex items-center justify-between text-xs text-[#DFAE27] group-hover:text-[#F0C95A]">
                <span>Abrir envelope</span>
                <span className="text-sm transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secret Letter Discovery Card */}
      {secretLetter.is_active && (
        <div className="relative max-w-xl mx-auto mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#170A11] via-[#200B17] to-[#170A11] border border-[#641329] text-center shadow-2xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-[#F0C95A]" />
            <span className="text-xs tracking-widest uppercase text-[#F0C95A] font-semibold">
              Carta Secreta Desbloqueável
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#B9A8A0] font-light mb-4">
            Há uma carta guardada a sete chaves neste jardim. Você pode desbloqueá-la com a senha ou encontrando o lírio escondido.
          </p>
          <button
            onClick={() => setSecretOpen(true)}
            className="inline-flex items-center gap-2 bg-[#3A0D18] hover:bg-[#641329] text-[#F0C95A] border border-[#A9162F]/50 px-5 py-2 rounded-full text-xs font-medium transition-all shadow-md cursor-pointer hover:scale-105"
          >
            <Key className="w-3.5 h-3.5" /> Abrir Carta Secreta
          </button>
        </div>
      )}

      {/* Letter Reading Modal */}
      {activeLetter && (
        <div
          className="fixed inset-0 z-50 bg-[#090708]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveLetter(null)}
        >
          <div
            className="relative max-w-2xl w-full parchment-texture border border-[#641329] rounded-2xl p-7 sm:p-12 shadow-2xl overflow-y-auto max-h-[85vh] animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveLetter(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#2A0D18] text-[#B9A8A0] hover:text-[#F6EBDD] flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Fechar carta"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Letter Header */}
            <div className="border-b border-[#3A0D18] pb-4 mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs tracking-widest uppercase text-[#DFAE27] font-semibold">
                  {activeLetter.date}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif text-[#F6EBDD] font-normal mt-1">
                  {activeLetter.title}
                </h3>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white"
                style={{ backgroundColor: activeLetter.wax_color || '#A9162F' }}
              >
                ♥
              </div>
            </div>

            {/* Letter Body */}
            <div className="font-serif text-base sm:text-lg text-[#F6EBDD]/90 leading-relaxed font-light whitespace-pre-line space-y-4">
              {activeLetter.content}
            </div>

            {/* Letter Signature */}
            {activeLetter.signature && (
              <div className="mt-8 pt-6 border-t border-[#3A0D18]/60 text-right">
                <p className="font-script text-3xl sm:text-4xl text-[#F0C95A]">
                  {activeLetter.signature}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Secret Letter Modal */}
      {secretOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#090708]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSecretOpen(false)}
        >
          <div
            className="relative max-w-xl w-full bg-[#160B12] border border-[#A9162F] rounded-2xl p-7 sm:p-10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSecretOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#2A0D18] text-[#B9A8A0] hover:text-[#F6EBDD] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {!secretUnlocked ? (
              <div>
                <div className="w-12 h-12 rounded-full bg-[#3A0D18] text-[#F0C95A] flex items-center justify-center mx-auto mb-4 border border-[#641329]">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif text-[#F6EBDD] text-center mb-2">
                  Desbloquear Carta Secreta
                </h3>
                <p className="text-xs text-[#B9A8A0] text-center mb-6 leading-relaxed">
                  {secretLetter.hint || "Digite a palavra secreta para ler esta mensagem guardada..."}
                </p>

                <form onSubmit={handleUnlockSecret} className="space-y-4 max-w-sm mx-auto">
                  <input
                    type="password"
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    placeholder="Palavra-chave secreta..."
                    className="w-full px-4 py-2.5 bg-[#090708] border border-[#3A0D18] focus:border-[#F0C95A] rounded-xl text-sm text-[#F6EBDD] outline-none text-center"
                    autoFocus
                  />
                  {passcodeError && (
                    <p className="text-xs text-[#D92E45] text-center">{passcodeError}</p>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-[#A9162F] hover:bg-[#D92E45] text-[#F6EBDD] py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Revelar Carta
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Secret instant bypass hint: easter egg clicked
                        setPasscodeInput(secretLetter.passcode || 'sempre');
                      }}
                      className="text-xs text-[#DFAE27] hover:underline px-2"
                      title="Preencher dica"
                    >
                      Dica
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-center gap-2 mb-2 text-[#F0C95A]">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-widest font-semibold">Segredo Revelado</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif text-[#F6EBDD] text-center mb-6">
                  {secretLetter.title}
                </h3>
                <div className="parchment-texture p-6 rounded-xl border border-[#641329]/60 font-serif text-base sm:text-lg text-[#F6EBDD] leading-relaxed whitespace-pre-line">
                  {secretLetter.content}
                </div>
                {secretLetter.signature && (
                  <p className="mt-6 text-right font-script text-3xl text-[#F0C95A]">
                    {secretLetter.signature}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
