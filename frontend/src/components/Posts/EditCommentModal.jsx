import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import usePostsStore from '../../store/postsStore';
import toast from 'react-hot-toast';

const EditCommentModal = ({ comment, postId, isOpen, onClose, onCommentUpdated }) => {
  const { editCommentAction, submitting } = usePostsStore();
  
  const [content, setContent] = useState(comment?.content || '');

  // Reset form when comment changes
  React.useEffect(() => {
    if (comment) {
      setContent(comment.content || '');
    }
  }, [comment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Comment content is required');
      return;
    }

    try {
      await editCommentAction(postId, comment._id, content.trim());
      onCommentUpdated();
      onClose();
      toast.success('Comment updated successfully!');
    } catch (error) {
      console.error('Update comment error:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      handleSubmit(e);
    }
  };

  if (!isOpen || !comment) return null;

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
          className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Edit Comment</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
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
                  placeholder="Edit your comment..."
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  rows={3}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {content.length}/1000 characters
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{submitting ? 'Updating...' : 'Update'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditCommentModal;
