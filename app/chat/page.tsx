// app/chat/page.tsx

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "user") {
    redirect("/login");
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold">聊天頁</h1>
      <p className="mt-3 text-gray-600">
        下一步會在這裡接上使用者 / 商家 / AI 聊天功能。
      </p>
    </div>
  );
}