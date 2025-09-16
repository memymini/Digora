import { Header } from "@/components/Header";
import { VoteFeed } from "@/components/VoteFeed";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="heading-1 mb-4 bg-gradient-to-r from-primary via-vote-blue to-vote-red bg-clip-text text-transparent">
            디지털 시대의 새로운 민주주의
          </h1>
          <p className="body-text text-muted-foreground max-w-2xl mx-auto mb-6">
            베리뱃지 시스템과 함께하는 검증된 익명 기반의 소셜 폴링 플랫폼에서
            정치적 이슈에 대한 당신의 목소리를 들려주세요.
          </p>
          <div className="flex flex-wrap justify-center gap-4 caption-text text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>실시간 투표</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-vote-blue rounded-full" />
              <span>검증된 익명</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-vote-red rounded-full" />
              <span>투명한 통계</span>
            </div>
          </div>
        </section>

        {/* Active Votes Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-2">진행 중인 투표</h2>
            <div className="flex items-center gap-2 caption-text text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>실시간 업데이트</span>
            </div>
          </div>

          <VoteFeed />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="caption-text text-muted-foreground">
            © 2024 디고라(Digora). 베리뱃지와 함께하는 신뢰할 수 있는 디지털
            공론장
          </p>
        </div>
      </footer>
    </div>
  );
}
