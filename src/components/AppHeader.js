// import { NavLink } from "react-router-dom";
import { firebase } from "../firebase/firebase";
import { useAuth } from "../context/auth-context";
import { useHistory } from "react-router-dom";
import { PageHeader, Button } from "antd";

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

  return (
    <PageHeader
      ghost={false}
      title="Chat Buddy"
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
