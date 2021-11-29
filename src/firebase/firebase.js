import firebase from "firebase/app";
import * as firebaseui from "firebaseui";
import "firebase/database";
// import "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHR8qPLxbuOC-8KzrwL3XZgjsR2JkqCec",
  authDomain: "chat-buddy-d6954.firebaseapp.com",
  databaseURL: "https://chat-buddy-d6954-default-rtdb.firebaseio.com",
  projectId: "chat-buddy-d6954",
  storageBucket: "chat-buddy-d6954.appspot.com",
  messagingSenderId: "199717606212",
  appId: "1:199717606212:web:bb3c5163793a6b1382fd11",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebaseDb.initializeApp(firebaseConfig);

const database = firebase.database;

//auth provider
// const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

const firebaseUi = new firebaseui.auth.AuthUI(firebase.auth());

// const firebaseUiWhole = firebaseui;

// googleAuthProvider.addScope("profile");
// googleAuthProvider.addScope("email");

export { firebase, firebaseUi, database as default };
