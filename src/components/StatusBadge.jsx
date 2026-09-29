import PropTypes from "prop-types";
import styles from "./StatusBadge.module.css";

const LABELS = {
  INSPECTING: "검수대기",
  ON_SALE: "판매중",
  IN_TRADE: "거래중",
  SOLD: "거래완료",
  REJECTED: "반려",
  PAID: "결제완료",
  SHIPPING: "배송중",
  CONFIRMED: "구매확정",
  DISPUTED: "분쟁",
  REFUNDED: "환불완료",
};

export default function StatusBadge({ status }) {
  return <span className={`${styles.badge} ${styles[status] ?? ""}`}>{LABELS[status] ?? status}</span>;
}

StatusBadge.propTypes = { status: PropTypes.string.isRequired };
