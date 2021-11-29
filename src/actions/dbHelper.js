import database from "../firebase/firebase";
import { getCurrentUser } from "../actions/users";

const getAllUsersAsync = async () => {
  //get all the users here
  const users = await database().ref(`users`).once("value");
  return users;
};

const getAllFriendsAsync = async () => {
  //set all the friends here
  const curentUser = await getCurrentUser();
  if (curentUser.uid === null) {
    throw new Error("Sorry You have to be logged in to view all your friends");
  }
  const friends = await database()
    .ref(`users/${curentUser.uid}/friends`)
    .once("value");

  return friends;
};

// Async Function
const addFriendAsync = async (uid) => {
  let friend = null;
  const curentUser = await getCurrentUser();
  if (curentUser.uid === null) {
    throw new Error("Sorry You have to be logged in to add a friend");
  }
  const retrivedUser = await database().ref(`users/${uid}`).once("value");
  if (retrivedUser.val() !== null) {
    friend = await database()
      .ref(`users/${curentUser.uid}/friends/${uid}`)
      .once("value");
  } else {
    throw new Error("Sorry this user doesn't exist!");
  }

  if (friend.val() === null) {
    const { email, img, userName } = retrivedUser.val();

    //Make user my friend
    await database()
      .ref(`users/${curentUser.uid}/friends/${uid}`)
      .set(JSON.parse(JSON.stringify({ email, img, userName })));

    // Make users friend
    await database().ref(`users/${uid}/friends/${curentUser.uid}`).set({
      email: curentUser.email,
      img: curentUser.photoURL,
      userName: curentUser.displayName,
    });
  } else {
    throw new Error("Sorry this user is already your friend");
  }

  return retrivedUser;
};

const checkIfUserExistWithId = async (uid) => {
  let user;
  try {
    user = await database().ref(`users/${uid}`).once("value");
  } catch (e) {
    console.log(e);
    return false;
  }

  return user.val() ? true : false;
};

export {
  getAllUsersAsync,
  getAllFriendsAsync,
  addFriendAsync,
  checkIfUserExistWithId,
};
