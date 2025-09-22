import { Card } from "@/components/ui/card";
import React from "react";

interface ChartCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const ChartCard = ({ title, icon, children }: ChartCardProps) => {
  return (
    <Card className="p-6 card-shadow">
      <div className="flex items-center gap-2 mb-6">
        {icon}
        <h3 className="heading-2">{title}</h3>
      </div>
      <div className="h-64">{children}</div>
    </Card>
  );
};
