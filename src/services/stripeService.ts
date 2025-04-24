import  { loadStripe } from '@stripe/stripe-js';
import { AuctionItem } from '../types';

// Initialize Stripe with public key
const stripePromise = loadStripe('pk_test_51RGgLKB2p9rTQVgBY8t2jBOUn1u7XUX8iSe44OhYZZztcFcMM7n4xb3rIEuas95bEaX5MRwFmhoHtsSMOQKr5F3D00TZ2HCXyW');

// The backend URL (our proxy)
const PROXY_URL = 'https://stripe-server-0o46.onrender.com/create-checkout-session';


// The Stripe API endpoint
const STRIPE_API = 'https://api.stripe.com/v1/checkout/sessions';

// Create a checkout session for an auction payment
export const createCheckoutSession = async (
  auction: AuctionItem,
  userId: string,
  successUrl: string,
  cancelUrl: string
) => {
  try {
    // Prepare session data for Stripe
    const sessionData = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: auction.title,
              description: auction.description,
              images: [auction.imageUrl],
            },
            unit_amount: Math.round((auction.winningBid || auction.currentBid) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        auctionId: auction.id,
        userId: userId,
      },
    };

    // Create the checkout session through our proxy
   const response = await fetch(PROXY_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    auction,
    userId,
    successUrl,
    cancelUrl,
  }),
});


    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    
    // Load Stripe.js
    const stripe = await stripePromise;
    
    if (!stripe) {
      throw new Error('Failed to load Stripe');
    }
    
    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { success: false, error };
  }
};

// Verify payment status with the backend
export const verifyPayment = async (sessionId: string) => {
  try {
    const response = await fetch(`${PROXY_URL}?url=${encodeURIComponent(`${STRIPE_API}/${sessionId}`)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const session = await response.json();
    return {
      success: true,
      session,
      paymentStatus: session.payment_status,
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { success: false, error };
  }
};
 
