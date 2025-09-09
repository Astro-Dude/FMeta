import LoginCard from "../elements/Authorisation/loginCard.jsx";
import SignupCard from "../elements/Authorisation/signupCard.jsx";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth.js";

function Authorisation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      // User is logged in, redirect to dashboard
      navigate('/dashboard');
      return;
    }

    // Check if we should show login tab based on navigation state
    if (location.state?.tab === 'login') {
      setIsLogin(true);
    }
    
    // Set body styles for this page
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = 'black';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'auto'; // Allow scrolling
    }

    // Cleanup function to reset body styles when component unmounts
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.backgroundColor = '';
        document.body.style.margin = '';
        document.body.style.padding = '';
        document.body.style.overflow = '';
      }
    };
  }, [location, navigate]);

  return (
    <>
      <div className="min-h-screen w-full bg-black py-8 sm:py-12">
        <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-sm mx-auto">
            {isLogin ? <LoginCard /> : <SignupCard />}
            
            {/* Toggle card */}
            <div className="bg-black border border-[#262626] p-4 sm:p-6 text-center mt-4">
              <span className="text-white text-sm">
                {isLogin ? "Don't have an account? " : "Have an account? "}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#0095f6] font-semibold ml-1 hover:text-[#1877f2] cursor-pointer"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Authorisation;
