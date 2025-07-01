import { getCoupleData as fetchCoupleData, getUserCouple, userCanAccessCouple, updateCoupleData as updateCoupleInFirestore } from './firestore-service';
import type { CoupleData } from '@/types';

// Legacy function for backward compatibility
// Use getUserCouple or getCoupleData directly in new code
export const getCoupleData = async (id: string): Promise<CoupleData | null> => {
  try {
    return await fetchCoupleData(id);
  } catch (error) {
    console.error('Error fetching couple data:', error);
    return null;
  }
};

// Get couple data for a specific user
export const getUserCoupleData = async (userUid: string): Promise<CoupleData | null> => {
  try {
    return await getUserCouple(userUid);
  } catch (error) {
    console.error('Error fetching user couple data:', error);
    return null;
  }
};

// Check if user can access couple data
export const canUserAccessCouple = async (userUid: string, coupleId: string): Promise<boolean> => {
  try {
    return await userCanAccessCouple(userUid, coupleId);
  } catch (error) {
    console.error('Error checking user access:', error);
    return false;
  }
};

// Update couple data
export const updateCoupleData = async (id: string, data: Partial<CoupleData>): Promise<CoupleData | null> => {
  try {
    await updateCoupleInFirestore(id, data);
    return await fetchCoupleData(id);
  } catch (error) {
    console.error('Error updating couple data:', error);
    return null;
  }
};
