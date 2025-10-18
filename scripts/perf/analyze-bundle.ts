import { execSync } from "child_process";
import { writeFileSync } from "fs";

console.log("📦 Running Next.js bundle analyzer...");
execSync("ANALYZE=true next build", { stdio: "inherit" });

// next-bundle-analyzer 결과 파일 수집
const report = {
  mainBundle: "check .next/analyze/client.html for breakdown",
};
writeFileSync("perf-report/bundle.json", JSON.stringify(report, null, 2));
console.log("✅ Bundle analysis complete");
