// app/api/logout/route.ts

import { NextResponse } from "next/server";

/**
 * POST /api/logout
 * 清除 cookie
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "已登出",
  });

  response.cookies.set("userId", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("role", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("userName", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}