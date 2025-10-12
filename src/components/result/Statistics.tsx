"use client";
import { useVoteStatisticsQuery } from "@/hooks/queries/useVoteStatisticsQuery";
import { VoteDistributionChart } from "./VoteDistributionChart";
import { TimelineChart } from "./TimelineChart";
import { AgeBarChart } from "./AgeBarChart";
import { GenderBarChart } from "./GenderBarChart";
import AgeStackedBarChart from "./AgeStackedBarChart";
import OverallStackedBarChart from "./OverallStackedBarChart";
import { SummaryStatistics } from "./SummaryStatistics";
import PieChart from "./PieChart";
import { Skeleton } from "@/components/ui/skeleton";

interface StatisticsProps {
  voteId: number;
}

const ChartSkeleton = () => <Skeleton className="h-64 w-full" />;

export default function Statistics({ voteId }: StatisticsProps) {
  const { data, isLoading, error } = useVoteStatisticsQuery(voteId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 my-16">
        <h2 className="heading-1 text-center">최종 결과 분석</h2>
        <div className="grid lg:grid-cols-3 gap-8 my-8">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <h2 className="heading-1 text-center">상세 분석</h2>
        <div className="grid lg:grid-cols-2 gap-8 my-8">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        <p>통계 데이터를 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-muted-foreground py-10">
        통계 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 my-16">
      <h2 className="heading-1 text-center">최종 결과 분석</h2>
      <div className="grid lg:grid-cols-3 gap-8 my-8">
        <VoteDistributionChart candidates={data.candidates} />
        <AgeStackedBarChart
          data={data.ageDistribution}
          candidates={data.candidates}
        />
        <OverallStackedBarChart
          data={data.overallDistribution}
          candidates={data.candidates}
        />
      </div>
      <h2 className="heading-1 text-center">상세 분석</h2>
      <div className="grid lg:grid-cols-2 gap-8 my-8">
        <TimelineChart data={data.timeline} candidates={data.candidates} />
        <PieChart candidates={data.candidates} />
        <AgeBarChart data={data.ageDistribution} candidates={data.candidates} />
        <GenderBarChart
          data={data.genderDistribution}
          candidates={data.candidates}
        />
      </div>
      <SummaryStatistics data={data.summary} />
    </div>
  );
}
