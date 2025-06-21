// src/lib/jwt.ts

import { SignJWT, jwtVerify } from 'jose';

// Load secret from env, fallback for dev/local
const JWT_SECRET = process.env.JWT_SECRET || 'dev-quiz-secret';
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export async function signJwt(payload: object): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(JWT_SECRET_KEY);
}

export async function verifyJwt(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return payload;
  } catch {
    return null;
  }
}
