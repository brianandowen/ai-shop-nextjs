// app/merchant/orders/page.tsx

import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import MerchantOrdersClient from "./orders-client";

interface OrderRow {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  buyer_name: string;
  buyer_email: string;
}

async function getOrders(): Promise<OrderRow[]> {
  const orders = await sql`
    SELECT
      orders.id,
      orders.user_id,
      orders.status,
      orders.total_amount,
      orders.created_at,
      users.name as buyer_name,
      users.email as buyer_email
    FROM orders
    JOIN users ON orders.user_id = users.id
    ORDER BY orders.created_at DESC
  `;

  return orders as OrderRow[];
}

export default async function MerchantOrdersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "merchant") {
    redirect("/login");
  }

  const orders = await getOrders();

  return <MerchantOrdersClient initialOrders={orders} />;
}