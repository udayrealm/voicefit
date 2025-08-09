-- 🔐 Password Migration Status Queries for Supabase

-- 1. Check how many users have plain text passwords (not encrypted)
SELECT 
    COUNT(*) as plain_text_count,
    'Users with unencrypted passwords' as description
FROM users 
WHERE password NOT LIKE '$2a$%' 
    AND password NOT LIKE '$2b$%' 
    AND password NOT LIKE '$2y$%';

-- 2. Check how many users have encrypted passwords
SELECT 
    COUNT(*) as encrypted_count,
    'Users with encrypted passwords' as description
FROM users 
WHERE password LIKE '$2a$%' 
    OR password LIKE '$2b$%' 
    OR password LIKE '$2y$%';

-- 3. Get a list of users with plain text passwords (for migration)
SELECT 
    id,
    username,
    email,
    created_at,
    'NEEDS_MIGRATION' as status
FROM users 
WHERE password NOT LIKE '$2a$%' 
    AND password NOT LIKE '$2b$%' 
    AND password NOT LIKE '$2y$%'
ORDER BY created_at DESC;

-- 4. Get a list of users with encrypted passwords
SELECT 
    id,
    username,
    email,
    created_at,
    'ENCRYPTED' as status
FROM users 
WHERE password LIKE '$2a$%' 
    OR password LIKE '$2b$%' 
    OR password LIKE '$2y$%'
ORDER BY created_at DESC;

-- 5. Overall password security status summary
SELECT 
    'Password Security Status' as report_title,
    COUNT(*) as total_users,
    COUNT(CASE WHEN password LIKE '$2a$%' OR password LIKE '$2b$%' OR password LIKE '$2y$%' THEN 1 END) as encrypted_users,
    COUNT(CASE WHEN password NOT LIKE '$2a$%' AND password NOT LIKE '$2b$%' AND password NOT LIKE '$2y$%' THEN 1 END) as plain_text_users,
    ROUND(
        (COUNT(CASE WHEN password LIKE '$2a$%' OR password LIKE '$2b$%' OR password LIKE '$2y$%' THEN 1 END) * 100.0 / COUNT(*)), 
        2
    ) as encryption_percentage
FROM users;

-- 6. Check for any suspicious password patterns (for security audit)
SELECT 
    username,
    email,
    CASE 
        WHEN password = 'password123' THEN 'WEAK_PASSWORD'
        WHEN password = 'test123' THEN 'WEAK_PASSWORD'
        WHEN password = 'demo' THEN 'WEAK_PASSWORD'
        WHEN LENGTH(password) < 6 THEN 'SHORT_PASSWORD'
        ELSE 'OK'
    END as password_strength,
    created_at
FROM users 
WHERE password NOT LIKE '$2a$%' 
    AND password NOT LIKE '$2b$%' 
    AND password NOT LIKE '$2y$%'
ORDER BY created_at DESC;

-- 7. Migration progress tracking (run this before and after migration)
SELECT 
    'Migration Progress' as status,
    COUNT(*) as total_users,
    SUM(CASE WHEN password LIKE '$2a$%' OR password LIKE '$2b$%' OR password LIKE '$2y$%' THEN 1 ELSE 0 END) as migrated_users,
    SUM(CASE WHEN password NOT LIKE '$2a$%' AND password NOT LIKE '$2b$%' AND password NOT LIKE '$2y$%' THEN 1 ELSE 0 END) as pending_migration,
    ROUND(
        (SUM(CASE WHEN password LIKE '$2a$%' OR password LIKE '$2b$%' OR password LIKE '$2y$%' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 
        2
    ) as migration_percentage
FROM users;
