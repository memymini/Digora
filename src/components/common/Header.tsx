"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/app/SessionProvider";

export const Header = () => {
  const session = useSession();
  const profile = session?.profile;
  const supabase = createClient();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

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

        {/* Login/Logout Button */}
        <div className="flex items-center gap-4">
          {profile ? (
            <>
              <span className="text-sm font-medium">
                {profile.display_name}님
              </span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                로그아웃
              </Button>
            </>
          ) : (
            <Button
              onClick={handleLogin}
              variant="kakao"
              className="label-text"
            >
              카카오 로그인
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
