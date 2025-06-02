export interface Photo {
  id: string;
  url: string;
  caption: string;
  uploadedAt: string; // Store as ISO string for easier serialization
  dataAiHint?: string; // For placeholder images
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string; 
}

export interface CoupleData {
  id: string;
  coupleName?: string;
  startDate: string; // ISO date string
  photos: Photo[];
  playlist: Song[];
}
