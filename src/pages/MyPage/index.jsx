import styles from "./MyPage.module.css";
<<<<<<< HEAD

export default function MyPage() {
  return (
    <section className={styles.wrapper}>
      <h1>마이페이지 (SCR-004)</h1>
      <p>담당: FE-C · 계약: SPEC.md §4.9</p>
      <p>구현 전 단계. 네 상태(로딩·정상·빈 결과·에러)를 먼저 만든다 — SPEC.md §3.3</p>
    </section>
  );
}
=======
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { 
fetchMyTransactions, 
fetchMyProducts, 
fetchMyWishes } from "../../api/transactions.js";

import ProductCard from "../../components/ProductCard.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import Button from "../../components/Button.jsx";
import Pagination from "../ProductListPage/Pagination.jsx";  

const TABS = [
  { id: "products", label: "내 상품" },
  { id: "selling", label: "판매 내역" },
  { id: "buying", label: "구매 내역" },
  { id: "wishes", label: "찜 목록" },
];

const SIZE = 12;

export default function MyPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const tab = searchParams.get("tab") ?? "products"; 
  const page = Number(searchParams.get("page") ?? 0);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab, page: "0" });
  };

 useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    const fetchMyPageData = async () => {
      if (tab === "products") return await fetchMyProducts({ page, size: SIZE });
      if (tab === "selling")  return await fetchMyTransactions({ role: "seller", page, size: SIZE });
      if (tab === "buying")   return await fetchMyTransactions({ role: "buyer", page, size: SIZE });
      if (tab === "wishes")   return await fetchMyWishes({ page, size: SIZE });
      
      return { content: [], page: { number: 0, totalPages: 0, first: true, last: true } };
    };

    fetchMyPageData()
      .then((res) => alive && setData(res.data))
      .catch((e) => alive && setError(e))
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, [tab, page, reloadKey]);

  return (
    <section>
      <h1 className={styles.heading}>마이페이지</h1>

      <div className={styles.search}>
        {TABS.map((t) => (
          <Button 
            key={t.id} 
            variant={tab === t.id ? "primary" : "secondary"} 
            onClick={() => handleTabChange(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {loading && <LoadingSpinner />}

      {!loading && error && (
        <div className={styles.state}>
          <p>{error.message}</p>
          <Button variant="secondary" onClick={() => setReloadKey((v) => v + 1)}>다시 시도</Button>
        </div>
      )}

      {/* 빈 탭은 에러가 아님 (정상 상태) */}
      {!loading && !error && (!data || data.content.length === 0) && (
        <div className={styles.state}>
          <p>아직 등록된 내역이 없습니다.</p>
        </div>
      )}

      {!loading && !error && data?.content.length > 0 && (
        <>
          <ul className={styles.grid}>
            {data.content.map((item) => (
              <li key={item.id}>
                <ProductCard product={item.product || item} />
                
                {(tab === "selling" || tab === "buying") && item.status && (
                  <div style={{ marginTop: "8px", textAlign: "center" }}>
                    <button 
                      style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}
                      onClick={() => navigate(`/transactions/${item.id}`)}
                    >
                      <StatusBadge status={item.status} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <Pagination
            page={data.page}
            onChange={(next) => setSearchParams({ tab, page: String(next) })}
          />
        </>
      )}
    </section>
  );
}
>>>>>>> f8370d6 (T-016 — 마이페이지 4탭 구현)
