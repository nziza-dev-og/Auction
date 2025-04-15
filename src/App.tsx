import  { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuctionDetailsPage from './pages/AuctionDetailsPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { Suspense } from 'react';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="auction/:id" element={
            <Suspense fallback={<LoadingView />}>
              <AuctionDetailsPage />
            </Suspense>
          } />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <UserDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="admin" element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          } />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

function LoadingView() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary-600 animate-spin"></div>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Loading Auction Details</h3>
          <p className="mt-1 text-sm text-gray-500">Please wait while we prepare the bidding experience...</p>
        </div>
      </div>
    </div>
  );
}

export default App;
 