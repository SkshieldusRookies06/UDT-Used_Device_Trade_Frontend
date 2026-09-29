import PropTypes from "prop-types";
import styles from "./LoadingSpinner.module.css";

export default function LoadingSpinner({ size, label }) {
  return (
    <span className={`${styles.wrapper} ${styles[size]}`} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </span>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md"]),
  label: PropTypes.string,
};

LoadingSpinner.defaultProps = {
  size: "md",
  label: "불러오는 중…",
};
