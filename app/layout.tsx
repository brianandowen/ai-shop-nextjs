// app/layout.tsx

import "./globals.css";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";

export const metadata = {
  title: "AI 單商家電商系統",
  description: "單商家電商系統 MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="bg-gray-100 text-black">
        <Navbar />
        <main className="mx-auto min-h-screen max-w-6xl px-6 py-8">
          {children}
        </main>
        <ChatWidget />
      </body>
    </html>
  );
}