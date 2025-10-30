import { useState, useEffect, useCallback, useRef } from "react";
import { getApiUrl, API_ENDPOINTS } from "../../config/api.js";
import PostDetailModal from "./PostDetailModal.jsx";

function FeedContent({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    hasNextPage: true,
    totalPosts: 0
  });
  const [followStates, setFollowStates] = useState({});
  const observerRef = useRef();
  
  // Track current image index for each post's carousel
  const [currentImageIndices, setCurrentImageIndices] = useState({});

  // Fetch posts with pagination
  const fetchPosts = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await fetch(`${getApiUrl(API_ENDPOINTS.POSTS.ALL)}?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Posts API response:', result);
        if (result.success) {
          if (append) {
            setPosts(prev => [...prev, ...result.posts]);
          } else {
            setPosts(result.posts);
          }
          console.log('Posts set:', result.posts);
          setPagination(result.pagination);
          
          // Initialize follow states
          const newFollowStates = {};
          result.posts.forEach(post => {
            if (!post.author.isCurrentUser) {
              newFollowStates[post.author._id] = {
                isFollowing: post.author.isFollowedByCurrentUser,
                loading: false
              };
            }
          });
          
          if (append) {
            setFollowStates(prev => ({ ...prev, ...newFollowStates }));
          } else {
            setFollowStates(newFollowStates);
          }
        } else {
          setError(result.message || 'Failed to load posts');
        }
      } else {
        setError('Failed to load posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      fetchPosts(1, false);
    }
  }, [user]);

  // Helper function to get all images for a post
  const getAllImages = (post) => {
    if (post.media && post.media.length > 0) {
      return post.media.map(m => m.url);
    }
    return post.imageUrl ? [post.imageUrl] : [];
  };

  // Navigate to next image in carousel
  const handleNextImage = (postId, allImages) => {
    setCurrentImageIndices(prev => {
      const currentIndex = prev[postId] || 0;
      return {
        ...prev,
        [postId]: (currentIndex + 1) % allImages.length
      };
    });
  };

  // Navigate to previous image in carousel
  const handlePrevImage = (postId, allImages) => {
    setCurrentImageIndices(prev => {
      const currentIndex = prev[postId] || 0;
      return {
        ...prev,
        [postId]: (currentIndex - 1 + allImages.length) % allImages.length
      };
    });
  };

  // Jump to specific image
  const handleDotClick = (postId, index) => {
    setCurrentImageIndices(prev => ({
      ...prev,
      [postId]: index
    }));
  };

  // Infinite scroll intersection observer
  const lastPostElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination.hasNextPage) {
        fetchPosts(pagination.currentPage + 1, true);
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, pagination.hasNextPage, pagination.currentPage]);

  // Handle like/unlike post
  const handleLikeToggle = async (postId, index) => {
    try {
      // Optimistic update
      setPosts(prev => prev.map((p, i) => {
        if (i === index) {
          return {
            ...p,
            isLikedByCurrentUser: !p.isLikedByCurrentUser,
            likesCount: p.isLikedByCurrentUser ? (p.likesCount - 1) : (p.likesCount + 1)
          };
        }
        return p;
      }));

      const response = await fetch(`${getApiUrl('/api/content')}/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Revert on error
        setPosts(prev => prev.map((p, i) => {
          if (i === index) {
            return {
              ...p,
              isLikedByCurrentUser: !p.isLikedByCurrentUser,
              likesCount: p.isLikedByCurrentUser ? (p.likesCount + 1) : (p.likesCount - 1)
            };
          }
          return p;
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setPosts(prev => prev.map((p, i) => {
        if (i === index) {
          return {
            ...p,
            isLikedByCurrentUser: !p.isLikedByCurrentUser,
            likesCount: p.isLikedByCurrentUser ? (p.likesCount + 1) : (p.likesCount - 1)
          };
        }
        return p;
      }));
    }
  };

  // Handle follow/unfollow
  const handleFollowToggle = async (userId) => {
    const currentState = followStates[userId];
    if (!currentState || currentState.loading) return;

    try {
      // Optimistic update
      setFollowStates(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          loading: true
        }
      }));

      const url = currentState.isFollowing
        ? `${getApiUrl(API_ENDPOINTS.USER.FOLLOW)}/${userId}`
        : `${getApiUrl(API_ENDPOINTS.USER.FOLLOW)}/${userId}`;

      const method = currentState.isFollowing ? "DELETE" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFollowStates(prev => ({
            ...prev,
            [userId]: {
              isFollowing: result.isFollowing,
              loading: false
            }
          }));
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to update follow status');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      // Revert optimistic update
      setFollowStates(prev => ({
        ...prev,
        [userId]: {
          ...currentState,
          loading: false
        }
      }));
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getFollowButtonText = (userId) => {
    const state = followStates[userId];
    if (!state) return "Follow";
    if (state.loading) return "...";
    return state.isFollowing ? "Following" : "Follow";
  };

  if (loading && posts.length === 0) {
    return (
      <>
        <div className="w-full max-w-lg py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <div className="text-gray-400">Loading posts...</div>
          </div>
        </div>
      </>
    );
  }

  if (error && posts.length === 0) {
    return (
      <>
        <div className="w-full max-w-lg py-6">
          <div className="text-center">
            <div className="text-red-400">{error}</div>
            <button 
              onClick={() => fetchPosts(1, false)}
              className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="w-full max-w-lg pb-6 pt-0">
        {posts.length > 0 ? (
        <>
          {posts.map((post, index) => {
            const isLastPost = index === posts.length - 1;
            return (
              <div 
                key={post._id} 
                ref={isLastPost ? lastPostElementRef : null}
                className="bg-black border-b border-[#262626] mb-6"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-sm font-bold">
                        {post.author.name?.charAt(0)?.toUpperCase() || post.author.username?.charAt(0)?.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div>
                        <div className="flex items-center space-x-1">
                          <span className="text-white font-semibold text-sm">{post.author.username}</span>
                        </div>
                        {post.location && (
                          <span className="text-gray-400 text-xs">{post.location}</span>
                        )}
                      </div>
                      {/* Follow Button */}
                      {!post.author.isCurrentUser && (
                        <button
                          onClick={() => handleFollowToggle(post.author._id)}
                          disabled={followStates[post.author._id]?.loading}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            followStates[post.author._id]?.isFollowing
                              ? "bg-gray-700 hover:bg-gray-600 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          } ${
                            followStates[post.author._id]?.loading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {getFollowButtonText(post.author._id)}
                        </button>
                      )}
                    </div>
                  </div>
                  <button className="text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>

                {/* Post Image with Carousel */}
                {(() => {
                  const allImages = getAllImages(post);
                  const currentIndex = currentImageIndices[post._id] || 0;
                  
                  if (allImages.length === 0) return null;

                  return (
                    <div className="w-full aspect-square relative group">
                      {/* Main Image */}
                      <div 
                        className="w-full h-full cursor-pointer"
                        onClick={() => setSelectedPost(post)}
                      >
                        <img 
                          src={allImages[currentIndex]}
                          alt="Post"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder on error
                            e.target.src = `https://picsum.photos/600/600?random=${post._id}`;
                            e.target.onerror = null;
                          }}
                        />
                      </div>

                      {/* Navigation Buttons - Only show if multiple images */}
                      {allImages.length > 1 && (
                        <>
                          {/* Previous Button */}
                          {currentIndex > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrevImage(post._id, allImages);
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                          )}

                          {/* Next Button */}
                          {currentIndex < allImages.length - 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNextImage(post._id, allImages);
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}

                          {/* Dot Indicators */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {allImages.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDotClick(post._id, idx);
                                }}
                                className={`rounded-full transition-all ${
                                  idx === currentIndex
                                    ? 'bg-white w-2 h-2'
                                    : 'bg-white bg-opacity-50 w-1.5 h-1.5'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* Post Actions */}
                <div className="py-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex space-x-4">
                      <button 
                        onClick={() => handleLikeToggle(post._id, index)}
                        className={`hover:opacity-70 transition-opacity ${post.isLikedByCurrentUser ? 'text-red-500' : 'text-white'}`}
                      >
                        <svg className="w-6 h-6" fill={post.isLikedByCurrentUser ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => setSelectedPost(post)}
                        className="text-white hover:opacity-70 transition-opacity"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                      <button className="hover:text-gray-300 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                    <button className="hover:text-gray-300 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>

                  {/* Likes */}
                  <div className="mb-2">
                    <span className="text-white font-semibold text-sm">
                      {post.likesCount || 0} {post.likesCount === 1 ? 'like' : 'likes'}
                    </span>
                  </div>

                  {/* Caption */}
                  {post.content && (
                    <div className="mb-2">
                      <span className="text-white font-semibold text-sm mr-2">{post.author.username}</span>
                      <span className="text-white text-sm">{post.content}</span>
                    </div>
                  )}

                  {/* Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="mb-2">
                      {post.hashtags.map((hashtag, index) => (
                        <span key={index} className="text-blue-400 text-sm mr-2">#{hashtag}</span>
                      ))}
                    </div>
                  )}

                  {/* Comments */}
                  {post.commentsCount > 0 && (
                    <button 
                      className="text-gray-400 text-sm mb-2 hover:text-gray-300"
                      onClick={() => setSelectedPost(post)}
                    >
                      View all {post.commentsCount} comments
                    </button>
                  )}

                  {/* Time */}
                  <div className="text-gray-400 text-xs mt-2">
                    {formatTimeAgo(post.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Loading more indicator */}
          {loadingMore && (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500 mx-auto mb-2"></div>
              <div className="text-gray-400 text-sm">Loading more posts...</div>
            </div>
          )}
          
          {/* End of posts indicator */}
          {!pagination.hasNextPage && posts.length > 0 && (
            <div className="text-center py-6">
              <div className="text-gray-400 text-sm">You've reached the end!</div>
            </div>
          )}
        </>
      ) : (
        /* Empty state */
        <div className="text-center py-8">
          <h3 className="text-white text-xl mb-2">No posts yet</h3>
          <p className="text-gray-400 mb-4">Be the first to share something!</p>
          <div className="text-gray-500 text-sm">
            <p>• Create your first post</p>
            <p>• Follow others to see their content</p>
            <p>• Explore and connect with the community</p>
          </div>
        </div>
      )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          user={user}
          onClose={() => setSelectedPost(null)}
          onPostUpdate={(updatedPost) => {
            // Handle post deletion
            if (updatedPost.deleted) {
              setPosts(prev => prev.filter(p => p._id !== updatedPost._id));
              setSelectedPost(null);
              return;
            }
            
            // Update the post in the posts array
            setPosts(prev => prev.map(p => 
              p._id === updatedPost._id ? { ...p, ...updatedPost } : p
            ));
            // Update selected post to reflect changes
            setSelectedPost(updatedPost);
          }}
        />
      )}
    </>
  );
}

export default FeedContent;
