'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User, Chrome, GraduationCap, Eye, EyeOff, Briefcase, Hash, Building } from 'lucide-react';

const STUDENT_DOMAIN = '@mictech.edu.in';
const FACULTY_DOMAIN = '@mictech.ac.in';

type DetectedRole = 'none' | 'student' | 'faculty';

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    branch: '',
    section: '',
    rollNo: '',
    designation: '',
    department: '',
    facultyId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const detectedRole: DetectedRole = useMemo(() => {
    const email = formData.email.toLowerCase().trim();
    if (email.endsWith(STUDENT_DOMAIN)) return 'student';
    if (email.endsWith(FACULTY_DOMAIN)) return 'faculty';
    return 'none';
  }, [formData.email]);

  const emailHasDomain = useMemo(() => {
    const email = formData.email.trim();
    return email.includes('@') && email.indexOf('@') < email.length - 1;
  }, [formData.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const email = formData.email.toLowerCase().trim();

    // Validate email domain
    if (!email.endsWith(STUDENT_DOMAIN) && !email.endsWith(FACULTY_DOMAIN)) {
      setError('Only MIC College official emails are allowed');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Faculty-specific validation
    if (detectedRole === 'faculty') {
      if (!formData.facultyId || !/^[0-9]{4}$/.test(formData.facultyId)) {
        setError('Faculty ID must be exactly 4 digits');
        return;
      }
    }

    setLoading(true);

    try {
      const signupData: Record<string, string | undefined> = {
        name: formData.name,
        email: email,
        password: formData.password,
      };

      if (detectedRole === 'student') {
        signupData.branch = formData.branch || undefined;
        signupData.section = formData.section || undefined;
        signupData.rollNo = formData.rollNo || undefined;
      } else if (detectedRole === 'faculty') {
        signupData.designation = formData.designation || undefined;
        signupData.department = formData.department || undefined;
        signupData.facultyId = formData.facultyId;
      }

      await signup(signupData as any);
      router.push('/browse');
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string; response?: { data?: { message?: string; error?: string } } };
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        setError('Cannot connect to server. Please make sure the backend is running on port 5000.');
      } else {
        setError(error.response?.data?.message || error.response?.data?.error || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://notemitra-kb.onrender.com/api';
    const backendUrl = apiUrl.replace('/api', '');
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-6 sm:py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-5 sm:p-8">
        <div className="text-center mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-sm sm:text-base text-gray-600">Join NoteMitra and start sharing knowledge</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Role indicator */}
        {detectedRole !== 'none' && (
          <div className={`mb-4 p-3 rounded-lg text-xs sm:text-sm font-medium ${
            detectedRole === 'student'
              ? 'bg-blue-50 border border-blue-200 text-blue-700'
              : 'bg-purple-50 border border-purple-200 text-purple-700'
          }`}>
            {detectedRole === 'student'
              ? 'Student account — you will be registered as a student.'
              : 'Faculty account — you will be registered with admin privileges.'}
          </div>
        )}

        {emailHasDomain && detectedRole === 'none' && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs sm:text-sm">
            Only MIC College official emails are allowed ({STUDENT_DOMAIN} or {FACULTY_DOMAIN})
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Full Name - always shown */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Email - always shown */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              College Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder={`your.name${STUDENT_DOMAIN}`}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Students: {STUDENT_DOMAIN} &middot; Faculty: {FACULTY_DOMAIN}
            </p>
          </div>

          {/* ===== STUDENT-SPECIFIC FIELDS ===== */}
          {detectedRole === 'student' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                    Branch
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      id="branch"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm sm:text-base"
                    >
                      <option value="">Select Branch</option>
                      <option value="CSE">CSE</option>
                      <option value="AIML">AIML</option>
                      <option value="AIDS">AIDS</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="IT">IT</option>
                      <option value="CIVIL">CIVIL</option>
                      <option value="MECHANICAL">MECHANICAL</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700 mb-1">
                    Roll No
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="rollNo"
                      name="rollNo"
                      type="text"
                      value={formData.rollNo}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="24H71A6132"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                  Section (Optional)
                </label>
                <input
                  id="section"
                  name="section"
                  type="text"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="A"
                />
              </div>
            </>
          )}

          {/* ===== FACULTY-SPECIFIC FIELDS ===== */}
          {detectedRole === 'faculty' && (
            <>
              <div>
                <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="designation"
                    name="designation"
                    type="text"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Assistant Professor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm sm:text-base"
                    >
                      <option value="">Select Department</option>
                      <option value="CSE">CSE</option>
                      <option value="AIML">AIML</option>
                      <option value="AIDS">AIDS</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="IT">IT</option>
                      <option value="CIVIL">CIVIL</option>
                      <option value="MECHANICAL">MECHANICAL</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="facultyId" className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="facultyId"
                      name="facultyId"
                      type="text"
                      value={formData.facultyId}
                      onChange={handleChange}
                      required
                      maxLength={4}
                      pattern="[0-9]{4}"
                      className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="1234"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Exactly 4 digits</p>
                </div>
              </div>
            </>
          )}

          {/* Password fields - shown when a valid domain is detected */}
          {detectedRole !== 'none' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-2.5 sm:py-2"
            size="lg"
            disabled={loading || detectedRole === 'none'}
          >
            {loading
              ? 'Creating Account...'
              : detectedRole === 'none'
                ? 'Enter a valid college email to continue'
                : `Create ${detectedRole === 'faculty' ? 'Faculty' : 'Student'} Account`}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-4"
            size="lg"
            onClick={handleGoogleSignUp}
          >
            <Chrome className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
