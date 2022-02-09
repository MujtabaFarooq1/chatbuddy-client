import { BrowserRouter as Router, Switch } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

// import LoginPage from "../pages/LoginPage";
// import ChatPage from "../pages/ChatPage";
// import DashboardPage from "../pages/DashboardPage";

import {
  LoginPage,
  ChatPage,
  DashboardPage,
  AllPostsPage,
  SinglePostPage,
} from "../pages/index";

import socket, { connectToSocket } from "../socket/socket";
import { useEffect } from "react";
import { useAuth } from "../context/auth-context";

const AppRouter = () => {
  const auth = useAuth();
  useEffect(() => {
    if (socket?.disconnected) {
      connectToSocket(auth?.curAuth?.uid);
    }
  }, [auth]);
  return (
    <Router>
      <Switch>
        {/* Public Routes ---------------------- */}
        <PublicRoute path="/" component={LoginPage} exact={true} />

        {/* Private Routes ---------------------- */}
        <PrivateRoute path="/chat" component={ChatPage} />
        <PrivateRoute path="/dashboard" component={DashboardPage} />
        <PrivateRoute path="/allPosts" component={AllPostsPage} />
        <PrivateRoute path="/post/:postId" component={SinglePostPage} />

        {/* Available to everyone Routes ---------------------- */}
      </Switch>
    </Router>
  );
};

export default AppRouter;
