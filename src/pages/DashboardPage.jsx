import React, { useState, useEffect } from "react";
import { Divider, Image, Avatar, Button, Skeleton } from "antd";
import { Container, Row, Col } from "react-grid-system";
import { getCurrentUser } from "../actions/users";
import {
  getAllUsersAsync,
  getAllFriendsAsync,
  addFriendAsync,
} from "../actions/dbHelper";
import socket from "../socket/socket";
import { UserOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import { nanoid } from "nanoid";
import { width } from "@mui/system";
import SearchBox from "../components/searchBox";

// import database from "../firebase/firebase";

const DashboardPage = () => {
  // const [user, setUser] = useState({});
  const [friends, setFriends] = useState([]);
  const [usersToShow, setUsersToShow] = useState([]);
  const [usersList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
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
    setUsersToShow(allUsers);
    setLoading(false);
  };

  //Functions
  const addFriend = (uid) => {
    addFriendAsync(uid)
      .then((friend) => {
        const { email, img, userName } = friend.val();
        setFriends([...friends, { uid: friend.key, email, img, userName }]);
        history.push("/users");
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

  const filterUsersByText = (textToSearchBy) => {
    if (!usersList) {
      return console.log(
        "You are friend with Everyone on our app , but wait new users are coming"
      );
    }

    let searchedUsers = [];

    usersList.forEach((user) => {
      if (user.userName.toLowerCase().includes(textToSearchBy)) {
        searchedUsers.push(user);
      } else if (
        user.email &&
        user.email.toLowerCase().includes(textToSearchBy)
      ) {
        searchedUsers.push(user);
      }
    });

    setUsersToShow(searchedUsers);
  };

  return (
    <div>
      <h1> Make New Friends </h1>
      <div>
        <SearchBox
          searchButtonTitle="Search Users"
          searchFunction={filterUsersByText}
        />
        <>
          <Divider orientation="left"></Divider>
          <Container>
            <Row debug>
              {!loading ? (
                usersToShow &&
                usersToShow.map((user) => (
                  <Col
                    key={user.uid}
                    className="gutter-row"
                    sm={12}
                    lg={3}
                    md={8}
                  >
                    <div className="user-content-wrapper">
                      {user.img ? (
                        <Image className="userImage" src={user.img} />
                      ) : (
                        <Avatar size={100} icon={<UserOutlined />} />
                      )}

                      <h3
                        className="goToProfileHeading"
                        onClick={() => {
                          history.push(`/profile/${user.uid}`);
                        }}
                      >
                        {user.userName}
                      </h3>
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
                ))
              ) : (
                <Skeleton avatar active paragraph={{ rows: 4 }} />
              )}

              {usersToShow && !loading && usersToShow.length < 1 && (
                <h1>
                  {" "}
                  EveryOne Is Already Your Friend , But Stay tuned new suers are
                  coming!{" "}
                </h1>
              )}
            </Row>
          </Container>
        </>
      </div>
    </div>
  );
};

export default DashboardPage;
