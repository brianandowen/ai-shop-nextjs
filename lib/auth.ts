// lib/auth.ts

import { cookies } from "next/headers";

/**
 * 取得目前登入者資訊
 * 這裡直接從 cookie 讀取
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();

  const userId = cookieStore.get("userId")?.value || null;
  const role = cookieStore.get("role")?.value || null;
  const userName = cookieStore.get("userName")?.value || null;

  if (!userId || !role || !userName) {
    return null;
  }

  return {
    id: userId,
    role,
    name: decodeURIComponent(userName),
  };
}

/**
 * 是否已登入
 */
export async function isLoggedIn() {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * 是否為商家
 */
export async function isMerchant() {
  const user = await getCurrentUser();
  return user?.role === "merchant";
}

/**
 * 是否為一般使用者
 */
export async function isNormalUser() {
  const user = await getCurrentUser();
  return user?.role === "user";
}