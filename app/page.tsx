// app/page.tsx

import { sql } from "@/lib/db";
import HomeProductsClient from "./products-client";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
}

async function getProducts(): Promise<Product[]> {
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
        is_active
      FROM products
      WHERE is_active = true
      ORDER BY created_at DESC
    `;

    return products as Product[];
  } catch (error) {
    console.error("首頁讀取商品失敗:", error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  return <HomeProductsClient initialProducts={products} />;
}