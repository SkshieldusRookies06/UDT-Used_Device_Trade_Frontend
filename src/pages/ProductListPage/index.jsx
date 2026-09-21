import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts } from "../../api/products.js";
import ProductCard from "../../components/ProductCard.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import Button from "../../components/Button.jsx";
import Pagination from "./Pagination.jsx";
import styles from "./ProductListPage.module.css";

const SIZE = 12;

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? 0);

  const [keyword, setKeyword] = useState(q);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetchProducts({ q: q || undefined, page, size: SIZE })
      .then((res) => alive && setData(res))
      .catch((e) => alive && setError(e))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [q, page, reloadKey]);

  const submit = (event) => {
    event.preventDefault();
    setSearchParams(keyword ? { q: keyword, page: "0" } : { page: "0" });
  };

  return (
    <section>
      <h1 className={styles.heading}>판매 중인 상품</h1>

      <form className={styles.search} onSubmit={submit}>
        <input
          className={styles.input}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="상품명으로 검색"
          aria-label="상품 검색"
        />
        <Button type="submit">검색</Button>
      </form>

      {loading && <LoadingSpinner />}

      {!loading && error && (
        <div className={styles.state}>
          <p>{error.message}</p>
          <Button variant="secondary" onClick={() => setReloadKey((v) => v + 1)}>다시 시도</Button>
        </div>
      )}

      {!loading && !error && data?.content.length === 0 && (
        <div className={styles.state}>
          <p>조건에 맞는 상품이 없습니다.</p>
          <p className={styles.hint}>검색어를 지우거나 다른 단어로 찾아보세요.</p>
        </div>
      )}

      {!loading && !error && data?.content.length > 0 && (
        <>
          <ul className={styles.grid}>
            {data.content.map((product) => (
              <li key={product.id}><ProductCard product={product} /></li>
            ))}
          </ul>
          <Pagination
            page={data.page}
            onChange={(next) => setSearchParams(q ? { q, page: String(next) } : { page: String(next) })}
          />
        </>
      )}
    </section>
  );
}
