import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

/**
 * 測試資料庫是否成功連線
 */
export async function GET() {
  try {
    const result = await sql`
      SELECT NOW() as current_time
    `;

    return NextResponse.json({
      success: true,
      message: "資料庫連線成功",
      time: result[0].current_time,
    });

  } catch (error) {
    console.error("資料庫錯誤:", error);

    return NextResponse.json({
      success: false,
      message: "資料庫連線失敗",
      error,
    });
  }
}