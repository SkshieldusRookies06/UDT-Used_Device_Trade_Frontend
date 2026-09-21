import styles from "./ProductNewPage.module.css";

export default function ProductNewPage() {
  return (
    <section className={styles.wrapper}>
      <h1>상품 등록 (SCR-003)</h1>
      <p>담당: FE-B · 계약: SPEC.md §4.4</p>
      <p>구현 전 단계. 네 상태(로딩·정상·빈 결과·에러)를 먼저 만든다 — SPEC.md §3.3</p>
    </section>
  );
}
