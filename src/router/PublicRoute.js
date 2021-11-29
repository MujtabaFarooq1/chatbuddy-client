import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../context/auth-context";

const PublicRoute = ({ component: Component, ...rest }) => {
  const { curAuth } = useAuth();
  return (
    <Route
      {...rest}
      component={(props) =>
        !curAuth.uid ? (
          <div>
            <Component {...props} />
          </div>
        ) : (
          <Redirect to="/dashboard" />
        )
      }
    />
  );
};

export default PublicRoute;
