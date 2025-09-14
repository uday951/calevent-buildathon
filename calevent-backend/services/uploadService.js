import path from 'path';
import fs from 'fs';

// Simple file upload service (can be extended to use cloud storage)
export const uploadToCloudinary = async (file) => {
  try {
    // For now, just return the file path
    // In production, you would upload to Cloudinary or AWS S3
    return file.path;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('File upload failed');
  }
};

// Get file URL helper
export const getFileUrl = (req, filePath) => {
  if (!filePath) return null;
  
  // If it's already a full URL, return as is
  if (filePath.startsWith('http')) {
    return filePath;
  }
  
  // Return local file URL
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
};