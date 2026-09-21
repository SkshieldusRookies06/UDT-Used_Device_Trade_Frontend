import styles from "./ProductDetailPage.module.css";

export default function ProductDetailPage() {
  return (
    <section className={styles.wrapper}>
      <h1>상품 상세 (SCR-002)</h1>
      <p>담당: FE-B · 계약: SPEC.md §4.3 · §4.5</p>
      <p>구현 전 단계. 네 상태(로딩·정상·빈 결과·에러)를 먼저 만든다 — SPEC.md §3.3</p>
    </section>
  );
}
