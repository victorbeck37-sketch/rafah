import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Clock } from 'lucide-react';
import { SpiderLilySVG, SunflowerSVG } from './FloralDecorations';

interface CounterProps {
  startDateStr: string;
  title: string;
  subtitle: string;
}

interface TimeElapsed {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
}

export function CounterSection({ startDateStr, title, subtitle }: CounterProps) {
  const [elapsed, setElapsed] = useState<TimeElapsed>({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalDays: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startDateStr);
      const now = new Date();
      if (isNaN(start.getTime())) return;

      // Difference in ms
      const diffMs = Math.max(0, now.getTime() - start.getTime());
      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // Accurate calendar calculation
      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      let days = now.getDate() - start.getDate();
      let hours = now.getHours() - start.getHours();
      let minutes = now.getMinutes() - start.getMinutes();
      let seconds = now.getSeconds() - start.getSeconds();

      if (seconds < 0) {
        seconds += 60;
        minutes -= 1;
      }
      if (minutes < 0) {
        minutes += 60;
        hours -= 1;
      }
      if (hours < 0) {
        hours += 24;
        days -= 1;
      }
      if (days < 0) {
        // days in previous month
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
        months -= 1;
      }
      if (months < 0) {
        months += 12;
        years -= 1;
      }

      setElapsed({
        years: Math.max(0, years),
        months: Math.max(0, months),
        days: Math.max(0, days),
        hours: Math.max(0, hours),
        minutes: Math.max(0, minutes),
        seconds: Math.max(0, seconds),
        totalDays,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDateStr]);

  const units = [
    { label: 'Anos', value: elapsed.years },
    { label: 'Meses', value: elapsed.months },
    { label: 'Dias', value: elapsed.days },
    { label: 'Horas', value: elapsed.hours },
    { label: 'Minutos', value: elapsed.minutes },
    { label: 'Segundos', value: elapsed.seconds },
  ];

  const formattedDate = () => {
    try {
      const d = new Date(startDateStr);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return "";
    }
  };

  return (
    <section id="contador" className="relative py-20 px-4 sm:px-6 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#090708] via-[#12090D] to-[#090708] -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#A9162F]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto text-center">
        {/* Decorative botanical header */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <SpiderLilySVG className="w-5 h-5 text-[#A9162F]" glow={false} />
          <span className="text-xs uppercase tracking-[0.2em] text-[#DFAE27] font-medium flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Nosso Tempo
          </span>
          <SunflowerSVG className="w-5 h-5 text-[#DFAE27]" glow={false} />
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F6EBDD] font-normal tracking-wide mb-3">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm sm:text-base text-[#B9A8A0] max-w-xl mx-auto font-light leading-relaxed mb-10">
            {subtitle}
          </p>
        )}

        {/* Counter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 max-w-3xl mx-auto">
          {units.map((unit, index) => (
            <div
              key={unit.label}
              className="relative group bg-[#160b11]/80 border border-[#3A0D18] hover:border-[#641329] p-4 sm:p-5 rounded-xl transition-all duration-300 hover:-translate-y-1 shadow-lg"
            >
              <div className="text-3xl sm:text-4xl font-serif text-[#F0C95A] font-light tracking-tight mb-1">
                {unit.value.toString().padStart(2, '0')}
              </div>
              <div className="text-xs tracking-wider uppercase text-[#B9A8A0] font-sans">
                {unit.label}
              </div>
              <div className="absolute inset-x-4 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#A9162F]/40 to-transparent group-hover:via-[#D92E45]/80 transition-colors" />
            </div>
          ))}
        </div>

        {/* Total days subtitle */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[#B9A8A0] font-light">
          {formattedDate() && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#DFAE27]" /> Desde {formattedDate()}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#A9162F]" /> Mais de {elapsed.totalDays.toLocaleString('pt-BR')} dias de história
          </span>
        </div>
      </div>
    </section>
  );
}
