import { combineReducers } from "redux";
import { userReducer } from "./userReducer";
import { pinReducer } from "./pinReducer";

const reducer = combineReducers({
    userReducer,
    pinReducer
})

export default reducer