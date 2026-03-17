// components/ChatWidget.tsx

import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import ChatWidgetClient from "./ChatWidgetClient";

interface ChatRoom {
  id: string;
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_type: "user" | "merchant" | "ai";
  sender_id: string | null;
  message: string;
  created_at: string;
}

async function getOrCreateUserRoom(userId: string): Promise<ChatRoom | null> {
  const merchants = await sql`
    SELECT id
    FROM users
    WHERE role = 'merchant'
    LIMIT 1
  `;

  if (merchants.length === 0) return null;

  const merchant = merchants[0];

  const existing = await sql`
    SELECT id
    FROM chat_rooms
    WHERE user_id = ${userId}
    AND merchant_id = ${merchant.id}
    LIMIT 1
  `;

  if (existing.length > 0) {
    return existing[0] as ChatRoom;
  }

  const created = await sql`
    INSERT INTO chat_rooms (user_id, merchant_id)
    VALUES (${userId}, ${merchant.id})
    RETURNING id
  `;

  return created[0] as ChatRoom;
}

async function getMessages(roomId: string): Promise<ChatMessage[]> {
  const messages = await sql`
    SELECT
      id,
      room_id,
      sender_type,
      sender_id,
      message,
      created_at
    FROM chat_messages
    WHERE room_id = ${roomId}
    ORDER BY created_at ASC
  `;

  return messages as ChatMessage[];
}

export default async function ChatWidget() {
  const user = await getCurrentUser();

  if (!user || user.role !== "user") {
    return null;
  }

  const room = await getOrCreateUserRoom(user.id);
  const messages = room ? await getMessages(room.id) : [];

  return <ChatWidgetClient initialRoom={room} initialMessages={messages} />;
}