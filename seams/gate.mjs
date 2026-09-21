import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const mock = process.argv.includes("--mock");
const marker = join("seams", "check-api.mjs");

function findBackendRepo() {
  if (process.env.BACKEND_REPO) {
    const explicit = resolve(process.env.BACKEND_REPO);
    return { dir: explicit, source: "BACKEND_REPO 환경변수" };
  }
  const parent = resolve(process.cwd(), "..");
  let names = [];
  try {
    names = readdirSync(parent);
  } catch {
    return null;
  }
  for (const name of names.sort()) {
    const dir = join(parent, name);
    try {
      if (statSync(dir).isDirectory() && existsSync(join(dir, marker))) {
        return { dir, source: "형제 폴더 자동 탐색" };
      }
    } catch {
      /* 권한 없는 폴더는 건너뛴다 */
    }
  }
  return null;
}

const found = findBackendRepo();
const target = found && resolve(found.dir, mock ? join("mock", "server.mjs") : marker);

if (!target || !existsSync(target)) {
  console.error("백엔드 리포를 찾을 수 없습니다.");
  if (found) console.error(`  찾아본 곳: ${target} (${found.source})`);
  console.error("");
  console.error("계약 게이트와 목 서버의 정본은 백엔드 리포에 있습니다 (SPEC.md §12).");
  console.error("해결:");
  console.error("  1) 백엔드 리포를 이 리포와 같은 상위 폴더에 클론한다");
  console.error("       <작업폴더>/UDT-Used_Device_Trade-backend/");
  console.error("       <작업폴더>/UDT-Used_Device_Trade-frontend/   ← 지금 여기");
  console.error("     (폴더 이름은 자유. seams/check-api.mjs 가 있는 형제 폴더를 자동으로 찾는다)");
  console.error("  2) 또는 경로를 직접 알려준다");
  console.error("       BACKEND_REPO=/path/to/backend npm run gate");
  process.exit(2);
}

process.argv = [process.argv[0], target, ...process.argv.slice(2).filter((a) => a !== "--mock")];
await import(pathToFileURL(target).href);
