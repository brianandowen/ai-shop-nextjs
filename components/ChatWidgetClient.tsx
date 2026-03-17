// components/ChatWidgetClient.tsx

"use client";

import { useEffect, useRef, useState } from "react";

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

interface ChatWidgetClientProps {
  initialRoom: ChatRoom | null;
  initialMessages: ChatMessage[];
}

export default function ChatWidgetClient({
  initialRoom,
  initialMessages,
}: ChatWidgetClientProps) {
  const [open, setOpen] = useState(false);
  const [room] = useState<ChatRoom | null>(initialRoom);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  async function refreshMessages() {
    if (!room?.id) return;

    try {
      const res = await fetch(`/api/chat/messages?room_id=${room.id}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("刷新訊息失敗:", error);
    }
  }

  async function handleSend() {
    if (!room?.id || !input.trim()) return;

    try {
      setLoading(true);

      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_id: room.id,
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
      console.error("送出訊息失敗:", error);
      alert("送出訊息失敗");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      refreshMessages();
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  return (
    <>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-black px-5 py-4 text-white shadow-lg"
      >
        {open ? "關閉聊天" : "客服聊天"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="border-b bg-black px-4 py-3 text-white">
            <div className="font-bold">AI 商店客服</div>
            <div className="text-xs text-gray-300">
              可直接詢問商品推薦、預算、新手適合商品
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.length === 0 ? (
              <div className="text-sm text-gray-500">
                目前還沒有訊息，可以先問我：
                「預算 2000 有推薦嗎？」
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.sender_type === "user";
                const isAI = msg.sender_type === "ai";

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        isUser
                          ? "bg-black text-white"
                          : isAI
                          ? "bg-blue-100 text-blue-900"
                          : "bg-white text-black border"
                      }`}
                    >
                      {!isUser && (
                        <div className="mb-1 text-xs font-semibold opacity-70">
                          {isAI ? "AI 客服" : "商家"}
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

          <div className="border-t bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                placeholder="輸入訊息..."
                className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="rounded-xl bg-black px-4 py-3 text-sm text-white disabled:opacity-50"
              >
                {loading ? "傳送中" : "送出"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}