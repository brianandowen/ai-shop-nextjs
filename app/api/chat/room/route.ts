// app/api/chat/room/route.ts

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/chat/room
 * 使用者取得自己的聊天室，若沒有就建立
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "user") {
      return NextResponse.json(
        {
          success: false,
          message: "只有使用者可以取得聊天室",
        },
        { status: 403 }
      );
    }

    const merchants = await sql`
      SELECT id, name, email
      FROM users
      WHERE role = 'merchant'
      LIMIT 1
    `;

    if (merchants.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "找不到商家帳號",
        },
        { status: 404 }
      );
    }

    const merchant = merchants[0];

    const existingRoom = await sql`
      SELECT id, user_id, merchant_id, created_at
      FROM chat_rooms
      WHERE user_id = ${user.id}
      AND merchant_id = ${merchant.id}
      LIMIT 1
    `;

    if (existingRoom.length > 0) {
      return NextResponse.json({
        success: true,
        room: existingRoom[0],
      });
    }

    const createdRoom = await sql`
      INSERT INTO chat_rooms (user_id, merchant_id)
      VALUES (${user.id}, ${merchant.id})
      RETURNING id, user_id, merchant_id, created_at
    `;

    return NextResponse.json({
      success: true,
      room: createdRoom[0],
    });
  } catch (error) {
    console.error("取得聊天室失敗:", error);

    return NextResponse.json(
      {
        success: false,
        message: "取得聊天室失敗",
      },
      { status: 500 }
    );
  }
}