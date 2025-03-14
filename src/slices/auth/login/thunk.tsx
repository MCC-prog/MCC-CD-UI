import { getFirebaseBackend } from "helpers/firebase_helper";
import { postFakeLogin, postJwtLogin } from "helpers/fakebackend_helper";
import { loginSuccess, apiError, logoutUserSuccess, resetLoginFlag } from "./reducer";
import { useState } from "react";

export const loginuser = (user: any, navigate: any, setErrorMessage: (message: string) => void,
    setOpen: (open: boolean) => void) => async (dispatch: any) => {


        try {
            let response: any;

            if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
                let fireBaseBackend = await getFirebaseBackend();
                response = fireBaseBackend.loginUser(user.username, user.password);
            } else if (process.env.REACT_APP_DEFAULTAUTH === "jwt") {
                response = await postJwtLogin({
                    user: user.username,
                    password: user.password
                });
            } else if (process.env.REACT_APP_DEFAULTAUTH === "fake") {
                response = await postFakeLogin({
                    username: user.username,
                    password: user.password
                });
                localStorage.setItem("authUser", JSON.stringify(response));
            }

            // ✅ Dispatch login success action
            dispatch(loginSuccess(response));

            // ✅ Store token & user details in localStorage
            localStorage.setItem("token", response.token);
            localStorage.setItem("userId", response.userId);
            localStorage.setItem("userName", response.userName);
            localStorage.setItem("role", response.role);

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

        const fireBaseBackend = getFirebaseBackend();
        if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
            const response = fireBaseBackend.logout;
            dispatch(logoutUserSuccess(response));
        } else {
            dispatch(logoutUserSuccess(true));
        }

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


export const socialLogin = (type: any, history: any) => async (dispatch: any) => {
    try {
        let response: any;

        if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
            const fireBaseBackend = getFirebaseBackend();
            response = fireBaseBackend.socialLoginUser(type);
        }

        const socialdata = await response;
        if (socialdata) {
            sessionStorage.setItem("authUser", JSON.stringify(socialdata));
            dispatch(loginSuccess(socialdata));
            history('/dashboard');
        }

    } catch (error) {
        dispatch(apiError(error));
    }
};