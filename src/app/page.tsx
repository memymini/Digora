"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { VoteFeed } from "@/components/home/VoteFeed";
import { HeroSection } from "@/components/home/HeroSection";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_error: "로그인에 실패했습니다. 다시 시도해주세요.",
  profile_creation_failed: "프로필 생성에 실패했습니다. 다시 시도해주세요.",
};

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error && AUTH_ERROR_MESSAGES[error]) {
      toast.error(AUTH_ERROR_MESSAGES[error]);
      router.replace("/");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-background w-full">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <HeroSection />
        {/*투표리스트*/}
        <VoteFeed />
      </main>
    </div>
  );
}
