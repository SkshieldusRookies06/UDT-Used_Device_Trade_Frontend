import { Link } from "react-router-dom";
import { ROUTES } from "../../routes.js";

export default function NotFoundPage() {
  return (
    <section>
      <h1>페이지를 찾을 수 없습니다</h1>
      <Link to={ROUTES.HOME}>상품 목록으로</Link>
    </section>
  );
}
