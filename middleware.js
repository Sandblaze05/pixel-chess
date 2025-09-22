export { default } from "next-auth/middleware"

export const config = { 
  matcher: [
    '/dashboard/:path*', 
    '/profile/:path*',
    // Exclude these patterns to prevent redirect loops
    '/((?!api|_next/static|_next/image|favicon.ico|login|auth).*)'
  ] 
};
