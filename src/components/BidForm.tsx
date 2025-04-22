import  { useState } from 'react';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { AuctionItem } from '../types';
import { Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DollarSign from './icons/DollarSign';

interface BidFormProps {
  auction: AuctionItem;
  onBidPlaced: () => void;
}

export default function BidForm({ auction, onBidPlaced }: BidFormProps) {
  const { currentUser, userProfile } = useAuth();
  const [amount, setAmount] = useState<string>(((auction.currentBid || auction.startingBid) + 1).toFixed(2));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !userProfile) {
      setError('You must be logged in to place a bid');
      return;
    }
    
    const bidAmount = parseFloat(amount);
    
    if (isNaN(bidAmount)) {
      setError('Please enter a valid bid amount');
      return;
    }
    
    if (bidAmount <= (auction.currentBid || auction.startingBid)) {
      setError(`Bid must be higher than current bid: $${(auction.currentBid || auction.startingBid).toFixed(2)}`);
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Create bid document
      const bidRef = await addDoc(collection(db, 'bids'), {
        auctionId: auction.id,
        userId: currentUser.uid,
        userName: userProfile.name || currentUser.email?.split('@')[0] || 'Anonymous',
        amount: bidAmount,
        timestamp: serverTimestamp(),
      });
      
      // Ensure bids array exists
      const bids = auction.bids || [];
      
      // Update auction with new current bid and add bid ID to bids array
      await updateDoc(doc(db, 'auctions', auction.id), {
        currentBid: bidAmount,
        bids: [...bids, bidRef.id]
      });
      
      setSuccess(true);
      toast.success('Bid placed successfully!');
      setTimeout(() => setSuccess(false), 3000);
      onBidPlaced();
      setAmount((bidAmount + 1).toFixed(2));
    } catch (error) {
      setError('Failed to place bid. Please try again.');
      toast.error('Failed to place bid');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 bg-gray-50 rounded-lg overflow-hidden shadow-sm transition-all">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Place Your Bid</h3>
        <p className="text-sm text-gray-500 mt-1">
          Current highest bid: <span className="font-medium text-primary-600">${(auction.currentBid || auction.startingBid).toFixed(2)}</span>
        </p>
      </div>
      
      <div className="p-5">
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start">
            <Check className="h-5 w-5 mr-2 mt-0.5 text-green-500" />
            <div>
              <p className="font-medium">Bid placed successfully!</p>
              <p className="text-sm">Your bid of ${parseFloat(amount).toFixed(2)} has been recorded.</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 text-red-500" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Your Bid Amount ($)
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="bidAmount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min={(auction.currentBid || auction.startingBid) + 0.01}
                className="pl-10 input focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your bid amount"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Minimum bid: ${((auction.currentBid || auction.startingBid) + 0.01).toFixed(2)}
            </p>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <img 
              src="https://images.unsplash.com/photo-1476357471311-43c0db9fb2b4?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxhdWN0aW9uJTIwYmlkZGluZyUyMFVJJTIwZGVzaWdufGVufDB8fHx8MTc0NDY1ODUxOHww&ixlib=rb-4.0.3&fit=fillmax&h=400&w=600"
              alt="Secure bidding" 
              className="h-10 w-10 rounded-full object-cover mr-3"
            />
            <span>Your bid is secure and encrypted. Bid with confidence!</span>
          </div>
          
          <button
            type="submit"
            className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-medium ${
              isSubmitting ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Bid...
              </>
            ) : (
              'Place Bid Now'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
 