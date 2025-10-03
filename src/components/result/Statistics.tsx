import { StatisticResponse } from "@/lib/types";
import { VoteDistributionChart } from "./VoteDistributionChart";
import { TimelineChart } from "./TimelineChart";
import { AgeBarChart } from "./AgeBarChart";
import { GenderBarChart } from "./GenderBarChart";
import AgeStackedBarChart from "./AgeStackedBarChart.tsx";
import OverallStackedBarChart from "./OverallStackedBarChart";
import { SummaryStatistics } from "./SummaryStatistics";
import PieChart from "./PieChart";

// 통계 데이터
const mockStatisticData: StatisticResponse = {
  totalCount: 1234,
  candidates: [
    { id: 1, name: "김정치", count: 123, percent: 50 },
    { id: 2, name: "박정책", count: 123, percent: 50 },
  ],
  ageDistribution: [
    {
      age: "20대",
      totalCount: 2827,
      totalPercent: 10,
      results: [
        { id: 1, count: 1980, percent: 70 },
        { id: 2, count: 847, percent: 30 },
      ],
    },
    {
      age: "30대",
      totalCount: 3000,
      totalPercent: 12,
      results: [
        { id: 1, count: 2100, percent: 70 },
        { id: 2, count: 900, percent: 30 },
      ],
    },
    {
      age: "40대",
      totalCount: 3000,
      totalPercent: 12,
      results: [
        { id: 1, count: 2100, percent: 70 },
        { id: 2, count: 900, percent: 30 },
      ],
    },
    {
      age: "50대",
      totalCount: 3000,
      totalPercent: 12,
      results: [
        { id: 1, count: 2100, percent: 70 },
        { id: 2, count: 900, percent: 30 },
      ],
    },
    {
      age: "60대+",
      totalCount: 3000,
      totalPercent: 12,
      results: [
        { id: 1, count: 2100, percent: 70 },
        { id: 2, count: 900, percent: 30 },
      ],
    },
  ],
  genderDistribution: [
    {
      gender: "남성",
      totalCount: 15000,
      totalPercent: 49,
      results: [
        { id: 1, count: 9000, percent: 60 },
        { id: 2, count: 6000, percent: 40 },
      ],
    },
    {
      gender: "여성",
      totalCount: 15840,
      totalPercent: 51,
      results: [
        { id: 1, count: 8420, percent: 53 },
        { id: 2, count: 7420, percent: 47 },
      ],
    },
  ],
  overallDistribution: [
    {
      group: "20대 남성",
      totalCount: 2827,
      totalPercent: 10,
      results: [
        { id: 1, count: 1980, percent: 70 },
        { id: 2, count: 847, percent: 30 },
      ],
    },
    {
      group: "20대 여성",
      totalCount: 3000,
      totalPercent: 12,
      results: [
        { id: 1, count: 2100, percent: 70 },
        { id: 2, count: 900, percent: 30 },
      ],
    },
    {
      group: "30대 남성",
      totalCount: 3000,
      totalPercent: 12,
      results: [
        { id: 1, count: 2100, percent: 70 },
        { id: 2, count: 900, percent: 30 },
      ],
    },
    {
      group: "30대 여성",
      totalCount: 3000,
      totalPercent: 12,
      results: [
        { id: 1, count: 2100, percent: 70 },
        { id: 2, count: 900, percent: 30 },
      ],
    },
    {
      group: "40대 남성",
      totalCount: 3000,
      totalPercent: 12,
      results: [
        { id: 1, count: 2100, percent: 70 },
        { id: 2, count: 900, percent: 30 },
      ],
    },
    {
      group: "40대 여성",
      totalCount: 3000,
      totalPercent: 12,
      results: [
        { id: 1, count: 2100, percent: 70 },
        { id: 2, count: 900, percent: 30 },
      ],
    },
  ],
  timeline: [
    {
      date: "9.12",
      results: [
        { id: 1, count: 2100, percent: 70 },
        { id: 2, count: 900, percent: 30 },
      ],
    },
    {
      date: "9.13",
      results: [
        { id: 1, count: 2100, percent: 70 },
        { id: 2, count: 900, percent: 30 },
      ],
    },
    {
      date: "9.14",
      results: [
        { id: 1, count: 2100, percent: 70 },
        { id: 2, count: 900, percent: 30 },
      ],
    },
    {
      date: "9.15",
      results: [
        { id: 1, count: 2100, percent: 70 },
        { id: 2, count: 900, percent: 30 },
      ],
    },
    {
      date: "9.16",
      results: [
        { id: 1, count: 2100, percent: 70 },
        { id: 2, count: 900, percent: 30 },
      ],
    },
    {
      date: "9.17",
      results: [
        { id: 1, count: 2100, percent: 70 },
        { id: 2, count: 900, percent: 30 },
      ],
    },
    {
      date: "9.18",
      results: [
        { id: 1, count: 2100, percent: 70 },
        { id: 2, count: 900, percent: 30 },
      ],
    },
  ],
  summary: {
    voteDifference: 1234,
    participationRate: 50.2,
    commentCount: 1234,
  },
};

export default function Statistics() {
  const data: StatisticResponse = mockStatisticData;
  return (
    <div className="flex flex-col gap-8 my-16">
      <h2 className="heading-1 text-center">최종 결과 분석</h2>
      <div className="grid lg:grid-cols-3 gap-8 my-8">
        {/* 최종 득표율 - 와플 차트 */}
        <VoteDistributionChart candidates={data.candidates} />
        {/* 연령대별 지지율 분포 - 100% 누적 막대 그래프 */}
        <AgeStackedBarChart
          data={data.ageDistribution}
          candidates={data.candidates}
        />
        {/* 그룹(연령,성)별 지지율 분포 - 100% 누적 막대 그래프 */}
        <OverallStackedBarChart
          data={data.overallDistribution}
          candidates={data.candidates}
        />
      </div>
      <h2 className="heading-1 text-center">상세 분석</h2>
      <div className="grid lg:grid-cols-2 gap-8 my-8">
        {/* 날짜별 투표 추이 - 선형 그래프 */}
        <TimelineChart data={data.timeline} candidates={data.candidates} />
        {/* 전체 투표 결과 - 원형 그래프 */}
        <PieChart candidates={data.candidates} />
        {/* 연령별 투표 분포 - 막대 그래프 */}
        <AgeBarChart
          ageDistribution={data.ageDistribution}
          candidates={data.candidates}
        />
        {/* 성별 투표 분포 - 막대 그래프 */}
        <GenderBarChart
          genderDistribution={data.genderDistribution}
          candidates={data.candidates}
        />
      </div>
      <SummaryStatistics data={data.summary} />
    </div>
  );
}
