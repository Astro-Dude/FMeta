import { useState, useEffect } from "react";
import { getApiUrl, API_ENDPOINTS } from "../../config/api.js";
import PostDetailModal from "./PostDetailModal.jsx";

function ProfileContent({ user, viewingUserId, onBackToSearch }) {
  const [activeTab, setActiveTab] = useState('posts');
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  // Determine which user profile to show
  const targetUserId = viewingUserId || user._id;
  const isViewingOwnProfile = !viewingUserId;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile data
        const profileUrl = `${getApiUrl(API_ENDPOINTS.USER.PROFILE)}/${targetUserId}`;
        console.log('Fetching profile from:', profileUrl); // Debug log
        const profileResponse = await fetch(profileUrl, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();
          console.log('Profile API response:', profileResult); // Debug log
          if (profileResult.success) {
            setProfileData(profileResult.user);
          }
        } else {
          console.error('Profile API error:', profileResponse.status, profileResponse.statusText);
          const errorText = await profileResponse.text();
          console.error('Error response:', errorText);
        }

        // Fetch user posts
        const postsResponse = await fetch(`${getApiUrl(API_ENDPOINTS.USER.POSTS)}/${targetUserId}/posts`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (postsResponse.ok) {
          const postsResult = await postsResponse.json();
          if (postsResult.success) {
            setPosts(postsResult.posts);
          }
        }

      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (targetUserId) {
      fetchProfileData();
    }
  }, [targetUserId]);

  // Use profileData if available, fallback to user data
  const displayUser = profileData || user;
  const followerCount = profileData?.followerCount || profileData?.followers?.length || 0;
  const followingCount = profileData?.followingCount || profileData?.following?.length || 0;
  const postCount = profileData?.postCount || posts.length;

  if (loading) {
    return (
      <div className="w-full lg:max-w-4xl lg:mx-auto px-4 py-6 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500 mb-4"></div>
      {/* <div className="text-gray-400 text-lg">Loading profile...</div> */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full lg:max-w-4xl lg:mx-auto px-4 py-6 text-center">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full lg:max-w-4xl lg:mx-auto px-2 sm:px-4 py-6">
      {/* Back Button (only show when viewing another user's profile) */}
      {!isViewingOwnProfile && onBackToSearch && (
        <div className="mb-4">
          <button
            onClick={onBackToSearch}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to search
          </button>
        </div>
      )}

      {/* Instagram-like Profile Section - Responsive */}
      <div className="px-2 sm:px-4 mb-6">
        {/* Mobile Layout (default) */}
        <div className="block lg:hidden">
          <div className="flex items-center gap-4 sm:gap-6 mb-4">
            {/* Profile Picture */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-lg sm:text-xl font-bold">
                {displayUser.name?.charAt(0)?.toUpperCase() || displayUser.username?.charAt(0)?.toUpperCase()}
              </div>
            </div>

            {/* Stats - Mobile Layout */}
            <div className="flex flex-1 justify-around text-center">
              <div>
                <div className="text-base sm:text-lg font-semibold text-white">{postCount}</div>
                <div className="text-xs sm:text-sm text-gray-400">posts</div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-semibold text-white">{followerCount}</div>
                <div className="text-xs sm:text-sm text-gray-400">followers</div>
              </div>
              <div>
                <div className="text-base sm:text-lg font-semibold text-white">{followingCount}</div>
                <div className="text-xs sm:text-sm text-gray-400">following</div>
              </div>
            </div>
          </div>

          {/* Name and Bio - Mobile */}
          <div className="mb-4">
            <div className="font-semibold text-white text-sm sm:text-base mb-1">{displayUser.name || displayUser.username}</div>
            {displayUser.bio && (
              <div className="text-gray-300 text-sm leading-relaxed">
                {displayUser.bio}
              </div>
            )}
          </div>

          {/* Action Buttons - Mobile */}
          <div className="flex gap-2">
            {isViewingOwnProfile ? (
              <>
                <button className="flex-1 py-1.5 sm:py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-xs sm:text-sm font-medium">
                  Edit profile
                </button>
                <button className="flex-1 py-1.5 sm:py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-xs sm:text-sm font-medium">
                  Share profile
                </button>
                <button className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button className="flex-1 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-xs sm:text-sm font-medium">
                  Following
                </button>
                <button className="flex-1 py-1.5 sm:py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-xs sm:text-sm font-medium">
                  Message
                </button>
                <button className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="flex items-start gap-8 mb-6">
            {/* Profile Picture - Desktop */}
            <div className="w-32 h-32 xl:w-36 xl:h-36 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-2xl xl:text-3xl font-bold">
                {displayUser.name?.charAt(0)?.toUpperCase() || displayUser.username?.charAt(0)?.toUpperCase()}
              </div>
            </div>

            {/* Profile Info - Desktop */}
            <div className="flex-1">
              {/* Username and Buttons Row */}
              <div className="flex items-center gap-6 mb-6">
                <h2 className="text-2xl font-light text-white">{displayUser.username}</h2>
                {isViewingOwnProfile ? (
                  <>
                    <button className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium">
                      Edit profile
                    </button>
                    <button className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium">
                      View archive
                    </button>
                    <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="px-6 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium">
                      Following
                    </button>
                    <button className="px-6 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium">
                      Message
                    </button>
                    <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Stats Row - Desktop */}
              <div className="flex gap-8 mb-4">
                <div>
                  <span className="font-semibold text-white text-lg">{postCount}</span>
                  <span className="text-gray-400 ml-1">posts</span>
                </div>
                <div>
                  <span className="font-semibold text-white text-lg">{followerCount}</span>
                  <span className="text-gray-400 ml-1">followers</span>
                </div>
                <div>
                  <span className="font-semibold text-white text-lg">{followingCount}</span>
                  <span className="text-gray-400 ml-1">following</span>
                </div>
              </div>

              {/* Name and Bio - Desktop */}
              <div>
                <div className="font-semibold text-white text-base mb-2">{displayUser.name || displayUser.username}</div>
                {displayUser.bio && (
                  <div className="text-gray-300 leading-relaxed max-w-md">
                    {displayUser.bio}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-t border-gray-800">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              activeTab === 'posts' 
                ? 'border-t-2 border-white text-white' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6zm8 0h6v6h-6v-6zM3 19h6v6H3v-6zm8 0h6v6h-6v-6zm8 0h6v6h-6v-6z"/>
            </svg>
            POSTS
          </button>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="mt-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500 mb-4 mx-auto"></div>
            {/* <div className="text-gray-400 text-lg">Loading posts...</div> */}
          </div>
        ) : activeTab === 'posts' && (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1 md:gap-2 lg:gap-3">
            {posts.map((post) => {
              // Get the thumbnail or first image from media array, fallback to imageUrl
              const getThumbnailUrl = () => {
                if (post.media && post.media.length > 0) {
                  // If there's a thumbnail, use it; otherwise use the first media url
                  return post.media[0].thumbnail || post.media[0].url;
                }
                return post.imageUrl || post.image;
              };

              const thumbnailUrl = getThumbnailUrl();
              const fallbackUrl = `https://picsum.photos/300/300?random=${post._id}`;

              // Validate URL (check if it's a valid base64 or http/https URL)
              const isValidUrl = thumbnailUrl && (
                thumbnailUrl.startsWith('data:') || 
                thumbnailUrl.startsWith('http://') || 
                thumbnailUrl.startsWith('https://')
              );

              return (
                <div 
                  key={post._id} 
                  className="aspect-square relative group cursor-pointer"
                  onClick={() => {
                    console.log('Profile post clicked:', post);
                    setSelectedPost(post);
                  }}
                >
                  <img 
                    src={isValidUrl ? thumbnailUrl : fallbackUrl}
                    alt={`Post ${post._id}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Failed to load image:', e.target.src);
                      e.target.src = fallbackUrl;
                    }}
                  />
                  <div className="absolute inset-0 backdrop-blur-sm bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-1 text-white drop-shadow-lg">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span className="text-xs sm:text-sm font-medium">{post.likesCount || post.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white drop-shadow-lg">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 6h-2l-1.27-1.27A2 2 0 0 0 16.32 4H7.68a2 2 0 0 0-1.41.59L5 6H3a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a1 1 0 0 0-1-1zM12 17a4 4 0 1 1 4-4 4 4 0 0 1-4 4z"/>
                    </svg>
                    <span className="text-xs sm:text-sm font-medium">{post.commentsCount || post.comments || 0}</span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-gray-600 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-light mb-2">No Posts Yet</h3>
            <p className="text-gray-400">When you share photos, they'll appear on your profile.</p>
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
    </div>
  );
}

export default ProfileContent;
