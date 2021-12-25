// import { NavLink } from "react-router-dom";
import { firebase } from "../firebase/firebase";
import { useAuth } from "../context/auth-context";
import { useHistory, Link } from "react-router-dom";
import { PageHeader, Button } from "antd";
import { useState } from "react";

const AppHeader = () => {
  const { setAuth } = useAuth();
  const history = useHistory();
  const handleLogout = () => {
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
  };

  //------------------------------------------------------------------------------------
  const [title, setTitle] = useState("Welcom To Chat Buddy!");
  //------------------------------------------------------------------------------------

  return (
    <PageHeader
      ghost={false}
      title={<h1 className="appHeaderTitle"> {title} </h1>}
      extra={[
        <Button onClick={handleLogout} key="logout" type="primary">
          Logout
        </Button>,
      ]}
    ></PageHeader>
    // <div className="app-header">
    //   <button onClick={handleLogout}>Logout</button>
    // </div>
  );
};

export default AppHeader;
