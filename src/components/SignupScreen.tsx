import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SignupCredentials } from '../types';

interface SignupScreenProps {
  onSwitchToLogin: () => void;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onSwitchToLogin }) => {
  const { signup } = useAuth();
  const [credentials, setCredentials] = useState<SignupCredentials>({
    username: '',
    email: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Reset form when component mounts
  useEffect(() => {
    setCredentials({ username: '', email: '', password: '' });
    setConfirmPassword('');
    setError('');
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🚀 Signup form submitted:', { 
      username: credentials.username, 
      email: credentials.email, 
      passwordLength: credentials.password.length 
    });
    
    // Prevent double submission
    if (isLoading) {
      console.log('⚠️ Already loading, preventing double submission');
      return;
    }

    setIsLoading(true);
    setError('');

    // Validate username
    if (credentials.username.length < 3) {
      setError('Username must be at least 3 characters long');
      setIsLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (credentials.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    // Validate passwords match
    if (credentials.password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔐 Attempting signup...');
      await signup(credentials.username, credentials.email, credentials.password);
      console.log('✅ Signup successful');
      // No need to call onSignupSuccess - the AuthContext will handle the redirect
    } catch (error) {
      console.error('❌ Signup failed:', error);
      setError(error instanceof Error ? error.message : 'Signup failed');
      // Reset form on error
      setCredentials({ username: '', email: '', password: '' });
      setConfirmPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SignupCredentials, value: string) => {
    console.log(`📝 Input change: ${field} = "${value}"`);
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwitchToLogin = () => {
    console.log('🔄 Switching to login');
    setCredentials({ username: '', email: '', password: '' });
    setConfirmPassword('');
    setError('');
    onSwitchToLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Join VoiceFit</h1>
          <p className="text-gray-600">Create your account to start tracking workouts</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Choose a username (min 3 characters)"
              required
              disabled={isLoading}
              autoComplete="username"
              minLength={3}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={credentials.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Create a password (min 6 characters)"
              required
              disabled={isLoading}
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm your password"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !credentials.username || !credentials.email || !credentials.password || !confirmPassword}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={handleSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium"
              disabled={isLoading}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupScreen;
