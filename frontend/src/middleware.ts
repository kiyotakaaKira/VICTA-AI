import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Define routes that require authentication.
 * All other routes (like the landing page '/') will be public by default.
 */
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/cases(.*)",
  "/admin(.*)",
  "/intel(.*)",
  "/api/(.*)", // Protect internal APIs
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // 1. Skip Next.js internals and all static files (images, fonts, etc.)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // 2. Always run for API and TRPC routes
    '/(api|trpc)(.*)',
  ],
};
