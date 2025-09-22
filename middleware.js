export { default } from "next-auth/middleware"

export const config = { 
  matcher: [
    '/dashboard/:path*', 
    '/profile/:path*'
    // Only list the specific routes you want to protect
  ] 
}