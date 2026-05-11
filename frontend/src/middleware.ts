import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Define public routes that do not require authentication.
 * All other routes will be protected by default.
 */
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/health',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth().protect();
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
