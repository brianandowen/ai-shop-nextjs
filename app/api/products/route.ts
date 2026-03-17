// app/api/products/route.ts

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/products
 * 前台取得所有上架商品
 */
export async function GET() {
  try {
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
      WHERE is_active = true
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("取得商品列表失敗:", error);

    return NextResponse.json(
      {
        success: false,
        message: "取得商品列表失敗",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * 商家新增商品
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "merchant") {
      return NextResponse.json(
        {
          success: false,
          message: "只有商家可以新增商品",
        },
        { status: 403 }
      );
    }

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

    const inserted = await sql`
      INSERT INTO products (
        name,
        description,
        price,
        stock,
        image_url,
        category,
        is_active
      )
      VALUES (
        ${name},
        ${description},
        ${Number(price)},
        ${Number(stock)},
        ${image_url || ""},
        ${category || ""},
        ${is_active ?? true}
      )
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

    return NextResponse.json({
      success: true,
      message: "商品新增成功",
      product: inserted[0],
    });
  } catch (error) {
    console.error("新增商品失敗:", error);

    return NextResponse.json(
      {
        success: false,
        message: "新增商品失敗",
      },
      { status: 500 }
    );
  }
}