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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully. 
            You will be redirected to the login page shortly.
          </p>

          <div className="flex items-center justify-center text-sm text-gray-500 mb-6">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Redirecting to login...
          </div>

          <Link href="/auth/signin">
            <Button className="w-full">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">
              Create a new password for <span className="font-medium text-blue-600">{email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handlePasswordReset} className="space-y-4">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  required
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">
            Enter your college email address to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              College Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`your.name${ALLOWED_EMAIL_DOMAIN}`}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Must end with {ALLOWED_EMAIL_DOMAIN}
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
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

        <div className="mt-6 text-center">
          <Link 
            href="/auth/signin" 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
