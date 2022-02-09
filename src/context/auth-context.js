import React, { useContext, useState } from "react";
// import reducer from "../reducers/reducer";

export const AuthContext = React.createContext({});

// const initialState = {
//   userId: false,
// };

export const AuthProvider = ({ uid, children, userName }) => {
  const [curAuth, setAuth] = useState({ uid, userName } || {});
  return (
    <AuthContext.Provider value={{ curAuth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

//Custom hook to use useContext
export const useAuth = () => useContext(AuthContext);
