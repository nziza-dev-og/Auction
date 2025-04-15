import  { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  register: (email: string, password: string, userData: UserData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

interface UserData {
  name: string;
  phoneNumber: string;
  address: string;
  adminCode?: string;
}

export interface UserProfile extends Omit<UserData, 'adminCode'> {
  email: string;
  id: string;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  async function getAdminCode() {
    try {
      const adminSettingsDoc = await getDoc(doc(db, 'adminSettings', 'code'));
      if (adminSettingsDoc.exists()) {
        return adminSettingsDoc.data().adminCode || 'admin123';
      }
      return 'admin123'; // Default if not found
    } catch (error) {
      console.error("Error fetching admin code:", error);
      return 'admin123'; // Default fallback
    }
  }

  async function register(email: string, password: string, userData: UserData) {
    const adminCode = await getAdminCode();
    const isUserAdmin = userData.adminCode === adminCode;
    const { adminCode: _, ...userDataWithoutCode } = userData;
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      ...userDataWithoutCode,
      email,
      isAdmin: isUserAdmin,
    });
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
  }

  async function updateUserProfile(data: Partial<UserProfile>) {
    if (!currentUser) return;
    
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, data, { merge: true });
    
    if (userProfile) {
      setUserProfile({ ...userProfile, ...data });
    }
  }

  async function fetchUserProfile(user: User) {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userIsAdmin = userData.isAdmin === true;
        
        const profile = { 
          ...userData, 
          id: user.uid,
          isAdmin: userIsAdmin
        } as UserProfile;
        
        setUserProfile(profile);
        setIsAdmin(userIsAdmin);
        
        console.log("User profile loaded:", profile);
        console.log("Is admin:", userIsAdmin);
      } else {
        console.log("User document doesn't exist");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    isAdmin,
    register,
    login,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
 