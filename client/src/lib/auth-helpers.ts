import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export async function loginWithEmail(email: string, password: string) {
  if (!email || !password) {
    throw new Error('이메일과 비밀번호를 입력해주세요.');
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Email login error:', error);
    
    // Firebase 에러 메시지를 사용자 친화적으로 변환
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
      case 'auth/too-many-requests':
        throw new Error('너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.');
      case 'auth/user-disabled':
        throw new Error('이 계정은 비활성화되었습니다.');
      default:
        throw new Error('로그인 중 오류가 발생했습니다: ' + error.message);
    }
  }
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google login error:', error);
    
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('로그인 창이 닫혔습니다. 다시 시도해주세요.');
    } else {
      throw new Error('Google 로그인 중 오류가 발생했습니다: ' + error.message);
    }
  }
}

export async function registerWithEmail(email: string, password: string, displayName: string) {
  if (!email || !password) {
    throw new Error('이메일과 비밀번호를 입력해주세요.');
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // 사용자 프로필 업데이트 (표시 이름 설정)
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    return userCredential.user;
  } catch (error: any) {
    console.error('Email registration error:', error);
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error('이미 사용 중인 이메일 주소입니다.');
      case 'auth/invalid-email':
        throw new Error('유효하지 않은 이메일 주소입니다.');
      case 'auth/weak-password':
        throw new Error('비밀번호가 너무 약합니다. 6자 이상의 강력한 비밀번호를 사용해주세요.');
      default:
        throw new Error('회원가입 중 오류가 발생했습니다: ' + error.message);
    }
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error('로그아웃 중 오류가 발생했습니다: ' + error.message);
  }
}

export async function getCurrentUserToken(): Promise<string | null> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return null;
    }
    
    const token = await currentUser.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

export function getCurrentUser() {
  return auth.currentUser;
}