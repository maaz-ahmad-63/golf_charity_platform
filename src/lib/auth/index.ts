import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

// Generate JWT token
export async function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as unknown as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Get token from cookies
export async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('authToken')?.value;
}

// Get current user from token
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getToken();
  if (!token) return null;
  return verifyToken(token);
}

// Set auth cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

// Clear auth cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('authToken');
}

// Hash password (for server-side operations)
export async function hashPassword(password: string) {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 10);
}

// Compare passwords
export async function comparePasswords(password: string, hash: string) {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
}
