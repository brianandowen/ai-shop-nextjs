// app/orders/page.tsx

import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UserOrdersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "user") {
    redirect("/login");
  }

  const orders = await sql`
    SELECT *
    FROM orders
    WHERE user_id = ${user.id}
    ORDER BY created_at DESC
  `;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">我的訂單</h1>
        <p className="mt-3 text-gray-600">
          這裡會顯示你的結帳紀錄與出貨狀態。
        </p>
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-sm">
        {orders.length === 0 ? (
          <div className="text-gray-500">目前沒有任何訂單。</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-gray-200 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-gray-500">訂單編號</div>
                    <div className="font-mono text-sm break-all">{order.id}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">訂單狀態</div>
                    <div className="font-semibold">
                      {order.status === "shipped" ? "已出貨 🚚" : "待出貨"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">總金額</div>
                    <div className="font-semibold">${order.total_amount}</div>
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