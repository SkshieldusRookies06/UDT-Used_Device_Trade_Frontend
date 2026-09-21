import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "../routes.js";
import { useAuthStore } from "../store/authStore.js";

export default function RequireAuth({ children }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const location = useLocation();

  if (!accessToken) return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
  return children;
}

RequireAuth.propTypes = { children: PropTypes.node.isRequired };
