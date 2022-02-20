import { Route, Redirect, useHistory } from "react-router-dom";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { useCallModelContext } from "../context/callModelContext";
import { useAuth } from "../context/auth-context";
import { Layout } from "antd";
// import AppHeader from "../components/AppHeader";
import SideMenu from "../components/SideMenu";
import AppFooter from "../components/AppFooter";
import ContentWrapper from "../components/ContentWrapper";
import CallModel from "../components/CallModel";
import socket from "../socket/socket";
import { notification } from "antd";
import { useEffect } from "react";

// const { online } = useOnlineStatus();
//   const [isOnline, setIsOnline] = useState(online);

//   useEffect(() => {
//     if (!isOnline) {
//       history.push("/");
//     }
//   }, [isOnline, history]);

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { curAuth } = useAuth();
  let history = useHistory();
  const { callModelState, callModelDispatch } = useCallModelContext();

  const openNotification = ({ from, message }) => {
    console.log();

    !history.location.pathname.includes(`/chat/${from}`) &&
      notification.open({
        message: "New Message 🔔",
        description: `${message}`,
        onClick: () => {
          history.push(`/chat/${from}`);
        },
      });
  };

  useEffect(() => {
    // Global Socket notification stuff
    if (!socket._callbacks[`$msg-notify`]) {
      socket.on("msg-notify", (payload) => {
        curAuth.uid !== payload.from && openNotification(payload);
      });
    }

    // Global Ringing Model
    if (!socket._callbacks[`$callUser`]) {
      socket.on("callUser", ({ initiatorId, initiatorName, to }) => {
        console.log(
          "Im recieving a call from ",
          initiatorName,
          "List of connection objects are ",
          to
        );

        if (!callModelState.modelOpen) {
          callModelDispatch({
            type: "RINGING",
            payload: { initiatorId, initiatorName, to },
          });
        } else {
          // socket.emit("reject-call", {
          //   rejectedBy: curAuth.uid,
          //   rejectedTo: callModelState?.options?.to,
          // });
        }

        console.log("Model is currently", callModelState.modelOpen);

        // setCall({ isReceivingCall: true, from, name: callerName, signal });
      });
    }
  }, []);

  return (
    <Route
      {...rest}
      component={(props) =>
        curAuth.uid ? (
          <Layout>
            <SideMenu />
            <Layout>
              {/* <AppHeader /> */}
              <ContentWrapper>
                <Component {...props} />
              </ContentWrapper>
              <AppFooter />
              <CallModel />
            </Layout>
          </Layout>
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );
};

export default PrivateRoute;
