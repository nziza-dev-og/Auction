import  React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="flex items-center text-primary-600 hover:text-primary-700 mb-8">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to home
      </Link>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        
        <div className="prose max-w-none">
          <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
          <p>Welcome to BidMaster. These Terms of Service govern your use of the BidMaster platform and website. By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">2. Definitions</h2>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li><strong>Platform</strong>: The BidMaster website and services.</li>
            <li><strong>User</strong>: An individual who has registered on the platform.</li>
            <li><strong>Bidder</strong>: A user who places bids on auction items.</li>
            <li><strong>Seller</strong>: A user who lists items for auction.</li>
            <li><strong>Auction</strong>: The process of selling an item to the highest bidder.</li>
            <li><strong>Bid</strong>: An offer to purchase an item at a specified price.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">3. User Accounts</h2>
          <p>To use certain features of the platform, you must register for an account. When you register, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Create only one account per person</li>
            <li>Not share your account with any third party</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Ensure your account information is accurate and up-to-date</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">4. Bidding Rules</h2>
          <p>By placing a bid, you enter into a legally binding contract to purchase the item if you are the winning bidder. You agree to:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Place bids only if you intend to purchase the item</li>
            <li>Not retract bids once placed (except in rare circumstances as permitted by our policies)</li>
            <li>Pay for items won in a timely manner</li>
            <li>Not manipulate the bidding process or use any automated bidding software</li>
            <li>Not engage in shill bidding or any form of bid manipulation</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">5. Auction Items</h2>
          <p>All items listed on the platform must comply with our guidelines. Prohibited items include:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Illegal goods or services</li>
            <li>Counterfeit items or unauthorized replicas</li>
            <li>Hazardous materials</li>
            <li>Items that infringe on intellectual property rights</li>
            <li>Items that promote hate speech or discrimination</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">6. Fees and Payments</h2>
          <p>The platform may charge fees for certain services, including listing fees and commission on successful sales. All fees are clearly displayed before you proceed with the relevant transaction. Payment methods accepted include credit/debit cards and other electronic payment systems as specified on the platform.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">7. Limitation of Liability</h2>
          <p>The platform serves as an intermediary between buyers and sellers. We are not responsible for the quality, safety, legality, or availability of items listed. To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">8. Dispute Resolution</h2>
          <p>Any disputes between users should first be attempted to be resolved through our dispute resolution system. If this fails, disputes shall be resolved through arbitration in accordance with the rules of the American Arbitration Association.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">9. Intellectual Property</h2>
          <p>The platform and its original content, features, and functionality are owned by BidMaster and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">10. Termination</h2>
          <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the service will immediately cease.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">11. Changes to Terms</h2>
          <p>We reserve the right to modify or replace these Terms at any time. By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">12. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>By email: terms@bidmaster.com</li>
            <li>By phone: +1 (555) 123-4567</li>
            <li>By mail: 123 Auction St, City, Country</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
 