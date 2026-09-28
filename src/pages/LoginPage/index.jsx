import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../../api/auth.js";
import { useAuthStore } from "../../store/authStore.js";
import Button from "../../components/Button.jsx";
import { ROUTES } from "../../routes.js";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const expired = searchParams.get("reason") === "expired";
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { accessToken, user } = await login({ email, password });
      setAuth(accessToken, user);
      navigate(location.state?.from || ROUTES.HOME, { replace: true });
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>로그인</h1>
        <p className={styles.subtitle}>검수와 안전거래를 거치는 중고 전자기기 거래</p>

        {expired && (
          <p className={styles.notice} role="status">다시 로그인해 주세요</p>
        )}

        <form className={styles.form} onSubmit={submit}>
          <label className={styles.field}>
            <span className={styles.label}>이메일</span>
            <input
              className={styles.input}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>비밀번호</span>
            <input
              className={styles.input}
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && (
            <div className={styles.errorBanner} role="alert">
              <span className={styles.errorIcon} aria-hidden="true">!</span>
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" size="lg" loading={submitting}>로그인</Button>
        </form>

        <p className={styles.switch}>
          계정이 없으신가요?
          <Link to={ROUTES.SIGNUP} className={styles.switchLink}>회원가입</Link>
        </p>
      </div>
    </section>
  );
}