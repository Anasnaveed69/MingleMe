import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, 
  X, 
  Hash, 
  Send,
  Loader2
} from 'lucide-react';
import usePostsStore from '../../store/postsStore';
import toast from 'react-hot-toast';

const EditPostModal = ({ post, isOpen, onClose, onPostUpdated }) => {
  const { updateExistingPost, uploadImageAction, uploading, submitting } = usePostsStore();
  
  const [content, setContent] = useState(post?.content || '');
  const [images, setImages] = useState(post?.images || []);
  const [tags, setTags] = useState(post?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const fileInputRef = useRef(null);

  // Reset form when post changes
  React.useEffect(() => {
    if (post) {
      setContent(post.content || '');
      setImages(post.images || []);
      setTags(post.tags || []);
    }
  }, [post]);

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
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags(prev => [...prev, tag]);
      setTagInput('');
      setShowTagInput(false);
    } else if (tags.includes(tag)) {
      toast.error('Tag already exists');
    } else if (tags.length >= 5) {
      toast.error('Maximum 5 tags allowed');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Post content is required');
      return;
    }

    try {
      const postData = {
        content: content.trim(),
        images: images.map(img => {
          // Ensure we have the correct format for the backend
          if (typeof img === 'string') {
            // If it's just a URL string, create object with url and publicId
            return { url: img, publicId: img.split('/').pop().split('.')[0] };
          } else if (img.url) {
            // If it has a url property, use it with publicId
            return { 
              url: img.url, 
              publicId: img.publicId || img.url.split('/').pop().split('.')[0] 
            };
          }
          // Fallback - return as is if it's already in correct format
          return img;
        }),
        tags
      };

      await updateExistingPost(post._id, postData);
      onPostUpdated();
      onClose();
      toast.success('Post updated successfully!');
    } catch (error) {
      console.error('Update post error:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      handleSubmit(e);
    }
  };

  if (!isOpen || !post) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Edit Post</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4">
            <div className="space-y-4">
              {/* Content */}
              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="What's on your mind?"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={2000}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-slate-500">
                    {content.length}/2000 characters
                  </span>
                </div>
              </div>

              {/* Images */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url || image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Image Upload */}
              {images.length < 4 && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(Array.from(e.target.files))}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                    <span>{uploading ? 'Uploading...' : 'Add Images'}</span>
                  </button>
                </div>
              )}

              {/* Tags */}
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center space-x-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-indigo-500 hover:text-indigo-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {tags.length < 5 && (
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowTagInput(true)}
                      className="flex items-center space-x-2 px-3 py-1 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Hash className="w-3 h-3" />
                      <span>Add Tag</span>
                    </button>
                    {showTagInput && (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                          placeholder="Enter tag"
                          className="px-3 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          maxLength={20}
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowTagInput(false);
                            setTagInput('');
                          }}
                          className="px-3 py-1 text-slate-600 hover:text-slate-800 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{submitting ? 'Updating...' : 'Update Post'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditPostModal; 