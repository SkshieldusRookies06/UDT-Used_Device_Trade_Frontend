import { Link, Outlet } from "react-router-dom";
import { ROUTES } from "../routes.js";
import { useAuthStore } from "../store/authStore.js";
import styles from "./Layout.module.css";

const krw = new Intl.NumberFormat("ko-KR");

export default function Layout() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const isMember = Boolean(accessToken);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to={ROUTES.HOME} className={styles.brand}>
            <span className={styles.mark} aria-hidden="true">U</span>
            <span className={styles.wordmark}>
              <span className={styles.logo}>UDT</span>
              <span className={styles.tagline}>Used Device Safe Trade</span>
            </span>
          </Link>

          <nav className={styles.nav}>
            <Link to={ROUTES.HOME} className={styles.searchEntry} aria-label="검색">
              <span aria-hidden="true">⌕</span>
            </Link>

            {isMember ? (
              <>
                <Link to={ROUTES.PRODUCT_NEW} className={styles.ctaSecondary}>상품 등록</Link>
                <Link to={ROUTES.MYPAGE} className={styles.navLink}>마이페이지</Link>
                {user && (
                  <span className={styles.userInfo}>
                    <span className={styles.nickname}>{user.nickname}</span>
                    {user.balanceKrw != null && (
                      <span className={styles.balance}>
                        잔액 {krw.format(user.balanceKrw)}원
                      </span>
                    )}
                  </span>
                )}
                <button type="button" className={styles.linkButton} onClick={clear}>로그아웃</button>
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className={styles.navLink}>로그인</Link>
                <Link to={ROUTES.SIGNUP} className={styles.ctaPrimary}>회원가입</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerBrand}>UDT — Used Device Safe Trade</p>
          <p className={styles.footerTeam}>SK쉴더스 루키즈 6기 2차 웹프로젝트 · 팀 프로젝트</p>
          <p className={styles.footerNotice}>
            본 서비스의 결제 · 정산은 가상이며 실제 금융 거래가 발생하지 않습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
