import axios from "axios";
import { ALL_PUNKS_FAIL, ALL_PUNKS_SUCCESS, CLEAR_ERRORS } from "../constants/Punks";


export const getPunks = () => async (dispatch) => {
    try {
        const {data} = await axios.get("https://testnets-api.opensea.io/assets?asset_contract_address=0xC36d211Da64a4cDD727F722196545Ec8799BeD9e&order_direction=asc")


        dispatch({
            type: ALL_PUNKS_SUCCESS,
            payload: data.assets
        })

    } catch(e) {
        dispatch({
            type: ALL_PUNKS_FAIL,
            payload: error
        })
    }
}


export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}