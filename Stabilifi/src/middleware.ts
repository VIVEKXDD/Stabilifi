import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey) {
  throw new Error('JWT_SECRET_KEY is not set in the environment variables.');
}
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const jwt = request.cookies.get('jwt')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  if (!jwt) {
    if (isAuthPage) {
      return NextResponse.next();
    }
    // Redirect to login if no JWT and trying to access a protected route
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(jwt, key);

    // If JWT is valid and user is on an auth page, redirect to dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Refresh the token if it's close to expiring (e.g., in the last 15 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp - now < 15 * 60) {
      const newExpirationTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      const newJwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(newExpirationTime)
        .sign(key);
      
      const response = NextResponse.next();
      response.cookies.set('jwt', newJwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: newExpirationTime,
        path: '/',
      });
      return response;
    }

    return NextResponse.next();

  } catch (error) {
    console.error('JWT verification failed:', error);
    if (isAuthPage) {
        return NextResponse.next();
    }
    // If verification fails, redirect to login and clear the invalid cookie
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('jwt', '', { expires: new Date(0), path: '/' });
    return response;
  }
}

export const config = {
  // Match all routes except for API, static files, and the home page
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
