import React, { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { Layout, Menu, Spin } from "antd";
import socket from "../socket/socket";
import { useHistory ,useLocation  } from "react-router-dom";
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
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const [openedSubMenus, setOpenedSubMenus] = useState([]);
  const [loading, serLoading] = useState(true);
  const history = useHistory();
  const location = useLocation();

 

  

  useEffect(() => {
    const currentSelectedKey = location.pathname.split("/").join("");
    const currentOpenedMenus = currentSelectedKey === "chat" ? ["friends"] :[] 
    setSelectedKey(currentSelectedKey);
    setOpenedSubMenus(currentOpenedMenus)


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
        onOpenChange={(openedItem)=>{setOpenedSubMenus(openedItem)}}
        openKeys={openedSubMenus}
        mode="inline"
      >
        
        <Menu.Item  onClick={()=>{history.push("/allPosts")}}
          key="dashboard" icon={<PieChartOutlined />}>
          Dashboard
        </Menu.Item>

        <Menu.Item  onClick={()=>{history.push("/allPosts")}}
          key="allPosts" icon={<PieChartOutlined />}>
          All Posts
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            history.push("/");
          }}
          key="2"
          icon={<DesktopOutlined />}
        >
          Posts
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
