import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const isDemoBypass = request.cookies.get("demo_bypass")?.value === "true";

  // In dev/demo mode or bypass, skip the Supabase config fetch entirely.
  if (process.env.NEXT_PUBLIC_DEV_MODE === "true" || isDemoBypass) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
