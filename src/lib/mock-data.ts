import type { CoupleData, Photo, Song } from '@/types';

const defaultPhotos: Photo[] = [
  { id: '1', url: 'https://placehold.co/600x400.png', caption: 'Our first cherished memory together.', uploadedAt: new Date().toISOString(), dataAiHint: "couple beach" },
  { id: '2', url: 'https://placehold.co/400x600.png', caption: 'Celebrating a special milestone.', uploadedAt: new Date().toISOString(), dataAiHint: "couple celebration" },
  { id: '3', url: 'https://placehold.co/800x500.png', caption: 'A quiet, lovely evening.', uploadedAt: new Date().toISOString(), dataAiHint: "couple sunset" },
  { id: '4', url: 'https://placehold.co/500x700.png', caption: 'Adventure awaits!', uploadedAt: new Date().toISOString(), dataAiHint: "couple hiking" },
];

const defaultPlaylist: Song[] = [
  { id: '1', title: 'Coffee Shop Lofi', artist: 'Various Artists', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
  { id: '2', title: 'Chillhop Essentials', artist: 'Chillhop Music', url: 'https://www.youtube.com/watch?v=5qap5aO4i9A' },
  { id: '3', title: 'Epic Cinematic Music', artist: 'ャAlexis', url: 'https://www.youtube.com/watch?v=DWcJFNfaw9c' },
];

// Simulating a "database"
const mockDatabase: Record<string, CoupleData> = {
  "demo-id": {
    id: "demo-id",
    coupleName: 'Alex & Jamie',
    startDate: '2020-06-15T10:00:00.000Z',
    photos: defaultPhotos,
    playlist: defaultPlaylist,
  }
};


export const getCoupleData = async (id: string): Promise<CoupleData | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockDatabase[id] || null;
};

export const updateCoupleData = async (id: string, data: Partial<CoupleData>): Promise<CoupleData | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  if (mockDatabase[id]) {
    mockDatabase[id] = { ...mockDatabase[id], ...data };
    if (data.photos) mockDatabase[id].photos = data.photos; // ensure deep update for arrays
    if (data.playlist) mockDatabase[id].playlist = data.playlist;
    return mockDatabase[id];
  }
  return null;
};

// Initial data for a new couple space
export const getInitialCoupleData = (id: string): CoupleData => ({
  id,
  startDate: new Date().toISOString(),
  photos: [],
  playlist: defaultPlaylist.slice(0,1), // Start with one default song
});

export const createNewCoupleSpace = async (id: string): Promise<CoupleData> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  if (!mockDatabase[id]) {
    mockDatabase[id] = getInitialCoupleData(id);
  }
  return mockDatabase[id];
};
