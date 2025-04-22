import  { CreditCard, Smartphone, Clock } from 'lucide-react';
import { PaymentMethod } from '../types';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
}

export default function PaymentMethodCard({ method, selected, onSelect, children }: PaymentMethodCardProps) {
  return (
    <div 
      className={`border rounded-lg overflow-hidden cursor-pointer transition-colors ${
        selected 
          ? 'border-primary-500 bg-primary-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex p-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
            {method.imageUrl ? (
              <img 
                src={method.imageUrl} 
                alt={method.name} 
                className="h-full w-full object-cover"
              />
            ) : method.type === 'creditCard' ? (
              <CreditCard className="h-6 w-6 text-gray-500" />
            ) : method.type === 'mobileMoney' ? (
              <Smartphone className="h-6 w-6 text-gray-500" />
            ) : (
              <div className="h-6 w-6 text-gray-500">$</div>
            )}
          </div>
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between">
            <h3 className="text-sm font-medium text-gray-900">{method.name}</h3>
            <div className="flex items-center">
              <input
                type="radio"
                checked={selected}
                onChange={onSelect}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">{method.description}</p>
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span>Processing: {method.processingTime}</span>
            {method.fees && (
              <>
                <span className="mx-1">•</span>
                <span>Fees: {method.fees}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {selected && children && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}
 