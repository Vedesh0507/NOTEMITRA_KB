import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  fileName: string
): Promise<UploadApiResponse> => {
  const publicId = `${Date.now()}-${fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'notemitra/pdfs',
        public_id: publicId,
        overwrite: true,
        invalidate: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error('Upload returned no result'));
        }
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary by its public ID
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
};

/**
 * Check if Cloudinary is configured
 */
export const isCloudinaryConfigured = (): boolean => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

export { cloudinary };
