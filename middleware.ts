// middleware.ts
import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  try {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    // Protected routes
    const protectedRoutes = ["/team-builder", "/battle", "/pokedex"];
    const isProtected = protectedRoutes.some(route =>
      nextUrl.pathname.startsWith(route)
    );

    // Nếu chưa login mà vào protected route → redirect login
    if (isProtected && !isLoggedIn) {
      const redirectUrl = new URL("/auth/signin", nextUrl.origin);
      redirectUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Nếu đã login mà vào trang auth → redirect về home
    if (isLoggedIn && nextUrl.pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    "/",
    "/team-builder/:path*",
    "/battle/:path*",
    "/pokedex/:path*",
    "/auth/:path*"
  ],
};