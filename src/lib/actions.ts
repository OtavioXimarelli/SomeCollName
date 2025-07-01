"use server";
import { suggestPhotoCaption as genAiSuggestPhotoCaption, type SuggestPhotoCaptionInput, type SuggestPhotoCaptionOutput } from '@/ai/flows/suggest-photo-caption';
import type { CoupleData, Photo, Song } from '@/types';
import { updateCoupleData, getCoupleData } from './firestore-service';
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
  const existingData = await getCoupleData(id);
  if (!existingData) {
    console.error(`Couple with id ${id} not found. Cannot update.`);
    return null;
  }
  
  await updateCoupleData(id, details);
  const updatedData = await getCoupleData(id);

  if (updatedData) {
    revalidatePath(`/couple/${id}`);
    revalidatePath(`/couple/${id}/edit`);
  }
  return updatedData;
}

export async function addPhotoAction(id: string, newPhoto: Omit<Photo, 'id' | 'uploadedAt'>): Promise<CoupleData | null> {
  const coupleData = await getCoupleData(id);
  if (!coupleData) return null;

  const photoWithId: Photo = { 
    ...newPhoto, 
    id: Date.now().toString(), // Simple unique ID
    uploadedAt: new Date().toISOString(),
  };
  
  const updatedPhotos = [...coupleData.photos, photoWithId];
  await updateCoupleData(id, { photos: updatedPhotos });
  const updatedData = await getCoupleData(id);

  if (updatedData) {
    revalidatePath(`/couple/${id}`);
    revalidatePath(`/couple/${id}/edit`);
  }
  return updatedData;
}

export async function deletePhotoAction(coupleId: string, photoId: string): Promise<CoupleData | null> {
  const coupleData = await getCoupleData(coupleId);
  if (!coupleData) return null;

  const updatedPhotos = coupleData.photos.filter(p => p.id !== photoId);
  await updateCoupleData(coupleId, { photos: updatedPhotos });
  const updatedData = await getCoupleData(coupleId);
  
  if (updatedData) {
    revalidatePath(`/couple/${coupleId}`);
    revalidatePath(`/couple/${coupleId}/edit`);
  }
  return updatedData;
}

export async function updatePhotoCaptionAction(coupleId: string, photoId: string, newCaption: string): Promise<CoupleData | null> {
  const coupleData = await getCoupleData(coupleId);
  if (!coupleData) return null;

  const updatedPhotos = coupleData.photos.map(p => 
    p.id === photoId ? { ...p, caption: newCaption } : p
  );
  await updateCoupleData(coupleId, { photos: updatedPhotos });
  const updatedData = await getCoupleData(coupleId);

  if (updatedData) {
    revalidatePath(`/couple/${coupleId}`);
    revalidatePath(`/couple/${coupleId}/edit`);
  }
  return updatedData;
}


export async function updatePlaylistAction(id: string, newPlaylist: Song[]): Promise<CoupleData | null> {
  await updateCoupleData(id, { playlist: newPlaylist });
  const updatedData = await getCoupleData(id);
  if (updatedData) {
    revalidatePath(`/couple/${id}`);
    revalidatePath(`/couple/${id}/edit`);
  }
  return updatedData;
}