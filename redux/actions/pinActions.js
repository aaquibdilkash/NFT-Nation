import axios from "axios";
import {
  FEED_PINS_GET_SUCCESS,
  MORE_PINS_GET_FAIL,
  MORE_PINS_GET_SUCCESS,
  PIN_DETAIL_GET_FAIL,
  PIN_DETAIL_GET_SUCCESS,
  SEARCH_PINS_GET_BY_CATEGORY_FAIL,
  SEARCH_PINS_GET_BY_CATEGORY_SUCCESS,
  SEARCH_PINS_GET_BY_KEYWORD_FAIL,
  SEARCH_PINS_GET_BY_KEYWORD_SUCCESS,
} from "../constants/PinTypes";

export const pinDetailGet =
  (pinId, success = () => {}, failure = () => {}) =>
  async (dispatch) => {
    try {
      axios.get(`/api/pins/${pinId}`).then((res) => {
        dispatch({
          type: PIN_DETAIL_GET_SUCCESS,
          payload: res.data.pin,
        });
        success(res.data.pin);
      });
    } catch (e) {
      dispatch({
        type: PIN_DETAIL_GET_FAIL,
        payload: e,
      });
      failure(e);
    }
  };
export const feedPinsGet =
  (success = () => {}, failure = () => {}) =>
  async (dispatch) => {
    try {
      axios.get(`/api/pins`).then((res) => {
        dispatch({
          type: FEED_PINS_GET_SUCCESS,
          payload: res.data.pins,
        });
        success(res.data.pins);
      });
    } catch (e) {
      dispatch({
        type: PIN_DETAIL_GET_FAIL,
        payload: e,
      });
      failure(e);
    }
  };
export const morePinsGet =
  (pin, success = () => {}, failure = () => {}) =>
  async (dispatch) => {
    try {
      axios.get(`/api/pins?category=${pin.category}`).then((res) => {
        dispatch({
          type: MORE_PINS_GET_SUCCESS,
          payload: res.data.pins,
        });
        success(res.data.pins);
      });
    } catch (e) {
      dispatch({
        type: MORE_PINS_GET_FAIL,
        payload: e,
      });
      failure(e);
    }
  };
export const searchPinsGetByCategory =
  (category, success = () => {}, failure = () => {}) =>
  async (dispatch) => {
    try {
      axios.get(`/api/pins?category=${category}`).then((res) => {
        dispatch({
          type: SEARCH_PINS_GET_BY_CATEGORY_SUCCESS,
          payload: res.data.pins,
        });
        success(res.data.pins);
      });
    } catch (e) {
      dispatch({
        type: SEARCH_PINS_GET_BY_CATEGORY_FAIL,
        payload: e,
      });
      failure(e);
    }
  };

export const searchPinsGetByKeywords =
  (searchTerm, success = () => {}, failure = () => {}) =>
  async (dispatch) => {
    try {
      axios.get(`/api/pins?keyword=${searchTerm}`).then((res) => {
        dispatch({
          type: SEARCH_PINS_GET_BY_KEYWORD_SUCCESS,
          payload: res.data.pins,
        });
        success(res.data.pins);
      });
    } catch (e) {
      dispatch({
        type: SEARCH_PINS_GET_BY_KEYWORD_FAIL,
        payload: e,
      });
      failure(e);
    }
  };
