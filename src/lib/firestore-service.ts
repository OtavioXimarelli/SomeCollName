import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  limit,
  orderBy,
} from 'firebase/firestore';
import { withCircuitBreaker } from './firebase-circuit-breaker';
import { db } from './firebase';
import type { UserProfile, CoupleData, CoupleInvitation, Photo, Song } from '@/types';

// Helper function to handle offline errors


// User Management
export const createUserProfile = async (
  uid: string, 
  email: string, 
  displayName: string, 
  photoURL?: string
): Promise<UserProfile> => {
  return withCircuitBreaker(async () => {
    const userProfile: UserProfile = {
      uid,
      email,
      displayName,
      photoURL,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', uid), userProfile);
    return userProfile;
  });
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  return withCircuitBreaker(async () => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() as UserProfile : null;
  });
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  return withCircuitBreaker(async () => {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      lastActive: new Date().toISOString(),
    });
  });
};

// Couple Management
export const createCouple = async (
  createdBy: string,
  coupleName: string,
  startDate: string
): Promise<CoupleData> => {
  return withCircuitBreaker(async () => {
    const existingCouple = await getUserCouple(createdBy);
    if (existingCouple) {
      throw new Error('User already has an active couple. Each user can only be part of one couple at a time.');
    }

    const uniqueId = `couple_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const coupleData: CoupleData = {
      id: uniqueId,
      coupleName,
      startDate,
      createdBy,
      photos: [],
      playlist: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    await setDoc(doc(db, 'couples', uniqueId), coupleData);
    
    await updateUserProfile(createdBy, { coupleId: uniqueId });
    
    return coupleData;
  });
};

export const getCoupleData = async (coupleId: string): Promise<CoupleData | null> => {
  return withCircuitBreaker(async () => {
    const coupleDoc = await getDoc(doc(db, 'couples', coupleId));
    return coupleDoc.exists() ? { id: coupleDoc.id, ...coupleDoc.data() } as CoupleData : null;
  });
};

export const updateCoupleData = async (
  coupleId: string, 
  updates: Partial<Omit<CoupleData, 'id'>>
): Promise<void> => {
  return withCircuitBreaker(async () => {
    await updateDoc(doc(db, 'couples', coupleId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  });
};

export const getUserCouple = async (uid: string): Promise<CoupleData | null> => {
  return withCircuitBreaker(async () => {
    const userProfile = await getUserProfile(uid);
    if (!userProfile?.coupleId) return null;
    
    return getCoupleData(userProfile.coupleId);
  });
};

// Partner Management
export const connectPartner = async (coupleId: string, partnerUid: string): Promise<void> => {
  return withCircuitBreaker(async () => {
    const partnerProfile = await getUserProfile(partnerUid);
    if (partnerProfile?.coupleId && partnerProfile.coupleId !== coupleId) {
      throw new Error('Partner already belongs to another couple. Each user can only be part of one couple at a time.');
    }

    const couple = await getCoupleData(coupleId);
    if (!couple) {
      throw new Error('Couple not found');
    }

    if (!couple.isActive) {
      throw new Error('Cannot join an inactive couple');
    }

    if (couple.partnerUid) {
      throw new Error('This couple already has a partner');
    }

    const batch = writeBatch(db);
    
    batch.update(doc(db, 'couples', coupleId), {
      partnerUid,
      updatedAt: new Date().toISOString(),
    });
    
    batch.update(doc(db, 'users', partnerUid), {
      coupleId,
      lastActive: new Date().toISOString(),
    });
    
    await batch.commit();
  });
};

// Invitation Management
export const createCoupleInvitation = async (
  coupleId: string,
  inviterUid: string,
  inviterName: string,
  inviteeEmail: string
): Promise<CoupleInvitation> => {
  return withCircuitBreaker(async () => {
    const hasAccess = await validateUserCoupleAccess(inviterUid, coupleId);
    if (!hasAccess) {
      throw new Error('Unauthorized: You do not have permission to invite to this couple');
    }

    const couple = await getCoupleData(coupleId);
    if (!couple) {
      throw new Error('Couple not found');
    }

    if (couple.partnerUid) {
      throw new Error('This couple already has a partner');
    }

    const existingInvitations = await getDocs(query(
      collection(db, 'invitations'),
      where('coupleId', '==', coupleId),
      where('inviteeEmail', '==', inviteeEmail),
      where('status', '==', 'pending')
    ));

    if (!existingInvitations.empty) {
      throw new Error('There is already a pending invitation for this email to this couple');
    }

    const inviteeQuery = await getDocs(query(
      collection(db, 'users'),
      where('email', '==', inviteeEmail),
      limit(1)
    ));

    if (!inviteeQuery.empty) {
      const inviteeProfile = inviteeQuery.docs[0].data() as UserProfile;
      if (inviteeProfile.coupleId) {
        throw new Error('The invited user already belongs to a couple');
      }
    }

    const invitation: Omit<CoupleInvitation, 'id'> = {
      coupleId,
      inviterUid,
      inviterName,
      inviteeEmail,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    const invitationRef = await addDoc(collection(db, 'invitations'), invitation);
    
    return {
      id: invitationRef.id,
      ...invitation,
    };
  });
};

export const getUserInvitations = async (email: string): Promise<CoupleInvitation[]> => {
  return withCircuitBreaker(async () => {
    const q = query(
      collection(db, 'invitations'),
      where('inviteeEmail', '==', email),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CoupleInvitation));
  });
};

export const acceptInvitation = async (invitationId: string, userUid: string): Promise<void> => {
  return withCircuitBreaker(async () => {
    const invitationDoc = await getDoc(doc(db, 'invitations', invitationId));
    if (!invitationDoc.exists()) throw new Error('Invitation not found');
    
    const invitation = invitationDoc.data() as CoupleInvitation;
    
    if (invitation.status !== 'pending') {
      throw new Error('Invitation is no longer pending');
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      throw new Error('Invitation has expired');
    }

    const userProfile = await getUserProfile(userUid);
    if (!userProfile || userProfile.email !== invitation.inviteeEmail) {
      throw new Error('Unauthorized: Email does not match invitation');
    }

    if (userProfile.coupleId) {
      throw new Error('You already belong to a couple. Each user can only be part of one couple at a time.');
    }

    const couple = await getCoupleData(invitation.coupleId);
    if (!couple) {
      throw new Error('The couple no longer exists');
    }

    if (couple.partnerUid) {
      throw new Error('This couple already has a partner');
    }

    if (!couple.isActive) {
      throw new Error('This couple is no longer active');
    }

    const batch = writeBatch(db);
    
    batch.update(doc(db, 'invitations', invitationId), {
      status: 'accepted',
    });
    
    await connectPartner(invitation.coupleId, userUid);
    
    await batch.commit();
  });
};

// Photo Management
export const addPhotoToCouple = async (
  coupleId: string,
  photo: Omit<Photo, 'id' | 'uploadedAt' | 'uploadedBy'>,
  uploadedBy: string
): Promise<void> => {
  return withCircuitBreaker(async () => {
    const photoData: Photo = {
      ...photo,
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
    };
    
    await updateDoc(doc(db, 'couples', coupleId), {
      photos: arrayUnion(photoData),
      updatedAt: new Date().toISOString(),
    });
  });
};

export const removePhotoFromCouple = async (coupleId: string, photoId: string): Promise<void> => {
  return withCircuitBreaker(async () => {
    const couple = await getCoupleData(coupleId);
    if (!couple) throw new Error('Couple not found');
    
    const updatedPhotos = couple.photos.filter(photo => photo.id !== photoId);
    
    await updateDoc(doc(db, 'couples', coupleId), {
      photos: updatedPhotos,
      updatedAt: new Date().toISOString(),
    });
  });
};

// Song Management
export const addSongToCouple = async (
  coupleId: string,
  song: Omit<Song, 'id' | 'addedBy' | 'addedAt'>,
  addedBy: string
): Promise<void> => {
  return withCircuitBreaker(async () => {
    const songData: Song = {
      ...song,
      id: `song_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedBy,
      addedAt: new Date().toISOString(),
    };
    
    await updateDoc(doc(db, 'couples', coupleId), {
      playlist: arrayUnion(songData),
      updatedAt: new Date().toISOString(),
    });
  });
};

export const removeSongFromCouple = async (coupleId: string, songId: string): Promise<void> => {
  return withCircuitBreaker(async () => {
    const couple = await getCoupleData(coupleId);
    if (!couple) throw new Error('Couple not found');
    
    const updatedPlaylist = couple.playlist.filter(song => song.id !== songId);
    
    await updateDoc(doc(db, 'couples', coupleId), {
      playlist: updatedPlaylist,
      updatedAt: new Date().toISOString(),
    });
  });
};

// Access Control
export const userCanAccessCouple = async (userUid: string, coupleId: string): Promise<boolean> => {
  return withCircuitBreaker(async () => {
    return validateUserCoupleAccess(userUid, coupleId);
  });
};

export const userCanEditCouple = async (userUid: string, coupleId: string): Promise<boolean> => {
  return withCircuitBreaker(async () => {
    return validateUserCoupleAccess(userUid, coupleId);
  });
};

// Enhanced user validation functions
export const validateUserCoupleAccess = async (userUid: string, coupleId: string): Promise<boolean> => {
  return withCircuitBreaker(async () => {
    const [userProfile, couple] = await Promise.all([
      getUserProfile(userUid),
      getCoupleData(coupleId)
    ]);

    if (!userProfile || !couple) return false;

    return couple.createdBy === userUid || couple.partnerUid === userUid;
  });
};

export const getUserActiveCouples = async (userUid: string): Promise<CoupleData[]> => {
  return withCircuitBreaker(async () => {
    const userProfile = await getUserProfile(userUid);
    if (!userProfile?.coupleId) return [];

    const couple = await getCoupleData(userProfile.coupleId);
    return couple && couple.isActive ? [couple] : [];
  });
};

export const deactivateCouple = async (coupleId: string, requestingUserUid: string): Promise<void> => {
  return withCircuitBreaker(async () => {
    const hasAccess = await validateUserCoupleAccess(requestingUserUid, coupleId);
    if (!hasAccess) {
      throw new Error('Unauthorized: You do not have permission to deactivate this couple');
    }

    await updateDoc(doc(db, 'couples', coupleId), {
      isActive: false,
      updatedAt: new Date().toISOString(),
    });
  });
};

// Data integrity functions
export const cleanupExpiredInvitations = async (): Promise<void> => {
  return withCircuitBreaker(async () => {
    const now = new Date().toISOString();
    const expiredQuery = query(
      collection(db, 'invitations'),
      where('status', '==', 'pending'),
      where('expiresAt', '<', now)
    );

    const expiredInvitations = await getDocs(expiredQuery);
    const batch = writeBatch(db);

    expiredInvitations.docs.forEach(doc => {
      batch.update(doc.ref, { status: 'expired' });
    });

    if (!expiredInvitations.empty) {
      await batch.commit();
    }
  });
};

export const getCoupleUniquenessSummary = async (): Promise<{
  totalUsers: number;
  usersWithCouples: number;
  totalCouples: number;
  activeCouples: number;
  pendingInvitations: number;
}> => {
  return withCircuitBreaker(async () => {
    const [usersSnapshot, couplesSnapshot, invitationsSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'couples')),
      getDocs(query(collection(db, 'invitations'), where('status', '==', 'pending')))
    ]);

    const users = usersSnapshot.docs.map(doc => doc.data() as UserProfile);
    const couples = couplesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoupleData));

    return {
      totalUsers: users.length,
      usersWithCouples: users.filter(user => user.coupleId).length,
      totalCouples: couples.length,
      activeCouples: couples.filter(couple => couple.isActive).length,
      pendingInvitations: invitationsSnapshot.size,
    };
  });
};
