// app/api/products/[id]/route.ts

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/products/[id]
 * 取得單一商品詳情
 */
export async function GET(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const products = await sql`
      SELECT
        id,
        name,
        description,
        price,
        stock,
        image_url,
        category,
        is_active,
        created_at,
        updated_at
      FROM products
      WHERE id = ${id}
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

    return NextResponse.json({
      success: true,
      product: products[0],
    });
  } catch (error) {
    console.error("取得商品詳情失敗:", error);

    return NextResponse.json(
      {
        success: false,
        message: "取得商品詳情失敗",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id]
 * 商家更新商品
 */
export async function PUT(req: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "merchant") {
      return NextResponse.json(
        {
          success: false,
          message: "只有商家可以編輯商品",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();

    const {
      name,
      description,
      price,
      stock,
      image_url,
      category,
      is_active,
    } = body;

    if (!name || !description || price === undefined || stock === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "請填寫完整商品資料",
        },
        { status: 400 }
      );
    }

    const updated = await sql`
      UPDATE products
      SET
        name = ${name},
        description = ${description},
        price = ${Number(price)},
        stock = ${Number(stock)},
        image_url = ${image_url || ""},
        category = ${category || ""},
        is_active = ${Boolean(is_active)}
      WHERE id = ${id}
      RETURNING
        id,
        name,
        description,
        price,
        stock,
        image_url,
        category,
        is_active,
        created_at,
        updated_at
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "找不到商品",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "商品更新成功",
      product: updated[0],
    });
  } catch (error) {
    console.error("更新商品失敗:", error);

    return NextResponse.json(
      {
        success: false,
        message: "更新商品失敗",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 * 商家刪除商品
 */
export async function DELETE(_: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "merchant") {
      return NextResponse.json(
        {
          success: false,
          message: "只有商家可以刪除商品",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const deleted = await sql`
      DELETE FROM products
      WHERE id = ${id}
      RETURNING id
    `;

    if (deleted.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "找不到商品",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "商品刪除成功",
    });
  } catch (error) {
    console.error("刪除商品失敗:", error);

    return NextResponse.json(
      {
        success: false,
        message: "刪除商品失敗",
      },
      { status: 500 }
    );
  }
}