// app/api/merchant/products/route.ts

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/merchant/products
 * 商家取得全部商品（包含下架）
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "merchant") {
      return NextResponse.json(
        {
          success: false,
          message: "只有商家可以查看商品管理列表",
        },
        { status: 403 }
      );
    }

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
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("取得商家商品列表失敗:", error);

    return NextResponse.json(
      {
        success: false,
        message: "取得商家商品列表失敗",
      },
      { status: 500 }
    );
  }
}