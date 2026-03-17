// app/api/merchant/cart/route.ts

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/merchant/cart
 * 商家查看所有使用者的購物車內容
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "merchant") {
      return NextResponse.json(
        {
          success: false,
          message: "只有商家可以查看購物車名單",
        },
        { status: 403 }
      );
    }

    const items = await sql`
      SELECT
        cart_items.id,
        cart_items.quantity,
        cart_items.created_at,
        users.id as user_id,
        users.name as user_name,
        users.email as user_email,
        products.id as product_id,
        products.name as product_name,
        products.price as product_price,
        products.image_url as product_image_url,
        products.category as product_category
      FROM cart_items
      JOIN users ON cart_items.user_id = users.id
      JOIN products ON cart_items.product_id = products.id
      ORDER BY cart_items.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("商家查看購物車失敗:", error);

    return NextResponse.json(
      {
        success: false,
        message: "取得購物車名單失敗",
      },
      { status: 500 }
    );
  }
}