import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  return (
    <section style={{ padding: "48px 16px", textAlign: "center" }}>
      <h1>화면을 표시하는 중 오류가 발생했습니다</h1>
      <p>{error?.message ?? "알 수 없는 오류"}</p>
      <button type="button" onClick={() => window.location.reload()}>새로고침</button>
    </section>
  );
}
