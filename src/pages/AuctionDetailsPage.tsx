import  { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, getDocs, onSnapshot, collection, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { AuctionItem, Bid, Category } from '../types';
import BidForm from '../components/BidForm';
import BidHistory from '../components/BidHistory';
import { Clock, Users, ArrowLeft, AlertCircle, Edit, Trash, X, Check, Save, MapPin, Ruler, Package } from 'lucide-react';
import AuctionGallery from '../components/AuctionGallery';
import DollarSign from '../components/icons/DollarSign';

export default function AuctionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isEnded, setIsEnded] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [highestBidder, setHighestBidder] = useState<string | null>(null);
  const [isCurrentUserHighestBidder, setIsCurrentUserHighestBidder] = useState(false);
  const { currentUser, isAdmin, userProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedAuction, setEditedAuction] = useState<Partial<AuctionItem>>({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const navigate = useNavigate();

  // Sample additional images for gallery demo
  const sampleAdditionalImages = [
    "https://images.unsplash.com/photo-1522255272218-7ac5249be344?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxhdWN0aW9uJTIwbHV4dXJ5JTIwaXRlbXN8ZW58MHx8fHwxNzQ0NzI0MDEzfDA&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800",
    "https://images.unsplash.com/photo-1541239370886-851049f91487?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxhdWN0aW9uJTIwbHV4dXJ5JTIwaXRlbXN8ZW58MHx8fHwxNzQ0NzI0MDEzfDA&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800",
    "https://images.unsplash.com/photo-1512100356356-de1b84283e18?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw1fHxhdWN0aW9uJTIwbHV4dXJ5JTIwaXRlbXN8ZW58MHx8fHwxNzQ0NzI0MDEzfDA&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800"
  ];

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Auction ID is missing');
      return;
    }

    async function fetchAuctionData() {
      try {
        const docRef = doc(db, 'auctions', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const auctionData = { 
            id: docSnap.id, 
            ...docSnap.data(),
            // Ensure these properties exist with default values if needed
            bids: docSnap.data().bids || [],
            currentBid: docSnap.data().currentBid || docSnap.data().startingBid || 0
          } as AuctionItem;
          
          // Add sample images for demo purposes if none exist
          if (!auctionData.additionalImages || auctionData.additionalImages.length === 0) {
            auctionData.additionalImages = sampleAdditionalImages;
          }
          
          // Set default image if none exists
          if (!auctionData.imageUrl) {
            auctionData.imageUrl = "https://images.unsplash.com/photo-1500627964684-141351970a7f?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBhdWN0aW9uJTIwaXRlbXN8ZW58MHx8fHwxNzQ0NzI0MDEzfDA&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800";
          }
          
          console.log("Fetched auction data:", auctionData);
          setAuction(auctionData);
          
          setEditedAuction({
            title: auctionData.title || '',
            description: auctionData.description || '',
            imageUrl: auctionData.imageUrl || '',
            startingBid: auctionData.startingBid || 0,
            startDate: auctionData.startDate,
            endDate: auctionData.endDate,
            additionalImages: auctionData.additionalImages || [],
            categoryId: auctionData.categoryId || '',
            isFixedItem: auctionData.isFixedItem === undefined ? false : auctionData.isFixedItem,
            dimensions: auctionData.dimensions || { length: 0, width: 0, height: 0 },
            location: auctionData.location || '',
          });
          
          // Fetch category information if categoryId exists
          if (auctionData.categoryId) {
            try {
              const categoryDoc = await getDoc(doc(db, 'categories', auctionData.categoryId));
              if (categoryDoc.exists()) {
                setCategory({ id: categoryDoc.id, ...categoryDoc.data() } as Category);
              }
            } catch (catError) {
              console.error("Error fetching category:", catError);
            }
          }
          
          // Check auction timing
          const now = new Date().getTime();
          
          // Check if auction has started
          if (auctionData.startDate && typeof auctionData.startDate.toDate === 'function') {
            const startTime = auctionData.startDate.toDate().getTime();
            setHasStarted(now >= startTime);
          } else {
            setHasStarted(true); // Default to started if no valid start date
          }
          
          // Check if auction has ended
          if (auctionData.endDate && typeof auctionData.endDate.toDate === 'function') {
            const endTime = auctionData.endDate.toDate().getTime();
            setIsEnded(endTime <= now);
            
            // Calculate time left
            updateTimeLeft(endTime);
          } else {
            setIsEnded(false); // Default to not ended if no valid end date
          }
          
          // Fetch highest bidder
          await fetchHighestBidder(id);
        } else {
          console.log("No auction document found with ID:", id);
          setError('Auction not found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching auction:", err);
        setError('Failed to load auction details. Please try again.');
        setLoading(false);
      }
    }

    // Update time left function
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
        // For simplicity, we'll manually fetch all bids and find highest
        const bidsQuerySnapshot = await getDocs(collection(db, 'bids'));
        const allBids = bidsQuerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as Bid);
        
        // Filter bids for this auction
        const auctionBids = allBids.filter(bid => bid.auctionId === auctionId);
        
        if (auctionBids.length > 0) {
          // Find highest bid
          const highestBid = auctionBids.reduce((prev, current) => 
            (prev.amount > current.amount) ? prev : current
          );
          
          setHighestBidder(highestBid.userName || 'Anonymous');
          
          // Check if current user is the highest bidder
          if (currentUser && highestBid.userId === currentUser.uid) {
            setIsCurrentUserHighestBidder(true);
          } else {
            setIsCurrentUserHighestBidder(false);
          }
        }
      } catch (err) {
        console.error("Error fetching bids:", err);
      }
    };

    fetchAuctionData();
    
    // Set up timer to update countdown
    let timerInterval: number | undefined;
    if (auction?.endDate && !isEnded) {
      const endTime = auction.endDate.toDate?.()?.getTime() || 0;
      if (endTime > 0) {
        timerInterval = window.setInterval(() => {
          updateTimeLeft(endTime);
        }, 1000);
      }
    }
    
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [id, currentUser]);

  const handleBidPlaced = async () => {
    if (!id) return;
    
    // Refresh auction data
    try {
      const auctionRef = doc(db, 'auctions', id);
      const auctionDoc = await getDoc(auctionRef);
      
      if (auctionDoc.exists()) {
        setAuction({ id: auctionDoc.id, ...auctionDoc.data() } as AuctionItem);
      }
    } catch (error) {
      console.error("Error refreshing auction data:", error);
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
      if (editedAuction.additionalImages !== auction.additionalImages) updates.additionalImages = editedAuction.additionalImages;
      if (editedAuction.startingBid !== auction.startingBid) updates.startingBid = editedAuction.startingBid;
      if (editedAuction.location !== auction.location) updates.location = editedAuction.location;
      if (JSON.stringify(editedAuction.dimensions) !== JSON.stringify(auction.dimensions)) {
        updates.dimensions = editedAuction.dimensions;
      }
      if (editedAuction.categoryId !== auction.categoryId) updates.categoryId = editedAuction.categoryId;
      
      if (Object.keys(updates).length > 0) {
        await updateDoc(auctionRef, updates);
        
        setIsEditing(false);
        setUpdateSuccess(true);
        toast.success('Auction updated successfully');
        setTimeout(() => setUpdateSuccess(false), 3000);
      } else {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating auction:', error);
      setUpdateError('Failed to update auction. Please try again.');
      toast.error('Failed to update auction');
    }
  };

  const handleDeleteAuction = async () => {
    if (!id) return;
    
    try {
      await deleteDoc(doc(db, 'auctions', id));
      toast.success('Auction deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting auction:', error);
      setUpdateError('Failed to delete auction. Please try again.');
      toast.error('Failed to delete auction');
      setDeleteConfirmOpen(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!auction) return;
    
    if (isCurrentUserHighestBidder && isEnded) {
      navigate(`/payment/${auction.id}`);
    } else {
      toast.error('Only the highest bidder can proceed to payment after the auction ends');
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
                  Location
                </label>
                <input
                  type="text"
                  value={editedAuction.location || ''}
                  onChange={(e) => setEditedAuction({...editedAuction, location: e.target.value})}
                  className="input"
                  placeholder="City, Country"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Image URL
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
                  Additional Image URLs (comma separated)
                </label>
                <input
                  type="text"
                  value={(editedAuction.additionalImages || []).join(', ')}
                  onChange={(e) => setEditedAuction({
                    ...editedAuction, 
                    additionalImages: e.target.value.split(',').map(url => url.trim()).filter(url => url)
                  })}
                  className="input"
                  placeholder="URL1, URL2, URL3"
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Type
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={editedAuction.isFixedItem === true}
                      onChange={() => setEditedAuction({...editedAuction, isFixedItem: true})}
                      className="form-radio h-4 w-4 text-primary-600"
                      disabled={auction.bids && auction.bids.length > 0}
                    />
                    <span className="ml-2 text-sm text-gray-700">Fixed Item</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={editedAuction.isFixedItem === false}
                      onChange={() => setEditedAuction({...editedAuction, isFixedItem: false})}
                      className="form-radio h-4 w-4 text-primary-600"
                      disabled={auction.bids && auction.bids.length > 0}
                    />
                    <span className="ml-2 text-sm text-gray-700">Non-Fixed Item</span>
                  </label>
                </div>
                {auction.bids && auction.bids.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Cannot change item type once bids have been placed.
                  </p>
                )}
              </div>
              
              {editedAuction.isFixedItem && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Length (cm)
                    </label>
                    <input
                      type="number"
                      value={editedAuction.dimensions?.length || ''}
                      onChange={(e) => setEditedAuction({
                        ...editedAuction, 
                        dimensions: {...(editedAuction.dimensions || {}), length: parseFloat(e.target.value)}
                      })}
                      className="input"
                      step="0.1"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width (cm)
                    </label>
                    <input
                      type="number"
                      value={editedAuction.dimensions?.width || ''}
                      onChange={(e) => setEditedAuction({
                        ...editedAuction, 
                        dimensions: {...(editedAuction.dimensions || {}), width: parseFloat(e.target.value)}
                      })}
                      className="input"
                      step="0.1"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={editedAuction.dimensions?.height || ''}
                      onChange={(e) => setEditedAuction({
                        ...editedAuction, 
                        dimensions: {...(editedAuction.dimensions || {}), height: parseFloat(e.target.value)}
                      })}
                      className="input"
                      step="0.1"
                      min="0"
                    />
                  </div>
                </div>
              )}
              
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
                  Start/End Dates
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-gray-600 bg-gray-100 px-4 py-2 rounded-md">
                    Start Date: {auction.startDate?.toDate?.()?.toLocaleString() || 'Not set'}
                  </div>
                  <div className="text-gray-600 bg-gray-100 px-4 py-2 rounded-md">
                    End Date: {auction.endDate?.toDate?.()?.toLocaleString() || 'Not set'}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Start and end dates cannot be modified once auction has been created.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <div className="order-2 lg:order-1">
            <AuctionGallery 
              mainImage={auction.imageUrl} 
              title={auction.title || 'Auction Item'}
              additionalImages={auction.additionalImages || sampleAdditionalImages}
            />
            
            {isEnded && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700 font-medium">This auction has ended</span>
                </div>
              </div>
            )}
            
            {!hasStarted && (
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-yellow-700 font-medium">
                    This auction hasn't started yet. Bidding will be available from{' '}
                    {auction.startDate?.toDate?.()?.toLocaleString() || 'the start date'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Item Details Section */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Item Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  </div>
                  <div className="ml-2">
                    <h4 className="text-sm font-medium text-gray-700">Location</h4>
                    <p className="text-sm text-gray-600">{auction.location || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                  </div>
                  <div className="ml-2">
                    <h4 className="text-sm font-medium text-gray-700">Item Type</h4>
                    <p className="text-sm text-gray-600">{auction.isFixedItem ? 'Fixed Item' : 'Non-Fixed Item'}</p>
                  </div>
                </div>
                
                {auction.isFixedItem && auction.dimensions && (
                  <div className="flex items-start md:col-span-2">
                    <div className="flex-shrink-0">
                      <Ruler className="h-5 w-5 text-gray-400 mt-0.5" />
                    </div>
                    <div className="ml-2">
                      <h4 className="text-sm font-medium text-gray-700">Dimensions</h4>
                      <p className="text-sm text-gray-600">
                        {auction.dimensions.length && auction.dimensions.width ? 
                          `${auction.dimensions.length} × ${auction.dimensions.width}${auction.dimensions.height ? ` × ${auction.dimensions.height}` : ''} cm` 
                          : 'Dimensions not specified'}
                      </p>
                    </div>
                  </div>
                )}
                
                {category && (
                  <div className="flex items-start">
                    <div className="ml-2">
                      <h4 className="text-sm font-medium text-gray-700">Category</h4>
                      <Link 
                        to={`/category/${category.id}`}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        {category.name}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{auction.title || 'Unnamed Auction'}</h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isEnded ? 'bg-red-100 text-red-800' : hasStarted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isEnded ? 'Ended' : hasStarted ? 'Active' : 'Upcoming'}
              </div>
              
              {!isEnded && (
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-1 text-primary-500" />
                  <span className="font-mono">{timeLeft || 'Time remaining'}</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-b border-gray-200 py-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">Current Bid:</p>
                  <p className="text-3xl font-bold text-primary-600">${(auction.currentBid || auction.startingBid || 0).toFixed(2)}</p>
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
                  {isCurrentUserHighestBidder && (
                    <span className="text-green-600 font-medium ml-1">(You)</span>
                  )}
                </p>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{auction.description || 'No description provided.'}</p>
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
            
            {/* Action Buttons */}
            {isEnded && isCurrentUserHighestBidder ? (
              <div className="mt-6">
                <button
                  onClick={handleProceedToPayment}
                  className="w-full btn btn-primary py-3 flex items-center justify-center"
                >
                  <DollarSign className="h-5 w-5 mr-2" />
                  Proceed to Payment
                </button>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Congratulations! You are the highest bidder.
                </p>
              </div>
            ) : hasStarted && !isEnded && currentUser ? (
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
            ) : !hasStarted ? (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">Auction hasn't started yet</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Bidding will be available from {auction.startDate?.toDate?.()?.toLocaleString() || 'the start date'}
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
 