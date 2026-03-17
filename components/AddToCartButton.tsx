// components/AddToCartButton.tsx

"use client";

import { useState } from "react";

interface AddToCartButtonProps {
  productId: string;
}

export default function AddToCartButton({
  productId,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleAddToCart() {
    try {
      setLoading(true);

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "加入購物車失敗");
        return;
      }

      alert("加入購物車成功");
    } catch (error) {
      console.error("加入購物車失敗:", error);
      alert("加入購物車失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className="rounded-xl bg-black px-6 py-3 text-white disabled:opacity-50"
    >
      {loading ? "加入中..." : "加入購物車"}
    </button>
  );
}