import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getApiUrl, API_ENDPOINTS } from '../config/api.js';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent double execution
      if (verificationAttempted.current) {
        console.log('Verification already attempted, skipping...');
        return;
      }
      
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing. Please check your email link.');
        return;
      }

      verificationAttempted.current = true;
      console.log('Starting verification with token:', token);

      try {
        const response = await fetch(`${getApiUrl(API_ENDPOINTS.AUTH.VERIFY_EMAIL)}?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log('Verification response:', data);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (response.ok && data.success) {
          setStatus('success');
          if (data.alreadyVerified) {
            setMessage('Email is already verified! You can now log in.');
          } else {
            setMessage(data.message || 'Email verified successfully! You can now log in.');
          }
          
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            navigate('/auth', { state: { tab: 'login' } });
          }, 3000);
        } else {
          setStatus('error');
          // Show the exact error message from backend
          setMessage(data.message || 'Email verification failed. Please try again or contact support.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again later.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleGoToLogin = () => {
    navigate('/auth', { state: { tab: 'login' } });
  };

  const handleResendVerification = () => {
    // This would need to be implemented to resend verification email
    alert('Please contact support or try registering again to receive a new verification email.');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 rounded-lg border border-zinc-800 p-8 text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Email Verification</h1>
          
          {status === 'verifying' && (
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          )}
        </div>
        
        <p className="text-zinc-300 mb-6">
          {status === 'verifying' && 'Verifying your email address...'}
          {message}
        </p>
        
        <div className="space-y-3">
          {status === 'success' && (
            <div>
              <button
                onClick={handleGoToLogin}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
              <p className="text-sm text-zinc-400 mt-2">
                You will be automatically redirected in a few seconds...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <button
                onClick={handleGoToLogin}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={handleResendVerification}
                className="w-full bg-zinc-700 text-white py-2 px-4 rounded-lg hover:bg-zinc-600 transition-colors"
              >
                Resend Verification Email
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-6 border-t border-zinc-800">
          <p className="text-sm text-zinc-400">
            Having trouble? Contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
