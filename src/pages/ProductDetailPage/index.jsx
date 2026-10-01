import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addWish, fetchProduct, removeWish } from "../../api/products.js";
import { purchase } from "../../api/transactions.js";
import { fetchMe } from "../../api/auth.js";
import { useAuthStore } from "../../store/authStore.js";
import { useWishStore } from "../../store/wishStore.js";
import { ROUTES } from "../../routes.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import Button from "../../components/Button.jsx";
import styles from "./ProductDetailPage.module.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const wishedIds = useWishStore((s) => s.wishedIds);
  const addWishStore = useWishStore((s) => s.add);
  const removeWishStore = useWishStore((s) => s.remove);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWished, setIsWished] = useState(false);
  const [wishCount, setWishCount] = useState(0);

  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    fetchProduct(id)
      .then((data) => {
        if (alive && data) {
          setProduct(data);
          const wishedState = Boolean(data.wished) || wishedIds.includes(id);
          setIsWished(wishedState);
          setWishCount(data.wishCount ?? 0);
        }
      })
      .catch((e) => {
        if (alive) setError(e);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id, reloadKey]);

  const handleWishToggle = async () => {
    if (!accessToken) {
      navigate(ROUTES.LOGIN, { state: { from: `/products/${id}` } });
      return;
    }

    const prevWished = isWished;
    const prevCount = wishCount;
    const nextWished = !prevWished;
    const nextCount = nextWished ? prevCount + 1 : Math.max(0, prevCount - 1);

    setIsWished(nextWished);
    setWishCount(nextCount);
    if (nextWished) {
      addWishStore(id);
    } else {
      removeWishStore(id);
    }

    try {
      const res = nextWished ? await addWish(id) : await removeWish(id);
      if (res && typeof res.wishCount === "number") {
        setWishCount(res.wishCount);
      }
    } catch {
      setIsWished(prevWished);
      setWishCount(prevCount);
      if (prevWished) {
        addWishStore(id);
      } else {
        removeWishStore(id);
      }
    }
  };

  const handlePurchase = async () => {
    // 로그인 확인
    if (!accessToken) {
      navigate(ROUTES.LOGIN, { state: { from: `/products/${id}` } });
      return;
    }

    // 구매 의사 확인 팝업 추가
    const isConfirmed = window.confirm(
      "해당 상품을 정말로 구매하시겠습니까?\n결제 후에는 가상 에스크로에 금액이 안전하게 보관됩니다."
    );
    
    // 취소를 누르면 로직 중단
    if (!isConfirmed) {
      return;
    }

    if (purchasing) return;
    setPurchasing(true);
    setPurchaseError("");

    try {
      const txn = await purchase(id);
      try {
        const me = await fetchMe();
        if (me) setUser(me);
      } catch {
        /* Ignore fetchMe error */
      }
      navigate(ROUTES.TRANSACTION_DETAIL(txn.id));
    } catch (err) {
      setPurchaseError(err?.message || "구매 처리 중 오류가 발생했습니다.");
      if (err?.code === "PRODUCT_NOT_ON_SALE") {
        setReloadKey((v) => v + 1);
      }
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.stateContainer}>
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    const is404 = error.status === 404 || error.code === "PRODUCT_NOT_FOUND";
    return (
      <div className={styles.stateContainer}>
        <h2 className={styles.stateTitle}>
          {is404 ? "존재하지 않는 상품입니다" : "상품 정보를 불러올 수 없습니다"}
        </h2>
        <p className={styles.stateMsg}>{error.message || "요청하신 상품을 찾을 수 없습니다."}</p>
        <Link to={ROUTES.HOME}>
          <Button variant="primary" size="md">상품 목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const {
    title,
    priceKrw,
    conditionGrade,
    status,
    categoryName,
    sellerId,
    sellerNickname,
    images = [],
    description,
  } = product;

  const getImageUrl = (img) => {
    if (!img) return null;
    const url = typeof img === "string" ? img : img.url;
    if (!url) return null;
    return url.startsWith("http") ? url : `${import.meta.env.VITE_API_URL}${url}`;
  };

  const mainImageUrl = images && images.length > 0 ? getImageUrl(images[selectedImageIndex] || images[0]) : null;

  return (
    <section className={styles.container}>
      <nav className={styles.breadcrumb} aria-label="경로">
        <Link to={ROUTES.HOME} className={styles.bcLink}>상품 목록</Link>
        <span>›</span>
        <span>{categoryName || "전체"}</span>
      </nav>

      <div className={styles.detailGrid}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImageWrapper}>
            {mainImageUrl ? (
              <img src={mainImageUrl} alt={title} className={styles.mainImage} />
            ) : (
              <div className={styles.noImagePlaceholder}>
                <span>상품 이미지</span>
              </div>
            )}
          </div>

          {images && images.length > 1 && (
            <div className={styles.thumbRow}>
              {images.map((img, idx) => {
                const src = getImageUrl(img);
                return (
                  <button
                    key={img.id || idx}
                    type="button"
                    className={`${styles.thumbBtn} ${idx === selectedImageIndex ? styles.thumbActive : ""}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`이미지 ${idx + 1}`}
                  >
                    {src ? <img src={src} alt="" /> : <span>이미지</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className={styles.infoCol}>
          <div className={styles.statusRow}>
            <StatusBadge status={status} />
            {conditionGrade && (
              <span className={styles.gradeBadge}>{conditionGrade} 등급</span>
            )}
            <span className={styles.sellerName}>판매자: {sellerNickname}</span>
          </div>

          <h1 className={styles.title}>{title}</h1>

          <div className={styles.priceRow}>
            <span className={styles.price}>{priceKrw?.toLocaleString()}</span>
            <span className={styles.currency}>원</span>
          </div>

          {/* Trust Panel */}
          <div className={styles.trustPanel}>
            <h3 className={styles.trustPanelTitle}>UDT 안전거래</h3>
            <ul className={styles.trustList}>
              <li>
                <strong>1. 관리자 검수 완료</strong>
                <p>등록된 상품은 검수를 통과해야 목록에 노출됩니다</p>
              </li>
              <li>
                <strong>2. 가상 에스크로</strong>
                <p>결제 금액은 거래가 끝날 때까지 보관됩니다</p>
              </li>
              <li>
                <strong>3. 구매확정 후 판매자 정산</strong>
                <p>물건을 확인하고 구매확정을 눌러야 정산됩니다</p>
              </li>
              <li>
                <strong>4. 문제가 생기면 분쟁 신청</strong>
                <p>증빙을 올리면 관리자가 환불 여부를 결정합니다</p>
              </li>
            </ul>
          </div>

          {purchaseError && (
            <div className={styles.errorBanner} role="alert">
              {purchaseError}
            </div>
          )}

          {/* Action Row */}
          <div className={styles.actionRow}>
            <button
              type="button"
              className={`${styles.wishBtn} ${isWished ? styles.wished : ""}`}
              onClick={handleWishToggle}
              aria-label="찜하기"
            >
              <span className={styles.heart}>{isWished ? "♥" : "♡"}</span>
              <span>{wishCount}</span>
            </button>

            <Button
              variant="primary"
              size="lg"
              loading={purchasing}
              disabled={purchasing}
              onClick={handlePurchase}
            >
              {purchasing ? "구매 처리 중..." : "구매하기"}
            </Button>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className={styles.descSection}>
        <h2 className={styles.descTitle}>상품 설명</h2>
        <div className={styles.descContent}>
          {description ? (
            <p>{description}</p>
          ) : (
            <p className={styles.descEmpty}>등록된 상품 설명이 없습니다.</p>
          )}
        </div>
      </div>
    </section>
  );
}