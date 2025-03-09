import React, { useState, useEffect } from "react";
import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";
import RightSidebar from "Components/CommonForBoth/RightSidebar";
import { createSelector } from 'reselect';
import withRouter from "../../Components/Common/withRouter";
import { useDispatch, useSelector } from "react-redux";
import { changeLayout, changeLayoutMode, changeTopbarTheme } from "slices/layouts/thunk";

const HorizontalLayout = (props: any) => {
  const dispatch: any = useDispatch();

  const selectProperties = createSelector(
    (state: any) => state.Layout,
    (layout) => ({
      layoutTypes: layout.layoutTypes,
      layoutModeTypes: layout.layoutModeTypes,
      layoutWidthTypes: layout.layoutWidthTypes,
      topbarThemeTypes: layout.topbarThemeTypes,
    })
  );
  const { layoutTypes, layoutModeTypes, topbarThemeTypes } = useSelector(selectProperties);

  useEffect(() => {
    if (layoutTypes || layoutModeTypes || topbarThemeTypes) {
      dispatch(changeLayout(layoutTypes));
      dispatch(changeLayoutMode(layoutModeTypes));
      dispatch(changeTopbarTheme(topbarThemeTypes));
    }
  }, [layoutTypes, layoutModeTypes, topbarThemeTypes, dispatch]);

  const [open, setOpen] = useState<boolean>(false);
  const [openColl, setOpenColl] = useState<any>(false);

  const toggleLeftmenu = () => setOpenColl(!openColl);

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
        <Header toggleCanvas={() => setOpen(!open)} toggleLeftmenu={toggleLeftmenu} />
        <Navbar leftMenu={openColl} />
        <div className="main-content">
          {props.children}
          <Footer />
        </div>
        <RightSidebar show={open} toggleCanvas={() => setOpen(!open)} />
      </div>
    </React.Fragment>
  )
}

export default withRouter(HorizontalLayout)
