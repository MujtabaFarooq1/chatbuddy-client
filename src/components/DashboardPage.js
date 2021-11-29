import React, { useState, useEffect } from "react";
import { Row, Col, Divider, Image, Avatar, Button } from "antd";
import { getCurrentUser } from "../actions/users";
import {
  getAllUsersAsync,
  getAllFriendsAsync,
  addFriendAsync,
} from "../actions/dbHelper";
import socket from "../socket/socket";
import { UserOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";

// import database from "../firebase/firebase";

const DashboardPage = () => {
  // const [user, setUser] = useState({});
  const [friends, setFriends] = useState([]);
  const [usersList, setUserList] = useState([]);
  const history = useHistory();
  const curUser = getCurrentUser();

  //
  useEffect(() => {
    // setUser({ ...curUser });
    setingUpUsersAndFriends(curUser.uid);
  }, []);

  const setingUpUsersAndFriends = async (myUid) => {
    let allFriends = [];
    let allUsers = [];

    // Getting All The Friends
    const allFriendsSnap = await getAllFriendsAsync();
    allFriendsSnap.forEach((childSnapshot) => {
      // frnds.push({ uid: childSnapshot.key, ...childSnapshot.val() });
      allFriends = [
        ...allFriends,
        { uid: childSnapshot.key, ...childSnapshot.val() },
      ];
    });
    setFriends([...allFriends]);

    //Getting All the users Except Me
    const allUsersSnap = await getAllUsersAsync();
    allUsersSnap.forEach((childSnapshot) => {
      const { email, img, userName } = childSnapshot.val();
      allUsers = [
        ...allUsers,
        { uid: childSnapshot.key, email, img, userName },
      ];
    });
    allUsers = allUsers.filter((userNode) => {
      return (
        userNode.uid !== myUid && !checkIfUserIsFriend(userNode.uid, allFriends)
      );
    });

    setUserList(allUsers);
  };

  //Functions
  const addFriend = (uid) => {
    addFriendAsync(uid)
      .then((friend) => {
        const { email, img, userName } = friend.val();
        setFriends([...friends, { uid: friend.key, email, img, userName }]);
      })
      .catch((err) => {
        console.log(err.message);
      });

    setUserList(usersList.filter((userNode) => userNode.uid !== uid));
  };

  const checkIfUserIsFriend = (uid, allFriends) => {
    let flag = false;
    allFriends.forEach((friend) => {
      if (friend.uid === uid) {
        flag = true;
      }
    });
    return flag;
  };

  const gotoUserRoom = (roomId) => {
    try {
      if (socket.connected === false) {
        throw new Error("Server Connection Error!");
      }
      history.push({
        pathname: `/chat`,
        to: roomId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="App">
      <h1>Welcome Back !</h1>
      <div>
        <>
          <Divider orientation="left">Users</Divider>
          <Row gutter={[16, { xs: 8, sm: 16, md: 24, lg: 32 }]}>
            {usersList.map((user) => (
              <Col key={user.uid} className="gutter-row" span={6}>
                <div className="user-content-wrapper">
                  {user.img ? (
                    <Image className="userImage" src={user.img} />
                  ) : (
                    <Avatar size={100} icon={<UserOutlined />} />
                  )}

                  <h3>{user.userName}</h3>
                  <Button
                    onClick={() => {
                      addFriend(user.uid);
                    }}
                    key="addFriend"
                    type="primary"
                  >
                    Add Friend
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        </>
      </div>

      <div>
        <>
          <Divider orientation="left">Friends</Divider>
          <Row gutter={[16, { xs: 8, sm: 16, md: 24, lg: 32 }]}>
            {friends.map((friend) => (
              <Col key={friend.uid} className="gutter-row" span={6}>
                <div className="user-content-wrapper">
                  {friend.img ? (
                    <Image className="userImage" src={friend.img} />
                  ) : (
                    <Avatar size={100} icon={<UserOutlined />} />
                  )}

                  <h3>{friend.userName}</h3>
                  <Button
                    onClick={() => {
                      gotoUserRoom(friend.uid);
                    }}
                    key="goToChat"
                    type="primary"
                  >
                    Message
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        </>
      </div>
    </div>
  );
};

export default DashboardPage;
