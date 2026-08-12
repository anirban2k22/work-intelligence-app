import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const isSupabaseConfigured =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("your-project-ref") &&
  SUPABASE_ANON_KEY.length > 20;

// Public routes that never require authentication
const PUBLIC_ROUTES = ["/login", "/auth/callback", "/unauthorized", "/change-password"];

// Landing page is accessible to everyone but logged-in users get redirected to their home
const LANDING_ROUTE = "/";

// Role → home dashboard mapping
const ROLE_HOME: Record<string, string> = {
  admin: "/admin/dashboard",
  manager: "/manager/dashboard",
  employee: "/dashboard",
};

export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session — must run before any redirects
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some(r => pathname.startsWith(r));
  const isLandingRoute = pathname === LANDING_ROUTE;

  // Not logged in → send to login (landing page is always accessible)
  if (!user && !isPublicRoute && !isLandingRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    // Fetch role from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status, temp_password_used")
      .eq("user_id", user.id)
      .single();

    const role = profile?.role ?? "employee";
    const tempPassword = profile?.temp_password_used ?? false;

    // Force password change on first login
    if (tempPassword && pathname !== "/change-password") {
      const url = request.nextUrl.clone();
      url.pathname = "/change-password";
      return NextResponse.redirect(url);
    }

    // Logged-in user on landing page → send to their role home
    if (isLandingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_HOME[role] ?? "/dashboard";
      return NextResponse.redirect(url);
    }

    // Route guards — wrong role → unauthorized
    if (pathname.startsWith("/admin") && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/manager") && role !== "manager" && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    // Logged-in user hitting /login → go to their home
    if (pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_HOME[role] ?? "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
