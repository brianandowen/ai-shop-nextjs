// components/ChatWidgetClient.tsx

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

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

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string | null;
  category: string | null;
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
  const [products, setProducts] = useState<Product[]>([]);
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

  async function loadProducts() {
    try {
      const res = await fetch("/api/products", {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("載入商品失敗:", error);
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

  function getSuggestedProducts(message: string) {
    if (!message || products.length === 0) return [];

    const matched = products.filter((product) =>
      message.toLowerCase().includes(product.name.toLowerCase())
    );

    return matched.slice(0, 2);
  }

  useEffect(() => {
    if (open) {
      refreshMessages();
      loadProducts();
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const renderedMessages = useMemo(() => messages, [messages]);

  return (
    <>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-black px-5 py-4 text-white shadow-lg"
      >
        {open ? "關閉聊天" : "客服聊天"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[560px] w-[380px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="border-b bg-black px-4 py-3 text-white">
            <div className="font-bold">AI 商店客服</div>
            <div className="text-xs text-gray-300">
              可直接詢問商品推薦、預算、新手適合商品
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {renderedMessages.length === 0 ? (
              <div className="text-sm text-gray-500">
                目前還沒有訊息，可以先問我：
                「預算 2000 有推薦嗎？」
              </div>
            ) : (
              renderedMessages.map((msg) => {
                const isUser = msg.sender_type === "user";
                const isAI = msg.sender_type === "ai";
                const suggestedProducts = isAI
                  ? getSuggestedProducts(msg.message)
                  : [];

                return (
                  <div key={msg.id} className="space-y-2">
                    <div
                      className={`flex ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                          isUser
                            ? "bg-black text-white"
                            : isAI
                            ? "bg-blue-100 text-blue-900"
                            : "border bg-white text-black"
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

                    {isAI && suggestedProducts.length > 0 && (
                      <div className="space-y-2 pl-2">
                        {suggestedProducts.map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            className="block rounded-2xl border border-blue-200 bg-white p-3 transition hover:bg-blue-50"
                          >
                            <div className="flex gap-3">
                              <img
                                src={
                                  product.image_url ||
                                  "https://picsum.photos/seed/default/200/200"
                                }
                                alt={product.name}
                                className="h-16 w-16 rounded-xl object-cover"
                              />

                              <div className="min-w-0 flex-1">
                                <div className="line-clamp-1 font-semibold">
                                  {product.name}
                                </div>
                                <div className="mt-1 text-xs text-gray-500">
                                  {product.category || "未分類"}
                                </div>
                                <div className="mt-1 text-sm font-semibold">
                                  {formatPrice(product.price)}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
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