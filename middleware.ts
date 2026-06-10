import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const protectedPaths = ["/team-builder", "/battle", "/pokedex"];

  const isProtectedRoute = protectedPaths.some(path => nextUrl.pathname.startsWith(path));

  if (isLoggedIn && (nextUrl.pathname.startsWith("/auth"))) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/team-builder/:path*",
    "/battle/:path*",
    "/pokedex/:path*",
    "/"
  ],
};