import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey) {
  throw new Error('JWT_SECRET_KEY is not set in the environment variables.');
}

const key = new TextEncoder().encode(secretKey);

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();   // ✅ MUST await
  const jwt = cookieStore.get('jwt')?.value;

  if (!jwt) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const { payload } = await jwtVerify(jwt, key);

    const user = {
      uid: payload.uid as string,
      email: payload.email as string,
      displayName: payload.displayName as string,
    };

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}