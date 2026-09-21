import PropTypes from "prop-types";
import styles from "./LoadingSpinner.module.css";

export default function LoadingSpinner({ label }) {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <span className={styles.spinner} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}

LoadingSpinner.propTypes = { label: PropTypes.string };
LoadingSpinner.defaultProps = { label: "불러오는 중…" };
