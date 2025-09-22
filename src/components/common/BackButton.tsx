"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between mb-8">
      <Button
        variant="ghost"
        onClick={() => router.push("/")}
        className="p-0 h-auto text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        <span className="label-text">돌아가기</span>
      </Button>
    </div>
  );
}
