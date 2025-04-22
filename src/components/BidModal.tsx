import  { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { AuctionItem } from '../types';
import DollarSign from './icons/DollarSign';

interface BidModalProps {
  auction: AuctionItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function BidModal({ auction, isOpen, onClose }: BidModalProps) {
  const { currentUser, userProfile } = useAuth();
  const [amount, setAmount] = useState<string>((auction.currentBid + 1).toFixed(2));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

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
    
    if (bidAmount <= auction.currentBid) {
      setError(`Bid must be higher than current bid: $${auction.currentBid.toFixed(2)}`);
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Create bid document
      const bidRef = await addDoc(collection(db, 'bids'), {
        auctionId: auction.id,
        userId: currentUser.uid,
        userName: userProfile.name,
        amount: bidAmount,
        timestamp: serverTimestamp(),
      });
      
      // Update auction with new current bid and add bid ID to bids array
      await updateDoc(doc(db, 'auctions', auction.id), {
        currentBid: bidAmount,
        bids: [...auction.bids, bidRef.id]
      });
      
      setSuccess(true);
      
      // Close modal after success message is shown
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      setError('Failed to place bid. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal when clicking outside
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-xl transform transition-all">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Place Your Bid</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-6 py-4">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900">{auction.title}</h4>
            <p className="text-sm text-gray-500 mt-1">
              Current bid: <span className="font-medium text-primary-600">${auction.currentBid.toFixed(2)}</span>
            </p>
          </div>
          
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
              <label htmlFor="bidAmountModal" className="block text-sm font-medium text-gray-700 mb-1">
                Your Bid Amount ($)
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="bidAmountModal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min={auction.currentBid + 0.01}
                  className="pl-10 input focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your bid amount"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Minimum bid: ${(auction.currentBid + 0.01).toFixed(2)}
              </p>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn btn-outline"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 flex justify-center items-center btn ${
                  isSubmitting ? 'bg-primary-400' : 'btn-primary'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing
                  </>
                ) : (
                  'Place Bid'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
 