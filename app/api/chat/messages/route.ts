// app/api/chat/messages/route.ts

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/chat/messages
 * user: 讀自己的聊天室訊息
 * merchant: 可透過 query room_id 讀指定聊天室
 */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "請先登入",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("room_id");

    let targetRoomId = roomId;

    if (user.role === "user") {
      const rooms = await sql`
        SELECT id
        FROM chat_rooms
        WHERE user_id = ${user.id}
        LIMIT 1
      `;

      if (rooms.length === 0) {
        return NextResponse.json({
          success: true,
          messages: [],
        });
      }

      targetRoomId = String(rooms[0].id);
    }

    if (user.role === "merchant" && !targetRoomId) {
      return NextResponse.json(
        {
          success: false,
          message: "商家需提供 room_id",
        },
        { status: 400 }
      );
    }

    const messages = await sql`
      SELECT
        id,
        room_id,
        sender_type,
        sender_id,
        message,
        created_at
      FROM chat_messages
      WHERE room_id = ${targetRoomId!}
      ORDER BY created_at ASC
    `;

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("取得訊息失敗:", error);

    return NextResponse.json(
      {
        success: false,
        message: "取得訊息失敗",
      },
      { status: 500 }
    );
  }
}