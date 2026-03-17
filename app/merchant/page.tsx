// app/merchant/page.tsx

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import Link from "next/link";

async function getDashboardData() {
  try {
    const [productsCount, cartCount, pendingOrdersCount, shippedOrdersCount] =
      await Promise.all([
        sql`SELECT COUNT(*)::int AS count FROM products`,
        sql`SELECT COUNT(*)::int AS count FROM cart_items`,
        sql`SELECT COUNT(*)::int AS count FROM orders WHERE status = 'pending'`,
        sql`SELECT COUNT(*)::int AS count FROM orders WHERE status = 'shipped'`,
      ]);

    const latestOrders = await sql`
      SELECT
        orders.id,
        orders.total_amount,
        orders.status,
        orders.created_at,
        users.name as buyer_name
      FROM orders
      JOIN users ON orders.user_id = users.id
      ORDER BY orders.created_at DESC
      LIMIT 5
    `;

    const latestMessages = await sql`
      SELECT
        chat_messages.id,
        chat_messages.sender_type,
        chat_messages.message,
        chat_messages.created_at
      FROM chat_messages
      ORDER BY chat_messages.created_at DESC
      LIMIT 5
    `;

    return {
      productsCount: productsCount[0]?.count || 0,
      cartCount: cartCount[0]?.count || 0,
      pendingOrdersCount: pendingOrdersCount[0]?.count || 0,
      shippedOrdersCount: shippedOrdersCount[0]?.count || 0,
      latestOrders,
      latestMessages,
    };
  } catch (error) {
    console.error("dashboard data error:", error);

    return {
      productsCount: 0,
      cartCount: 0,
      pendingOrdersCount: 0,
      shippedOrdersCount: 0,
      latestOrders: [],
      latestMessages: [],
    };
  }
}

export default async function MerchantPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "merchant") {
    redirect("/login");
  }

  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">商家後台總覽</h1>
        <p className="mt-3 text-gray-600">
          歡迎回來，{user.name}。你可以在這裡快速查看商品、訂單、購物車與聊天狀況。
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-500">商品總數</div>
          <div className="mt-2 text-3xl font-bold">{data.productsCount}</div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-500">未結帳購物車數</div>
          <div className="mt-2 text-3xl font-bold">{data.cartCount}</div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-500">待出貨訂單</div>
          <div className="mt-2 text-3xl font-bold">{data.pendingOrdersCount}</div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-500">已出貨訂單</div>
          <div className="mt-2 text-3xl font-bold">{data.shippedOrdersCount}</div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold">快速操作</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/merchant/products"
              className="rounded-2xl border border-gray-200 p-5 transition hover:bg-gray-50"
            >
              <div className="text-lg font-semibold">商品管理</div>
              <div className="mt-2 text-sm text-gray-500">
                新增、編輯、上下架商品
              </div>
            </Link>

            <Link
              href="/merchant/orders"
              className="rounded-2xl border border-gray-200 p-5 transition hover:bg-gray-50"
            >
              <div className="text-lg font-semibold">訂單管理</div>
              <div className="mt-2 text-sm text-gray-500">
                查看待出貨與已出貨訂單
              </div>
            </Link>

            <Link
              href="/merchant/cart"
              className="rounded-2xl border border-gray-200 p-5 transition hover:bg-gray-50"
            >
              <div className="text-lg font-semibold">購物車觀察</div>
              <div className="mt-2 text-sm text-gray-500">
                查看購買者尚未結帳內容
              </div>
            </Link>

            <Link
              href="/merchant/chat"
              className="rounded-2xl border border-gray-200 p-5 transition hover:bg-gray-50"
            >
              <div className="text-lg font-semibold">聊天管理</div>
              <div className="mt-2 text-sm text-gray-500">
                回覆購買者與查看 AI 對話
              </div>
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="mb-5 text-2xl font-bold">最新訂單</h2>

          {data.latestOrders.length === 0 ? (
            <div className="text-gray-500">目前沒有訂單資料。</div>
          ) : (
            <div className="space-y-3">
              {data.latestOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-gray-200 p-4"
                >
                  <div className="font-semibold">{order.buyer_name}</div>
                  <div className="mt-1 text-sm text-gray-500 break-all">
                    訂單編號：{order.id}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                    <span>金額：${order.total_amount}</span>
                    <span>
                      狀態：
                      {order.status === "shipped" ? "已出貨 🚚" : "待出貨"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="mb-5 text-2xl font-bold">最新聊天訊息</h2>

        {data.latestMessages.length === 0 ? (
          <div className="text-gray-500">目前沒有聊天資料。</div>
        ) : (
          <div className="space-y-3">
            {data.latestMessages.map((msg: any) => (
              <div
                key={msg.id}
                className="rounded-2xl border border-gray-200 p-4"
              >
                <div className="text-sm font-semibold">
                  {msg.sender_type === "merchant"
                    ? "商家"
                    : msg.sender_type === "ai"
                    ? "AI 客服"
                    : "購買者"}
                </div>
                <div className="mt-2 line-clamp-2 text-gray-700">
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}