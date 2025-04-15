import  { useState, useEffect } from 'react';
import { collection, query, getDocs, where, Timestamp, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { AuctionItem } from '../types';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';

export default function FeaturedAuctions() {
  const [featuredAuctions, setFeaturedAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedAuctions() {
      try {
        const now = Timestamp.now();
        
        // Get active auctions
        const activeAuctionsQuery = query(
          collection(db, 'auctions'),
          where('endDate', '>', now),
          limit(6)
        );
        
        const snapshot = await getDocs(activeAuctionsQuery);
        const auctionData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as AuctionItem));
        
        // Filter for auctions with higher bids or ending soon
        let featured = auctionData
          .sort((a, b) => {
            // Sort by combination of bid count and time remaining
            const aBidCount = a.bids?.length || 0;
            const bBidCount = b.bids?.length || 0;
            
            const aTimeRemaining = a.endDate.toMillis() - now.toMillis();
            const bTimeRemaining = b.endDate.toMillis() - now.toMillis();
            
            // Prioritize items with more bids and less time remaining
            return (bBidCount * 1000000 / bTimeRemaining) - (aBidCount * 1000000 / aTimeRemaining);
          })
          .slice(0, 3);
        
        setFeaturedAuctions(featured);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching featured auctions:", error);
        setLoading(false);
      }
    }

    fetchFeaturedAuctions();
  }, []);

  const formatTimeLeft = (timestamp: Timestamp) => {
    const now = new Date().getTime();
    const endTime = timestamp.toDate().getTime();
    const timeLeft = endTime - now;
    
    if (timeLeft <= 0) return 'Ended';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m left`;
    
    return `${minutes}m left`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900">Featured Auctions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-300" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (featuredAuctions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900">Featured Luxury Auctions</h2>
          <p className="mt-2 text-gray-600">Bid on these exclusive items ending soon</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredAuctions.map((auction) => (
            <div key={auction.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
              <div className="relative h-48">
                <img
                  src={auction.imageUrl}
                  alt={auction.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute top-2 right-2 bg-primary-600 text-white rounded-full px-3 py-1 text-xs font-semibold flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white rounded-full px-3 py-1 text-xs font-medium flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTimeLeft(auction.endDate)}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{auction.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{auction.description}</p>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Current Bid</p>
                    <p className="text-lg font-bold text-primary-600">${auction.currentBid.toFixed(2)}</p>
                  </div>

                  <Link
                    to={`/auction/${auction.id}`}
                    className="btn btn-primary text-sm"
                  >
                    View Auction
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
 