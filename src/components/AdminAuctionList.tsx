import  { useState, useEffect } from 'react';
import { collection, query, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { AuctionItem } from '../types';
import { Link } from 'react-router-dom';
import { Edit, Eye, Clock, Users } from 'lucide-react';

export default function AdminAuctionList() {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'active' | 'ended' | 'all'>('all');

  useEffect(() => {
    async function fetchAuctions() {
      try {
        const auctionsQuery = query(collection(db, 'auctions'));
        const snapshot = await getDocs(auctionsQuery);
        
        const auctionData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AuctionItem));
        
        setAuctions(auctionData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching auctions:", error);
        setLoading(false);
      }
    }

    fetchAuctions();
  }, []);

  const now = Timestamp.now();
  
  const filteredAuctions = auctions.filter(auction => {
    const isEnded = auction.endDate.toDate() < now.toDate();
    
    if (filterType === 'active') return !isEnded;
    if (filterType === 'ended') return isEnded;
    return true; // 'all'
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Auction Management</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-sm rounded-md ${
              filterType === 'all' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('active')}
            className={`px-3 py-1.5 text-sm rounded-md ${
              filterType === 'active' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterType('ended')}
            className={`px-3 py-1.5 text-sm rounded-md ${
              filterType === 'ended' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ended
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredAuctions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions found</h3>
          <p className="text-gray-500">There are no auctions matching your filter criteria.</p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Auction
                </th>
                <th scope="col" className="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Current Bid
                </th>
                <th scope="col" className="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Bids
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  End Date
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredAuctions.map((auction) => {
                const isEnded = auction.endDate.toDate() < now.toDate();
                
                return (
                  <tr key={auction.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={auction.imageUrl}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{auction.title}</div>
                          <div className="text-gray-500 truncate max-w-xs">{auction.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell whitespace-nowrap px-3 py-4 text-sm">
                      <div className="text-gray-900 font-medium">${auction.currentBid.toFixed(2)}</div>
                      <div className="text-gray-500 text-xs">Starting: ${auction.startingBid.toFixed(2)}</div>
                    </td>
                    <td className="hidden md:table-cell whitespace-nowrap px-3 py-4 text-sm">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{auction.bids.length}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isEnded ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {isEnded ? 'Ended' : 'Active'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>{auction.endDate.toDate().toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex space-x-2 justify-end">
                        <Link
                          to={`/auction/${auction.id}`}
                          className="text-primary-600 hover:text-primary-900"
                          title="View"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link
                          to={`/auction/${auction.id}`}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
 