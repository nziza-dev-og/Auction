import  React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="flex items-center text-primary-600 hover:text-primary-700 mb-8">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to home
      </Link>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Refund Policy</h1>
        
        <div className="prose max-w-none">
          <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
          <p>At BidMaster, we strive to ensure all auction transactions are conducted fairly and transparently. This Refund Policy outlines the circumstances under which refunds may be issued and the process for requesting them.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">2. Winning Bids and Payment Obligations</h2>
          <p>When you place a bid and win an auction, you enter into a legally binding agreement to purchase the item. By participating in our auctions, you agree to:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Pay for items you have won within the specified timeframe</li>
            <li>Complete the transaction as per the terms specified in the auction listing</li>
            <li>Accept the item as described in the auction listing, provided it matches the description</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">3. Circumstances Eligible for Refunds</h2>
          <p>Refunds may be issued in the following situations:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li><strong>Item Significantly Different from Description</strong>: If the item received is significantly different from what was described in the auction listing in terms of condition, authenticity, or key features.</li>
            <li><strong>Item Not Received</strong>: If you have paid for an item but have not received it within the specified timeframe, and the seller is unable to provide proof of shipment or delivery.</li>
            <li><strong>Damaged During Shipping</strong>: If the item was damaged during shipping and was adequately packaged by the seller.</li>
            <li><strong>Auction Cancellation</strong>: If an auction is cancelled by BidMaster or the seller before its scheduled end time due to listing errors, technical issues, or other valid reasons.</li>
            <li><strong>Technical Error</strong>: If a technical error on our platform resulted in an incorrect bid being registered or processed.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">4. Refund Process</h2>
          <p>To request a refund, please follow these steps:</p>
          <ol className="list-decimal pl-6 mt-2 mb-4">
            <li>Contact our customer support team within 7 days of receiving the item or within 14 days of payment if the item was not received.</li>
            <li>Provide your auction number, transaction ID, and a detailed explanation of why you are requesting a refund.</li>
            <li>Include clear photographs of the item received (if applicable) showing any discrepancies or damage.</li>
            <li>Our team will review your request and may request additional information if needed.</li>
            <li>If your refund request is approved, the refund will be processed using the original payment method within 10 business days.</li>
          </ol>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">5. Non-Refundable Situations</h2>
          <p>Refunds will generally not be issued in the following circumstances:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Buyer's remorse or change of mind</li>
            <li>Minor discrepancies in item description that do not significantly affect the value or usability of the item</li>
            <li>Claims made after the refund eligibility period has expired</li>
            <li>Situations where the buyer has not made reasonable efforts to resolve the issue directly with the seller</li>
            <li>Platform fees, service charges, or commission fees (except in cases of auction cancellation by BidMaster)</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">6. Partial Refunds</h2>
          <p>In some cases, we may offer partial refunds if:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>The item has minor discrepancies but is still usable</li>
            <li>The item required repairs or modifications to match the description</li>
            <li>A settlement is reached between buyer and seller as part of our dispute resolution process</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">7. Auction Cancellation Policy</h2>
          <p>In rare circumstances, auctions may be cancelled by BidMaster. When this occurs:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>All bids placed will be invalidated</li>
            <li>Any payments already made will be fully refunded</li>
            <li>Users will be notified of the cancellation and the reason</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">8. Dispute Resolution</h2>
          <p>If you are dissatisfied with our refund decision, you may appeal through our dispute resolution process. The decision reached through this process will be final.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">9. Changes to This Policy</h2>
          <p>We reserve the right to modify this Refund Policy at any time. Changes will be effective when posted on this page with a new "Last Updated" date.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">10. Contact Us</h2>
          <p>If you have any questions about our Refund Policy, please contact us:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>By email: refunds@bidmaster.com</li>
            <li>By phone: +1 (555) 123-4567</li>
            <li>By mail: 123 Auction St, City, Country</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
 