import React, { useEffect, useState } from "react";

// Redux
import { Link, useNavigate } from "react-router-dom";
import { Col, Container, Form, FormFeedback, Input, Label, Row } from "reactstrap";

// Formik validation
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";

// import images
import mccLogo from "../../assets/images/mccLogo.png";
import CarouselPage from "./CarouselPage";
//import thunk
import { Alert, Snackbar } from "@mui/material";
import withRouter from "Components/Common/withRouter";
import { createSelector } from 'reselect';
import { loginuser, resetLoginMsgFlag } from "slices/auth/login/thunk";

const Login = (props: any) => {
  const dispatch: any = useDispatch();
  const [passwordShow, setPasswordShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  //meta title
  document.title = "Login | MCC - Centralized Data";


  const handleClose = () => setOpen(false);

  const selectProperties = createSelector(
    (state: any) => state.Login,
    (login) => ({
      error: login.error
    })
  );

  const { error } = useSelector(selectProperties);


  const validation = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: Yup.object({
      username: Yup.string().required("Please enter your username"),
      password: Yup.string().required("Please enter your password"),
    }),
    onSubmit: async (values) => {
      // ✅ Instead of calling API here, dispatch Redux action
      dispatch(loginuser(values, navigate, setErrorMessage, setOpen));
    },
  });

  useEffect(() => {
    if (error) {
      dispatch(resetLoginMsgFlag())
    }
  }, [dispatch, error])

  return (
    <React.Fragment>
      <div>
        <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
            {errorMessage}
          </Alert>
        </Snackbar>

        <Container fluid className="p-0">
          <Row className="g-0">
            <CarouselPage />
            <Col xl={3}>
              <div className="auth-full-page-content p-md-5 p-4">
                <div className="w-100">
                  <div className="d-flex flex-column h-100">
                    <div className= "d-flex justify-content-center" >
                        <img
                          src={mccLogo}
                          alt=""
                          height="150"
                          className="auth-logo-light"
                        />
                    </div>
                    <div className="my-auto">
                      <div>
                        <h5 className="text-primary">Welcome Back !</h5>
                        <p className="text-muted">
                          Sign in to continue to CND.
                        </p>
                      </div>

                      <div className="mt-4">
                        <Form className="form-horizontal"
                          onSubmit={validation.handleSubmit}
                        >
                          <div className="mb-3">
                            <Label className="form-label">Username</Label>
                            <Input
                              name="username"
                              className="form-control"
                              placeholder="Enter username"
                              type="text"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.username || ""}
                              invalid={
                                validation.touched.username && validation.errors.username ? true : false
                              }
                            />
                            {validation.touched.username && validation.errors.username ? (
                              <FormFeedback type="invalid">{validation.errors.username}</FormFeedback>
                            ) : null}
                          </div>

                          <div className="mb-3">
                            <Label className="form-label">Password</Label>
                            <div className="input-group auth-pass-inputgroup">
                              <Input
                                name="password"
                                value={validation.values.password || ""}
                                type={passwordShow ? "text" : "password"}
                                placeholder="Enter Password"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                invalid={
                                  validation.touched.password && validation.errors.password ? true : false
                                }
                              />
                              <button onClick={() => setPasswordShow(!passwordShow)} className="btn btn-light " type="button" id="password-addon">
                                <i className="mdi mdi-eye-outline"></i></button>
                              {validation.touched.password && validation.errors.password ? (
                                <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-3 d-grid">
                            <button
                              className="btn btn-primary btn-block "
                              type="submit"
                            >
                              Log In
                            </button>
                          </div>

                        </Form>
                      </div>
                    </div>

                    <div className="mt-4 mt-md-5 text-center">
                      <p className="mb-0">
                        © {new Date().getFullYear()}<a href="https://mccblr.edu.in/">MCC</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default withRouter(Login);
