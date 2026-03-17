// lib/ai-chat.ts

import { sql } from "@/lib/db";
import { openai } from "@/lib/openai";

/**
 * 產生 AI 回覆
 * 根據目前商品資料、庫存、價格與描述來回答
 */
export async function generateAIReply(userMessage: string) {
  const products = await sql`
    SELECT
      name,
      description,
      price,
      stock,
      category,
      is_active
    FROM products
    WHERE is_active = true
    ORDER BY created_at DESC
  `;

  const productText =
    products.length > 0
      ? products
          .map((product, index) => {
            return `${index + 1}. 商品名稱：${product.name}
分類：${product.category || "未分類"}
價格：${product.price}
庫存：${product.stock}
介紹：${product.description}`;
          })
          .join("\n\n")
      : "目前沒有任何上架商品。";

  const systemPrompt = `
你是一個 3C 電商平台的 AI 客服助理。
你的任務是根據商店目前的商品資料，回答使用者的問題並做推薦。

請遵守以下規則：
1. 只能根據提供的商品資料回答，不要捏造不存在的商品。
2. 若使用者問預算，請優先推薦符合預算且有庫存的商品。
3. 若使用者問新手適合什麼，請從「描述中看起來適合新手、入門、日常使用」的商品推薦。
4. 若使用者問用途，例如電競、文書、直播、送禮，請根據描述做合理推薦。
5. 若商品沒庫存，不要優先推薦。
6. 回答要自然，像一般電商客服，不要太機械。
7. 回答請使用繁體中文。
8. 不需要用 JSON，直接用自然文字回答。
9. 若資訊不足，可以誠實說明。

目前商品資料如下：
${productText}
`;

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  return response.output_text?.trim() || "不好意思，我目前無法提供建議，請稍後再試。";
}