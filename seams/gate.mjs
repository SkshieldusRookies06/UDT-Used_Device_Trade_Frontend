import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const repo = process.env.BACKEND_REPO ?? resolve(process.cwd(), "..", "safedeal-backend");
const mock = process.argv.includes("--mock");
const target = mock
  ? resolve(repo, "mock", "server.mjs")
  : resolve(repo, "seams", "check-api.mjs");

if (!existsSync(target)) {
  console.error(`백엔드 리포를 찾을 수 없습니다: ${target}`);
  console.error("");
  console.error("계약 게이트와 목 서버의 정본은 safedeal-backend 리포에 있습니다 (SPEC.md §12).");
  console.error("해결:");
  console.error("  1) 백엔드 리포를 형제 폴더로 클론한다");
  console.error("       <작업폴더>/safedeal-backend/");
  console.error("       <작업폴더>/safedeal-frontend/   ← 지금 여기");
  console.error("  2) 또는 경로를 알려준다");
  console.error("       BACKEND_REPO=/path/to/safedeal-backend npm run gate");
  process.exit(2);
}

process.argv = [process.argv[0], target, ...process.argv.slice(2).filter((a) => a !== "--mock")];
await import(pathToFileURL(target).href);
