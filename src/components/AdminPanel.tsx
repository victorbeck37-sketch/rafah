import React, { useState, useEffect } from 'react';
import {
  PublicSiteData,
  TimelineItem,
  GalleryItem,
  LoveNote,
  Letter,
  SecretLetter,
  MusicTrack,
  FutureItem,
  EasterEgg,
  MediaFile,
  SiteSettings
} from '../types';
import { getLocalSiteData, saveLocalSiteData, defaultPublicSiteData } from '../data/defaultData';
import {
  LayoutDashboard,
  Clock,
  Image as ImageIcon,
  Mail,
  Heart,
  Music,
  Compass,
  Palette,
  UploadCloud,
  Lock,
  Download,
  RotateCcw,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Eye,
  Copy,
  FolderDown,
  Sparkles,
  ShieldAlert,
  Save,
  Database,
  RefreshCw,
  ImagePlus
} from 'lucide-react';
import { SpiderLilySVG, SunflowerSVG } from './FloralDecorations';

interface AdminPanelProps {
  csrfToken: string;
  adminUser: { username: string; name: string };
  onLogout: () => void;
  onViewPublicSite: () => void;
}

export function AdminPanel({ csrfToken, adminUser, onLogout, onViewPublicSite }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [siteData, setSiteData] = useState<PublicSiteData | null>(null);
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [syncingSupabase, setSyncingSupabase] = useState(false);

  // Security Credentials state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [securityMsg, setSecurityMsg] = useState('');

  // Editing modals/states
  const [editingTimeline, setEditingTimeline] = useState<TimelineItem | null>(null);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [editingNote, setEditingNote] = useState<LoveNote | null>(null);
  const [editingLetter, setEditingLetter] = useState<Letter | null>(null);
  const [editingFuture, setEditingFuture] = useState<FutureItem | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchFullData = async () => {
    try {
      setLoading(true);
      const [siteRes, mediaRes, statsRes, logsRes] = await Promise.allSettled([
        fetch('/api/public/site'),
        fetch('/api/admin/media'),
        fetch('/api/admin/stats'),
        fetch('/api/admin/logs')
      ]);

      if (siteRes.status === 'fulfilled' && siteRes.value.ok) {
        const data = await siteRes.value.json();
        setSiteData(data);
        saveLocalSiteData(data);
      } else {
        setSiteData(getLocalSiteData());
      }

      if (mediaRes.status === 'fulfilled' && mediaRes.value.ok) {
        setMediaList(await mediaRes.value.json());
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        setStats(await statsRes.value.json());
      }
      if (logsRes.status === 'fulfilled' && logsRes.value.ok) {
        setAuditLogs(await logsRes.value.json());
      }

      // Check Supabase PG status
      try {
        const supaRes = await fetch('/api/admin/supabase-status');
        if (supaRes.ok) {
          const sData = await supaRes.json();
          setSupabaseStatus(sData);
        }
      } catch (sErr) {
        console.warn("Supabase status check:", sErr);
      }
    } catch (err) {
      console.warn("Notice loading admin data (offline/static mode):", err);
      setSiteData(getLocalSiteData());
    } finally {
      setLoading(false);
    }
  };

  const handleSupabaseSync = async (direction: 'to_cloud' | 'from_cloud') => {
    setSyncingSupabase(true);
    try {
      const res = await fetch('/api/admin/supabase-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ direction })
      });
      const result = await res.json();
      if (res.ok) {
        showToast(result.message || 'Sincronização concluída com sucesso!');
        await fetchFullData();
      } else {
        showToast(result.error || 'Falha na sincronização.');
      }
    } catch (e) {
      showToast('Erro de conexão ao sincronizar com Supabase.');
    } finally {
      setSyncingSupabase(false);
    }
  };

  useEffect(() => {
    fetchFullData();
  }, []);

  const saveSettings = async (updatedSettings: Partial<SiteSettings>) => {
    if (!siteData) return;
    setIsSaving(true);
    const newSiteData: PublicSiteData = {
      ...siteData,
      settings: { ...siteData.settings, ...updatedSettings }
    };
    setSiteData(newSiteData);
    saveLocalSiteData(newSiteData);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        const json = await res.json();
        setSiteData({ ...newSiteData, settings: json.settings });
        saveLocalSiteData({ ...newSiteData, settings: json.settings });
        showToast("Configurações salvas com sucesso!");
      } else {
        showToast("Configurações salvas localmente!");
      }
    } catch (e) {
      showToast("Configurações salvas localmente (Modo Vercel)!");
    } finally {
      setIsSaving(false);
    }
  };

  // Timeline operations
  const saveTimelineItems = async (items: TimelineItem[]) => {
    if (!siteData) return;
    setIsSaving(true);
    const newSiteData: PublicSiteData = { ...siteData, timeline: items };
    setSiteData(newSiteData);
    saveLocalSiteData(newSiteData);
    setEditingTimeline(null);

    try {
      const res = await fetch('/api/admin/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ items })
      });
      if (res.ok) {
        showToast("Momento salvo com sucesso!");
      } else {
        showToast("Momento salvo localmente!");
      }
    } catch (err) {
      showToast("Momento salvo localmente (Modo Vercel)!");
    } finally {
      setIsSaving(false);
    }
  };

  // Gallery operations
  const saveGalleryItems = async (items: GalleryItem[]) => {
    if (!siteData) return;
    setIsSaving(true);
    const newSiteData: PublicSiteData = { ...siteData, gallery: items };
    setSiteData(newSiteData);
    saveLocalSiteData(newSiteData);
    setEditingGallery(null);

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ items })
      });
      if (res.ok) {
        showToast("Foto salva com sucesso!");
      } else {
        showToast("Foto salva localmente!");
      }
    } catch (err) {
      showToast("Foto salva localmente (Modo Vercel)!");
    } finally {
      setIsSaving(false);
    }
  };

  // Love Notes operations
  const saveNotesItems = async (items: LoveNote[]) => {
    if (!siteData) return;
    setIsSaving(true);
    const newSiteData: PublicSiteData = { ...siteData, notes: items };
    setSiteData(newSiteData);
    saveLocalSiteData(newSiteData);
    setEditingNote(null);

    try {
      const res = await fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ items })
      });
      if (res.ok) {
        showToast("Mensagem salva com sucesso!");
      } else {
        showToast("Mensagem salva localmente!");
      }
    } catch (err) {
      showToast("Mensagem salva localmente (Modo Vercel)!");
    } finally {
      setIsSaving(false);
    }
  };

  // Letters operations
  const saveLettersItems = async (items: Letter[]) => {
    if (!siteData) return;
    setIsSaving(true);
    const newSiteData: PublicSiteData = { ...siteData, letters: items };
    setSiteData(newSiteData);
    saveLocalSiteData(newSiteData);
    setEditingLetter(null);

    try {
      const res = await fetch('/api/admin/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ items })
      });
      if (res.ok) {
        showToast("Carta salva com sucesso!");
      } else {
        showToast("Carta salva localmente!");
      }
    } catch (err) {
      showToast("Carta salva localmente (Modo Vercel)!");
    } finally {
      setIsSaving(false);
    }
  };

  // Future operations
  const saveFutureItems = async (items: FutureItem[]) => {
    if (!siteData) return;
    setIsSaving(true);
    const newSiteData: PublicSiteData = { ...siteData, future: items };
    setSiteData(newSiteData);
    saveLocalSiteData(newSiteData);
    setEditingFuture(null);

    try {
      const res = await fetch('/api/admin/future', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ items })
      });
      if (res.ok) {
        showToast("Sonho futuro salvo!");
      } else {
        showToast("Sonho salvo localmente!");
      }
    } catch (err) {
      showToast("Sonho salvo localmente (Modo Vercel)!");
    } finally {
      setIsSaving(false);
    }
  };

  // Secret Letter
  const saveSecretLetter = async (secret: SecretLetter) => {
    if (!siteData) return;
    setIsSaving(true);
    const newSiteData: PublicSiteData = { ...siteData, secret_letter: secret };
    setSiteData(newSiteData);
    saveLocalSiteData(newSiteData);

    try {
      const res = await fetch('/api/admin/secret-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify(secret)
      });
      if (res.ok) {
        showToast("Carta secreta atualizada!");
      } else {
        showToast("Carta secreta atualizada localmente!");
      }
    } catch (err) {
      showToast("Carta secreta atualizada localmente (Modo Vercel)!");
    } finally {
      setIsSaving(false);
    }
  };

  // Music settings
  const saveMusic = async (music: MusicTrack) => {
    if (!siteData) return;
    setIsSaving(true);
    const newSiteData: PublicSiteData = { ...siteData, music };
    setSiteData(newSiteData);
    saveLocalSiteData(newSiteData);

    try {
      const res = await fetch('/api/admin/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify(music)
      });
      if (res.ok) {
        showToast("Música do casal atualizada!");
      } else {
        showToast("Música atualizada localmente!");
      }
    } catch (err) {
      showToast("Música atualizada localmente (Modo Vercel)!");
    } finally {
      setIsSaving(false);
    }
  };

  // Uploads an image via the API and returns the permanent URL.
  // Used by the Timeline/Gallery editors so users never paste temporary
  // blob: URLs (e.g. from WhatsApp Web) that die with the browser session.
  const uploadImageForField = async (file: File, onUploaded: (url: string) => void) => {
    if (!file.type.startsWith('image/')) {
      showToast('Envie um arquivo de imagem (JPG, PNG, WebP).');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
        body: formData
      });
      if (res.ok) {
        const json = await res.json();
        onUploaded(json.media.url);
        setMediaList([json.media, ...mediaList]);
        showToast('Foto enviada e salva na nuvem! ✓');
      } else {
        const err = await res.json().catch(() => ({ error: 'Falha no upload.' }));
        showToast(err.error || 'Falha no upload da foto.');
      }
    } catch {
      showToast('Erro de conexão ao enviar a foto.');
    } finally {
      setUploading(false);
    }
  };

  const ImageUrlField = ({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) => (
    <div>
      <label className="block text-xs text-[#B9A8A0] mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-[#090708] border border-[#2A0E18] rounded-lg text-sm text-[#F6EBDD]"
      />
      {value.startsWith('blob:') && (
        <p className="text-[11px] text-red-400 mt-1">
          ⚠️ Este link é temporário do navegador e vai quebrar! Envie o arquivo da foto abaixo.
        </p>
      )}
      <label className="inline-flex items-center gap-1.5 mt-2 text-xs text-[#F0C95A] cursor-pointer hover:text-[#F6EBDD]">
        <ImagePlus className="w-3.5 h-3.5" />
        {uploading ? 'Enviando...' : 'Enviar foto do dispositivo'}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadImageForField(f, onChange);
            e.target.value = '';
          }}
        />
      </label>
    </div>
  );

  // File Upload handler with base64 offline fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
        body: formData
      });
      if (res.ok) {
        const json = await res.json();
        setMediaList([json.media, ...mediaList]);
        showToast("Upload concluído com sucesso!");
        return;
      }
      throw new Error("API upload unavailable");
    } catch (err) {
      // Fallback to Data URL for static hosting
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newMedia: MediaFile = {
          id: `media_${Date.now()}`,
          filename: file.name,
          original_name: file.name,
          url: dataUrl,
          mime: file.type,
          size: file.size,
          alt: file.name,
          created_at: new Date().toISOString()
        };
        setMediaList([newMedia, ...mediaList]);
        showToast("Foto adicionada com sucesso!");
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Delete Media
  const handleDeleteMedia = async (id: string) => {
    if (!confirm("Deseja realmente excluir este arquivo de mídia?")) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      if (res.ok) {
        setMediaList(mediaList.filter(m => m.id !== id));
        showToast("Mídia excluída!");
      }
    } catch (err) {
      showToast("Erro ao excluir mídia.");
    }
  };

  // Reset to Demo
  const handleResetDemo = async () => {
    if (!confirm("ATENÇÃO: Isso restaurará todos os textos, momentos, cartas e fotos para a demonstração original. Deseja continuar?")) return;
    try {
      const res = await fetch('/api/admin/reset-demo', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken }
      });
      if (res.ok) {
        showToast("Site restaurado para o padrão original!");
        fetchFullData();
      }
    } catch (e) {
      showToast("Erro ao restaurar padrão.");
    }
  };

  // Backup restore
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await fetch('/api/admin/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
          body: JSON.stringify(json)
        });
        if (res.ok) {
          showToast("Backup restaurado com sucesso!");
          fetchFullData();
        } else {
          showToast("Arquivo de backup inválido.");
        }
      } catch (err) {
        showToast("Erro ao ler arquivo JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Export PHP package
  const handleExportPhp = async () => {
    try {
      const res = await fetch('/api/admin/export-php');
      if (res.ok) {
        showToast("Pacote PHP 8.2+ e MySQL pronto para download!");
      }
    } catch (e) {
      showToast("Erro ao gerar pacote.");
    }
  };

  // Change security credentials
  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMsg('');
    try {
      const res = await fetch('/api/admin/security/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ currentPassword, newUsername, newPassword, newName })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Credenciais atualizadas com sucesso!");
        setCurrentPassword('');
        setNewPassword('');
        setSecurityMsg("Senha e credenciais salvas.");
      } else {
        setSecurityMsg(data.error || "Erro ao salvar.");
      }
    } catch (err) {
      setSecurityMsg("Erro de conexão ao atualizar credenciais.");
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'settings', label: 'Identidade & Hero', icon: Palette },
    { id: 'timeline', label: 'Nossa História', icon: Clock },
    { id: 'gallery', label: 'Galeria de Fotos', icon: ImageIcon },
    { id: 'letters', label: 'Cartas Pessoais', icon: Mail },
    { id: 'notes', label: 'Coisas Que Amo', icon: Heart },
    { id: 'music', label: 'Música do Casal', icon: Music },
    { id: 'future', label: 'Sonhos & Futuro', icon: Compass },
    { id: 'secret', label: 'Carta Secreta', icon: Sparkles },
    { id: 'media', label: 'Biblioteca de Mídia', icon: UploadCloud },
    { id: 'security', label: 'Segurança & Senha', icon: Lock },
    { id: 'backup', label: 'Supabase & Backup', icon: Database },
  ];

  if (loading || !siteData) {
    return (
      <div className="min-h-screen bg-[#090708] flex items-center justify-center text-[#F6EBDD]">
        <div className="flex flex-col items-center gap-4">
          <SpiderLilySVG className="w-12 h-12 text-[#A9162F] animate-pulse" />
          <p className="font-serif text-lg tracking-wider">Carregando painel do jardim...</p>
        </div>
      </div>
    );
  }

  const s = siteData.settings;

  return (
    <div className="min-h-screen bg-[#0C0609] text-[#F6EBDD] flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1F0A14] border border-[#A9162F] text-[#F6EBDD] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn">
          <Check className="w-4 h-4 text-[#F0C95A]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#12080E] border-r border-[#2A0E18] flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-[#2A0E18] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <SpiderLilySVG className="w-7 h-7 text-[#D92E45]" glow={false} />
              <div>
                <h1 className="font-serif font-semibold text-base text-[#F6EBDD]">Painel do Jardim</h1>
                <span className="text-[10px] text-[#DFAE27] tracking-wider uppercase font-medium">Administração</span>
              </div>
            </div>
          </div>

          {/* Quick links to public site */}
          <div className="px-4 py-3 border-b border-[#2A0E18]/60 flex gap-2">
            <button
              onClick={onViewPublicSite}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#230C16] hover:bg-[#341120] text-xs text-[#F0C95A] py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> Ver Site
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#3A0D18] text-[#F0C95A] border border-[#641329]'
                      : 'text-[#B9A8A0] hover:bg-[#1A0A13] hover:text-[#F6EBDD]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F0C95A]' : 'text-[#8A766F]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User footer & Logout */}
        <div className="p-4 border-t border-[#2A0E18] bg-[#0E060B]">
          <div className="flex items-center justify-between text-xs">
            <div className="truncate mr-2">
              <p className="font-medium text-[#F6EBDD] truncate">{adminUser.name || 'Admin'}</p>
              <p className="text-[10px] text-[#B9A8A0] truncate">@{adminUser.username}</p>
            </div>
            <button
              onClick={onLogout}
              className="text-[#B9A8A0] hover:text-[#D92E45] p-2 rounded-lg hover:bg-[#1C0913] transition-colors cursor-pointer"
              title="Encerrar sessão"
              aria-label="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-6xl">
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#F6EBDD] font-normal">
                Visão Geral do Jardim
              </h2>
              <p className="text-xs sm:text-sm text-[#B9A8A0] mt-1">
                Monitore tudo que está publicado e faça ajustes rápidos sem tocar em nenhuma linha de código.
              </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#14080F] border border-[#2A0E18] p-5 rounded-2xl">
                <span className="text-xs text-[#B9A8A0] uppercase tracking-wider block">Momentos da História</span>
                <span className="text-3xl font-serif text-[#F0C95A] font-light mt-1 block">{stats?.total_moments || siteData.timeline.length}</span>
              </div>
              <div className="bg-[#14080F] border border-[#2A0E18] p-5 rounded-2xl">
                <span className="text-xs text-[#B9A8A0] uppercase tracking-wider block">Fotos no Álbum</span>
                <span className="text-3xl font-serif text-[#DFAE27] font-light mt-1 block">{stats?.total_photos || siteData.gallery.length}</span>
              </div>
              <div className="bg-[#14080F] border border-[#2A0E18] p-5 rounded-2xl">
                <span className="text-xs text-[#B9A8A0] uppercase tracking-wider block">Cartas Pessoais</span>
                <span className="text-3xl font-serif text-[#D92E45] font-light mt-1 block">{stats?.total_letters || siteData.letters.length}</span>
              </div>
              <div className="bg-[#14080F] border border-[#2A0E18] p-5 rounded-2xl">
                <span className="text-xs text-[#B9A8A0] uppercase tracking-wider block">Sonhos Futuros</span>
                <span className="text-3xl font-serif text-[#F0C95A] font-light mt-1 block">{stats?.total_dreams || siteData.future.length}</span>
              </div>
            </div>

            {/* Supabase Cloud Database Status Banner */}
            <div className="bg-gradient-to-r from-[#170912] via-[#200A19] to-[#170912] border border-[#F0C95A]/30 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2A0E18] border border-[#641329] flex items-center justify-center text-[#F0C95A] shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif text-sm font-semibold text-[#F6EBDD]">Banco de Dados Supabase (PostgreSQL)</h3>
                    {supabaseStatus?.connected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Conectado e Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-950/80 text-amber-300 border border-amber-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Conectando...
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#B9A8A0] mt-0.5">
                    Host: <code className="text-[#F6EBDD] font-mono text-[11px]">db.wevebkpkwsocozcqrixt.supabase.co</code> (AWS São Paulo) &bull; Persistência em nuvem ativada.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleSupabaseSync('to_cloud')}
                  disabled={syncingSupabase}
                  className="flex items-center gap-1.5 bg-[#3A0D18] hover:bg-[#641329] text-xs text-[#F0C95A] px-3.5 py-2 rounded-xl border border-[#641329] transition-colors cursor-pointer disabled:opacity-50"
                  title="Sincronizar conteúdo atual com o Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingSupabase ? 'animate-spin' : ''}`} />
                  {syncingSupabase ? 'Sincronizando...' : 'Sincronizar Nuvem'}
                </button>
                <button
                  onClick={() => setActiveTab('backup')}
                  className="text-xs text-[#B9A8A0] hover:text-[#F6EBDD] px-2 py-1 underline cursor-pointer"
                >
                  Ver Detalhes
                </button>
              </div>
            </div>

            {/* Status overview list */}
            <div className="bg-[#14080F] border border-[#2A0E18] p-6 rounded-2xl space-y-4">
              <h3 className="text-lg font-serif text-[#F6EBDD]">Status dos Recursos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center justify-between p-3 bg-[#1B0A14] rounded-xl">
                  <span>Música do Casal:</span>
                  <span className={`font-semibold ${siteData.music.is_active ? 'text-green-400' : 'text-red-400'}`}>
                    {siteData.music.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#1B0A14] rounded-xl">
                  <span>Contador de Tempo:</span>
                  <span className={`font-semibold ${siteData.settings.counter_enabled ? 'text-green-400' : 'text-red-400'}`}>
                    {siteData.settings.counter_enabled ? 'Ativo' : 'Desativado'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#1B0A14] rounded-xl">
                  <span>Pétalas Flutuantes:</span>
                  <span className={`font-semibold ${siteData.settings.enable_petals ? 'text-green-400' : 'text-zinc-500'}`}>
                    {siteData.settings.enable_petals ? 'Ligadas' : 'Desligadas'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#1B0A14] rounded-xl">
                  <span>Carta Secreta:</span>
                  <span className={`font-semibold ${siteData.secret_letter.is_active ? 'text-green-400' : 'text-zinc-500'}`}>
                    {siteData.secret_letter.is_active ? 'Ativa' : 'Desativada'}
                  </span>
                </div>
              </div>
            </div>

            {/* Audit logs */}
            <div className="bg-[#14080F] border border-[#2A0E18] p-6 rounded-2xl">
              <h3 className="text-lg font-serif text-[#F6EBDD] mb-4">Registro de Alterações Recentes</h3>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="text-xs p-2.5 bg-[#1B0A14] rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[#F6EBDD] font-medium">{log.action}</span>
                      {log.details && <span className="text-[#B9A8A0] ml-2 font-light">({log.details})</span>}
                    </div>
                    <span className="text-[10px] text-[#B9A8A0]/60 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SETTINGS (IDENTIDADE & HERO) */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-serif text-[#F6EBDD]">Identidade & Hero</h2>
              <p className="text-xs text-[#B9A8A0]">Altere os nomes, títulos e textos de entrada.</p>
            </div>

            <div className="bg-[#14080F] border border-[#2A0E18] p-6 rounded-2xl space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#B9A8A0] mb-1.5">Nome do Casal</label>
                  <input
                    type="text"
                    value={s.couple_names}
                    onChange={(e) => setSiteData({ ...siteData, settings: { ...s, couple_names: e.target.value } })}
                    className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD] outline-none focus:border-[#A9162F]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#B9A8A0] mb-1.5">Título do Hero</label>
                  <input
                    type="text"
                    value={s.hero_title}
                    onChange={(e) => setSiteData({ ...siteData, settings: { ...s, hero_title: e.target.value } })}
                    className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD] outline-none focus:border-[#A9162F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#B9A8A0] mb-1.5">Subtítulo Poético do Hero</label>
                <textarea
                  rows={3}
                  value={s.hero_subtitle}
                  onChange={(e) => setSiteData({ ...siteData, settings: { ...s, hero_subtitle: e.target.value } })}
                  className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD] outline-none focus:border-[#A9162F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#B9A8A0] mb-1.5">Texto do Botão CTA</label>
                  <input
                    type="text"
                    value={s.hero_cta}
                    onChange={(e) => setSiteData({ ...siteData, settings: { ...s, hero_cta: e.target.value } })}
                    className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD] outline-none focus:border-[#A9162F]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#B9A8A0] mb-1.5">URL da Imagem do Hero</label>
                  <input
                    type="text"
                    value={s.hero_image || ''}
                    onChange={(e) => setSiteData({ ...siteData, settings: { ...s, hero_image: e.target.value } })}
                    className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD] outline-none focus:border-[#A9162F]"
                  />
                </div>
              </div>

              {/* Counter Date Settings */}
              <div className="pt-4 border-t border-[#2A0E18] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#B9A8A0] mb-1.5">Data/Hora Inicial do Relacionamento</label>
                  <input
                    type="datetime-local"
                    value={s.counter_start_date ? s.counter_start_date.substring(0, 16) : ''}
                    onChange={(e) => setSiteData({ ...siteData, settings: { ...s, counter_start_date: e.target.value } })}
                    className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD] outline-none focus:border-[#A9162F]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#B9A8A0] mb-1.5">Assinatura no Rodapé</label>
                  <input
                    type="text"
                    value={s.footer_signature}
                    onChange={(e) => setSiteData({ ...siteData, settings: { ...s, footer_signature: e.target.value } })}
                    className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD] outline-none focus:border-[#A9162F]"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs text-[#F6EBDD] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={s.enable_petals}
                    onChange={(e) => setSiteData({ ...siteData, settings: { ...s, enable_petals: e.target.checked } })}
                    className="accent-[#A9162F]"
                  />
                  <span>Pétalas de Lírio Flutuantes</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#F6EBDD] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={s.counter_enabled}
                    onChange={(e) => setSiteData({ ...siteData, settings: { ...s, counter_enabled: e.target.checked } })}
                    className="accent-[#A9162F]"
                  />
                  <span>Exibir Contador de Tempo</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => saveSettings(siteData.settings)}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#A9162F] hover:bg-[#D92E45] text-white px-6 py-2.5 rounded-xl text-xs font-semibold cursor-pointer shadow-lg transition-all"
                >
                  <Save className="w-4 h-4" /> Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TIMELINE (NOSSA HISTÓRIA) */}
        {activeTab === 'timeline' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif text-[#F6EBDD]">Nossa História (Timeline)</h2>
                <p className="text-xs text-[#B9A8A0]">Gerencie a linha do tempo cronológica com fotos e datas.</p>
              </div>
              <button
                onClick={() =>
                  setEditingTimeline({
                    id: 'tl_' + Date.now(),
                    date: 'Nova Data',
                    title: 'Novo Momento Inesquecível',
                    description: '',
                    image_url: '',
                    tag: 'Amor',
                    is_highlight: false,
                    order: siteData.timeline.length + 1
                  })
                }
                className="flex items-center gap-2 bg-[#3A0D18] hover:bg-[#A9162F] text-[#F0C95A] px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Adicionar Momento
              </button>
            </div>

            {/* List of items */}
            <div className="space-y-4">
              {siteData.timeline.map((item, idx) => (
                <div key={item.id} className="bg-[#14080F] border border-[#2A0E18] p-5 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[#DFAE27] font-semibold bg-[#230C16] px-2 py-0.5 rounded">{item.date}</span>
                      {item.tag && <span className="text-[11px] text-[#B9A8A0]">#{item.tag}</span>}
                      {item.is_highlight && <span className="text-[10px] bg-[#F0C95A]/20 text-[#F0C95A] px-2 py-0.5 rounded">Destaque</span>}
                    </div>
                    <h4 className="text-base font-serif text-[#F6EBDD] font-medium">{item.title}</h4>
                    <p className="text-xs text-[#B9A8A0] line-clamp-2 mt-1">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditingTimeline(item)}
                      className="p-2 bg-[#230C16] hover:bg-[#341120] text-[#F0C95A] rounded-lg transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja excluir "${item.title}"?`)) {
                          saveTimelineItems(siteData.timeline.filter(t => t.id !== item.id));
                        }
                      }}
                      className="p-2 bg-[#230C16] hover:bg-red-950 text-red-400 rounded-lg transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal for adding/editing timeline item */}
            {editingTimeline && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#160B12] border border-[#641329] rounded-2xl p-6 max-w-lg w-full space-y-4">
                  <h3 className="text-lg font-serif text-[#F6EBDD]">Editar Momento da História</h3>
                  <div>
                    <label className="block text-xs text-[#B9A8A0] mb-1">Data / Época</label>
                    <input
                      type="text"
                      value={editingTimeline.date}
                      onChange={(e) => setEditingTimeline({ ...editingTimeline, date: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090708] border border-[#2A0E18] rounded-lg text-sm text-[#F6EBDD]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#B9A8A0] mb-1">Título</label>
                    <input
                      type="text"
                      value={editingTimeline.title}
                      onChange={(e) => setEditingTimeline({ ...editingTimeline, title: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090708] border border-[#2A0E18] rounded-lg text-sm text-[#F6EBDD]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#B9A8A0] mb-1">Descrição</label>
                    <textarea
                      rows={4}
                      value={editingTimeline.description}
                      onChange={(e) => setEditingTimeline({ ...editingTimeline, description: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090708] border border-[#2A0E18] rounded-lg text-sm text-[#F6EBDD]"
                    />
                  </div>
                  <ImageUrlField
                    label="URL da Foto"
                    value={editingTimeline.image_url || ''}
                    onChange={(url) => setEditingTimeline({ ...editingTimeline, image_url: url })}
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-[#F6EBDD] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTimeline.is_highlight}
                        onChange={(e) => setEditingTimeline({ ...editingTimeline, is_highlight: e.target.checked })}
                        className="accent-[#A9162F]"
                      />
                      <span>Destacar este momento</span>
                    </label>
                  </div>
                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      onClick={() => setEditingTimeline(null)}
                      className="px-4 py-2 bg-[#230C16] text-[#B9A8A0] rounded-lg text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        const exists = siteData.timeline.some(t => t.id === editingTimeline.id);
                        const updated = exists
                          ? siteData.timeline.map(t => t.id === editingTimeline.id ? editingTimeline : t)
                          : [...siteData.timeline, editingTimeline];
                        saveTimelineItems(updated);
                      }}
                      className="px-5 py-2 bg-[#A9162F] hover:bg-[#D92E45] text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Salvar Momento
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GALLERY (ÁLBUM DE MEMÓRIAS) */}
        {activeTab === 'gallery' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif text-[#F6EBDD]">Galeria & Álbum</h2>
                <p className="text-xs text-[#B9A8A0]">Fotos organizadas no layout editorial assimétrico com lightbox.</p>
              </div>
              <button
                onClick={() =>
                  setEditingGallery({
                    id: 'gal_' + Date.now(),
                    title: 'Nova Memória',
                    caption: '',
                    date: 'Data especial',
                    image_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop',
                    alt: 'Foto do casal',
                    aspect: 'wide',
                    order: siteData.gallery.length + 1
                  })
                }
                className="flex items-center gap-2 bg-[#3A0D18] hover:bg-[#A9162F] text-[#F0C95A] px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Adicionar Foto
              </button>
            </div>

            {/* Gallery grid preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {siteData.gallery.map((item) => (
                <div key={item.id} className="bg-[#14080F] border border-[#2A0E18] rounded-xl overflow-hidden group">
                  <div className="h-44 overflow-hidden relative">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-90">
                      <button
                        onClick={() => setEditingGallery(item)}
                        className="p-1.5 bg-[#090708]/80 text-[#F0C95A] rounded-lg text-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir a foto "${item.title}"?`)) {
                            saveGalleryItems(siteData.gallery.filter(g => g.id !== item.id));
                          }
                        }}
                        className="p-1.5 bg-[#090708]/80 text-red-400 rounded-lg text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-serif text-[#F6EBDD] truncate">{item.title}</h4>
                    <p className="text-[11px] text-[#B9A8A0] truncate">{item.caption || 'Sem legenda'}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit modal */}
            {editingGallery && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#160B12] border border-[#641329] rounded-2xl p-6 max-w-md w-full space-y-4">
                  <h3 className="text-lg font-serif text-[#F6EBDD]">Editar Foto do Álbum</h3>
                  <div>
                    <label className="block text-xs text-[#B9A8A0] mb-1">Título</label>
                    <input
                      type="text"
                      value={editingGallery.title}
                      onChange={(e) => setEditingGallery({ ...editingGallery, title: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090708] border border-[#2A0E18] rounded-lg text-sm text-[#F6EBDD]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#B9A8A0] mb-1">Legenda / Texto Emocional</label>
                    <textarea
                      rows={3}
                      value={editingGallery.caption}
                      onChange={(e) => setEditingGallery({ ...editingGallery, caption: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090708] border border-[#2A0E18] rounded-lg text-sm text-[#F6EBDD]"
                    />
                  </div>
                  <ImageUrlField
                    label="URL da Imagem"
                    value={editingGallery.image_url}
                    onChange={(url) => setEditingGallery({ ...editingGallery, image_url: url })}
                  />
                  <div>
                    <label className="block text-xs text-[#B9A8A0] mb-1">Proporção Visual (Editorial)</label>
                    <select
                      value={editingGallery.aspect}
                      onChange={(e: any) => setEditingGallery({ ...editingGallery, aspect: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090708] border border-[#2A0E18] rounded-lg text-sm text-[#F6EBDD]"
                    >
                      <option value="wide">Horizontal Ampla (Wide)</option>
                      <option value="tall">Vertical Alta (Tall)</option>
                      <option value="square">Quadrada (Square)</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      onClick={() => setEditingGallery(null)}
                      className="px-4 py-2 bg-[#230C16] text-[#B9A8A0] rounded-lg text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        const exists = siteData.gallery.some(g => g.id === editingGallery.id);
                        const updated = exists
                          ? siteData.gallery.map(g => g.id === editingGallery.id ? editingGallery : g)
                          : [...siteData.gallery, editingGallery];
                        saveGalleryItems(updated);
                      }}
                      className="px-5 py-2 bg-[#A9162F] hover:bg-[#D92E45] text-white rounded-lg text-xs font-semibold"
                    >
                      Salvar Foto
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: LETTERS (CARTAS PESSOAIS) */}
        {activeTab === 'letters' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif text-[#F6EBDD]">Cartas Pessoais</h2>
                <p className="text-xs text-[#B9A8A0]">Cartas guardadas em envelopes táteis com cera e assinatura.</p>
              </div>
              <button
                onClick={() =>
                  setEditingLetter({
                    id: 'let_' + Date.now(),
                    type: 'amor',
                    title: 'Nova Carta Para Você',
                    preview: 'Um bilhete especial...',
                    content: 'Minha vida,\n\nEscrevo para te lembrar do quanto você é preciosa...',
                    signature: siteData.settings.couple_names.split('&')[0].trim(),
                    date: 'Para sempre',
                    wax_color: '#A9162F',
                    order: siteData.letters.length + 1
                  })
                }
                className="flex items-center gap-2 bg-[#3A0D18] hover:bg-[#A9162F] text-[#F0C95A] px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Nova Carta
              </button>
            </div>

            <div className="space-y-4">
              {siteData.letters.map((letItem) => (
                <div key={letItem.id} className="bg-[#14080F] border border-[#2A0E18] p-5 rounded-2xl flex items-start justify-between">
                  <div>
                    <span className="text-[11px] text-[#DFAE27] uppercase tracking-wider">{letItem.date}</span>
                    <h4 className="text-lg font-serif text-[#F6EBDD] mt-0.5">{letItem.title}</h4>
                    <p className="text-xs text-[#B9A8A0] line-clamp-2 mt-1">{letItem.preview}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setEditingLetter(letItem)}
                      className="p-2 bg-[#230C16] hover:bg-[#341120] text-[#F0C95A] rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir "${letItem.title}"?`)) {
                          saveLettersItems(siteData.letters.filter(l => l.id !== letItem.id));
                        }
                      }}
                      className="p-2 bg-[#230C16] hover:bg-red-950 text-red-400 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Letter Edit Modal */}
            {editingLetter && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#160B12] border border-[#641329] rounded-2xl p-6 max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-serif text-[#F6EBDD]">Editar Carta</h3>
                  <div>
                    <label className="block text-xs text-[#B9A8A0] mb-1">Título do Envelope</label>
                    <input
                      type="text"
                      value={editingLetter.title}
                      onChange={(e) => setEditingLetter({ ...editingLetter, title: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090708] border border-[#2A0E18] rounded-lg text-sm text-[#F6EBDD]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#B9A8A0] mb-1">Texto de Prévia (fora do envelope)</label>
                    <input
                      type="text"
                      value={editingLetter.preview}
                      onChange={(e) => setEditingLetter({ ...editingLetter, preview: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090708] border border-[#2A0E18] rounded-lg text-sm text-[#F6EBDD]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#B9A8A0] mb-1">Conteúdo Completo da Carta</label>
                    <textarea
                      rows={6}
                      value={editingLetter.content}
                      onChange={(e) => setEditingLetter({ ...editingLetter, content: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090708] border border-[#2A0E18] rounded-lg text-sm text-[#F6EBDD]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#B9A8A0] mb-1">Assinatura</label>
                      <input
                        type="text"
                        value={editingLetter.signature}
                        onChange={(e) => setEditingLetter({ ...editingLetter, signature: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090708] border border-[#2A0E18] rounded-lg text-sm text-[#F6EBDD]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#B9A8A0] mb-1">Cor do Lacre de Cera</label>
                      <input
                        type="color"
                        value={editingLetter.wax_color}
                        onChange={(e) => setEditingLetter({ ...editingLetter, wax_color: e.target.value })}
                        className="w-full h-9 bg-[#090708] border border-[#2A0E18] rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      onClick={() => setEditingLetter(null)}
                      className="px-4 py-2 bg-[#230C16] text-[#B9A8A0] rounded-lg text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        const exists = siteData.letters.some(l => l.id === editingLetter.id);
                        const updated = exists
                          ? siteData.letters.map(l => l.id === editingLetter.id ? editingLetter : l)
                          : [...siteData.letters, editingLetter];
                        saveLettersItems(updated);
                      }}
                      className="px-5 py-2 bg-[#A9162F] hover:bg-[#D92E45] text-white rounded-lg text-xs font-semibold"
                    >
                      Salvar Carta
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: LOVE NOTES (COISAS QUE AMO) */}
        {activeTab === 'notes' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif text-[#F6EBDD]">Pequenas Coisas Que Amo Em Você</h2>
                <p className="text-xs text-[#B9A8A0]">Declarações e detalhes emocionais com opção de clique para revelar.</p>
              </div>
              <button
                onClick={() =>
                  setEditingNote({
                    id: 'note_' + Date.now(),
                    title: 'Novo Detalhe Especial',
                    content: 'Como você faz meu coração desacelerar...',
                    icon: 'heart',
                    click_to_reveal: false,
                    order: siteData.notes.length + 1
                  })
                }
                className="flex items-center gap-2 bg-[#3A0D18] hover:bg-[#A9162F] text-[#F0C95A] px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Adicionar Detalhe
              </button>
            </div>

            <div className="space-y-4">
              {siteData.notes.map((note) => (
                <div key={note.id} className="bg-[#14080F] border border-[#2A0E18] p-5 rounded-2xl flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-serif text-[#F6EBDD]">{note.title}</h4>
                    <p className="text-xs text-[#B9A8A0] mt-1">{note.content}</p>
                    {note.click_to_reveal && (
                      <span className="inline-block mt-2 text-[10px] bg-[#3A0D18] text-[#F0C95A] px-2 py-0.5 rounded">
                        Clique para revelar ativo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setEditingNote(note)}
                      className="p-2 bg-[#230C16] hover:bg-[#341120] text-[#F0C95A] rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir "${note.title}"?`)) {
                          saveNotesItems(siteData.notes.filter(n => n.id !== note.id));
                        }
                      }}
                      className="p-2 bg-[#230C16] hover:bg-red-950 text-red-400 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Note Edit Modal */}
            {editingNote && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#160B12] border border-[#641329] rounded-2xl p-6 max-w-md w-full space-y-4">
                  <h3 className="text-lg font-serif text-[#F6EBDD]">Editar Detalhe</h3>
                  <div>
                    <label className="block text-xs text-[#B9A8A0] mb-1">Título</label>
                    <input
                      type="text"
                      value={editingNote.title}
                      onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090708] border border-[#2A0E18] rounded-lg text-sm text-[#F6EBDD]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#B9A8A0] mb-1">Mensagem</label>
                    <textarea
                      rows={3}
                      value={editingNote.content}
                      onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090708] border border-[#2A0E18] rounded-lg text-sm text-[#F6EBDD]"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs text-[#F6EBDD] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingNote.click_to_reveal}
                        onChange={(e) => setEditingNote({ ...editingNote, click_to_reveal: e.target.checked })}
                        className="accent-[#A9162F]"
                      />
                      <span>Exibir mensagem apenas quando clicar (surpresa)</span>
                    </label>
                  </div>
                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      onClick={() => setEditingNote(null)}
                      className="px-4 py-2 bg-[#230C16] text-[#B9A8A0] rounded-lg text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        const exists = siteData.notes.some(n => n.id === editingNote.id);
                        const updated = exists
                          ? siteData.notes.map(n => n.id === editingNote.id ? editingNote : n)
                          : [...siteData.notes, editingNote];
                        saveNotesItems(updated);
                      }}
                      className="px-5 py-2 bg-[#A9162F] hover:bg-[#D92E45] text-white rounded-lg text-xs font-semibold"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: MUSIC (MÚSICA DO CASAL) */}
        {activeTab === 'music' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-serif text-[#F6EBDD]">Música do Casal</h2>
              <p className="text-xs text-[#B9A8A0]">Defina a canção que embala a navegação no site (sem autoplay intrusivo).</p>
            </div>

            <div className="bg-[#14080F] border border-[#2A0E18] p-6 rounded-2xl space-y-4">
              <label className="flex items-center gap-2 text-xs text-[#F6EBDD] cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={siteData.music.is_active}
                  onChange={(e) => setSiteData({ ...siteData, music: { ...siteData.music, is_active: e.target.checked } })}
                  className="accent-[#A9162F]"
                />
                <span className="font-semibold text-sm">Habilitar reprodutor de música flutuante</span>
              </label>

              <div>
                <label className="block text-xs uppercase text-[#B9A8A0] mb-1">Título da Música</label>
                <input
                  type="text"
                  value={siteData.music.title}
                  onChange={(e) => setSiteData({ ...siteData, music: { ...siteData.music, title: e.target.value } })}
                  className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-[#B9A8A0] mb-1">Artista</label>
                <input
                  type="text"
                  value={siteData.music.artist}
                  onChange={(e) => setSiteData({ ...siteData, music: { ...siteData.music, artist: e.target.value } })}
                  className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-[#B9A8A0] mb-1">URL do Arquivo de Áudio (MP3)</label>
                <input
                  type="text"
                  value={siteData.music.audio_url}
                  onChange={(e) => setSiteData({ ...siteData, music: { ...siteData.music, audio_url: e.target.value } })}
                  className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-[#B9A8A0] mb-1">Capa do Álbum (URL)</label>
                <input
                  type="text"
                  value={siteData.music.cover_url}
                  onChange={(e) => setSiteData({ ...siteData, music: { ...siteData.music, cover_url: e.target.value } })}
                  className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD]"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => saveMusic(siteData.music)}
                  className="flex items-center gap-2 bg-[#A9162F] hover:bg-[#D92E45] text-white px-6 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Salvar Música
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: FUTURE (SONHOS & FUTURO) */}
        {activeTab === 'future' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif text-[#F6EBDD]">Tudo Que Ainda Vamos Viver</h2>
                <p className="text-xs text-[#B9A8A0]">Sonhos, viagens e planos futuros do casal.</p>
              </div>
              <button
                onClick={() =>
                  setEditingFuture({
                    id: 'fut_' + Date.now(),
                    title: 'Novo Sonho Nosso',
                    description: '',
                    status: 'sonho',
                    target_date: 'Em breve',
                    order: siteData.future.length + 1
                  })
                }
                className="flex items-center gap-2 bg-[#3A0D18] hover:bg-[#A9162F] text-[#F0C95A] px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Adicionar Sonho
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {siteData.future.map((fut) => (
                <div key={fut.id} className="bg-[#14080F] border border-[#2A0E18] p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#DFAE27] tracking-wider">{fut.status}</span>
                    <h4 className="text-base font-serif text-[#F6EBDD] mt-1">{fut.title}</h4>
                    <p className="text-xs text-[#B9A8A0] mt-1">{fut.description}</p>
                  </div>
                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[#2A0E18]">
                    <button
                      onClick={() => setEditingFuture(fut)}
                      className="p-1.5 bg-[#230C16] text-[#F0C95A] rounded-lg"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir "${fut.title}"?`)) {
                          saveFutureItems(siteData.future.filter(f => f.id !== fut.id));
                        }
                      }}
                      className="p-1.5 bg-[#230C16] text-red-400 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Future modal */}
            {editingFuture && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#160B12] border border-[#641329] rounded-2xl p-6 max-w-md w-full space-y-4">
                  <h3 className="text-lg font-serif text-[#F6EBDD]">Editar Sonho / Plano</h3>
                  <div>
                    <label className="block text-xs text-[#B9A8A0] mb-1">Título</label>
                    <input
                      type="text"
                      value={editingFuture.title}
                      onChange={(e) => setEditingFuture({ ...editingFuture, title: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090708] border border-[#2A0E18] rounded-lg text-sm text-[#F6EBDD]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#B9A8A0] mb-1">Descrição</label>
                    <textarea
                      rows={3}
                      value={editingFuture.description}
                      onChange={(e) => setEditingFuture({ ...editingFuture, description: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090708] border border-[#2A0E18] rounded-lg text-sm text-[#F6EBDD]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#B9A8A0] mb-1">Status</label>
                      <select
                        value={editingFuture.status}
                        onChange={(e: any) => setEditingFuture({ ...editingFuture, status: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090708] border border-[#2A0E18] rounded-lg text-sm text-[#F6EBDD]"
                      >
                        <option value="sonho">Sonho Nosso</option>
                        <option value="planejado">Planejado</option>
                        <option value="conquistado">Conquistado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#B9A8A0] mb-1">Previsão / Data</label>
                      <input
                        type="text"
                        value={editingFuture.target_date || ''}
                        onChange={(e) => setEditingFuture({ ...editingFuture, target_date: e.target.value })}
                        className="w-full px-3 py-2 bg-[#090708] border border-[#2A0E18] rounded-lg text-sm text-[#F6EBDD]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      onClick={() => setEditingFuture(null)}
                      className="px-4 py-2 bg-[#230C16] text-[#B9A8A0] rounded-lg text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        const exists = siteData.future.some(f => f.id === editingFuture.id);
                        const updated = exists
                          ? siteData.future.map(f => f.id === editingFuture.id ? editingFuture : f)
                          : [...siteData.future, editingFuture];
                        saveFutureItems(updated);
                      }}
                      className="px-5 py-2 bg-[#A9162F] hover:bg-[#D92E45] text-white rounded-lg text-xs font-semibold"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 9: SECRET LETTER */}
        {activeTab === 'secret' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-serif text-[#F6EBDD]">Carta Secreta & Easter Eggs</h2>
              <p className="text-xs text-[#B9A8A0]">Configure a mensagem especial que é descoberta por senha ou pelos lírios escondidos.</p>
            </div>

            <div className="bg-[#14080F] border border-[#2A0E18] p-6 rounded-2xl space-y-4">
              <label className="flex items-center gap-2 text-xs text-[#F6EBDD] cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteData.secret_letter.is_active}
                  onChange={(e) => setSiteData({ ...siteData, secret_letter: { ...siteData.secret_letter, is_active: e.target.checked } })}
                  className="accent-[#A9162F]"
                />
                <span className="font-semibold text-sm">Habilitar Carta Secreta Desbloqueável</span>
              </label>

              <div>
                <label className="block text-xs text-[#B9A8A0] mb-1">Título da Carta Secreta</label>
                <input
                  type="text"
                  value={siteData.secret_letter.title}
                  onChange={(e) => setSiteData({ ...siteData, secret_letter: { ...siteData.secret_letter, title: e.target.value } })}
                  className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#B9A8A0] mb-1">Palavra-passe / Senha Secreta</label>
                <input
                  type="text"
                  value={siteData.secret_letter.passcode}
                  onChange={(e) => setSiteData({ ...siteData, secret_letter: { ...siteData.secret_letter, passcode: e.target.value } })}
                  className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#B9A8A0] mb-1">Dica Para a Namorada</label>
                <input
                  type="text"
                  value={siteData.secret_letter.hint}
                  onChange={(e) => setSiteData({ ...siteData, secret_letter: { ...siteData.secret_letter, hint: e.target.value } })}
                  className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#B9A8A0] mb-1">Conteúdo Secreto</label>
                <textarea
                  rows={5}
                  value={siteData.secret_letter.content}
                  onChange={(e) => setSiteData({ ...siteData, secret_letter: { ...siteData.secret_letter, content: e.target.value } })}
                  className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD]"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => saveSecretLetter(siteData.secret_letter)}
                  className="bg-[#A9162F] hover:bg-[#D92E45] text-white px-6 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Salvar Carta Secreta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: MEDIA LIBRARY */}
        {activeTab === 'media' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif text-[#F6EBDD]">Biblioteca de Mídia</h2>
                <p className="text-xs text-[#B9A8A0]">Envie fotos e arquivos de áudio diretamente para o servidor.</p>
              </div>
              <label className="flex items-center gap-2 bg-[#A9162F] hover:bg-[#D92E45] text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-lg transition-colors">
                <UploadCloud className="w-4 h-4" />
                <span>{uploading ? 'Enviando...' : 'Fazer Upload'}</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  accept="image/*,audio/*"
                />
              </label>
            </div>

            {mediaList.length === 0 ? (
              <div className="bg-[#14080F] border border-dashed border-[#2A0E18] p-12 rounded-2xl text-center">
                <UploadCloud className="w-12 h-12 text-[#641329] mx-auto mb-3" />
                <p className="text-sm text-[#B9A8A0]">Nenhum arquivo enviado ainda.</p>
                <p className="text-xs text-[#B9A8A0]/60 mt-1">Envie fotos (JPG, PNG, WebP) ou músicas (MP3) para usar nas seções.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {mediaList.map((file) => (
                  <div key={file.id} className="bg-[#14080F] border border-[#2A0E18] rounded-xl overflow-hidden group">
                    <div className="h-32 bg-[#090708] flex items-center justify-center relative overflow-hidden">
                      {file.mime.startsWith('image/') ? (
                        <img src={file.url} alt={file.alt} className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-8 h-8 text-[#F0C95A]" />
                      )}
                    </div>
                    <div className="p-2.5 text-xs flex items-center justify-between">
                      <span className="truncate text-[#B9A8A0] text-[11px]">{file.original_name}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(file.url);
                            showToast("URL copiada para a área de transferência!");
                          }}
                          className="p-1 text-[#F0C95A] hover:bg-[#230C16] rounded"
                          title="Copiar URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedia(file.id)}
                          className="p-1 text-red-400 hover:bg-[#230C16] rounded"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 11: SECURITY & PASSWORD */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-fadeIn max-w-xl">
            <div>
              <h2 className="text-2xl font-serif text-[#F6EBDD]">Segurança & Credenciais</h2>
              <p className="text-xs text-[#B9A8A0]">Altere o usuário e senha de acesso ao painel administrativo.</p>
            </div>

            <form onSubmit={handleUpdateCredentials} className="bg-[#14080F] border border-[#2A0E18] p-6 rounded-2xl space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#B9A8A0] mb-1">Nome de Exibição</label>
                <input
                  type="text"
                  placeholder={adminUser.name}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#B9A8A0] mb-1">Novo Nome de Usuário (Login)</label>
                <input
                  type="text"
                  placeholder={adminUser.username}
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#B9A8A0] mb-1">Nova Senha</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[#090708] border border-[#2A0E18] rounded-xl text-sm text-[#F6EBDD]"
                />
              </div>

              <div className="pt-2 border-t border-[#2A0E18]">
                <label className="block text-xs uppercase tracking-wider text-[#DFAE27] mb-1 font-semibold">
                  Senha Atual (Obrigatória para confirmar)
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[#090708] border border-[#A9162F] rounded-xl text-sm text-[#F6EBDD]"
                />
              </div>

              {securityMsg && (
                <p className="text-xs text-[#F0C95A] bg-[#230C16] p-3 rounded-lg">{securityMsg}</p>
              )}

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-[#A9162F] hover:bg-[#D92E45] text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Confirmar e Salvar Credenciais
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 12: BACKUP & NUVEM SUPABASE */}
        {activeTab === 'backup' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-serif text-[#F6EBDD]">Banco em Nuvem Supabase & Backup</h2>
              <p className="text-xs text-[#B9A8A0]">Gerencie a persistência remota no Supabase PostgreSQL, baixe backups ou gere o pacote PHP 8.2+ para cPanel.</p>
            </div>

            {/* Supabase PostgreSQL Cloud Persistence Box */}
            <div className="bg-gradient-to-br from-[#12080E] via-[#1A0A14] to-[#12080E] border border-[#F0C95A]/40 p-6 rounded-2xl shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A0E18]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#2A0E18] border border-[#F0C95A]/30 flex items-center justify-center text-[#F0C95A]">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif text-lg font-semibold text-[#F6EBDD]">Banco de Dados Supabase (PostgreSQL)</h3>
                      {supabaseStatus?.connected ? (
                        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-950/90 text-emerald-400 border border-emerald-800/60">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Conectado & Operacional
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-950/90 text-amber-300 border border-amber-800/60">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span> Conectando...
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#B9A8A0] mt-0.5">
                      Instância dedicada na AWS América do Sul (São Paulo) &bull; Baixa latência e persistência garantida.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSupabaseSync('to_cloud')}
                    disabled={syncingSupabase}
                    className="flex items-center gap-2 bg-[#3A0D18] hover:bg-[#641329] text-[#F0C95A] px-4 py-2.5 rounded-xl border border-[#641329] text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingSupabase ? 'animate-spin' : ''}`} />
                    {syncingSupabase ? 'Salvando...' : 'Enviar para o Supabase (Push)'}
                  </button>
                  <button
                    onClick={() => handleSupabaseSync('from_cloud')}
                    disabled={syncingSupabase}
                    className="flex items-center gap-2 bg-[#200C16] hover:bg-[#341120] text-[#B9A8A0] hover:text-[#F6EBDD] px-4 py-2.5 rounded-xl border border-[#2A0E18] text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar da Nuvem (Pull)
                  </button>
                </div>
              </div>

              {/* Technical credentials info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-xs">
                <div className="bg-[#0D0509] p-3 rounded-xl border border-[#2A0E18]/60">
                  <span className="text-[10px] uppercase tracking-wider text-[#DFAE27] block font-medium">Host PostgreSQL</span>
                  <span className="text-[#F6EBDD] font-mono text-[11px] truncate block mt-0.5">db.wevebkpkwsocozcqrixt.supabase.co</span>
                </div>
                <div className="bg-[#0D0509] p-3 rounded-xl border border-[#2A0E18]/60">
                  <span className="text-[10px] uppercase tracking-wider text-[#DFAE27] block font-medium">Região do Cloud</span>
                  <span className="text-[#F6EBDD] font-mono text-[11px] truncate block mt-0.5">AWS sa-east-1 (São Paulo)</span>
                </div>
                <div className="bg-[#0D0509] p-3 rounded-xl border border-[#2A0E18]/60">
                  <span className="text-[10px] uppercase tracking-wider text-[#DFAE27] block font-medium">Pooler de Conexão</span>
                  <span className="text-[#F6EBDD] font-mono text-[11px] truncate block mt-0.5">Porta 6543 (PgBouncer SSL)</span>
                </div>
              </div>

              {/* Active Tables Overview */}
              <div className="mt-4 pt-4 border-t border-[#2A0E18]/60">
                <span className="text-[10px] uppercase tracking-wider text-[#B9A8A0] font-semibold block mb-2">
                  Tabelas Relacionais Ativas no Supabase:
                </span>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {['jardim_state', 'jardim_settings', 'jardim_timeline', 'jardim_gallery', 'jardim_notes', 'jardim_letters', 'jardim_future', 'jardim_audit_logs'].map((tbl) => (
                    <span key={tbl} className="px-2.5 py-1 rounded-lg bg-[#1D0914] text-[#F0C95A] border border-[#641329]/50 font-mono">
                      ✓ {tbl}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Standalone PHP 8.2+ Package Box */}
            <div className="bg-gradient-to-r from-[#1E0915] via-[#2A0E1C] to-[#1E0915] border border-[#F0C95A]/40 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-2 mb-2 text-[#F0C95A]">
                <FolderDown className="w-5 h-5" />
                <h3 className="font-serif text-lg font-semibold">Pacote PHP 8.2+ e MySQL para Hospedagem Compartilhada</h3>
              </div>
              <p className="text-xs text-[#B9A8A0] leading-relaxed mb-4">
                Pronto para colocar em qualquer hospedagem cPanel / Hostinger / Apache / MariaDB sem precisar de Node.js no servidor de produção.
                Contém o <strong className="text-[#F6EBDD]">schema.sql</strong>, instalador <strong className="text-[#F6EBDD]">/install.php</strong> e conexão PDO segura com UTF-8.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/php-shared-hosting/schema.sql"
                  download="schema.sql"
                  className="inline-flex items-center gap-1.5 bg-[#3A0D18] hover:bg-[#641329] text-xs text-[#F0C95A] px-4 py-2 rounded-xl transition-colors border border-[#641329]"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar schema.sql
                </a>
                <a
                  href="/php-shared-hosting/install.php"
                  download="install.php"
                  className="inline-flex items-center gap-1.5 bg-[#3A0D18] hover:bg-[#641329] text-xs text-[#F0C95A] px-4 py-2 rounded-xl transition-colors border border-[#641329]"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar install.php
                </a>
                <a
                  href="/php-shared-hosting/README.md"
                  download="README.md"
                  className="inline-flex items-center gap-1.5 bg-[#3A0D18] hover:bg-[#641329] text-xs text-[#F0C95A] px-4 py-2 rounded-xl transition-colors border border-[#641329]"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar Instruções README
                </a>
              </div>
            </div>

            {/* JSON Backup & Restore Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export JSON */}
              <div className="bg-[#14080F] border border-[#2A0E18] p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-serif text-[#F6EBDD] mb-1">Exportar Backup JSON</h3>
                  <p className="text-xs text-[#B9A8A0] leading-relaxed mb-4">
                    Gera um arquivo com todas as fotos, momentos, cartas e configurações para você guardar ou migrar.
                  </p>
                </div>
                <a
                  href="/api/admin/backup"
                  download
                  className="flex items-center justify-center gap-2 bg-[#230C16] hover:bg-[#341120] text-[#F0C95A] py-2.5 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" /> Baixar Arquivo de Backup
                </a>
              </div>

              {/* Restore JSON */}
              <div className="bg-[#14080F] border border-[#2A0E18] p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-serif text-[#F6EBDD] mb-1">Restaurar de um Backup</h3>
                  <p className="text-xs text-[#B9A8A0] leading-relaxed mb-4">
                    Suba um arquivo JSON de backup previamente salvo para restabelecer todo o conteúdo.
                  </p>
                </div>
                <label className="flex items-center justify-center gap-2 bg-[#230C16] hover:bg-[#341120] text-[#B9A8A0] hover:text-[#F6EBDD] py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
                  <UploadCloud className="w-4 h-4" /> Selecionar Arquivo .JSON
                  <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
                </label>
              </div>
            </div>

            {/* Danger Zone: Reset to Demo */}
            <div className="bg-[#14080F] border border-red-950/60 p-6 rounded-2xl">
              <h3 className="text-base font-serif text-red-400 mb-1">Zona de Restauração de Demonstração</h3>
              <p className="text-xs text-[#B9A8A0] mb-4">
                Deseja restaurar todos os textos, momentos e fotos para o modelo demonstrativo original do jardim?
              </p>
              <button
                onClick={handleResetDemo}
                className="flex items-center gap-2 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/60 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restaurar Demonstração Inicial
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
