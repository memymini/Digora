"use client";

import { useEffect } from "react";
import { handleLoginRedirect } from "@/hooks/useLogin";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  useEffect(() => {
    window.alert("로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.");
    handleLoginRedirect();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
