import React from "react";
import { Navigate } from "react-router-dom";

const AuthProtected = (props) => {
  if (!localStorage.getItem("userInfo")) {
    return (
      <Navigate to={{ pathname: "/login" }} />
    );
  }
  return (<React.Fragment>
    {props.children}
  </React.Fragment>);
};

export default AuthProtected;
