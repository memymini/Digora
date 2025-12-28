"use client";
import { useHeroVoteQuery } from "@/hooks/queries/useHeroVoteQuery";
import { Skeleton } from "@/components/ui/skeleton";
import { DefaultHero } from "./DefaultHero";
import { HeroOption } from "./HeroOption";

const HeroSectionSkeleton = () => {
  return (
    <section className="mb-12">
      {/* Header Text Skeleton */}
      <div className="text-center mb-6 flex flex-col items-center">
        <Skeleton className="h-10 w-64 md:w-96 mb-2 rounded-lg" />
        <Skeleton className="h-5 w-48 rounded-lg" />
      </div>

      {/* Main Card Skeleton */}
      <Skeleton className="rounded-3xl overflow-hidden relative h-[400px] md:h-[384px]">
        {/* Bottom Footer Area */}
        <div className="absolute bottom-0 w-full bg-slate-900 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Skeleton className="h-6 w-full sm:w-1/2 bg-slate-700/50" />
          <Skeleton className="h-10 w-full sm:w-32 rounded-full bg-slate-700/50" />
        </div>
      </Skeleton>
    </section>
  );
};

export const HeroSection = () => {
  const { data, isLoading } = useHeroVoteQuery();
  const optionA = data?.options[0];
  const optionB = data?.options[1];

  if (isLoading) return <HeroSectionSkeleton />;
  if (!data || !optionA || !optionB) return <DefaultHero />; // Handle error/empty state gracefully

  return (
    <section className="mb-12">
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
          여론의 새로운 기준{" "}
          <span className="bg-gradient-to-r from-vote-blue to-vote-red bg-clip-text text-transparent font-black">
            디고라
          </span>
        </h1>
        <p className="text-slate-500 text-sm md:text-base">
          여러분의 의견을 보여주세요.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative group cursor-pointer battle-card">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 z-20 shadow-lg">
          <div className="live-indicator"></div>누적 클릭수 {data.totalCount}
        </div>

        <div className="flex flex-col flex-row h-auto md:h-96">
          <HeroOption option={optionA} theme="indigo" />

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-white rounded-full w-12 h-12 md:w-20 md:h-20 flex items-center justify-center font-black text-lg md:text-3xl shadow-lg border-4 border-slate-100 italic text-slate-800">
              VS
            </div>
          </div>

          <HeroOption option={optionB} theme="rose" align="right" />
        </div>

        <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-slate-800 transition-colors">
          <div className="font-bold text-lg text-center sm:text-left break-keep">
            {data.title}
          </div>
          <button className="bg-brand-main hover:bg-indigo-400 text-white px-6 py-2 rounded-full font-bold text-sm transition-colors shadow-lg shadow-indigo-500/30 w-full sm:w-auto">
            🔥 지금 참여하기
          </button>
        </div>
      </div>
    </section>
  );
};
