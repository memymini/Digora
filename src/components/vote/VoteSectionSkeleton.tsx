"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const VoteSectionSkeleton = () => {
  return (
    <section className="mb-12 w-full max-w-5xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col items-center mb-8">
        <Skeleton className="h-10 w-2/3 max-w-md rounded-xl" />
        <Skeleton className="h-4 w-1/3 max-w-xs mt-3 rounded-lg" />
      </div>

      {/* Option Cards Area */}
      <div className="grid grid-cols-2 gap-3 md:gap-6 mb-8 h-[300px] md:h-[400px]">
        <Skeleton className="w-full h-full rounded-2xl md:rounded-[2rem]" />
        <Skeleton className="w-full h-full rounded-2xl md:rounded-[2rem]" />
      </div>

      {/* Footer/Progress Area */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-4 w-full rounded-full" />
      </div>
    </section>
  );
};
