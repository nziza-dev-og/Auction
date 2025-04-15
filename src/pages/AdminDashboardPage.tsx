import  { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, getDoc, setDoc, addDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import DashboardTabs from '../components/DashboardTabs';
import { ListFilter, Award, Settings, Check, X, AlertCircle, Upload, Trash, Edit, Plus, Save } from 'lucide-react';
import { AuctionItem, Bid, UserProfile } from '../types';
import AdminAuctionList from '../components/AdminAuctionList';

export default function AdminDashboardPage() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [completedAuctions, setCompletedAuctions] = useState<AuctionItem[]>([]);
  const [auctionBids, setAuctionBids] = useState<{[key: string]: Bid[]}>({});
  const [winnersByAuction, setWinnersByAuction] = useState<{[key: string]: {bid: Bid, user: UserProfile} | null}>({});
  const [adminCode, setAdminCode] = useState('');
  const [newAdminCode, setNewAdminCode] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [isCreatingAuction, setIsCreatingAuction] = useState(false);
  const [newAuction, setNewAuction] = useState({
    title: '',
    description: '',
    imageUrl: '',
    startingBid: 0,
    endDate: ''
  });

  useEffect(() => {
    // Fetch current admin code
    const fetchAdminCode = async () => {
      const adminSettingsDoc = await getDoc(doc(db, 'adminSettings', 'code'));
      if (adminSettingsDoc.exists()) {
        setAdminCode(adminSettingsDoc.data().adminCode || 'admin123');
      } else {
        // Create default admin code if not exists
        await setDoc(doc(db, 'adminSettings', 'code'), {
          adminCode: 'admin123'
        });
        setAdminCode('admin123');
      }
    };
    
    // Fetch all auctions
    const fetchAuctions = async () => {
      const now = Timestamp.now();
      
      // Active auctions
      const activeAuctionsQuery = query(
        collection(db, 'auctions'),
        // Add where endDate > now to get active auctions
      );
      
      const activeSnapshot = await getDocs(activeAuctionsQuery);
      const activeAuctionList = activeSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as AuctionItem));
      
      // Filter active and completed auctions based on endDate
      const active: AuctionItem[] = [];
      const completed: AuctionItem[] = [];
      
      activeAuctionList.forEach(auction => {
        if (auction.endDate.toDate() > now.toDate()) {
          active.push(auction);
        } else {
          completed.push(auction);
        }
      });
      
      setAuctions(active);
      setCompletedAuctions(completed);
      
      // Fetch bids for all auctions
      const bidsByAuction: {[key: string]: Bid[]} = {};
      const winnerMap: {[key: string]: {bid: Bid, user: UserProfile} | null} = {};
      
      for (const auction of [...active, ...completed]) {
        const bidsQuery = query(collection(db, 'bids'));
        const bidsSnapshot = await getDocs(bidsQuery);
        const allBids = bidsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Bid));
        
        // Filter bids for this auction
        const auctionBids = allBids.filter(bid => bid.auctionId === auction.id);
        bidsByAuction[auction.id] = auctionBids;
        
        // Find winner for completed auctions
        if (auction.endDate.toDate() <= now.toDate() && auctionBids.length > 0) {
          // Sort bids by amount (highest first)
          const sortedBids = [...auctionBids].sort((a, b) => b.amount - a.amount);
          const highestBid = sortedBids[0];
          
          // Get user profile of winner
          const userDoc = await getDoc(doc(db, 'users', highestBid.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<UserProfile, 'id'>;
            winnerMap[auction.id] = {
              bid: highestBid,
              user: { ...userData, id: highestBid.userId } as UserProfile
            };
          } else {
            winnerMap[auction.id] = null; // User not found
          }
        } else {
          winnerMap[auction.id] = null; // No winner yet
        }
      }
      
      setAuctionBids(bidsByAuction);
      setWinnersByAuction(winnerMap);
    };

    fetchAdminCode();
    fetchAuctions();
  }, []);

  const handleDeclareWinner = async (auctionId: string) => {
    const winner = winnersByAuction[auctionId];
    
    if (!winner) {
      setUpdateError('No winner to declare for this auction');
      return;
    }
    
    try {
      // Update auction with winner info
      await updateDoc(doc(db, 'auctions', auctionId), {
        winnerDeclared: true,
        winnerId: winner.user.id,
        winnerName: winner.user.name,
        winningBid: winner.bid.amount
      });
      
      // Create notification for winner
      await addDoc(collection(db, 'notifications'), {
        userId: winner.user.id,
        title: 'Auction Won!',
        message: `Congratulations! You've won the auction "${
          completedAuctions.find(a => a.id === auctionId)?.title || 'Auction'
        }" with your bid of $${winner.bid.amount.toFixed(2)}.`,
        type: 'win',
        timestamp: Timestamp.now(),
        auctionId: auctionId,
        read: false
      });
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      
      // Refresh data
      const updatedWinners = { ...winnersByAuction };
      const updatedAuctions = completedAuctions.map(auction => 
        auction.id === auctionId ? { ...auction, winnerDeclared: true } : auction
      );
      
      setWinnersByAuction(updatedWinners);
      setCompletedAuctions(updatedAuctions);
    } catch (error) {
      setUpdateError('Failed to declare winner. Please try again.');
      console.error(error);
    }
  };

  const handleSaveAdminCode = async () => {
    if (!newAdminCode) {
      setUpdateError('Please enter a new admin code');
      return;
    }
    
    try {
      await updateDoc(doc(db, 'adminSettings', 'code'), {
        adminCode: newAdminCode
      });
      
      setAdminCode(newAdminCode);
      setNewAdminCode('');
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      setUpdateError('Failed to update admin code. Please try again.');
      console.error(error);
    }
  };

  const handleCreateAuction = async () => {
    try {
      if (!newAuction.title || !newAuction.description || !newAuction.imageUrl || !newAuction.endDate) {
        setUpdateError('Please fill in all fields');
        return;
      }
      
      const startingBid = parseFloat(newAuction.startingBid.toString());
      if (isNaN(startingBid) || startingBid <= 0) {
        setUpdateError('Please enter a valid starting bid amount');
        return;
      }
      
      const endDate = new Date(newAuction.endDate);
      if (endDate <= new Date()) {
        setUpdateError('End date must be in the future');
        return;
      }
      
      const newAuctionRef = await addDoc(collection(db, 'auctions'), {
        title: newAuction.title,
        description: newAuction.description,
        imageUrl: newAuction.imageUrl,
        startingBid: startingBid,
        currentBid: startingBid,
        bids: [],
        createdAt: Timestamp.now(),
        endDate: Timestamp.fromDate(endDate),
        winnerDeclared: false
      });
      
      // Update auction with its id
      await updateDoc(newAuctionRef, { id: newAuctionRef.id });
      
      // Reset form and state
      setNewAuction({
        title: '',
        description: '',
        imageUrl: '',
        startingBid: 0,
        endDate: ''
      });
      
      setIsCreatingAuction(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      
      // Refresh auctions list
      const newAuctionData = {
        id: newAuctionRef.id,
        title: newAuction.title,
        description: newAuction.description,
        imageUrl: newAuction.imageUrl,
        startingBid: startingBid,
        currentBid: startingBid,
        bids: [],
        createdAt: Timestamp.now(),
        endDate: Timestamp.fromDate(endDate),
        winnerDeclared: false
      } as AuctionItem;
      
      setAuctions([...auctions, newAuctionData]);
    } catch (error) {
      setUpdateError('Failed to create auction. Please try again.');
      console.error(error);
    }
  };

  const handleDeleteAuction = async (auctionId: string) => {
    if (!confirm('Are you sure you want to delete this auction? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'auctions', auctionId));
      
      // Remove from state
      setAuctions(auctions.filter(auction => auction.id !== auctionId));
      setCompletedAuctions(completedAuctions.filter(auction => auction.id !== auctionId));
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      setUpdateError('Failed to delete auction. Please try again.');
      console.error(error);
    }
  };

  const tabs = [
    { id: 'auctions', label: 'Auctions', icon: <ListFilter className="h-5 w-5" /> },
    { id: 'declaration', label: 'Winner Declaration', icon: <Award className="h-5 w-5" /> },
    { id: 'settings', label: 'Admin Settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={() => setIsCreatingAuction(!isCreatingAuction)}
          className="btn btn-primary flex items-center"
        >
          {isCreatingAuction ? (
            <>
              <X className="h-5 w-5 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-5 w-5 mr-2" />
              Create Auction
            </>
          )}
        </button>
      </div>
      
      {updateSuccess && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Operation completed successfully!</p>
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
      
      {isCreatingAuction && (
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Auction</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auction Title
              </label>
              <input
                type="text"
                value={newAuction.title}
                onChange={(e) => setNewAuction({...newAuction, title: e.target.value})}
                className="input"
                placeholder="Enter auction title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Starting Bid ($)
              </label>
              <input
                type="number"
                value={newAuction.startingBid}
                onChange={(e) => setNewAuction({...newAuction, startingBid: parseFloat(e.target.value)})}
                className="input"
                step="0.01"
                min="0.01"
                placeholder="Enter starting bid amount"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={newAuction.imageUrl}
                onChange={(e) => setNewAuction({...newAuction, imageUrl: e.target.value})}
                className="input"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={newAuction.endDate}
                onChange={(e) => setNewAuction({...newAuction, endDate: e.target.value})}
                className="input"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newAuction.description}
                onChange={(e) => setNewAuction({...newAuction, description: e.target.value})}
                className="input"
                rows={3}
                placeholder="Enter auction description"
              ></textarea>
            </div>
            
            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={handleCreateAuction}
                className="btn btn-primary"
              >
                <Upload className="h-5 w-5 mr-2" />
                Create Auction
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow">
        <DashboardTabs tabs={tabs}>
          {/* Auctions Tab */}
          <div>
            <AdminAuctionList />
          </div>
          
          {/* Winner Declaration Tab */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Winner Declaration</h2>
            
            {completedAuctions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No completed auctions</h3>
                <p className="text-gray-500">There are no auctions that have ended yet.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Auction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Highest Bid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Winner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {completedAuctions.map((auction) => {
                      const winner = winnersByAuction[auction.id];
                      return (
                        <tr key={auction.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-md object-cover" src={auction.imageUrl} alt="" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{auction.title}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {auction.endDate.toDate().toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {winner ? (
                              <div className="text-sm font-medium text-primary-600">
                                ${winner.bid.amount.toFixed(2)}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">No bids</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {winner ? (
                              <div className="text-sm text-gray-900">
                                {winner.user.name}
                                <br />
                                <span className="text-xs text-gray-500">{winner.user.email}</span>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">No winner</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {winner && !auction.winnerDeclared ? (
                              <button
                                onClick={() => handleDeclareWinner(auction.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                              >
                                <Award className="h-4 w-4 mr-1" />
                                Declare Winner
                              </button>
                            ) : auction.winnerDeclared ? (
                              <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-green-800 bg-green-100">
                                <Check className="h-4 w-4 mr-1" />
                                Winner Declared
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-800 bg-gray-100">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                No Eligible Winner
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Admin Settings Tab */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Admin Settings</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Admin Code</h3>
              <p className="text-gray-600 mb-4">
                This code is required when registering as an admin. Current admin: <strong>{userProfile?.name}</strong>
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Admin Code
                </label>
                <input
                  type="text"
                  value={adminCode}
                  disabled
                  className="bg-gray-100 input"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Admin Code
                </label>
                <input
                  type="text"
                  value={newAdminCode}
                  onChange={(e) => setNewAdminCode(e.target.value)}
                  className="input"
                  placeholder="Enter new admin code"
                />
              </div>
              
              <button
                onClick={handleSaveAdminCode}
                className="btn btn-primary"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Admin Code
              </button>
            </div>
          </div>
        </DashboardTabs>
      </div>
    </div>
  );
}

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}
 