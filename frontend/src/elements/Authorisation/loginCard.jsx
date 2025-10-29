import { Input } from "../../components/ui/input.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.usernameOrEmail || !formData.password) {
        setError("Username/email and password are required");
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailOrPhoneOrUsername: formData.usernameOrEmail,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Redirect to dashboard
        navigate("/dashboard?view=home");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black border border-[#262626] p-4 sm:p-6 lg:p-8">
      {/* F*Meta logo */}
      <div className="text-center mb-6 sm:mb-8">
        <h1
          className="text-white text-2xl sm:text-3xl font-light tracking-wide"
          style={{ fontFamily: "Billabong, cursive" }}
        >
          F*Meta
        </h1>
      </div>

      {/* Login form */}
      <form className="space-y-3" onSubmit={handleLogin}>
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white px-3 py-2 rounded text-xs sm:text-sm text-center">
            {error}
          </div>
        )}
        
        <Input
          type="text"
          placeholder="Phone number, username, or email"
          value={formData.usernameOrEmail}
          onChange={(e) => handleInputChange("usernameOrEmail", e.target.value)}
          className="w-full bg-[#121212] border border-[#262626] text-white placeholder-gray-400 text-xs sm:text-sm p-2 sm:p-3 focus:border-gray-400"
          required
        />
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className="w-full bg-[#121212] border border-[#262626] text-white placeholder-gray-400 text-xs sm:text-sm p-2 sm:p-3 pr-12 sm:pr-16 focus:border-gray-400"
            required
          />
          {formData.password && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-white text-xs sm:text-sm font-semibold hover:text-gray-300"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0095f6] hover:bg-[#1877f2] disabled:bg-gray-600 text-white font-semibold py-2 sm:py-3 px-4 mt-4 text-xs sm:text-sm"
        >
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      {/* OR divider */}
      <div className="flex items-center my-4 sm:my-6">
        <div className="flex-1 border-t border-[#262626]"></div>
        <span className="px-3 sm:px-4 text-gray-400 text-xs sm:text-sm font-semibold">
          OR
        </span>
        <div className="flex-1 border-t border-[#262626]"></div>
      </div>

      {/* Facebook login */}
      <div className="text-center">
        <button className="flex items-center justify-center w-full text-[#385185] font-semibold text-xs sm:text-sm mb-4 sm:mb-6">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Log in with Facebook
        </button>

        <a href="#" className="text-[#00376b] text-xs sm:text-sm">
          Forgot password?
        </a>
      </div>
    </div>
  );
}

export default LoginCard;
