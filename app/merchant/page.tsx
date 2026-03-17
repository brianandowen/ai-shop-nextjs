// app/merchant/page.tsx

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MerchantPage() {
  const user = await getCurrentUser();

  // 沒登入或不是商家就導回登入頁
  if (!user || user.role !== "merchant") {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">商家後台</h1>
        <p className="mt-3 text-gray-600">
          歡迎回來，{user.name}。下一步我們會在這裡接上商品管理與聊天管理。
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">商品管理</h2>
          <p className="mt-2 text-gray-600">
            下一步會完成新增、編輯、刪除、上下架。
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">聊天管理</h2>
          <p className="mt-2 text-gray-600">
            下一步會完成使用者 / 商家 / AI 對話流程。
          </p>
        </div>
      </div>
    </div>
  );
}