const peerModelReducer = (state, action) => {
  switch (action.type) {
    case "SET_PEER":
      return {
        myPeer: action?.payload?.peer,
      };

    case "DISCONNECT_PEER":
      state?.myPeer?.removeAllListeners();
      state?.myPeer?.destroy();
      console?.log(state.myPeer);
      return {
        myPeer: null,
      };

    default:
      return state;
  }
};

export default peerModelReducer;
