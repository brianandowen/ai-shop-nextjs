// app/cart/cart-client.tsx

"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils";

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
}

interface CartClientProps {
  initialItems: CartItem[];
}

export default function CartClient({ initialItems }: CartClientProps) {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function refreshCart() {
    try {
      const res = await fetch("/api/cart", {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("刷新購物車失敗:", error);
    }
  }

  async function handleChangeQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) return;

    try {
      setLoadingId(cartItemId);

      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart_item_id: cartItemId,
          quantity,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "更新失敗");
        return;
      }

      await refreshCart();
    } catch (error) {
      console.error("更新數量失敗:", error);
      alert("更新數量失敗");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleRemove(cartItemId: string) {
    const confirmed = window.confirm("確定要移除這個商品嗎？");
    if (!confirmed) return;

    try {
      setLoadingId(cartItemId);

      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart_item_id: cartItemId,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "移除失敗");
        return;
      }

      await refreshCart();
    } catch (error) {
      console.error("移除商品失敗:", error);
      alert("移除商品失敗");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleCheckout() {
    try {
      const confirmed = window.confirm("確認要送出結帳嗎？");
      if (!confirmed) return;

      const res = await fetch("/api/checkout", {
        method: "POST",
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "結帳失敗");
        return;
      }

      alert(data.message);
      window.location.href = "/orders";
    } catch (error) {
      console.error("checkout error:", error);
      alert("結帳失敗");
    }
  }

  const totalAmount = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
  }, [items]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">購物車</h1>
        <p className="mt-3 text-gray-600">
          目前僅示範加入購物車，不進行真實金流。
        </p>
      </section>

      {items.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-gray-500">目前購物車是空的。</p>
        </div>
      ) : (
        <>
          <section className="space-y-4 rounded-3xl bg-white p-8 shadow-sm">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 p-4 md:grid-cols-[120px_1fr_auto]"
              >
                <div>
                  <img
                    src={
                      item.image_url ||
                      "https://picsum.photos/seed/default/300/200"
                    }
                    alt={item.name}
                    className="h-24 w-full rounded-xl object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-500">
                    {item.category || "未分類"}
                  </div>

                  <h2 className="text-lg font-bold">{item.name}</h2>

                  <p className="line-clamp-2 text-sm text-gray-600">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="font-semibold">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-gray-500">庫存：{item.stock}</span>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 md:min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleChangeQuantity(item.id, Number(item.quantity) - 1)
                      }
                      disabled={
                        loadingId === item.id || Number(item.quantity) <= 1
                      }
                      className="rounded-lg border px-3 py-2 disabled:opacity-50"
                    >
                      -
                    </button>

                    <span className="min-w-[40px] text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        handleChangeQuantity(item.id, Number(item.quantity) + 1)
                      }
                      disabled={loadingId === item.id}
                      className="rounded-lg border px-3 py-2 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>

                  <div className="font-semibold">
                    小計：
                    {formatPrice(
                      Number(item.price) * Number(item.quantity)
                    )}
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={loadingId === item.id}
                    className="rounded-xl bg-red-600 px-4 py-2 text-white disabled:opacity-50"
                  >
                    {loadingId === item.id ? "處理中..." : "移除"}
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold">購物車總計</h2>
            <div className="mt-4 text-3xl font-bold">
              {formatPrice(totalAmount)}
            </div>

            <button
              onClick={handleCheckout}
              className="mt-6 rounded-xl bg-black px-6 py-3 text-white"
            >
              結帳
            </button>
          </section>
        </>
      )}
    </div>
  );
}