import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth.js";

function Sidebar({ user, activeView, setActiveView }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-black border-r border-[#262626] p-4 flex-col">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-light tracking-wide" style={{ fontFamily: "Billabong, cursive" }}>
            F*Meta
          </h1>
        </div>

        {/* Navigation */}
        <div className="flex-1">
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveView('home')}
              className={`flex items-center space-x-4 px-2 py-3 rounded-lg transition-colors w-full text-left ${
                activeView === 'home' ? 'bg-[#262626]' : 'hover:bg-[#262626]'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-lg">Home</span>
            </button>

            <button 
              onClick={() => setActiveView('search')}
              className={`flex items-center space-x-4 px-2 py-3 rounded-lg transition-colors w-full text-left ${
                activeView === 'search' ? 'bg-[#262626]' : 'hover:bg-[#262626]'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-lg">Search</span>
            </button>

            <button className="flex items-center space-x-4 px-2 py-3 rounded-lg hover:bg-[#262626] transition-colors w-full text-left">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
              </svg>
              <span className="text-lg">Explore</span>
            </button>

            <button className="flex items-center space-x-4 px-2 py-3 rounded-lg hover:bg-[#262626] transition-colors w-full text-left">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-lg">Reels</span>
            </button>

            <button className="flex items-center space-x-4 px-2 py-3 rounded-lg hover:bg-[#262626] transition-colors w-full text-left">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-lg">Messages</span>
            </button>

            <button className="flex items-center space-x-4 px-2 py-3 rounded-lg hover:bg-[#262626] transition-colors w-full text-left">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-lg">Notifications</span>
            </button>

            <button className="flex items-center space-x-4 px-2 py-3 rounded-lg hover:bg-[#262626] transition-colors w-full text-left">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-lg">Create</span>
            </button>

            <button 
              onClick={() => setActiveView('profile')}
              className={`flex items-center space-x-4 px-2 py-3 rounded-lg transition-colors w-full text-left ${
                activeView === 'profile' ? 'bg-[#262626]' : 'hover:bg-[#262626]'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-sm font-semibold">{user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase()}</span>
              </div>
              <span className="text-lg">Profile</span>
            </button>
          </nav>

          {/* Logout Button */}
          <div className="mt-auto pt-4">
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

      {/* Mobile Top Header - Only on mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-black border-b border-[#262626] px-4 py-3 z-50">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-xl font-light tracking-wide" style={{ fontFamily: "Billabong, cursive" }}>
            F*Meta
          </h1>
          <div className="flex items-center space-x-4">
            <button className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Only on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-[#262626] px-2 py-1 z-50">
        <div className="flex items-center justify-around">
          <button 
            onClick={() => setActiveView('home')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeView === 'home' ? 'text-white' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>

          <button 
            onClick={() => setActiveView('search')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeView === 'search' ? 'text-white' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <button className="flex flex-col items-center py-2 px-3 rounded-lg transition-colors text-gray-400">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>

          <button className="flex flex-col items-center py-2 px-3 rounded-lg transition-colors text-gray-400">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          <button 
            onClick={() => setActiveView('profile')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeView === 'profile' ? 'text-white' : 'text-gray-400'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
              activeView === 'profile' ? 'bg-white text-black' : 'bg-gray-600 text-white'
            }`}>
              <span className="text-xs font-semibold">{user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase()}</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
