import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  {
    label: "전화 여론조사 응답률",
    value: "4.9%",
    caption: "2023년 기준",
  },
  {
    label: "유선전화 보유율",
    value: "12.2%",
    caption: "2023년 기준",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto flex flex-col md:gap-24 px-6 md:py-24 py-12 gap-12">
        <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-vote-blue/10 to-vote-red/10 px-8 py-16 text-center card-shadow">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
            <span className="rounded-full border border-primary/30 bg-card/80 px-4 py-2 text-sm font-semibold text-primary">
              디지털 시대의 공론장
            </span>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight text-foreground md:text-5xl text-center">
              디고라는 <strong>Digital Agora</strong>를 꿈꾸는{" "}
              <br className="hidden lg:flex" /> 새로운 소셜 폴링 플랫폼입니다.
            </h1>
            <p className="body-text text-muted-foreground md:body-text-1 text-center">
              특정 유튜브 채널이나 온라인 커뮤니티, 편향된 언론 보도를 통해
              세상을 접하다 보면 <strong>진짜 여론은 무엇일까?</strong> 라는
              의문이 들 때가 많습니다. <strong>20대 남성</strong>,{" "}
              <strong>40대 여성 </strong>등 하나의 생각으로 묶여버린 고정관념
              속에서 우리 사회의 진짜 목소리는 점점 더 멀어지고 있습니다.
            </p>
          </div>
        </section>

        <section className="grid items-start gap-12 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <h2 className="heading-2 sm:heading-1">
              낮아진 응답률이 남긴 질문
            </h2>
            <p className="body-text text-muted-foreground md:body-text-1 text-justify">
              온라인 여론의 왜곡을 바로잡아야 할 전통 여론조사마저 한계에
              부딪혔습니다. 2023년 기준 전화 여론조사의{" "}
              <strong>응답률은 4.9%</strong>에 불과했고, 유선전화 보유율이{" "}
              <strong>12.2%</strong>밖에 되지 않는 현실은 이제 더 이상 시대의
              목소리를 제대로 담아내기 어렵다는 사실을 보여줍니다. 디고라는 바로
              이 문제의식에서 출발했습니다.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 md:mt-15">
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className="border-primary/15 bg-card/90 backdrop-blur"
              >
                <CardHeader className="space-y-2">
                  <CardTitle className="text-4xl font-black text-primary">
                    {stat.value}
                  </CardTitle>
                  <CardDescription className="text-base font-semibold text-foreground">
                    {stat.label}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="caption-text text-muted-foreground">
                    {stat.caption}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid items-center gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="heading-2 sm:heading-1">
              검증된 익명성이 만드는 신뢰
            </h2>
            <p className="body-text text-muted-foreground md:body-text-1 text-justify">
              디고라의 가장 큰 특징은 <strong>검증된 익명성</strong>입니다.
              개인정보는 철저히 보호되지만, 원한다면 베리뱃지(VeriBadge)
              시스템을 통해 자신의 직업, 학력, 연령대 등 검증된 정보를
              선택적으로 댓글에 표시할 수 있습니다. 예를 들어{" "}
              <strong>변호사 </strong>뱃지를 사용하면 내 신원은 익명으로
              유지되면서도
              <span className="rounded-md bg-muted px-2 py-1 font-semibold text-foreground">
                익명123 (변호사)
              </span>
              와 같이 발언에 신뢰도를 더할 수 있습니다.
            </p>
          </div>

          <Card className="border-primary/15 bg-card/95 card-shadow">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl font-semibold">
                베리뱃지 활용 예시
              </CardTitle>
              <CardDescription>
                익명성을 유지하면서 전문성을 드러내는 방식입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
                <span className="rounded-full bg-muted px-3 py-1 text-foreground">
                  익명123
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                  변호사
                </span>
              </div>
              <p className="caption-text text-muted-foreground">
                개인정보는 안전하게 보호되고, 발언의 신뢰도는 높아집니다.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col items-center gap-8 rounded-3xl border border-muted bg-card px-8 py-16 text-center card-shadow">
          <h2 className="heading-2 sm:heading-1 text-foreground">
            데이터로 증명하는 직접 민주주의의 가능성
          </h2>
          <p className="max-w-3xl body-text text-muted-foreground md:body-text-1 text-center">
            저희의 궁극적인 목표는 단순히 투표 결과를 보여주는 것을 넘어,{" "}
            <strong>어떤 배경을 가진 사람들이, 왜 그렇게 생각하는지</strong>에
            대한 깊이 있는 데이터를 제공하는 것입니다. 디고라는 신뢰할 수 있는
            데이터에 기반한 건강한 공론장을 만들어, 우리 사회가 더 나은 직접
            민주주의의 가능성을 실험하는 첫 번째 무대가 되고자 합니다.
          </p>
          <Button variant="vote" size="lg" asChild>
            <Link href="/#vote">실시간 투표 보러가기</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
