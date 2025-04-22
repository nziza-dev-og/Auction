import  { useState } from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuctionItem } from '../types';
import { createCheckoutSession } from '../services/stripeService';

interface StripeCheckoutButtonProps {
  auction: AuctionItem;
  successUrl?: string;
  cancelUrl?: string;
}

export default function StripeCheckoutButton({ 
  auction, 
  successUrl,
  cancelUrl
}: StripeCheckoutButtonProps) {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    if (!currentUser) {
      setError('You must be logged in to make a payment');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Default URLs if not provided
      const defaultSuccessUrl = `${window.location.origin}/payment-success/${auction.id}`;
      const defaultCancelUrl = `${window.location.origin}/payment/${auction.id}?canceled=true`;

      // Create checkout session and redirect
      const result = await createCheckoutSession(
        auction,
        currentUser.uid,
        successUrl || defaultSuccessUrl,
        cancelUrl || defaultCancelUrl
      );

      if (!result.success) {
        throw new Error('Failed to create checkout session');
      }
      
      // Note: User will be redirected to Stripe by the createCheckoutSession function
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('Failed to initialize payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
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
        onClick={handleClick}
        disabled={isLoading}
        className={`flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
          isLoading ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay with Stripe
          </>
        )}
      </button>
    </div>
  );
}
 