import React, { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { Layout, Menu, Spin } from "antd";
import socket from "../socket/socket";
import { useHistory, useLocation } from "react-router-dom";
import { firebase } from "../firebase/firebase";
import { useAuth } from "../context/auth-context";
import {
  getAllUsersAsync,
  getAllFriendsAsync,
  addFriendAsync,
} from "../actions/dbHelper";
import {
  PieChartOutlined,
  UserOutlined,
  ProfileOutlined,
  UsergroupAddOutlined,
  MessageOutlined,
  LogoutOutlined,
  CarOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;
const { SubMenu } = Menu;

const SideMenu = () => {
  const [collapsed, setCollapsed] = useState(
    window.innerWidth <= 800 ? true : false
  );
  const [friends, setFriends] = useState([]);
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const [openedSubMenus, setOpenedSubMenus] = useState([]);
  const [loading, serLoading] = useState(true);
  const history = useHistory();
  const location = useLocation();
  const { setAuth, curAuth } = useAuth();

  useEffect(() => {
    const currentSelectedKey = location.pathname.split("/").join("");
    const currentOpenedMenus = currentSelectedKey === "chat" ? ["friends"] : [];
    setSelectedKey(currentSelectedKey);
    setOpenedSubMenus(currentOpenedMenus);

    setUpFriendsAsync();
  }, []);

  const setUpFriendsAsync = async () => {
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
    serLoading(false);
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

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={() => {
        setCollapsed(!collapsed);
      }}
    >
      <div
        className="logoContainer"
        onClick={() => {
          history.push("/");
        }}
      >
        <img
          src={"/images/logo.png"}
          alt="profile-avatar"
          className="logoContainer__img"
        />
      </div>
      <Menu
        theme="dark"
        defaultSelectedKeys={selectedKey}
        defaultOpenKeys={openedSubMenus}
        selectedKeys={[selectedKey]}
        onOpenChange={(openedItem) => {
          setOpenedSubMenus(openedItem);
        }}
        openKeys={openedSubMenus}
        mode="inline"
      >
        <Menu.Item
          onClick={() => {
            history.push("/dashboard");
          }}
          key="dashboard"
          icon={<PieChartOutlined />}
        >
          Dashboard
        </Menu.Item>

        <Menu.Item
          onClick={() => {
            history.push("/users");
          }}
          key="Users"
          icon={<UsergroupAddOutlined />}
        >
          Users
        </Menu.Item>

        <Menu.Item
          onClick={() => {
            history.push("/myFriends");
          }}
          key="allFriends"
          icon={<UserOutlined />}
        >
          My Friends
        </Menu.Item>

        <SubMenu
          className="friends__container"
          key="friends"
          icon={<MessageOutlined />}
          title="Quick Chat"
        >
          {!loading ? (
            friends.map((friend) => {
              return (
                <Menu.Item key={friend.uid}>
                  <div
                    className="sideNavProfile"
                    // key={friend.uid}
                    onClick={() => {
                      gotoUserRoom(friend.uid);
                      setSelectedKey(friend.uid);
                    }}
                  >
                    <div className="sideNavProfile__description">
                      <div className="sideNavProfile__imgContainer">
                        <img
                          src={friend?.img ?? "/images/avatar.png"}
                          alt="profile-avatar"
                          className="sideNavProfile__img"
                        />
                      </div>

                      <h3 className="profileHeading">
                        {friend.userName.length < 10
                          ? friend.userName
                          : `${friend.userName.substring(0, 10)} ...`}
                      </h3>
                    </div>

                    {/* <p className="sideNavProfile__lastSeenText">
                    Last seen at 5 minutes ago ...
                  </p> */}
                  </div>
                </Menu.Item>
              );
            })
          ) : (
            <Menu.Item key={"spinner"}>
              <Spin tip="Getting Your Friends..."></Spin>
            </Menu.Item>
          )}
        </SubMenu>

        <Menu.Item
          onClick={() => {
            history.push("/profile/me");
          }}
          key="profile"
          icon={<ProfileOutlined />}
        >
          My Profile
        </Menu.Item>

        <Menu.Item
          onClick={() => {
            history.push("/games");
          }}
          key="game"
          icon={<CarOutlined />}
        >
          Games
        </Menu.Item>

        <Menu.Item
          onClick={() => {
            firebase
              .auth()
              .signOut()
              .then((auth) => {
                setAuth({});
                history.push("/");
              })
              .catch((err) => {
                console.log(err);
              });
          }}
          key="logout"
          icon={<LogoutOutlined />}
        >
          Logout
        </Menu.Item>

        {/* //---- */}
      </Menu>
    </Sider>
  );
};

export default SideMenu;
