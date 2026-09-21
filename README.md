# SafeDeal — 프론트엔드

> **이 프로젝트는 리포 2개로 구성됩니다.**
> 백엔드(메인 리포): [safedeal-backend](https://github.com/<조직>/safedeal-backend) ← 링크를 채워 주세요
> **계약 정본 `SPEC.md`와 제출 문서 `docs/`는 백엔드 리포에 있습니다.** 여기에 복사하지 않습니다.

중고 전자기기 안전거래 플랫폼 SafeDeal의 React 프론트엔드.
SK Shielders Rookies 6기 웹 팀 프로젝트 (7명 · 2주)

---

## 클론 위치가 계약이다 (SPEC.md §12)

```
<작업폴더>/
├── safedeal-backend/     ← 먼저 클론. 게이트·목 서버·SPEC이 여기 있다
└── safedeal-frontend/    ← 지금 이 리포
```

`npm run gate`와 `npm run mock`이 `../safedeal-backend`를 찾는다.
다른 곳에 뒀으면 `BACKEND_REPO=<경로> npm run gate`.

## 실행

```bash
npm ci
cp .env.example .env          # VITE_API_URL=http://localhost:8080

npm run dev                   # http://localhost:5173  (127.0.0.1 아님 — CORS는 localhost만)
npm run gate                  # 백엔드 리포의 계약 게이트를 실행
npm run mock                  # 백엔드가 아직 안 떴을 때 목 서버 (별도 터미널)
npm run build                 # 에러 0이어야 머지
npm run preview               # D4·D8은 빌드물에서 한 번 더 본다
```

---

## 구조 — 라우트 1개 = 폴더 1개 = 담당 1명

```
safedeal-frontend/
├── CLAUDE.md                 에이전트 컨텍스트
├── seams/
│   ├── gate.mjs              백엔드 리포의 게이트를 실행하는 런처 (검사 로직은 복사하지 않는다)
│   └── smoke.md              프론트 사람 게이트 — 이 파일의 정본은 여기다
├── tasks/                    fe-* 티켓
├── onboarding/               팀원용 한 장 · frontend.md
└── src/
    ├── App.jsx               라우트 등록 + errorElement + path="*"       공용 FE-A
    ├── routes.js             경로 문자열은 여기서만 나온다                공용 FE-A
    ├── api/                  client(인스턴스·인터셉터) + 리소스별 1파일   공용 FE-A
    ├── store/                authStore · wishStore                      공용 FE-A
    ├── components/           Button · Layout · LoadingSpinner
    │                         ProductCard · StatusBadge · RequireAuth    공용 FE-A
    ├── styles/               tokens.css · global.css                    공용 FE-A
    └── pages/
        ├── ProductListPage/ ProductDetailPage/ ProductNewPage/          FE-B
        ├── MyPage/ TransactionDetailPage/                               FE-C
        ├── LoginPage/ SignupPage/                                       FE-A
        └── NotFoundPage/ ErrorPage/                                     FE-A
```

`pages/<화면>/` 안은 담당자 소유다 — 화면 전용 컴포넌트·스타일·훅을 그 폴더 안에 둔다.
**`pages/` 밖은 전부 공용 파일**이고 FE-A 한 명이 오너다.
`hooks/`·`utils/`를 미리 만들지 않는다 — 200줄 넘을 때 그 화면 폴더 안으로 꺼내고,
두 번째 화면이 필요로 할 때 그때 올린다.

---

## 규약 (기계로 검사된다)

```
# 전부 무출력이 정상
grep -rlE "axios|\bfetch\(" src/pages src/components
find src -name '*.css' ! -name '*.module.css' ! -path '*/styles/*'
grep -rnE '(color|background)[^:]*:[^;]*#[0-9a-fA-F]{3,8}' src --include='*.module.css'
```

- 서버 통신은 `src/api/`에서만. 봉투는 인터셉터가 한 곳에서 벗긴다(`res.data.data`)
- 검색어·카테고리·페이지는 **URL 쿼리**. Zustand는 `authStore`·`wishStore` 두 개만
- 색·간격은 `styles/tokens.css`의 `var(--...)`만
- 화면마다 네 상태(로딩·정상·**빈 결과**·에러)를 전부 만든다 — **빈 결과는 버그가 아니라 정상 상태다**
- 컴포넌트 파일마다 `propTypes`

## 브랜치·커밋

```
main                정본
 └── fe-<작업명>    작업 브랜치

커밋   feat|fix|docs|refactor|chore(<범위>): 한 줄 [T-###]
       예) feat(product): 상품 상세 찜 토글 [T-014]
```

**계약이 바뀌면 백엔드 리포가 먼저 머지된다.** 아침마다 백엔드 리포도 `git pull` 한다.
**일지(`worklog/`)는 백엔드 리포에 쓴다** — 전원이 한 곳 (SPEC.md §12).

---

## 아직 비어 있는 것

| 오너 | 채울 것 |
|---|---|
| FE-A | 로그인·회원가입 화면 · 반응형 3뷰포트(390·768·1280) 마감 |
| FE-B | 상품 상세·등록 화면 (이미지 다중 업로드 미리보기) |
| FE-C | 마이페이지 3탭 · 거래 상세(상태별 액션·분쟁 신고 폼) |

> **`pages/ProductListPage/`가 참고 구현이다** — 네 상태·검색·페이징이 모두 들어 있다.
> 나머지 화면은 이 구조를 따라 만든다.
