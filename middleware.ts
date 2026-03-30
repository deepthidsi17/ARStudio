import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("ar_admin_token")?.value;
  const isSetupRoute = request.nextUrl.pathname === "/login";
  
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!token || token !== process.env.ADMIN_PASSWORD) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from the login page
  if (isSetupRoute && token === process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
