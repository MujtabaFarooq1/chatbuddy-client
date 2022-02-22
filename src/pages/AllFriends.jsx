import React, { useState, useEffect } from "react";
import { Divider, Image, Avatar, Button, Skeleton, Input } from "antd";
import { Container, Row, Col } from "react-grid-system";
import { getCurrentUser } from "../actions/users";
import { getAllFriendsAsync, removeFriendAsync } from "../actions/dbHelper";
import socket from "../socket/socket";
import { UserOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import SearchBox from "../components/searchBox";

// import database from "../firebase/firebase";

const AllFriendsPage = () => {
  // const [user, setUser] = useState({});
  const [friends, setFriends] = useState([]);
  const [friendsToShow, setFriendsToShow] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const curUser = getCurrentUser();

  //
  useEffect(() => {
    // setUser({ ...curUser });
    return setingUpUsersAndFriends(curUser.uid);
  }, []);

  const setingUpUsersAndFriends = async (myUid) => {
    let allFriends = [];
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
    setFriendsToShow([...allFriends]);

    setLoading(false);
  };

  const gotoUserRoom = (roomId) => {
    try {
      if (socket.connected === false) {
        throw new Error("Server Connection Error!");
      }
      history.push({
        pathname: `/chat/${roomId}`,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const filterFriendsByText = (textToSearchBy) => {
    if (!friends) {
      return;
      console.log("Try creating friends to search thankyou!");
    }

    let searchedFriends = [];

    friends.forEach((frnd) => {
      if (frnd.userName.toLowerCase().includes(textToSearchBy)) {
        searchedFriends.push(frnd);
      } else if (frnd.email.toLowerCase().includes(textToSearchBy)) {
        searchedFriends.push(frnd);
      }
    });

    setFriendsToShow(searchedFriends);
  };

  return (
    <div>
      <div>
        <SearchBox
          searchButtonTitle="Search Friends"
          searchFunction={filterFriendsByText}
        />
        <>
          <Divider orientation="left">Friends</Divider>
          <Container>
            <Row debug style={{ paddingTop: "15px" }}>
              {!loading ? (
                friendsToShow &&
                friendsToShow.map((friend) => (
                  <Col
                    key={friend.uid}
                    className="gutter-row"
                    sm={12}
                    lg={3}
                    md={8}
                  >
                    <div className="user-content-wrapper">
                      {friend.img ? (
                        <Image className="userImage" src={friend.img} />
                      ) : (
                        <Avatar size={100} icon={<UserOutlined />} />
                      )}

                      <h3
                        className="goToProfileHeading"
                        onClick={() => {
                          history.push(`/profile/${friend.uid}`);
                        }}
                      >
                        {friend.userName}
                      </h3>

                      <Button
                        onClick={() => {
                          gotoUserRoom(friend.uid);
                        }}
                        key="message"
                        type="primary"
                      >
                        Message
                      </Button>

                      <Button
                        onClick={() => {
                          removeFriendAsync(friend.uid).then(() => {
                            history.push("/myFriends");
                          });
                        }}
                        key="removeFriend"
                        type="primary"
                        style={{ marginLeft: "10px" }}
                      >
                        Remove Friend
                      </Button>
                    </div>
                  </Col>
                ))
              ) : (
                <Skeleton avatar active paragraph={{ rows: 4 }} />
              )}

              {friendsToShow && !loading && friendsToShow.length < 1 && (
                <h1>
                  {" "}
                  You Dont Have Any Friends Yet Add Friends And Start Chatting
                  Now!{" "}
                </h1>
              )}
            </Row>
          </Container>
        </>
      </div>
    </div>
  );
};

export default AllFriendsPage;
