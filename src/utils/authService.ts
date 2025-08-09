import { supabase } from './supabase';
import { User, LoginCredentials, SignupCredentials } from '../types';
import { PasswordUtils } from './passwordUtils';

export class AuthService {
  // Get current user from localStorage
  static getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Store user in localStorage
  private static setCurrentUser(user: User): void {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
    }
  }

  // Remove user from localStorage
  private static removeCurrentUser(): void {
    try {
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Error removing user:', error);
    }
  }

  // Login with username and password using Supabase
  static async login(credentials: LoginCredentials): Promise<User> {
    try {
      console.log('🔐 AuthService: Attempting login for:', credentials.username);
      console.log('🔐 AuthService: Credentials received:', { username: credentials.username, passwordLength: credentials.password.length });
      
      // First, try to find the user by username in the users table
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', credentials.username)
        .single();

      if (userError || !users) {
        console.log('❌ AuthService: User not found in database');
        throw new Error('Invalid username or password');
      }

      console.log('🔐 AuthService: Found user in database:', users);

      // Check if password is hashed or plain text (for backward compatibility)
      let passwordMatches = false;
      
      if (PasswordUtils.isHashed(users.password)) {
        // Password is hashed, use bcrypt to verify
        passwordMatches = await PasswordUtils.verifyPassword(credentials.password, users.password);
      } else {
        // Password is plain text (old format), compare directly for backward compatibility
        // TODO: Remove this after all passwords are migrated
        passwordMatches = users.password === credentials.password;
        
        // If password matches and it's plain text, hash it for future use
        if (passwordMatches) {
          console.log('🔐 AuthService: Migrating plain text password to hash for user:', users.username);
          const hashedPassword = await PasswordUtils.hashPassword(credentials.password);
          
          // Update the password in the database
          const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('id', users.id);
            
          if (updateError) {
            console.error('❌ AuthService: Failed to migrate password:', updateError);
          } else {
            console.log('✅ AuthService: Password migrated successfully');
          }
        }
      }

      if (!passwordMatches) {
        console.log('❌ AuthService: Password mismatch');
        throw new Error('Invalid username or password');
      }

      const userData: User = {
        id: users.id,
        username: users.username,
        email: users.email,
        created_at: users.created_at
      };

      this.setCurrentUser(userData);
      console.log('✅ AuthService: Login successful for:', userData.username);
      return userData;
    } catch (error) {
      console.error('❌ AuthService: Login failed:', error);
      throw error;
    }
  }

  // Signup with username, email, and password using Supabase
  static async signup(credentials: SignupCredentials): Promise<User> {
    try {
      console.log('🔐 AuthService: Attempting signup for:', credentials.username);
      
      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', credentials.username)
        .single();

      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Hash the password before storing
      const hashedPassword = await PasswordUtils.hashPassword(credentials.password);

      // Create new user in Supabase
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          username: credentials.username,
          email: credentials.email,
          password: hashedPassword, // Store hashed password
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ AuthService: Error creating user:', insertError);
        throw new Error('Failed to create account');
      }

      const userData: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        created_at: newUser.created_at
      };

      this.setCurrentUser(userData);
      console.log('✅ AuthService: Signup successful for:', userData.username);
      return userData;
    } catch (error) {
      console.error('❌ AuthService: Signup failed:', error);
      throw error;
    }
  }

  // Logout user
  static logout(): void {
    try {
      console.log('🚪 AuthService: Logging out user');
      this.removeCurrentUser();
      console.log('✅ AuthService: Logout successful');
    } catch (error) {
      console.error('❌ AuthService: Logout failed:', error);
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return user !== null;
  }

  // Initialize demo users in Supabase (run once)
  static async initializeDemoUsers(): Promise<void> {
    try {
      console.log('🔧 AuthService: Initializing demo users...');
      
      const demoUsers = [
        {
          username: 'demo',
          email: 'demo@example.com',
          password: 'password123',
          created_at: new Date().toISOString()
        },
        {
          username: 'test',
          email: 'test@example.com',
          password: 'test123',
          created_at: new Date().toISOString()
        }
      ];

      for (const user of demoUsers) {
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('username')
          .eq('username', user.username)
          .single();

        if (!existingUser) {
          // Hash the password before storing
          const hashedPassword = await PasswordUtils.hashPassword(user.password);
          
          // Insert demo user with hashed password
          const { error } = await supabase
            .from('users')
            .insert({
              ...user,
              password: hashedPassword
            });

          if (error) {
            console.error(`❌ Error creating demo user ${user.username}:`, error);
          } else {
            console.log(`✅ Created demo user: ${user.username}`);
          }
        } else {
          console.log(`ℹ️ Demo user ${user.username} already exists`);
        }
      }
      
      console.log('✅ AuthService: Demo users initialization complete');
    } catch (error) {
      console.error('❌ AuthService: Error initializing demo users:', error);
    }
  }
}
