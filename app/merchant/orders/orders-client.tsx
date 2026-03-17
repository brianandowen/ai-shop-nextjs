// app/merchant/orders/orders-client.tsx

"use client";

import { useState } from "react";

interface OrderRow {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  buyer_name: string;
  buyer_email: string;
}

export default function MerchantOrdersClient({
  initialOrders,
}: {
  initialOrders: OrderRow[];
}) {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleShip(orderId: string) {
    try {
      setLoadingId(orderId);

      const res = await fetch("/api/orders/ship", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_id: orderId }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "出貨失敗");
        return;
      }

      alert("出貨成功");

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: "shipped" } : order
        )
      );
    } catch (error) {
      console.error("ship error:", error);
      alert("出貨失敗");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">訂單管理</h1>
        <p className="mt-3 text-gray-600">
          這裡顯示已結帳的訂單，商家可在此安排出貨。
        </p>
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-sm">
        {orders.length === 0 ? (
          <div className="text-gray-500">目前沒有任何訂單。</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-gray-200 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-semibold">
                      購買者：{order.buyer_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.buyer_email}
                    </div>
                    <div className="text-sm text-gray-500 break-all">
                      訂單編號：{order.id}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div>金額：${order.total_amount}</div>
                    <div>
                      狀態：
                      <span className="ml-1 font-semibold">
                        {order.status === "shipped" ? "已出貨 🚚" : "待出貨"}
                      </span>
                    </div>
                  </div>

                  <div>
                    {order.status === "pending" ? (
                      <button
                        onClick={() => handleShip(order.id)}
                        disabled={loadingId === order.id}
                        className="rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
                      >
                        {loadingId === order.id ? "出貨中..." : "出貨"}
                      </button>
                    ) : (
                      <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm">
                        已完成出貨
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}