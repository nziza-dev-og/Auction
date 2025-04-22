import  { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Lock, Save, AlertCircle, Check } from 'lucide-react';

export default function ChangePasswordForm() {
  const { updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setSuccess(false);
    
    // Validate fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await updatePassword(currentPassword, newPassword);
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Show success message
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        setError('New password is too weak. Choose a stronger password');
      } else {
        setError('Failed to update password. Please try again.');
        console.error(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
      
      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Password updated successfully!</p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="pl-10 pr-10 input"
              placeholder="Enter your current password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10 pr-10 input"
              placeholder="Enter new password"
              minLength={6}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters</p>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-10 input"
              placeholder="Confirm new password"
              minLength={6}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex items-center justify-center btn ${
            isSubmitting ? 'bg-primary-400' : 'btn-primary'
          } w-full sm:w-auto`}
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              Updating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Update Password
            </>
          )}
        </button>
      </form>
    </div>
  );
}
 