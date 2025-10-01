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
  title: "디고라",
  description: "상시적 직접 민주주의의 가능성을 실험하는 소셜 폴링 플랫폼",
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

        <Toaster />
      </body>
    </html>
  );
}
