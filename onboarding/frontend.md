# 내 하루 루프 — 프론트 (모든 명령은 `UDT-Used_Device_Trade-frontend/` 루트에서 시작)

> **이 프로젝트는 리포가 둘이다.** 백엔드 리포를 **형제 폴더**로 클론해 둔다 —
> `npm run gate`·`npm run mock`이 `../UDT-Used_Device_Trade-backend`를 찾는다.
> 다른 곳에 뒀으면 `BACKEND_REPO=<경로>`를 앞에 붙인다.

> 먼저 `onboarding/팀원용-한장.md`의 다섯 줄을 읽는다. 막혔을 때 4번을 이미 읽은 사람만 30분 만에 손을 든다.
> **아래 명령은 셋업을 실제로 통과한 사람이 자기가 친 명령을 그대로 붙여넣는다.** 기억으로 쓰지 않는다.

## 0회차 (첫날 한 번만)

```
전제: Node LTS 설치 (확인: node -v)
cd <작업폴더>
git clone <백엔드 URL> UDT-Used_Device_Trade-backend
git clone <프론트 URL> UDT-Used_Device_Trade-frontend
cd UDT-Used_Device_Trade-frontend
npm ci                               ← install이 아니라 ci. lock 파일 그대로 설치한다
cp .env.example .env                 ← .env 안에 한 줄: VITE_API_URL=http://localhost:8080
```

## 아침 (매일)

```
1) 터미널 1 — 백엔드 기동
   (cd ../UDT-Used_Device_Trade-backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=local)
   Spring이 아직 안 섰으면 D1 땜빵:  npm run mock
   확인: npm run gate  → 마지막 줄 "OK: http://localhost:8080 계약 준수"

2) 터미널 2 — npm run dev
   확인: http://localhost:5173 (127.0.0.1 아님) 에 목록 화면과 상품 카드가 보인다

3) git status 가 깨끗한가 → git switch main && git pull && git switch -c fe-<작업명>
   pull 로 package-lock.json 이 바뀌었으면 npm ci 다시
   백엔드 리포도 같이 pull 한다 — 계약이 개정됐을 수 있다 (SPEC §12)
```

## 작업

```
4) 오늘 티켓 tasks/T-###.md 를 연다. 지시서가 없으면 시작하지 않고 오너에게 (규약 4조)
5) 에이전트에 넣는 것은 셋뿐: 지시서 + SPEC.md 해당 절 + (수정이면) diff
```

## 끝 (매일)

```
6) npm run build 에러 0 · seams/smoke.md 의 내 줄 통과
   D4·D8은 npm run preview 로 빌드물에서 한 번 더 (dev 서버에선 안 드러나는 것들이 있다)
7) git diff 를 읽는다. 한 화면(≈100줄) 넘으면 머지하지 않고 티켓 분할 요청
8) 커밋·push는 내가 한다 → 오너에게 머지 요청
   첫 세 번의 머지는 오너와 짝으로. 오너는 대신 설명하지 않고 묻기만 한다
9) worklog 3줄 → **백엔드 리포**의 worklog/<내이름>/D##.md 에 (전원 한 곳 · SPEC §12)
```

---

# 막혔을 때 — 화면에 뜬 문자열에서 찾는다

**브라우저 콘솔의 문자열과 axios가 던지는 문자열은 다르다.** axios는 CORS·연결 거부·타임아웃을
전부 `Network Error`로 뭉갠다 — **콘솔의 빨간 줄을 먼저 본다.**

| 화면에 뜬 것 | 뜻 · 먼저 볼 곳 |
|---|---|
| `command not found` / `'...'은(는) 내부 또는 외부 명령이 아닙니다` | 설치가 안 됐다. 0회차 전제 줄부터 |
| `백엔드 리포를 찾을 수 없습니다` (npm run gate) | 백엔드 리포가 형제 폴더에 없다. 클론하거나 `BACKEND_REPO=<경로>` |
| `Cannot find module` (게이트) | 프론트 리포 루트가 아닌 곳에서 쳤다. `cd UDT-Used_Device_Trade-frontend` |
| 게이트 출력이 전부 "서버 응답 없음" | 코드가 아니라 기동·포트 문제. 터미널 1이 살아 있나 |
| `Error: Port 5173 is already in use` | 어제 터미널이 살아 있다. 찾아서 Ctrl+C (strictPort라 옆 포트로 도망가지 않는다) |
| `net::ERR_CONNECTION_REFUSED` | **백엔드가 안 떠 있다.** CORS 문제가 아니다 |
| `blocked by CORS policy` / `No 'Access-Control-Allow-Origin'` | 백엔드는 떠 있다. 주소창이 `127.0.0.1`이면 `localhost`로. 그래도면 백엔드 소유 (SPEC §11) |
| `AxiosError: Network Error` | 위 둘 중 하나다 — 콘솔 빨간 줄을 먼저 |
| `Cannot read properties of null (reading 'map')` | 목록이 `null`로 왔다. check-api red면 **백엔드 소유** |
| `Cannot read properties of undefined (reading 'map')` | 내 `useState` 초기값이 `[]`가 아니거나 응답 경로 오타. **프론트 소유** |
| `.map is not a function` | 봉투를 안 벗겼다(`res.data.data`) 또는 `{content,page}` 객체를 배열로 썼다. **프론트 소유** |
| `Unexpected token '<'` | REST 요청이 로그인 HTML로 리다이렉트됐다 — Security 체인 순서(`@Order`) 문제. **백엔드 소유** (SPEC §7) |
| 화면은 뜨는데 "상품이 없습니다"만 | 고장이 아니라 **빈 결과 상태**. 시드를 안 돌렸을 가능성 — 백엔드 재기동 |
| 내가 등록한 상품이 목록에 없다 | **정상이다.** 등록 직후는 `INSPECTING`이고 목록은 `ON_SALE`만 보여준다 (SPEC ADR-06) |
| `Failed to resolve import "x"` | pull 후 `npm ci` 안 했거나 import 경로 대소문자 오타 |
| `npm ci ... package-lock.json are in sync` 오류 | 누군가 의존성을 lock 없이 올렸다. 손대지 말고 팀 채널에 |
| 요청이 두 번 나간다 | React StrictMode 개발 모드 정상 동작. 버그 아님 |
| 401 뒤 화면이 멈춘다 | 토큰 만료. SPEC §3.4 — 인터셉터가 authStore 비우고 `/login`으로 |
| 로그인 실패했는데 로그인 화면으로 계속 튕긴다 | `/api/auth/**`를 401 인터셉터에서 제외하지 않았다 (SPEC §0 API 호출 행) |

**30분 넘으면 `<프론트 오너 이름>`에게 말한다. 규약 4번이고, 감점이 아니다.**

## 용어 여섯

- **seam** — 팀원 사이 경계. 우리 프로젝트에선 API 하나
- **계약** — `SPEC.md` §4. 어떤 요청에 어떤 JSON이 오는지의 합의
- **게이트** — 계약대로인지 기계가 판정하는 명령. `npm run gate` (실체는 백엔드 리포에 있다)
- **목 서버** — 백엔드가 완성되기 전, 계약대로 가짜 응답만 주는 서버 (`mock/server.mjs`)
- **CORS** — 5173(프론트)에서 8080(백엔드)을 부를 때 브라우저가 거는 출처 검사
- **diff** — 내가 바꾼 줄 목록. 머지 전에 내가 읽는다
