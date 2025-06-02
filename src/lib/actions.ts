"use server";
import { suggestPhotoCaption as genAiSuggestPhotoCaption, type SuggestPhotoCaptionInput, type SuggestPhotoCaptionOutput } from '@/ai/flows/suggest-photo-caption';
import type { CoupleData, Photo, Song } from '@/types';
import { updateCoupleData as updateMockData, createNewCoupleSpace as createMockSpace, getCoupleData as getMockData } from './mock-data';
import { revalidatePath } from 'next/cache';

export async function suggestPhotoCaptionAction(input: SuggestPhotoCaptionInput): Promise<SuggestPhotoCaptionOutput> {
  try {
    return await genAiSuggestPhotoCaption(input);
  } catch (error) {
    console.error("Error in suggestPhotoCaptionAction:", error);
    return { captions: [] }; // Return empty array on error
  }
}

export async function saveCoupleDetailsAction(id: string, details: { coupleName?: string; startDate?: string }): Promise<CoupleData | null> {
  const existingData = await getMockData(id);
  if (!existingData) {
    await createMockSpace(id); // Create if doesn't exist
  }
  
  const updatedData = await updateMockData(id, details);
  if (updatedData) {
    revalidatePath(`/couple/${id}`);
    revalidatePath(`/couple/${id}/edit`);
  }
  return updatedData;
}

export async function addPhotoAction(id: string, newPhoto: Omit<Photo, 'id' | 'uploadedAt'>): Promise<CoupleData | null> {
  const coupleData = await getMockData(id);
  if (!coupleData) return null;

  const photoWithId: Photo = { 
    ...newPhoto, 
    id: Date.now().toString(), // Simple unique ID
    uploadedAt: new Date().toISOString(),
  };
  
  const updatedPhotos = [...coupleData.photos, photoWithId];
  const updatedData = await updateMockData(id, { photos: updatedPhotos });

  if (updatedData) {
    revalidatePath(`/couple/${id}`);
    revalidatePath(`/couple/${id}/edit`);
  }
  return updatedData;
}

export async function deletePhotoAction(coupleId: string, photoId: string): Promise<CoupleData | null> {
  const coupleData = await getMockData(coupleId);
  if (!coupleData) return null;

  const updatedPhotos = coupleData.photos.filter(p => p.id !== photoId);
  const updatedData = await updateMockData(coupleId, { photos: updatedPhotos });
  
  if (updatedData) {
    revalidatePath(`/couple/${coupleId}`);
    revalidatePath(`/couple/${coupleId}/edit`);
  }
  return updatedData;
}

export async function updatePhotoCaptionAction(coupleId: string, photoId: string, newCaption: string): Promise<CoupleData | null> {
  const coupleData = await getMockData(coupleId);
  if (!coupleData) return null;

  const updatedPhotos = coupleData.photos.map(p => 
    p.id === photoId ? { ...p, caption: newCaption } : p
  );
  const updatedData = await updateMockData(coupleId, { photos: updatedPhotos });

  if (updatedData) {
    revalidatePath(`/couple/${coupleId}`);
    revalidatePath(`/couple/${coupleId}/edit`);
  }
  return updatedData;
}


export async function updatePlaylistAction(id: string, newPlaylist: Song[]): Promise<CoupleData | null> {
  const updatedData = await updateMockData(id, { playlist: newPlaylist });
  if (updatedData) {
    revalidatePath(`/couple/${id}`);
    revalidatePath(`/couple/${id}/edit`);
  }
  return updatedData;
}
