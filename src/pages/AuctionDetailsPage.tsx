import  { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot, collection, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { AuctionItem, Bid } from '../types';
import BidForm from '../components/BidForm';
import BidHistory from '../components/BidHistory';
import { Clock, Users, ArrowLeft, AlertCircle, Edit, Trash, X, Check, Save } from 'lucide-react';
import DollarSign from '../components/icons/DollarSign';

export default function AuctionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isEnded, setIsEnded] = useState(false);
  const [highestBidder, setHighestBidder] = useState<string | null>(null);
  const { currentUser, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedAuction, setEditedAuction] = useState<Partial<AuctionItem>>({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    // Use a direct getDoc first for faster initial load
    const fetchAuctionData = async () => {
      try {
        const docRef = doc(db, 'auctions', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const auctionData = { id: docSnap.id, ...docSnap.data() } as AuctionItem;
          
          // Set default values if missing
          if (!auctionData.bids) auctionData.bids = [];
          if (!auctionData.currentBid) auctionData.currentBid = auctionData.startingBid || 0;
          
          setAuction(auctionData);
          setEditedAuction({
            title: auctionData.title,
            description: auctionData.description,
            imageUrl: auctionData.imageUrl,
            startingBid: auctionData.startingBid,
            endDate: auctionData.endDate,
          });
          
          // Check if auction has ended
          if (auctionData.endDate) {
            const endTime = auctionData.endDate.toDate().getTime();
            const now = new Date().getTime();
            setIsEnded(endTime <= now);
            
            // Calculate time left
            updateTimeLeft(endTime);
          }
          
          // Fetch highest bidder
          fetchHighestBidder(id);
        } else {
          setError('Auction not found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching auction:", err);
        setError('Failed to load auction details');
        setLoading(false);
      }
    };

    // Set up real-time updates after initial load
    const setupAuctionListener = () => {
      const auctionRef = doc(db, 'auctions', id);
      return onSnapshot(auctionRef, 
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const auctionData = { id: docSnapshot.id, ...docSnapshot.data() } as AuctionItem;
            
            // Set default values if missing
            if (!auctionData.bids) auctionData.bids = [];
            if (!auctionData.currentBid) auctionData.currentBid = auctionData.startingBid || 0;
            
            setAuction(auctionData);
            
            // Check if auction has ended
            if (auctionData.endDate) {
              const endTime = auctionData.endDate.toDate().getTime();
              const now = new Date().getTime();
              setIsEnded(endTime <= now);
              
              // Calculate time left
              updateTimeLeft(endTime);
            }
          } else {
            setError('Auction not found');
          }
        },
        (err) => {
          console.error("Error in auction listener:", err);
          setError('Error updating auction data');
        }
      );
    };

    // Update time left
    const updateTimeLeft = (endTime: number) => {
      const now = new Date().getTime();
      const distance = endTime - now;
      
      if (distance <= 0) {
        setTimeLeft('Auction ended');
        setIsEnded(true);
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft(
        `${days > 0 ? days + 'd ' : ''}${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    // Fetch the highest bidder from bids collection
    const fetchHighestBidder = async (auctionId: string) => {
      try {
        const bidsQuery = query(collection(db, 'bids'), where('auctionId', '==', auctionId));
        const bidsSnapshot = await getDocs(bidsQuery);
        
        if (!bidsSnapshot.empty) {
          // Convert to array and sort manually
          const bids = bidsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Bid));
          
          if (bids.length > 0) {
            // Find highest bid
            const highestBid = bids.reduce((prev, current) => 
              (prev.amount > current.amount) ? prev : current
            );
            
            setHighestBidder(highestBid.userName);
          }
        }
      } catch (err) {
        console.error("Error fetching bids:", err);
      }
    };

    // Initial fetch
    fetchAuctionData();
    
    // Set up real-time listener
    const unsubscribeAuction = setupAuctionListener();
    
    // Set up timer to update countdown
    let timerInterval: number | undefined;
    if (!isEnded && auction?.endDate) {
      timerInterval = window.setInterval(() => {
        const endTime = auction.endDate.toDate().getTime();
        updateTimeLeft(endTime);
      }, 1000);
    }
    
    return () => {
      unsubscribeAuction();
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [id, isEnded]);

  const handleBidPlaced = async () => {
    // Refresh auction data
    if (id) {
      const auctionRef = doc(db, 'auctions', id);
      const auctionDoc = await getDoc(auctionRef);
      
      if (auctionDoc.exists()) {
        setAuction({ id: auctionDoc.id, ...auctionDoc.data() } as AuctionItem);
      }
    }
  };

  const handleEditSubmit = async () => {
    if (!auction || !id) return;
    
    try {
      setUpdateError('');
      setUpdateSuccess(false);
      
      const auctionRef = doc(db, 'auctions', id);
      
      // Only update fields that have changed
      const updates: any = {};
      if (editedAuction.title !== auction.title) updates.title = editedAuction.title;
      if (editedAuction.description !== auction.description) updates.description = editedAuction.description;
      if (editedAuction.imageUrl !== auction.imageUrl) updates.imageUrl = editedAuction.imageUrl;
      if (editedAuction.startingBid !== auction.startingBid) updates.startingBid = editedAuction.startingBid;
      
      if (Object.keys(updates).length > 0) {
        await updateDoc(auctionRef, updates);
        
        setIsEditing(false);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } else {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating auction:', error);
      setUpdateError('Failed to update auction. Please try again.');
    }
  };

  const handleDeleteAuction = async () => {
    if (!id) return;
    
    try {
      await deleteDoc(doc(db, 'auctions', id));
      navigate('/');
    } catch (error) {
      console.error('Error deleting auction:', error);
      setUpdateError('Failed to delete auction. Please try again.');
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary-600 animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <DollarSign className="h-10 w-10 text-primary-500" />
              </div>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Loading Auction Details</h3>
            <p className="mt-1 text-sm text-gray-500">Please wait while we prepare the bidding experience...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || 'An error occurred while loading the auction'}</p>
              </div>
              <div className="mt-4">
                <Link to="/" className="text-sm font-medium text-red-700 hover:text-red-600">
                  <span aria-hidden="true">&larr;</span> Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="flex items-center text-primary-600 hover:text-primary-700 mb-8">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to auctions
      </Link>
      
      {updateSuccess && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Auction updated successfully!</p>
            </div>
          </div>
        </div>
      )}
      
      {updateError && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{updateError}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isAdmin && !isEditing && (
          <div className="flex justify-end space-x-2 bg-gray-50 p-3 border-b">
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-outline flex items-center text-sm py-1.5"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Auction
            </button>
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="btn flex items-center text-sm py-1.5 bg-red-600 text-white hover:bg-red-700"
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>
        )}
        
        {isAdmin && isEditing && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Edit Auction</h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleEditSubmit}
                  className="btn btn-primary flex items-center text-sm py-1.5"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn btn-outline flex items-center text-sm py-1.5"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auction Title
                </label>
                <input
                  type="text"
                  value={editedAuction.title || ''}
                  onChange={(e) => setEditedAuction({...editedAuction, title: e.target.value})}
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={editedAuction.imageUrl || ''}
                  onChange={(e) => setEditedAuction({...editedAuction, imageUrl: e.target.value})}
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Starting Bid ($)
                </label>
                <input
                  type="number"
                  value={editedAuction.startingBid || 0}
                  onChange={(e) => setEditedAuction({...editedAuction, startingBid: parseFloat(e.target.value)})}
                  className="input"
                  min="0.01"
                  step="0.01"
                  disabled={auction.bids && auction.bids.length > 0}
                />
                {auction.bids && auction.bids.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Cannot change starting bid once bids have been placed.
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editedAuction.description || ''}
                  onChange={(e) => setEditedAuction({...editedAuction, description: e.target.value})}
                  className="input"
                  rows={4}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <div className="text-gray-600 bg-gray-100 px-4 py-2 rounded-md">
                  {auction.endDate?.toDate().toLocaleString() || 'Not set'}
                  <p className="text-xs text-gray-500 mt-1">
                    End date cannot be modified once auction has started.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-1">
            <div className="relative h-80 w-full overflow-hidden rounded-lg">
              <img 
                src={auction.imageUrl || 'https://images.unsplash.com/photo-1500627964684-141351970a7f?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBhdWN0aW9uJTIwaXRlbXN8ZW58MHx8fHwxNzQ0NzA1MzUwfDA&ixlib=rb-4.0.3&fit=fillmax&h=800&w=1200'} 
                alt={auction.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loop
                  target.src = 'https://images.unsplash.com/photo-1500627964684-141351970a7f?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBhdWN0aW9uJTIwaXRlbXN8ZW58MHx8fHwxNzQ0NzA1MzUwfDA&ixlib=rb-4.0.3&fit=fillmax&h=800&w=1200';
                }}
              />
              {isEnded && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-red-600 text-white px-6 py-3 rounded-full text-lg font-bold tracking-wide transform -rotate-12">
                    AUCTION ENDED
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{auction.title}</h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isEnded ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {isEnded ? 'Ended' : 'Active'}
              </div>
              
              {!isEnded && (
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-1 text-primary-500" />
                  <span className="font-mono">{timeLeft}</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-b border-gray-200 py-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">Current Bid:</p>
                  <p className="text-3xl font-bold text-primary-600">${auction.currentBid?.toFixed(2) || auction.startingBid?.toFixed(2) || '0.00'}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 text-sm">Bids Placed:</p>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-1 text-gray-400" />
                    <span className="text-xl font-semibold text-gray-900">{auction.bids?.length || 0}</span>
                  </div>
                </div>
              </div>
              
              {highestBidder && (
                <p className="text-sm text-gray-600 mt-2">
                  Highest bidder: <span className="font-medium">{highestBidder}</span>
                </p>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{auction.description}</p>
            </div>
            
            <div className="flex items-center mt-6 mb-4">
              <img 
                src="https://images.unsplash.com/photo-1534670007418-fbb7f6cf32c3?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxhdWN0aW9uJTIwYmlkZGluZyUyMFVJJTIwZGVzaWdufGVufDB8fHx8MTc0NDY1ODUxOHww&ixlib=rb-4.0.3&fit=fillmax&h=400&w=600"
                alt="Bidding design" 
                className="h-12 w-12 rounded-full object-cover" 
              />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Professional Bidding</h4>
                <p className="text-xs text-gray-500">Secure, transparent auction process</p>
              </div>
            </div>
            
            {!isEnded && currentUser ? (
              <BidForm auction={auction} onBidPlaced={handleBidPlaced} />
            ) : isEnded ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">This auction has ended</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      The winner will be notified soon. Check the auction results for more information.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">Authentication required</p>
                    <p className="text-sm text-blue-700 mt-1">
                      You need to <Link to="/login" className="font-medium underline">log in</Link> to place a bid on this item.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200">
          <BidHistory auctionId={auction.id} />
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Delete Auction</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this auction? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAuction}
                  className="btn bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 