import  { Link, Outlet, useLocation } from 'react-router-dom';
import { Package, Award, Settings, Home, ShoppingBag } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin/products', label: 'Products', icon: <ShoppingBag className="h-5 w-5" /> },
    { path: '/admin/bids', label: 'Bid Manage', icon: <Package className="h-5 w-5" /> },
    { path: '/admin/declarations', label: 'Declaration Manage', icon: <Award className="h-5 w-5" /> },
    { path: '/admin/settings', label: 'Admin Settings', icon: <Settings className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gray-800 text-white shadow-lg py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
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
            <nav className="bg-white shadow-sm rounded-lg p-4">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="bg-gray-800 p-2 rounded">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="ml-3 text-lg font-semibold">Admin Panel</h2>
                </div>
              </div>
              
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                        location.pathname === item.path
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
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

export default AdminLayout;
 