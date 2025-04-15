import  { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  isAdmin: boolean;
}

export interface AuctionItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startingBid: number;
  currentBid: number;
  bids: string[];
  createdAt: Timestamp;
  endDate: Timestamp;
  winnerDeclared?: boolean;
  winnerId?: string;
  winnerName?: string;
  winningBid?: number;
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
  type: 'win' | 'outbid' | 'system';
  timestamp: Timestamp;
  auctionId?: string;
  read: boolean;
}
 