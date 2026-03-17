// app/api/checkout/route.ts

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "user") {
      return NextResponse.json(
        { success: false, message: "請先登入購買者帳號" },
        { status: 401 }
      );
    }

    // 1. 取得購物車內容
    const cartItems = await sql`
      SELECT
        cart_items.id,
        cart_items.product_id,
        cart_items.quantity,
        products.price,
        products.stock,
        products.name,
        products.is_active
      FROM cart_items
      JOIN products ON cart_items.product_id = products.id
      WHERE cart_items.user_id = ${user.id}
      ORDER BY cart_items.created_at DESC
    `;

    if (cartItems.length === 0) {
      return NextResponse.json({
        success: false,
        message: "購物車是空的",
      });
    }

    // 2. 檢查商品是否上架與庫存是否足夠
    for (const item of cartItems) {
      if (!item.is_active) {
        return NextResponse.json({
          success: false,
          message: `商品「${item.name}」目前未上架，無法結帳`,
        });
      }

      if (Number(item.stock) < Number(item.quantity)) {
        return NextResponse.json({
          success: false,
          message: `商品「${item.name}」庫存不足`,
        });
      }
    }

    // 3. 計算總金額
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);

    // 4. 建立訂單
    const createdOrder = await sql`
      INSERT INTO orders (user_id, status, total_amount)
      VALUES (${user.id}, 'pending', ${totalAmount})
      RETURNING *
    `;

    const orderId = createdOrder[0].id;

    // 5. 建立訂單明細
    for (const item of cartItems) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (
          ${orderId},
          ${item.product_id},
          ${item.quantity},
          ${item.price}
        )
      `;
    }

    // 6. 結帳後立刻清空購物車
    await sql`
      DELETE FROM cart_items
      WHERE user_id = ${user.id}
    `;

    // 7. 寫入聊天提示：訂單已成立
    const rooms = await sql`
      SELECT id
      FROM chat_rooms
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    if (rooms.length > 0) {
      await sql`
        INSERT INTO chat_messages (room_id, sender_type, sender_id, message)
        VALUES (
          ${rooms[0].id},
          'ai',
          null,
          '您的訂單已成立，商家確認後將安排出貨。'
        )
      `;
    }

    return NextResponse.json({
      success: true,
      message: "結帳成功，已成立訂單",
      order_id: orderId,
    });
  } catch (error) {
    console.error("checkout error:", error);

    return NextResponse.json(
      { success: false, message: "結帳失敗" },
      { status: 500 }
    );
  }
}