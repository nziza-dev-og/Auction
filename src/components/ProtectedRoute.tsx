import  { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return currentUser ? children : <Navigate to="/login" />;
}
 