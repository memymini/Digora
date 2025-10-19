"use client";

import { useEffect } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useSession } from "@/app/SessionProvider";
import { Button } from "@/components/ui/button";
import { useLogoutMutation } from "@/hooks/mutations/useLogoutMutation";
import { handleLoginRedirect } from "@/hooks/useLogin";
import { useHeaderMenuStore } from "@/hooks/useHeaderMenuStore";

const navItems = [
  { href: "/about", label: "소개" },
  { href: "/#vote", label: "투표하기" },
];

export const Header = () => {
  const session = useSession();
  const profile = session?.profile;
  const { mutate: logout } = useLogoutMutation();

  const isMenuOpen = useHeaderMenuStore((state) => state.isOpen);
  const openMenu = useHeaderMenuStore((state) => state.open);
  const closeMenu = useHeaderMenuStore((state) => state.close);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [closeMenu, isMenuOpen]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  const handleLogin = () => {
    closeMenu();
    handleLoginRedirect();
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex w-full justify-center border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center px-4 justify-between">
          <Link
            href="/"
            className="hidden items-center md:flex"
            onClick={closeMenu}
          >
            <Image
              src="/images/logo-2.png"
              alt="디고라 로고"
              width={110}
              height={55}
              priority
            />
          </Link>

          <div className="ml-auto hidden items-center gap-8 md:flex">
            <nav className="flex items-center gap-6 text-sm font-semibold text-foreground">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {profile ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {profile.display_name}님
                </span>
                <Button onClick={() => logout()} variant="outline" size="sm">
                  로그아웃
                </Button>
              </div>
            ) : (
              <Button onClick={handleLoginRedirect} variant="kakao">
                <Image
                  src="/images/kakao-logo.png"
                  alt="kakao-logo"
                  width={18}
                  height={18}
                />
                카카오 로그인
              </Button>
            )}
          </div>

          <Link
            href="/"
            className="flex items-center md:hidden"
            onClick={closeMenu}
          >
            <Image
              src="/images/logo-2.png"
              alt="디고라 로고"
              width={100}
              height={50}
              priority
            />
          </Link>

          <button
            type="button"
            className="ml-2 inline-flex items-center justify-center rounded-md p-2 text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            aria-label="메뉴 열기"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={openMenu}
          >
            <Menu className="size-6" />
          </button>
        </div>
      </header>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            role="presentation"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
            onClick={closeMenu}
          />
          <aside
            id="mobile-menu"
            className="absolute right-0 top-0 flex h-full w-80 max-w-[85%] flex-col border-l border-border bg-card shadow-lg"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Link href="/" className="flex items-center" onClick={closeMenu}>
                <Image
                  src="/images/logo-2.png"
                  alt="디고라 로고"
                  width={120}
                  height={60}
                />
              </Link>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="메뉴 닫기"
                onClick={closeMenu}
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-4 px-4 py-6 text-lg font-semibold text-foreground">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 transition hover:bg-accent"
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-4 px-4 pb-8">
              {profile ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      로그인 상태
                    </span>
                    <span className="text-base font-semibold text-foreground">
                      {profile.display_name}님
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </Button>
                </div>
              ) : (
                <Button
                  variant="kakao"
                  className="w-full"
                  onClick={handleLogin}
                >
                  <Image
                    src="/images/kakao-logo.png"
                    alt="kakao-logo"
                    width={18}
                    height={18}
                  />
                  카카오 로그인
                </Button>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
};
