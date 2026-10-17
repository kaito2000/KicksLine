export type SneakerStatus = 'active' | 'retired' | 'sold' | 'collector';

export type FootwearCategory = 'sneaker' | 'boots_leather' | 'sandal' | 'sports';

export type SilhouetteType =
  | 'low'
  | 'high'
  | 'runner'
  | 'canvas'
  | 'boots'
  | 'leather'
  | 'sandal';

export interface SneakerEntry {
  id: string;
  category: FootwearCategory;
  brand: string;
  model: string;
  colorwayName?: string;
  startYear: number;
  endYear: number | null; // null means currently active ('現役')
  isCurrent: boolean;
  status: SneakerStatus;
  rating: number; // 1 to 5
  eraTag: string; // e.g. '高校時代', '初任給'
  memory: string;
  imageDataUrl?: string; // Base64 compressed image
  silhouette: SilhouetteType;
  primaryColor: string;
  accentColor: string;
  createdAt: number;
}

export interface UserProfile {
  nickname: string;
  birthYear: number | null;
  subtitle: string;
}

export interface ColorPalettePreset {
  name: string;
  primaryColor: string;
  accentColor: string;
}

export interface KicksLineBackup {
  version: number;
  exportedAt: string;
  profile: UserProfile;
  sneakers: SneakerEntry[];
}
