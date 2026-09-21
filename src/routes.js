export const ROUTES = {
  HOME: "/",
  PRODUCT_LIST: "/",
  PRODUCT_DETAIL: (id) => `/products/${id}`,
  PRODUCT_NEW: "/products/new",
  MYPAGE: "/mypage",
  TRANSACTION_DETAIL: (id) => `/transactions/${id}`,
  LOGIN: "/login",
  SIGNUP: "/signup",
};

export const PATTERNS = {
  PRODUCT_DETAIL: "/products/:id",
  TRANSACTION_DETAIL: "/transactions/:id",
};

export const PROTECTED = [ROUTES.PRODUCT_NEW, ROUTES.MYPAGE, PATTERNS.TRANSACTION_DETAIL];
