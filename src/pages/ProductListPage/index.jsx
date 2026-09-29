import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCategories, fetchProducts } from "../../api/products.js";
import ProductCard from "../../components/ProductCard.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import Button from "../../components/Button.jsx";
import Pagination from "./Pagination.jsx";
import styles from "./ProductListPage.module.css";

const SIZE = 12;

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const page = Number(searchParams.get("page") ?? 0);

  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState(q);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setKeyword(q);
  }, [q]);

  useEffect(() => {
    let alive = true;
    fetchCategories()
      .then((res) => {
        if (alive && Array.isArray(res)) {
          setCategories(res);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetchProducts({
      q: q || undefined,
      categoryId: categoryId || undefined,
      page,
      size: SIZE,
    })
      .then((res) => alive && setData(res))
      .catch((e) => alive && setError(e))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [q, categoryId, page, reloadKey]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = {};
    if (keyword.trim()) params.q = keyword.trim();
    if (categoryId) params.categoryId = categoryId;
    params.page = "0";
    setSearchParams(params);
  };

  const handleCategorySelect = (selectedId) => {
    const params = {};
    if (q) params.q = q;
    if (selectedId) params.categoryId = selectedId;
    params.page = "0";
    setSearchParams(params);
  };

  const handlePageChange = (nextPage) => {
    const params = {};
    if (q) params.q = q;
    if (categoryId) params.categoryId = categoryId;
    params.page = String(nextPage);
    setSearchParams(params);
  };

  return (
    <section>
      <h1 className={styles.heading}>판매 중인 상품</h1>

      <form className={styles.search} onSubmit={handleSearchSubmit}>
        <input
          className={styles.input}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="상품명으로 검색"
          aria-label="상품 검색"
        />
        <Button type="submit">검색</Button>
      </form>

      <div className={styles.categoryBar} role="tablist" aria-label="카테고리 필터">
        <button
          type="button"
          className={`${styles.categoryBtn} ${!categoryId ? styles.categoryBtnActive : ""}`}
          onClick={() => handleCategorySelect("")}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`${styles.categoryBtn} ${String(categoryId) === String(cat.id) ? styles.categoryBtnActive : ""}`}
            onClick={() => handleCategorySelect(String(cat.id))}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}

      {!loading && error && (
        <div className={styles.state}>
          <p>{error.message}</p>
          <Button variant="secondary" onClick={() => setReloadKey((v) => v + 1)}>
            다시 시도
          </Button>
        </div>
      )}

      {!loading && !error && data?.content?.length === 0 && (
        <div className={styles.state}>
          <p>조건에 맞는 상품이 없습니다.</p>
          <p className={styles.hint}>검색어를 지우거나 다른 단어로 찾아보세요.</p>
        </div>
      )}

      {!loading && !error && data?.content && data.content.length > 0 && (
        <>
          <ul className={styles.grid}>
            {data.content.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
          <Pagination
            page={data.page}
            onChange={handlePageChange}
          />
        </>
      )}
    </section>
  );
}
