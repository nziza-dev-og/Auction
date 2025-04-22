import  { useState, useRef } from 'react';
import { User, Camera, Check, AlertCircle } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePictureUpload() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setUploadError('Image size should be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    setUploadError('');
    setUploadSuccess(false);
    
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user profile in Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        profilePicture: downloadURL
      });
      
      // Update local state
      await updateUserProfile({ profilePicture: downloadURL });
      
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Profile Picture</h3>
      
      <div className="flex items-start">
        <div className="mr-6">
          <div className="relative inline-block">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {userProfile?.profilePicture ? (
                <img 
                  src={userProfile.profilePicture} 
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="absolute bottom-0 right-0 bg-primary-600 text-white p-1.5 rounded-full shadow-sm hover:bg-primary-700"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/jpeg, image/png, image/gif, image/webp"
          />
        </div>
        
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">
            Upload a profile picture to personalize your account. Recommended size: 400x400 pixels.
          </p>
          
          {isUploading && (
            <div className="flex items-center text-primary-600 text-sm">
              <div className="mr-2 h-4 w-4 border-t-2 border-primary-600 rounded-full animate-spin"></div>
              Uploading your image...
            </div>
          )}
          
          {uploadSuccess && (
            <div className="flex items-center text-green-600 text-sm">
              <Check className="h-4 w-4 mr-1" />
              Profile picture updated successfully!
            </div>
          )}
          
          {uploadError && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {uploadError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 