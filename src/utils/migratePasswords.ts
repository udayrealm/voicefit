import { supabase } from './supabase';
import { PasswordUtils } from './passwordUtils';

export class PasswordMigration {
  /**
   * Migrate all plain text passwords to hashed passwords
   * This should be run once to secure existing user accounts
   */
  static async migrateAllPasswords(): Promise<void> {
    try {
      console.log('🔐 Starting password migration...');
      
      // Get all users with plain text passwords
      const { data: users, error } = await supabase
        .from('users')
        .select('id, username, password')
        .not('password', 'like', '$2a$%')
        .not('password', 'like', '$2b$%')
        .not('password', 'like', '$2y$%');

      if (error) {
        console.error('❌ Error fetching users:', error);
        throw error;
      }

      if (!users || users.length === 0) {
        console.log('✅ No plain text passwords found. Migration not needed.');
        return;
      }

      console.log(`🔐 Found ${users.length} users with plain text passwords`);

      let migratedCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          // Hash the plain text password
          const hashedPassword = await PasswordUtils.hashPassword(user.password);
          
          // Update the user's password in the database
          const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('id', user.id);

          if (updateError) {
            console.error(`❌ Failed to migrate password for user ${user.username}:`, updateError);
            errorCount++;
          } else {
            console.log(`✅ Migrated password for user: ${user.username}`);
            migratedCount++;
          }
        } catch (error) {
          console.error(`❌ Error migrating password for user ${user.username}:`, error);
          errorCount++;
        }
      }

      console.log(`🎉 Password migration complete!`);
      console.log(`✅ Successfully migrated: ${migratedCount} passwords`);
      if (errorCount > 0) {
        console.log(`❌ Failed to migrate: ${errorCount} passwords`);
      }
    } catch (error) {
      console.error('❌ Password migration failed:', error);
      throw error;
    }
  }

  /**
   * Check the status of password migration
   * Returns the count of users with plain text passwords
   */
  static async checkMigrationStatus(): Promise<number> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, username')
        .not('password', 'like', '$2a$%')
        .not('password', 'like', '$2b$%')
        .not('password', 'like', '$2y$%');

      if (error) {
        console.error('❌ Error checking migration status:', error);
        throw error;
      }

      const plainTextCount = users?.length || 0;
      console.log(`🔐 Found ${plainTextCount} users with plain text passwords`);
      
      return plainTextCount;
    } catch (error) {
      console.error('❌ Error checking migration status:', error);
      throw error;
    }
  }

  /**
   * Get detailed migration status (for debugging)
   * This can be called from browser console: PasswordMigration.getDetailedStatus()
   */
  static async getDetailedStatus(): Promise<{
    totalUsers: number;
    encryptedUsers: number;
    plainTextUsers: number;
    encryptionPercentage: number;
    plainTextUsersList: Array<{id: string; username: string; email: string}>;
  }> {
    try {
      // Get total users
      const { data: allUsers, error: totalError } = await supabase
        .from('users')
        .select('id, username, email, password');

      if (totalError) {
        throw totalError;
      }

      const totalUsers = allUsers?.length || 0;
      const encryptedUsers = allUsers?.filter(user => 
        user.password?.startsWith('$2a$') || 
        user.password?.startsWith('$2b$') || 
        user.password?.startsWith('$2y$')
      ).length || 0;
      
      const plainTextUsers = totalUsers - encryptedUsers;
      const encryptionPercentage = totalUsers > 0 ? Math.round((encryptedUsers / totalUsers) * 100) : 0;

      const plainTextUsersList = allUsers?.filter(user => 
        !user.password?.startsWith('$2a$') && 
        !user.password?.startsWith('$2b$') && 
        !user.password?.startsWith('$2y$')
      ).map(user => ({ id: user.id, username: user.username, email: user.email })) || [];

      const status = {
        totalUsers,
        encryptedUsers,
        plainTextUsers,
        encryptionPercentage,
        plainTextUsersList
      };

      console.log('🔐 Password Migration Status:', status);
      return status;
    } catch (error) {
      console.error('❌ Error getting detailed status:', error);
      throw error;
    }
  }
}
