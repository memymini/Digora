import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { QueryProvider } from "./QueryProvider";
import { createClient } from "@/lib/supabase/server";
import { SessionProvider } from "./SessionProvider";
import { Toaster } from "react-hot-toast";
import ProgressBarProvider from "./ProgressBarProvider";

export const metadata: Metadata = {
  title: "디고라(Digora) |  검증된 익명이 온라인에서 만들어가는 '진짜' 여론",
  description: "상시적 직접민주주의의 가능성을 실험하는 온라인 정치 광장",
  keywords: [
    "Digora",
    "디고라",
    "소셜 폴링",
    "VeriBadge",
    "정치인 월드컵",
    "정치 여론조사",
    "디지털 직접 민주주의",
  ],
  authors: [{ name: "Digora Project Team" }],
  openGraph: {
    title: "디고라(Digora) |  검증된 익명이 온라인에서 만들어가는 '진짜' 여론",
    description:
      "21c 직접민주주의 구현 가능성 실험, ‘검증된 익명’이 만드는 디지털 토론 광장",
    url: "https://digora.kr",
    siteName: "디고라",
    images: [
      {
        url: "/images/logo-2.png", // OpenGraph 대표 이미지
        width: 1200,
        height: 600,
        alt: "Digora Open Graph Image",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "디고라(Digora) | Verified Social Polling Platform",
    description:
      "21c 직접민주주의 구현 가능성 실험, ‘검증된 익명’이 만드는 디지털 토론 광장",
    images: ["/images/logo-2.png"],
  },
  metadataBase: new URL("https://digora.kr"),
  category: "Politics",
  applicationName: "Digora",
  creator: "Digora Dev Team",
  publisher: "Digora Project",
  alternates: {
    canonical: "https://digora.kr",
    languages: {
      ko: "https://digora.kr",
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let session = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    session = { user, profile };
  }

  return (
    <html lang="ko">
      <body className="">
        <QueryProvider>
          <ProgressBarProvider>
            <SessionProvider session={session}>
              <Header />
              {children}
              <Footer />
            </SessionProvider>
          </ProgressBarProvider>
        </QueryProvider>

        <Toaster
          toastOptions={{
            className: "font-pretendard",
            style: {
              fontFamily: "var(--font-pretendard)",
            },
            iconTheme: {
              primary: "var(--color-primary)",
              secondary: "var(--color-secondary)",
            },
            success: {
              iconTheme: {
                primary: "var(--color-primary)",
                secondary: "var(--color-secondary)",
              },
            },
            error: {
              iconTheme: {
                primary: "var(--color-vote-red)",
                secondary: "var(--color-secondary)",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
