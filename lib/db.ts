// lib/db.ts

// 引入 Neon 官方提供的 serverless SQL 工具
import { neon } from "@neondatabase/serverless";

// 從環境變數讀取資料庫連線字串
const databaseUrl = process.env.DATABASE_URL;

// 如果沒有設定 DATABASE_URL，就直接丟出錯誤，避免程式偷偷壞掉
if (!databaseUrl) {
  throw new Error("DATABASE_URL 尚未設定，請檢查 .env.local");
}

// 建立可重複使用的 SQL 執行器
export const sql = neon(databaseUrl);