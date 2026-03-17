// app/merchant/chat/page.tsx

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import MerchantChatClient from "./merchant-chat-client";

interface ChatRoomSummary {
  id: string;
  user_id: string;
  merchant_id: string;
  created_at: string;
  user_name: string;
  user_email: string;
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_type: "user" | "merchant" | "ai";
  sender_id: string | null;
  message: string;
  created_at: string;
}

async function getRooms(): Promise<ChatRoomSummary[]> {
  const rooms = await sql`
    SELECT
      chat_rooms.id,
      chat_rooms.user_id,
      chat_rooms.merchant_id,
      chat_rooms.created_at,
      users.name as user_name,
      users.email as user_email
    FROM chat_rooms
    JOIN users ON chat_rooms.user_id = users.id
    ORDER BY chat_rooms.created_at DESC
  `;

  return rooms as ChatRoomSummary[];
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

export default async function MerchantChatPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "merchant") {
    redirect("/login");
  }

  const rooms = await getRooms();
  const resolvedSearchParams = await searchParams;
  const selectedRoomId = resolvedSearchParams.room || rooms[0]?.id || null;
  const messages = selectedRoomId ? await getMessages(selectedRoomId) : [];

  return (
    <MerchantChatClient
      rooms={rooms}
      selectedRoomId={selectedRoomId}
      initialMessages={messages}
    />
  );
}