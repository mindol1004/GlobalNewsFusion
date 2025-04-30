import { auth, googleProvider } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  signOut,
  getIdToken
} from 'firebase/auth';

// 로그인 헬퍼 함수
export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

// 구글 로그인 헬퍼 함수
export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

// 회원가입 헬퍼 함수
export async function registerWithEmail(email: string, password: string, displayName: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // 사용자 프로필 업데이트
  if (userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential;
}

// 로그아웃 헬퍼 함수
export async function logout() {
  return signOut(auth);
}

// 현재 사용자의 토큰 가져오기
export async function getCurrentUserToken() {
  if (!auth.currentUser) {
    return null;
  }
  
  try {
    return await getIdToken(auth.currentUser);
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
}

// 현재 사용자 가져오기
export function getCurrentUser() {
  return auth.currentUser;
}