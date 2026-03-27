import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

// Define public routes
const isPublicRoute = createRouteMatcher([
  '/',
  '/about(.*)',
  '/blog(.*)',
  '/auth/sign-in(.*)',
  '/auth/sign-up(.*)',
  '/api/trpc(.*)',
  '/api/summaryCleanup(.*)',
  '/api/createSummaryNotifications(.*)',
  '/api/webhooks/user(.*)',
  '/api/eggs(.*)',
  '/api/eggs/stats(.*)',
  '/api/eggs/history(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

// By default protect all routes, but allow public routes defined above
export default clerkMiddleware(async (auth, req) => {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', req.nextUrl.pathname);

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
