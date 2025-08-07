import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../utils/authService';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Initialize demo users and check for existing user session on app load
    const initializeAuth = async () => {
      try {
        // Initialize demo users in Supabase
        await AuthService.initializeDemoUsers();
        
        // Check for existing user session
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
          setAuthState({
            user: currentUser,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Starting login process');
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const user = await AuthService.login({ username, password });
      console.log('✅ AuthContext: Login successful, updating state with user:', user);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
      console.log('✅ AuthContext: State updated, isAuthenticated should be true');
    } catch (error) {
      console.error('❌ AuthContext: Login failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Starting signup process for:', username);
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const user = await AuthService.signup({ username, email, password });
      console.log('✅ AuthContext: Signup successful, updating state with user:', user);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
      console.log('✅ AuthContext: State updated, isAuthenticated should be true');
    } catch (error) {
      console.error('❌ AuthContext: Signup failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
