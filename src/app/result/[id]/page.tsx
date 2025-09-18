"use client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  MessageCircle,
  Clock,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip,
  Legend,
} from "recharts";
import politicianA from "@/assets/images/politician-a.jpg";
import politicianB from "@/assets/images/politician-b.jpg";
import Image from "next/image";

// Mock data for comprehensive analysis
const mockResultData = {
  id: "1",
  title: "2024년 대선, 누가 더 적합할까요?",
  candidateA: { name: "김정치", votes: 15420, color: "#4169E1" },
  candidateB: { name: "박정책", votes: 12850, color: "#DC143C" },
  totalVotes: 28270,
  endDate: "2024년 3월 15일 18:00",
  duration: "7일간",
};

const hourlyData = [
  { time: "00:00", candidateA: 120, candidateB: 95 },
  { time: "03:00", candidateA: 80, candidateB: 70 },
  { time: "06:00", candidateA: 200, candidateB: 150 },
  { time: "09:00", candidateA: 450, candidateB: 380 },
  { time: "12:00", candidateA: 620, candidateB: 520 },
  { time: "15:00", candidateA: 380, candidateB: 420 },
  { time: "18:00", candidateA: 680, candidateB: 590 },
  { time: "21:00", candidateA: 520, candidateB: 480 },
];

const demographicData = [
  { age: "20대", candidateA: 2800, candidateB: 3200 },
  { age: "30대", candidateA: 4200, candidateB: 3800 },
  { age: "40대", candidateA: 3800, candidateB: 2900 },
  { age: "50대", candidateA: 2920, candidateB: 1950 },
  { age: "60대+", candidateA: 1700, candidateB: 1000 },
];

const genderData = [
  { gender: "남성", candidateA: 4500, candidateB: 3800 },
  { gender: "여성", candidateA: 3200, candidateB: 2900 },
];

const COLORS = ["#4169E1", "#DC143C"];

export default function VoteResult() {
  const { id } = useParams();
  const router = useRouter();

  const candidateAPercent = Math.round(
    (mockResultData.candidateA.votes / mockResultData.totalVotes) * 100
  );
  const candidateBPercent = 100 - candidateAPercent;

  const pieData = [
    {
      name: mockResultData.candidateA.name,
      value: mockResultData.candidateA.votes,
    },
    {
      name: mockResultData.candidateB.name,
      value: mockResultData.candidateB.votes,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="p-0 h-auto text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="label-text">돌아가기</span>
          </Button>

          <div className="text-right">
            <div className="flex items-center gap-2 text-muted-foreground caption-text">
              <Clock className="w-4 h-4" />
              <span>투표 종료: {mockResultData.endDate}</span>
            </div>
          </div>
        </div>

        {/* Title & Final Results */}
        <Card className="p-8 card-shadow mb-8">
          <div className="text-center mb-8">
            <h1 className="heading-2 sm:heading-1 mb-4">
              {mockResultData.title}
            </h1>
            <div className="flex items-center justify-center gap-4 caption-text text-muted-foreground">
              <span>
                총 {mockResultData.totalVotes.toLocaleString()}명 참여
              </span>
              <span>•</span>
              <span>{mockResultData.duration} 진행</span>
              <span>•</span>
              <span className="text-red-500 font-semibold">투표 종료</span>
            </div>
          </div>

          {/* Final Results Display */}
          <div className="flex flex-row items-center justify-center gap-4 sm:gap-16 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 ring-4 ring-vote-blue">
                <Image
                  src={politicianA}
                  alt={mockResultData.candidateA.name}
                  className="w-full h-full object-cover grayscale"
                />
              </div>
              <div className="text-center">
                <p className="text-lg sm:heading-2 text-vote-blue mb-1 sm:mb-2">
                  {mockResultData.candidateA.name}
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-vote-blue mb-1">
                  {candidateAPercent}%
                </p>
                <p className="caption-text text-muted-foreground">
                  {mockResultData.candidateA.votes.toLocaleString()}표
                </p>
                {candidateAPercent > candidateBPercent && (
                  <div className="mt-2 px-3 py-1 bg-vote-blue/10 text-vote-blue rounded-full">
                    <span className="caption-text font-semibold">당선</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-4xl sm:text-6xl font-bold text-muted-foreground">
                VS
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 ring-4 ring-vote-red">
                <Image
                  src={politicianB}
                  alt={mockResultData.candidateB.name}
                  className="w-full h-full object-cover grayscale"
                />
              </div>
              <div className="text-center">
                <p className="text-lg sm:heading-2 text-vote-red mb-1 sm:mb-2">
                  {mockResultData.candidateB.name}
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-vote-red mb-1">
                  {candidateBPercent}%
                </p>
                <p className="caption-text text-muted-foreground">
                  {mockResultData.candidateB.votes.toLocaleString()}표
                </p>
                {candidateBPercent > candidateAPercent && (
                  <div className="mt-2 px-3 py-1 bg-vote-red/10 text-vote-red rounded-full">
                    <span className="caption-text font-semibold">당선</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Final Vote Bar */}
          <div className="relative h-8 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-vote-blue transition-all duration-500"
              style={{ width: `${candidateAPercent}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-vote-red transition-all duration-500"
              style={{ width: `${candidateBPercent}%` }}
            />
          </div>
        </Card>

        {/* Analysis Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Hourly Voting Trend */}
          <Card className="p-6 card-shadow">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="heading-2">시간대별 투표 추이</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelStyle={{ color: "#2F2F2F" }}
                    contentStyle={{
                      backgroundColor: "#F8F9FA",
                      border: "1px solid #E9ECEF",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="candidateA"
                    stroke="#4169E1"
                    strokeWidth={3}
                    name={mockResultData.candidateA.name}
                  />
                  <Line
                    type="monotone"
                    dataKey="candidateB"
                    stroke="#DC143C"
                    strokeWidth={3}
                    name={mockResultData.candidateB.name}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Vote Distribution */}
          <Card className="p-6 card-shadow">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="heading-2">투표 분포</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      value.toLocaleString() + "표",
                      "득표수",
                    ]}
                    contentStyle={{
                      backgroundColor: "#F8F9FA",
                      border: "1px solid #E9ECEF",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Age Demographics */}
          <Card className="p-6 card-shadow">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="heading-2">연령대별 투표 현황</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={demographicData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
                  <XAxis dataKey="age" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [
                      value.toLocaleString() + "표",
                      "",
                    ]}
                    contentStyle={{
                      backgroundColor: "#F8F9FA",
                      border: "1px solid #E9ECEF",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="candidateA"
                    fill="#4169E1"
                    name={mockResultData.candidateA.name}
                  />
                  <Bar
                    dataKey="candidateB"
                    fill="#DC143C"
                    name={mockResultData.candidateB.name}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Gender Demographics */}
          <Card className="p-6 card-shadow">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="heading-2">성별 투표 현황</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={genderData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
                  <XAxis dataKey="gender" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [
                      value.toLocaleString() + "표",
                      "",
                    ]}
                    contentStyle={{
                      backgroundColor: "#F8F9FA",
                      border: "1px solid #E9ECEF",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="candidateA"
                    fill="#4169E1"
                    name={mockResultData.candidateA.name}
                  />
                  <Bar
                    dataKey="candidateB"
                    fill="#DC143C"
                    name={mockResultData.candidateB.name}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 card-shadow text-center">
            <div className="flex items-center justify-center mb-3">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <p className="heading-2 text-primary mb-1">
              {(
                mockResultData.candidateA.votes -
                mockResultData.candidateB.votes
              ).toLocaleString()}
            </p>
            <p className="caption-text text-muted-foreground">표 차이</p>
          </Card>

          <Card className="p-6 card-shadow text-center">
            <div className="flex items-center justify-center mb-3">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <p className="heading-2 text-primary mb-1">85.2%</p>
            <p className="caption-text text-muted-foreground">참여율</p>
          </Card>

          <Card className="p-6 card-shadow text-center">
            <div className="flex items-center justify-center mb-3">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <p className="heading-2 text-primary mb-1">1,247</p>
            <p className="caption-text text-muted-foreground">총 댓글 수</p>
          </Card>
        </div>
      </main>
    </div>
  );
}
