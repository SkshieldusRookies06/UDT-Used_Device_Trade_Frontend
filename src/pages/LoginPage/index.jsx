import styles from "./LoginPage.module.css";

export default function LoginPage() {
  return (
    <section className={styles.wrapper}>
      <h1>로그인 (SCR-006)</h1>
      <p>담당: FE-A · 계약: SPEC.md §4.9 · §3.4</p>
      <p>구현 전 단계. 네 상태(로딩·정상·빈 결과·에러)를 먼저 만든다 — SPEC.md §3.3</p>
    </section>
  );
}
