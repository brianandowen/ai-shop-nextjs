// app/api/cart/route.ts

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/cart
 * 使用者查看自己的購物車
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "user") {
      return NextResponse.json(
        {
          success: false,
          message: "只有使用者可以查看購物車",
        },
        { status: 403 }
      );
    }

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
      WHERE cart_items.user_id = ${user.id}
      ORDER BY cart_items.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("取得購物車失敗:", error);

    return NextResponse.json(
      {
        success: false,
        message: "取得購物車失敗",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * 加入購物車
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "user") {
      return NextResponse.json(
        {
          success: false,
          message: "請先登入使用者帳號",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { product_id, quantity } = body;

    if (!product_id) {
      return NextResponse.json(
        {
          success: false,
          message: "缺少 product_id",
        },
        { status: 400 }
      );
    }

    const qty = Number(quantity || 1);

    if (qty <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "數量必須大於 0",
        },
        { status: 400 }
      );
    }

    const products = await sql`
      SELECT id, stock, is_active
      FROM products
      WHERE id = ${product_id}
      LIMIT 1
    `;

    if (products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "找不到商品",
        },
        { status: 404 }
      );
    }

    const product = products[0];

    if (!product.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "商品目前未上架",
        },
        { status: 400 }
      );
    }

    const existed = await sql`
      SELECT id, quantity
      FROM cart_items
      WHERE user_id = ${user.id}
      AND product_id = ${product_id}
      LIMIT 1
    `;

    if (existed.length > 0) {
      const newQuantity = Number(existed[0].quantity) + qty;

      await sql`
        UPDATE cart_items
        SET quantity = ${newQuantity}
        WHERE id = ${existed[0].id}
      `;

      return NextResponse.json({
        success: true,
        message: "已加入購物車，並更新數量",
      });
    }

    await sql`
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES (${user.id}, ${product_id}, ${qty})
    `;

    return NextResponse.json({
      success: true,
      message: "加入購物車成功",
    });
  } catch (error) {
    console.error("加入購物車失敗:", error);

    return NextResponse.json(
      {
        success: false,
        message: "加入購物車失敗",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cart
 * 修改數量
 */
export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "user") {
      return NextResponse.json(
        {
          success: false,
          message: "只有使用者可以修改購物車",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { cart_item_id, quantity } = body;

    if (!cart_item_id || quantity === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "缺少必要欄位",
        },
        { status: 400 }
      );
    }

    const qty = Number(quantity);

    if (qty <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "數量必須大於 0",
        },
        { status: 400 }
      );
    }

    const updated = await sql`
      UPDATE cart_items
      SET quantity = ${qty}
      WHERE id = ${cart_item_id}
      AND user_id = ${user.id}
      RETURNING id
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "找不到購物車項目",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "購物車數量更新成功",
    });
  } catch (error) {
    console.error("更新購物車失敗:", error);

    return NextResponse.json(
      {
        success: false,
        message: "更新購物車失敗",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart
 * 刪除購物車項目
 */
export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "user") {
      return NextResponse.json(
        {
          success: false,
          message: "只有使用者可以刪除購物車商品",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { cart_item_id } = body;

    if (!cart_item_id) {
      return NextResponse.json(
        {
          success: false,
          message: "缺少 cart_item_id",
        },
        { status: 400 }
      );
    }

    const deleted = await sql`
      DELETE FROM cart_items
      WHERE id = ${cart_item_id}
      AND user_id = ${user.id}
      RETURNING id
    `;

    if (deleted.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "找不到購物車項目",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "商品已從購物車移除",
    });
  } catch (error) {
    console.error("刪除購物車商品失敗:", error);

    return NextResponse.json(
      {
        success: false,
        message: "刪除購物車商品失敗",
      },
      { status: 500 }
    );
  }
}