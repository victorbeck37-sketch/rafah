import type { PublicSiteData } from '../types.js';

// Fallback offline/local para o AdminPanel: quando a API não responde
// (estático, sem backend ou backend fora do ar), o painel usa estes
// defaults e persiste edições em localStorage.
const STORAGE_KEY = 'rafah_jardim_site_data';

export const defaultPublicSiteData: PublicSiteData = {
  settings: {
    couple_names: 'Seu Nome & O Nome Dela',
    site_title: 'Nosso Jardim ao Entardecer',
    meta_description: 'Para a pessoa que fez meu mundo florescer.',
    hero_title: 'Para a pessoa que fez meu mundo florescer',
    hero_subtitle: 'Um jardim onde nossa história de amor é contada em cada detalhe.',
    hero_cta: 'Começar nossa história',
    story_title: 'Nossa História',
    story_subtitle: 'Cada capítulo, cada sorriso, cada flor que plantamos juntos.',
    story_enabled: true,
    gallery_title: 'Álbum de Memórias',
    gallery_subtitle: 'Fragmentos de tempo guardados com carinho.',
    gallery_enabled: true,
    notes_title: 'Pequenas Coisas Que Amo Em Você',
    notes_subtitle: 'Os detalhes invisíveis para o mundo, eternos para nós.',
    notes_enabled: true,
    letters_title: 'Cartas Para Você',
    letters_subtitle: 'Abra quando seu coração pedir um abraço.',
    letters_enabled: true,
    counter_title: 'Estamos juntos há...',
    counter_subtitle: 'E cada segundo continua sendo a melhor escolha da minha vida.',
    counter_start_date: '2023-06-12T19:30:00',
    counter_enabled: true,
    future_title: 'Tudo Que Ainda Vamos Viver',
    future_subtitle: 'Os sonhos que regamos todos os dias para florescerem.',
    future_enabled: true,
    cinematic_title_1: 'Você chegou até aqui.',
    cinematic_title_2: 'E eu escolheria você de novo. Todos os dias.',
    cinematic_desc: 'Entre todos os caminhos do mundo, o meu jardim favorito sempre será ao seu lado.',
    cinematic_enabled: true,
    footer_title: 'Essa história ainda está só começando.',
    footer_text: 'Obrigado por ser o meu sol da tarde e a minha paz na noite.',
    footer_signature: 'Com todo carinho',
    color_red: '#A9162F',
    color_burgundy: '#641329',
    color_gold: '#F0C95A',
    color_sunflower: '#DFAE27',
    color_bg_deep: '#090708',
    color_cream: '#F6EBDD',
    enable_petals: true,
    enable_particles: true,
  },
  timeline: [],
  gallery: [],
  notes: [],
  letters: [],
  secret_letter: {
    is_active: false,
    title: '',
    content: '',
    signature: '',
    passcode: '',
    hint: '',
  },
  music: {
    is_active: false,
    title: '',
    artist: '',
    audio_url: '',
    cover_url: '',
  },
  future: [],
  easter_eggs: [],
};

export function getLocalSiteData(): PublicSiteData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultPublicSiteData };
    const parsed = JSON.parse(raw) as Partial<PublicSiteData>;
    return { ...defaultPublicSiteData, ...parsed };
  } catch {
    return { ...defaultPublicSiteData };
  }
}

export function saveLocalSiteData(data: PublicSiteData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Não foi possível salvar dados locais:', err);
  }
}
