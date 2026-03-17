// app/merchant/cart/page.tsx

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

interface MerchantCartItem {
  id: string;
  quantity: number;
  created_at: string;
  user_id: string;
  user_name: string;
  user_email: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image_url: string | null;
  product_category: string | null;
}

async function getMerchantCartItems(): Promise<MerchantCartItem[]> {
  try {
    const items = await sql`
      SELECT
        cart_items.id,
        cart_items.quantity,
        cart_items.created_at,
        users.id as user_id,
        users.name as user_name,
        users.email as user_email,
        products.id as product_id,
        products.name as product_name,
        products.price as product_price,
        products.image_url as product_image_url,
        products.category as product_category
      FROM cart_items
      JOIN users ON cart_items.user_id = users.id
      JOIN products ON cart_items.product_id = products.id
      ORDER BY cart_items.created_at DESC
    `;

    return items as MerchantCartItem[];
  } catch (error) {
    console.error("讀取商家購物車名單失敗:", error);
    return [];
  }
}

export default async function MerchantCartPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "merchant") {
    redirect("/login");
  }

  const items = await getMerchantCartItems();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">購物車名單</h1>
        <p className="mt-3 text-gray-600">
          商家可查看有哪些使用者把哪些商品加入購物車。
        </p>
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-sm">
        {items.length === 0 ? (
          <div className="text-gray-500">目前還沒有任何購物車資料。</div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 p-4 md:grid-cols-[120px_1fr]"
              >
                <div>
                  <img
                    src={
                      item.product_image_url ||
                      "https://picsum.photos/seed/default/300/200"
                    }
                    alt={item.product_name}
                    className="h-24 w-full rounded-xl object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-bold">{item.product_name}</h2>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                      {item.product_category || "未分類"}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    使用者：{item.user_name}（{item.user_email}）
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span>數量：{item.quantity}</span>
                    <span>{formatPrice(item.product_price)}</span>
                    <span className="font-semibold">
                      小計：{formatPrice(Number(item.product_price) * Number(item.quantity))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}