# UDT 프론트 — 에이전트 컨텍스트

이 리포는 프론트 코드만 담는다. **계약 정본 `SPEC.md`는 백엔드 리포(`../UDT-Used_Device_Trade-backend/SPEC.md`)에 있다.**
여기에 복사하지 않는다 — 복사본은 반드시 낡는다.
**코드와 충돌하면 그쪽 `SPEC.md`가 이긴다.**

구조: `src/api/` · `src/store/` · `src/components/` · `src/pages/<화면>/` · `src/styles/` · `seams/` · `tasks/`

## 강제 규약
- 서버 통신은 `src/api/`에서만. 컴포넌트에서 `axios`/`fetch` 직접 호출 금지
- 응답 봉투는 인터셉터가 한 곳에서 벗긴다(`res.data.data`) — 화면은 알맹이만 본다
- 검색어·카테고리·페이지는 **URL 쿼리**. Zustand는 `authStore`·`wishStore` 두 개만
- 경로 문자열은 `src/routes.js` 상수에서만 나온다
- 색·간격은 `styles/tokens.css`의 `var(--...)`만. 전역 CSS는 `styles/` 두 파일뿐
- 화면마다 네 상태(로딩·정상·빈 결과·에러)를 전부 만든다
- props를 받는 컴포넌트마다 `propTypes` (props 없는 페이지 컴포넌트는 제외)

## 명령
```
개발     npm run dev          (localhost:5173 · 127.0.0.1 아님)
빌드     npm run build        (에러 0이어야 머지)
미리보기  npm run preview
게이트    npm run gate         (백엔드 리포의 check-api.mjs 를 실행)
목 서버   npm run mock         (백엔드 리포의 mock/server.mjs 를 실행)
커밋      feat|fix|docs|refactor|chore|test(<범위>): 한 줄 [T-###]   (규약: 백엔드 리포 docs/참고/GitHub규약.md)
```

## 금지
- **`seams/gate.mjs`를 수정하지 않는다.** 게이트가 틀렸다고 판단되면 멈추고 보고
- **백엔드 리포를 고치지 않는다.** 계약이 틀렸으면 멈추고 보고 (SPEC §12)
- **commit·push·merge 금지** — 사람이 한다
- **전면 재작성 금지** — 최소 diff
- 공용 파일(`src/api/` · `src/store/` · `src/styles/` · `src/components/` · `App.jsx` · `routes.js`)을
  자기 페이지 폴더에서 재정의하지 않는다
- 계약 밖 임의 더미 데이터로 개발 금지 — 목 서버·시드만
- 코드 주석은 최소화 — 설명은 `README.md`에 둔다
