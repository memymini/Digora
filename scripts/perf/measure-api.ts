import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { performance } from "node:perf_hooks";

const BASE_URL = process.env.API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
const ITERATIONS = Number(process.env.API_ITERATIONS ?? 5);
const WARMUP = process.env.API_WARMUP !== "false";
const REPORT_DIR = resolve("perf-report");

interface MeasureContext {
  voteId?: number;
}

interface EndpointConfig {
  name: string;
  method?: string;
  path: string | ((ctx: MeasureContext) => string | undefined);
  enabled?: (ctx: MeasureContext) => boolean;
  description?: string;
  captureJson?: boolean;
  onWarmupData?: (json: unknown, ctx: MeasureContext) => void;
}

interface IterationMetric {
  durationMs: number;
  status: number;
  cacheControl: string | null;
  contentLength: number | null;
  timestamp: string;
}

interface EndpointReport {
  name: string;
  description?: string;
  method: string;
  url: string;
  iterations: number;
  warmup: boolean;
  metrics: IterationMetric[];
  stats: {
    averageMs: number;
    minMs: number;
    maxMs: number;
    firstMs?: number;
    secondMs?: number;
    lastMs?: number;
  };
  errors: string[];
  cacheHeaders: {
    distinct: string[];
  };
}

const endpoints: EndpointConfig[] = [
  {
    name: "Vote Feed",
    path: "/api/votes/feed",
    description: "투표 목록 및 집계 데이터를 반환",
    captureJson: true,
    onWarmupData: (json, ctx) => {
      try {
        if (typeof json !== "object" || json === null) return;
        const data = (json as { data?: Array<{ voteId?: number; vote_id?: number }> }).data;
        const first = Array.isArray(data) ? data[0] : undefined;
        const voteId = first?.voteId ?? first?.vote_id;
        if (typeof voteId === "number") {
          ctx.voteId = voteId;
        }
      } catch (error) {
        console.warn("Failed to parse vote feed warmup data:", error);
      }
    },
  },
  {
    name: "Hero Vote",
    path: "/api/votes/hero",
    description: "메인 히어로 섹션에 노출되는 투표",
  },
  {
    name: "Vote Details",
    path: (ctx) => (ctx.voteId ? `/api/votes/${ctx.voteId}` : undefined),
    enabled: (ctx) => Boolean(ctx.voteId),
    description: "특정 투표 상세 및 참여 상태",
  },
  {
    name: "Vote Statistics",
    path: (ctx) => (ctx.voteId ? `/api/votes/${ctx.voteId}/statistics` : undefined),
    enabled: (ctx) => Boolean(ctx.voteId),
    description: "투표 통계 집계 결과",
  },
  {
    name: "Vote Comments",
    path: (ctx) => (ctx.voteId ? `/api/votes/${ctx.voteId}/comments` : undefined),
    enabled: (ctx) => Boolean(ctx.voteId),
    description: "투표 댓글 목록 및 트리",
  },
];

async function ensureReportDir() {
  mkdirSync(REPORT_DIR, { recursive: true });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runRequest(url: string, method: string, parseJson: boolean) {
  const start = performance.now();
  const response = await fetch(url, {
    method,
    headers: {
      "content-type": "application/json",
    },
  });
  const durationMs = performance.now() - start;
  const cacheControl = response.headers.get("cache-control");
  const contentLengthHeader = response.headers.get("content-length");
  const contentLength = contentLengthHeader ? Number(contentLengthHeader) : null;
  const status = response.status;

  let json: unknown = undefined;
  let bodyConsumed = false;

  if (parseJson) {
    try {
      json = await response.json();
      bodyConsumed = true;
    } catch (error) {
      json = { error: `JSON parse error: ${(error as Error).message}` };
    }
  }

  if (!bodyConsumed) {
    try {
      await response.text();
    } catch (error) {
      json = json ?? { error: `Body consume error: ${(error as Error).message}` };
    }
  }

  return {
    status,
    durationMs,
    cacheControl,
    contentLength,
    json,
  };
}

function calculateStats(metrics: IterationMetric[]) {
  if (metrics.length === 0) {
    return { averageMs: 0, minMs: 0, maxMs: 0 };
  }
  const durations = metrics.map((m) => m.durationMs);
  const total = durations.reduce((sum, value) => sum + value, 0);
  const averageMs = Number((total / durations.length).toFixed(2));
  const minMs = Math.min(...durations);
  const maxMs = Math.max(...durations);
  const firstMs = durations[0];
  const secondMs = durations[1];
  const lastMs = durations[durations.length - 1];

  return {
    averageMs,
    minMs,
    maxMs,
    firstMs,
    secondMs,
    lastMs,
  };
}

async function measureEndpoint(config: EndpointConfig, ctx: MeasureContext): Promise<EndpointReport | null> {
  const method = config.method ?? "GET";
  const resolvedPath = typeof config.path === "function" ? config.path(ctx) : config.path;
  if (!resolvedPath) {
    console.warn(`⚠️  Skipping ${config.name}: path could not be resolved.`);
    return null;
  }

  if (config.enabled && !config.enabled(ctx)) {
    console.warn(`⚠️  Skipping ${config.name}: prerequisites not satisfied.`);
    return null;
  }

  const url = `${BASE_URL}${resolvedPath}`;
  const metrics: IterationMetric[] = [];
  const errors: string[] = [];

  if (WARMUP) {
    const warmupResult = await runRequest(url, method, Boolean(config.captureJson));
    if (config.captureJson && config.onWarmupData) {
      config.onWarmupData(warmupResult.json, ctx);
    }
    console.log(`🔥 Warmed up ${config.name} (${warmupResult.durationMs.toFixed(2)} ms)`);
    await delay(100);
  }

  for (let i = 0; i < ITERATIONS; i += 1) {
    const result = await runRequest(url, method, false);
    const timestamp = new Date().toISOString();

    metrics.push({
      durationMs: Number(result.durationMs.toFixed(2)),
      status: result.status,
      cacheControl: result.cacheControl,
      contentLength: result.contentLength,
      timestamp,
    });

    if (result.status >= 400) {
      errors.push(`${timestamp}: Received status ${result.status}`);
    }

    await delay(50);
  }

  const cacheHeaders = {
    distinct: Array.from(new Set(metrics.map((m) => m.cacheControl ?? "<missing>"))),
  };

  return {
    name: config.name,
    description: config.description,
    method,
    url,
    iterations: ITERATIONS,
    warmup: WARMUP,
    metrics,
    stats: calculateStats(metrics),
    errors,
    cacheHeaders,
  };
}

async function main() {
  console.log(`⚙️  Measuring API performance on ${BASE_URL}`);
  console.log(`   iterations: ${ITERATIONS}, warmup: ${WARMUP}`);

  const ctx: MeasureContext = {};
  const reports: EndpointReport[] = [];

  for (const endpoint of endpoints) {
    try {
      const report = await measureEndpoint(endpoint, ctx);
      if (report) {
        reports.push(report);
        const { averageMs, minMs, maxMs } = report.stats;
        console.log(
          `✅ ${report.name} — avg: ${averageMs} ms, min: ${minMs} ms, max: ${maxMs} ms, status: ${report.metrics
            .map((m) => m.status)
            .join(",")}`
        );
      }
    } catch (error) {
      console.error(`❌ Error measuring ${endpoint.name}:`, error);
      reports.push({
        name: endpoint.name,
        description: endpoint.description,
        method: endpoint.method ?? "GET",
        url: typeof endpoint.path === "function" ? "<dynamic>" : `${BASE_URL}${endpoint.path}`,
        iterations: 0,
        warmup: WARMUP,
        metrics: [],
        stats: { averageMs: 0, minMs: 0, maxMs: 0 },
        errors: [
          error instanceof Error
            ? `${new Date().toISOString()}: ${error.message}`
            : `${new Date().toISOString()}: Unknown error`,
        ],
        cacheHeaders: { distinct: [] },
      });
    }
  }

  const summary = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    iterations: ITERATIONS,
    warmup: WARMUP,
    overall: {
      averageMs: Number(
        (
          reports.reduce((sum, report) => sum + report.stats.averageMs, 0) /
          (reports.length || 1)
        ).toFixed(2)
      ),
      slowestEndpoint: reports.reduce((slowest, current) => {
        if (!slowest) return current;
        return current.stats.averageMs > slowest.stats.averageMs ? current : slowest;
      }, reports[0] ?? null)?.name,
      fastestEndpoint: reports.reduce((fastest, current) => {
        if (!fastest) return current;
        return current.stats.averageMs < fastest.stats.averageMs ? current : fastest;
      }, reports[0] ?? null)?.name,
    },
    endpoints: reports,
  };

  await ensureReportDir();
  const reportPath = resolve(REPORT_DIR, "api.json");
  writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  console.log(`📄 Saved API performance report to ${reportPath}`);
}

main().catch((error) => {
  console.error("Unhandled error during API measurement:", error);
  process.exitCode = 1;
});
