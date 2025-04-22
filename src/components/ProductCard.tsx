import  { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const endDate = new Date(product.endDate);
  const isExpired = endDate < new Date();
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="h-48 overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4">
        <Link to={`/auction/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">{product.name}</h3>
        </Link>
        
        <div className="mt-2 flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Bid</p>
            <p className="text-lg font-bold text-primary-600">${product.currentPrice.toLocaleString()}</p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500 flex items-center justify-end">
              <Clock className="h-4 w-4 mr-1" />
              {isExpired ? 'Ended' : 'Ends in'}
            </p>
            <p className={`text-sm font-medium ${isExpired ? 'text-red-500' : 'text-gray-700'}`}>
              {isExpired 
                ? 'Auction ended' 
                : new Date(product.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <Link 
            to={`/auction/${product.id}`} 
            className="block w-full text-center py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50"
          >
            {isExpired ? 'View Results' : 'Place Bid'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
 