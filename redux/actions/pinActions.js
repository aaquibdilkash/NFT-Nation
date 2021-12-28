import { client } from "../../client";
import { feedQuery, pinDetailMorePinQuery, pinDetailQuery, searchQuery } from "../../utils/data";
import { FEED_PINS_GET_SUCCESS, MORE_PINS_GET_FAIL, MORE_PINS_GET_SUCCESS, PIN_DETAIL_GET_FAIL, PIN_DETAIL_GET_SUCCESS, SEARCH_PINS_GET_FAIL, SEARCH_PINS_GET_SUCCESS } from "../constants/PinTypes";


export const pinDetailGet = (pinId, success = () => {}, failure = () => {}) => async (dispatch) => {
    try {
      const query = pinDetailQuery(pinId);
      client.fetch(query).then((data) => {
        dispatch({
          type: PIN_DETAIL_GET_SUCCESS,
          payload: data[0],
        });
        success(data[0])
      });
  
      
    } catch (e) {
      dispatch({
        type: PIN_DETAIL_GET_FAIL,
        payload: e,
      });
      failure(e)
    }
  };
export const feedPinsGet = (success = () => {}, failure = () => {}) => async (dispatch) => {
    try {
      const query = feedQuery;
      client.fetch(query).then((data) => {
        dispatch({
          type: FEED_PINS_GET_SUCCESS,
          payload: data,
        });
        success(data)
      });
  
      
    } catch (e) {
      dispatch({
        type: PIN_DETAIL_GET_FAIL,
        payload: e,
      });
      failure(e)
    }
  };
export const morePinsGet = (pin, success = () => {}, failure = () => {}) => async (dispatch) => {
    try {
      const query = pinDetailMorePinQuery(pin);
      client.fetch(query).then((data) => {
        dispatch({
          type: MORE_PINS_GET_SUCCESS,
          payload: data,
        });
        success(data)
      });
  
      
    } catch (e) {
      dispatch({
        type: MORE_PINS_GET_FAIL,
        payload: e,
      });
      failure(e)
    }
  };
export const searchPinsGet = (searchTerm, success = () => {}, failure = () => {}) => async (dispatch) => {
    try {
      const query = searchQuery(searchTerm);
      client.fetch(query).then((data) => {
        dispatch({
          type: SEARCH_PINS_GET_SUCCESS,
          payload: data,
        });
        success(data)
      });
  
      
    } catch (e) {
      dispatch({
        type: SEARCH_PINS_GET_FAIL,
        payload: e,
      });
      failure(e)
    }
  };