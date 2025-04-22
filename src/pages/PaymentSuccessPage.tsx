import  { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { AuctionItem } from '../types';
import { CheckCircle, Home, ArrowRight, Download, Clock, Mail, Phone } from 'lucide-react';
import { verifyPayment } from '../services/stripeService';

export default function PaymentSuccessPage() {
  const { auctionId } = useParams<{ auctionId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const paymentId = queryParams.get('payment_id') || '';
  const sessionId = queryParams.get('session_id') || '';
  
  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  
  useEffect(() => {
    async function fetchData() {
      if (!auctionId) return;
      
      try {
        // Fetch auction details
        const auctionDoc = await getDoc(doc(db, 'auctions', auctionId));
        if (auctionDoc.exists()) {
          const auctionData = { id: auctionDoc.id, ...auctionDoc.data() } as AuctionItem;
          setAuction(auctionData);
          
          // If we have a session ID from Stripe, verify the payment
          if (sessionId) {
            const result = await verifyPayment(sessionId);
            
            if (result.success && result.paymentStatus === 'paid') {
              // Update payment status in database
              if (paymentId) {
                await updateDoc(doc(db, 'payments', paymentId), {
                  status: 'completed',
                  stripeSessionId: sessionId,
                  updatedAt: Timestamp.now()
                });
              }
              
              // Update auction with payment status
              await updateDoc(doc(db, 'auctions', auctionId), {
                paymentStatus: 'completed',
                paymentVerified: true,
                paymentVerifiedAt: Timestamp.now()
              });
              
              // Create notification for payment
              await addDoc(collection(db, 'notifications'), {
                userId: auctionData.winnerId,
                title: 'Payment Successful',
                message: `Your payment for "${auctionData.title}" has been successfully processed.`,
                type: 'payment',
                timestamp: Timestamp.now(),
                auctionId: auctionId,
                read: false
              });
              
              setTransactionId(sessionId);
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } else if (paymentId) {
            // Just use the payment ID as the transaction reference if no session ID
            setTransactionId(paymentId);
          }
        } else {
          setError('Auction not found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching details:', err);
        setError('Failed to process payment confirmation');
        setLoading(false);
      }
    }
    
    fetchData();
  }, [auctionId, sessionId, paymentId]);
  
  // Generate a PDF receipt (simplified demo)
  const handleDownloadReceipt = () => {
    // In a real app, you would generate a proper PDF
    // For demo, we'll just show a message
    alert('Receipt download started...');
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

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
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
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-600 text-white p-6 flex flex-col items-center">
          <CheckCircle className="h-16 w-16 mb-4" />
          <h1 className="text-2xl font-bold text-center">Payment Successful!</h1>
          <p className="text-green-100 text-center mt-2">
            Thank you for your payment. Your transaction has been completed.
          </p>
        </div>
        
        <div className="p-6">
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Payment Confirmed</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your payment for the auction item "{auction?.title}" has been processed successfully.
                    We have sent a confirmation email with the details to your registered email address.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Transaction Details</h2>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{transactionId || 'TRX-' + Math.random().toString(36).substring(2, 10).toUpperCase()}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date().toLocaleString()}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Amount Paid</dt>
                  <dd className="mt-1 text-sm text-gray-900">${auction?.winningBid?.toFixed(2) || auction?.currentBid?.toFixed(2)}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                  <dd className="mt-1 text-sm text-gray-900">Credit Card (Stripe)</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Item Purchased</dt>
                  <dd className="mt-1 text-sm text-gray-900">{auction?.title}</dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Shipping and Delivery
                </h3>
                <p className="text-sm text-blue-700">
                  Our team will contact you within 24-48 hours to arrange delivery or pickup of your item.
                  Please ensure your contact information in your profile is up to date.
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Need Assistance?</h3>
                <p className="text-sm text-blue-700 mb-2">
                  If you have any questions about your purchase or delivery, please contact our customer support:
                </p>
                <div className="flex items-center text-sm text-blue-700">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href="mailto:support@bidmaster.com" className="font-medium underline">support@bidmaster.com</a>
                </div>
                <div className="flex items-center text-sm text-blue-700 mt-1">
                  <Phone className="h-4 w-4 mr-2" />
                  <a href="tel:+15551234567" className="font-medium underline">+1 (555) 123-4567</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="mb-4">
              <img 
                src="https://images.unsplash.com/photo-1637021536331-17abe5429592?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw1fHxjcmVkaXQlMjBjYXJkJTIwcGF5bWVudCUyMGNoZWNrb3V0JTIwc2VjdXJlfGVufDB8fHx8MTc0NTMyODY3OXww&ixlib=rb-4.0.3&fit=fillmax&h=400&w=600" 
                alt="Payment Success" 
                className="w-full h-40 object-cover rounded-lg"
              />
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0">
              <button 
                onClick={handleDownloadReceipt}
                className="btn btn-outline flex items-center justify-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Receipt
              </button>
              
              <div className="flex space-x-3">
                <Link to="/dashboard" className="btn btn-outline flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Link>
                <Link to="/" className="btn btn-primary flex items-center">
                  Continue Shopping
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 