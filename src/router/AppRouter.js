import { BrowserRouter as Router, Switch } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import LoginPage from "../components/LoginPage";
import ChatPage from "../components/ChatPage";
import DashboardPage from "../components/DashboardPage";

const AppRouter = () => {
  return (
    <Router>
      <Switch>
        {/* <Route path="/" component={LoginPage} exact={true} />
        <Route path="/chat" component={ChatPage} exact={true} /> */}
        {/* <Route path="/chat" component={ChatPage} /> */}
        <PublicRoute path="/" component={LoginPage} exact={true} />
        <PrivateRoute path="/chat" component={ChatPage} />
        <PrivateRoute path="/dashboard" component={DashboardPage} />
      </Switch>
    </Router>
  );
};

export default AppRouter;
