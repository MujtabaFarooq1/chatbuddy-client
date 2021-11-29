import socket from "../socket/socket";

const callModelReducer = (state, action) => {
  const { initiatorId, initiatorName, to } = action?.payload ?? {};
  switch (action.type) {
    case "RINGING":
      return {
        modelState: "ringing",
        modelOpen: true,
        options: {
          initiatorId,
          initiatorName,
          to,
        },
      };
    case "CONNECTED":
      return {
        ...state,
        modelState: "connected",
        modelOpen: true,
      };
    case "TO_LIST_UPDATED":
      let connectedPeers = 0;
      to.forEach((connectionObject) => {
        if (connectionObject.connected) {
          connectedPeers++;
        }
      });

      if (connectedPeers > 1) {
        return {
          modelState: "connected",
          modelOpen: true,
          options: {
            ...state.options,
            to,
          },
        };
      } else {
        return {
          modelState: "calling",
          modelOpen: false,
          options: {
            initiatorId: "",
            initiatorName: "",
            to: [],
          },
        };
      }
    case "CALLING":
      socket.emit("callUser", {
        initiatorId,
        initiatorName,
        to,
      });

      return {
        modelState: "calling",
        modelOpen: true,
        options: {
          initiatorId,
          initiatorName,
          to,
        },
      };
    case "CLOSE":
      return {
        modelState: "calling",
        modelOpen: false,
        options: {
          initiatorId: "",
          initiatorName: "",
          to: [],
        },
      };
    case "CALL_REJECTED":
      // console.log(
      //   "Call Rejected Reducer now users available are ",
      //   action.payload.rejectedTo
      // );
      return {
        modelState: "calling",
        modelOpen: true,
        options: {
          initiatorId: state.options.initiatorId,
          initiatorName: state.options.initiatorName,
          to: action.payload.rejectedTo,
        },
      };
    default:
      return {
        modelState: "calling",
        modelOpen: false,
        options: {
          initiatorId: "",
          initiatorName: "",
          to: [],
        },
      };
  }
};

export default callModelReducer;
