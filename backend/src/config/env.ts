import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 4000;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/adminpanel';
export const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
export const JWT_EXPIRES = process.env.JWT_EXPIRES || '1d';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
export const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';
export const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
