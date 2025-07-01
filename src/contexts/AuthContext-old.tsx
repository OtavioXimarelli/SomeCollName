"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { createUserProfile, getUserProfile, updateUserProfile, getUserInvitations } from '@/lib/firestore-service';
import type { UserProfile, CoupleInvitation } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  pendingInvitations: CoupleInvitation[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  refreshInvitations: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<CoupleInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshUserProfile = async () => {
    if (user) {
      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }
  };

  const refreshInvitations = async () => {
    if (user?.email) {
      try {
        const invitations = await getUserInvitations(user.email);
        setPendingInvitations(invitations);
      } catch (error) {
        console.error('Error fetching invitations:', error);
      }
    }
  };

  useEffect(() => {
    console.log('AuthContext useEffect: Initializing listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('onAuthStateChanged: User state changed. User:', user ? user.uid : 'null');
      setUser(user);
      
      if (user) {
        console.log('onAuthStateChanged: User exists, attempting to load profile...');
        try {
          // Check if user profile exists, create if it doesn't
          let profile = await getUserProfile(user.uid);
          if (!profile) {
            console.log('onAuthStateChanged: User profile not found, creating new profile.');
            profile = await createUserProfile(
              user.uid,
              user.email || '',
              user.displayName || 'Usuário',
              user.photoURL || undefined
            );
          } else {
            // Update last active
            console.log('onAuthStateChanged: User profile found, updating last active.');
            await updateUserProfile(user.uid, { lastActive: new Date().toISOString() });
          }
          setUserProfile(profile);
          console.log('onAuthStateChanged: User profile set:', profile);
          
          // Load pending invitations
          if (user.email) {
            const invitations = await getUserInvitations(user.email);
            setPendingInvitations(invitations);
            console.log('onAuthStateChanged: Pending invitations loaded.');
          }
        } catch (error) {
          console.error('onAuthStateChanged: Error loading user profile:', error);
          // Set a basic profile even if Firestore is offline
          setUserProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Usuário',
            photoURL: user.photoURL || undefined,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          });
          console.log('onAuthStateChanged: Fallback user profile set due to error.');
        } finally {
          setLoading(false);
          console.log('onAuthStateChanged: Loading set to false.');
        }
      } else {
        console.log('onAuthStateChanged: No user, resetting profile and invitations.');
        setUserProfile(null);
        setPendingInvitations([]);
        setLoading(false);
        console.log('onAuthStateChanged: Loading set to false (no user).');
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!"
      });
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Não foi possível fazer login.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName });
      toast({
        title: "Conta criada com sucesso!",
        description: "Sua conta foi criada. Agora você pode criar seu espaço de casal."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Não foi possível criar a conta.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo!"
      });
    } catch (error: any) {
      toast({
        title: "Erro no login com Google",
        description: error.message || "Não foi possível fazer login com Google.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro no logout",
        description: error.message || "Não foi possível fazer logout.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    pendingInvitations,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    refreshUserProfile,
    refreshInvitations
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
