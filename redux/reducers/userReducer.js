import {
  CLEAR_ERRORS,
  USER_GET_FAIL,
  USER_GET_SUCCESS,
  SEARCH_TERM_SET,
  REFRESH_SET,
} from "../constants/UserTypes";

const initialState = {
  user: {},
  searchTerm: "",
  refresh: false,
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_GET_SUCCESS:
      return {
        ...state,
        user: action.payload,
      };

    case USER_GET_FAIL:
      return {
        ...state,
        error: action.payload,
      };
    case SEARCH_TERM_SET:
      return {
        ...state,
        searchTerm: action.payload,
      };

    case REFRESH_SET:
      return {
        ...state,
        refresh: action.payload,
      };
      
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};
