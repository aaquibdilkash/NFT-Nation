import axios from "axios";
import {
  CLEAR_ERRORS,
  PROFILE_GET_FAIL,
  PROFILE_GET_SUCCESS,
  USER_GET_FAIL,
  USER_GET_SUCCESS,
  USER_OWN_GET_FAIL,
  USER_OWN_GET_SUCCESS,
  USER_SALE_GET_FAIL,
  USER_SALE_GET_SUCCESS,
  USER_SAVE_GET_FAIL,
  USER_SAVE_GET_SUCCESS,
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

export const profileGet = (userId, success = () => {}, failure = () => {}) => async (dispatch) => {
  try {
    axios.get(`/api/users/${userId}`).then((res) => {
      dispatch({
        type: PROFILE_GET_SUCCESS,
        payload: res.data.user,
      });

      success(res.data.user)
    });

    
  } catch (e) {
    dispatch({
      type: PROFILE_GET_FAIL,
      payload: e,
    });
    failure(e)
  }
};


export const userSaveGet = (userId, success = () => {}, failure = () => {}) => async (dispatch) => {
  try {
    axios.get(`/api/pins?saved=${userId}`).then((res) => {
      dispatch({
        type: USER_SAVE_GET_SUCCESS,
        payload: res.data.pins,
      });
      success(res.data.pins)
    });

    
  } catch (e) {
    dispatch({
      type: USER_SAVE_GET_FAIL,
      payload: e,
    });
    failure(e)
  }
};
export const userOwnGet = (address, success = () => {}, failure = () => {}) => async (dispatch) => {
  try {
    axios.get(`/api/pins?owner=${address}`).then((res) => {
      dispatch({
        type: USER_OWN_GET_SUCCESS,
        payload: res.data.pins,
      });
      success(res.data.pins)
    });

    
  } catch (e) {
    dispatch({
      type: USER_OWN_GET_FAIL,
      payload: e,
    });
    failure(e)
  }
};
export const userSaleGet = (address, success = () => {}, failure = () => {}) => async (dispatch) => {
  try {
    axios.get(`/api/pins?seller=${address}`).then((res) => {
      dispatch({
        type: USER_SALE_GET_SUCCESS,
        payload: res.data.pins,
      });
      success(res.data.pins)
    });

    
  } catch (e) {
    dispatch({
      type: USER_SALE_GET_FAIL,
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
