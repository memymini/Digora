export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="rounded-3xl border border-border bg-card p-10 shadow-[var(--shadow-card)]">
        <header className="space-y-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">
            Privacy Policy
          </span>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Digora 개인정보
            <br className="sm:hidden" />
            처리방침
          </h1>
          <p className="text-sm text-muted-foreground">
            공고일자: 2025년 10월 16일 · 시행일자: 2025년 10월 16일
          </p>
        </header>

        <div className="mt-12 space-y-10 text-base leading-relaxed text-muted-foreground">
          <section className="space-y-4">
            <p className="text-foreground">
              Digora(이하 “서비스”)는 이용자의 개인정보를 소중히 여기며
              「개인정보 보호법」 등 관련 법령을 준수합니다. 본
              개인정보처리방침은 이용자가 제공한 개인정보가 어떠한 용도와
              방식으로 이용되고 있으며, 어떤 조치로 보호되고 있는지를 알려드리기
              위해 작성되었습니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              1. 개인정보 수집 항목 및 수집 방법
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-semibold text-foreground">
                  필수 항목:
                </span>{" "}
                카카오 로그인 시 제공되는 정보(닉네임, 이메일, 프로필 이미지,
                성별, 연령대, 출생년도, 카카오계정 고유 ID)
              </li>
              <li>
                <span className="font-semibold text-foreground">
                  자동 수집 항목:
                </span>{" "}
                서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 주소 등
              </li>
              <li>
                <span className="font-semibold text-foreground">
                  수집 방법:
                </span>{" "}
                카카오 로그인 연동 시 자동 수집 및 서비스 이용 중 자동 생성 ·
                저장
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              2. 개인정보의 이용 목적
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>회원 식별 및 로그인 기능 제공</li>
              <li>투표, 댓글 등 서비스 내 주요 기능 제공</li>
              <li>서비스 운영 및 개선을 위한 이용 통계 분석</li>
              <li>이용자 문의 응대 및 기술 지원</li>
              <li>
                투표 참여 데이터를 기반으로 한 결과 분석 및 통계 산출
                <br />
                (이 과정에서 개인을 식별할 수 없도록 익명화하여 처리합니다)
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              3. 개인정보 보유 및 이용 기간
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-semibold text-foreground">
                  회원정보(카카오 ID 등):
                </span>{" "}
                회원 탈퇴 시 즉시 삭제
              </li>
              <li>
                <span className="font-semibold text-foreground">
                  로그 데이터:
                </span>{" "}
                서비스 오류 분석 및 운영 보안을 위해 최대 3개월간 보관 후 삭제
              </li>
              <li>
                <span className="font-semibold text-foreground">
                  투표 데이터:
                </span>{" "}
                투표 결과 분석 및 통계 산출 완료 후, 개인 식별이 불가능한 형태로
                익명화하여 보관하거나 즉시 삭제
              </li>
              <li>
                <span className="font-semibold text-foreground">
                  법령에 따른 보존:
                </span>{" "}
                전자상거래 등 관련 법령이 적용될 경우 해당 법령에 따름
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              4. 개인정보의 제3자 제공
            </h2>
            <p>
              서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만,
              다음의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령에 의거하여 수사기관이 정해진 절차에 따라 요청한 경우</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              5. 개인정보의 처리 위탁
            </h2>
            <p>
              현재 Digora는 외부 업체에 개인정보 처리를 위탁하지 않습니다. 추후
              서버 호스팅, 이메일 발송 등 외부 서비스를 이용하게 될 경우, 위탁
              내역과 절차를 서비스에 공지하고 필요한 동의를 받겠습니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              6. 이용자의 권리
            </h2>
            <p>
              이용자는 언제든지 본인의 개인정보를 조회, 수정, 삭제할 수 있으며
              회원 탈퇴를 통해 개인정보 수집 및 이용에 대한 동의를 철회할 수
              있습니다.
            </p>
            <p>
              개인정보 관련 문의는 아래 이메일로 접수하실 수 있습니다.
              <br />
              <span className="font-semibold text-foreground">
                dhbae0793@gmail.com
              </span>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              7. 개인정보의 파기 절차 및 방법
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-semibold text-foreground">
                  파기 사유:
                </span>{" "}
                개인정보 보유기간의 경과, 처리 목적 달성 등
              </li>
              <li>
                <span className="font-semibold text-foreground">
                  파기 방법:
                </span>{" "}
                데이터베이스(DB) 및 서버에서 영구 삭제하며 복구할 수 없도록 처리
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              8. 개인정보 보호를 위한 조치
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>접근 권한 최소화 및 접근 통제</li>
              <li>비밀번호 및 인증 토큰의 안전한 암호화 저장</li>
              <li>최신 보안 업데이트 적용</li>
              <li>주기적인 데이터 점검 및 로그 모니터링</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              9. 개인정보 보호책임자
            </h2>
            <div className="rounded-2xl bg-secondary/40 p-6">
              <p>
                <span className="font-semibold text-foreground">
                  개인정보 보호책임자:
                </span>{" "}
                배동혁
              </p>
              <p>
                <span className="font-semibold text-foreground">이메일:</span>{" "}
                dhbae0793@gmail.com
              </p>
              <p>
                <span className="font-semibold text-foreground">역할:</span>{" "}
                서비스 개발 및 운영, 개인정보 관리
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              10. 개인정보처리방침의 변경
            </h2>
            <p>
              본 방침은 법령 및 서비스 정책에 따라 내용이 변경될 수 있으며, 변경
              시 서비스 내 공지사항을 통해 안내드립니다.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
