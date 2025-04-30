import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { apiRequest } from '../lib/queryClient';
import { getCurrentUserToken } from '../lib/auth-helpers';
import { User as UserProfile } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: true,
  error: null
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('Starting auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? `User ${firebaseUser.uid}` : 'No user');
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Firebase 사용자가 있으면 서버에 사용자 정보 등록/업데이트
          await apiRequest('POST', '/api/user/register', {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            firebaseId: firebaseUser.uid,
            username: firebaseUser.email?.split('@')[0] || `user_${Date.now()}`
          });
          
          // 프로필 정보 가져오기
          try {
            const token = await getCurrentUserToken();
            if (token) {
              const response = await fetch('/api/user/profile', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (response.ok) {
                const profile = await response.json();
                console.log('User profile loaded:', profile);
                setUserProfile(profile);
              } else {
                console.error('Failed to load profile:', response.status);
                setUserProfile(null);
              }
            }
          } catch (profileError) {
            console.error('Profile error:', profileError);
          }
        } catch (e) {
          console.error('Error registering user:', e);
          setError(e instanceof Error ? e : new Error('Unknown error'));
        }
      } else {
        // 로그아웃 상태
        setUserProfile(null);
      }
      
      setIsLoading(false);
    }, (authError) => {
      console.error('Auth state observer error:', authError);
      setError(authError instanceof Error ? authError : new Error('Unknown auth error'));
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}