import { Card } from "@/components/ui/card";
import { ElementType, ReactNode } from "react";

// 차트에서 사용될 표준 색상 배열
const COLORS = ["#4169E1", "#DC143C", "#20B2AA", "#FF8C00"];

interface Candidate {
  id: number | string;
  name: string;
}

interface ChartCardProps {
  title: string;
  children: ReactNode;
  candidates?: Candidate[]; // 후보자 정보는 선택적으로 받음
  icon?: ElementType;
}

export const ChartCard = ({
  title,
  children,
  candidates,
  icon: Icon,
}: ChartCardProps) => {
  return (
    <Card className="p-6 card-shadow flex flex-col h-full">
      {/* 1. 카드 제목 */}
      <div className="flex items-center gap-2 mb-6">
        {Icon && <Icon className="w-5 h-5 text-primary" />}
        <h3 className="heading-2">{title}</h3>
      </div>

      {/* 2. 차트 컨텐츠 (children) */}
      <div className="mb-6 w-full h-full">{children}</div>

      {/* 3. 하단 후보자 이름 (범례) */}
      {candidates && candidates.length > 0 && (
        <div className="flex justify-center items-center pt-4">
          {candidates.map((candidate, index) => (
            <div key={candidate.id} className="flex items-center mx-3">
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-gray-700">{candidate.name}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
