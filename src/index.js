import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import AppRouter from "./router/AppRouter";
import reportWebVitals from "./reportWebVitals";
import useOnlineStatus from "./hooks/useOnlineStatus";
import database, { firebase } from "./firebase/firebase";
import { connectToSocket } from "./socket/socket";
import { AuthProvider } from "./context/auth-context";
import CallModelProvider from "./context/callModelContext";
import PeerModelProvider from "./context/peerModelContext";
import StreamModelProvider from "./context/streamsModelContext";
import "firebaseui/dist/firebaseui.css";
import "antd/dist/antd.css";
import "./App.css";
import adapter from "webrtc-adapter";

//Global variable
let hasRendered = false;

const Loading = () => {
  const { online } = useOnlineStatus();
  if (!online) {
    hasRendered = true;
    return <h1> You are Offline - retry</h1>;
  }
  return <h1>Loading ...</h1>;
};

ReactDOM.render(<Loading />, document.getElementById("root"));

const MyApp = ({ uid }) => {
  useEffect(() => {
    connectToSocket(uid);
  }, []);

  return (
    // ----------- Authentication Context provider -----------
    <AuthProvider uid={uid}>
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
  );
};

const renderApp = (uid) => {
  if (!hasRendered) {
    ReactDOM.render(<MyApp uid={uid} />, document.getElementById("root"));
    hasRendered = true;
  }
};
// const renderApp = (uid) => {
//   if (!hasRendered) {
//     connectToSocket(uid);
//     ReactDOM.render(
//       <AuthProvider uid={uid}>
//         <CallModelProvider>
//           <PeerModelProvider>
//             <AppRouter />
//           </PeerModelProvider>
//         </CallModelProvider>
//       </AuthProvider>,
//       document.getElementById("root")
//     );
//     hasRendered = true;
//   }
// };

firebase.auth().onAuthStateChanged((user) => {
  const uid = user?.uid;
  console.log(adapter.browserDetails.browser);
  if (uid) {
    database()
      .ref(`users/${uid}`)
      .once("value")
      .then((snapshot) => {
        // const snap = snapshot.val()[Object.keys(snapshot.val())[0]];
        // console.log(snap);
        if (snapshot.val() == null) {
          database()
            .ref(`users/${uid}`)
            .set({
              userName: user.displayName,
              email: user.email,
              img: user.photoURL,
            })
            .then((ref) => {
              console.log(ref);
            });
        }

        // renderApp(uid);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // renderApp(uid);
  // if (curUser == null) {
  // }

  renderApp(uid);
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
