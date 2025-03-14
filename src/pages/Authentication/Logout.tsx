import React, { useEffect } from "react"
import withRouter from "Components/Common/withRouter";
import { Navigate } from "react-router-dom";

import { logoutUser } from "../../slices/thunk";

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from 'reselect';

const Logout = () => {
  const dispatch = useDispatch<any>();

  const selectProperties = createSelector(
    (state: any) => state.Login,
    (login) => ({
      isUserLogout : login.isUserLogout
    })
  );

  const { isUserLogout } = useSelector(selectProperties);

  useEffect(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  if (isUserLogout) {
    return <Navigate to="/login" />;
  }

  return <></>;
}


export default withRouter(Logout)
