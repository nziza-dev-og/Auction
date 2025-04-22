import  { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = filterActive 
          ? query(collection(db, 'products'), where('isActive', '==', true), orderBy('endDate'))
          : query(collection(db, 'products'), orderBy('endDate', 'desc'));
        
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        setProducts(productsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filterActive]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="mb-12 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Discover and Bid on Exclusive Items
              </h1>
              <p className="mt-4 text-lg text-primary-100">
                Find unique treasures and place your bids in our secure online auction platform.
              </p>
              <div className="mt-8 flex space-x-4">
                <a href="#auctions" className="btn btn-primary bg-white text-primary-700 hover:bg-primary-50">
                  Browse Auctions
                </a>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1484807352052-23338990c6c6?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxhdWN0aW9uJTIwYmlkZGluZyUyMG9ubGluZXxlbnwwfHx8fDE3NDQ2NTU0MzV8MA&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800" 
                alt="Online auction" 
                className="rounded-lg shadow-lg" 
              />
            </div>
          </div>
        </div>
      </section>

      <section id="auctions" className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Featured Auctions</h2>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search auctions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setFilterActive(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filterActive 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterActive(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  !filterActive 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No auctions found. Please try a different search.</p>
          </div>
        )}
      </section>

      <section className="bg-gray-50 rounded-lg p-8 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-primary-100 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create an Account</h3>
              <p className="text-gray-600">Register and set up your profile to start bidding.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-primary-100 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Find Items</h3>
              <p className="text-gray-600">Browse through our collection of exclusive auctions.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-primary-100 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Bid & Win</h3>
              <p className="text-gray-600">Place your bids and track your auctions in real-time.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
 