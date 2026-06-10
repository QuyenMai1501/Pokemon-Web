import { auth } from "./auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Các route cần login
  const isProtectedRoute = nextUrl.pathname.startsWith("/team-builder") || 
                          nextUrl.pathname.startsWith("/battle");

  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL("/auth/signin", nextUrl));
  }
});

export const config = {
  matcher: ["/team-builder/:path*", "/battle/:path*", "/pokedex/:path*"],
};