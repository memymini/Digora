import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { QueryProvider } from "./QueryProvider";

export const metadata: Metadata = {
  title: "디고라",
  description: "상시적 직접 민주주의의 가능성을 실험하는 소셜 폴링 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="">
        <QueryProvider>
          <Header />
          {children}
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
