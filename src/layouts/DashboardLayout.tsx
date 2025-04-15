import  { Link, Outlet, useLocation } from 'react-router-dom';
import { User, Package, Clock, Bell, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { userData } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
    { path: '/dashboard/bids', label: 'Your Bids', icon: <Package className="h-5 w-5" /> },
    { path: '/dashboard/history', label: 'Bids History', icon: <Clock className="h-5 w-5" /> },
    { path: '/dashboard/notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary-600 text-white shadow-lg py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">User Dashboard</h1>
          <Link to="/" className="flex items-center text-sm">
            <Home className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
              <div className="text-center mb-4">
                <div className="h-20 w-20 rounded-full bg-primary-100 mx-auto flex items-center justify-center">
                  <User className="h-10 w-10 text-primary-600" />
                </div>
                <h2 className="mt-2 text-lg font-semibold">{userData?.name}</h2>
                <p className="text-sm text-gray-500">{userData?.email}</p>
              </div>
            </div>

            <nav className="bg-white shadow-sm rounded-lg p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                        location.pathname === item.path
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                      }`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          
          {/* Main content */}
          <div className="md:w-3/4 bg-white shadow-sm rounded-lg p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
 