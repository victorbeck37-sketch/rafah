import React, { useEffect, useRef } from 'react';

export function SpiderLilySVG({ className = "w-12 h-12 text-[#D92E45]", glow = true }: { className?: string; glow?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${glow ? 'drop-shadow-[0_0_12px_rgba(217,46,69,0.4)]' : ''} transition-transform duration-700 hover:scale-110`}
      aria-hidden="true"
    >
      {/* Central Stem */}
      <path d="M60 115 C58 90, 62 65, 60 48" stroke="#17251B" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M60 70 C54 60, 48 55, 42 50" stroke="#1F3325" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 62 C66 54, 72 50, 78 46" stroke="#1F3325" strokeWidth="2" strokeLinecap="round" />

      {/* Spider Lily Petals - Narrow, elegantly recurved backwards */}
      {/* Upper petals */}
      <path d="M60 48 C50 35, 30 25, 20 32 C35 38, 52 42, 60 48" fill="currentColor" fillOpacity="0.9" />
      <path d="M60 48 C70 35, 90 25, 100 32 C85 38, 68 42, 60 48" fill="currentColor" fillOpacity="0.9" />
      
      {/* Side arching petals */}
      <path d="M60 48 C45 40, 22 45, 12 55 C28 55, 48 50, 60 48" fill="#A9162F" />
      <path d="M60 48 C75 40, 98 45, 108 55 C92 55, 72 50, 60 48" fill="#A9162F" />

      {/* Upward curved petals */}
      <path d="M60 48 C55 30, 48 18, 38 12 C44 24, 52 38, 60 48" fill="#D92E45" />
      <path d="M60 48 C65 30, 72 18, 82 12 C76 24, 68 38, 60 48" fill="#D92E45" />

      {/* Extended Long Curving Stamens (Iconic feature of Lycoris radiata) */}
      <path d="M60 48 C50 20, 25 10, 10 18" stroke="#D92E45" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="18" r="2" fill="#F0C95A" />

      <path d="M60 48 C55 15, 38 4, 26 8" stroke="#D92E45" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="26" cy="8" r="2" fill="#F0C95A" />

      <path d="M60 48 C60 12, 58 2, 54 2" stroke="#D92E45" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="54" cy="2" r="2" fill="#F0C95A" />

      <path d="M60 48 C60 12, 62 2, 66 2" stroke="#D92E45" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="66" cy="2" r="2" fill="#F0C95A" />

      <path d="M60 48 C65 15, 82 4, 94 8" stroke="#D92E45" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="94" cy="8" r="2" fill="#F0C95A" />

      <path d="M60 48 C70 20, 95 10, 110 18" stroke="#D92E45" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="110" cy="18" r="2" fill="#F0C95A" />

      <path d="M60 48 C75 32, 105 30, 115 42" stroke="#A9162F" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="115" cy="42" r="1.8" fill="#F0C95A" />

      <path d="M60 48 C45 32, 15 30, 5 42" stroke="#A9162F" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="5" cy="42" r="1.8" fill="#F0C95A" />

      {/* Flower core highlight */}
      <circle cx="60" cy="48" r="3" fill="#641329" />
    </svg>
  );
}

export function SunflowerSVG({ className = "w-12 h-12 text-[#DFAE27]", glow = true }: { className?: string; glow?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${glow ? 'drop-shadow-[0_0_15px_rgba(223,174,39,0.35)]' : ''} transition-transform duration-700 hover:scale-110`}
      aria-hidden="true"
    >
      {/* Stem & Leaves */}
      <path d="M60 115 C58 95, 61 75, 60 60" stroke="#17251B" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 85 C48 80, 40 70, 36 62 C48 65, 56 75, 60 85" fill="#1F3325" />
      <path d="M60 78 C72 74, 80 65, 84 56 C72 60, 64 70, 60 78" fill="#1F3325" />

      {/* Outer Petals Array */}
      <g transform="translate(60,60)">
        {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((angle, idx) => (
          <path
            key={`outer-${idx}`}
            d="M-7 -22 C-10 -36, 0 -48, 0 -48 C0 -48, 10 -36, 7 -22 Z"
            fill={idx % 2 === 0 ? "#DFAE27" : "#F0C95A"}
            transform={`rotate(${angle})`}
            opacity="0.95"
          />
        ))}

        {/* Inner Petals Array */}
        {[11.25, 33.75, 56.25, 78.75, 101.25, 123.75, 146.25, 168.75, 191.25, 213.75, 236.25, 258.75, 281.25, 303.75, 326.25, 348.75].map((angle, idx) => (
          <path
            key={`inner-${idx}`}
            d="M-5 -20 C-8 -32, 0 -42, 0 -42 C0 -42, 8 -32, 5 -20 Z"
            fill="#E5B220"
            transform={`rotate(${angle})`}
            opacity="0.85"
          />
        ))}

        {/* Textured Warm Center */}
        <circle cx="0" cy="0" r="22" fill="#3A0D18" />
        <circle cx="0" cy="0" r="18" fill="#290A11" />
        <circle cx="0" cy="0" r="14" fill="#1F080D" />

        {/* Golden seed florets */}
        {[-8, -4, 0, 4, 8].map((x) =>
          [-8, -4, 0, 4, 8].map((y) => (
            Math.sqrt(x * x + y * y) < 14 ? (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="1" fill="#DFAE27" opacity="0.6" />
            ) : null
          ))
        )}
      </g>
    </svg>
  );
}

export function FloatingPetalsCanvas({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool: gentle crimson petals & warm golden fireflies
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      type: 'petal' | 'sparkle';
      color: string;
    }

    const count = window.innerWidth < 768 ? 16 : 28;
    const particles: Particle[] = [];

    const petalColors = ['rgba(169, 22, 47, 0.45)', 'rgba(217, 46, 69, 0.4)', 'rgba(100, 19, 41, 0.35)'];
    const sparkColors = ['rgba(240, 201, 90, 0.5)', 'rgba(223, 174, 39, 0.45)'];

    for (let i = 0; i < count; i++) {
      const isSpark = Math.random() > 0.65;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: isSpark ? Math.random() * 2 + 1 : Math.random() * 6 + 4,
        speedX: (Math.random() - 0.4) * 0.6,
        speedY: isSpark ? (Math.random() - 0.5) * 0.3 : Math.random() * 0.7 + 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.5 + 0.3,
        type: isSpark ? 'sparkle' : 'petal',
        color: isSpark
          ? sparkColors[Math.floor(Math.random() * sparkColors.length)]
          : petalColors[Math.floor(Math.random() * petalColors.length)]
      });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX * 60 * dt;
        p.y += p.speedY * 60 * dt;
        p.rotation += p.rotationSpeed * 60 * dt;

        // Wrap around boundaries
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (p.type === 'sparkle') {
          // Warm golden firefly
          const radGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2);
          radGrad.addColorStop(0, p.color);
          radGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Delicate elongated spider lily curved petal
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size * 0.5, 0, 0, p.size * 1.5);
          ctx.quadraticCurveTo(-p.size * 0.5, 0, 0, -p.size);
          ctx.fill();
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      style={{ opacity: 0.85 }}
      aria-hidden="true"
    />
  );
}

export function BotanicalDivider({ mode = 'lily' }: { mode?: 'lily' | 'sunflower' | 'both' }) {
  return (
    <div className="flex items-center justify-center gap-4 my-16 opacity-80" aria-hidden="true">
      <div className="h-[1px] w-16 sm:w-32 bg-gradient-to-r from-transparent via-[#641329] to-[#A9162F]" />
      {mode === 'lily' && <SpiderLilySVG className="w-8 h-8 text-[#A9162F]" />}
      {mode === 'sunflower' && <SunflowerSVG className="w-8 h-8 text-[#DFAE27]" />}
      {mode === 'both' && (
        <div className="flex items-center gap-2">
          <SpiderLilySVG className="w-7 h-7 text-[#A9162F]" />
          <span className="text-[#F0C95A] text-xs">✦</span>
          <SunflowerSVG className="w-7 h-7 text-[#DFAE27]" />
        </div>
      )}
      <div className="h-[1px] w-16 sm:w-32 bg-gradient-to-l from-transparent via-[#641329] to-[#A9162F]" />
    </div>
  );
}
