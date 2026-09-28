import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../api/auth.js";
import Button from "../../components/Button.jsx";
import { ROUTES } from "../../routes.js";
import styles from "./SignupPage.module.css";

const FIELDS = [
  { name: "email", label: "이메일", type: "email", autoComplete: "email",
    placeholder: "you@example.com", maxLength: 100 },
  { name: "password", label: "비밀번호", type: "password", autoComplete: "new-password",
    placeholder: "8자 이상", minLength: 8, maxLength: 72, pattern: "[!-~]+",
    title: "영문 대소문자 · 숫자 · 특수문자 8~72자 (공백 · 한글 불가)" },
  { name: "passwordConfirm", label: "비밀번호 확인", type: "password", autoComplete: "new-password",
    placeholder: "다시 입력" },
  { name: "nickname", label: "닉네임", type: "text", autoComplete: "nickname",
    placeholder: "거래 화면에 표시되는 이름", maxLength: 30, pattern: ".*\\S.*",
    title: "공백만으로는 만들 수 없습니다" },
];

const SERVER_FIELDS = ["email", "password", "nickname"];
const PASSWORD_MISMATCH = "비밀번호가 일치하지 않습니다";

export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", passwordConfirm: "", nickname: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const change = (name) => (event) => {
    setForm((prev) => ({ ...prev, [name]: event.target.value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setFormError(null);
    if (form.password !== form.passwordConfirm) {
      setFieldErrors({ passwordConfirm: PASSWORD_MISMATCH });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await signup({ email: form.email, password: form.password, nickname: form.nickname });
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (e) {
      const next = {};
      let unmatched = false;
      if (e.code === "EMAIL_ALREADY_EXISTS") next.email = e.message;
      e.fields.forEach(({ name, message }) => {
        if (SERVER_FIELDS.includes(name)) next[name] ??= message;
        else unmatched = true;
      });
      setFieldErrors(next);
      if (unmatched || Object.keys(next).length === 0) setFormError(e.message);
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>회원가입</h1>
        <p className={styles.subtitle}>하나의 계정으로 판매자와 구매자 역할을 모두 수행합니다</p>

        <form className={styles.form} onSubmit={submit}>
          {FIELDS.map(({ name, label, ...inputProps }) => {
            const message = fieldErrors[name];
            const errorId = `signup-${name}-error`;
            return (
              <div className={styles.field} key={name}>
                <label className={styles.label} htmlFor={`signup-${name}`}>{label}</label>
                <input
                  {...inputProps}
                  id={`signup-${name}`}
                  name={name}
                  className={`${styles.input} ${message ? styles.inputError : ""}`}
                  value={form[name]}
                  onChange={change(name)}
                  aria-invalid={Boolean(message)}
                  aria-describedby={message ? errorId : undefined}
                  required
                />
                {message && <p id={errorId} className={styles.fieldError}>{message}</p>}
              </div>
            );
          })}

          {formError && (
            <div className={styles.errorBanner} role="alert">
              <span className={styles.errorIcon} aria-hidden="true">!</span>
              <span>{formError}</span>
            </div>
          )}

          <Button type="submit" size="lg" loading={submitting}>가입하기</Button>
        </form>

        <p className={styles.switch}>
          이미 계정이 있으신가요?
          <Link to={ROUTES.LOGIN} className={styles.switchLink}>로그인</Link>
        </p>
      </div>
    </section>
  );
}