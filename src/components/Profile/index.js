import { Button, Image, Modal, Tabs, Upload, Form, Input } from "antd";
import React, { useState, useEffect, useRef } from "react";
import { Link, useHistory } from "react-router-dom";
import { nanoid } from "nanoid";
import { useAuth } from "../../context/auth-context";
import PostFeedItem from "../PostFeedItem";
import "./profile.css";
import {
  getPostsOfUser,
  addFriendAsync,
  updateUserProfile,
  toggleShowFriends,
} from "../../actions/dbHelper";

const { TabPane } = Tabs;
function Profile({ profileData, userId }) {
  const [allPosts, setAllPosts] = useState();
  const [allPostsLoading, setAllPostsLoading] = useState(true);
  const [friendsOfUser, setFriendsOfUser] = useState();
  const [editModel, setEditModel] = useState(false);
  const [updateProfileLoading, setUpdateProfileLoading] = useState(false);
  const {
    curAuth: { uid },
  } = useAuth();
  const history = useHistory();
  const imagUploadRef = useRef();

  const handleAddFriend = (uid) => {
    if (!uid) {
      return Error("something went wrong!");
    }
    //-------------------

    addFriendAsync(uid)
      .then((friend) => {
        const friendVals = friend.val();
        setFriendsOfUser([
          ...friendsOfUser,
          { uid: friend.key, ...friendVals },
        ]);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const openEditModal = () => {
    setEditModel(true);
  };

  const handleToggleShowFriends = () => {
    toggleShowFriends(uid).then(() => {
      history.push("/profile/me");
    });
  };

  //---------------------------------- GETING DATA ------------
  useEffect(() => {
    getPostsOfUser(userId === "me" ? uid : userId, uid)
      .then((res) => {
        if (res) {
          setAllPosts(res);
        }
      })
      .finally(() => {
        setAllPostsLoading(false);
      });

    const newFrndList = profileData?.friends
      ? Object.keys(profileData?.friends).map((key) => {
          return { friendId: key, ...profileData?.friends[key] };
        })
      : [];

    setFriendsOfUser([...newFrndList]);
  }, []);

  const handleUpdateProfile = (formData) => {
    if (!uid) {
      return Error("something went wrong!");
    }
    //-------------------

    setUpdateProfileLoading(true);

    const filterdFormData = Object.entries(formData).reduce(
      (a, [k, v]) => (v ? ((a[k] = v), a) : a),
      {}
    );

    if (Object.keys(filterdFormData).length === 0) {
      return console.log("Kindly Fill the data to change!");
    }

    updateUserProfile(uid, filterdFormData)
      .then((res) => {
        history.push("/profile/me");
      })
      .catch((err) => {
        setUpdateProfileLoading(false);
      });
  };

  //-----------------------------------------------------------
  if (!profileData) {
    return (
      <div>
        <h2> Sorry No Profile Found ! </h2>
        <Link to={"/"}> Go To Dashboard </Link>
      </div>
    );
  }

  return (
    <>
      <main className="profilePage">
        <div className="profilePage__Container">
          <h1 className="primaryHeading">
            {" "}
            {userId === "me" || userId === uid
              ? "My Profile"
              : "User's Profile"}
          </h1>
          <div className="profilePage__header">
            <Image
              src={profileData.img || "https://joeschmoe.io/api/v1/male/random"}
              className="profilePage__img"
            />

            <div className="profilePage__metaContainer">
              <p className="profilePage__meta">
                {profileData.userName || "Anonymous Person"}{" "}
              </p>
              <p className="profilePage__meta">
                <a
                  href={`mailto:${profileData.email || "anonymous@email.com"}`}
                >
                  {profileData.email || "anonymous@email.com"}{" "}
                </a>
              </p>
              <p className="profilePage__meta">
                {profileData.profession || "Free Soul"}
              </p>

              <div className="profilePage__meta__Actions">
                {userId === "me" ? (
                  <>
                    <Button onClick={openEditModal}> Edit Profile </Button>
                    <Button
                      onClick={handleToggleShowFriends}
                      style={{ marginLeft: "10px" }}
                    >
                      {profileData.showFriends
                        ? "Hide My Friends From Others"
                        : "Show My Friends to Others"}
                    </Button>
                  </>
                ) : (
                  <>
                    {friendsOfUser?.filter((friend) => friend.friendId === uid)
                      .length > 0 ? (
                      <h5> Already Your Friend </h5>
                    ) : (
                      <Button
                        onClick={() => {
                          handleAddFriend(friendsOfUser.userId);
                        }}
                      >
                        Add Friend
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="profilePage__descriptionContainer">
            {profileData.description ||
              `Description Will be shown here when this users
               writes something about itself , Thank You!`}
          </div>

          <div className="profilePage__tabContainer">
            <Tabs defaultActiveKey="posts" className="profilePage__tab">
              <TabPane tab="Posts" key="posts">
                <div className="postFeed">
                  {!allPostsLoading ? (
                    <>
                      {allPosts?.length > 0 ? (
                        <>
                          {allPosts.map((post) => (
                            <PostFeedItem
                              key={nanoid()}
                              postData={post}
                              wordsToShow={200}
                              isFav={post.isFav}
                              clickToRedirect={true}
                            />
                          ))}
                        </>
                      ) : (
                        <h1> No Posts Found ! </h1>
                      )}
                    </>
                  ) : (
                    <h1>Loading Posts ...</h1>
                  )}
                </div>
              </TabPane>
              <TabPane tab="Friends" key="friends">
                {profileData.showFriends || userId === "me" ? (
                  <>
                    {friendsOfUser ? (
                      friendsOfUser.map(
                        ({
                          friendId = "none",
                          emal = "anonymoys@email.com",
                          userName = "Anonymous",
                          img = "https://joeschmoe.io/api/v1/male/random",
                          profession = "Free Soul",
                        }) => (
                          <div
                            className="profilePage__tab__friend"
                            key={nanoid()}
                            onClick={() => {
                              history.push(`/profile/${friendId}`);
                            }}
                          >
                            <Image
                              src={`${img}`}
                              className="profilePage__tab__friend__img"
                            />
                            <div className="profilePage__tab__friend__desc">
                              <Link
                                to={`/profile/${friendId}`}
                                className="profilePage__tab__friend__name"
                              >
                                {userName}
                              </Link>
                              <p className="profilePage__tab__friend__email">
                                {emal}
                              </p>
                              <p className="profilePage__tab__friend__email">
                                {profession}
                              </p>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <h2> No Friend found </h2>
                    )}{" "}
                  </>
                ) : (
                  <h3>
                    {" "}
                    Sorry This User Doesn't allow others to see his friends{" "}
                  </h3>
                )}
              </TabPane>
            </Tabs>
          </div>
        </div>
      </main>

      <Modal
        title={`Hi! ${profileData.userName}`}
        visible={editModel}
        onCancel={() => {
          setEditModel(false);
        }}
        style={{ minWidth: "80%" }}
        footer={null}
        bodyStyle={{ background: "#fff" }}
      >
        {updateProfileLoading ? (
          <p> Updating Please Wait ... </p>
        ) : (
          <>
            <h2
              className="editProfileModal"
              style={{ width: "100%", textAlign: "center" }}
            >
              {" "}
              Edit Your Profile!{" "}
            </h2>

            <Form
              className="profileUpdateForm"
              onFinish={handleUpdateProfile}
              // ref={formRef}
              style={{ overFlow: "auto" }}
              labelCol={{
                span: 4,
              }}
              wrapperCol={{
                span: 14,
              }}
              layout="horizontal"
              initialValues={{
                size: "default",
              }}
              size={"default"}
            >
              <Form.Item
                name="newProfileImage"
                label=""
                className="formAvatarUpload"
              >
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  action={null}
                  onChange={(e) => {
                    const newImage =
                      e.fileList[e.fileList.length - 1].originFileObj;
                    var reader = new FileReader();
                    reader.readAsDataURL(newImage);
                    reader.onload = function (e) {
                      console.log("Image is -->", reader.result);
                      imagUploadRef.current.src = reader.result;
                    };
                  }}
                >
                  <img
                    ref={imagUploadRef}
                    src={
                      profileData.img ||
                      "https://joeschmoe.io/api/v1/male/random"
                    }
                    alt="avatar"
                    className="profileImageUploader"
                  />
                </Upload>
              </Form.Item>

              <p
                style={{
                  textAlign: "center",
                  width: "100%",
                  marginBottom: "20px",
                }}
              >
                Click Above to{" "}
                {profileData.img
                  ? "Update Your Picture"
                  : "Upload Your Picture"}
              </p>

              <Form.Item name="userName" label="Name">
                <Input placeholder={profileData.userName || "Anonymous"} />
              </Form.Item>
              <Form.Item name="profession" label="Profession">
                <Input placeholder={profileData.profession || "Free Soul"} />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <Input.TextArea
                  placeholder={
                    profileData?.description || "Write something about yourself"
                  }
                />
              </Form.Item>

              <Form.Item label="Actions">
                <Button
                  onClick={() => {
                    setEditModel(false);
                    // clearFormData();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ marginLeft: "1rem" }}
                >
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
}

export default Profile;
