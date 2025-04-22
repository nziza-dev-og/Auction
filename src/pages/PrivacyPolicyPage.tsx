import  React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="flex items-center text-primary-600 hover:text-primary-700 mb-8">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to home
      </Link>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="prose max-w-none">
          <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
          <p>Welcome to BidMaster. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">2. Information We Collect</h2>
          <p>We collect several different types of information for various purposes to provide and improve our service to you, including:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Personal identification information (Name, email address, phone number, address)</li>
            <li>Account credentials</li>
            <li>Bidding activity and history</li>
            <li>Payment information</li>
            <li>Usage data and analytics</li>
            <li>Profile pictures and preferences</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">3. How We Use Your Data</h2>
          <p>We use the collected data for various purposes:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To allow you to participate in interactive features of our platform</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information so that we can improve our service</li>
            <li>To monitor the usage of our service</li>
            <li>To detect, prevent and address technical issues</li>
            <li>To process transactions and manage auction activities</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Security</h2>
          <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security. We implement various security measures to maintain the safety of your personal information, including:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Securing all communications with SSL technology</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication procedures</li>
            <li>Encrypted storage of sensitive information</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">5. Data Retention</h2>
          <p>We will retain your personal data only for as long as is necessary for the purposes set out in this privacy policy. We will retain and use your personal data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">6. Your Rights</h2>
          <p>You have the following data protection rights:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>The right to access, update, or delete the information we have on you</li>
            <li>The right of rectification - the right to have your information corrected if it is inaccurate or incomplete</li>
            <li>The right to object to our processing of your personal data</li>
            <li>The right of restriction - the right to request that we restrict the processing of your personal information</li>
            <li>The right to data portability - the right to receive a copy of your personal data in a structured, machine-readable format</li>
            <li>The right to withdraw consent at any time where we relied on your consent to process your personal information</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">7. Cookies</h2>
          <p>We use cookies and similar tracking technologies to track the activity on our service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">8. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">9. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>By email: privacy@bidmaster.com</li>
            <li>By phone: +1 (555) 123-4567</li>
            <li>By mail: 123 Auction St, City, Country</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
 