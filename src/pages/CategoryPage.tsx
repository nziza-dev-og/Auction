import  { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { AuctionItem, Category } from '../types';
import AuctionCard from '../components/AuctionCard';
import { ArrowLeft, Clock, Filter } from 'lucide-react';

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState(true);

  useEffect(() => {
    async function fetchCategoryAndAuctions() {
      try {
        if (!id) return;
        
        // Fetch category
        const categoryDoc = await getDoc(doc(db, 'categories', id));
        if (!categoryDoc.exists()) {
          console.error("Category not found");
          setLoading(false);
          return;
        }
        
        const categoryData = { id: categoryDoc.id, ...categoryDoc.data() } as Category;
        setCategory(categoryData);
        
        // Fetch auctions in this category
        const now = Timestamp.now();
        let auctionsQuery;
        
        if (filterActive) {
          auctionsQuery = query(
            collection(db, 'auctions'),
            where('categoryId', '==', id),
            where('endDate', '>', now)
          );
        } else {
          auctionsQuery = query(
            collection(db, 'auctions'),
            where('categoryId', '==', id)
          );
        }
        
        const snapshot = await getDocs(auctionsQuery);
        let auctionList = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          bids: doc.data().bids || [] 
        } as AuctionItem));
        
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
        
        setAuctions(auctionList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching category and auctions:", error);
        setLoading(false);
      }
    }

    fetchCategoryAndAuctions();
  }, [id, filterActive]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Category not found</h3>
          <p className="text-gray-500 mb-4">This category doesn't exist or has been removed.</p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="flex items-center text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to all categories
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
          {category.description && (
            <p className="mt-2 text-gray-600">{category.description}</p>
          )}
        </div>
        
        <div className="mt-4 md:mt-0">
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

      {auctions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions in this category</h3>
          <p className="text-gray-500 mb-4">
            {filterActive 
              ? 'There are currently no active auctions in this category. Check back later or view all auctions.' 
              : 'There are no auctions in this category.'}
          </p>
          <Link to="/" className="btn btn-primary">
            Browse Other Categories
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}
 