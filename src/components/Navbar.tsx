import  { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Gavel, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const isAdmin = userProfile?.isAdmin === true;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Gavel className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">BidMaster</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex space-x-4">
              <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600">
                Home
              </Link>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {currentUser ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    className="flex items-center space-x-2 bg-white rounded-full text-sm focus:outline-none"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <User className="h-5 w-5 text-primary-600" />
                    <span className="text-gray-700">{currentUser.email?.split('@')[0]}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                {dropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <Link 
                      to={isAdmin ? "/admin" : "/dashboard"} 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {isAdmin ? "Admin Dashboard" : "Dashboard"}
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className="btn btn-outline">
                  Sign in
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {currentUser ? (
              <div className="space-y-1">
                <Link
                  to={isAdmin ? "/admin" : "/dashboard"}
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  {isAdmin ? "Admin Dashboard" : "Dashboard"}
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-2 px-4 py-2">
                <Link
                  to="/login"
                  className="block w-full btn btn-outline text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="block w-full btn btn-primary text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
 