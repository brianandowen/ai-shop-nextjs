// components/MerchantProductForm.tsx

"use client";

import { useEffect, useState } from "react";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
  is_active: boolean;
}

interface MerchantProductFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    image_url: string | null;
    category: string | null;
    is_active: boolean;
  } | null;
  onSuccess?: () => void;
  onCancelEdit?: () => void;
}

export default function MerchantProductForm({
  mode,
  initialData,
  onSuccess,
  onCancelEdit,
}: MerchantProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    image_url: "",
    category: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        price: initialData.price,
        stock: initialData.stock,
        image_url: initialData.image_url || "",
        category: initialData.category || "",
        is_active: initialData.is_active,
      });
    }

    if (mode === "create") {
      setFormData({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        image_url: "",
        category: "",
        is_active: true,
      });
    }
  }, [mode, initialData]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stock" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const url =
        mode === "create"
          ? "/api/products"
          : `/api/products/${initialData?.id}`;

      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "操作失敗");
        return;
      }

      alert(mode === "create" ? "商品新增成功" : "商品更新成功");

      if (mode === "create") {
        setFormData({
          name: "",
          description: "",
          price: 0,
          stock: 0,
          image_url: "",
          category: "",
          is_active: true,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error("商品表單送出失敗:", error);
      alert("操作失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-2xl font-bold">
        {mode === "create" ? "新增商品" : "編輯商品"}
      </h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium">商品名稱</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
          placeholder="請輸入商品名稱"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">商品描述</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="min-h-[120px] w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
          placeholder="請輸入商品描述"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium">價格</label>
          <input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
            placeholder="請輸入價格"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">庫存</label>
          <input
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
            placeholder="請輸入庫存"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">圖片網址</label>
        <input
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
          placeholder="例如：https://picsum.photos/seed/demo/600/400"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">分類</label>
        <input
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
          placeholder="例如：配件 / 鍵盤 / 耳機"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          name="is_active"
          type="checkbox"
          checked={formData.is_active}
          onChange={handleChange}
        />
        商品上架
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-50"
        >
          {loading
            ? mode === "create"
              ? "新增中..."
              : "更新中..."
            : mode === "create"
            ? "新增商品"
            : "儲存修改"}
        </button>

        {mode === "edit" && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border border-gray-300 px-5 py-3"
          >
            取消編輯
          </button>
        )}
      </div>
    </form>
  );
}