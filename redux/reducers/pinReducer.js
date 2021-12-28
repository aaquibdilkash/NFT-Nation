import { CLEAR_ERRORS, FEED_PINS_GET_FAIL, FEED_PINS_GET_SUCCESS, MORE_PINS_GET_FAIL, MORE_PINS_GET_SUCCESS, PIN_DETAIL_GET_FAIL, PIN_DETAIL_GET_SUCCESS, SEARCH_PINS_GET_FAIL, SEARCH_PINS_GET_SUCCESS } from "../constants/PinTypes";

const initialState = {
    pinDetail: {},
    feedPins: [],
    morePins: [],
    searchedPins: []
}

export const pinReducer = (state = initialState, action) => {
  switch (action.type) {
    case PIN_DETAIL_GET_SUCCESS:
      return {
          ...state,
          pinDetail: action.payload
      }

    case PIN_DETAIL_GET_FAIL:
      return {
        ...state,
        error: action.payload
      };
    case FEED_PINS_GET_SUCCESS:
      return {
          ...state,
          feedPins: action.payload
      }

    case FEED_PINS_GET_FAIL:
      return {
        ...state,
        error: action.payload
      };
    case MORE_PINS_GET_SUCCESS:
      return {
          ...state,
          morePins: action.payload
      }

    case MORE_PINS_GET_FAIL:
      return {
        ...state,
        error: action.payload
      };
    case SEARCH_PINS_GET_SUCCESS:
      return {
          ...state,
          searchedPins: action.payload
      }

    case SEARCH_PINS_GET_FAIL:
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
