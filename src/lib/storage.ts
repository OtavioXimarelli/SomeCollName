import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export interface UploadProgressCallback {
  (progress: number): void;
}

export const uploadPhoto = async (
  file: File, 
  userId: string, 
  coupleId: string,
  _onProgress?: UploadProgressCallback
): Promise<string> => {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.');
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. O tamanho máximo é 10MB.');
  }

  // Create a unique filename
  const fileExtension = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const filePath = `couples/${coupleId}/photos/${fileName}`;

  try {
    // Create a reference to the file location
    const storageRef = ref(storage, filePath);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw new Error('Falha ao fazer upload da foto. Tente novamente.');
  }
};

export const deletePhotoFromStorage = async (photoUrl: string): Promise<void> => {
  try {
    // Extract the path from the URL
    const url = new URL(photoUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (!pathMatch) {
      throw new Error('URL da foto inválida');
    }
    
    const path = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, path);
    
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting photo:', error);
    // Don't throw error for deletion failures, just log them
  }
};

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.' 
    };
  }

  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: 'Arquivo muito grande. O tamanho máximo é 10MB.' 
    };
  }

  return { isValid: true };
};
