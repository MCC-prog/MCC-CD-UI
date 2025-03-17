import { combineReducers } from "redux";

// Front
import LayoutReducer from "./layouts/reducer";
import LoginReducer from "./auth/login/reducer";
import CalendarReducer from "./calendar/reducer"; // Import CalendarReducer

const rootReducer = combineReducers({
    Layout: LayoutReducer,
    Login: LoginReducer,
    calendar: CalendarReducer,
});

export default rootReducer;