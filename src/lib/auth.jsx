import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = window.localStorage.getItem("token")
  return isAuthenticated != null ? <Component {...rest} /> : <Navigate to="/connexion" />;
};

ProtectedRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
};

export default ProtectedRoute;
