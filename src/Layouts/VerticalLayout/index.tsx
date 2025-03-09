import React, { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import RightSidebar from "Components/CommonForBoth/RightSidebar";
import withRouter from "../../Components/Common/withRouter";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from 'reselect';
import { changeLayout, changeLayoutMode, changeTopbarTheme, changeLeftSidebarType, changeLeftSidebarTheme, changeSidebarImageType } from "slices/layouts/thunk";

const VerticalLayout = (props: any) => {
  const dispatch: any = useDispatch();

  const selectProperties = createSelector(
    (state: any) => state.Layout,
    (layout) => ({
      layoutTypes: layout.layoutTypes,
      layoutModeTypes: layout.layoutModeTypes,
      layoutWidthTypes: layout.layoutWidthTypes,
      topbarThemeTypes: layout.topbarThemeTypes,
      leftSidebarTypes: layout.leftSidebarTypes,
      leftSideBarThemeTypes: layout.leftSideBarThemeTypes,
      leftSidebarImageTypes: layout.leftSidebarImageTypes
    })
  );
  const { layoutTypes,
    layoutModeTypes,
    topbarThemeTypes,
    leftSidebarTypes,
    leftSideBarThemeTypes,
    leftSidebarImageTypes } = useSelector(selectProperties);

  useEffect(() => {
    if (layoutTypes ||
      layoutModeTypes ||
      topbarThemeTypes ||
      leftSidebarTypes ||
      leftSideBarThemeTypes ||
      leftSidebarImageTypes) {
      dispatch(changeLayout(layoutTypes));
      dispatch(changeLayoutMode(layoutModeTypes));
      dispatch(changeTopbarTheme(topbarThemeTypes));
      dispatch(changeLeftSidebarType(leftSidebarTypes));
      dispatch(changeLeftSidebarTheme(leftSideBarThemeTypes));
      dispatch(changeSidebarImageType(leftSidebarImageTypes))
    }
  }, [
    dispatch,
    layoutTypes,
    layoutModeTypes,
    topbarThemeTypes,
    leftSidebarTypes,
    leftSideBarThemeTypes,
    leftSidebarImageTypes]);

  const [open, setOpen] = useState<boolean>(false);
  useEffect(() => {
    if (open) {
      document.body.classList.add("right-bar-enabled")
      document.body.style.paddingRight = ''
    } else {
      document.body.classList.remove("right-bar-enabled")
    }
  }, [open])

  return (
    <React.Fragment>
      <div id="layout-wrapper">
        <Header toggleCanvas={() => setOpen(!open)} />
        <Sidebar />
        <div className="main-content">
          {props.children}
          <Footer />
        </div>
        <RightSidebar show={open} toggleCanvas={() => setOpen(!open)} />
      </div>
    </React.Fragment>
  );
};

export default withRouter(VerticalLayout);
