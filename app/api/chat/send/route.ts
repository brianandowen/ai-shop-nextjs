// app/api/chat/send/route.ts

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateAIReply } from "@/lib/ai-chat";

/**
 * POST /api/chat/send
 * user 發訊息後會自動觸發 AI 回覆
 * merchant 發訊息則只存商家回覆
 */
export async function POST(req: Request) {
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

    const body = await req.json();
    const { room_id, message } = body;

    if (!room_id || !message?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "缺少 room_id 或 message",
        },
        { status: 400 }
      );
    }

    const roomCheck =
      user.role === "user"
        ? await sql`
            SELECT id
            FROM chat_rooms
            WHERE id = ${room_id}
            AND user_id = ${user.id}
            LIMIT 1
          `
        : await sql`
            SELECT id
            FROM chat_rooms
            WHERE id = ${room_id}
            LIMIT 1
          `;

    if (roomCheck.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "找不到聊天室或無權限",
        },
        { status: 404 }
      );
    }

    // 先存使用者或商家訊息
    const insertedUserOrMerchantMessage = await sql`
      INSERT INTO chat_messages (room_id, sender_type, sender_id, message)
      VALUES (
        ${room_id},
        ${user.role === "merchant" ? "merchant" : "user"},
        ${user.id},
        ${message.trim()}
      )
      RETURNING id, room_id, sender_type, sender_id, message, created_at
    `;

    // 若是使用者發言，自動由 AI 回覆
    if (user.role === "user") {
      const aiReply = await generateAIReply(message.trim());

      const insertedAIMessage = await sql`
        INSERT INTO chat_messages (room_id, sender_type, sender_id, message)
        VALUES (
          ${room_id},
          'ai',
          null,
          ${aiReply}
        )
        RETURNING id, room_id, sender_type, sender_id, message, created_at
      `;

      return NextResponse.json({
        success: true,
        message: "訊息送出成功",
        inserted: [
          insertedUserOrMerchantMessage[0],
          insertedAIMessage[0],
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: "商家回覆成功",
      inserted: [insertedUserOrMerchantMessage[0]],
    });
  } catch (error) {
    console.error("送出訊息失敗:", error);

    return NextResponse.json(
      {
        success: false,
        message: "送出訊息失敗",
      },
      { status: 500 }
    );
  }
}