import React, { createContext, useReducer, useContext } from "react";
import callModelReducer from "../reducers/callModelReducer";

const callModelInitialState = {
  modelState: "calling",
  modelOpen: false,
  options: {
    initiatorId: "Anonymous",
    initiatorName: "Anonymous",
    to: [],
  },
};

export const callModelContext = createContext(callModelInitialState);

const CallModelProvider = ({ children }) => {
  const [callModelState, callModelDispatch] = useReducer(
    callModelReducer,
    callModelInitialState
  );

  return (
    <callModelContext.Provider value={{ callModelState, callModelDispatch }}>
      {children}
    </callModelContext.Provider>
  );
};

export const useCallModelContext = () => useContext(callModelContext);

export default CallModelProvider;
