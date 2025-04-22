import  { useState } from 'react';
import { Lock } from 'lucide-react';
import { formatCreditCardNumber } from '../services/paymentService';

interface CreditCardFormProps {
  cardNumber: string;
  setCardNumber: (value: string) => void;
  expiryDate: string;
  setExpiryDate: (value: string) => void;
  cvv: string;
  setCvv: (value: string) => void;
  cardholderName: string;
  setCardholderName: (value: string) => void;
}

export default function CreditCardForm({
  cardNumber,
  setCardNumber,
  expiryDate,
  setExpiryDate,
  cvv,
  setCvv,
  cardholderName,
  setCardholderName
}: CreditCardFormProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCardNumber(formatCreditCardNumber(value));
  };
  
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    setExpiryDate(value);
  };
  
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCvv(value.slice(0, 4));
  };
  
  return (
    <div className="space-y-3">
      <div className={`relative border rounded-md ${isFocused ? 'ring-2 ring-primary-500 border-transparent' : 'border-gray-300'}`}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <input 
          type="text" 
          placeholder="1234 5678 9012 3456" 
          className="pl-10 input border-0 focus:ring-0"
          value={cardNumber}
          onChange={handleCardNumberChange}
          maxLength={19}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
          <input 
            type="text" 
            placeholder="MM/YY" 
            className="input"
            value={expiryDate}
            onChange={handleExpiryDateChange}
            maxLength={5}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CVC</label>
          <input 
            type="text" 
            placeholder="123" 
            className="input"
            value={cvv}
            onChange={handleCvvChange}
            maxLength={4}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Cardholder Name</label>
        <input 
          type="text" 
          placeholder="John Doe" 
          className="input"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
        />
      </div>
      <div className="pt-2">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <img src="https://cdn.jsdelivr.net/gh/igorescobar/jQuery-Mask-Plugin@master/img/flags/visa.png" alt="Visa" className="h-6" />
            <img src="https://cdn.jsdelivr.net/gh/igorescobar/jQuery-Mask-Plugin@master/img/flags/mastercard.png" alt="Mastercard" className="h-6" />
            <img src="https://cdn.jsdelivr.net/gh/igorescobar/jQuery-Mask-Plugin@master/img/flags/amex.png" alt="Amex" className="h-6" />
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Lock className="h-3 w-3 mr-1" />
            Secure payment
          </div>
        </div>
      </div>
    </div>
  );
}
 