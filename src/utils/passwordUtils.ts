import bcrypt from 'bcryptjs';

export class PasswordUtils {
  // Salt rounds for bcrypt (higher = more secure but slower)
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hash a password using bcrypt
   * @param password - Plain text password
   * @returns Promise<string> - Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify a password against its hash
   * @param password - Plain text password to verify
   * @param hashedPassword - Hashed password from database
   * @returns Promise<boolean> - True if password matches, false otherwise
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Check if a password is already hashed (starts with $2a$, $2b$, or $2y$)
   * @param password - Password to check
   * @returns boolean - True if password appears to be hashed
   */
  static isHashed(password: string): boolean {
    return password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$');
  }
}
