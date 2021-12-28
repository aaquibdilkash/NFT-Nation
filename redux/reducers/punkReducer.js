import { ALL_PUNKS_FAIL, ALL_PUNKS_SUCCESS, CLEAR_ERROR } from "../constants/Punks";

export const punkReducer = (state = {allPunks: []}, action) => {
  switch (action.type) {
    case ALL_PUNKS_SUCCESS:
        console.log(action.payload, "dlkfjsdlfjsdfjsdlfkjfj")
      return {
          allPunks: action.payload
      }

    case ALL_PUNKS_FAIL:
      return {
        ...state,
        error: action.payload
      };

    case CLEAR_ERROR:
        return {
            error: null
        }

    default:
      return state;
  }
};
