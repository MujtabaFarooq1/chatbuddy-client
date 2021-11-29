const streamModelReducer = (state, action) => {
  switch (action.type) {
    case "ADD_STREAM":
      return {
        myStreams: !state.myStreams[action.payload.id]
          ? [...state.myStreams, action.payload.streamToAdd]
          : [...state.myStreams],
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
    case "REMOVE_SINGLE_STREAM":
      return {
        myStreams: [
          ...state.myStreams.filter(
            (streamObj) => streamObj.id !== action.payload.id
          ),
        ],
      };
    case "REMOVE_ALL_STREAMS":
      return {
        myStreams: [],
      };

    default:
      return state;
  }
};

export default streamModelReducer;
