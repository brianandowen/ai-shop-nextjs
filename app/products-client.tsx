// app/products-client.tsx

"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "./page";

export default function HomeProductsClient({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("全部");
  const [sortBy, setSortBy] = useState("latest");
  const [inStockOnly, setInStockOnly] = useState(false);

  const categories = useMemo(() => {
    const raw = initialProducts
      .map((p) => p.category || "未分類")
      .filter(Boolean);

    return ["全部", ...Array.from(new Set(raw))];
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    if (keyword.trim()) {
      const lower = keyword.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower) ||
          (p.category || "").toLowerCase().includes(lower)
      );
    }

    if (category !== "全部") {
      result = result.filter((p) => (p.category || "未分類") === category);
    }

    if (inStockOnly) {
      result = result.filter((p) => Number(p.stock) > 0);
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "stock-desc") {
      result.sort((a, b) => Number(b.stock) - Number(a.stock));
    }
    // latest 保持原順序

    return result;
  }, [initialProducts, keyword, category, sortBy, inStockOnly]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">AI 單商家電商系統</h1>
        <p className="mt-3 text-gray-600">
          提供商品瀏覽、購物車、訂單、聊天與 AI 推薦功能。
        </p>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">商品篩選</h2>
          <div className="text-sm text-gray-500">
            共 {filteredProducts.length} 筆商品
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium">搜尋商品</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="輸入商品名稱或關鍵字"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">商品分類</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">排序方式</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
            >
              <option value="latest">最新加入</option>
              <option value="price-asc">價格低到高</option>
              <option value="price-desc">價格高到低</option>
              <option value="stock-desc">庫存高到低</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              只看有庫存商品
            </label>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">商品列表</h2>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-gray-500 shadow-sm">
            沒有符合條件的商品
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}