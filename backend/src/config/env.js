const REQUIRED_ENV_VARS = [
  'PORT',
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'ENCRYPTION_KEY',
];

const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key] || !String(process.env[key]).trim());

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (Buffer.from(encryptionKey, 'utf8').length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 bytes');
  }

  const mongoUri = process.env.MONGODB_URI.trim();
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
  }
};

module.exports = validateEnv;
