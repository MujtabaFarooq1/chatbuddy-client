import { firebase } from "../firebase/firebase";

export const getCurrentUser = () => {
  return firebase.auth().currentUser;
};
export const getCurrentUserUserName = () => {
  return firebase.auth().currentUser.displayName;
};
export const getCurrentUserEmail = () => {
  return firebase.auth().currentUser.email;
};

export const getCurrentUserId = () => {
  return firebase.auth().currentUser.uid;
};
