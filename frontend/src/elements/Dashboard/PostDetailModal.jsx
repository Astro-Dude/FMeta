import { useState, useEffect, useRef } from 'react';
import api from '../../config/api';

function PostDetailModal({ post, onClose, user, onPostUpdate }) {
  const [postData, setPostData] = useState(post);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [loading, setLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const commentInputRef = useRef(null);
  const menuRef = useRef(null);

  // Get all images from the post
  const allImages = postData.media && postData.media.length > 0 
    ? postData.media.map(m => m.url) 
    : postData.imageUrl 
    ? [postData.imageUrl] 
    : [];

  // Debug: Log post data to see what we're receiving
  useEffect(() => {
    console.log('PostDetailModal - Post data:', post);
    console.log('PostDetailModal - imageUrl:', post.imageUrl);
    console.log('PostDetailModal - media:', post.media);
    console.log('PostDetailModal - All images:', allImages);
  }, [post]);

  // Navigate to next image
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  // Navigate to previous image
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Load comments when modal opens (only once)
  useEffect(() => {
    // Handle comments from the post object
    if (post.comments && Array.isArray(post.comments)) {
      // If comments is an array of comment objects
      setComments(post.comments);
    } else if (post.comments && typeof post.comments === 'object') {
      // If comments is an object, convert to array
      setComments(Object.values(post.comments));
    } else {
      // No comments
      setComments([]);
    }
  }, [post._id]); // Only re-run if the post ID changes

  // Handle like/unlike
  const handleLike = async () => {
    try {
      const newIsLiked = !isLiked;
      const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1;
      
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);
      
      const response = await api.post(`/api/content/${post._id}/like`);
      
      if (response.data.success && onPostUpdate) {
        // Notify parent component of the update
        onPostUpdate({
          ...post,
          isLikedByCurrentUser: newIsLiked,
          likesCount: newLikesCount
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert on error
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentText = newComment.trim();
    setSubmittingComment(true);
    
    // Optimistically add comment to UI immediately
    const optimisticComment = {
      _id: `temp-${Date.now()}`,
      text: commentText,
      author: {
        _id: user._id,
        username: user.username,
        name: user.name
      },
      createdAt: new Date().toISOString()
    };
    
    setComments(prevComments => {
      const updated = [...prevComments, optimisticComment];
      console.log('Added comment, new count:', updated.length);
      return updated;
    });
    setNewComment('');
    
    const newCommentsCount = (postData.commentsCount || 0) + 1;
    setPostData(prev => ({
      ...prev,
      commentsCount: newCommentsCount
    }));
    
    try {
      const response = await api.post(`/api/content/${post._id}/comment`, {
        text: commentText
      });

      if (response.data.success) {
        // Replace optimistic comment with real data from server
        const serverComment = response.data.comment || response.data;
        setComments(prevComments => 
          prevComments.map(c => 
            c._id === optimisticComment._id ? { ...optimisticComment, _id: serverComment._id || optimisticComment._id } : c
          )
        );
        
        // Notify parent component
        if (onPostUpdate) {
          onPostUpdate({
            ...post,
            commentsCount: newCommentsCount
          });
        }
      } else {
        // Revert optimistic update on failure
        setComments(prevComments => prevComments.filter(c => c._id !== optimisticComment._id));
        setPostData(prev => ({
          ...prev,
          commentsCount: prev.commentsCount - 1
        }));
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      // Revert optimistic update on error
      setComments(prevComments => prevComments.filter(c => c._id !== optimisticComment._id));
      setPostData(prev => ({
        ...prev,
        commentsCount: prev.commentsCount - 1
      }));
    } finally {
      setSubmittingComment(false);
    }
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Handle delete post
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await api.delete(`/api/content/${post._id}`);
      
      if (response.data.success) {
        // Notify parent to remove post from list
        if (onPostUpdate) {
          onPostUpdate({ ...post, deleted: true });
        }
        // Close modal
        onClose();
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center sm:p-4"
      onClick={(e) => {
        // Close if clicking the backdrop
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-7xl h-full sm:h-[95vh] bg-black sm:rounded-lg overflow-hidden flex flex-col sm:flex-row">

        {/* Mobile Layout - Full Screen */}
        <div className="flex sm:hidden flex-col h-full w-full">
          {/* Post Header - Above Image (Mobile Only) */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626] bg-black flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-sm font-bold text-white">
                  {postData.author.name?.charAt(0)?.toUpperCase() || postData.author.username?.charAt(0)?.toUpperCase()}
                </div>
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{postData.author.username}</div>
                {postData.location && (
                  <div className="text-gray-400 text-xs">{postData.location}</div>
                )}
              </div>
            </div>
            
            {/* Menu and Close buttons - Mobile */}
            <div className="flex items-center gap-3">
              {/* Menu Button */}
              <div className="relative flex items-center" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-white hover:text-gray-300 transition-colors flex items-center cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 top-8 w-56 bg-[#262626] rounded-lg shadow-lg overflow-hidden z-50">
                    {String(postData.author._id) === String(user._id) && (
                      <button
                        onClick={handleDeletePost}
                        disabled={deleting}
                        className="w-full px-4 py-3 text-left text-red-500 hover:bg-[#363636] transition-colors font-semibold text-sm disabled:opacity-50"
                      >
                        {deleting ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + '/post/' + post._id);
                        setShowMenu(false);
                        alert('Link copied to clipboard!');
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-[#363636] transition-colors text-sm"
                    >
                      Copy link
                    </button>
                    
                    {String(postData.author._id) !== String(user._id) && (
                      <>
                        <button
                          onClick={() => setShowMenu(false)}
                          className="w-full px-4 py-3 text-left text-white hover:bg-[#363636] transition-colors text-sm"
                        >
                          Report
                        </button>
                        <button
                          onClick={() => setShowMenu(false)}
                          className="w-full px-4 py-3 text-left text-white hover:bg-[#363636] transition-colors text-sm"
                        >
                          Unfollow
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => setShowMenu(false)}
                      className="w-full px-4 py-3 text-left text-white hover:bg-[#363636] transition-colors text-sm border-t border-[#363636]"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Image Container - 1:1 Ratio (Mobile) */}
          <div className="w-full aspect-square bg-black flex items-center justify-center relative flex-shrink-0">
            {allImages.length > 0 ? (
              <>
                {/* Current Image */}
                <img
                  src={allImages[currentImageIndex].startsWith('data:') || allImages[currentImageIndex].startsWith('http://') || allImages[currentImageIndex].startsWith('https://') 
                    ? allImages[currentImageIndex]
                    : `https://picsum.photos/800/800?random=${postData._id}-${currentImageIndex}`}
                  alt={`Post image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load image:', allImages[currentImageIndex]);
                    e.target.src = `https://picsum.photos/800/800?random=${postData._id}-${currentImageIndex}`;
                    e.target.onerror = null;
                  }}
                />

                {/* Previous Button */}
                {allImages.length > 1 && currentImageIndex > 0 && (
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Next Button */}
                {allImages.length > 1 && currentImageIndex < allImages.length - 1 && (
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

                {/* Image Indicators (dots) */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-white w-2 h-2' 
                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-400 text-center p-8">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">No media available</p>
                <p className="text-xs text-gray-500 mt-2">This post doesn't have any images</p>
              </div>
            )}
          </div>

          {/* Mobile Actions and Comments Section */}
          <div className="flex-1 overflow-y-auto bg-black">
            {/* Action Buttons */}
            <div className="flex justify-between items-center px-3 py-2 border-b border-[#262626]">
              <div className="flex space-x-4">
                <button 
                  onClick={handleLike}
                  className={`hover:opacity-70 transition-opacity ${isLiked ? 'text-red-500' : 'text-white'}`}
                >
                  <svg className="w-7 h-7" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button 
                  onClick={() => commentInputRef.current?.focus()}
                  className="text-white hover:opacity-70 transition-opacity"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <button className="text-white hover:opacity-70 transition-opacity">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <button className="text-white hover:opacity-70 transition-opacity">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>

            {/* Likes Count */}
            <div className="px-4 py-2">
              <span className="text-white font-semibold text-sm">
                {likesCount || 0} {likesCount === 1 ? 'like' : 'likes'}
              </span>
            </div>

            {/* Comments */}
            <div className="px-4 pb-4 space-y-4">
              {/* Caption as first comment */}
              {postData.content && (
                <div className="text-sm">
                  <span className="text-white font-semibold mr-2">{postData.author.username}</span>
                  <span className="text-white">{postData.content}</span>
                  <div className="text-gray-400 text-xs mt-1">
                    {formatTimeAgo(postData.createdAt)}
                  </div>
                </div>
              )}

              {/* Comments */}
              {comments.length > 0 && comments.map((comment) => (
                <div key={comment._id} className="text-sm">
                  <span className="text-white font-semibold mr-2">{comment.author.username}</span>
                  <span className="text-white">{comment.text}</span>
                  <div className="text-gray-400 text-xs mt-1">
                    {formatTimeAgo(comment.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comment Input (Mobile) */}
          <form onSubmit={handleCommentSubmit} className="flex items-center px-4 py-3 border-t border-[#262626] bg-black flex-shrink-0">
            <input
              ref={commentInputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-400"
              disabled={submittingComment}
            />
            {newComment.trim() && (
              <button
                type="submit"
                disabled={submittingComment}
                className="text-blue-500 font-semibold text-sm hover:text-blue-400 disabled:opacity-50 ml-3"
              >
                {submittingComment ? 'Posting...' : 'Post'}
              </button>
            )}
          </form>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex sm:flex-1 bg-black items-center justify-center relative">
          {allImages.length > 0 ? (
            <>
              {/* Current Image - 1:1 Ratio (Desktop) */}
              <div className="w-full aspect-square flex items-center justify-center relative">
                <img
                  src={allImages[currentImageIndex].startsWith('data:') || allImages[currentImageIndex].startsWith('http://') || allImages[currentImageIndex].startsWith('https://') 
                    ? allImages[currentImageIndex]
                    : `https://picsum.photos/800/800?random=${postData._id}-${currentImageIndex}`}
                  alt={`Post image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load image:', allImages[currentImageIndex]);
                    e.target.src = `https://picsum.photos/800/800?random=${postData._id}-${currentImageIndex}`;
                    e.target.onerror = null;
                  }}
                />

                {/* Previous Button */}
                {allImages.length > 1 && currentImageIndex > 0 && (
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Next Button */}
                {allImages.length > 1 && currentImageIndex < allImages.length - 1 && (
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

                {/* Image Indicators (dots) */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-white w-2 h-2' 
                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-center p-8">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">No media available</p>
              <p className="text-xs text-gray-500 mt-2">This post doesn't have any images</p>
            </div>
          )}
        </div>

        {/* Post details - Right side on desktop only */}
        <div className="hidden sm:flex sm:w-[500px] lg:w-[500px] bg-black border-l border-[#262626] flex-col h-full relative">
          {/* Menu and Close Buttons - Top right corner (Desktop) */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
            {/* Menu Button */}
            <div className="relative flex items-center" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="text-white hover:text-gray-300 transition-colors flex items-center cursor-pointer"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-8 w-56 bg-[#262626] rounded-lg shadow-lg overflow-hidden z-50">
                {/* Show delete option only if it's the user's own post */}
                {String(postData.author._id) === String(user._id) && (
                  <button
                    onClick={handleDeletePost}
                    disabled={deleting}
                    className="w-full px-4 py-3 text-left text-red-500 hover:bg-[#363636] transition-colors font-semibold text-sm disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                )}
                
                {/* Common options for all users */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + '/post/' + post._id);
                    setShowMenu(false);
                    alert('Link copied to clipboard!');
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-[#363636] transition-colors text-sm"
                >
                  Copy link
                </button>
                
                {String(postData.author._id) !== String(user._id) && (
                  <>
                    <button
                      onClick={() => setShowMenu(false)}
                      className="w-full px-4 py-3 text-left text-white hover:bg-[#363636] transition-colors text-sm"
                    >
                      Report
                    </button>
                    <button
                      onClick={() => setShowMenu(false)}
                      className="w-full px-4 py-3 text-left text-white hover:bg-[#363636] transition-colors text-sm"
                    >
                      Unfollow
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-3 text-left text-white hover:bg-[#363636] transition-colors text-sm border-t border-[#363636]"
                >
                  Cancel
                </button>
              </div>
            )}
            </div>

            {/* Close Button (Desktop) */}
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Post Header (Desktop Only) */}
          <div className="hidden sm:flex items-center justify-between px-4 py-3 border-b border-[#262626]">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-sm font-bold text-white">
                  {postData.author.name?.charAt(0)?.toUpperCase() || postData.author.username?.charAt(0)?.toUpperCase()}
                </div>
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{postData.author.username}</div>
                {postData.location && (
                  <div className="text-gray-400 text-xs">{postData.location}</div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-hide">
            {/* Caption as first comment */}
            {postData.content && (
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-sm font-bold text-white">
                    {postData.author.name?.charAt(0)?.toUpperCase() || postData.author.username?.charAt(0)?.toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="text-white font-semibold mr-2">{postData.author.username}</span>
                    <span className="text-white">{postData.content}</span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {formatTimeAgo(postData.createdAt)}
                  </div>
                </div>
              </div>
            )}

            {/* Hashtags */}
            {postData.hashtags && postData.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {postData.hashtags.map((hashtag, index) => (
                  <span key={index} className="text-blue-400 text-sm">#{hashtag}</span>
                ))}
              </div>
            )}

            {/* Comments */}
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-0.5 flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-sm font-bold text-white">
                      {comment.author.name?.charAt(0)?.toUpperCase() || comment.author.username?.charAt(0)?.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="text-white font-semibold mr-2">{comment.author.username}</span>
                      <span className="text-white">{comment.text}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-gray-400 text-xs">{formatTimeAgo(comment.createdAt)}</span>
                      {comment.likes && comment.likes.length > 0 && (
                        <span className="text-gray-400 text-xs">{comment.likes.length} likes</span>
                      )}
                      <button className="text-gray-400 text-xs font-semibold hover:text-white">Reply</button>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No comments yet</p>
                <p className="text-gray-500 text-xs mt-1">Be the first to comment</p>
              </div>
            )}
          </div>

          {/* Actions and Comment Input - Fixed at bottom */}
          <div className="border-t border-[#262626] bg-black">
            {/* Action Buttons */}
            <div className="flex justify-between items-center px-3 py-2">
              <div className="flex space-x-4">
                <button 
                  onClick={handleLike}
                  className={`hover:opacity-70 transition-opacity ${isLiked ? 'text-red-500' : 'text-white'}`}
                >
                  <svg className="w-7 h-7" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button 
                  onClick={() => commentInputRef.current?.focus()}
                  className="text-white hover:opacity-70 transition-opacity"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <button className="text-white hover:opacity-70 transition-opacity">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <button className="text-white hover:opacity-70 transition-opacity">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>

            {/* Likes Count */}
            <div className="px-4 pb-1">
              <span className="text-white font-semibold text-sm">
                {likesCount || 0} {likesCount === 1 ? 'like' : 'likes'}
              </span>
            </div>

            {/* Time */}
            <div className="px-4 pb-3">
              <span className="text-gray-400 text-xs">{formatTimeAgo(postData.createdAt)} ago</span>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex items-center px-4 py-3 border-t border-[#262626]">
              <button type="button" className="text-white hover:text-gray-300 mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <input
                ref={commentInputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-400"
                disabled={submittingComment}
              />
              {newComment.trim() && (
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="text-blue-500 font-semibold text-sm hover:text-blue-400 disabled:opacity-50"
                >
                  {submittingComment ? 'Posting...' : 'Post'}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetailModal;
