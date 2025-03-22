import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import "./assets/scss/theme.scss";
import HorizontalLayout from "./Layouts/HorizontalLayout/index";
import NonAuthLayout from "./Layouts/NonLayout";
import VerticalLayout from "./Layouts/VerticalLayout";
import { authProtectedRoutes, publicRoutes } from "./Routes/allRoutes";

//constants
import {
  LAYOUT_TYPES,
} from "./Components/constants/layout";

import { useSelector } from "react-redux";
import { createSelector } from 'reselect';
import AuthProtected from "Routes/AuthProtected";


const getLayout = (layoutType: any) => {
  let Layout = VerticalLayout;
  switch (layoutType) {
    case LAYOUT_TYPES.VERTICAL:
      Layout = VerticalLayout;
      break;
    case LAYOUT_TYPES.HORIZONTAL:
      Layout = HorizontalLayout;
      break;
    default:
      break;
  }
  return Layout;
};

function App() {

  const selectLeadData = createSelector(
    (state: any) => state.Layout,
    (layout) => ({
      layoutTypes: layout.layoutTypes
    })
  );
  const { layoutTypes } = useSelector(selectLeadData);

  const Layout = getLayout(layoutTypes);
  return (
    <React.Fragment>
      <Routes>
        {publicRoutes.map((route, idx) => (
          <Route path={route.path} key={idx}
            element={<NonAuthLayout>{route.component}</NonAuthLayout>} />
        ))}
        {authProtectedRoutes.map((route, idx) => (
          <Route
            path={route.path}
            key={idx}
            element={
              <React.Fragment>
                {/* <AuthProtected>
                  <Layout>
                    {route.component}
                  </Layout>
                </AuthProtected> */}
                <Layout>
                  {route.component}
                </Layout>
              </React.Fragment>
            }
          />
        ))}
      </Routes>
    </React.Fragment>
  )
}

export default App;
