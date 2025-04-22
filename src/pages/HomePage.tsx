import  { useState, useEffect } from 'react';
import { collection, query, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { AuctionItem, Category } from '../types';
import { Link } from 'react-router-dom';
import AuctionCard from '../components/AuctionCard';
import CategoryFilter from '../components/CategoryFilter';
import { Search, Filter, Users, Star } from 'lucide-react';

export default function HomePage() {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterActive, setFilterActive] = useState(true);
  const [featuredItems, setFeaturedItems] = useState<AuctionItem[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const categoriesQuery = query(collection(db, 'categories'));
        const snapshot = await getDocs(categoriesQuery);
        const categoryList = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Category));
        
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

    async function fetchAuctions() {
      try {
        const now = Timestamp.now();
        
        let auctionsQuery;
        
        if (filterActive) {
          auctionsQuery = query(
            collection(db, 'auctions'),
            where('endDate', '>', now)
          );
        } else {
          auctionsQuery = query(
            collection(db, 'auctions')
          );
        }
        
        const snapshot = await getDocs(auctionsQuery);
        let auctionList = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          bids: doc.data().bids || [] 
        } as AuctionItem));
        
        // Apply category filter if selected
        if (selectedCategory !== 'all') {
          auctionList = auctionList.filter(auction => auction.categoryId === selectedCategory);
        }
        
        // Filter active auctions (where current time is between start and end dates)
        if (filterActive) {
          auctionList = auctionList.filter(auction => {
            const startTime = auction.startDate?.toDate?.() || new Date(0);
            const endTime = auction.endDate?.toDate?.() || new Date();
            const currentTime = now.toDate();
            return currentTime >= startTime && currentTime <= endTime;
          });
        }
        
        // Sort manually by endDate ascending
        auctionList.sort((a, b) => {
          if (!a.endDate || !b.endDate) return 0;
          return a.endDate.toMillis() - b.endDate.toMillis();
        });
        
        // Select a few for featured items
        const featured = [...auctionList]
          .filter(auction => {
            const startTime = auction.startDate?.toDate?.() || new Date(0);
            const endTime = auction.endDate?.toDate?.() || new Date();
            const currentTime = now.toDate();
            return currentTime >= startTime && currentTime <= endTime;
          })
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        
        setFeaturedItems(featured);
        setAuctions(auctionList);
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
    fetchAuctions();
  }, [filterActive, selectedCategory]);

  const filteredAuctions = auctions.filter(auction => 
    auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-primary-700 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-primary-700 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                  <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                    <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                      <span className="block">Bid, Win, Enjoy</span>
                      <span className="block text-secondary-400">Premium Auction Platform</span>
                    </h1>
                    <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                      Discover exclusive items, place competitive bids, and win amazing products from the comfort of your home.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxhdWN0aW9uJTIwYmlkZGluZyUyMG9ubGluZXxlbnwwfHx8fDE3NDQ2NTU0MzV8MA&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800"
            alt="Online auction"
          />
        </div>
      </div>
      
      {/* Categories Section */}
      <div className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto pb-2 space-x-4 hide-scrollbar">
            <CategoryFilter 
              categories={categories} 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </div>
      </div>
      
      {/* Featured Items Section */}
      {featuredItems.length > 0 && (
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Featured Luxury Items
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                Exclusive auctions ending soon. Don't miss your chance!
              </p>
            </div>
            
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {featuredItems.map((item) => (
                <div key={item.id} className="bg-white overflow-hidden shadow-lg rounded-lg">
                  <div className="relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                    <p className="mt-2 text-gray-500 line-clamp-2">{item.description}</p>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Current Bid</p>
                        <p className="text-xl font-semibold text-primary-600">${item.currentBid.toFixed(2)}</p>
                      </div>
                      
                      <a 
                        href={`/auction/${item.id}`} 
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                      >
                        Place Bid
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
            Available Auctions
          </h2>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search auctions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 w-full md:w-64"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <button
              onClick={() => setFilterActive(!filterActive)}
              className={`flex items-center px-4 py-2 rounded-md ${
                filterActive 
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Filter className="h-5 w-5 mr-2" />
              {filterActive ? 'Active Auctions' : 'All Auctions'}
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredAuctions.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        )}
      </div>
      
      {/* Featured Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Why Choose BidMaster?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              The premier online auction platform for exclusive items.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-md bg-primary-100 text-primary-600 mb-4">
                <ShieldIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Secure Bidding</h3>
              <p className="text-gray-500 text-center">
                Our platform ensures your bids are secure and your information is protected.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-md bg-primary-100 text-primary-600 mb-4">
                <StarComponent className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Exclusive Items</h3>
              <p className="text-gray-500 text-center">
                Access to rare and premium items you won't find elsewhere.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-md bg-primary-100 text-primary-600 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Community</h3>
              <p className="text-gray-500 text-center">
                Join thousands of auction enthusiasts in our growing community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  );
}

function StarComponent(props: React.SVGProps<SVGSVGElement>) {
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );
}
 