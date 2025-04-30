import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { apiRequest } from '../lib/queryClient';
import { User as UserProfile } from '@shared/schema';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('Starting auth state listener in useAuth hook');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed in hook:', firebaseUser ? `User ${firebaseUser.uid}` : 'No user');
      setUser(firebaseUser);
      
      if (!firebaseUser) {
        setUserProfile(null);
        setIsLoading(false);
        return;
      }
      
      try {
        // Firebase 사용자가 있으면 서버에 사용자 정보 등록/업데이트
        const response = await apiRequest('POST', '/api/user/register', {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          firebaseId: firebaseUser.uid,
          username: firebaseUser.email?.split('@')[0] || `user_${Date.now()}`
        });

        // 프로필 정보 가져오기
        if (response.ok) {
          const profile = await response.json();
          console.log('User profile loaded in hook:', profile);
          setUserProfile(profile);
        }
      } catch (e) {
        console.error('Error registering user in hook:', e);
        setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  return {
    user,
    userProfile,
    isLoading,
    error
  };
}