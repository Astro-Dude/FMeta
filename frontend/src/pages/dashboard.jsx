import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { isAuthenticated, getCurrentUser } from "../utils/auth.js";
import Sidebar from "../elements/Dashboard/Sidebar.jsx";
import FeedContent from "../elements/Dashboard/FeedContent.jsx";
import ProfileContent from "../elements/Dashboard/ProfileContent.jsx";
import SearchContent from "../elements/Dashboard/SearchContent.jsx";
import CreateContent from "../elements/Dashboard/CreateContent.jsx";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the current view from URL parameters, default to 'home'
  const activeView = searchParams.get('view') || 'home';

  // Function to change the active view and update URL
  const setActiveView = (view) => {
    setSearchParams({ view });
  };

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

  // Ensure we have a valid view parameter
  useEffect(() => {
    const validViews = ['home', 'search', 'profile', 'create'];
    const currentView = searchParams.get('view');
    
    if (!currentView || !validViews.includes(currentView)) {
      setSearchParams({ view: 'home' });
    }
  }, [searchParams, setSearchParams]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <Sidebar user={user} activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content */}
      <div className="lg:pl-64 w-full bg-black min-h-screen pt-16 pb-16 lg:pt-0 lg:pb-0">
        <div className="flex justify-center min-h-screen px-4">
          {/* Render content based on active view */}
          {(activeView === 'home' || activeView === 'create') && <FeedContent user={user} />}
          {activeView === 'search' && <SearchContent user={user} />}
          {activeView === 'profile' && <ProfileContent user={user} />}
        </div>
      </div>

      {/* Create Content Modal - Always render on top when create view is active */}
      {activeView === 'create' && (
        <CreateContent 
          onClose={() => setActiveView('home')}
          onSuccess={() => {
            setActiveView('home');
            // Optionally refresh the feed here
          }}
        />
      )}
    </div>
  );
}

export default Dashboard;
