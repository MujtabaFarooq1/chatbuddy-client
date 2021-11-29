import React, { createContext, useReducer, useContext } from "react";
import peerModelReducer from "../reducers/peerModelReducer";

const peerModelInitialState = {
  myPeer: null,
};

export const PeerModelContext = createContext(peerModelInitialState);

const PeerModelProvider = ({ children }) => {
  const [peerModelState, peerModelDispatch] = useReducer(
    peerModelReducer,
    peerModelInitialState
  );

  return (
    <PeerModelContext.Provider value={{ peerModelState, peerModelDispatch }}>
      {children}
    </PeerModelContext.Provider>
  );
};

export const usePeerModelContext = () => useContext(PeerModelContext);

export default PeerModelProvider;
