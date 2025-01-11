import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '6mb', // Slightly larger than max file size to account for base64
    },
  },
};

const validateBase64 = (str) => {
  if (!str?.startsWith('data:image/')) throw new Error('Invalid image format');
  const sizeInMb = (str.length * (3/4)) / 1024 / 1024;
  if (sizeInMb > 5) throw new Error('File too large (max 5MB)');
  return true;
};

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  try {
    // Apply rate limiting
    await new Promise((resolve, reject) => {
      limiter(req, res, (result) => {
        if (result instanceof Error) reject(result);
        resolve(result);
      });
    });

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileStr = req.body.data;
    validateBase64(fileStr);

    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      // Remove upload_preset if using signed uploads
      folder: 'messiahverse',
      allowed_formats: ['jpg', 'png', 'gif', 'webp'],
      max_bytes: 5 * 1024 * 1024, // 5MB
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    res.status(200).json({ 
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id 
    });
  } catch (error) {
    console.error('Upload error details:', {
      message: error.message,
      name: error.name,
      code: error.http_code
    });
    
    const errorMessage = error.message === 'Upload preset not found' 
      ? 'Image upload configuration error' 
      : error.message || 'Image upload failed';
      
    res.status(error.http_code || 500).json({ 
      error: errorMessage
    });
  }
}
