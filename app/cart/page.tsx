// app/cart/page.tsx

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import CartClient from "./cart-client";

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

async function getCartItems(userId: string): Promise<CartItem[]> {
  try {
    const items = await sql`
      SELECT
        cart_items.id,
        cart_items.user_id,
        cart_items.product_id,
        cart_items.quantity,
        cart_items.created_at,
        products.name,
        products.description,
        products.price,
        products.stock,
        products.image_url,
        products.category,
        products.is_active
      FROM cart_items
      JOIN products ON cart_items.product_id = products.id
      WHERE cart_items.user_id = ${userId}
      ORDER BY cart_items.created_at DESC
    `;

    return items as CartItem[];
  } catch (error) {
    console.error("讀取購物車失敗:", error);
    return [];
  }
}

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "user") {
    redirect("/login");
  }

  const items = await getCartItems(user.id);

  return <CartClient initialItems={items} />;
}