const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   POST /api/upload/image
// @desc    Upload image to Cloudinary
// @access  Private
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'mingleme/posts',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Resize large images
        { quality: 'auto', fetch_format: 'auto' } // Optimize quality and format
      ]
    });

    res.json({
      status: 'success',
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload image'
    });
  }
});

// @route   POST /api/upload/avatar
// @desc    Upload avatar image to Cloudinary
// @access  Private
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No avatar file provided'
      });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary with avatar-specific transformations
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'mingleme/avatars',
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Square crop, face detection
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    // Update user's avatar in database
    const User = require('../models/User');
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Avatar uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          avatar: updatedUser.avatar,
          bio: updatedUser.bio,
          isVerified: updatedUser.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload avatar'
    });
  }
});

// @route   POST /api/upload/cover-photo
// @desc    Upload cover photo to Cloudinary
// @access  Private
router.post('/cover-photo', protect, upload.single('coverPhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No cover photo file provided'
      });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary with cover photo-specific transformations
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'mingleme/cover-photos',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 400, crop: 'fill' }, // Wide crop for cover photos
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    // Update user's cover photo in database
    const User = require('../models/User');
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { coverPhoto: result.secure_url },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Cover photo uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          avatar: updatedUser.avatar,
          coverPhoto: updatedUser.coverPhoto,
          bio: updatedUser.bio,
          isVerified: updatedUser.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Cover photo upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload cover photo'
    });
  }
});

// @route   DELETE /api/upload/avatar
// @desc    Remove user's avatar
// @access  Private
router.delete('/avatar', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // If user has an avatar, delete it from Cloudinary
    if (user.avatar) {
      try {
        // Extract public_id from the URL - handle different URL formats
        let publicId;
        if (user.avatar.includes('cloudinary.com')) {
          // Extract from Cloudinary URL
          const urlParts = user.avatar.split('/');
          const filename = urlParts[urlParts.length - 1];
          const nameWithoutExtension = filename.split('.')[0];
          const folderIndex = urlParts.findIndex(part => part === 'upload') + 1;
          const folder = urlParts.slice(folderIndex, -1).join('/');
          publicId = folder ? `${folder}/${nameWithoutExtension}` : nameWithoutExtension;
        } else {
          // If it's not a Cloudinary URL, skip deletion
          console.log('Not a Cloudinary URL, skipping deletion');
        }
        
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (cloudinaryError) {
        console.error('Error deleting avatar from Cloudinary:', cloudinaryError);
        // Continue even if Cloudinary deletion fails
      }
    }

    // Remove avatar from user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: null },
      { new: true }
    ).select('-password');

    res.json({
      status: 'success',
      message: 'Avatar removed successfully',
      data: {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          avatar: updatedUser.avatar,
          coverPhoto: updatedUser.coverPhoto,
          bio: updatedUser.bio,
          isVerified: updatedUser.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Remove avatar error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove avatar'
    });
  }
});

// @route   DELETE /api/upload/cover-photo
// @desc    Remove user's cover photo
// @access  Private
router.delete('/cover-photo', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // If user has a cover photo, delete it from Cloudinary
    if (user.coverPhoto) {
      try {
        // Extract public_id from the URL - handle different URL formats
        let publicId;
        if (user.coverPhoto.includes('cloudinary.com')) {
          // Extract from Cloudinary URL
          const urlParts = user.coverPhoto.split('/');
          const filename = urlParts[urlParts.length - 1];
          const nameWithoutExtension = filename.split('.')[0];
          const folderIndex = urlParts.findIndex(part => part === 'upload') + 1;
          const folder = urlParts.slice(folderIndex, -1).join('/');
          publicId = folder ? `${folder}/${nameWithoutExtension}` : nameWithoutExtension;
        } else {
          // If it's not a Cloudinary URL, skip deletion
          console.log('Not a Cloudinary URL, skipping deletion');
        }
        
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (cloudinaryError) {
        console.error('Error deleting cover photo from Cloudinary:', cloudinaryError);
        // Continue even if Cloudinary deletion fails
      }
    }

    // Remove cover photo from user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { coverPhoto: null },
      { new: true }
    ).select('-password');

    res.json({
      status: 'success',
      message: 'Cover photo removed successfully',
      data: {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          avatar: updatedUser.avatar,
          coverPhoto: updatedUser.coverPhoto,
          bio: updatedUser.bio,
          isVerified: updatedUser.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Remove cover photo error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove cover photo'
    });
  }
});

// @route   DELETE /api/upload/image/:publicId
// @desc    Delete image from Cloudinary
// @access  Private
router.delete('/image/:publicId', protect, async (req, res) => {
  try {
    const { publicId } = req.params;

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({
        status: 'success',
        message: 'Image deleted successfully'
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Failed to delete image'
      });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete image'
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File size too large. Maximum size is 5MB'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      status: 'error',
      message: 'Only image files are allowed'
    });
  }

  next(error);
});

module.exports = router; 