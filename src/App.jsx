import { createBrowserRouter } from "react-router-dom";
import { PATTERNS, ROUTES } from "./routes.js";
import Layout from "./components/Layout.jsx";
import ErrorPage from "./pages/ErrorPage/index.jsx";
import NotFoundPage from "./pages/NotFoundPage/index.jsx";
import ProductListPage from "./pages/ProductListPage/index.jsx";
import ProductDetailPage from "./pages/ProductDetailPage/index.jsx";
import ProductNewPage from "./pages/ProductNewPage/index.jsx";
import MyPage from "./pages/MyPage/index.jsx";
import TransactionDetailPage from "./pages/TransactionDetailPage/index.jsx";
import LoginPage from "./pages/LoginPage/index.jsx";
import SignupPage from "./pages/SignupPage/index.jsx";
import RequireAuth from "./components/RequireAuth.jsx";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { path: ROUTES.PRODUCT_LIST, element: <ProductListPage /> },
      { path: PATTERNS.PRODUCT_DETAIL, element: <ProductDetailPage /> },
      { path: ROUTES.PRODUCT_NEW, element: <RequireAuth><ProductNewPage /></RequireAuth> },
<<<<<<< HEAD
      { path: ROUTES.MYPAGE, element: <RequireAuth><MyPage /></RequireAuth> },
=======
      { path: ROUTES.MYPAGE, element: <MyPage /> },
>>>>>>> f8370d6 (T-016 — 마이페이지 4탭 구현)
      { path: PATTERNS.TRANSACTION_DETAIL, element: <RequireAuth><TransactionDetailPage /></RequireAuth> },
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.SIGNUP, element: <SignupPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
