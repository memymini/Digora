import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export const Header = () => {
  return (
    <header className="flex justify-center sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/">
            <Image
              src="/images/logo-2.png"
              alt="logo"
              width={120}
              height={60}
              className=""
            />
          </Link>
        </div>

        {/* Login Button */}
        <Button variant="kakao" className="label-text">
          카카오 로그인
        </Button>
      </div>
    </header>
  );
};
