// app/api/me/route.ts

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/me
 * 取得目前登入者
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("取得登入資訊失敗:", error);

    return NextResponse.json(
      {
        success: false,
        message: "伺服器錯誤",
      },
      { status: 500 }
    );
  }
}