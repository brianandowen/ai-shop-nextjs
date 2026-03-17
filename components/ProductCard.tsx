// components/ProductCard.tsx

import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string | null;
  category: string | null;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <img
        src={product.image_url || "https://picsum.photos/seed/default/600/400"}
        alt={product.name}
        className="h-52 w-full object-cover"
      />

      <div className="space-y-3 p-4">
        <div className="text-sm text-gray-500">
          {product.category || "未分類"}
        </div>

        <h2 className="line-clamp-1 text-lg font-bold">{product.name}</h2>

        <p className="line-clamp-2 text-sm leading-6 text-gray-600">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-gray-500">庫存：{product.stock}</span>
        </div>

        <Link
          href={`/product/${product.id}`}
          className="block rounded-xl bg-black px-4 py-3 text-center text-white"
        >
          點擊查看商品詳情
        </Link>
      </div>
    </div>
  );
}