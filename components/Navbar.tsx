// components/Navbar.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface CurrentUser {
  id: string;
  role: "merchant" | "user";
  name: string;
}

export default function Navbar() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/me", {
          cache: "no-store",
        });
        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("取得登入資訊失敗:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, []);

  async function handleLogout() {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        alert("已登出");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("登出失敗:", error);
      alert("登出失敗");
    }
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold">
          AI 單商家電商
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/">首頁</Link>

          {!loading && !user && <Link href="/login">登入</Link>}

          {!loading && user && user.role === "user" && (
            <>
              <span className="text-gray-500">您好，{user.name}</span>
              <Link href="/cart">購物車</Link>
              <Link href="/orders">我的訂單</Link>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-black px-3 py-2 text-white"
              >
                登出
              </button>
            </>
          )}

          {!loading && user && user.role === "merchant" && (
            <>
              <span className="text-gray-500">商家：{user.name}</span>
              <Link href="/merchant">商家後台</Link>
              <Link href="/merchant/products">商品管理</Link>
              <Link href="/merchant/cart">購物車名單</Link>
              <Link href="/merchant/orders">訂單管理</Link>
              <Link href="/merchant/chat">聊天管理</Link>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-black px-3 py-2 text-white"
              >
                登出
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}