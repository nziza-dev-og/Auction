import  { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import DashboardTabs from '../components/DashboardTabs';
import { User, Clock, List, Bell, Edit, Save, X, Check, AlertCircle } from 'lucide-react';
import { AuctionItem, Bid, Notification } from '../types';
import AuctionCard from '../components/AuctionCard';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import ChangePasswordForm from '../components/ChangePasswordForm';

export default function UserDashboardPage() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [userBids, setUserBids] = useState<{bid: Bid, auction: AuctionItem}[]>([]);
  const [bidHistory, setBidHistory] = useState<{bid: Bid, auction: AuctionItem}[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    phoneNumber: '',
    address: '',
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    // Set initial profile data
    if (userProfile) {
      setEditedProfile({
        name: userProfile.name,
        phoneNumber: userProfile.phoneNumber,
        address: userProfile.address,
      });
    }

    // Fetch user bids - Using only where filter without orderBy to avoid composite index
    const fetchUserBids = async () => {
      try {
        const bidsQuery = query(
          collection(db, 'bids'),
          where('userId', '==', currentUser.uid)
        );
        
        const bidsSnapshot = await getDocs(bidsQuery);
        const bidsData = bidsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Bid));

        // Sort manually in memory instead of in query
        bidsData.sort((a, b) => {
          const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
          const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
          return timeB - timeA;
        });
        
        // Fetch auction data for each bid
        const auctionsWithBids = await Promise.all(bidsData.map(async (bid) => {
          try {
            const auctionDoc = await getDocs(
              query(collection(db, 'auctions'), where('id', '==', bid.auctionId))
            );
            
            if (!auctionDoc.empty) {
              const auctionData = { 
                id: auctionDoc.docs[0].id, 
                ...auctionDoc.docs[0].data() 
              } as AuctionItem;
              
              return { bid, auction: auctionData };
            }
          } catch (err) {
            console.error("Error fetching auction:", err);
          }
          return null;
        }));
        
        setUserBids(auctionsWithBids.filter(item => item !== null) as {bid: Bid, auction: AuctionItem}[]);
      } catch (error) {
        console.error("Error fetching user bids:", error);
      }
    };
    
    // Fetch bid history (all bids on auctions user has bid on, excluding user's own bids)
    const fetchBidHistory = async () => {
      try {
        const userBidsQuery = query(
          collection(db, 'bids'),
          where('userId', '==', currentUser.uid)
        );
        
        const userBidsSnapshot = await getDocs(userBidsQuery);
        const auctionIds = [...new Set(userBidsSnapshot.docs.map(doc => doc.data().auctionId))];
        
        const allBidsResults: {bid: Bid, auction: AuctionItem}[] = [];
        
        for (const auctionId of auctionIds) {
          const bidsQuery = query(
            collection(db, 'bids'),
            where('auctionId', '==', auctionId)
          );
          
          const bidsSnapshot = await getDocs(bidsQuery);
          const bidsData = bidsSnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            } as Bid))
            .filter(bid => bid.userId !== currentUser.uid);
          
          // Sort manually
          bidsData.sort((a, b) => {
            const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
            const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
            return timeB - timeA;
          });
          
          if (bidsData.length > 0) {
            try {
              const auctionDoc = await getDocs(
                query(collection(db, 'auctions'), where('id', '==', auctionId))
              );
              
              if (!auctionDoc.empty) {
                const auctionData = { 
                  id: auctionDoc.docs[0].id, 
                  ...auctionDoc.docs[0].data() 
                } as AuctionItem;
                
                bidsData.forEach(bid => {
                  allBidsResults.push({ bid, auction: auctionData });
                });
              }
            } catch (err) {
              console.error("Error fetching auction:", err);
            }
          }
        }
        
        setBidHistory(allBidsResults);
      } catch (error) {
        console.error("Error fetching bid history:", error);
      }
    };
    
    // Fetch notifications - Using only where filter without orderBy
    const fetchNotifications = async () => {
      try {
        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', currentUser.uid)
        );
        
        const notificationsSnapshot = await getDocs(notificationsQuery);
        let notificationsData = notificationsSnapshot.docs.map(doc => {
          const data = doc.data();
          // Ensure timestamp exists, if not, create a default one
          if (!data.timestamp) {
            data.timestamp = Timestamp.now();
          }
          return {
            id: doc.id,
            ...data
          } as Notification;
        });
        
        // Sort notifications manually by timestamp
        notificationsData.sort((a, b) => {
          const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
          const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
          return timeB - timeA;
        });
        
        setNotifications(notificationsData);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchUserBids();
    fetchBidHistory();
    fetchNotifications();
  }, [currentUser, userProfile]);

  const handleSaveProfile = async () => {
    try {
      setUpdateError('');
      setUpdateSuccess(false);
      
      await updateUserProfile(editedProfile);
      
      setIsEditing(false);
      setUpdateSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      setUpdateError('Failed to update profile. Please try again.');
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    if (userProfile) {
      setEditedProfile({
        name: userProfile.name,
        phoneNumber: userProfile.phoneNumber,
        address: userProfile.address,
      });
    }
    setIsEditing(false);
    setUpdateError('');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
    { id: 'your-bids', label: 'Your Bids', icon: <Clock className="h-5 w-5" /> },
    { id: 'bid-history', label: 'Bid History', icon: <List className="h-5 w-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
  ];

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp || !timestamp.toDate) return 'Unknown date';
    try {
      return timestamp.toDate().toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow">
        <DashboardTabs tabs={tabs}>
          {/* Profile Tab */}
          <div>
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-primary-600 hover:text-primary-700"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center text-green-600 hover:text-green-700"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              {updateSuccess && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">Profile updated successfully!</p>
                    </div>
                  </div>
                </div>
              )}
              
              {updateError && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
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
              
              <ProfilePictureUpload />
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={currentUser?.email || ''}
                      disabled
                      className="bg-gray-100 input"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                        className="input"
                      />
                    ) : (
                      <div className="bg-gray-100 input">{userProfile?.name}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedProfile.phoneNumber}
                        onChange={(e) => setEditedProfile({...editedProfile, phoneNumber: e.target.value})}
                        className="input"
                      />
                    ) : (
                      <div className="bg-gray-100 input">{userProfile?.phoneNumber}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editedProfile.address}
                        onChange={(e) => setEditedProfile({...editedProfile, address: e.target.value})}
                        className="input"
                        rows={2}
                      />
                    ) : (
                      <div className="bg-gray-100 input">{userProfile?.address}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <ChangePasswordForm />
            </div>
          </div>
          
          {/* Your Bids Tab */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Your Bids</h2>
            
            {userBids.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">You haven't placed any bids yet</h3>
                <p className="text-gray-500 mb-4">Explore our auctions and start bidding today!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBids.map(({ bid, auction }) => (
                  <div key={bid.id} className="card">
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={auction.imageUrl || 'https://images.unsplash.com/photo-1500627964684-141351970a7f?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBhdWN0aW9uJTIwaXRlbXN8ZW58MHx8fHwxNzQ0NzI0MDEzfDA&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800'} 
                        alt={auction.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm text-gray-500">Your bid on:</p>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {auction.title}
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Your bid:</p>
                          <p className="text-xl font-bold text-primary-600">
                            ${bid.amount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Current highest:</p>
                          <p className="text-xl font-bold text-gray-900">
                            ${auction.currentBid.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mb-4">
                        Bid placed: {formatDate(bid.timestamp)}
                      </div>
                      <a 
                        href={`/auction/${auction.id}`} 
                        className="btn btn-primary text-center w-full"
                      >
                        View Auction
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Bid History Tab */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Bid History</h2>
            
            {bidHistory.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bid history available</h3>
                <p className="text-gray-500">No one has bid on the same auctions as you yet.</p>
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
                        Bidder
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bidHistory.map(({ bid, auction }) => (
                      <tr key={bid.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img 
                                src={auction.imageUrl || 'https://images.unsplash.com/photo-1500627964684-141351970a7f?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBhdWN0aW9uJTIwaXRlbXN8ZW58MHx8fHwxNzQ0NzI0MDEzfDA&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800'} 
                                alt={auction.title}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <a href={`/auction/${auction.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700">
                                {auction.title}
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{bid.userName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-primary-600">${bid.amount.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(bid.timestamp)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Notifications Tab */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Notifications</h2>
            
            {notifications.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">You don't have any notifications yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        notification.type === 'win' 
                          ? 'bg-green-100 text-green-600' 
                          : notification.type === 'outbid' 
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {notification.type === 'win' ? (
                          <Trophy className="h-6 w-6" />
                        ) : notification.type === 'outbid' ? (
                          <AlertCircle className="h-6 w-6" />
                        ) : (
                          <Bell className="h-6 w-6" />
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          {formatDate(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DashboardTabs>
      </div>
    </div>
  );
}

function Trophy(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
  );
}
 