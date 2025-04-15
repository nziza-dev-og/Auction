import  { Timestamp } from 'firebase/firestore';

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
 
export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string; // Similar to AuctionItem's imageUrl
  startingBid: number; // Similar to AuctionItem's startingBid
  currentBid: number; // Similar to AuctionItem's currentBid
  bids: string[]; // Similar to AuctionItem's bids
  createdAt: Timestamp; // Timestamp for when the product was created
  endDate: Timestamp; // Timestamp for the product's end date (auction end or availability end)
  isActive: boolean; // Whether the product is active
  winnerDeclared?: boolean; // Whether a winner has been declared
  winnerId?: string; // The ID of the winner (if applicable)
  winnerName?: string; // The name of the winner (if applicable)
  winningBid?: number; // The winning bid amount (if applicable)
}
