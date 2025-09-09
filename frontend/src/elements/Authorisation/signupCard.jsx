import { Input } from "../../components/ui/input.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignupCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    username: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error and success when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!formData.fullName || !formData.username || !formData.password || !formData.email) {
        setError("All fields are required");
        setLoading(false);
        return;
      }

      // Name validation - letters and spaces only, 2-50 characters
      const nameRegex = /^[a-zA-Z\s]{2,50}$/;
      if (!nameRegex.test(formData.fullName)) {
        setError("Name must be 2-50 characters and contain only letters and spaces");
        setLoading(false);
        return;
      }

      // Username validation - letters, numbers, dots, underscores only
      const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;
      if (!usernameRegex.test(formData.username)) {
        setError("Username must be 3-30 characters and contain only letters, numbers, dots, and underscores");
        setLoading(false);
        return;
      }

      // Password validation - at least 6 characters
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }
      const requestData = {
        name: formData.fullName,
        username: formData.username,
        password: formData.password,
        email: formData.email
      };

      const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        if (data.token) {
          // User registered without email or email verification not required
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/dashboard");
        } else {
          // Email verification required
          setError("");
          setSuccess(data.message || "Registration successful! Please check your email to verify your account.");
        }
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black border border-[#262626] p-4 sm:p-6 lg:p-8">
      {/* F*Meta logo */}
      <div className="text-center mb-4 sm:mb-6">
        <h1
          className="text-white text-2xl sm:text-3xl font-light tracking-wide"
          style={{ fontFamily: "Billabong, cursive" }}
        >
          F*Meta
        </h1>
      </div>

      {/* Sign up description */}
      <div className="text-center mb-4 sm:mb-6">
        <p className="text-gray-400 text-xs sm:text-sm font-semibold leading-5">
          Sign up to see photos and videos
          <br />
          from your friends.
        </p>
      </div>

      {/* Facebook signup button */}
      <Button className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold py-2 sm:py-3 px-4 mb-4 sm:mb-6 text-xs sm:text-sm flex items-center justify-center">
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Log in with Facebook
      </Button>

      {/* OR divider */}
      <div className="flex items-center mb-4 sm:mb-6">
        <div className="flex-1 border-t border-[#262626]"></div>
        <span className="px-3 sm:px-4 text-gray-400 text-xs sm:text-sm font-semibold">
          OR
        </span>
        <div className="flex-1 border-t border-[#262626]"></div>
      </div>

      {/* Signup form */}
      <form className="space-y-3" onSubmit={handleSignup}>
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white px-3 py-2 rounded text-xs sm:text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-white px-3 py-2 rounded text-xs sm:text-sm text-center">
            {success}
          </div>
        )}
        
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
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

        <Input
          type="text"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={(e) => handleInputChange("fullName", e.target.value)}
          className="w-full bg-[#121212] border border-[#262626] text-white placeholder-gray-400 text-xs sm:text-sm p-2 sm:p-3 focus:border-gray-400"
          required
        />

        <Input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => handleInputChange("username", e.target.value)}
          className="w-full bg-[#121212] border border-[#262626] text-white placeholder-gray-400 text-xs sm:text-sm p-2 sm:p-3 focus:border-gray-400"
          required
        />

        {/* Terms and privacy text */}
        <div className="text-center my-3 sm:my-4">
          <p className="text-gray-400 text-xs leading-relaxed">
            People who use our service may have uploaded
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>your contact information to
            F*Meta.{" "}
            <a href="#" className="text-[#00376b]">
              Learn
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>More
            </a>
          </p>
        </div>

        <div className="text-center mb-4 sm:mb-6">
          <p className="text-gray-400 text-xs leading-relaxed">
            By signing up, you agree to our{" "}
            <a href="#" className="text-[#00376b]">
              Terms
            </a>
            {" , "}
            <a href="#" className="text-[#00376b]">
              Privacy
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>Policy
            </a>
            {" and "}
            <a href="#" className="text-[#00376b]">
              Cookies Policy
            </a>
            {" ."}
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0095f6] hover:bg-[#1877f2] disabled:bg-gray-600 text-white font-semibold py-2 sm:py-3 px-4 text-xs sm:text-sm"
        >
          {loading ? "Signing up..." : "Sign up"}
        </Button>
      </form>
    </div>
  );
}

export default SignupCard;
