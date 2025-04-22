import  { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Bid } from '../types';
import { Clock, Users } from 'lucide-react';

interface BidHistoryProps {
  auctionId: string;
}

export default function BidHistory({ auctionId }: BidHistoryProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        // Get all bids
        const bidsCollection = collection(db, 'bids');
        const bidsSnapshot = await getDocs(bidsCollection);
        
        // Filter for this auction
        const bidData = bidsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as Bid))
          .filter(bid => bid.auctionId === auctionId);
        
        // Sort by timestamp manually (descending)
        bidData.sort((a, b) => {
          const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
          const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
          return timeB - timeA;
        });
        
        setBids(bidData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bids:", error);
        setLoading(false);
      }
    };

    fetchBids();
    
    // Set up polling for updates
    const interval = setInterval(fetchBids, 15000); // Refresh every 15 seconds
    
    return () => clearInterval(interval);
  }, [auctionId]);

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center">
          <div className="animate-pulse flex space-x-4 w-full max-w-md">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="py-8 text-center">
        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-700 mb-1">No bids yet</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Be the first to place a bid on this auction. Your bid could be the winning one!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Bid History</h3>
        <span className="text-sm text-gray-500 flex items-center">
          <Users className="h-4 w-4 mr-1" /> 
          {bids.length} {bids.length === 1 ? 'bid' : 'bids'} placed
        </span>
      </div>
      
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bidder
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bids.map((bid, index) => (
              <tr key={bid.id} className={index === 0 ? "bg-green-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {index === 0 && <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>}
                    {bid.userName || 'Anonymous Bidder'}
                    {index === 0 && <span className="ml-2 text-xs font-normal text-green-600">(Highest)</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${index === 0 ? 'text-green-600' : 'text-primary-600'}`}>
                    ${bid.amount?.toFixed(2) || '0.00'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {bid.timestamp && typeof bid.timestamp.toDate === 'function' 
                      ? bid.timestamp.toDate().toLocaleString() 
                      : 'Just now'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
 