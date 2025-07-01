export interface Photo {
  id: string;
  url: string;
  caption: string;
  uploadedAt: string; // ISO 8601 date string
  uploadedBy: string; // User ID who uploaded the photo
  dataAiHint?: string; // Adicionado para contexto da IA
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  spotifyTrackId: string; // Alterado de url para spotifyTrackId
  albumCoverUrl?: string; // Opcional: para exibir a capa do álbum
  addedBy: string; // User ID who added the song
  addedAt: string; // ISO 8601 date string
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  coupleId?: string; // ID of the couple this user belongs to
  partnerUid?: string; // UID of their partner
  createdAt: string;
  lastActive: string;
}

export interface CoupleData {
  id: string; // Unique couple ID
  coupleName: string;
  startDate: string; // ISO 8601 date string
  createdBy: string; // User ID who created the couple
  partnerUid?: string; // Partner's user ID (optional if not yet connected)
  photos: Photo[];
  playlist: Song[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CoupleInvitation {
  id: string;
  coupleId: string;
  inviterUid: string;
  inviterName: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
}
