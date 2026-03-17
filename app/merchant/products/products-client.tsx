// app/merchant/products/products-client.tsx

"use client";

import { useMemo, useState } from "react";
import MerchantProductForm from "@/components/MerchantProductForm";
import { formatPrice } from "@/lib/utils";

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

interface MerchantProductsClientProps {
  initialProducts: Product[];
}

export default function MerchantProductsClient({
  initialProducts,
}: MerchantProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function refreshProducts() {
    try {
      const res = await fetch("/api/merchant/products", {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("刷新商品列表失敗:", error);
    }
  }

  async function handleDelete(productId: string) {
    const confirmed = window.confirm("確定要刪除這個商品嗎？");
    if (!confirmed) return;

    try {
      setLoadingId(productId);

      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "刪除失敗");
        return;
      }

      alert("商品刪除成功");
      await refreshProducts();

      if (editingProduct?.id === productId) {
        setEditingProduct(null);
      }
    } catch (error) {
      console.error("刪除商品失敗:", error);
      alert("刪除失敗");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleToggleActive(product: Product) {
    try {
      setLoadingId(product.id);

      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...product,
          is_active: !product.is_active,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "狀態更新失敗");
        return;
      }

      await refreshProducts();

      if (editingProduct?.id === product.id) {
        setEditingProduct({
          ...product,
          is_active: !product.is_active,
        });
      }
    } catch (error) {
      console.error("切換上下架失敗:", error);
      alert("狀態更新失敗");
    } finally {
      setLoadingId(null);
    }
  }

  const activeCount = useMemo(
    () => products.filter((p) => p.is_active).length,
    [products]
  );

  const inactiveCount = useMemo(
    () => products.filter((p) => !p.is_active).length,
    [products]
  );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">商品管理</h1>
        <p className="mt-3 text-gray-600">
          在這裡可以新增、編輯、刪除商品，以及控制上架 / 下架。
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-gray-100 p-4">
            <div className="text-sm text-gray-500">商品總數</div>
            <div className="mt-2 text-2xl font-bold">{products.length}</div>
          </div>

          <div className="rounded-2xl bg-gray-100 p-4">
            <div className="text-sm text-gray-500">上架中</div>
            <div className="mt-2 text-2xl font-bold">{activeCount}</div>
          </div>

          <div className="rounded-2xl bg-gray-100 p-4">
            <div className="text-sm text-gray-500">下架中</div>
            <div className="mt-2 text-2xl font-bold">{inactiveCount}</div>
          </div>
        </div>
      </section>

      <MerchantProductForm
        mode={editingProduct ? "edit" : "create"}
        initialData={editingProduct}
        onSuccess={async () => {
          await refreshProducts();
          setEditingProduct(null);
        }}
        onCancelEdit={() => {
          setEditingProduct(null);
        }}
      />

      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold">商品列表</h2>

        {products.length === 0 ? (
          <div className="rounded-2xl bg-gray-100 p-6 text-gray-500">
            目前沒有商品
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 p-4 md:grid-cols-[120px_1fr_auto]"
              >
                <div>
                  <img
                    src={
                      product.image_url ||
                      "https://picsum.photos/seed/default/300/200"
                    }
                    alt={product.name}
                    className="h-24 w-full rounded-xl object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold">{product.name}</h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        product.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {product.is_active ? "上架中" : "下架中"}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500">
                    分類：{product.category || "未分類"}
                  </div>

                  <p className="line-clamp-2 text-sm text-gray-600">
                    {product.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="font-semibold">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-gray-500">庫存：{product.stock}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:w-[140px]">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="rounded-xl border border-gray-300 px-4 py-2"
                  >
                    編輯
                  </button>

                  <button
                    onClick={() => handleToggleActive(product)}
                    disabled={loadingId === product.id}
                    className="rounded-xl border border-gray-300 px-4 py-2 disabled:opacity-50"
                  >
                    {loadingId === product.id
                      ? "處理中..."
                      : product.is_active
                      ? "下架"
                      : "上架"}
                  </button>

                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={loadingId === product.id}
                    className="rounded-xl bg-red-600 px-4 py-2 text-white disabled:opacity-50"
                  >
                    {loadingId === product.id ? "刪除中..." : "刪除"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}