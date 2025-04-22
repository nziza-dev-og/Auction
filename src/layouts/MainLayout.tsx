import  { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Award, LogIn, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, userData, logout } = useAuth();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <Award className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">BidMaster</span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/' ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Home
              </Link>
              
              {currentUser ? (
                <>
                  <Link 
                    to={userData?.isAdmin ? "/admin" : "/dashboard"} 
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    {userData?.isAdmin ? "Admin Panel" : "Dashboard"}
                  </Link>
                  <button 
                    onClick={() => logout()} 
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-3 py-2 rounded-md btn btn-primary"
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                to="/" 
                onClick={closeMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/' ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Home
              </Link>
              
              {currentUser ? (
                <>
                  <Link 
                    to={userData?.isAdmin ? "/admin" : "/dashboard"} 
                    onClick={closeMenu}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                  >
                    {userData?.isAdmin ? "Admin Panel" : "Dashboard"}
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      closeMenu();
                    }} 
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={closeMenu}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={closeMenu}
                    className="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Award className="h-6 w-6 text-primary-400" />
              <span className="ml-2 text-lg font-semibold">BidMaster</span>
            </div>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} BidMaster. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
 