import {
  CLEAR_ERRORS,
  USER_GET_FAIL,
  USER_GET_SUCCESS,
  REFRESH_SET,
  HAS_MORE,
  CHANGE_PAGE,
  MARKET_CONTRACT,
  COLLECTION_SET,
  CURRENT_PROFILE_SET,
  GIFTING_USER_SET,
} from "../constants/UserTypes";

const initialState = {
  user: {},
  currentProfile: {},
  giftingUser: {},
  refresh: false,
  hasMore: false,
  changePage: false,
  marketContract: {},
  collection: {},
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

    case CURRENT_PROFILE_SET:
      return {
        ...state,
        currentProfile: action.payload,
      };

    case GIFTING_USER_SET:
      return {
        ...state,
        giftingUser: action.payload,
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

    case COLLECTION_SET:
      return {
        ...state,
        collection: action.payload,
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
