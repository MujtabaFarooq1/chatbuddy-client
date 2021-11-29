const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.user,
      };
    case "LOGOUT":
      localStorage.clear();
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
};

export default authReducer;
