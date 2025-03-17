import { login } from "helpers/backend_helper"
import { apiError, loginSuccess, logoutUserSuccess, resetLoginFlag } from "./reducer";

export const loginuser = (user: any, navigate: any, setErrorMessage: (message: string) => void,
    setOpen: (open: boolean) => void) => async (dispatch: any) => {
        try {
            let response: any;

            // api call for authentication
            response = await login({
                username: user.username,
                password: user.password
            });

            // ✅ Dispatch login success action
            dispatch(loginSuccess(response));

            // ✅ Store user details in localStorage
            localStorage.setItem("userInfo", JSON.stringify(response));

            // ✅ Navigate to dashboard
            navigate("/dashboard");

        } catch (error: any) {
            dispatch(apiError(error));
            setErrorMessage(error?.message || "Login failed. Please try again!");
            setOpen(true);
        }
    };


export const logoutUser = () => async (dispatch: any) => {
    try {
        localStorage.removeItem("authUser");
        dispatch(logoutUserSuccess(true));
    } catch (error) {
        dispatch(apiError(error));
    }
};

export const resetLoginMsgFlag = () => {
    try {
        const response = resetLoginFlag();
        return response;
    } catch (error) {
        return error;
    }
};