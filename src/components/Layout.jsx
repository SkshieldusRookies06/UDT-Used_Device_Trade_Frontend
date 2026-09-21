import { Link, Outlet } from "react-router-dom";
import { ROUTES } from "../routes.js";
import { useAuthStore } from "../store/authStore.js";
import styles from "./Layout.module.css";

export default function Layout() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link to={ROUTES.HOME} className={styles.logo}>UDT</Link>
        <nav className={styles.nav}>
          {user ? (
            <>
              <Link to={ROUTES.PRODUCT_NEW}>상품 등록</Link>
              <Link to={ROUTES.MYPAGE}>마이페이지</Link>
              <span className={styles.balance}>{user.balanceKrw?.toLocaleString()}원</span>
              <button type="button" className={styles.linkButton} onClick={clear}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN}>로그인</Link>
              <Link to={ROUTES.SIGNUP}>회원가입</Link>
            </>
          )}
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
