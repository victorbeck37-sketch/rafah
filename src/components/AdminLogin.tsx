import React, { useState } from 'react';
import { SpiderLilySVG, SunflowerSVG } from './FloralDecorations';
import { Lock, ArrowLeft, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  csrfToken: string;
  onLoginSuccess: (user: any, csrfToken: string) => void;
  onBackToSite: () => void;
}

export function AdminLogin({ csrfToken, onLoginSuccess, onBackToSite }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok) {
        // Propagate the session CSRF token so the panel's save requests pass validation
        onLoginSuccess(data.user, data.csrfToken);
      } else {
        setErrorMsg(data.error || 'Credenciais inválidas. Verifique seu usuário e senha.');
      }
    } catch (err) {
      setErrorMsg('Erro de conexão ao tentar autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090708] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Twilight background aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#12090D] via-[#090708] to-[#14080F] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#A9162F]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Botanical corner decorations */}
      <div className="absolute left-4 bottom-4 opacity-40 pointer-events-none">
        <SpiderLilySVG className="w-28 h-auto text-[#A9162F]" glow={false} />
      </div>
      <div className="absolute right-4 top-4 opacity-30 pointer-events-none">
        <SunflowerSVG className="w-24 h-auto text-[#DFAE27]" glow={false} />
      </div>

      {/* Login Card */}
      <div className="relative z-10 max-w-md w-full bg-[#12080E]/95 border border-[#3A0D18] rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Back to site button */}
        <button
          onClick={onBackToSite}
          className="inline-flex items-center gap-1.5 text-xs text-[#B9A8A0] hover:text-[#F0C95A] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao site público
        </button>

        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#230C16] border border-[#641329] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Lock className="w-5 h-5 text-[#F0C95A]" />
          </div>
          <h2 className="text-2xl font-serif text-[#F6EBDD] font-normal tracking-wide">
            Administração do Jardim
          </h2>
          <p className="text-xs text-[#B9A8A0] mt-1 font-light">
            Entre para personalizar textos, momentos, cartas e memórias.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#B9A8A0] mb-1.5 font-medium">
              Nome de Usuário
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-2.5 bg-[#090708] border border-[#2A0E18] focus:border-[#F0C95A] rounded-xl text-sm text-[#F6EBDD] outline-none transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#B9A8A0] mb-1.5 font-medium">
              Senha de Acesso
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-[#090708] border border-[#2A0E18] focus:border-[#F0C95A] rounded-xl text-sm text-[#F6EBDD] outline-none transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B9A8A0] hover:text-[#F6EBDD] cursor-pointer"
                aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-[#A9162F] to-[#641329] hover:from-[#D92E45] hover:to-[#A9162F] text-[#F6EBDD] py-3 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Validando credenciais...' : 'Acessar Painel'}
          </button>
        </form>

        {/* Demo credentials hint for convenience */}
        <div className="mt-8 pt-4 border-t border-[#2A0E18] text-center">
          <p className="text-[11px] text-[#B9A8A0]/70">
            Acesso padrão inicial: <strong className="text-[#F0C95A]">admin</strong> / <strong className="text-[#F0C95A]">amor123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
