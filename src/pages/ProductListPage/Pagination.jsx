import PropTypes from "prop-types";
import Button from "../../components/Button.jsx";
import styles from "./ProductListPage.module.css";

export default function Pagination({ page, onChange }) {
  const { number, totalPages, first, last } = page;
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label="페이지 이동">
      <Button variant="secondary" disabled={first} onClick={() => onChange(number - 1)}>이전</Button>
      <span>{number + 1} / {totalPages}</span>
      <Button variant="secondary" disabled={last} onClick={() => onChange(number + 1)}>다음</Button>
    </nav>
  );
}

Pagination.propTypes = {
  page: PropTypes.shape({
    number: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    first: PropTypes.bool.isRequired,
    last: PropTypes.bool.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
