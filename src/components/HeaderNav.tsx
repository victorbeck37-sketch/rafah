import React, { useState, useEffect } from 'react';
import { Menu, X, Lock, Heart } from 'lucide-react';
import { SpiderLilySVG } from './FloralDecorations';

interface HeaderNavProps {
  coupleNames: string;
  hasMusic: boolean;
  onNavigateAdmin: () => void;
}

export function HeaderNav({ coupleNames, hasMusic, onNavigateAdmin }: HeaderNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'História', href: '#historia' },
    { label: 'Momentos', href: '#momentos' },
    { label: 'Galeria', href: '#galeria' },
    { label: 'Cartas', href: '#cartas' },
    ...(hasMusic ? [{ label: 'Música', href: '#musica' }] : []),
    { label: 'Futuro', href: '#futuro' },
    { label: 'Final', href: '#final' },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#090708]/85 backdrop-blur-md border-b border-[#3A0D18]/80 py-3 shadow-xl'
          : 'bg-gradient-to-b from-[#090708]/80 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Couple Name */}
        <a
          href="#"
          className="flex items-center gap-2.5 text-[#F6EBDD] hover:text-[#F0C95A] transition-colors group"
        >
          <SpiderLilySVG className="w-6 h-6 text-[#A9162F] group-hover:text-[#D92E45]" glow={false} />
          <span className="font-serif text-lg sm:text-xl tracking-wide">
            {coupleNames || "[SEU NOME] & [NOME DELA]"}
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-[0.2em] text-[#B9A8A0] hover:text-[#F0C95A] transition-colors font-medium py-1"
            >
              {link.label}
            </a>
          ))}

          {/* Admin link discreet */}
          <button
            onClick={onNavigateAdmin}
            className="flex items-center gap-1.5 text-xs text-[#B9A8A0]/70 hover:text-[#DFAE27] transition-colors border border-[#3A0D18] hover:border-[#641329] px-3 py-1.5 rounded-full cursor-pointer"
            title="Painel Administrativo (/admin)"
            aria-label="Acessar painel administrativo"
          >
            <Lock className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Mobile Hamburger button */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={onNavigateAdmin}
            className="text-xs text-[#B9A8A0] p-1.5 border border-[#3A0D18] rounded-lg"
            title="Admin"
            aria-label="Acessar painel admin"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl bg-[#170A11] border border-[#3A0D18] text-[#F6EBDD] flex items-center justify-center cursor-pointer"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#090708]/95 backdrop-blur-xl border-b border-[#3A0D18] px-6 py-6 animate-fadeIn">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-serif text-[#F6EBDD] hover:text-[#F0C95A] py-2 border-b border-[#3A0D18]/30 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateAdmin();
              }}
              className="mt-2 text-sm text-[#DFAE27] flex items-center gap-2 py-2"
            >
              <Lock className="w-4 h-4" /> Acessar Painel /admin
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
