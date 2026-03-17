import OpenAI from "openai";

export async function GET() {

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "user", content: "說一句 hello" }
    ]
  });

  return Response.json({
    reply: completion.choices[0].message.content
  });

}