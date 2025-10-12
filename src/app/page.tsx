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
        <h1 className="w-fit mb-2 text-3xl md:text-5xl font-extrabold leading-tight text-center text-transparent bg-gradient-to-r from-vote-blue via-primary to-vote-red bg-clip-text ">
          디지털 시대의 <br className="sm:hidden" />
          새로운 민주주의
        </h1>
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
