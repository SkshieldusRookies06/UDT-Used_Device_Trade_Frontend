import styles from "./SignupPage.module.css";

export default function SignupPage() {
  return (
    <section className={styles.wrapper}>
      <h1>회원가입 (SCR-007)</h1>
      <p>담당: FE-A · 계약: SPEC.md §4.9</p>
      <p>구현 전 단계. 네 상태(로딩·정상·빈 결과·에러)를 먼저 만든다 — SPEC.md §3.3</p>
    </section>
  );
}
