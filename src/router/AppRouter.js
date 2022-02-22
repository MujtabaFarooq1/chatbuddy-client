import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
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
  ProfilePage,
  AllFriendsPage,
  NotFoundPage,
} from "../pages/index";

import socket, { connectToSocket } from "../socket/socket";
import { useEffect } from "react";
import { useAuth } from "../context/auth-context";
import AllGames from "../pages/AllGames";
import SingleGamePage from "../pages/SingleGamePage";

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
        {/* <PrivateRoute path="/chat" component={ChatPage} /> */}
        <PrivateRoute path="/chat/:friendId" component={ChatPage} />
        {/* <PrivateRoute path="/dashboard" component={DashboardPage} /> */}

        <PrivateRoute path="/myFriends" component={AllFriendsPage} />
        <PrivateRoute path="/dashboard" component={AllPostsPage} />
        <PrivateRoute path="/users" component={DashboardPage} />
        <PrivateRoute path="/profile/:userId" component={ProfilePage} />
        <PrivateRoute path="/post/:postId" component={SinglePostPage} />
        <PrivateRoute path={"/games"} component={AllGames} />
        <PrivateRoute path={"/game/:gameId"} component={SingleGamePage} />

        {/* Available to everyone Routes ---------------------- */}
        <Route component={NotFoundPage} />
      </Switch>
    </Router>
  );
};

export default AppRouter;
