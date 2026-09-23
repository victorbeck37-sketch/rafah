import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import type { PublicSiteData, SiteSettings, TimelineItem, GalleryItem, LoveNote, Letter, SecretLetter, MusicTrack, FutureItem, EasterEgg, MediaFile } from '../src/types.js';

// On Vercel serverless, background promises are frozen once the response is
// sent. `waitUntil` (from @vercel/functions) keeps the invocation alive until
// the Supabase sync finishes. Locally it is a no-op fallback.
import { waitUntil as vercelWaitUntil } from '@vercel/functions';

export function runInBackground(p: Promise<unknown>): void {
  try {
    if (typeof vercelWaitUntil === 'function') {
      vercelWaitUntil(p);
      return;
    }
  } catch { /* not on Vercel */ }
  p.catch((err: any) => console.error('[Background task failed]:', err?.message || err));
}

export interface DatabaseSchema {
  admin: {
    username: string;
    password_hash: string;
    name: string;
  };
  settings: SiteSettings;
  timeline: TimelineItem[];
  gallery: GalleryItem[];
  notes: LoveNote[];
  letters: Letter[];
  secret_letter: SecretLetter;
  music: MusicTrack;
  future: FutureItem[];
  easter_eggs: EasterEgg[];
  media: MediaFile[];
  login_attempts: {
    ip: string;
    count: number;
    last_attempt: number;
  }[];
  audit_logs: {
    id: string;
    action: string;
    timestamp: string;
    details?: string;
  }[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const defaultSettings: SiteSettings = {
  couple_names: "[SEU NOME] & [NOME DELA]",
  site_title: "Nosso Jardim ao Entardecer",
  meta_description: "Para a pessoa que fez meu mundo florescer. Um jardim onde nossa história de amor é contada em cada detalhe.",
  hero_title: "Para a pessoa que fez meu mundo florescer",
  hero_subtitle: "Dizem que onde florescem lírios e girassóis, o tempo aprende a desacelerar. Bem-vinda ao nosso refúgio de memórias.",
  hero_cta: "Começar nossa história",
  hero_image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1600&auto=format&fit=crop",

  story_title: "Nossa História",
  story_subtitle: "Cada passo, cada tropeço e cada flor que encontramos pelo caminho",
  story_enabled: true,

  gallery_title: "Álbum de Memórias",
  gallery_subtitle: "Fragmentos de tempo guardados com o carinho que merecem",
  gallery_enabled: true,

  notes_title: "Pequenas Coisas Que Amo Em Você",
  notes_subtitle: "Os detalhes invisíveis para o mundo, mas eternos para mim",
  notes_enabled: true,

  letters_title: "Cartas Para Você",
  letters_subtitle: "Abra quando o seu coração pedir um abraço em forma de palavras",
  letters_enabled: true,

  counter_title: "Estamos juntos há...",
  counter_subtitle: "E cada segundo continua sendo a melhor escolha da minha vida",
  counter_start_date: "2023-06-12T19:30:00",
  counter_enabled: true,

  future_title: "Tudo Que Ainda Vamos Viver",
  future_subtitle: "Os sonhos que regamos juntos para florescerem amanhã",
  future_enabled: true,

  cinematic_title_1: "Você chegou até aqui.",
  cinematic_title_2: "E eu escolheria você de novo. Todos os dias.",
  cinematic_desc: "Entre todos os caminhos do mundo, o meu jardim favorito sempre será ao seu lado.",
  cinematic_enabled: true,

  footer_title: "Essa história ainda está só começando.",
  footer_text: "Obrigado por ser o meu sol da tarde e a minha paz na noite.",
  footer_signature: "[SEU NOME] ♥ [NOME DELA]",

  color_red: "#A9162F",
  color_burgundy: "#641329",
  color_gold: "#F0C95A",
  color_sunflower: "#DFAE27",
  color_bg_deep: "#090708",
  color_cream: "#F6EBDD",

  enable_petals: true,
  enable_particles: true,
};

const defaultTimeline: TimelineItem[] = [
  {
    id: "tl_1",
    date: "O Início",
    title: "Quando tudo começou",
    description: "Um olhar despretensioso que mudou a rota de tudo. Quem diria que uma conversa comum seria o começo do meu lugar favorito no mundo?",
    image_url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
    tag: "Primeiro Olhar",
    is_highlight: true,
    order: 1
  },
  {
    id: "tl_2",
    date: "Primeiro Encontro",
    title: "O nervosismo e o sorriso que acalmou tudo",
    description: "As horas passaram como se fossem minutos. A sensação doce de já te conhecer há vidas inteiras.",
    image_url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop",
    tag: "Café & Conversa",
    is_highlight: false,
    order: 2
  },
  {
    id: "tl_3",
    date: "A Certeza",
    title: "O primeiro momento inesquecível",
    description: "Aquele abraço demorado no final da tarde, com o vento suave e o silêncio confortável que só existe onde há paz.",
    image_url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=800&auto=format&fit=crop",
    tag: "Conexão",
    is_highlight: true,
    order: 3
  },
  {
    id: "tl_4",
    date: "Superação",
    title: "Uma fase difícil que vencemos juntos",
    description: "A vida nem sempre é feita de dias calmos, mas descobrir que segurar a sua mão transforma qualquer tempestade em aprendizado foi libertador.",
    image_url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop",
    tag: "Força",
    is_highlight: false,
    order: 4
  },
  {
    id: "tl_5",
    date: "Hoje",
    title: "O presente: cultivar o nosso amor",
    description: "Olhar para trás e sentir orgulho. Olhar para você e sentir gratidão infinita. O hoje é o nosso melhor jardim.",
    image_url: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=800&auto=format&fit=crop",
    tag: "Eternidade",
    is_highlight: true,
    order: 5
  }
];

const defaultGallery: GalleryItem[] = [
  {
    id: "gal_1",
    title: "Luz de Entardecer",
    caption: "Aquele pôr do sol em que o mundo inteiro pareceu dourado para nós.",
    date: "Pôr do sol especial",
    image_url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1200&auto=format&fit=crop",
    alt: "Casal ao entardecer",
    aspect: "tall",
    order: 1
  },
  {
    id: "gal_2",
    title: "O Jardim Secreto",
    caption: "Entre lírios e girassóis, onde o silêncio fala mais que mil palavras.",
    date: "Primavera",
    image_url: "https://images.unsplash.com/photo-1508672019048-805b876b67e2?q=80&w=1200&auto=format&fit=crop",
    alt: "Jardim com flores e sol dourado",
    aspect: "wide",
    order: 2
  },
  {
    id: "gal_3",
    title: "Seu Sorriso Espontâneo",
    caption: "A foto que tirei sem você perceber, mas que guarda tudo o que você é.",
    date: "Um dia comum",
    image_url: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?q=80&w=1000&auto=format&fit=crop",
    alt: "Sorriso sincero e delicado",
    aspect: "square",
    order: 3
  },
  {
    id: "gal_4",
    title: "Mãos Dadas",
    caption: "Não importa o destino, desde que o caminho seja ao seu lado.",
    date: "Caminhada de outono",
    image_url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop",
    alt: "Mãos entrelaçadas",
    aspect: "tall",
    order: 4
  },
  {
    id: "gal_5",
    title: "Noite Sob as Luzes",
    caption: "A noite caiu, mas a sua presença iluminou cada canto.",
    date: "Nossa noite favorita",
    image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
    alt: "Luzes quentes e bokeh romântico",
    aspect: "wide",
    order: 5
  }
];

const defaultNotes: LoveNote[] = [
  {
    id: "note_1",
    title: "Seu jeito de falar comigo",
    content: "Mesmo nos dias mais caóticos, o tom da sua voz traz uma serenidade que desfaz qualquer tempestade dentro de mim.",
    icon: "sparkles",
    click_to_reveal: false,
    order: 1
  },
  {
    id: "note_2",
    title: "Como você transforma o comum",
    content: "Um simples café no fim de tarde ou uma caminhada de dez minutos viram a melhor parte da minha semana ao seu lado.",
    icon: "sun",
    click_to_reveal: false,
    order: 2
  },
  {
    id: "note_3",
    title: "Seus olhos quando sorri",
    content: "Eles quase fecham e ganham um brilho tão puro que eu poderia passar a eternidade apenas admirando.",
    icon: "heart",
    click_to_reveal: true,
    order: 3
  },
  {
    id: "note_4",
    title: "O seu abraço de porto seguro",
    content: "Aquele encaixe perfeito onde parece que o mundo para lá fora e nada de ruim pode nos alcançar.",
    icon: "shield",
    click_to_reveal: false,
    order: 4
  },
  {
    id: "note_5",
    title: "Os pequenos detalhes imperceptíveis",
    content: "O jeito que você mexe no cabelo quando pensa, como lembra das coisas que eu gosto e como cuida de mim sem alarde.",
    icon: "feather",
    click_to_reveal: true,
    order: 5
  }
];

const defaultLetters: Letter[] = [
  {
    id: "let_1",
    type: "saudade",
    title: "Leia quando sentir saudade",
    preview: "Para aqueles momentos em que a distância parecer mais pesada que o habitual...",
    content: "Minha vida,\n\nSe você está lendo isso agora, feche os olhos por três segundos e sinta o quanto o meu pensamento está aí com você.\n\nA distância física é apenas um detalhe geográfico diante da morada que você construiu no meu peito. Lembre-se do nosso abraço, do calor das nossas mãos juntas e do quanto eu conto os minutos para te ver de novo.\n\nVocê nunca está sozinha. Eu estou sempre a uma lembrança de distância.\n\nCom todo o meu amor,",
    signature: "[SEU NOME]",
    date: "Para sempre",
    wax_color: "#A9162F",
    order: 1
  },
  {
    id: "let_2",
    type: "tristeza",
    title: "Leia quando o dia for difícil",
    preview: "Respire fundo. Os dias cinzentos não apagam a beleza do jardim que você é...",
    content: "Meu amor,\n\nEu sei que há dias em que o peso do mundo parece desabar sobre os ombros. Mas eu quero que você saiba o quanto eu admiro a sua coragem, a sua bondade e a sua luz.\n\nNão se cobre tanto hoje. Você não precisa carregar tudo sozinha. Deixe o dia passar devagar, descanse seu coração e saiba que amanhã o sol volta a nascer dourado como os girassóis.\n\nEu acredito em você em cada instante.\n\nEstou aqui para você,",
    signature: "Seu maior admirador",
    date: "Dias de chuva",
    wax_color: "#641329",
    order: 2
  },
  {
    id: "let_3",
    type: "amor",
    title: "Leia quando precisar lembrar o quanto é amada",
    preview: "Se alguma vez você duvidar do seu valor, leia estas palavras com atenção...",
    content: "Minha pessoa favorita,\n\nVocê fez o meu mundo florescer de maneiras que eu nem imaginava serem possíveis. Antes de você, a vida tinha cores bonitas; com você, ela ganhou profundidade, poesia e um calor que nunca se apaga.\n\nEu amo quem você é quando está empolgada com alguma novidade. Amo a sua gentileza com os outros. Amo a sua risada gostosa.\n\nVocê é o presente mais bonito que o destino já me deu.\n\nTe amando hoje e sempre,",
    signature: "[SEU NOME]",
    date: "Eternamente",
    wax_color: "#DFAE27",
    order: 3
  },
  {
    id: "let_4",
    type: "futuro",
    title: "Para o nosso futuro",
    preview: "Uma promessa guardada para os dias que ainda estão por vir...",
    content: "Meu bem,\n\nQuando imagino o futuro, não penso em lugares extravagantes ou grandiosos: penso na nossa rotina calma, no cheiro de café pela manhã, nas plantas na varanda e na certeza de que teremos construído uma história da qual sentiremos orgulho.\n\nPrometo continuar escolhendo você, rindo das mesmas piadas e regando o nosso amor todos os dias.\n\nNosso melhor capítulo ainda está sendo escrito.\n\nCom amor infinito,",
    signature: "[SEU NOME]",
    date: "Amanhãs infinitos",
    wax_color: "#F0C95A",
    order: 4
  }
];

const defaultSecretLetter: SecretLetter = {
  is_active: true,
  title: "A Carta Que Eu Escondi Para Você",
  content: "Você encontrou o lírio secreto do jardim!\n\nIsso prova que até nos pequenos detalhes você tem a sensibilidade de enxergar o que a maioria deixaria passar.\n\nEssa cartinha secreta existe só para dizer: obrigado por existir na minha vida. Eu prepararia mil jardins inteiros só para ver você sorrir.",
  signature: "Com todo meu coração, [SEU NOME]",
  passcode: "sempre",
  hint: "Uma palavra de seis letras que define o tempo do nosso amor (dica: 'sempre' ou clique no pequeno lírio escondido)"
};

const defaultMusic: MusicTrack = {
  is_active: true,
  title: "Clair de Lune (Acoustic Piano & Garden Breeze)",
  artist: "Nossa Canção",
  audio_url: "https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3",
  cover_url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=400&auto=format&fit=crop",
  message: "Aperte o play para acompanhar a nossa jornada com a melodia que embala nossas lembranças."
};

const defaultFuture: FutureItem[] = [
  {
    id: "fut_1",
    title: "Ver o pôr do sol em um campo de girassóis",
    description: "Caminhar entre as flores amarelas até o entardecer transformar o céu em ouro e vinho.",
    image_url: "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=800&auto=format&fit=crop",
    status: "sonho",
    target_date: "Em breve",
    order: 1
  },
  {
    id: "fut_2",
    title: "Nossa casa com janelas amplas e jardim",
    description: "Um espaço cheio de luz natural, livros, xícaras de chá e os nossos momentos de paz.",
    image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
    status: "planejado",
    target_date: "Nosso plano",
    order: 2
  },
  {
    id: "fut_3",
    title: "Uma viagem longa sem pressa de voltar",
    description: "Descobrir cidades antigas, praias escondidas e novas memórias para colocar no álbum.",
    image_url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop",
    status: "sonho",
    target_date: "Próximo destino",
    order: 3
  },
  {
    id: "fut_4",
    title: "Mais mil domingos preguiçosos juntos",
    description: "Acordar tarde, rir sem motivo e simplesmente desfrutar da presença um do outro.",
    image_url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop",
    status: "conquistado",
    target_date: "Todos os fins de semana",
    order: 4
  }
];

const defaultEasterEggs: EasterEgg[] = [
  {
    id: "egg_1",
    symbol: "lily",
    location_hint: "No canto da seção de cartas",
    message: "Você encontrou o Lírio Vermelho Secreto! Cada pétala representa um dia em que agradeci por ter você comigo."
  },
  {
    id: "egg_2",
    symbol: "sunflower",
    location_hint: "No final da página",
    message: "Você encontrou o Girassol de Ouro! Obrigado por iluminar a minha vida como o sol da tarde."
  }
];

class Database {
  private data: DatabaseSchema;
  private pool: pg.Pool | null = null;
  private initPromise: Promise<boolean> | null = null;
  private supabaseConnected = false;
  private lastSyncTime: string | null = null;
  private syncError: string | null = null;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadLocalData();
    this.initPostgres();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private initPostgres() {
    let pgUrl = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || '';
    if (!pgUrl && process.env.POSTGRES_HOST && process.env.POSTGRES_PASSWORD) {
      pgUrl = `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DATABASE || 'postgres'}`;
    }

    if (!pgUrl) {
      console.log('[Supabase PG] Nenhuma URL de conexão PostgreSQL configurada. Usando armazenamento local.');
      return;
    }

    // Strip URL parameters like ?sslmode=require which force strict CA checks on self-signed certs
    const cleanUrl = pgUrl.split('?')[0];

    try {
      this.pool = new pg.Pool({
        connectionString: cleanUrl,
        ssl: { rejectUnauthorized: false },
        // Force IPv4: Vercel serverless has no IPv6 route, and Supabase hosts
        // resolve to IPv6 first, causing connection timeouts there.
        family: 4,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
      } as pg.PoolConfig);

      this.pool.on('error', (err) => {
        console.error('[Supabase PG Pool Error]:', err.message);
        this.supabaseConnected = false;
        this.syncError = err.message;
      });

      // Initial cloud sync. Every request awaits this via db.ready() so cold
      // instances always serve up-to-date cloud data (see server/app.ts).
      this.initPromise = this.syncFromSupabase().catch((err) => {
        console.error('[Supabase PG Init Error]:', err.message);
        return false;
      });
      runInBackground(this.initPromise);
    } catch (err: any) {
      console.error('[Supabase PG Setup Error]:', err.message);
      this.syncError = err.message;
    }
  }

  private loadLocalData(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      } catch (err) {
        console.error("Error reading local database file, using defaults:", err);
      }
    }

    // Default admin: username 'admin', password 'amor123' (hashed with bcrypt)
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync("amor123", salt);

    const initialData: DatabaseSchema = {
      admin: {
        username: "admin",
        password_hash: hash,
        name: "Administrador do Jardim"
      },
      settings: defaultSettings,
      timeline: defaultTimeline,
      gallery: defaultGallery,
      notes: defaultNotes,
      letters: defaultLetters,
      secret_letter: defaultSecretLetter,
      music: defaultMusic,
      future: defaultFuture,
      easter_eggs: defaultEasterEggs,
      media: [],
      login_attempts: [],
      audit_logs: [
        {
          id: "log_init",
          action: "Sistema instalado e iniciado",
          timestamp: new Date().toISOString(),
          details: "Configurações padrão carregadas com sucesso."
        }
      ]
    };

    this.saveLocalCache(initialData);
    return initialData;
  }

  private saveLocalCache(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      // Read-only filesystem (serverless): fall back to /tmp so the instance can still cache
      try {
        const tmp = path.join('/tmp', 'jardim-db.json');
        fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
      } catch { /* ignore */ }
    }
  }

  // Waits until the initial cloud sync attempt has finished (or failed).
  // Called before every request so serverless instances always serve
  // up-to-date Supabase data instead of stale local defaults.
  public async ready(): Promise<void> {
    if (this.initPromise) {
      try {
        await this.initPromise;
      } catch { /* proceed with local data */ }
    }
  }

  public async syncFromSupabase(): Promise<boolean> {
    if (!this.pool) return false;
    try {
      const client = await this.pool.connect();
      try {
        // Ensure table exists
        await client.query(`
          CREATE TABLE IF NOT EXISTS jardim_state (
            key VARCHAR(64) PRIMARY KEY,
            data JSONB NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        // Check if state exists
        const res = await client.query('SELECT data, updated_at FROM jardim_state WHERE key = $1', ['site_data']);
        if (res.rows.length > 0 && res.rows[0].data) {
          const cloudData = res.rows[0].data as DatabaseSchema;
          this.data = {
            ...this.data,
            ...cloudData,
            admin: cloudData.admin || this.data.admin
          };
          this.saveLocalCache(this.data);
          this.supabaseConnected = true;
          this.lastSyncTime = new Date().toISOString();
          this.syncError = null;
          console.log('[Supabase PG] Dados carregados do Supabase PostgreSQL com sucesso!');
          return true;
        } else {
          // Upload initial state to Supabase
          console.log('[Supabase PG] Nenhum dado prévio encontrado. Enviando estado inicial para o Supabase...');
          await this.syncToSupabase();
          this.supabaseConnected = true;
          this.lastSyncTime = new Date().toISOString();
          this.syncError = null;
          return true;
        }
      } finally {
        client.release();
      }
    } catch (err: any) {
      this.supabaseConnected = false;
      this.syncError = err.message;
      console.error('[Supabase PG Sync From Failed]:', err.message);
      return false;
    }
  }

  public async syncToSupabase(): Promise<boolean> {
    if (!this.pool) return false;
    try {
      const client = await this.pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS jardim_state (
            key VARCHAR(64) PRIMARY KEY,
            data JSONB NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        await client.query(
          `INSERT INTO jardim_state (key, data, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW()`,
          ['site_data', JSON.stringify(this.data)]
        );

        // Also sync settings row to relational table
        try {
          await client.query(
            `INSERT INTO jardim_settings (id, couple_names, site_title, meta_description, hero_title, hero_subtitle, counter_start_date, counter_enabled, data, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
             ON CONFLICT (id) DO UPDATE SET
               couple_names = EXCLUDED.couple_names,
               site_title = EXCLUDED.site_title,
               meta_description = EXCLUDED.meta_description,
               hero_title = EXCLUDED.hero_title,
               hero_subtitle = EXCLUDED.hero_subtitle,
               counter_start_date = EXCLUDED.counter_start_date,
               counter_enabled = EXCLUDED.counter_enabled,
               data = EXCLUDED.data,
               updated_at = NOW()`,
            [
              'main',
              this.data.settings.couple_names,
              this.data.settings.site_title,
              this.data.settings.meta_description,
              this.data.settings.hero_title,
              this.data.settings.hero_subtitle,
              this.data.settings.counter_start_date,
              this.data.settings.counter_enabled,
              JSON.stringify(this.data.settings)
            ]
          );
        } catch (relErr: any) {
          console.warn('[Supabase PG] Aviso sincronizando tabela relacional:', relErr.message);
        }

        this.supabaseConnected = true;
        this.lastSyncTime = new Date().toISOString();
        this.syncError = null;
        return true;
      } finally {
        client.release();
      }
    } catch (err: any) {
      this.supabaseConnected = false;
      this.syncError = err.message;
      console.error('[Supabase PG Sync To Failed]:', err.message);
      return false;
    }
  }

  public saveData(data?: DatabaseSchema) {
    if (data) {
      this.data = data;
    }
    this.saveLocalCache(this.data);
    if (this.pool) {
      runInBackground(this.syncToSupabase().catch((err) => {
        console.error('[Supabase PG Async Save Failed]:', err.message);
      }));
    }
  }

  public getSupabaseStatus() {
    return {
      configured: !!(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
      connected: this.supabaseConnected,
      host: process.env.POSTGRES_HOST || 'db.wevebkpkwsocozcqrixt.supabase.co',
      database: process.env.POSTGRES_DATABASE || 'postgres',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wevebkpkwsocozcqrixt.supabase.co',
      lastSync: this.lastSyncTime,
      error: this.syncError
    };
  }

  public getPublicData(): PublicSiteData {
    return {
      settings: this.data.settings,
      timeline: [...this.data.timeline].sort((a, b) => a.order - b.order),
      gallery: [...this.data.gallery].sort((a, b) => a.order - b.order),
      notes: [...this.data.notes].sort((a, b) => a.order - b.order),
      letters: [...this.data.letters].sort((a, b) => a.order - b.order),
      secret_letter: this.data.secret_letter,
      music: this.data.music,
      future: [...this.data.future].sort((a, b) => a.order - b.order),
      easter_eggs: this.data.easter_eggs
    };
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  public logAudit(action: string, details?: string) {
    this.data.audit_logs.unshift({
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      action,
      timestamp: new Date().toISOString(),
      details
    });
    if (this.data.audit_logs.length > 50) {
      this.data.audit_logs = this.data.audit_logs.slice(0, 50);
    }
    this.saveData();
  }

  public resetToDefaults() {
    this.data.settings = { ...defaultSettings };
    this.data.timeline = JSON.parse(JSON.stringify(defaultTimeline));
    this.data.gallery = JSON.parse(JSON.stringify(defaultGallery));
    this.data.notes = JSON.parse(JSON.stringify(defaultNotes));
    this.data.letters = JSON.parse(JSON.stringify(defaultLetters));
    this.data.secret_letter = { ...defaultSecretLetter };
    this.data.music = { ...defaultMusic };
    this.data.future = JSON.parse(JSON.stringify(defaultFuture));
    this.data.easter_eggs = JSON.parse(JSON.stringify(defaultEasterEggs));
    this.logAudit("Restauração de dados padrão", "Todo o conteúdo foi restaurado aos padrões originais.");
    this.saveData();
  }
}

export const db = new Database();
