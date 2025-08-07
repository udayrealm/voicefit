import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../types';

interface LoginScreenProps {
  onSwitchToSignup: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSwitchToSignup }) => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Reset form when component mounts
  useEffect(() => {
    setCredentials({ username: '', password: '' });
    setError('');
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🚀 Login form submitted:', { 
      username: credentials.username, 
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

    // Validate password
    if (credentials.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔐 Attempting login...');
      console.log('🔐 LoginScreen: Submitting credentials:', { username: credentials.username, password: credentials.password });
      await login(credentials.username, credentials.password);
      console.log('✅ Login successful');
      // No need to call onLoginSuccess - the AuthContext will handle the redirect
    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      // Reset password on error
      setCredentials(prev => ({ ...prev, password: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    console.log(`📝 Input change: ${field} = "${value}"`);
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwitchToSignup = () => {
    console.log('🔄 Switching to signup');
    setCredentials({ username: '', password: '' });
    setError('');
    onSwitchToSignup();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your VoiceFit account</p>
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
              placeholder="Enter your username"
              required
              disabled={isLoading}
              autoComplete="username"
              minLength={3}
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
              placeholder="Enter your password"
              required
              disabled={isLoading}
              autoComplete="current-password"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !credentials.username || !credentials.password}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={handleSwitchToSignup}
              className="text-blue-600 hover:text-blue-700 font-medium"
              disabled={isLoading}
            >
              Sign up
            </button>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Demo credentials:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Username: <span className="font-mono">demo</span> | Password: <span className="font-mono">password123</span></p>
            <p>Username: <span className="font-mono">test</span> | Password: <span className="font-mono">test123</span></p>
          </div>
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => {
                setCredentials({ username: 'demo', password: 'password123' });
                console.log('🔐 LoginScreen: Auto-filled demo credentials');
              }}
              className="w-full text-xs bg-blue-100 text-blue-700 py-1 px-2 rounded hover:bg-blue-200"
            >
              Fill Demo Credentials
            </button>
            <button
              type="button"
              onClick={() => {
                setCredentials({ username: 'test', password: 'test123' });
                console.log('🔐 LoginScreen: Auto-filled test credentials');
              }}
              className="w-full text-xs bg-green-100 text-green-700 py-1 px-2 rounded hover:bg-green-200"
            >
              Fill Test Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
