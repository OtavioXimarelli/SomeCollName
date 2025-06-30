export interface Photo {
  id: string;
  url: string;
  caption: string;
  uploadedAt: string; // ISO 8601 date string
  dataAiHint?: string; // Adicionado para contexto da IA
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  spotifyTrackId: string; // Alterado de url para spotifyTrackId
  albumCoverUrl?: string; // Opcional: para exibir a capa do álbum
}

export interface CoupleData {
  id: string;
  coupleName: string;
  startDate: string; // ISO 8601 date string
  photos: Photo[];
  playlist: Song[];
}
