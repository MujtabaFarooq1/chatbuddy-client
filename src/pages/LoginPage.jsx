import React, { useEffect } from "react";
// import { useAuth } from "../context/auth-context";
// import { useHistory } from "react-router-dom";
// import { onAuthStateChanged } from "firebase/auth";
import { firebase, firebaseUi } from "../firebase/firebase";
import Particles from "react-tsparticles";

const particlesOptions = {
  background: {
    color: {
      value: "#0C1032",
    },
  },

  interactivity: {
    events: {
      onClick: {
        enable: true,
        mode: "push",
      },
      onHover: {
        enable: true,
        mode: "grab",
      },
      resize: true,
    },
    modes: {
      grab: {
        distance: 135,
        line_linked: {
          opacity: 1,
        },
      },
      bubble: {
        distance: 400,
        size: 40,
        duration: 2,
        opacity: 8,
        speed: 3,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
      push: {
        particles_nb: 4,
      },
      remove: {
        particles_nb: 2,
      },
    },
  },
  particles: {
    opacity: {
      value: 0.5,
      random: false,
      anim: {
        enable: false,
        speed: 1,
        opacity_min: 0.1,
        sync: false,
      },
    },
    size: {
      value: 3,
      random: true,
      anim: {
        enable: false,
        speed: 40,
        size_min: 0.1,
        sync: false,
      },
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#ffffff",
      opacity: 0.4,
      width: 1,
    },
    color: {
      value: "#ffffff",
    },
    links: {
      color: "#ffffff",
      distance: 150,
      enable: true,
      opacity: 0.5,
      width: 1,
    },
    collisions: {
      enable: true,
    },
    move: {
      direction: "none",
      enable: true,
      outMode: "bounce",
      random: false,
      speed: 2,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 100,
    },

    shape: {
      type: "circle",
    },
  },
  detectRetina: true,
};

const LoginPage = () => {
  // const { setAuth } = useAuth();
  // const history = useHistory();

  //component did mount
  useEffect(() => {
    firebaseUi.start("#firebaseui-auth-container", {
      signInSuccessUrl: "/dashboard",
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        // firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      ],
    });
    //Other Code Here
  }, []);

  return (
    <div id="loginPage">
      <Particles
        style={{ backgroundImage: `url('/img/loginBack.jpg')` }}
        id="tsparticles"
        options={particlesOptions}
      />

      {/* <button onClick={loginWithGoogle}>Login With Google</button>
      <br /> */}

      <div className="loginPageContent">
        <h1 className="loginPageHeading">Login/Register</h1>
        <div id="firebaseui-auth-container"></div>
      </div>
    </div>
  );
};

export default LoginPage;
