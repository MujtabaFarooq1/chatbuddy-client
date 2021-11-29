const peerModelReducer = (state, action) => {
  switch (action.type) {
    case "SET_PEER":
      return {
        myPeer: action?.payload?.peer,
      };

    default:
      return state;
  }
};

export default peerModelReducer;
