// app/merchant/chat/merchant-chat-client.tsx

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

interface MerchantChatClientProps {
  rooms: ChatRoomSummary[];
  selectedRoomId: string | null;
  initialMessages: ChatMessage[];
}

export default function MerchantChatClient({
  rooms,
  selectedRoomId,
  initialMessages,
}: MerchantChatClientProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  async function refreshMessages() {
    if (!selectedRoomId) return;

    try {
      const res = await fetch(`/api/chat/messages?room_id=${selectedRoomId}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("刷新商家聊天失敗:", error);
    }
  }

  async function handleSend() {
    if (!selectedRoomId || !input.trim()) return;

    try {
      setLoading(true);

      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_id: selectedRoomId,
          message: input,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "送出失敗");
        return;
      }

      setInput("");
      await refreshMessages();
    } catch (error) {
      console.error("商家送出訊息失敗:", error);
      alert("送出失敗");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold">聊天管理</h1>

        {rooms.length === 0 ? (
          <div className="text-gray-500">目前還沒有任何聊天室。</div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={`/merchant/chat?room=${room.id}`}
                className={`block rounded-2xl border p-4 ${
                  selectedRoomId === room.id
                    ? "border-black bg-gray-100"
                    : "border-gray-200"
                }`}
              >
                <div className="font-semibold">{room.user_name}</div>
                <div className="text-sm text-gray-500">{room.user_email}</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex h-[700px] flex-col rounded-3xl bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-bold">對話內容</h2>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-6">
          {!selectedRoomId ? (
            <div className="text-gray-500">請先選擇聊天室。</div>
          ) : messages.length === 0 ? (
            <div className="text-gray-500">目前沒有訊息。</div>
          ) : (
            messages.map((msg) => {
              const isMerchant = msg.sender_type === "merchant";
              const isAI = msg.sender_type === "ai";

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMerchant ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      isMerchant
                        ? "bg-black text-white"
                        : isAI
                        ? "bg-blue-100 text-blue-900"
                        : "border bg-white text-black"
                    }`}
                  >
                    {!isMerchant && (
                      <div className="mb-1 text-xs font-semibold opacity-70">
                        {isAI ? "AI 客服" : "使用者"}
                      </div>
                    )}
                    <div>{msg.message}</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t bg-white p-4">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              placeholder="輸入商家回覆..."
              className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 outline-none"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim() || !selectedRoomId}
              className="rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
            >
              {loading ? "送出中" : "送出"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}