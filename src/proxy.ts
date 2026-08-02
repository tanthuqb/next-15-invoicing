import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

// Stripe calls /api/webhook/* server-to-server with no Clerk session;
// the route protects itself via webhook signature verification instead.
function isPublic(request: NextRequest) {
  const { pathname } = request.nextUrl;
  return (
    pathname === '/' ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/api/webhook')
  );
}

export default clerkMiddleware((async (auth, request) => {
  if (!isPublic(request)) await auth.protect()
}));

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};