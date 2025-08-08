import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Image as ImageIcon, 
  X, 
  Hash, 
  Send,
  Loader2
} from 'lucide-react';
import usePostsStore from '../../store/postsStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const CreatePost = ({ onPostCreated, onClose, position = 'center' }) => {
  const { user } = useAuthStore();
  const { createNewPost, uploadImageAction, uploading, submitting } = usePostsStore();
  
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (files) => {
    const maxImages = 4;
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (images.length + files.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload only JPEG, PNG, GIF, or WebP images');
        continue;
      }

      if (file.size > maxFileSize) {
        toast.error('Image size must be less than 5MB');
        continue;
      }

      try {
        const uploadedImage = await uploadImageAction(file);
        setImages(prev => [...prev, uploadedImage]);
        toast.success('Image uploaded successfully!');
      } catch (error) {
        toast.error('Failed to upload image');
      }
    }

    // Clear the file input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags(prev => [...prev, tag]);
      setTagInput('');
      setShowTagInput(false);
    } else if (tags.length >= 10) {
      toast.error('You can only add up to 10 tags');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Please write something to post');
      return;
    }

    if (!user) {
      toast.error('Please login to create a post');
      return;
    }

    try {
      const postData = {
        content: content.trim(),
        images: images,
        tags: tags
      };

      await createNewPost(postData);
      
      // Reset form
      setContent('');
      setImages([]);
      setTags([]);
      setTagInput('');
      setShowTagInput(false);
      
      // Callback to parent component
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Create post error:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const extractTags = (text) => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    if (matches) {
      const newTags = matches.map(tag => tag.slice(1).toLowerCase());
      setTags(prev => {
        const combined = [...new Set([...prev, ...newTags])];
        return combined.slice(0, 10); // Limit to 10 tags
      });
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    extractTags(newContent);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      style={{ alignItems: position === 'center' ? 'center' : 'flex-start', paddingTop: position === 'center' ? '0' : '2rem' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-700 p-6 max-w-lg w-full mx-4 relative"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          aria-label="Close create post modal"
        >
          <X className="w-6 h-6" />
        </button>

        <form onSubmit={handleSubmit}>
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.firstName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold">
                  {user?.firstName?.[0]}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-slate-400">@{user?.username}</p>
            </div>
          </div>

          {/* Content Input */}
          <div className="mb-4">
            <textarea
              value={content}
              onChange={handleContentChange}
              onKeyPress={handleKeyPress}
              placeholder="What's on your mind?"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              rows={3}
              maxLength={2000}
              disabled={submitting}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-500">
                {content.length}/2000 characters
              </span>
              {content.length > 1800 && (
                <span className="text-xs text-orange-500">
                  {2000 - content.length} characters left
                </span>
              )}
            </div>
          </div>

          {/* Images Preview */}
          {images.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full flex items-center space-x-1"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-indigo-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tag Input */}
          {showTagInput && (
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowTagInput(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Image Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 4 || uploading || submitting}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                <span className="text-sm">Add Photos</span>
              </button>

              {/* Add Tags */}
              <button
                type="button"
                onClick={() => setShowTagInput(!showTagInput)}
                disabled={tags.length >= 10 || submitting}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Hash className="w-4 h-4" />
                <span className="text-sm">Add Tags</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 text-white rounded-lg font-medium hover:from-indigo-700 hover:via-purple-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{submitting ? 'Posting...' : 'Post'}</span>
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleImageUpload(Array.from(e.target.files))}
            className="hidden"
          />
        </form>
      </motion.div>
    </div>
  );
};

export default CreatePost;
