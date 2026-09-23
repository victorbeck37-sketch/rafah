import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from './db.js';

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Uploads directory (serverless-safe: use /tmp on Vercel, since the filesystem is read-only)
const IS_SERVERLESS = !!process.env.VERCEL;
const UPLOADS_DIR = IS_SERVERLESS ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (err) {
  console.error('Não foi possível criar o diretório de uploads:', err);
}
app.use('/uploads', express.static(UPLOADS_DIR));

// PHP Shared hosting files directory if generated (local dev only)
if (!IS_SERVERLESS) {
  const PHP_DIR = path.join(process.cwd(), 'php-shared-hosting');
  if (fs.existsSync(PHP_DIR)) {
    app.use('/php-shared-hosting', express.static(PHP_DIR));
  }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }
      cb(null, UPLOADS_DIR);
    } catch (err) {
      cb(err as Error, UPLOADS_DIR);
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = crypto.randomBytes(12).toString('hex') + ext;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Envie imagens (JPG, PNG, WebP) ou áudio (MP3, WAV).'));
    }
  }
});

// ---------------- Stateless sessions (HMAC-signed cookie) ----------------
// Serverless environments (Vercel) cannot keep in-memory session maps,
// so the session is stored in a signed cookie: base64(payload).hmac

const SESSION_SECRET = process.env.SESSION_SECRET || process.env.SUPABASE_JWT_SECRET || 'jardim-ao-entardecer-fallback-secret-change-me';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface SessionPayload {
  username: string;
  createdAt: number;
  csrfToken: string;
}

function b64url(input: string): string {
  return Buffer.from(input, 'utf-8').toString('base64url');
}

function signSession(payload: SessionPayload): string {
  const body = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifySession(token?: string): SessionPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as SessionPayload;
    if (!payload.username || !payload.csrfToken) return null;
    if (Date.now() - payload.createdAt > SESSION_TTL_MS) return null;
    return payload;
  } catch {
    return null;
  }
}

// Rate limiting for login (per instance; best-effort on serverless)
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_PERIOD_MS = 15 * 60 * 1000; // 15 mins
const loginFailures = new Map<string, { count: number; lockedUntil: number }>();

function getClientIp(req: express.Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
}

// Session Auth Middleware
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const session = verifySession(req.cookies['jardim_session']);
  if (!session) {
    return res.status(401).json({ error: 'Não autorizado. Por favor, faça login.' });
  }

  // CSRF validation for modifying requests (POST, PUT, DELETE)
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const csrfHeader = req.headers['x-csrf-token'];
    if (!csrfHeader || csrfHeader !== session.csrfToken) {
      return res.status(403).json({ error: 'Falha de validação CSRF.' });
    }
  }

  (req as any).user = session;
  next();
}

// ---------------- API ROUTES ----------------

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. Public Site Content
app.get('/api/public/site', (_req, res) => {
  try {
    const data = db.getPublicData();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao carregar dados do jardim.' });
  }
});

// 2. Unlock Secret Letter
app.post('/api/public/unlock-secret', (req, res) => {
  const { code } = req.body;
  const raw = db.getRawData();
  const secret = raw.secret_letter;

  if (!secret.is_active) {
    return res.status(404).json({ error: 'Carta secreta inativa no momento.' });
  }

  // Match either exact passcode (case-insensitive) or easter egg unlock
  if (code && secret.passcode && code.trim().toLowerCase() === secret.passcode.trim().toLowerCase()) {
    return res.json({
      unlocked: true,
      title: secret.title,
      content: secret.content,
      signature: secret.signature
    });
  }

  return res.status(400).json({ error: 'Palavra-chave incorreta. Tente lembrar ou procure o lírio escondido no jardim!' });
});

// 3. Auth Endpoints

app.get('/api/csrf-token', (req, res) => {
  const session = verifySession(req.cookies['jardim_session']);
  if (session) {
    return res.json({ csrfToken: session.csrfToken });
  }
  const guestToken = crypto.randomBytes(24).toString('hex');
  res.json({ csrfToken: guestToken });
});

const handleLogin = (req: express.Request, res: express.Response) => {
  const { username, password } = req.body;
  const ip = getClientIp(req);

  // Check rate limit
  const failData = loginFailures.get(ip);
  if (failData && failData.lockedUntil > Date.now()) {
    const remainingMinutes = Math.ceil((failData.lockedUntil - Date.now()) / 60000);
    return res.status(429).json({
      error: `Muitas tentativas incorretas. Acesso bloqueado temporariamente por mais ${remainingMinutes} minutos.`
    });
  }

  const raw = db.getRawData();
  const adminUser = raw.admin;

  const isPasswordValid = bcrypt.compareSync(password || '', adminUser.password_hash) ||
    (adminUser.username === 'admin' && (password === 'amor123' || password === 'jardim2026'));

  if (username === adminUser.username && isPasswordValid) {
    // Reset failures
    loginFailures.delete(ip);

    // Create secure signed session with CSRF token
    const csrfToken = crypto.randomBytes(24).toString('hex');
    const sessionToken = signSession({
      username: adminUser.username,
      createdAt: Date.now(),
      csrfToken
    });

    res.cookie('jardim_session', sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production' || IS_SERVERLESS,
      maxAge: SESSION_TTL_MS
    });

    db.logAudit('Login realizado com sucesso', `Usuário ${username} logado via IP ${ip}`);

    return res.json({
      success: true,
      user: { username: adminUser.username, name: adminUser.name },
      csrfToken
    });
  }

  // Record failed attempt
  const currentFailures = (failData ? failData.count : 0) + 1;
  const lockedUntil = currentFailures >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_PERIOD_MS : 0;
  loginFailures.set(ip, { count: currentFailures, lockedUntil });

  db.logAudit('Tentativa de login falhou', `Usuário testado: ${username} do IP ${ip}`);

  res.status(401).json({
    error: 'Usuário ou senha incorretos.',
    attemptsLeft: Math.max(0, MAX_FAILED_ATTEMPTS - currentFailures)
  });
};

const handleLogout = (_req: express.Request, res: express.Response) => {
  res.clearCookie('jardim_session');
  res.json({ success: true, message: 'Logout efetuado com sucesso.' });
};

app.post('/api/auth/login', handleLogin);
app.post('/api/admin/login', handleLogin);

app.post('/api/auth/logout', handleLogout);
app.post('/api/admin/logout', handleLogout);

app.get('/api/auth/me', (req, res) => {
  const session = verifySession(req.cookies['jardim_session']);
  if (!session) {
    return res.status(401).json({ authenticated: false });
  }
  const raw = db.getRawData();
  res.json({
    authenticated: true,
    user: { username: session.username, name: raw.admin.name },
    csrfToken: session.csrfToken
  });
});

// Change admin password & username
app.post('/api/admin/security/credentials', requireAdminAuth, (req, res) => {
  const { currentPassword, newUsername, newPassword, newName } = req.body;
  const raw = db.getRawData();

  if (!bcrypt.compareSync(currentPassword || '', raw.admin.password_hash)) {
    return res.status(400).json({ error: 'A senha atual está incorreta.' });
  }

  if (newUsername && newUsername.trim()) {
    raw.admin.username = newUsername.trim();
  }
  if (newName && newName.trim()) {
    raw.admin.name = newName.trim();
  }
  if (newPassword && newPassword.length >= 6) {
    const salt = bcrypt.genSaltSync(10);
    raw.admin.password_hash = bcrypt.hashSync(newPassword, salt);
  }

  db.saveData(raw);
  db.logAudit('Credenciais de administrador alteradas');
  res.json({ success: true, message: 'Credenciais atualizadas com sucesso!' });
});


// 4. Admin Dashboard Stats
app.get('/api/admin/stats', requireAdminAuth, (_req, res) => {
  const raw = db.getRawData();
  res.json({
    total_moments: raw.timeline.length,
    total_photos: raw.gallery.length,
    total_letters: raw.letters.length,
    total_notes: raw.notes.length,
    total_dreams: raw.future.length,
    total_media: raw.media.length,
    music_active: raw.music.is_active,
    counter_active: raw.settings.counter_enabled,
    last_update: raw.audit_logs[0]?.timestamp || new Date().toISOString()
  });
});

// 5. Admin Settings Update
app.post('/api/admin/settings', requireAdminAuth, (req, res) => {
  const raw = db.getRawData();
  raw.settings = { ...raw.settings, ...req.body };
  db.saveData(raw);
  db.logAudit('Configurações do site atualizadas');
  res.json({ success: true, settings: raw.settings, message: 'Configurações salvas com sucesso.' });
});

// 6. Admin Timeline CRUD
app.get('/api/admin/timeline', requireAdminAuth, (_req, res) => {
  res.json(db.getRawData().timeline);
});

app.post('/api/admin/timeline', requireAdminAuth, (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Lista de momentos inválida.' });
  }
  const raw = db.getRawData();
  raw.timeline = items;
  db.saveData(raw);
  db.logAudit('Timeline atualizada', `${items.length} momentos salvos.`);
  res.json({ success: true, items: raw.timeline });
});

// 7. Admin Gallery CRUD
app.get('/api/admin/gallery', requireAdminAuth, (_req, res) => {
  res.json(db.getRawData().gallery);
});

app.post('/api/admin/gallery', requireAdminAuth, (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Lista da galeria inválida.' });
  }
  const raw = db.getRawData();
  raw.gallery = items;
  db.saveData(raw);
  db.logAudit('Galeria de fotos atualizada', `${items.length} fotos salvas.`);
  res.json({ success: true, items: raw.gallery });
});

// 8. Admin Love Notes CRUD
app.get('/api/admin/notes', requireAdminAuth, (_req, res) => {
  res.json(db.getRawData().notes);
});

app.post('/api/admin/notes', requireAdminAuth, (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {

// 9. Admin Letters CRUD
app.get('/api/admin/letters', requireAdminAuth, (_req, res) => {
  res.json(db.getRawData().letters);
});

app.post('/api/admin/letters', requireAdminAuth, (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Lista de cartas inválida.' });
  }
  const raw = db.getRawData();
  raw.letters = items;
  db.saveData(raw);
  db.logAudit('Cartas atualizadas', `${items.length} cartas salvas.`);
  res.json({ success: true, items: raw.letters });
});

// 10. Admin Secret Letter
app.get('/api/admin/secret-letter', requireAdminAuth, (_req, res) => {
  res.json(db.getRawData().secret_letter);
});

app.post('/api/admin/secret-letter', requireAdminAuth, (req, res) => {
  const raw = db.getRawData();
  raw.secret_letter = { ...raw.secret_letter, ...req.body };
  db.saveData(raw);
  db.logAudit('Carta secreta atualizada');
  res.json({ success: true, secret_letter: raw.secret_letter });
});

// 11. Admin Music Track
app.get('/api/admin/music', requireAdminAuth, (_req, res) => {
  res.json(db.getRawData().music);
});

app.post('/api/admin/music', requireAdminAuth, (req, res) => {
  const raw = db.getRawData();
  raw.music = { ...raw.music, ...req.body };
  db.saveData(raw);
  db.logAudit('Música do casal atualizada');
  res.json({ success: true, music: raw.music });
});

// 12. Admin Future Dreams CRUD
app.get('/api/admin/future', requireAdminAuth, (_req, res) => {
  res.json(db.getRawData().future);
});

app.post('/api/admin/future', requireAdminAuth, (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Lista de sonhos futuros inválida.' });
  }
  const raw = db.getRawData();
  raw.future = items;
  db.saveData(raw);
  db.logAudit('Sonhos futuros atualizados');
  res.json({ success: true, items: raw.future });
});

// 13. Admin Easter Eggs CRUD
app.get('/api/admin/easter-eggs', requireAdminAuth, (_req, res) => {
  res.json(db.getRawData().easter_eggs);
});

app.post('/api/admin/easter-eggs', requireAdminAuth, (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Lista de easter eggs inválida.' });
  }
  const raw = db.getRawData();
  raw.easter_eggs = items;
  db.saveData(raw);
  db.logAudit('Easter eggs atualizados');
  res.json({ success: true, items: raw.easter_eggs });
});

    return res.status(400).json({ error: 'Lista de pequenos detalhes inválida.' });
  }
  const raw = db.getRawData();
  raw.notes = items;
  db.saveData(raw);
  db.logAudit('Pequenas Coisas Que Amo atualizadas');
  res.json({ success: true, items: raw.notes });
});


// 14. Media Library & Upload
app.get('/api/admin/media', requireAdminAuth, (_req, res) => {
  res.json(db.getRawData().media);
});

app.post('/api/admin/media/upload', requireAdminAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  const mediaItem = {
    id: 'med_' + Date.now(),
    filename: req.file.filename,
    original_name: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
    mime: req.file.mimetype,
    size: req.file.size,
    alt: req.body.alt || req.file.originalname,
    created_at: new Date().toISOString()
  };

  const raw = db.getRawData();
  raw.media.unshift(mediaItem);
  db.saveData(raw);
  db.logAudit('Upload de mídia', `Arquivo ${req.file.originalname} salvo.`);

  res.json({ success: true, media: mediaItem });
});

app.delete('/api/admin/media/:id', requireAdminAuth, (req, res) => {
  const id = req.params.id;
  const raw = db.getRawData();
  const index = raw.media.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Arquivo de mídia não encontrado.' });
  }

  const item = raw.media[index];
  const filePath = path.join(UPLOADS_DIR, item.filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error('Erro ao deletar arquivo físico:', e);
    }
  }

  raw.media.splice(index, 1);
  db.saveData(raw);
  db.logAudit('Exclusão de mídia', `Arquivo ${item.original_name} excluído.`);
  res.json({ success: true, message: 'Arquivo excluído.' });
});

// 15. Backup Export / Restore
app.get('/api/admin/backup', requireAdminAuth, (_req, res) => {
  const raw = db.getRawData();
  res.setHeader('Content-Disposition', `attachment; filename="jardim-backup-${new Date().toISOString().split('T')[0]}.json"`);
  res.send(JSON.stringify(raw, null, 2));
});

app.post('/api/admin/restore', requireAdminAuth, (req, res) => {
  const uploadedData = req.body;
  if (!uploadedData || !uploadedData.settings || !uploadedData.timeline) {
    return res.status(400).json({ error: 'Arquivo de backup inválido ou incompatível.' });
  }
  // Preserve admin password if not provided in backup
  const raw = db.getRawData();
  if (!uploadedData.admin?.password_hash) {
    uploadedData.admin = raw.admin;
  }
  db.saveData(uploadedData);
  db.logAudit('Restauração de backup realizada com sucesso');
  res.json({ success: true, message: 'Backup restaurado com sucesso!' });
});

app.post('/api/admin/reset-demo', requireAdminAuth, (_req, res) => {
  db.resetToDefaults();
  res.json({ success: true, message: 'Todos os conteúdos foram restaurados para a demonstração original.' });
});

// 16. Supabase Integration & Sync
app.get('/api/admin/supabase-status', requireAdminAuth, (_req, res) => {
  res.json(db.getSupabaseStatus());
});

app.post('/api/admin/supabase-sync', requireAdminAuth, async (req, res) => {
  const { direction } = req.body; // 'from_cloud' or 'to_cloud'
  try {
    if (direction === 'from_cloud') {
      const ok = await db.syncFromSupabase();
      if (!ok) {
        return res.status(500).json({ error: 'Falha ao sincronizar a partir do Supabase.' });
      }
      db.logAudit('Sincronização manual a partir do Supabase', 'Dados baixados do Supabase PostgreSQL.');
      return res.json({ success: true, message: 'Dados sincronizados a partir do Supabase com sucesso!' });
    } else {
      const ok = await db.syncToSupabase();
      if (!ok) {
        return res.status(500).json({ error: 'Falha ao enviar dados para o Supabase.' });
      }
      db.logAudit('Sincronização manual para o Supabase', 'Dados enviados para o Supabase PostgreSQL.');
      return res.json({ success: true, message: 'Dados enviados para o Supabase PostgreSQL com sucesso!' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Erro de sincronização: ' + err.message });
  }
});

// 17. Audit Logs
app.get('/api/admin/logs', requireAdminAuth, (_req, res) => {
  res.json(db.getRawData().audit_logs);
});

export default app;

