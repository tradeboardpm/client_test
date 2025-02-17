import { NextResponse } from "next/server";

// List of public paths that don't require authentication
const publicPaths = [
  "/",
  "/login",
  "/sign-up",
  "/reset-password",
  "/ap-verification",
  "/ap-data",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if the request is for a static asset
  const isStaticAsset = /\.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/i.test(pathname);
  if (isStaticAsset) {
    return NextResponse.next();
  }

  // Check if the current path is public
  const isPublicPath = publicPaths.includes(pathname) || publicPaths.some((path) => pathname.startsWith(path + "/"));

  // Get token and expiry from cookies
  const token = request.cookies.get("token")?.value;
  const expiry = request.cookies.get("expiry")?.value;

  // If no token and the path is not public, redirect to home
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If token exists, check for expiration
  if (token && expiry) {
    const expiryTime = Number(expiry);

    // If token is expired, clear cookies and redirect to home
    if (Date.now() > expiryTime) {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("token");
      response.cookies.delete("expiry");
      response.cookies.delete("userName");
      response.cookies.delete("userEmail");
      response.cookies.delete("userId");
      return response;
    }
  }

  // If everything is fine, continue the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};