import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import ru from "javascript-time-ago/locale/ru.json";

import "firebaseui/dist/firebaseui.css";
import "antd/dist/antd.css";

import { withErrorBoundary } from "react-error-boundary";

import AppRouter from "./router/AppRouter";
import useOnlineStatus from "./hooks/useOnlineStatus";
import database, { firebase } from "./firebase/firebase";
import { connectToSocket } from "./socket/socket";
import { AuthProvider } from "./context/auth-context";
import CallModelProvider from "./context/callModelContext";
import PeerModelProvider from "./context/peerModelContext";
import StreamModelProvider from "./context/streamsModelContext";
import AppScreenLoading from "./components/AppScreenLoading";

import "./App.css";

//Global variable
let hasRendered = false;
TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(ru);

const Loading = () => {
  const { online } = useOnlineStatus();
  if (!online) {
    hasRendered = true;
    return <h1> You are Offline - retry</h1>;
  }
  return <AppScreenLoading LoadingDescription={"Initializing App !"} />;
};

ReactDOM.render(<Loading />, document.getElementById("root"));

const MyApp = ({ uid, userName }) => {
  const { online } = useOnlineStatus();

  useEffect(() => {
    if (uid) {
      connectToSocket(uid);
    }
  }, [uid]);

  useEffect(() => {
    console.log(online);
  }, [online]);

  return online ? (
    // ----------- Authentication Context provider -----------
    <AuthProvider uid={uid} userName={userName}>
      {/* // ----------- Call Model Context Provider ----------- */}
      <CallModelProvider>
        {/* // ----------- Peer Model Context Provider ----------- */}
        <PeerModelProvider>
          {/* // ----------- Stream Model Context Provider  ----------- */}
          <StreamModelProvider>
            <AppRouter />
          </StreamModelProvider>
        </PeerModelProvider>
      </CallModelProvider>
    </AuthProvider>
  ) : (
    <h1> You Are Offline ! </h1>
  );
};

const MyAppWithErrorBondry = withErrorBoundary(MyApp, {
  FallbackComponent: <h1>Oops Looks like something went wrong !</h1>,
  onError(error, info) {
    console.log(error, info);
  },
});

const renderApp = (uid, userName) => {
  if (!hasRendered) {
    ReactDOM.render(
      <MyAppWithErrorBondry uid={uid} userName={userName} />,
      document.getElementById("root")
    );
    hasRendered = true;
  }
};

firebase.auth().onAuthStateChanged((user) => {
  const uid = user?.uid;
  const userName = user?.displayName;

  if (uid) {
    database()
      .ref(`users/${uid}`)
      .once("value")
      .then((snapshot) => {
        if (snapshot.val() == null) {
          database()
            .ref(`users/${uid}`)
            .set({
              userName: userName || "Anonymous",
              email: user.email,
              img: user.photoURL,
            })
            .then((ref) => {
              console.log(ref);
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  renderApp(uid, userName);
});
