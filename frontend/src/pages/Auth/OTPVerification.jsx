import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import GradientBackground from '../../components/ui/GradientBackground';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});

  const { 
    verifyOTP, 
    resendOTP, 
    isLoading, 
    error, 
    clearError, 
    pendingVerificationEmail 
  } = useAuthStore();
  const navigate = useNavigate();

  // Auto-focus next input
  const inputRefs = [];

  useEffect(() => {
    // If no pending email, redirect to login
    if (!pendingVerificationEmail) {
      navigate('/login');
      return;
    }

    // Start countdown for resend
    setCountdown(60);
  }, [pendingVerificationEmail, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear error when user starts typing
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
    clearError();

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
    }
  };

  const validateOTP = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit OTP' });
      return false;
    }
    if (!/^\d{6}$/.test(otpString)) {
      setErrors({ otp: 'OTP must contain only numbers' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateOTP()) return;

    try {
      const result = await verifyOTP(pendingVerificationEmail, otp.join(''));
      
      if (result.success) {
        toast.success('Email verified successfully! Welcome to MingleMe!');
        navigate('/feed');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Verification failed. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    try {
      const result = await resendOTP(pendingVerificationEmail);
      
      if (result.success) {
        toast.success('OTP resent successfully!');
        setCountdown(60);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend OTP. Please try again.');
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  // If no pending email, show loading
  if (!pendingVerificationEmail) {
    return (
      <GradientBackground variant="default" className="flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground variant="default" className="flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full"
      >
        {/* Back Button */}
        <button
          onClick={handleBackToLogin}
          className="flex items-center text-slate-600 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="text-slate-600 dark:text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Verify Your Email</h1>
          <p className="text-slate-500">
            We've sent a verification code to{' '}
            <span className="font-medium text-slate-900">{pendingVerificationEmail}</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-700 text-sm">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-100 mb-4 text-center">
              Enter the 6-digit code
            </label>
            <div className="flex justify-center space-x-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs[index] = el)}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-12 h-12 text-slate-800 text-center text-lg font-semibold border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.otp ? 'border-red-300' : 'border-slate-300'
                  }`}
                  maxLength={1}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              ))}
            </div>
            {errors.otp && (
              <p className="text-center text-sm text-red-600">{errors.otp}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:via-purple-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 text-sm mb-2">
            Didn't receive the code?
          </p>
          {countdown > 0 ? (
            <p className="text-slate-500 text-sm">
              Resend available in {countdown} seconds
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              disabled={isLoading}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors disabled:opacity-50"
            >
              Resend OTP
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-slate-500 text-sm text-center">
            Check your email inbox and spam folder. The code will expire in 10 minutes.
          </p>
        </div>
      </motion.div>
    </GradientBackground>
  );
};

export default OTPVerification; 