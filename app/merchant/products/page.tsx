// app/merchant/products/page.tsx

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import MerchantProductsClient from "./products-client";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
}

async function getAllProductsForMerchant(): Promise<Product[]> {
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
      ORDER BY created_at DESC
    `;

    return products as Product[];
  } catch (error) {
    console.error("讀取商家商品失敗:", error);
    return [];
  }
}

export default async function MerchantProductsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "merchant") {
    redirect("/login");
  }

  const products = await getAllProductsForMerchant();

  return <MerchantProductsClient initialProducts={products} />;
}