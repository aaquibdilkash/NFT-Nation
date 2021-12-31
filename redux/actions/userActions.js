import axios from "axios";
import {
  CLEAR_ERRORS,
  USER_GET_FAIL,
  USER_GET_SUCCESS,
} from "../constants/UserTypes";

export const userGet = (userId, success = () => {}, failure = () => {}) => async (dispatch) => {
  try {
    axios.get(`/api/users/${userId}`).then((res) => {
      dispatch({
        type: USER_GET_SUCCESS,
        payload: res.data.user,
      });

      success(res.data.user)
    });

    
  } catch (e) {
    dispatch({
      type: USER_GET_FAIL,
      payload: e,
    });
    failure(e)
  }
};


export const clearErrors = () => async (dispatch) => {
  dispatch({
    type: CLEAR_ERRORS,
  });
};
