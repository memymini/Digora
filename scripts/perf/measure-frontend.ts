import { execSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";

type LighthouseResult = {
  categories: {
    performance: { score: number };
  };
  audits: Record<string, { numericValue?: number }>;
};

type PageMetrics = {
  performance: number | null;
  LCP: number | null;
  FCP: number | null;
  TTI: number | null;
  TBT: number | null;
  CLS: number | null;
};

type PageConfig = {
  name: string;
  path: string | ((ctx: MeasureContext) => string | undefined);
  description?: string;
  enabled?: (ctx: MeasureContext) => boolean;
};

type MeasureContext = {
  voteId?: number;
};

const BASE_URL = process.env.PERF_URL?.replace(/\/$/, "") || "http://localhost:3000";
const LIGHTHOUSE_CMD = process.env.LIGHTHOUSE_CMD || "npx lighthouse";
const CHROME_FLAGS = process.env.LH_CHROME_FLAGS || "--headless --no-sandbox";
const REPORT_DIR = resolve("perf-report");

const pages: PageConfig[] = [
  {
    name: "Home",
    path: "/",
    description: "랜딩 페이지",
  },
  {
    name: "About",
    path: "/about",
    description: "서비스 소개 페이지",
  },
  {
    name: "Privacy",
    path: "/privacy",
    description: "개인정보 처리방침",
  },
  {
    name: "Login",
    path: "/login",
    description: "카카오 로그인 안내",
  },
  {
    name: "Admin",
    path: "/admin",
    description: "관리자 대시보드 (권한 없을 경우 리다이렉트 확인)",
  },
  {
    name: "Vote Detail",
    path: (ctx) => (ctx.voteId ? `/vote/${ctx.voteId}` : undefined),
    enabled: (ctx) => Boolean(ctx.voteId),
    description: "투표 상세 페이지",
  },
  {
    name: "Result Detail",
    path: (ctx) => (ctx.voteId ? `/result/${ctx.voteId}` : undefined),
    enabled: (ctx) => Boolean(ctx.voteId),
    description: "투표 결과 분석 페이지",
  },
];

function ensureReportDir() {
  mkdirSync(REPORT_DIR, { recursive: true });
}

function runLighthouse(url: string): LighthouseResult {
  console.log(`🚀 Running Lighthouse for: ${url}`);
  const command = `${LIGHTHOUSE_CMD} ${url} --quiet --chrome-flags="${CHROME_FLAGS}" --output=json --output-path=stdout`;
  const result = execSync(command, { stdio: ["ignore", "pipe", "inherit"] });
  return JSON.parse(result.toString()) as LighthouseResult;
}

function extractMetrics(json: LighthouseResult): PageMetrics {
  const getNumeric = (auditId: string) => json.audits[auditId]?.numericValue ?? null;
  return {
    performance: json.categories.performance?.score ?? null,
    LCP: getNumeric("largest-contentful-paint"),
    FCP: getNumeric("first-contentful-paint"),
    TTI: getNumeric("interactive"),
    TBT: getNumeric("total-blocking-time"),
    CLS: getNumeric("cumulative-layout-shift"),
  };
}

async function prepareContext(): Promise<MeasureContext> {
  const ctx: MeasureContext = {};
  try {
    const response = await fetch(`${BASE_URL}/api/votes/feed`);
    if (!response.ok) {
      console.warn(`⚠️  Unable to fetch vote feed for dynamic routes: ${response.status}`);
      return ctx;
    }
    const json = (await response.json()) as {
      data?: Array<{ voteId?: number; vote_id?: number }>;
    };
    const first = Array.isArray(json.data) ? json.data[0] : undefined;
    const voteId = first?.voteId ?? first?.vote_id;
    if (typeof voteId === "number") {
      ctx.voteId = voteId;
    } else {
      console.warn("⚠️  Vote ID not found in feed response; dynamic pages will be skipped.");
    }
  } catch (error) {
    console.warn("⚠️  Failed to fetch vote feed for context:", error);
  }
  return ctx;
}

async function main() {
  ensureReportDir();
  console.log(`⚙️  Measuring frontend performance on ${BASE_URL}`);

  const ctx = await prepareContext();
  const pageReports: Array<{
    name: string;
    description?: string;
    path: string;
    url: string;
    metrics: PageMetrics | null;
    error?: string;
  }> = [];

  for (const page of pages) {
    try {
      if (page.enabled && !page.enabled(ctx)) {
        console.log(`⚠️  Skipping ${page.name}: prerequisites not satisfied.`);
        continue;
      }

      const resolvedPath =
        typeof page.path === "function" ? page.path(ctx) : page.path;
      if (!resolvedPath) {
        console.log(`⚠️  Skipping ${page.name}: path was not resolved.`);
        continue;
      }

      const url = `${BASE_URL}${resolvedPath}`;
      const lhResult = runLighthouse(url);
      const metrics = extractMetrics(lhResult);
      pageReports.push({
        name: page.name,
        description: page.description,
        path: resolvedPath,
        url,
        metrics,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const resolvedPath =
        typeof page.path === "function" ? page.path(ctx) ?? "<dynamic>" : page.path;
      const url = `${BASE_URL}${resolvedPath}`;
      console.error(`❌ Lighthouse failed for ${page.name}:`, errorMessage);
      pageReports.push({
        name: page.name,
        description: page.description,
        path: resolvedPath,
        url,
        metrics: null,
        error: errorMessage,
      });
    }
  }

  const metricsWithPerf = pageReports.filter((report) => report.metrics?.performance != null);
  const averagePerformance =
    metricsWithPerf.length > 0
      ? Number(
          (
            metricsWithPerf.reduce(
              (sum, report) => sum + (report.metrics?.performance ?? 0),
              0
            ) / metricsWithPerf.length
          ).toFixed(3)
        )
      : null;

  const summary = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    chromeFlags: CHROME_FLAGS,
    pages: pageReports,
    overview: {
      measuredCount: metricsWithPerf.length,
      averagePerformance,
      lowestPerformancePage: metricsWithPerf
        .slice()
        .sort((a, b) => (a.metrics!.performance! - b.metrics!.performance!))[0]?.name,
      highestPerformancePage: metricsWithPerf
        .slice()
        .sort((a, b) => (b.metrics!.performance! - a.metrics!.performance!))[0]?.name,
    },
  };

  const outputPath = resolve(REPORT_DIR, "frontend.json");
  writeFileSync(outputPath, JSON.stringify(summary, null, 2));
  console.log(`✅ Lighthouse metrics saved to ${outputPath}`);
}

main().catch((error) => {
  console.error("Unhandled error while measuring frontend performance:", error);
  process.exitCode = 1;
});
