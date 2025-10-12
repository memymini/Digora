"use client";
import { VoteFeed } from "@/components/home/VoteFeed";
import { useHeroVoteQuery } from "@/hooks/queries/useHeroVoteQuery";
import { HeroVoteSection } from "@/components/home/HeroVote";
import { DefaultHero } from "@/components/home/DefaultHero";
import { Skeleton } from "@/components/ui/skeleton";

const HeroSectionSkeleton = () => (
  <section className="flex flex-col items-center w-full gap-8 py-4 text-center h-auto md:gap-12 md:py-24">
    <Skeleton className="h-12 w-3/4" />
    <Skeleton className="h-8 w-1/2" />
    <div className="w-full max-w-250">
      <div className="flex items-center justify-center mb-6 w-full gap-2 sm:gap-4">
        <div className="flex flex-col items-center gap-4 w-full">
          <Skeleton className="aspect-[3/4] w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col items-center gap-4 w-full">
          <Skeleton className="aspect-[3/4] w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  </section>
);

export default function Home() {
  const { data: heroVote, isLoading } = useHeroVoteQuery();
  return (
    <div className="min-h-screen bg-background w-full">
      <main className="container mx-auto px-6 pt-24 w-full gap-4 flex flex-col sm:gap-12 items-center">
        <h1 className="w-fit mb-2 text-3xl md:text-5xl font-black leading-tight text-center text-transparent bg-gradient-to-r from-vote-blue via-primary to-vote-red bg-clip-text ">
          여론의 새로운 기준,
          <br className="sm:hidden" />
          디고라(Digital + Agora)
        </h1>
        <p className="max-w-2xl mx-auto body-text text-muted-foreground md:body-text-1 text-center">
          온라인 커뮤니티는 <strong>신뢰</strong>를,
          <br className="sm:hidden" /> 전통 여론조사는
          <strong>시대</strong>를 잃었습니다.
          <br />
          디고라에서 왜곡 없는 '진짜' 여론을 확인하세요.
        </p>
        {/* Hero Section */}
        {isLoading ? (
          <HeroSectionSkeleton />
        ) : heroVote ? (
          <HeroVoteSection data={heroVote} />
        ) : (
          <DefaultHero />
        )}

        {/* Active Votes Section */}
        <section className="mt-24 w-full">
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
