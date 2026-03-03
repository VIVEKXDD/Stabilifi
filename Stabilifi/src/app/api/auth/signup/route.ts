'use server';

import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey) {
  throw new Error('JWT_SECRET_KEY is not set in the environment variables.');
}
const key = new TextEncoder().encode(secretKey);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // In a real app, you'd create a new user in your database
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const newUser = {
      uid: `mock-user-${Date.now()}`, // Generate a unique-ish ID
      email: email,
      displayName: 'New User'
    };
    
    // Create the JWT
    const expirationTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const jwt = await new SignJWT(newUser)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(key);
      
    // Set the JWT in an HttpOnly cookie
    cookies().set('jwt', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expirationTime,
      path: '/',
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
