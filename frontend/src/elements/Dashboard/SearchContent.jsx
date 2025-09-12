import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { getApiUrl, API_ENDPOINTS } from "../../config/api.js";

function SearchContent({ user, onUserSelect }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingMe, setIsFollowingMe] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const searchInputRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Get profile ID from URL if viewing a profile
  const profileId = searchParams.get('profile');

  // Initialize component state based on URL parameters
  useEffect(() => {
    if (profileId) {
      // If there's a profile ID in URL, load that profile
      loadUserProfileById(profileId);
    } else {
      // Clear selected user if no profile in URL
      setSelectedUser(null);
      setUserPosts([]);
      setIsFollowing(false);
      setIsFollowingMe(false);
    }
  }, [profileId]);

  // Focus search input when component mounts (only if not viewing a profile)
  useEffect(() => {
    if (!profileId && searchInputRef.current) {
      searchInputRef.current.focus();
    }

    // Load recent searches from localStorage
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading recent searches:", error);
      }
    }
  }, [profileId]);

  // Debounced search function
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setError("");
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery.trim());
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${getApiUrl(API_ENDPOINTS.USER.SEARCH)}?query=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Fetch complete profile data for each user
          const enrichedUsers = await Promise.all(
            result.users.map(async (user) => {
              try {
                const profileResponse = await fetch(
                  `${getApiUrl(API_ENDPOINTS.USER.PROFILE)}/${user._id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                      "Content-Type": "application/json",
                    },
                  }
                );

                if (profileResponse.ok) {
                  const profileResult = await profileResponse.json();
                  if (profileResult.success) {
                    return profileResult.user;
                  }
                }
                
                // Fallback to basic user data if profile fetch fails
                return user;
              } catch (error) {
                console.error(`Error fetching profile for user ${user._id}:`, error);
                return user;
              }
            })
          );

          setSearchResults(enrichedUsers);
        } else {
          setError(result.message || "Search failed");
        }
      } else {
        setError("Failed to search users");
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load user profile by ID (used for URL-based navigation)
  const loadUserProfileById = async (userId) => {
    try {
      setProfileLoading(true);
      
      // Fetch complete user profile data
      const profileResponse = await fetch(
        `${getApiUrl(API_ENDPOINTS.USER.PROFILE)}/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (profileResponse.ok) {
        const profileResult = await profileResponse.json();
        if (profileResult.success) {
          setSelectedUser(profileResult.user);
          
          // Load posts and follow status for this user
          await Promise.all([
            loadUserPosts(userId),
            checkFollowStatus(userId)
          ]);
        } else {
          console.error("Failed to load profile:", profileResult.message);
          // If profile doesn't exist, go back to search
          setSearchParams({ view: 'search' });
        }
      } else {
        console.error("Failed to fetch profile");
        // If profile doesn't exist, go back to search
        setSearchParams({ view: 'search' });
      }
    } catch (error) {
      console.error("Error loading user profile by ID:", error);
      // If error, go back to search
      setSearchParams({ view: 'search' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Load user posts
  const loadUserPosts = async (userId) => {
    try {
      const postsResponse = await fetch(
        `${getApiUrl(API_ENDPOINTS.USER.POSTS)}/${userId}/posts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (postsResponse.ok) {
        const postsResult = await postsResponse.json();
        if (postsResult.success) {
          setUserPosts(postsResult.posts);
        }
      }
    } catch (error) {
      console.error("Error loading user posts:", error);
    }
  };

  // Check follow status
  const checkFollowStatus = async (userId) => {
    try {
      const followStatusResponse = await fetch(
        `${getApiUrl(API_ENDPOINTS.USER.FOLLOW_STATUS)}/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (followStatusResponse.ok) {
        const followStatusResult = await followStatusResponse.json();
        if (followStatusResult.success) {
          setIsFollowing(followStatusResult.isFollowing);
          setIsFollowingMe(followStatusResult.isFollowingMe);
        }
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleUserClick = async (selectedUser) => {
    // Update URL to include the profile ID
    setSearchParams({ view: 'search', profile: selectedUser._id });

    // Add to recent searches
    const newRecentSearch = {
      _id: selectedUser._id,
      username: selectedUser.username,
      name: selectedUser.name,
      searchedAt: new Date().toISOString(),
    };

    const updatedRecent = [
      newRecentSearch,
      ...recentSearches.filter((item) => item._id !== selectedUser._id),
    ].slice(0, 10); // Keep only last 10 searches

    setRecentSearches(updatedRecent);
    localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));

    // Set the selected user immediately to show the profile view
    setSelectedUser(selectedUser);
    setProfileLoading(true);

    // Load user profile and posts
    await loadUserProfile(selectedUser);
  };

  const loadUserProfile = async (selectedUser) => {
    try {
      setProfileLoading(true);
      
      // If user already has complete profile data (from search), use it
      if (selectedUser.followerCount !== undefined && selectedUser.postCount !== undefined) {
        setSelectedUser(selectedUser);
      } else {
        // Fetch complete user profile data
        const profileResponse = await fetch(
          `${getApiUrl(API_ENDPOINTS.USER.PROFILE)}/${selectedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();
          if (profileResult.success) {
            setSelectedUser(profileResult.user);
          }
        } else {
          setSelectedUser(selectedUser);
        }
      }

      // Fetch user posts
      const postsResponse = await fetch(
        `${getApiUrl(API_ENDPOINTS.USER.POSTS)}/${selectedUser._id}/posts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (postsResponse.ok) {
        const postsResult = await postsResponse.json();
        if (postsResult.success) {
          setUserPosts(postsResult.posts);
        }
      }

      // Check follow status
      const followStatusResponse = await fetch(
        `${getApiUrl(API_ENDPOINTS.USER.FOLLOW_STATUS)}/${selectedUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (followStatusResponse.ok) {
        const followStatusResult = await followStatusResponse.json();
        if (followStatusResult.success) {
          setIsFollowing(followStatusResult.isFollowing);
          setIsFollowingMe(followStatusResult.isFollowingMe);
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleBackToSearch = () => {
    // Remove profile parameter from URL to go back to search
    setSearchParams({ view: 'search' });
    setSelectedUser(null);
    setUserPosts([]);
    setSearchQuery("");
    setSearchResults([]);
    setIsFollowing(false);
    setIsFollowingMe(false);
  };

  const getFollowButtonText = () => {
    if (followLoading) return "Loading...";
    if (isFollowing) return "Following";
    if (isFollowingMe) return "Follow Back";
    return "Follow";
  };

  const handleFollowToggle = async () => {
    if (!selectedUser || followLoading) return;

    try {
      setFollowLoading(true);

      const url = isFollowing
        ? `${getApiUrl(API_ENDPOINTS.USER.FOLLOW)}/${selectedUser._id}`
        : `${getApiUrl(API_ENDPOINTS.USER.FOLLOW)}/${selectedUser._id}`;

      const method = isFollowing ? "DELETE" : "POST";

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
          setIsFollowing(result.isFollowing);

          // Update the selected user's follower count
          setSelectedUser((prev) => ({
            ...prev,
            followerCount: isFollowing
              ? prev.followerCount - 1
              : prev.followerCount + 1,
          }));
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const removeRecentSearch = (userId) => {
    const updated = recentSearches.filter((item) => item._id !== userId);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const UserItem = ({ user: searchUser, isRecent = false, onRemove }) => (
    <div
      className="flex items-center justify-between p-3 hover:bg-gray-800 cursor-pointer rounded-lg transition-colors"
      onClick={() => handleUserClick(searchUser)}
    >
      <div className="flex items-center space-x-3">
        {/* Profile Picture */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-lg font-bold">
            {searchUser.name?.charAt(0)?.toUpperCase() ||
              searchUser.username?.charAt(0)?.toUpperCase()}
          </div>
        </div>

        {/* User Info */}
        <div className="flex flex-col">
          <span className="text-white font-medium">{searchUser.username}</span>
          <span className="text-gray-400 text-sm">{searchUser.name}</span>
          {searchUser.bio && (
            <span className="text-gray-500 text-xs truncate max-w-xs">
              {searchUser.bio}
            </span>
          )}
          {/* Show follower count if available */}
          {searchUser.followerCount !== undefined && (
            <span className="text-gray-500 text-xs">
              {searchUser.followerCount} followers
            </span>
          )}
        </div>
      </div>

      {isRecent && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(searchUser._id);
          }}
          className="text-gray-400 hover:text-white p-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );

  // Show full page loading when profile is loading
  if (profileLoading && (selectedUser || profileId)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500 mb-4"></div>
        <div className="text-gray-400 text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Show Profile View if user is selected or profile ID is in URL */}
      {(selectedUser || profileId) ? (
        selectedUser ? (
          <div>
            {/* Profile Header with Back Button */}
            <div className="sticky top-0 bg-black pb-4 mb-6">
              <div className="flex items-center mb-4">
                <button
                  onClick={handleBackToSearch}
                  className="mr-4 p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <h1 className="text-xl font-semibold text-white">
                  {selectedUser.username}
                </h1>
              </div>
            </div>

          {/* Instagram-like Profile Section - Responsive */}
          <div className="px-2 sm:px-4 mb-6">
            {/* Mobile Layout (default) */}
            <div className="block lg:hidden">
              <div className="flex items-center gap-4 sm:gap-6 mb-4">
                {/* Profile Picture */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-lg sm:text-xl font-bold">
                    {selectedUser.name?.charAt(0)?.toUpperCase() ||
                      selectedUser.username?.charAt(0)?.toUpperCase()}
                  </div>
                </div>

                {/* Stats - Mobile Layout */}
                <div className="flex flex-1 justify-around text-center">
                  <div>
                    <div className="text-base sm:text-lg font-semibold text-white">{selectedUser.postCount || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-400">posts</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-semibold text-white">{selectedUser.followerCount || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-400">followers</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-semibold text-white">{selectedUser.followingCount || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-400">following</div>
                  </div>
                </div>
              </div>

              {/* Name and Bio - Mobile */}
              <div className="mb-4">
                <div className="font-semibold text-white text-sm sm:text-base mb-1">{selectedUser.name || selectedUser.username}</div>
                {selectedUser.bio && (
                  <div className="text-gray-300 text-sm leading-relaxed">
                    {selectedUser.bio}
                  </div>
                )}
              </div>

              {/* Action Buttons - Mobile */}
              <div className="flex gap-2">
                {selectedUser._id !== user._id && (
                  <>
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`flex-1 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium ${
                        isFollowing
                          ? "bg-gray-700 hover:bg-gray-600 text-white"
                          : isFollowingMe
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      } ${
                        followLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {followLoading ? "..." : getFollowButtonText()}
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
                    {selectedUser.name?.charAt(0)?.toUpperCase() ||
                      selectedUser.username?.charAt(0)?.toUpperCase()}
                  </div>
                </div>

                {/* Profile Info - Desktop */}
                <div className="flex-1">
                  {/* Username and Buttons Row */}
                  <div className="flex items-center gap-6 mb-6">
                    <h2 className="text-2xl font-light text-white">{selectedUser.username}</h2>
                    {selectedUser._id !== user._id && (
                      <>
                        <button
                          onClick={handleFollowToggle}
                          disabled={followLoading}
                          className={`px-6 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                            isFollowing
                              ? "bg-gray-700 hover:bg-gray-600 text-white"
                              : isFollowingMe
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          } ${
                            followLoading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {followLoading ? "..." : getFollowButtonText()}
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
                      <span className="font-semibold text-white text-lg">{selectedUser.postCount || 0}</span>
                      <span className="text-gray-400 ml-1">posts</span>
                    </div>
                    <div>
                      <span className="font-semibold text-white text-lg">{selectedUser.followerCount || 0}</span>
                      <span className="text-gray-400 ml-1">followers</span>
                    </div>
                    <div>
                      <span className="font-semibold text-white text-lg">{selectedUser.followingCount || 0}</span>
                      <span className="text-gray-400 ml-1">following</span>
                    </div>
                  </div>

                  {/* Name and Bio - Desktop */}
                  <div>
                    <div className="font-semibold text-white text-base mb-2">{selectedUser.name || selectedUser.username}</div>
                    {selectedUser.bio && (
                      <div className="text-gray-300 leading-relaxed max-w-md">
                        {selectedUser.bio}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="border-t border-gray-800 pt-6">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 text-white border-t-2 border-white pt-3">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6zm8 0h6v6h-6v-6zM3 19h6v6H3v-6zm8 0h6v6h-6v-6zm8 0h6v6h-6v-6z" />
                </svg>
                <span className="text-sm font-medium">POSTS</span>
              </div>
            </div>

            {userPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-0.5 sm:gap-1 md:gap-2 lg:gap-3">
                {userPosts.map((post) => (
                  <div
                    key={post._id}
                    className="aspect-square relative group cursor-pointer"
                  >
                    <img
                      src={
                        post.imageUrl ||
                        post.image ||
                        "https://picsum.photos/300/300?random=" + post._id
                      }
                      alt={`Post ${post._id}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-1 text-white">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span className="text-xs sm:text-sm font-medium">
                          {post.likesCount || post.likes || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M21 6h-2l-1.27-1.27A2 2 0 0 0 16.32 4H7.68a2 2 0 0 0-1.41.59L5 6H3a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a1 1 0 0 0-1-1zM12 17a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
                        </svg>
                        <span className="text-xs sm:text-sm font-medium">
                          {post.commentsCount || post.comments || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-gray-600 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-light mb-2">No Posts Yet</h3>
                <p className="text-gray-400">
                  This user hasn't shared any posts yet.
                </p>
              </div>
            )}
          </div>
        </div>
        ) : (
          // Loading state when we have profileId but no selectedUser data yet
          <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500 mb-4"></div>
            <div className="text-gray-400 text-lg">Loading profile...</div>
          </div>
        )
      ) : (
        /* Search View */
        <div>
          {/* Search Header */}
          <div className="sticky top-0 bg-black pb-4 mb-6">
            <h1 className="text-xl font-semibold text-white mb-4">Search</h1>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setError("");
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg
                    className="h-5 w-5 text-gray-400 hover:text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <div className="text-gray-400">Searching...</div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-8">
              <div className="text-red-400">{error}</div>
            </div>
          )}

          {/* Search Results */}
          {searchQuery && searchResults.length > 0 && !loading && (
            <div className="mb-6">
              <h2 className="text-white font-medium mb-3">Results</h2>
              <div className="space-y-1">
                {searchResults.map((searchUser) => (
                  <UserItem key={searchUser._id} user={searchUser} />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchQuery &&
            searchResults.length === 0 &&
            !loading &&
            !error &&
            searchQuery.length >= 2 && (
              <div className="text-center py-8">
                <div className="text-gray-400">No users found</div>
              </div>
            )}

          {/* Recent Searches */}
          {!searchQuery && recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-medium">Recent</h2>
                <button
                  onClick={clearRecentSearches}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((recentUser) => (
                  <UserItem
                    key={recentUser._id}
                    user={recentUser}
                    isRecent={true}
                    onRemove={removeRecentSearch}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!searchQuery && recentSearches.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-gray-600 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-light mb-2 text-white">
                Search for users
              </h3>
              <p className="text-gray-400">
                Find friends and discover new people to follow.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchContent;
