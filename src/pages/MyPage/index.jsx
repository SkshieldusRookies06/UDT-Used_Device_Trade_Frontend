import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes.js";
import { useAuthStore } from "../../store/authStore.js";
import { fetchMe } from "../../api/auth.js";
import {
  fetchMyTransactions,
} from "../../api/transactions.js";
import {
  fetchMyProducts,
  fetchMyWishes,
} from "../../api/products.js";

import ProductCard from "../../components/ProductCard.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import Button from "../../components/Button.jsx";
import Pagination from "../ProductListPage/Pagination.jsx";
import styles from "./MyPage.module.css";

const TABS = [
  { id: "buying", label: "구매내역" },
  { id: "selling", label: "판매내역" },
  { id: "wishes", label: "찜 목록" },
  { id: "products", label: "내 상품" },
];

const SIZE = 12;

function Thumbnail({ src, alt }) {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  const fullSrc =
    !hasError && src
      ? src.startsWith("http://") || src.startsWith("https://")
        ? src
        : `${import.meta.env.VITE_API_URL}${src}`
      : null;

  if (!fullSrc || hasError) {
    return <div className={styles.productThumb}>사진 없음</div>;
  }

  return (
    <img
      src={fullSrc}
      alt={alt}
      className={styles.productThumb}
      onError={() => setHasError(true)}
    />
  );
}

Thumbnail.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
};

export default function MyPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const tab = searchParams.get("tab") ?? "buying";
  const page = Number(searchParams.get("page") ?? 0);

  const [data, setData] = useState(null);
  // 추가된 부분: 현재 불러온 데이터가 어느 탭의 데이터인지 추적합니다.
  const [dataTab, setDataTab] = useState(tab); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // 최신 사용자 정보 및 잔액 동기화
  useEffect(() => {
    fetchMe()
      .then((res) => {
        const freshUser = res?.user || res?.data || res;
        if (freshUser && typeof freshUser === "object" && freshUser.id) {
          setUser(freshUser);
        }
      })
      .catch(() => {});
  }, [setUser]);

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab, page: "0" });
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    const fetchTabData = async () => {
      if (tab === "buying") return await fetchMyTransactions({ role: "buyer", page, size: SIZE });
      if (tab === "selling") return await fetchMyTransactions({ role: "seller", page, size: SIZE });
      if (tab === "wishes") return await fetchMyWishes({ page, size: SIZE });
      if (tab === "products") return await fetchMyProducts({ page, size: SIZE });
      return { content: [], page: { number: 0, totalPages: 0, totalElements: 0, first: true, last: true } };
    };

    fetchTabData()
      .then((res) => {
        if (!alive) return;
        const content = res?.content ?? res?.data?.content ?? [];
        const pageInfo = res?.page ?? res?.data?.page ?? null;
        setData({ content, page: pageInfo });
        setDataTab(tab); // 데이터가 도착했을 때만 dataTab을 현재 탭으로 동기화합니다.
      })
      .catch((e) => alive && setError(e))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [tab, page, reloadKey]);

  const currentTabObj = TABS.find((t) => t.id === tab) ?? TABS[0];
  const totalCount = data?.page?.totalElements ?? data?.content?.length ?? 0;

  // 추가된 부분: 로딩 중이거나, 탭 URL이 바뀌었지만 아직 데이터가 도착하지 않았다면 로딩 상태로 간주
  const isSyncingTab = loading || dataTab !== tab;

  // 탭별 Empty State 내용
  const renderEmptyState = () => {
    switch (tab) {
      case "buying":
        return (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconCircle}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>구매한 거래 내역이 없습니다</h3>
            <p className={styles.emptyDescription}>원하는 전자기기를 찾아 안심 거래를 시작해 보세요.</p>
            <Button variant="primary" onClick={() => navigate(ROUTES.PRODUCT_LIST)}>
              상품 둘러보기
            </Button>
          </div>
        );
      case "selling":
        return (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconCircle}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>판매한 거래 내역이 없습니다</h3>
            <p className={styles.emptyDescription}>더 이상 쓰지 않는 기기를 등록하고 안전하게 판매해 보세요.</p>
            <Button variant="secondary" onClick={() => navigate(ROUTES.PRODUCT_NEW)}>
              상품 등록하기
            </Button>
          </div>
        );
      case "wishes":
        return (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconCircle}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>찜한 상품이 없습니다</h3>
            <p className={styles.emptyDescription}>마음에 드는 상품을 찜해두면 여기 모입니다.</p>
            <Button variant="primary" onClick={() => navigate(ROUTES.PRODUCT_LIST)}>
              상품 둘러보기
            </Button>
          </div>
        );
      case "products":
      default:
        return (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconCircle}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>아직 등록한 상품이 없습니다</h3>
            <p className={styles.emptyDescription}>사용하지 않는 기기를 등록해 보세요.</p>
            <Button variant="secondary" onClick={() => navigate(ROUTES.PRODUCT_NEW)}>
              상품 등록하기
            </Button>
          </div>
        );
    }
  };

  // 1 & 2: 거래내역 테이블 렌더링 (구매내역 / 판매내역)
  const renderTransactionTable = () => (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <div>상품</div>
        <div className={styles.tableHeaderColRight}>금액</div>
        <div className={styles.tableHeaderColCenter}>거래 상태</div>
        <div className={styles.tableHeaderColCenter}>일자</div>
        <div className={styles.tableHeaderColRight}></div>
      </div>
      <div>
        {data.content.map((item) => {
          const thumb = item.thumbnailUrl || item.product?.thumbnailUrl;
          const counterpart = tab === "buying" ? `판매자 ${item.sellerNickname || "-"}` : `구매자 ${item.buyerNickname || "-"}`;
          const title = item.productTitle || item.title || "상품명 없음";
          const amount = item.amountKrw ?? item.priceKrw ?? 0;
          const dateStr = (item.createdAt || "").slice(0, 10);

          return (
            <div key={item.id} className={styles.tableRow}>
              <div className={styles.productCol}>
                <Thumbnail src={thumb} alt={title} />
                <div className={styles.productInfo}>
                  <p className={styles.productTitle} title={title}>{title}</p>
                  <p className={styles.orderSubText}>거래 #{item.id} · {counterpart}</p>
                </div>
              </div>
              <div className={styles.amountCol}>
                {amount.toLocaleString()}원
              </div>
              <div className={styles.statusCol}>
                <StatusBadge status={item.status} />
              </div>
              <div className={styles.dateCol}>
                {dateStr}
              </div>
              <div className={styles.actionCol}>
                <Button
                  variant="secondary"
                  onClick={() => navigate(ROUTES.TRANSACTION_DETAIL(item.id))}
                >
                  거래 상세
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // 3: 내 상품 리스트 렌더링
  const renderMyProductsList = () => (
    <ul className={styles.myProductList}>
      {data.content.map((item) => {
        const thumb = item.thumbnailUrl;
        const price = item.priceKrw ?? 0;

        return (
          <li
            key={item.id}
            className={styles.myProductRow}
            onClick={() => navigate(ROUTES.PRODUCT_DETAIL(item.id))}
          >
            <div className={styles.myProductLeft}>
              <Thumbnail src={thumb} alt={item.title} />
              <div className={styles.myProductDetails}>
                <p className={styles.myProductTitle}>{item.title}</p>
                {item.status === "INSPECTING" && (
                  <p className={styles.myProductNoticeMuted}>- 관리자 검수를 기다리는 중입니다</p>
                )}
                {item.status === "REJECTED" && (
                  <p className={styles.myProductNoticeRejected}>
                    - 반려 사유: {item.rejectReason || "이미지가 실제 제품과 다릅니다"}
                  </p>
                )}
              </div>
            </div>
            <div className={styles.myProductRight}>
              <span className={styles.myProductPrice}>{price.toLocaleString()}원</span>
              <StatusBadge status={item.status} />
            </div>
          </li>
        );
      })}
    </ul>
  );

  // 4: 찜 목록 그리드 렌더링
  const renderWishesGrid = () => (
    <ul className={styles.grid}>
      {data.content.map((item) => (
        <li key={item.id}>
          <ProductCard product={item.product || item} />
        </li>
      ))}
    </ul>
  );

  return (
    <section className={styles.container}>
      {/* 피그마 상단 프로필 & 잔액 카드 */}
      <div className={styles.profileCard}>
        <div className={styles.profileLeft}>
          <div className={styles.avatar}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.nickname}>{user?.nickname || "사용자"}</h2>
            <p className={styles.metaText}>
              {user?.email || "user@udt.test"} · 일반회원 {user?.role || "MEMBER"}
            </p>
          </div>
        </div>
        <div className={styles.balanceBox}>
          <div className={styles.balanceLabel}>가상 잔액 balanceKrw</div>
          <div className={styles.balanceAmount}>
            {(user?.balanceKrw ?? 0).toLocaleString()} 원
          </div>
        </div>
      </div>

      {/* 피그마 언더라인 탭 바 */}
      <nav className={styles.tabBar} aria-label="마이페이지 탭 목록">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.tabButton} ${tab === t.id ? styles.tabButtonActive : ""}`}
            onClick={() => handleTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* 섹션 타이틀 및 총 건수 */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{currentTabObj.label}</h3>
        {!isSyncingTab && !error && data && (
          <span className={styles.totalCount}>총 {totalCount}건</span>
        )}
      </div>

      {/* 네 가지 상태 분기 (안전장치 적용) */}
      {isSyncingTab && !error && <LoadingSpinner />}

      {!isSyncingTab && error && (
        <div className={styles.errorState}>
          <p className={styles.errorMessage}>{error.message || "데이터를 불러오지 못했습니다."}</p>
          <Button variant="secondary" onClick={() => setReloadKey((v) => v + 1)}>
            다시 시도
          </Button>
        </div>
      )}

      {!isSyncingTab && !error && (!data || data.content.length === 0) && renderEmptyState()}

      {!isSyncingTab && !error && data?.content?.length > 0 && (
        <>
          {(tab === "buying" || tab === "selling") && renderTransactionTable()}
          {tab === "products" && renderMyProductsList()}
          {tab === "wishes" && renderWishesGrid()}

          {data.page && data.page.totalPages > 1 && (
            <Pagination
              page={data.page}
              onChange={(next) => setSearchParams({ tab, page: String(next) })}
            />
          )}
        </>
      )}
    </section>
  );
}