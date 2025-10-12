"use client";
import { Card } from "@/components/ui/card";
import { Summary } from "@/types";
import { TrendingUp, Users, MessageCircle } from "lucide-react";

interface SummaryStatisticsProps {
  data: Summary;
}

export function SummaryStatistics({ data }: SummaryStatisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="p-6 card-shadow text-center">
        <div className="flex items-center justify-center mb-3">
          <TrendingUp className="w-8 h-8 text-primary" />
        </div>
        <p className="heading-2 text-primary mb-1">
          {data.voteDifference.toLocaleString()}
        </p>
        <p className="caption-text text-muted-foreground">표 차이</p>
      </Card>

      <Card className="p-6 card-shadow text-center">
        <div className="flex items-center justify-center mb-3">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <p className="heading-2 text-primary mb-1">{data.participationRate}%</p>
        <p className="caption-text text-muted-foreground">참여율</p>
      </Card>

      <Card className="p-6 card-shadow text-center">
        <div className="flex items-center justify-center mb-3">
          <MessageCircle className="w-8 h-8 text-primary" />
        </div>
        <p className="heading-2 text-primary mb-1">
          {data.commentCount.toLocaleString()}
        </p>
        <p className="caption-text text-muted-foreground">총 댓글 수</p>
      </Card>
    </div>
  );
}
