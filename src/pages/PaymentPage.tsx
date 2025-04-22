import  { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AuctionItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, CreditCard, AlertCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { createCheckoutSession } from '../services/stripeService';

export default function PaymentPage() {
  const { auctionId } = useParams<{ auctionId: string }>();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    async function fetchAuctionDetails() {
      if (!auctionId || !currentUser) return;
      
      try {
        const auctionDoc = await getDoc(doc(db, 'auctions', auctionId));
        
        if (!auctionDoc.exists()) {
          setError('Auction not found');
          setLoading(false);
          return;
        }
        
        const auctionData = { id: auctionDoc.id, ...auctionDoc.data() } as AuctionItem;
        
        // Check if the current user is the winner
        if (auctionData.winnerId && auctionData.winnerId !== currentUser.uid) {
          setError('You are not authorized to make a payment for this auction');
        } else if (!auctionData.winnerDeclared && auctionData.endDate.toDate() > new Date()) {
          setError('This auction has not ended yet');
        }
        
        setAuction(auctionData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching auction details:', err);
        setError('Failed to load auction details');
        setLoading(false);
      }
    }
    
    fetchAuctionDetails();
  }, [auctionId, currentUser]);

  const handlePayWithStripe = async () => {
    if (!auction || !currentUser || !userProfile) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      // Create payment record in Firestore first
      const paymentRef = await addDoc(collection(db, 'payments'), {
        userId: currentUser.uid,
        userName: userProfile.name,
        userEmail: currentUser.email,
        auctionId: auction.id,
        auctionTitle: auction.title,
        amount: auction.winningBid || auction.currentBid,
        method: 'stripe',
        status: 'pending',
        timestamp: Timestamp.now(),
      });
      
      // Update auction with payment status
      await updateDoc(doc(db, 'auctions', auction.id), {
        paymentStatus: 'pending',
        paymentId: paymentRef.id,
        paymentTimestamp: Timestamp.now()
      });
      
      // Generate success and cancel URLs
      const successUrl = `${window.location.origin}/payment-success/${auction.id}?payment_id=${paymentRef.id}`;
      const cancelUrl = `${window.location.origin}/payment/${auction.id}?canceled=true`;
      
      // Create and redirect to Stripe checkout
      const result = await createCheckoutSession(
        auction,
        currentUser.uid,
        successUrl,
        cancelUrl
      );
      
      if (!result.success) {
        throw new Error('Failed to create checkout session');
      }
      
      // Note: The user will be redirected to Stripe by the createCheckoutSession function
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment processing failed. Please try again.');
      setError('Payment processing failed. Please check your details and try again.');
      setIsProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }
  
  if (error || !auction) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to={`/auction/${auctionId}`} className="flex items-center text-primary-600 hover:text-primary-700 mb-8">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to auction
      </Link>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-primary-700 text-white px-6 py-4">
          <h1 className="text-xl font-bold">Complete Your Purchase</h1>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:space-x-6">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-16 w-16">
                    <img 
                      src={auction.imageUrl} 
                      alt={auction.title} 
                      className="h-full w-full object-cover rounded-md"
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">{auction.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Auction #{auction.id.substring(0, 8)}
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">Winning Bid:</span>
                    <span className="text-sm font-medium">${(auction.winningBid || auction.currentBid).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">Processing Fee:</span>
                    <span className="text-sm font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="text-base font-medium">Total:</span>
                    <span className="text-base font-bold text-primary-600">
                      ${(auction.winningBid || auction.currentBid).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex p-4 bg-blue-50 rounded-lg items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <Lock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Secure Payment</h3>
                    <p className="mt-1 text-xs text-blue-700">
                      All payment information is encrypted and securely processed through Stripe, a trusted payment provider.
                      Your financial details are never stored on our servers.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <img 
                  src="https://images.unsplash.com/photo-1556740714-a8395b3bf30f?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxjcmVkaXQlMjBjYXJkJTIwcGF5bWVudCUyMGNoZWNrb3V0JTIwc2VjdXJlfGVufDB8fHx8MTc0NTMyODY3OXww&ixlib=rb-4.0.3&fit=fillmax&h=400&w=600" 
                  alt="Secure Payment" 
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
            </div>
            
            <div className="md:w-1/2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
              
              <div className="bg-gray-50 p-5 rounded-lg mb-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Stripe Secure Checkout</h3>
                    <p className="text-sm text-gray-600">Pay securely with credit/debit card</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  You'll be redirected to Stripe's secure payment page to complete your purchase.
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Accepted cards:</span>
                  <div className="flex space-x-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Visa.svg/1200px-Visa.svg.png" alt="Visa" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png" alt="Amex" className="h-6" />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-6">
                  <img 
                    src="https://images.unsplash.com/photo-1599050751795-6cdaafbc2319?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxjcmVkaXQlMjBjYXJkJTIwcGF5bWVudCUyMGNoZWNrb3V0JTIwc2VjdXJlfGVufDB8fHx8MTc0NTMyODY3OXww&ixlib=rb-4.0.3&fit=fillmax&h=50&w=50" 
                    alt="Mobile payment" 
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <p className="text-xs text-gray-500">
                    Stripe also supports Apple Pay, Google Pay, and other payment methods depending on your region.
                  </p>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={handlePayWithStripe}
                disabled={isProcessing}
                className={`w-full flex items-center justify-center btn ${
                  isProcessing ? 'bg-primary-400' : 'btn-primary'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Checkout: ${(auction.winningBid || auction.currentBid).toFixed(2)}
                  </>
                )}
              </button>
              <p className="mt-2 text-xs text-center text-gray-500">
                By proceeding, you agree to our <Link to="/terms-of-service" className="text-primary-600 hover:text-primary-500">Terms of Service</Link> and <Link to="/refund-policy" className="text-primary-600 hover:text-primary-500">Refund Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 