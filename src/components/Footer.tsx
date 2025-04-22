import  { Link } from 'react-router-dom';
import { Gavel, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <Gavel className="h-8 w-8 text-primary-400" />
              <span className="ml-2 text-xl font-bold">BidMaster</span>
            </div>
            <p className="text-gray-300 text-sm">
              The premium online auction platform where you can bid on exclusive items and win amazing products.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white text-sm">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white text-sm">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-gray-300 hover:text-white text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-gray-300 hover:text-white text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-gray-300 hover:text-white text-sm">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-300 mr-2" />
                <span className="text-gray-300 text-sm">support@bidmaster.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-300 mr-2" />
                <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-300 mr-2" />
                <span className="text-gray-300 text-sm">123 Auction St, City, Country</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 mt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} BidMaster. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
 