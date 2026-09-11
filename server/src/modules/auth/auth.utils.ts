import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWTPayload } from './auth.types';
import { AUTH_CONSTANTS } from './auth.constants';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'carbonloop_access_secret_2026_key_#89!';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'carbonloop_refresh_secret_2026_key_#42!';

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function generateRefreshToken(payload: { userId: string; sessionId: string }): string {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, ACCESS_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): { userId: string; sessionId: string } {
  return jwt.verify(token, REFRESH_SECRET) as { userId: string; sessionId: string };
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
