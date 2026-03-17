// lib/utils.ts

/**
 * 將價格格式化成台幣顯示
 * 例如 1290 => NT$1,290
 */
export function formatPrice(price: number) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(price);
}