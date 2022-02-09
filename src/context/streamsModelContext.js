import React, { createContext, useReducer, useContext } from "react";
import streamModelReducer from "../reducers/streamsModelReducer";

const streamModelInitialState = {
  myStreams: [],
  myStreamId: "null",
};

export const StreamModelContext = createContext(streamModelInitialState);

const StreamModelProvider = ({ children }) => {
  const [streamModelState, streamModelDispatch] = useReducer(
    streamModelReducer,
    streamModelInitialState
  );

  return (
    <StreamModelContext.Provider
      value={{ streamModelState, streamModelDispatch }}
    >
      {children}
    </StreamModelContext.Provider>
  );
};

export const useStreamModelContext = () => useContext(StreamModelContext);

export default StreamModelProvider;
