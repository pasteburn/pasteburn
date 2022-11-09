import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UAParser } from "ua-parser-js";

// This function can be marked `async` if using `await` inside
export function middleware(req: NextRequest) {
  const rawUa = req.headers.get("user-agent");
  if (!rawUa || rawUa.search("B|bot") != -1)
    return NextResponse.rewrite(new URL("/api/404", req.url));
  const ua = new UAParser(rawUa).getResult();
  if (!ua.browser.name || !ua.os.name || !ua.engine.name)
    return NextResponse.rewrite(new URL("/api/404", req.url));
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - favicon.ico (favicon file)
   */
  matcher: "/((?!api|_next/static|favicon.ico).*)",
};
