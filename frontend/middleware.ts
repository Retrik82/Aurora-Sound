import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/generate/constructor") {
    return NextResponse.redirect(new URL("/generate/builder", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/generate/constructor"
};
