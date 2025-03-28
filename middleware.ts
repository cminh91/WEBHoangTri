import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Gỡ lỗi bằng header để dễ dàng kiểm tra
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-middleware-cache', 'no-cache')
  
  // Thêm security headers
  const responseHeaders = new Headers()
  responseHeaders.set('X-DNS-Prefetch-Control', 'on')
  responseHeaders.set('X-XSS-Protection', '1; mode=block')
  responseHeaders.set('X-Content-Type-Options', 'nosniff')
  responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  responseHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()')
  
  // Thêm cache headers cho tài nguyên tĩnh
  if (
    pathname.includes('/_next/') || 
    pathname.includes('/images/') ||
    pathname.includes('/assets/') ||
    pathname.endsWith('.jpg') || 
    pathname.endsWith('.jpeg') || 
    pathname.endsWith('.png') || 
    pathname.endsWith('.webp') || 
    pathname.endsWith('.svg') || 
    pathname.endsWith('.css') || 
    pathname.endsWith('.js')
  ) {
    responseHeaders.set('Cache-Control', 'public, max-age=31536000, immutable')
    return NextResponse.next({
      headers: responseHeaders,
    })
  }
  
  // Kiểm tra xem đường dẫn có phải là admin không
  const isAdminPath = pathname.startsWith('/admin')
  
  // Bỏ qua các đường dẫn không liên quan đến admin
  if (!isAdminPath) {
    return NextResponse.next({
      headers: responseHeaders,
    })
  }
  
  // Check if we're requesting an API route
  const isApiPath = pathname.startsWith('/api/')
  if (isApiPath) {
    return NextResponse.next({
      headers: responseHeaders,
    })
  }
  
  // Kiểm tra nếu đang ở trang login hoặc public assets
  const isLoginPage = pathname === '/admin/login'
  const isPublicPath = 
    pathname.includes('/_next') || 
    pathname.includes('/images') || 
    pathname.includes('/favicon.ico') ||
    pathname.includes('/api/auth')
  
  if (isPublicPath) {
    return NextResponse.next({
      headers: responseHeaders,
    })
  }
  
  try {
    // Lấy token từ session
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    
    // Nếu đã đăng nhập và đang ở trang login, chuyển hướng về trang admin
    if (token && isLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    
    // Nếu chưa đăng nhập và không phải trang login, chuyển hướng về trang login
    if (!token && !isLoginPage) {
      const url = new URL('/admin/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
    
    return NextResponse.next({
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('[Middleware] Error:', error)
    // Trong trường hợp lỗi, cho phép tiếp tục nhưng ghi log
    return NextResponse.next({
      headers: responseHeaders,
    })
  }
}

// Chỉ áp dụng middleware cho các đường dẫn /admin và asset statics
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/auth/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 