export interface SiteSettings {
  couple_names: string;
  site_title: string;
  meta_description: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta: string;
  hero_image?: string;
  
  story_title: string;
  story_subtitle: string;
  story_enabled: boolean;
  
  gallery_title: string;
  gallery_subtitle: string;
  gallery_enabled: boolean;
  
  notes_title: string;
  notes_subtitle: string;
  notes_enabled: boolean;
  
  letters_title: string;
  letters_subtitle: string;
  letters_enabled: boolean;
  
  counter_title: string;
  counter_subtitle: string;
  counter_start_date: string;
  counter_enabled: boolean;
  
  future_title: string;
  future_subtitle: string;
  future_enabled: boolean;
  
  cinematic_title_1: string;
  cinematic_title_2: string;
  cinematic_desc: string;
  cinematic_enabled: boolean;
  
  footer_title: string;
  footer_text: string;
  footer_signature: string;
  
  color_red: string;
  color_burgundy: string;
  color_gold: string;
  color_sunflower: string;
  color_bg_deep: string;
  color_cream: string;
  
  enable_petals: boolean;
  enable_particles: boolean;
}

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  image_url?: string;
  tag?: string;
  is_highlight: boolean;
  order: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  date?: string;
  image_url: string;
  alt: string;
  aspect: 'tall' | 'wide' | 'square';
  order: number;
}

export interface LoveNote {
  id: string;
  title: string;
  content: string;
  icon?: string;
  click_to_reveal: boolean;
  order: number;
}

export interface Letter {
  id: string;
  type: string;
  title: string;
  preview: string;
  content: string;
  signature: string;
  date: string;
  wax_color: string;
  order: number;
}

export interface SecretLetter {
  is_active: boolean;
  title: string;
  content: string;
  signature: string;
  passcode: string;
  hint: string;
}

export interface MusicTrack {
  is_active: boolean;
  title: string;
  artist: string;
  audio_url: string;
  cover_url: string;
  message?: string;
}

export interface FutureItem {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  status: 'sonho' | 'planejado' | 'conquistado';
  target_date?: string;
  order: number;
}

export interface EasterEgg {
  id: string;
  symbol: 'lily' | 'sunflower' | 'sparkle';
  location_hint: string;
  message: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  original_name: string;
  url: string;
  mime: string;
  size: number;
  alt: string;
  created_at: string;
}

export interface PublicSiteData {
  settings: SiteSettings;
  timeline: TimelineItem[];
  gallery: GalleryItem[];
  notes: LoveNote[];
  letters: Letter[];
  secret_letter: SecretLetter;
  music: MusicTrack;
  future: FutureItem[];
  easter_eggs: EasterEgg[];
}

export interface AdminUser {
  username: string;
  name: string;
}
