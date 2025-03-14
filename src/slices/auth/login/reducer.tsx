import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
    user: "",
    error: "",// for error msg
    loading: false,
    isUserLogout: false,
    errorMsg: false,// for error
};

const loginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {
        loginSuccess(state, action) {

            state.user = action.payload
            state.loading = false;
            state.errorMsg = false;
        },
        apiError(state, action) {
            state.error = action.payload;
            state.loading = true;
            state.isUserLogout = false;
            state.errorMsg = true;
        },
        resetLoginFlag(state) {
            // state.error = null;
            state.error = "";
            state.loading = false;
            state.errorMsg = false;
        },
        logoutUserSuccess(state, action) {
            state.isUserLogout = true
        },
    }
});
export const { loginSuccess, apiError, resetLoginFlag, logoutUserSuccess } = loginSlice.actions;
export default loginSlice.reducer;