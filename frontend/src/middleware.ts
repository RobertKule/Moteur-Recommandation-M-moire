import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_request: NextRequest) {
  // 🔴 IMPORTANT :
  // Auth gérée côté client (AuthContext + localStorage)
  // Le middleware NE DOIT PAS bloquer les routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
}
