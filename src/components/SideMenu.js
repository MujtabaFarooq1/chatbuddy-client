import React, { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { Layout, Menu, Spin } from "antd";
import socket from "../socket/socket";
import { useHistory } from "react-router-dom";
import {
  getAllUsersAsync,
  getAllFriendsAsync,
  addFriendAsync,
} from "../actions/dbHelper";
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;
const { SubMenu } = Menu;

const SideMenu = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedKey, setSelectedKey] = useState("2");
  const [loading, serLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
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
        pathname: `/chat`,
        to: roomId,
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
      <div className="logo" />
      <Menu
        theme="dark"
        defaultSelectedKeys={history.location.to ?? "1"}
        defaultOpenKeys={["friends"]}
        mode="inline"
      >
        <Menu.Item key="1" icon={<PieChartOutlined />}>
          Option 1
        </Menu.Item>
        <Menu.Item key="2" icon={<DesktopOutlined />}>
          Option 2
        </Menu.Item>

        <SubMenu
          className="friends__container"
          key="friends"
          icon={<UserOutlined />}
          title="Friends"
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
                          src={friend?.img ?? "/avatar.jpg"}
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
        <SubMenu key="sub2" icon={<TeamOutlined />} title="Team">
          <Menu.Item key="6">Team 1</Menu.Item>
          <Menu.Item key="8">Team 2</Menu.Item>
          <Menu.Item key="q">Team 1</Menu.Item>
          <Menu.Item key="w">Team 2</Menu.Item>
          <Menu.Item key="g">Team 1</Menu.Item>
          <Menu.Item key="h">Team 2</Menu.Item>
        </SubMenu>
        <Menu.Item key="9" icon={<FileOutlined />}>
          Files
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default SideMenu;
