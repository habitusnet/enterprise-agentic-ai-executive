import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

// Add paths that should always be accessible without authentication
const publicPaths = ["/auth/signin", "/auth/error", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for authentication
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect to login if not authenticated
  if (!token) {
    // Save the URL the user was trying to access
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    // Add the original URL as a query parameter for redirection after login
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Handle role-based access
  if (pathname.startsWith("/dashboard")) {
    // For now, all authenticated users can access dashboard
    // You can implement more granular access control here
    return NextResponse.next();
  }

  // Default: allow access for authenticated users
  return NextResponse.next();
}

// Configure the paths the middleware should run on
export const config = {
  matcher: [
    // Protect all paths except static resources and API routes that don't need protection
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};