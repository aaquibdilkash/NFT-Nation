import { CLEAR_ERRORS, USER_GET_FAIL, USER_GET_SUCCESS, OTHER_USER_GET_FAIL, OTHER_USER_GET_SUCCESS, USER_OWN_GET_FAIL, USER_OWN_GET_SUCCESS, USER_SALE_GET_FAIL, USER_SALE_GET_SUCCESS, USER_SAVE_GET_FAIL, USER_SAVE_GET_SUCCESS } from "../constants/UserTypes";

const initialState = {
    user: {},
    otherUser: {},
    userSaved: [],
    userOwned: [],
    userSale: []
}

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_GET_SUCCESS:
      return {
          ...state,
          user: action.payload
      }

    case USER_GET_FAIL:
      return {
        ...state,
        error: action.payload
      };
    case OTHER_USER_GET_SUCCESS:
      return {
          ...state,
          otherUser: action.payload
      }

    case OTHER_USER_GET_FAIL:
      return {
        ...state,
        error: action.payload
      };
    case USER_SAVE_GET_SUCCESS:
      return {
          ...state,
          userSaved: action.payload
      }

    case USER_SAVE_GET_FAIL:
      return {
        ...state,
        error: action.payload
      };
    case USER_OWN_GET_SUCCESS:
      return {
          ...state,
          userOwned: action.payload
      }

    case USER_OWN_GET_FAIL:
      return {
        ...state,
        error: action.payload
      };
    case USER_SALE_GET_SUCCESS:
      return {
          ...state,
          userSale: action.payload
      }

    case USER_SALE_GET_FAIL:
      return {
        ...state,
        error: action.payload
      };

    case CLEAR_ERRORS:
        return {
            ...state,
            error: null
        }

    default:
      return state;
  }
};
