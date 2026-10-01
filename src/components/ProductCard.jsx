import { useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { addWish, removeWish } from "../api/products.js";
import { ROUTES } from "../routes.js";
import { useWishStore } from "../store/wishStore.js";
import { useAuthStore } from "../store/authStore.js";
import StatusBadge from "./StatusBadge.jsx";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const { id, title, priceKrw, status, categoryName, sellerNickname, thumbnailUrl } = product;
  const imageSrc = thumbnailUrl ? `${import.meta.env.VITE_API_URL}${thumbnailUrl}` : null;
  const wished = useWishStore((s) => s.wishedIds.includes(id));
  const addWishStore = useWishStore((s) => s.add);
  const removeWishStore = useWishStore((s) => s.remove);

  const accessToken = useAuthStore((s) => s.accessToken);
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState(false);

  const handleWishClick = async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!accessToken) {
          navigate(ROUTES.LOGIN, { state: {from: location.pathname + location.search } });
          return;
      }

      if (pending) return;
      setPending(true);

      if (wished) {
          removeWishStore(id);
      } else {
          addWishStore(id);
      }

      try {
          if (wished) {
              await removeWish(id);
          } else {
              await addWish(id);
          }
      } catch(err) {
          if (err.code === "WISH_ALREADY_EXISTS") {
              addWishStore(id);
          } else if (err.code === "WISH_NOT_FOUND") {
              removeWishStore(id);
          } else if (wished) {
              addWishStore(id);
          } else {
              removeWishStore(id);
          }
      } finally {
          setPending(false);
      }
  };

  return (
    <Link to={ROUTES.PRODUCT_DETAIL(id)} className={styles.card}>
      <div className={styles.thumb}>
        {imageSrc ? <img src={imageSrc} alt="" /> : <span className={styles.noImage}>이미지 없음</span>}
        <button type="button" className={`${styles.wish} ${wished ? styles.wished : ""}`} onClick={handleWishClick} disabled={pending}>
          <span aria-hidden="true">{wished ? "♥" : "♡"}</span>
          <span className={styles.srOnly}>{wished ? "찜한 상품" : "찜하지 않은 상품"}</span>
        </button>
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
