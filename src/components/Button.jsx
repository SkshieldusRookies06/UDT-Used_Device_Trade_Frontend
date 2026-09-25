import PropTypes from "prop-types";
import styles from "./Button.module.css";

export default function Button({ children, variant, size, type, disabled, loading, onClick }) {
  const classes = [styles.button, styles[variant], styles[size], loading && styles.loading]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      onClick={onClick}
    >
      {loading && (
        <span className={styles.marker} aria-hidden="true">
          ◌
        </span>
      )}
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "ghost"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  type: PropTypes.oneOf(["button", "submit"]),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
};

Button.defaultProps = {
  variant: "primary",
  size: "sm",
  type: "button",
  disabled: false,
  loading: false,
  onClick: undefined,
};
