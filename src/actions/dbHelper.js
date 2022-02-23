// import { ref, uploadBytes } from "firebase/storage";
import database from "../firebase/firebase";
import { getCurrentUser } from "../actions/users";
import { storage } from "../firebase/firebase";
import { nanoid } from "nanoid";
import * as toxicity from "@tensorflow-models/toxicity";
import { message } from "antd";

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

// Remove Friend Async

// Async Function
const removeFriendAsync = async (uid) => {
  const curentUser = await getCurrentUser();
  if (curentUser.uid === null) {
    throw new Error("Sorry You have to be logged in to add a friend");
  }
  const retrivedUser = await database().ref(`users/${uid}`).once("value");

  if (retrivedUser.val() !== null) {
    //Remove user from my friend
    await database().ref(`users/${curentUser.uid}/friends/${uid}`).remove();

    // Remove me from user
    await database().ref(`users/${uid}/friends/${curentUser.uid}`).remove();
  } else {
    throw new Error("Sorry this user doesn't exist!");
  }

  return retrivedUser;
};

// -----------------

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

const getUserFromUid = async (uid) => {
  return await (await database().ref(`users/${uid}`).once("value")).val();
};

const createPostAsync = async (uid, postData) => {
  const { title, description, postImages } = postData;
  const subFolder = "postImages/";
  const postImageFolder = storage.ref(subFolder);
  const currentTimeStamp = Math.round(new Date().getTime() / 1000);

  const author = await getUserFromUid(uid);

  if (author) {
    try {
      const images = postImages.map(async (file) => {
        let fileNameTosave = file.name.split(".");
        fileNameTosave = `${
          fileNameTosave[0]
        }-${currentTimeStamp}-${nanoid()}.${fileNameTosave[1]}`;

        await postImageFolder.child(fileNameTosave).put(file);

        return fileNameTosave;
      });

      const imgNames = await Promise.all(images);

      await database().ref(`posts`).push({
        createdBy: uid,
        createdAt: currentTimeStamp,
        postDescription: description,
        postTitle: title,
        postImages: imgNames,
        authorId: uid,
      });

      return "Post Created !";
    } catch (error) {
      return error.message;
    }
  }

  return "Something went wrong in creating post !";
};

const getPostImageUrl = async (fileName) => {
  const subFolder = "postImages/";
  const postImageFolder = storage.ref(subFolder);
  const imgUrl = await postImageFolder.child(fileName).getDownloadURL();

  return imgUrl;
};

const handlePostLike = async (postId, uid) => {
  try {
    if (!postId || !uid) {
      throw new Error("Something is missing here !");
    }

    const postRef = await database().ref(`posts/${postId}`).once("value");
    const post = postRef.val();
    let tempPostLikes = [uid];

    if (!post) {
      throw new Error("Post Not found!");
    }

    const postLikes = post.likes;

    if (postLikes && postLikes.includes(uid)) {
      tempPostLikes = postLikes.filter((likeId) => !(likeId === uid));
    } else if (postLikes) {
      tempPostLikes = [...postLikes, uid];
    }

    await database().ref(`posts/${postId}/likes`).set(tempPostLikes);

    return tempPostLikes;
  } catch (error) {
    throw new Error(error);
  }
};

const getAllPosts = async (uid) => {
  try {
    const posts = await database().ref("posts").once("value");
    const postsSnap = await posts.val();

    const realPosts = Object.keys(postsSnap).map((key) => {
      const postId = key;
      const postData = postsSnap[key];
      let isFav = false;

      if (postData?.likes) {
        isFav = postData?.likes?.length
          ? postData?.likes?.includes(uid)
          : postData.likes[Object.keys(postData.likes)[0]] === uid;
      }

      return {
        postId,
        isFav,
        ...postsSnap[key],
      };
    });

    return realPosts.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    throw new Error(error);
  }
};

const getSinglePost = async (postId, uid) => {
  if (!postId || !uid) {
    throw new Error("Something went very wrong !");
  }

  try {
    const post = await database().ref(`posts/${postId}`).once("value");
    const postSnap = await post.val();
    let isFav = false;

    if (!postSnap) {
      throw new Error("Post not found !");
    }

    if (postSnap?.likes) {
      isFav = postSnap?.likes?.length
        ? postSnap?.likes?.includes(uid)
        : postSnap.likes[Object.keys(postSnap.likes)[0]] === uid;
    }

    return {
      postId,
      isFav,
      ...postSnap,
    };
  } catch (err) {
    throw new Error(err);
  }
};

const addComment = async (postId, uid, comment) => {
  try {
    if (!postId || !uid || !comment) {
      throw new Error("Something went very wrong !");
    }

    // The minimum prediction confidence.
    const threshold = 0.9;
    const moderationModel = await toxicity.load(threshold);
    const predictions = await moderationModel.classify([comment]);
    let mederationError = "";

    predictions.forEach((prediction) => {
      if (prediction.results[0].match) {
        mederationError += ` ${prediction.label}`;
      }
    });

    if (!!mederationError) {
      throw new Error(
        `Your comment is blocked due to (${mederationError}) Content `
      );
    }

    const post = await database().ref(`posts/${postId}`).once("value");
    const user = await database().ref(`users/${uid}`).once("value");
    const userSnap = await user.val();
    const postSnap = await post.val();

    if (!postSnap || !userSnap) {
      throw new Error("Sorry Invalid information  !");
    }

    const prevComments = postSnap?.comments || [];

    const commentObjToAdd = {
      comment,
      commentedBy: uid,
      createdAt: Math.round(new Date().getTime() / 1000),
    };

    await database()
      .ref(`posts/${postId}/comments`)
      .set([...prevComments, commentObjToAdd]);

    return { ...commentObjToAdd, userName: user.userName, img: user?.img };
  } catch (error) {
    throw new Error(error);
  }
};

const getAllChatMessagesForRoom = async (roomId) => {
  const allMessages = await database().ref(`chats/${roomId}`).once("value");
  const allMessagesSnap = await allMessages.val();

  if (!allMessagesSnap) {
    return [];
  }

  return allMessagesSnap;
};

const sendMessagePermanent = async (roomId, newMessage) => {
  try {
    if (!roomId && !newMessage) {
      throw new Error("Something went very wrong!");
    }
    const prevMessages = await getAllChatMessagesForRoom(roomId);
    delete newMessage["type"];
    const messageListToSave = [...prevMessages, newMessage];

    await database().ref(`chats/${roomId}`).set(messageListToSave);
  } catch (err) {
    throw new Error("Message saving failed!");
  }
};

const getPostsOfUser = async (uid, myUid) => {
  try {
    if (!uid) {
      throw new Error("Sorry Something went wrong!");
    }

    const posts = await database().ref(`posts`).once("value");
    const allPosts = await posts.val();

    const realPosts = Object.keys(allPosts).map((key) => {
      const postId = key;
      const postData = allPosts[key];
      let isFav = false;

      if (postData?.likes) {
        isFav = postData?.likes?.length
          ? postData?.likes?.includes(myUid)
          : postData.likes[Object.keys(postData.likes)[0]] === uid;
      }

      return {
        postId,
        isFav,
        ...allPosts[key],
      };
    });

    const usersPosts = realPosts?.filter((post) => post.createdBy === uid);

    return [...usersPosts];
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateUserProfile = async (uid, update) => {
  if (!uid && !update) {
    throw new Error("Somthing went very wrong");
  }

  try {
    const uploadImage =
      update?.newProfileImage?.fileList[
        update.newProfileImage?.fileList.length - 1
      ].originFileObj;

    if (uploadImage) {
      const subFolder = "usersProfileImages/";
      const profileImageFolder = storage.ref(subFolder);
      let fileNameTosave = uploadImage.name.split(".");
      const currentTimeStamp = Math.round(new Date().getTime() / 1000);
      fileNameTosave = `${fileNameTosave[0]}-${currentTimeStamp}-${nanoid()}.${
        fileNameTosave[1]
      }`;

      await profileImageFolder.child(fileNameTosave).put(uploadImage);

      const imgUrl = await profileImageFolder
        .child(fileNameTosave)
        .getDownloadURL();

      update["img"] = imgUrl;

      delete update["newProfileImage"];
    }

    const updatedRes = await database().ref(`users/${uid}`).update(update);
    return updatedRes;
  } catch (err) {
    throw new Error(err.message);
  }
};

const deletePost = async (postId) => {
  return await database().ref(`posts/${postId}`).remove();
};

const addNewGame = async (gameData) => {
  try {
    const postedGame = await database().ref(`games`).push(gameData);
    return postedGame;
  } catch (e) {
    throw new Error(e.message);
  }
};

const getAllGames = async () => {
  const gamesSnap = await database().ref("games").once("value");
  const gamesData = gamesSnap.val();

  const gameDataList = [];
  for (const [key, value] of Object.entries(gamesData)) {
    gameDataList.push({
      gameId: key,
      ...value,
    });
  }

  return gameDataList;
};

const getGameByGameId = async (gameId) => {
  const gameSnap = await database().ref(`games/${gameId}`).once("value");
  const gameData = gameSnap.val();

  return gameData;
};

const toggleShowFriends = async (uid) => {
  if (!uid) {
    throw new Error("Invalid Operation!");
  }
  const userSnap = await database().ref(`users/${uid}`).once("value");
  const userData = userSnap.val();
  if (!userSnap) {
    throw new Error("Invalid Operation!");
  }
  const showFriends = !userData.showFriends;

  return await database().ref(`users/${uid}`).update({ showFriends });
};

export {
  getAllUsersAsync,
  getAllFriendsAsync,
  addFriendAsync,
  checkIfUserExistWithId,
  createPostAsync,
  getUserFromUid,
  getAllPosts,
  getPostImageUrl,
  handlePostLike,
  getSinglePost,
  addComment,
  sendMessagePermanent,
  getAllChatMessagesForRoom,
  getPostsOfUser,
  updateUserProfile,
  deletePost,
  addNewGame,
  getAllGames,
  getGameByGameId,
  removeFriendAsync,
  toggleShowFriends,
};
