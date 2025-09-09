import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, getCurrentUser, logout } from "../utils/auth.js";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard useEffect running...");
    
    // Check if user is logged in
    const authStatus = isAuthenticated();
    console.log("Is authenticated:", authStatus);
    
    if (!authStatus) {
      console.log("Not authenticated, redirecting to auth");
      navigate("/auth");
      return;
    }

    // Get user data
    const userData = getCurrentUser();
    console.log("User data:", userData);
    
    if (userData) {
      setUser(userData);
    } else {
      // If no user data found, redirect to auth
      console.log("No user data found, redirecting to auth");
      navigate("/auth");
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Generate random data for posts
  const generateRandomUser = (id) => {
    const names = ["alex_chen", "maya_patel", "jordan_smith", "sara_williams", "kai_nakamura", "zoe_martinez", "riley_johnson", "casey_brown", "taylor_davis", "jamie_wilson"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    return {
      id,
      username: randomName + Math.floor(Math.random() * 999),
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
      hasStory: Math.random() > 0.3
    };
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden" style={{ width: '100vw', margin: 0, padding: 0 }}>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-black border-r border-[#262626] p-4 z-10">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="mb-8 px-2">
            <h1 className="text-2xl font-light tracking-wide" style={{ fontFamily: "Billabong, cursive" }}>
              F*Meta
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <a href="#" className="flex items-center space-x-4 px-2 py-3 rounded-lg hover:bg-[#262626] transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.005 16.545a2.997 2.997 0 012.997-2.997A2.997 2.997 0 0115 16.545V22h7V12.5L12 3 2 12.5V22h7.005z"/>
              </svg>
              <span className="text-lg">Home</span>
            </a>

            <a href="#" className="flex items-center space-x-4 px-2 py-3 rounded-lg hover:bg-[#262626] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-lg">Search</span>
            </a>

            <a href="#" className="flex items-center space-x-4 px-2 py-3 rounded-lg hover:bg-[#262626] transition-colors relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-lg">Messages</span>
              <span className="absolute top-2 left-6 w-2 h-2 bg-red-500 rounded-full"></span>
            </a>

            <a href="#" className="flex items-center space-x-4 px-2 py-3 rounded-lg hover:bg-[#262626] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h11a1 1 0 001-1V6a1 1 0 00-1-1H4a1 1 0 00-1 1v12a1 1 0 001 1z" />
              </svg>
              <span className="text-lg">Notifications</span>
            </a>

            <a href="#" className="flex items-center space-x-4 px-2 py-3 rounded-lg hover:bg-[#262626] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-lg">Create</span>
            </a>

            <a href="#" className="flex items-center space-x-4 px-2 py-3 rounded-lg hover:bg-[#262626] transition-colors">
              <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-semibold">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-lg">Profile</span>
            </a>
          </nav>

          {/* More Button */}
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-4 px-2 py-3 rounded-lg hover:bg-[#262626] transition-colors w-full text-left"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-lg">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64 w-full bg-black min-h-screen">
        <div className="flex justify-center min-h-screen px-4">
          {/* Feed */}
          <div className="w-full max-w-lg py-6">
          {/* Random Posts */}
          {Array.from({ length: 3 }, (_, index) => {
            const randomUser = generateRandomUser(100 + index);
            const captions = [
              "Living my best life ✨",
              "Just another beautiful day 🌅",
              "Grateful for moments like these 💫",
              "Adventures await! 🌍",
              "Making memories 📸"
            ];
            const songs = [
              "Atir Aslam, Shreya Ghoshal • Tere Liye",
              "Ed Sheeran • Perfect",
              "Billie Eilish • Bad Guy", 
              "Taylor Swift • Anti-Hero",
              "The Weeknd • Blinding Lights"
            ];
            
            return (
              <div key={index} className="bg-black border border-gray-800 rounded-lg mb-6">
                {/* Post Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
                      <div className="w-full h-full rounded-full border border-black overflow-hidden">
                        <img 
                          src={randomUser.avatar} 
                          alt={randomUser.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{randomUser.username}</p>
                      <p className="text-xs text-gray-400">{songs[Math.floor(Math.random() * songs.length)]}</p>
                    </div>
                  </div>
                  <button className="text-white hover:text-gray-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                </div>

                {/* Post Image */}
                <div className="relative">
                  <img 
                    src={`https://picsum.photos/500/600?random=${index + 1}`}
                    alt="Post content"
                    className="w-full aspect-square object-cover"
                  />
                  {/* Mute button */}
                  <button className="absolute bottom-4 right-4 bg-black bg-opacity-50 rounded-full p-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  </button>
                </div>

                {/* Post Actions */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                      <button className="hover:text-gray-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <button className="hover:text-gray-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                      <button className="hover:text-gray-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                    <button className="hover:text-gray-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                  
                  <p className="font-semibold text-sm mb-1">{Math.floor(Math.random() * 1000) + 100} likes</p>
                  <p className="text-sm">
                    <span className="font-semibold">{randomUser.username}</span> {captions[Math.floor(Math.random() * captions.length)]}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">View all {Math.floor(Math.random() * 50) + 10} comments</p>
                  <p className="text-gray-400 text-xs mt-1">{Math.floor(Math.random() * 24) + 1} hours ago</p>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
