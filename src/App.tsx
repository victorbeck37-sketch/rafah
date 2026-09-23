import React, { useState, useEffect } from 'react';
import { PublicSiteData } from './types';
import { FloatingPetalsCanvas, SpiderLilySVG } from './components/FloralDecorations';
import { HeaderNav } from './components/HeaderNav';
import { HeroSection } from './components/HeroSection';
import { CounterSection } from './components/CounterSection';
import { TimelineSection } from './components/TimelineSection';
import { GallerySection } from './components/GallerySection';
import { LoveNotesSection } from './components/LoveNotesSection';
import { LettersSection } from './components/LettersSection';
import { FutureSection } from './components/FutureSection';
import { CinematicMomentSection } from './components/CinematicMomentSection';
import { FooterSection } from './components/FooterSection';
import { AudioPlayer } from './components/AudioPlayer';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const [siteData, setSiteData] = useState<PublicSiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState('');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  // Sync route with window.location
  useEffect(() => {
    const checkRoute = () => {
      const isAdm = window.location.pathname.startsWith('/admin');
      setIsAdminRoute(isAdm);
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  // Fetch CSRF token and current admin status
  useEffect(() => {
    const initAuthAndCsrf = async () => {
      try {
        const [csrfRes, authRes] = await Promise.all([
          fetch('/api/csrf-token'),
          fetch('/api/auth/me')
        ]);

        if (csrfRes.ok) {
          const csrfData = await csrfRes.json();
          setCsrfToken(csrfData.csrfToken);
        }

        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.authenticated) {
            setAdminUser(authData.user);
          }
        }
      } catch (err) {
        console.error("Initial auth/csrf load error:", err);
      }
    };

    initAuthAndCsrf();
  }, []);

  // Fetch public site data
  const loadSiteData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/public/site');
      if (res.ok) {
        const data = await res.json();
        setSiteData(data);
      }
    } catch (err) {
      console.error("Failed to load public site data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSiteData();
  }, []);

  // Navigation handlers
  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdminRoute(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPublicSite = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
    loadSiteData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      setAdminUser(null);
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  // 1. ADMIN ROUTE RENDERING
  if (isAdminRoute) {
    if (!adminUser) {
      return (
        <AdminLogin
          csrfToken={csrfToken}
          onLoginSuccess={(user, sessionCsrfToken) => {
            setAdminUser(user);
            if (sessionCsrfToken) {
              setCsrfToken(sessionCsrfToken);
            }
          }}
          onBackToSite={navigateToPublicSite}
        />
      );
    }

    return (
      <AdminPanel
        csrfToken={csrfToken}
        adminUser={adminUser}
        onLogout={handleLogout}
        onViewPublicSite={navigateToPublicSite}
      />
    );
  }

  // 2. PUBLIC SITE LOADING STATE
  if (loading || !siteData) {
    return (
      <div className="min-h-screen bg-[#090708] flex items-center justify-center text-[#F6EBDD]">
        <div className="flex flex-col items-center gap-4">
          <SpiderLilySVG className="w-12 h-12 text-[#A9162F] animate-pulse" />
          <p className="font-serif text-lg tracking-wider text-[#F6EBDD]/80">
            Cultivando o jardim do nosso amor...
          </p>
        </div>
      </div>
    );
  }

  const s = siteData.settings;

  // 3. PUBLIC SITE RENDERING
  return (
    <div className="relative min-h-screen bg-[#090708] text-[#F6EBDD] font-sans selection:bg-[#A9162F] selection:text-[#F6EBDD] overflow-x-hidden">
      {/* Floating Petals Canvas particle system */}
      {s.enable_petals && <FloatingPetalsCanvas active={s.enable_petals} />}

      {/* Global Navigation Header */}
      <HeaderNav
        coupleNames={s.couple_names}
        hasMusic={siteData.music.is_active}
        onNavigateAdmin={navigateToAdmin}
      />

      {/* Hero Section */}
      <HeroSection
        title={s.hero_title}
        subtitle={s.hero_subtitle}
        ctaText={s.hero_cta}
        heroImage={s.hero_image}
        coupleNames={s.couple_names}
        onCtaClick={() => {
          const el = document.getElementById(s.counter_enabled ? 'contador' : 'historia');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Real-time Relationship Counter Section */}
      {s.counter_enabled && (
        <CounterSection
          startDateStr={s.counter_start_date}
          title={s.counter_title}
          subtitle={s.counter_subtitle}
        />
      )}

      {/* Nossa História (Timeline) Section */}
      <TimelineSection
        items={siteData.timeline}
        title={s.story_title}
        subtitle={s.story_subtitle}
      />

      {/* Galeria & Álbum de Memórias (Editorial layout with lightbox) */}
      <GallerySection
        items={siteData.gallery}
        title={s.gallery_title}
        subtitle={s.gallery_subtitle}
      />

      {/* Pequenas Coisas Que Amo Em Você (Emotional Cards) */}
      <LoveNotesSection
        notes={siteData.notes}
        title={s.notes_title}
        subtitle={s.notes_subtitle}
      />

      {/* Cartas Pessoais & Carta Secreta */}
      <LettersSection
        letters={siteData.letters}
        secretLetter={siteData.secret_letter}
        title={s.letters_title}
        subtitle={s.letters_subtitle}
      />

      {/* Momento Cinematográfico (Transição e Declaração) */}
      <CinematicMomentSection
        title1={s.cinematic_title_1}
        title2={s.cinematic_title_2}
        description={s.cinematic_desc}
      />

      {/* Tudo Que Ainda Vamos Viver (Futuro & Sonhos) */}
      <FutureSection
        items={siteData.future}
        title={s.future_title}
        subtitle={s.future_subtitle}
      />

      {/* Footer Section */}
      <FooterSection
        title={s.footer_title}
        text={s.footer_text}
        signature={s.footer_signature}
        onEasterEggClick={navigateToAdmin}
      />

      {/* Floating Discrete Audio Player */}
      <AudioPlayer track={siteData.music} />
    </div>
  );
}
