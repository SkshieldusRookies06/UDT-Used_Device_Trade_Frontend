import styles from "./TransactionDetailPage.module.css";

export default function TransactionDetailPage() {
  return (
    <section className={styles.wrapper}>
      <h1>거래 상세 (SCR-005)</h1>
      <p>담당: FE-C · 계약: SPEC.md §4.6 · §4.7 · §4.8</p>
      <p>구현 전 단계. 네 상태(로딩·정상·빈 결과·에러)를 먼저 만든다 — SPEC.md §3.3</p>
    </section>
  );
}
