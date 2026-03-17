// app/api/orders/ship/route.ts

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "merchant") {
      return NextResponse.json(
        { success: false, message: "無權限" },
        { status: 403 }
      );
    }

    const { order_id } = await req.json();

    if (!order_id) {
      return NextResponse.json({
        success: false,
        message: "缺少 order_id",
      });
    }

    const orders = await sql`
      SELECT *
      FROM orders
      WHERE id = ${order_id}
      LIMIT 1
    `;

    if (orders.length === 0) {
      return NextResponse.json({
        success: false,
        message: "找不到訂單",
      });
    }

    const order = orders[0];

    if (order.status === "shipped") {
      return NextResponse.json({
        success: false,
        message: "此訂單已經出貨",
      });
    }

    const items = await sql`
      SELECT *
      FROM order_items
      WHERE order_id = ${order_id}
    `;

    // 先檢查庫存
    for (const item of items) {
      const products = await sql`
        SELECT id, name, stock
        FROM products
        WHERE id = ${item.product_id}
        LIMIT 1
      `;

      if (products.length === 0) {
        return NextResponse.json({
          success: false,
          message: "訂單中的商品不存在",
        });
      }

      const product = products[0];

      if (Number(product.stock) < Number(item.quantity)) {
        return NextResponse.json({
          success: false,
          message: `商品「${product.name}」庫存不足，無法出貨`,
        });
      }
    }

    // 再正式扣庫存
    for (const item of items) {
      await sql`
        UPDATE products
        SET stock = stock - ${item.quantity}
        WHERE id = ${item.product_id}
      `;
    }

    // 更新訂單狀態
    await sql`
      UPDATE orders
      SET status = 'shipped'
      WHERE id = ${order_id}
    `;

    // 聊天通知
    const rooms = await sql`
      SELECT id
      FROM chat_rooms
      WHERE user_id = ${order.user_id}
      LIMIT 1
    `;

    if (rooms.length > 0) {
      await sql`
        INSERT INTO chat_messages (room_id, sender_type, sender_id, message)
        VALUES (
          ${rooms[0].id},
          'ai',
          null,
          '您的訂單已出貨 🚚'
        )
      `;
    }

    return NextResponse.json({
      success: true,
      message: "出貨成功",
    });
  } catch (error) {
    console.error("ship error:", error);

    return NextResponse.json(
      { success: false, message: "出貨失敗" },
      { status: 500 }
    );
  }
}