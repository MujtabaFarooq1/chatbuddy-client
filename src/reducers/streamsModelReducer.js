const streamModelReducer = (state, action) => {
  // console.log("Action Payload is -->", action.payload);
  switch (action.type) {
    case "ADD_STREAM":
      return {
        myStreams: !state.myStreams[action.payload.id]
          ? [...state.myStreams, action.payload.streamToAdd]
          : [...state.myStreams],
        myStreamId: action?.payload?.myStreamId
          ? action?.payload?.myStreamId
          : state.myStreamId,
      };
    case "UPDATE_STREAM":
      return {
        myStreams: state.myStreams[action.payload.id]
          ? state.myStreams.map((streamObj) => {
              if (streamObj.id === action.payload.id) {
                streamObj = action.payload.newStream;
              }
              return streamObj;
            })
          : [...state.myStreams],
      };
    case "MUTE_MY_STREAM":
      console.log("Mute Stream dispatched");
      const streamToMute = state.myStreams.find(
        (streamObj) => streamObj.id === state.myStreamId
      );
      streamToMute.getAudioTracks().enabled = false;
      const streamsAfterMyStreamMuted = [...state.myStreams].filter(
        (streamObj) => {
          return streamObj.id !== state.myStreamId;
        }
      );
      return {
        myStreams: [...streamsAfterMyStreamMuted, streamToMute],
        myStreamId: state.myStreamId,
      };
    case "REMOVE_SINGLE_STREAM":
      const stream = state.myStreams.find(
        (streamObj) => streamObj.id === action.payload.id
      );
      stream.getTracks().forEach((track) => track.stop());
      return {
        myStreams: [
          ...state.myStreams.filter(
            (streamObj) => streamObj.id !== action.payload.id
          ),
        ],
      };
    case "REMOVE_ALL_STREAMS":
      state.myStreams.forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
      return {
        myStreams: [],
        myStreamId: "null",
      };

    default:
      return state;
  }
};

export default streamModelReducer;
