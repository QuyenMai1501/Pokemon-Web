// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Tạm thời chỉ log để debug, chưa bảo vệ mạnh
  console.log('Middleware running for:', request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};