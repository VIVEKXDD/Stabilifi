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

    // In a real app, you'd validate the credentials against a database
    if (!email || !password) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user = {
      uid: 'mock-user-123', // In a real app, this would come from your database
      email: email,
      displayName: 'Mock User'
    };
    
    // Create the JWT
    const expirationTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const jwt = await new SignJWT({
      id:user.displayName,
      email:user.email,
    })
      .setProtectedHeader({alg:'HS256'})
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(key)
      
    // Set the JWT in an HttpOnly cookie
    const response = NextResponse.json({ success: true });

    response.cookies.set('jwt', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour (better than expires)
    path: '/',
    });

return response;

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
