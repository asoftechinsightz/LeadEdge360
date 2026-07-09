import { NextResponse } from 'next/server';

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
  Object.entries(NO_STORE).forEach(([key, value]) => response.headers.set(key, value));
  response.cookies.set('emergent_session', '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
