"use client";
import { Button } from "@/components/ui/button";
import { VoteFeed } from "@/components/VoteFeed";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Home() {
  const [animationStep, setAnimationStep] = React.useState(0);

  React.useEffect(() => {
    const timeouts = [
      setTimeout(() => setAnimationStep(1), 200), // Show H1
      setTimeout(() => setAnimationStep(2), 600), // Show Subtitle
      setTimeout(() => setAnimationStep(3), 1000), // Show the rest
    ];

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-background w-full">
      <main className="container mx-auto px-6 py-8 w-full gap-8 flex flex-col sm:gap-12">
        {/* Hero Section */}
        <section className="flex flex-col items-center w-full gap-8 py-4 text-center h-auto md:gap-12 md:py-24">
          <h1
            className={`mb-2 text-2xl sm:text-3xl font-extrabold leading-tight text-center text-transparent md:text-5xl bg-gradient-to-r from-primary via-vote-blue to-vote-red bg-clip-text ${
              animationStep >= 1 ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            디지털 시대의 새로운 민주주의
          </h1>
          <p
            className={`mb-4 text-3xl sm:text-4xl font-extrabold text-card-foreground md:text-6xl ${
              animationStep >= 2 ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            당신의 선택은?
          </p>

          <div
            className={`flex flex-col gap-8 items-center md:gap-12 w-full ${
              animationStep >= 3 ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <div className="flex items-center w-full max-w-250 gap-4 justify-center sm:justify-around md:gap-8">
              <div className="relative w-[100%]">
                <div className="relative aspect-[3/4] overflow-hidden transition-all duration-300">
                  <Image
                    src="/images/politician-a.jpg"
                    fill
                    alt="politician-a"
                    className="object-cover grayscale"
                  />
                </div>
              </div>

              <span className="text-2xl font-black md:text-4xl">vs</span>
              <div className="relative w-[100%]">
                <div className="relative aspect-[3/4] overflow-hidden transition-all duration-300">
                  <Image
                    src="/images/politician-b.jpg"
                    fill
                    alt="politician-a"
                    className="object-cover grayscale"
                  />
                </div>
              </div>
            </div>
            <p className="max-w-2xl mx-auto body-text text-muted-foreground md:body-text-1">
              베리뱃지 시스템과 함께하는
              <br className="sm:hidden" /> 검증된 익명 기반의 소셜 폴링
              플랫폼에서
              <br />
              정치적 이슈에 대한 당신의 목소리를 들려주세요.
            </p>
            <Button variant="vote" size="lg">
              <Link href="/vote/1" className="label-text md:label-text-1">
                투표하러 가기
              </Link>
            </Button>
          </div>
        </section>

        {/* Active Votes Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-2 sm:heading-1">실시간 인기 투표🔥</h2>
            <div className="flex items-center gap-2 caption-text text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>실시간 업데이트</span>
            </div>
          </div>

          <VoteFeed />
        </section>
      </main>
    </div>
  );
}
