/**
 * Hardcoded admin credentials.
 * In production, these would come from env vars or a database with hashed passwords.
 */
const ADMIN_CREDENTIALS = {
  id: 'admin_001',
  username: 'admin',
  password: 'craftathon@2026',
  name: 'Craftathon Admin',
};

const JWT_SECRET = process.env.JWT_SECRET || 'craftathon-super-secret-key-2026';
const JWT_EXPIRES_IN = '24h';

module.exports = {
  ADMIN_CREDENTIALS,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
