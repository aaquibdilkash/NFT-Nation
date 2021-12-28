import { combineReducers } from "redux";
import { punkReducer } from "./punkReducer";
import { userReducer } from "./userReducer";
import { pinReducer } from "./pinReducer";

const reducer = combineReducers({
    punkReducer,
    userReducer,
    pinReducer
})

export default reducer