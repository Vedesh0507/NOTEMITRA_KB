'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, CheckCircle, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authAPI } from '@/lib/api';

const ALLOWED_EMAIL_DOMAIN = '@mictech.edu.in';

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // Step 1: Email verification state
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Step 2: Password reset state
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    return email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN);
  };

  // Step 1: Verify email and get reset token
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email domain
    if (!validateEmail(email)) {
      setError(`Please enter a valid college email ending with ${ALLOWED_EMAIL_DOMAIN}`);
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verifyEmailForReset(email.toLowerCase());
      
      if (response.data.success && response.data.token) {
        setResetToken(response.data.token);
        setStep('reset');
      } else {
        setError(response.data.message || 'Failed to verify email');
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No account found with this email address. Please check your email or create a new account.');
      } else if (err.response?.status === 429) {
        const retryAfter = err.response?.data?.retryAfter || 900;
        const minutes = Math.ceil(retryAfter / 60);
        setError(`Too many requests. Please try again in ${minutes} minutes.`);
      } else {
        setError(err.response?.data?.message || 'Failed to verify email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with the token
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({
        token: resetToken!,
        password,
        confirmPassword
      });
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        setError(validationErrors.map((e: any) => e.msg).join('. '));
      } else {
        setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-5 sm:p-8 text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="h-14 w-14 sm:h-16 sm:w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Your password has been reset successfully. 
            You will be redirected to the login page shortly.
          </p>

          <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Redirecting to login...
          </div>

          <Link href="/auth/signin">
            <Button className="w-full text-sm sm:text-base">
              Go to Sign In Now
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Step 2: Password Reset Form
  if (step === 'reset') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-5 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Create a new password for <span className="font-medium text-blue-600 break-all">{email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handlePasswordReset} className="space-y-3 sm:space-y-4">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                  minLength={8}
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  required
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full text-sm sm:text-base" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setStep('email');
                setResetToken(null);
                setPassword('');
                setConfirmPassword('');
                setError('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Email Verification Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-5 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Enter your college email address to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              College Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                required
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`your.name${ALLOWED_EMAIL_DOMAIN}`}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Must end with {ALLOWED_EMAIL_DOMAIN}
            </p>
          </div>

          <Button type="submit" className="w-full text-sm sm:text-base" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <Link 
            href="/auth/signin" 
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
