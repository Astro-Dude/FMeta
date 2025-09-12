import { useState, useEffect } from "react";
import { getApiUrl, API_ENDPOINTS } from "../../config/api.js";

function ProfileContent({ user, viewingUserId, onBackToSearch }) {
  const [activeTab, setActiveTab] = useState('posts');
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500 mb-4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header with Back Button and Username */}
      <div className="sticky top-0 bg-black border-b border-gray-800 px-4 py-3 z-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center">
            {!isViewingOwnProfile && onBackToSearch && (
              <button
                onClick={onBackToSearch}
                className="mr-4 p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-xl font-semibold text-white">{displayUser.username}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Profile Info Section */}
        <div className="flex flex-col gap-6 mb-8">
          {/* Profile Picture */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-4xl font-bold text-white">
                {displayUser.name?.charAt(0)?.toUpperCase() || displayUser.username?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="text-center">
            <h2 className="text-2xl font-light text-white mb-4">{displayUser.username}</h2>
            
            {/* Stats */}
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="font-semibold text-lg text-white">{postCount}</div>
                <div className="text-gray-400 text-sm">posts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-white">{followerCount}</div>
                <div className="text-gray-400 text-sm">followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg text-white">{followingCount}</div>
                <div className="text-gray-400 text-sm">following</div>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h3 className="font-semibold text-white text-left">{displayUser.name || displayUser.username}</h3>
              <p className="text-gray-300 text-sm text-left mt-1">
                {displayUser.bio || "No bio yet."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isViewingOwnProfile ? (
                <>
                  <button className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-white">
                    Edit profile
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-white">
                    View archive
                  </button>
                </>
              ) : (
                <>
                  <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium text-white">
                    Follow
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-white">
                    Message
                  </button>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </button>
                </>
              )}
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
              <div className="text-gray-400 text-lg">Loading posts...</div>
            </div>
          ) : activeTab === 'posts' && (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <div key={post._id} className="aspect-square relative group cursor-pointer">
                  <img 
                    src={post.imageUrl || post.image || "https://picsum.photos/300/300?random=" + post._id} 
                    alt={`Post ${post._id}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1 text-white">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span className="text-sm font-medium">{post.likesCount || post.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 6h-2l-1.27-1.27A2 2 0 0 0 16.32 4H7.68a2 2 0 0 0-1.41.59L5 6H3a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a1 1 0 0 0-1-1zM12 17a4 4 0 1 1 4-4 4 4 0 0 1-4 4z"/>
                      </svg>
                      <span className="text-sm font-medium">{post.commentsCount || post.comments || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
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
              <h3 className="text-xl font-light mb-2 text-white">No Posts Yet</h3>
              <p className="text-gray-400">When you share photos, they'll appear on your profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileContent;
