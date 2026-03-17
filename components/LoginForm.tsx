// components/LoginForm.tsx

"use client";

import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * 送出登入
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "登入失敗");
        return;
      }

      // 根據角色導頁
      if (data.user.role === "merchant") {
        window.location.href = "/merchant";
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("登入失敗:", error);
      alert("登入失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 max-w-md space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h1 className="text-2xl font-bold">登入</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="請輸入帳號"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">密碼</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="請輸入密碼"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
      >
        {loading ? "登入中..." : "登入"}
      </button>

      <div className="rounded-xl bg-gray-100 p-4 text-sm text-gray-700">
        <p className="font-semibold">測試帳號</p>
        <p>商家：merchant@test.com / 123456</p>
        <p>使用者：user@test.com / 123456</p>
      </div>
    </form>
  );
}