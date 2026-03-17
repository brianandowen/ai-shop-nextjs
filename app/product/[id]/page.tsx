// app/product/[id]/page.tsx

import { formatPrice } from "@/lib/utils";
import { sql } from "@/lib/db";
import AddToCartButton from "@/components/AddToCartButton";

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

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getProduct(id: string): Promise<Product | null> {
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
      WHERE id = ${id}
      LIMIT 1
    `;

    if (products.length === 0) {
      return null;
    }

    return products[0] as Product;
  } catch (error) {
    console.error("讀取商品詳情失敗:", error);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product || !product.is_active) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        找不到商品
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 rounded-3xl bg-white p-8 shadow-sm md:grid-cols-2">
      <div>
        <img
          src={product.image_url || "https://picsum.photos/seed/default/800/600"}
          alt={product.name}
          className="w-full rounded-2xl object-cover"
        />
      </div>

      <div className="space-y-4">
        <div className="text-sm text-gray-500">
          {product.category || "未分類"}
        </div>

        <h1 className="text-3xl font-bold">{product.name}</h1>

        <p className="leading-7 text-gray-700">{product.description}</p>

        <div className="text-2xl font-semibold">
          {formatPrice(product.price)}
        </div>

        <div className="text-gray-500">庫存：{product.stock}</div>

        <AddToCartButton productId={product.id} />
      </div>
    </div>
  );
}