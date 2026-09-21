import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ROUTES } from "../routes.js";
import StatusBadge from "./StatusBadge.jsx";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const { id, title, priceKrw, status, categoryName, sellerNickname, thumbnailUrl } = product;
  const imageSrc = thumbnailUrl ? `${import.meta.env.VITE_API_URL}${thumbnailUrl}` : null;

  return (
    <Link to={ROUTES.PRODUCT_DETAIL(id)} className={styles.card}>
      <div className={styles.thumb}>
        {imageSrc ? <img src={imageSrc} alt="" /> : <span className={styles.noImage}>이미지 없음</span>}
      </div>
      <div className={styles.body}>
        <StatusBadge status={status} />
        <p className={styles.title}>{title}</p>
        <p className={styles.price}>{priceKrw.toLocaleString()}원</p>
        <p className={styles.meta}>{categoryName} · {sellerNickname}</p>
      </div>
    </Link>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    priceKrw: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    categoryName: PropTypes.string,
    sellerNickname: PropTypes.string,
    thumbnailUrl: PropTypes.string,
  }).isRequired,
};
