import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "crafter2024";
  const secret = process.env.ADMIN_SECRET || "crafter_secret";

  if (username === adminUsername && password === adminPassword) {
    const response = NextResponse.json({ success: true });
    // Set a simple auth cookie (HttpOnly, no JS access)
    response.cookies.set("admin_auth", secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return response;
  }

  return NextResponse.json(
    { success: false, message: "Invalid username or password." },
    { status: 401 }
  );
}
