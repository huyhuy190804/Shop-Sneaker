import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ensureValidAuthSession } from "@/services/authSession";

const ProtectedRoute = () => {
  const location = useLocation();

  if (!ensureValidAuthSession()) {
    const redirect = `${location.pathname}${location.search}`;

    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
