import {
  CLEAR_ERRORS,
  USER_GET_FAIL,
  USER_GET_SUCCESS,
  REFRESH_SET,
  HAS_MORE,
  CHANGE_PAGE,
  MARKET_CONTRACT,
} from "../constants/UserTypes";

const initialState = {
  user: {},
  refresh: false,
  hasMore: false,
  changePage: false,
  marketContract: {}
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

    case HAS_MORE:
      return {
        ...state,
        hasMore: action.payload,
      };

    case CHANGE_PAGE:
      return {
        ...state,
        changePage: action.payload,
      };

    case REFRESH_SET:
      return {
        ...state,
        refresh: action.payload,
      };

    case MARKET_CONTRACT:
      return {
        ...state,
        marketContract: action.payload,
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
