import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export const Header = () => {
  return (
    <header className="flex justify-center sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <MessageCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="heading-2 text-primary">디고라</span>
        </div>

        {/* Login Button */}
        <Button variant="kakao" className="label-text">
          카카오 로그인
        </Button>
      </div>
    </header>
  );
};
