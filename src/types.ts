import  { Timestamp } from 'firebase/firestore';

export interface AuctionItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  additionalImages?: string[];
  startingBid: number;
  currentBid: number;
  bids: string[];
  createdAt: Timestamp;
  startDate: Timestamp;
  endDate: Timestamp;
  categoryId: string;
  isFixedItem: boolean;
  dimensions?: {
    length: number;
    width: number;
    height?: number;
    weight?: number;
  };
  location: string;
  winnerDeclared?: boolean;
  winnerId?: string;
  winnerName?: string;
  winningBid?: number;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  paymentTimestamp?: Timestamp;
  paymentVerified?: boolean;
  paymentVerifiedAt?: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  amount: number;
  timestamp: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'win' | 'outbid' | 'system' | 'payment';
  timestamp: Timestamp;
  auctionId?: string;
  read: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'creditCard' | 'bankTransfer' | 'mobileMoney' | 'paypal' | 'stripe';
  name: string;
  description: string;
  processingTime: string;
  fees?: string;
  imageUrl?: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  auctionId: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  timestamp: Date | Timestamp;
  stripeSessionId?: string;
  details?: {
    currency?: string;
    description?: string;
    processingFee?: number;
    paymentMethod?: string;
    cardDetails?: {
      last4?: string;
      expiryDate?: string;
      cardholderName?: string;
    };
    mobileDetails?: {
      phoneNumber?: string;
      provider?: string;
    };
    bankDetails?: {
      accountNumber?: string;
      bankName?: string;
    };
  };
}
 