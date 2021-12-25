import React, { useEffect } from "react";
// import { useAuth } from "../context/auth-context";
// import { useHistory } from "react-router-dom";
// import { onAuthStateChanged } from "firebase/auth";
import { firebase, firebaseUi } from "../firebase/firebase";

const LoginPage = () => {
  // const { setAuth } = useAuth();
  // const history = useHistory();

  //component did mount
  useEffect(() => {
    firebaseUi.start("#firebaseui-auth-container", {
      signInSuccessUrl: "/dashboard",
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      ],
    });
    //Other Code Here
  }, []);

  // onAuthStateChanged(auth, (user) => {
  //   if (user) {
  //     const uid = user.uid;
  //     // ...
  //   } else {
  //     // User is signed out
  //     // ...
  //   }
  // });

  // const loginWithGoogle = () => {
  //   firebase
  //     .auth()
  //     .signInWithPopup(googleAuthProvider)
  //     .then((auth) => {
  //       setAuth({ uid: auth.user.uid });
  //       history.push("/chat");
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

  // const loginWithFirebase = () => {
  //   firebaseUi.start("#firebaseui-auth-container", {
  //     signInOptions: [
  //       firebase.auth.EmailAuthProvider.PROVIDER_ID,
  //       firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  //     ],
  //     // Other config options...
  //   });
  // };

  return (
    <div>
      <h1>Login Page</h1>
      {/* <button onClick={loginWithGoogle}>Login With Google</button>
      <br /> */}

      <div id="firebaseui-auth-container"></div>
    </div>
  );
};

export default LoginPage;
