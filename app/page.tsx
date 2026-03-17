// app/page.tsx

import ProductCard from "@/components/ProductCard";
import { sql } from "@/lib/db";

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
        is_active,
        created_at,
        updated_at
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

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">AI 單商家電商系統</h1>
        <p className="mt-3 text-gray-600">
          提供商品瀏覽、購物車、訂單、聊天與 AI 推薦功能。
        </p>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">商品列表</h2>

        {products.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-gray-500 shadow-sm">
            目前沒有商品
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}