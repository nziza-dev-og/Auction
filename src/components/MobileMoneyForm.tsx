import  { Smartphone } from 'lucide-react';

interface MobileMoneyFormProps {
  mobileNumber: string;
  setMobileNumber: (value: string) => void;
  mobileProvider: string;
  setMobileProvider: (value: string) => void;
}

export default function MobileMoneyForm({
  mobileNumber,
  setMobileNumber,
  mobileProvider,
  setMobileProvider
}: MobileMoneyFormProps) {
  const providers = [
    { id: 'mpesa', name: 'M-Pesa' },
    { id: 'airtelMoney', name: 'Airtel Money' },
    { id: 'orangeMoney', name: 'Orange Money' },
    { id: 'mtn', name: 'MTN Mobile Money' },
  ];
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Smartphone className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="tel" 
            placeholder="+1 (555) 123-4567" 
            className="pl-10 input"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Mobile Money Provider</label>
        <select
          className="input"
          value={mobileProvider}
          onChange={(e) => setMobileProvider(e.target.value)}
        >
          {providers.map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center pt-2">
        <img 
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxwYXltZW50JTIwcHJvY2Vzc2luZyUyMGZpbmFuY2V8ZW58MHx8fHwxNzQ1MDg2NDY0fDA&ixlib=rb-4.0.3&fit=fillmax&h=400&w=600" 
          alt="Mobile Money" 
          className="h-10 w-10 rounded-full object-cover mr-3"
        />
        <p className="text-xs text-gray-500">
          We'll send a payment request to your mobile money account. Please ensure your mobile number is registered with your mobile money provider.
        </p>
      </div>
    </div>
  );
}
 