import { client } from "../../client";
import { userCreatedPinsQuery, userQuery, userSalePinsQuery, userSavedPinsQuery } from "../../utils/data";
import {
  CLEAR_ERRORS,
  USER_GET_FAIL,
  USER_GET_SUCCESS,
  OTHER_USER_GET_FAIL,
  OTHER_USER_GET_SUCCESS,
  USER_OWN_GET_FAIL,
  USER_OWN_GET_SUCCESS,
  USER_SALE_GET_FAIL,
  USER_SALE_GET_SUCCESS,
  USER_SAVE_GET_FAIL,
  USER_SAVE_GET_SUCCESS,
} from "../constants/UserTypes";

export const userGet = (account, success = () => {}, failure = () => {}) => async (dispatch) => {
  try {
    const query = userQuery(account);
    client.fetch(query).then((data) => {
      dispatch({
        type: USER_GET_SUCCESS,
        payload: data[0],
      });

      success(data[0])
    });

    
  } catch (e) {
    dispatch({
      type: USER_GET_FAIL,
      payload: e,
    });
    failure(e)
  }
};

export const otherUserGet = (account, success = () => {}, failure = () => {}) => async (dispatch) => {
  try {
    const query = userQuery(account);
    client.fetch(query).then((data) => {
      dispatch({
        type: OTHER_USER_GET_SUCCESS,
        payload: data[0],
      });
      success(data[0])
    });

    
  } catch (e) {
    dispatch({
      type: OTHER_USER_GET_FAIL,
      payload: e,
    });
    failure(e)
  }
};

export const userSaveGet = (account) => async (dispatch) => {
  try {
    const query = userSavedPinsQuery(account);
    client.fetch(query).then((data) => {
      dispatch({
        type: USER_SAVE_GET_SUCCESS,
        payload: data,
      });
    });

    
  } catch (e) {
    dispatch({
      type: USER_SAVE_GET_FAIL,
      payload: e,
    });
  }
};
export const userOwnGet = (account) => async (dispatch) => {
  try {
    const query = userCreatedPinsQuery(account);
    client.fetch(query).then((data) => {
      dispatch({
        type: USER_OWN_GET_SUCCESS,
        payload: data,
      });
    });

    
  } catch (e) {
    dispatch({
      type: USER_OWN_GET_FAIL,
      payload: e,
    });
  }
};
export const userSaleGet = (account) => async (dispatch) => {
  try {
    const query = userSalePinsQuery(account);
    client.fetch(query).then((data) => {
      dispatch({
        type: USER_SALE_GET_SUCCESS,
        payload: data,
      });
    });

    
  } catch (e) {
    dispatch({
      type: USER_SALE_GET_FAIL,
      payload: e,
    });
  }
};

export const clearErrors = () => async (dispatch) => {
  dispatch({
    type: CLEAR_ERRORS,
  });
};
