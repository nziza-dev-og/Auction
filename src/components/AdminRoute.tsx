import  { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return userProfile?.isAdmin ? children : <Navigate to="/dashboard" />;
}
 