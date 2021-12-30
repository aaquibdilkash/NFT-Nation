import { CLEAR_ERRORS, FEED_PINS_GET_FAIL, FEED_PINS_GET_SUCCESS, MORE_PINS_GET_FAIL, MORE_PINS_GET_SUCCESS, PIN_DETAIL_GET_FAIL, PIN_DETAIL_GET_SUCCESS, SEARCH_PINS_GET_BY_CATEGORY_FAIL, SEARCH_PINS_GET_BY_CATEGORY_SUCCESS, SEARCH_PINS_GET_BY_KEYWORD_FAIL, SEARCH_PINS_GET_BY_KEYWORD_SUCCESS, SEARCH_TERM_SET } from "../constants/PinTypes";

const initialState = {
    pinDetail: {},
    feedPins: [],
    morePins: [],
    keywordSearchedPins: [],
    categorySearchedPins: [],
    searchTerm: ""
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
    case SEARCH_TERM_SET:
      return {
          ...state,
          searchTerm: action.payload
      }
    case SEARCH_PINS_GET_BY_CATEGORY_SUCCESS:
      return {
          ...state,
          categorySearchedPins: action.payload
      }

    case SEARCH_PINS_GET_BY_CATEGORY_FAIL:
      return {
        ...state,
        error: action.payload
      };

    case SEARCH_PINS_GET_BY_KEYWORD_SUCCESS:
      return {
          ...state,
          keywordSearchedPins: action.payload
      }

    case SEARCH_PINS_GET_BY_KEYWORD_FAIL:
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
