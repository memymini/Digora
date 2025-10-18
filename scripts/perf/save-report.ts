import { writeFileSync, readFileSync } from "fs";

const frontend = JSON.parse(readFileSync("perf-report/frontend.json", "utf8"));
const api = JSON.parse(readFileSync("perf-report/api.json", "utf8"));
const bundle = JSON.parse(readFileSync("perf-report/bundle.json", "utf8"));

const summary = {
  timestamp: new Date().toISOString(),
  frontend,
  api,
  bundle,
};

writeFileSync(
  `perf-report/report-${new Date().toISOString().slice(0, 10)}.json`,
  JSON.stringify(summary, null, 2)
);

console.log("📊 Performance report saved to perf-report/");
