// app/api/login/route.ts

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

/**
 * POST /api/login
 * 根據 email + password 驗證
 * 成功後把登入資訊寫進 cookie
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 基本檢查
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "請輸入帳號與密碼",
        },
        { status: 400 }
      );
    }

    // 查詢使用者
    const users = await sql`
      SELECT id, name, email, role
      FROM users
      WHERE email = ${email}
      AND password = ${password}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "帳號或密碼錯誤",
        },
        { status: 401 }
      );
    }

    const user = users[0];

    const response = NextResponse.json({
      success: true,
      message: "登入成功",
      user,
    });

    // 寫入 cookie
    response.cookies.set("userId", String(user.id), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });

    response.cookies.set("role", String(user.role), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });

    response.cookies.set("userName", encodeURIComponent(String(user.name)), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("登入失敗:", error);

    return NextResponse.json(
      {
        success: false,
        message: "伺服器錯誤",
      },
      { status: 500 }
    );
  }
}