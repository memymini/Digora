"use client";

import { VoteCard } from "./VoteCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useRef, useState, useEffect, useCallback } from "react";
import { useVoteFeedQuery } from "@/hooks/queries/useVoteFeedQuery";
import { cn } from "@/lib/utils";
import Link from "next/link";

const VoteFeedSkeleton = () => (
  <div className="flex items-center gap-6 overflow-x-hidden w-full sm:px-6">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="flex-shrink-0 w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-1.5rem)]"
      >
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    ))}
  </div>
);

export const VoteFeed = () => {
  const { data: voteData, isLoading, error } = useVoteFeedQuery();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    let closestIndex = 0;
    let smallestDistance = Infinity;

    children.forEach((child, index) => {
      const childRect = child.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const distance = Math.abs(
        childRect.left +
          childRect.width / 2 -
          (containerRect.left + containerRect.width / 2)
      );

      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (isLoading || !container || !voteData) return;

    const checkOverflow = () => {
      if (container) {
        setIsOverflowing(container.scrollWidth > container.clientWidth);
      }
    };

    let scrollTimeout: NodeJS.Timeout;
    const debouncedScrollHandler = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    checkOverflow();
    handleScroll();

    container.addEventListener("scroll", debouncedScrollHandler);
    window.addEventListener("resize", checkOverflow);

    const observer = new MutationObserver(() => {
      checkOverflow();
      handleScroll();
    });
    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      container.removeEventListener("scroll", debouncedScrollHandler);
      window.removeEventListener("resize", checkOverflow);
      observer.disconnect();
      clearTimeout(scrollTimeout);
    };
  }, [handleScroll, isLoading, voteData]);

  const scrollToCard = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const children = container.children;
    if (children[index]) {
      children[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  if (isLoading) {
    return <VoteFeedSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (!voteData || voteData.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        진행중인 투표가 없습니다.
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div
        ref={scrollContainerRef}
        className={cn(
          "flex items-center gap-6 overflow-x-auto hide-scrollbar scroll-snap-x-mandatory w-full p-6"
        )}
      >
        {voteData.map((vote) => (
          <Link
            key={vote.voteId}
            href={`/vote/${vote.voteId}`}
            className="w-full h-full"
          >
            <VoteCard data={vote} />
          </Link>
        ))}
      </div>

      {/* Dots Indicator */}
      {isOverflowing && voteData.length > 1 && (
        <div className="flex sm:hidden absolute bottom-0 left-1/2 -translate-x-1/2 items-center justify-center gap-2">
          {voteData.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                activeIndex === i ? "w-4 bg-primary" : "bg-muted"
              }`}
              aria-label={`Go to vote ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
