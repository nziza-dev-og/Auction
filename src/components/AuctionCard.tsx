import  { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import { AuctionItem } from '../types';
import BidModal from './BidModal';
import { useAuth } from '../contexts/AuthContext';

interface AuctionCardProps {
  auction: AuctionItem;
}

export default function AuctionCard({ auction }: AuctionCardProps) {
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const { currentUser } = useAuth();
  
  const timeLeft = auction.endDate.toDate().getTime() - new Date().getTime();
  const isEnded = timeLeft <= 0;

  const formatTimeLeft = () => {
    if (isEnded) return 'Auction ended';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const handleBidButtonClick = (e: React.MouseEvent) => {
    if (!currentUser) return; // Let the link navigation happen for non-logged in users
    
    if (!isEnded) {
      e.preventDefault(); // Prevent navigation
      setIsBidModalOpen(true);
    }
  };

  return (
    <>
      <div className="card group hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          <img 
            src={auction.imageUrl} 
            alt={auction.title} 
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-md text-xs font-medium">
            {isEnded ? (
              <span className="text-red-600">Ended</span>
            ) : (
              <div className="flex items-center text-gray-700">
                <Clock className="w-3 h-3 mr-1" />
                {formatTimeLeft()}
              </div>
            )}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {auction.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {auction.description}
          </p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-primary-600 font-bold">
                ${auction.currentBid.toFixed(2)}
              </p>
              <div className="flex items-center text-gray-500 text-xs">
                <Users className="w-3 h-3 mr-1" />
                {auction.bids.length} bids
              </div>
            </div>
            <Link 
              to={`/auction/${auction.id}`} 
              className="btn btn-primary text-sm py-1.5"
              onClick={handleBidButtonClick}
            >
              {isEnded ? 'View Results' : 'Place Bid'}
            </Link>
          </div>
        </div>
      </div>
      
      {isBidModalOpen && (
        <BidModal 
          auction={auction} 
          isOpen={isBidModalOpen} 
          onClose={() => setIsBidModalOpen(false)} 
        />
      )}
    </>
  );
}
 