import { AgeDemographicsChart } from "@/components/result/AgeDemographicsChart";
import { GenderDemographicsChart } from "@/components/result/GenderDemographicsChart";
import { SummaryStatistics } from "@/components/result/SummaryStatistics";
import { ResultResponse, StatisticResponse } from "@/lib/types";
import { HourlyTrendChart } from "@/components/result/HourlyTrendChart";
import FinalResult from "@/components/result/FinalResult";
import BackButton from "@/components/common/BackButton";
import { VoteDistributionChart } from "@/components/result/VoteDistributionChart";
import { AgePyramidChart } from "@/components/result/AgePyramidChart";
import { GenderPyramidChart } from "@/components/result/GenderPyramidChart";

// 투표 상세 및 전체 결과 데이터
export const mockResultData: ResultResponse = {
  voteId: 1,
  title: "2024년 대선, 누가 더 적합할까요?",
  totalCount: 30840,
  duration: 7,
  status: "closed",
  candidates: [
    {
      name: "김정치",
      imageUrl: "/images/politician-a.jpg",
      count: 15420,
      percent: 55,
    },
    {
      name: "박정책",
      imageUrl: "/images/politician-b.jpg",
      count: 15420,
      percent: 55,
    },
  ],
};

// 통계 데이터
export const mockStatisticData: StatisticResponse = {
  ageGroups: [
    {
      key: "20s",
      totalCount: 2827,
      totalPercent: 10,
      results: [
        { count: 1980, percent: 70 },
        { count: 847, percent: 30 },
      ],
    },
    {
      key: "30s",
      totalCount: 3000,
      totalPercent: 12,
      results: [
        { count: 2100, percent: 70 },
        { count: 900, percent: 30 },
      ],
    },
    {
      key: "40s",
      totalCount: 3000,
      totalPercent: 12,
      results: [
        { count: 2100, percent: 70 },
        { count: 900, percent: 30 },
      ],
    },
    {
      key: "50s",
      totalCount: 3000,
      totalPercent: 12,
      results: [
        { count: 2100, percent: 70 },
        { count: 900, percent: 30 },
      ],
    },
    {
      key: "60s_plus",
      totalCount: 3000,
      totalPercent: 12,
      results: [
        { count: 2100, percent: 70 },
        { count: 900, percent: 30 },
      ],
    },
  ],
  genderGroups: [
    {
      key: "male",
      totalCount: 15000,
      totalPercent: 49,
      results: [
        { count: 9000, percent: 60 },
        { count: 6000, percent: 40 },
      ],
    },
    {
      key: "female",
      totalCount: 15840,
      totalPercent: 51,
      results: [
        { count: 8420, percent: 53 },
        { count: 7420, percent: 47 },
      ],
    },
  ],
  dailyTrend: [
    { time: "9월 12일", candidateA: 1200, candidateB: 1100 },
    { time: "9월 13일", candidateA: 1500, candidateB: 1300 },
    { time: "9월 14일", candidateA: 1800, candidateB: 1900 },
    { time: "9월 15일", candidateA: 2200, candidateB: 2100 },
    { time: "9월 16일", candidateA: 2800, candidateB: 2500 },
    { time: "9월 17일", candidateA: 3500, candidateB: 3100 },
    { time: "9월 18일", candidateA: 2420, candidateB: 3420 },
  ],
};

export default function ResultPage() {
  const statisticData = mockStatisticData;
  const resultData = mockResultData;
  const candidateA = mockResultData.candidates[0];
  const candidateB = mockResultData.candidates[1];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <BackButton />

        {/* Title & Final Results */}
        <FinalResult data={resultData} />
        {/* 날짜별 차트 */}

        {/* Analysis Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
          <HourlyTrendChart
            data={statisticData.dailyTrend}
            candidateAName={candidateA.name}
            candidateBName={candidateB.name}
          />
          <VoteDistributionChart data={resultData.candidates} />
          <AgeDemographicsChart
            data={statisticData?.ageGroups}
            candidateAName={candidateA.name}
            candidateBName={candidateB.name}
          />
          <AgePyramidChart
            data={statisticData?.ageGroups}
            candidateAName={candidateA.name}
            candidateBName={candidateB.name}
          />
          <GenderDemographicsChart
            data={statisticData?.genderGroups}
            candidateAName={candidateA.name}
            candidateBName={candidateB.name}
          />
          <GenderPyramidChart
            data={statisticData?.genderGroups}
            candidateAName={candidateA.name}
            candidateBName={candidateB.name}
          />
        </div>

        {/* Summary Statistics */}
        <SummaryStatistics
          voteDifference={(candidateA?.count ?? 0) - (candidateB?.count ?? 0)}
          participationRate="85.2%"
          commentCount={1247}
        />
      </main>
    </div>
  );
}
