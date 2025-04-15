import  { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phoneNumber: string, address: string, adminCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_CODE = 'admin123'; // Default admin code

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as User);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    phoneNumber: string, 
    address: string, 
    adminCode?: string
  ) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    const userData: User = {
      uid: user.uid,
      email,
      name,
      phoneNumber,
      address,
      isAdmin: adminCode === ADMIN_CODE
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    setUserData(userData);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => signOut(auth);

  const updateUserProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    
    const updatedData = { ...userData, ...data } as User;
    await setDoc(doc(db, 'users', currentUser.uid), updatedData, { merge: true });
    setUserData(updatedData);
  };

  const value = {
    currentUser,
    userData,
    login,
    register,
    logout,
    loading,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
 