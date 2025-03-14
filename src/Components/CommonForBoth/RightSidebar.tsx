import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Offcanvas, OffcanvasBody } from "reactstrap";

//SimpleBar
import SimpleBar from "simplebar-react";

//Import images
import bgimg1 from "../../assets/images/sidebar/img1.jpg";
import bgimg2 from "../../assets/images/sidebar/img2.jpg";
import bgimg3 from "../../assets/images/sidebar/img3.jpg";
import bgimg4 from "../../assets/images/sidebar/img4.jpg";
import layout1 from "../../assets/images/layouts/layout-1.jpg";
import layout2 from "../../assets/images/layouts/layout-2.jpg";
import layout3 from "../../assets/images/layouts/layout-3.jpg";
import {
  changeLayoutMode,
  changeLayoutWidth,
  changeTopbarTheme,
  changeLeftSidebarTheme,
  changeSidebarImageType,
  changeLayout,
  changeLeftSidebarType
} from "slices/thunk";

//constants
import {
  LAYOUT_TYPES,
  LAYOUT_MODE_TYPES,
  LAYOUT_WIDTH_TYPES,
  TOPBAR_THEME_TYPES,
  LEFT_SIDEBAR_THEME_TYPES,
  LEFTBAR_THEME_IMAGES_TYPES,
  LEFT_SIDEBAR_TYPES
} from "../constants/layout";
import { Link } from "react-router-dom";
import { createSelector } from "reselect";
interface sidebar {
  show: boolean,
  toggleCanvas: any
}

const RightSidebar = ({ toggleCanvas, show }: sidebar) => {
  const html = document.getElementsByTagName('html')[0]
  const dispatch = useDispatch<any>();

  const selectLayoutState = (state: any) => state.Layout;
  const selectProperties = createSelector(
    selectLayoutState,
    (layout) => ({
      layoutType: layout.layoutTypes,
      layoutModeType: layout.layoutModeTypes,
      layoutWidthType: layout.layoutWidthTypes,
      topbarThemeType: layout.topbarThemeTypes,
      leftSidebarThemeType: layout.leftSideBarThemeTypes,
      leftSidebarImageType: layout.leftSidebarImageTypes,
      leftSidebarTypes: layout.leftSidebarTypes
    })
  );
  const {
    layoutType, layoutModeType, layoutWidthType, topbarThemeType, leftSidebarThemeType, leftSidebarImageType, leftSidebarTypes
  } = useSelector(selectProperties);

  return (
    <React.Fragment>
      {/* <div className="right-bar" id="right-bar"> */}
      <Offcanvas isOpen={show} toggle={toggleCanvas} direction={html.hasAttribute("dir") ? "start" : "end"} className="right-bar border-0">
        <OffcanvasBody className="p-0">
          <SimpleBar style={{ height: "900px" }}>
            <div className="rightbar-title px-3 py-4">
              <Link className="right-bar-toggle float-end" to="/dashboard" onClick={toggleCanvas}><i className="mdi mdi-close noti-icon"></i></Link>
              <h5 className="m-0">Settings</h5>
            </div>
            <hr className="my-0" />
            <div className="p-4">
              <div className="radio-toolbar">
                <span className="mb-2 d-block">Layouts</span>
                <input
                  type="radio"
                  id="radioVertical"
                  name="radioVertical"
                  value={LAYOUT_TYPES.VERTICAL}
                  checked={layoutType === LAYOUT_TYPES.VERTICAL}
                  onChange={(e: any) => {
                    if (e.target.checked) {
                      dispatch(changeLayout(e.target.value));
                    }
                  }}
                />
                <label className="me-1" htmlFor="radioVertical">Vertical</label>
                <input
                  type="radio"
                  id="radioHorizontal"
                  name="radioHorizontal"
                  value={LAYOUT_TYPES.HORIZONTAL}
                  checked={layoutType === LAYOUT_TYPES.HORIZONTAL}
                  onChange={(e: any) => {
                    if (e.target.checked) {
                      dispatch(changeLayout(e.target.value));
                    }
                  }}
                />
                <label className="me-1" htmlFor="radioHorizontal">Horizontal</label>
              </div>
              <hr className="mt-1" />
              <div className="radio-toolbar">
                <span className="mb-2 d-block">Layouts Mode</span>
                <input type="radio"
                  id="radioLight"
                  name="radioLight"
                  value={LAYOUT_MODE_TYPES.LIGHT}
                  checked={layoutModeType === LAYOUT_MODE_TYPES.LIGHT}
                  onChange={(e: any) => {
                    if (e.target.checked) {
                      dispatch(changeLayoutMode(e.target.value));
                    }
                  }}

                />
                <label className="me-1" htmlFor="radioLight">Light</label>
                <input type="radio"
                  id="radioDark"
                  name="radioDark"
                  value={LAYOUT_MODE_TYPES.DARK}
                  checked={layoutModeType === LAYOUT_MODE_TYPES.DARK}
                  onChange={(e: any) => {
                    if (e.target.checked) {
                      dispatch(changeLayoutMode(e.target.value));
                    }
                  }}
                />
                <label htmlFor="radioDark">Dark</label>
              </div>
              <hr className="mt-1" />
              <div className="radio-toolbar">
                <span className="mb-2 d-block" id="radio-title">Layout Width</span>
                <input
                  type="radio"
                  id="radioFluid"
                  name="radioWidth"
                  value={LAYOUT_WIDTH_TYPES.FLUID}
                  checked={layoutWidthType === LAYOUT_WIDTH_TYPES.FLUID}
                  onChange={(e: any) => {
                    if (e.target.checked) {
                      dispatch(changeLayoutWidth(e.target.value));
                    }
                  }}
                />

                <label className="me-1" htmlFor="radioFluid">Fluid</label>
                <input
                  type="radio"
                  id="radioBoxed"
                  name="radioWidth"
                  value={LAYOUT_WIDTH_TYPES.BOXED}
                  checked={layoutWidthType === LAYOUT_WIDTH_TYPES.BOXED}
                  onChange={(e: any) => {
                    if (e.target.checked) {
                      dispatch(changeLayoutWidth(e.target.value));
                    }
                  }}
                />
                <label htmlFor="radioBoxed" className="me-1">Boxed</label>
                <input
                  type="radio"
                  id="radioscrollable"
                  name="radioWidth"
                  value={LAYOUT_WIDTH_TYPES.SCROLLABLE}
                  checked={layoutWidthType === LAYOUT_WIDTH_TYPES.SCROLLABLE}
                  onChange={(e: any) => {
                    if (e.target.checked) {
                      dispatch(changeLayoutWidth(e.target.value));
                    }
                  }}
                /><label htmlFor="radioscrollable">Scrollable</label>
              </div>
              <hr className="mt-1" />
              <div className="radio-toolbar">
                <span className="mb-2 d-block" id="radio-title">Topbar Theme</span>
                <input
                  type="radio"
                  id="radioThemeLight"
                  name="radioTheme"
                  value={TOPBAR_THEME_TYPES.LIGHT}
                  checked={topbarThemeType === TOPBAR_THEME_TYPES.LIGHT}
                  onChange={e => {
                    if (e.target.checked) {
                      dispatch(changeTopbarTheme(e.target.value));
                    }
                  }}
                />
                <label className="me-1" htmlFor="radioThemeLight">Light</label>
                <input
                  type="radio"
                  id="radioThemeDark"
                  name="radioTheme"
                  value={TOPBAR_THEME_TYPES.DARK}
                  checked={topbarThemeType === TOPBAR_THEME_TYPES.DARK}
                  onChange={e => {
                    if (e.target.checked) {
                      dispatch(changeTopbarTheme(e.target.value));
                    }
                  }}
                />
                <label className="me-1" htmlFor="radioThemeDark">Dark</label>
                {layoutType === "horizontal" && (
                  <React.Fragment>
                    <input
                      type="radio"
                      id="radioThemeColored"
                      name="radioTheme"
                      value={TOPBAR_THEME_TYPES.COLORED}
                      checked={topbarThemeType === TOPBAR_THEME_TYPES.COLORED}
                      onChange={e => {
                        if (e.target.checked) {
                          dispatch(changeTopbarTheme(e.target.value));
                        }
                      }}
                    />
                    <label className="me-1" htmlFor="radioThemeColored">Colored</label>{" "}
                  </React.Fragment>
                )}
              </div>
              <hr className="mt-1" />
              {layoutType === "vertical" && (
                <React.Fragment>
                  <div className="radio-toolbar">
                    <span className="mb-2 d-block" id="radio-title">Left Sidebar Type </span>
                    <input type="radio" id="sidebarDefault" name="sidebarType"
                      value={LEFT_SIDEBAR_TYPES.DEFAULT}
                      checked={leftSidebarTypes === LEFT_SIDEBAR_TYPES.DEFAULT}
                      onChange={e => {
                        if (e.target.checked) {
                          dispatch(changeLeftSidebarType(e.target.value))
                        }
                      }} />
                    <label className="me-1" htmlFor="sidebarDefault">Default</label>
                    <input type="radio" id="sidebarCompact" name="sidebarType"
                      value={LEFT_SIDEBAR_TYPES.COMPACT}
                      checked={leftSidebarTypes === LEFT_SIDEBAR_TYPES.COMPACT}
                      onChange={e => {
                        if (e.target.checked) {
                          dispatch(changeLeftSidebarType(e.target.value))
                        }
                      }} />
                    <label className="me-1" htmlFor="sidebarCompact">Compact</label>
                    <input type="radio" id="sidebarIcon" name="sidebarType"
                      value={LEFT_SIDEBAR_TYPES.ICON}
                      checked={leftSidebarTypes === LEFT_SIDEBAR_TYPES.ICON}
                      onChange={e => {
                        if (e.target.checked) {
                          dispatch(changeLeftSidebarType(e.target.value))
                        }
                      }} />
                    <label className="me-1" htmlFor="sidebarIcon">Icon</label>
                  </div>
                  <hr className="mt-1" />
                  <div className="radio-toolbar coloropt-radio">
                    <span className="mb-2 d-block" id="radio-title">Left Sidebar Color Options</span>
                    <div className="row">
                      <div className="col">
                        <input
                          type="radio"
                          id="leftsidebarThemelight"
                          name="leftsidebarTheme"
                          value={LEFT_SIDEBAR_THEME_TYPES.LIGHT}
                          checked={leftSidebarThemeType === LEFT_SIDEBAR_THEME_TYPES.LIGHT}
                          onChange={e => {
                            if (e.target.checked) {
                              dispatch(changeLeftSidebarTheme(e.target.value));
                            }
                          }}
                        />
                        <label htmlFor="leftsidebarThemelight" className="bg-light rounded-circle wh-30 me-1"></label>
                        <input
                          type="radio"
                          id="leftsidebarThemedark"
                          name="leftsidebarTheme"
                          value={LEFT_SIDEBAR_THEME_TYPES.DARK}
                          checked={leftSidebarThemeType === LEFT_SIDEBAR_THEME_TYPES.DARK}
                          onChange={e => {
                            if (e.target.checked) {
                              dispatch(changeLeftSidebarTheme(e.target.value));
                            }
                          }}
                        />
                        <label htmlFor="leftsidebarThemedark" className="bg-dark rounded-circle wh-30 me-1"></label>
                        <input
                          type="radio"
                          id="leftsidebarThemecolored"
                          name="leftsidebarTheme"
                          value={LEFT_SIDEBAR_THEME_TYPES.COLORED}
                          checked={leftSidebarThemeType === LEFT_SIDEBAR_THEME_TYPES.COLORED}
                          onChange={e => {
                            if (e.target.checked) {
                              dispatch(changeLeftSidebarTheme(e.target.value));
                            }
                          }}
                        />
                        <label htmlFor="leftsidebarThemecolored" className="bg-colored rounded-circle wh-30 me-1"></label>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <input
                          type="radio"
                          id="leftsidebarThemewinter"
                          name="leftsidebarTheme"
                          value={LEFT_SIDEBAR_THEME_TYPES.WINTER}
                          checked={leftSidebarThemeType === LEFT_SIDEBAR_THEME_TYPES.WINTER}
                          onChange={e => {
                            if (e.target.checked) {
                              dispatch(changeLeftSidebarTheme(e.target.value));
                            }
                          }}
                        />
                        <label htmlFor="leftsidebarThemewinter" className="gradient-winter rounded-circle wh-30 me-1"></label>
                        <input
                          type="radio"
                          id="leftsidebarThemeladylip"
                          name="leftsidebarTheme"
                          value={LEFT_SIDEBAR_THEME_TYPES.LADYLIP}
                          checked={leftSidebarThemeType === LEFT_SIDEBAR_THEME_TYPES.LADYLIP}
                          onChange={e => {
                            if (e.target.checked) {
                              dispatch(changeLeftSidebarTheme(e.target.value));
                            }
                          }}
                        />
                        <label htmlFor="leftsidebarThemeladylip" className="gradient-lady-lip rounded-circle wh-30 me-1"></label>
                        <input
                          type="radio"
                          id="leftsidebarThemeplumplate"
                          name="leftsidebarTheme"
                          value={LEFT_SIDEBAR_THEME_TYPES.PLUMPLATE}
                          checked={leftSidebarThemeType === LEFT_SIDEBAR_THEME_TYPES.PLUMPLATE}
                          onChange={e => {
                            if (e.target.checked) {
                              dispatch(changeLeftSidebarTheme(e.target.value));
                            }
                          }}
                        />
                        <label htmlFor="leftsidebarThemeplumplate" className="gradient-plum-plate rounded-circle wh-30 me-1"></label>
                        <input
                          type="radio"
                          id="leftsidebarThemestrongbliss"
                          name="leftsidebarTheme"
                          value={LEFT_SIDEBAR_THEME_TYPES.STRONGBLISS}
                          checked={leftSidebarThemeType === LEFT_SIDEBAR_THEME_TYPES.STRONGBLISS}
                          onChange={e => {
                            if (e.target.checked) {
                              dispatch(changeLeftSidebarTheme(e.target.value));
                            }
                          }}
                        />
                        <label htmlFor="leftsidebarThemestrongbliss" className="gradient-strong-bliss rounded-circle wh-30 me-1"></label>
                        <input
                          type="radio"
                          id="leftsidebarThemesgreatwhale"
                          name="leftsidebarTheme"
                          value={LEFT_SIDEBAR_THEME_TYPES.GREATWHALE}
                          checked={leftSidebarThemeType === LEFT_SIDEBAR_THEME_TYPES.GREATWHALE}
                          onChange={e => {
                            if (e.target.checked) {
                              dispatch(changeLeftSidebarTheme(e.target.value));
                            }
                          }}
                        />
                        <label htmlFor="leftsidebarThemesgreatwhale" className="gradient-strong-great-whale rounded-circle wh-30 me-1"></label>
                      </div>
                    </div>
                  </div>
                  <div className="radio-toolbar imgopt-radio">
                    <span className="mb-2 d-block" id="radio-bgimg">Left Sidebar Bg Image</span>
                    <div className="d-flex gap-2 flex-wrap">
                      <input
                        type="radio"
                        id="leftsidebarThemebgimg1"
                        name="leftsidebarThemeImage"
                        value={LEFTBAR_THEME_IMAGES_TYPES.IMG1}
                        checked={leftSidebarImageType === LEFTBAR_THEME_IMAGES_TYPES.IMG1}
                        onChange={e => {
                          if (e.target.checked) {
                            dispatch(changeSidebarImageType(e.target.value));
                          }
                        }}
                      />
                      <label htmlFor="leftsidebarThemebgimg1"><img alt="sidebar bg img" width="90" className="themesideimage rounded" src={bgimg1} /></label>
                      <input
                        type="radio"
                        id="leftsidebarThemebgimg2"
                        name="leftsidebarThemeImage"
                        value={LEFTBAR_THEME_IMAGES_TYPES.IMG2}
                        checked={leftSidebarImageType === LEFTBAR_THEME_IMAGES_TYPES.IMG2}
                        onChange={e => {
                          if (e.target.checked) {
                            dispatch(changeSidebarImageType(e.target.value));
                          }
                        }}
                      />
                      <label htmlFor="leftsidebarThemebgimg2"><img alt="sidebar bg img" width="90" className="themesideimage rounded" src={bgimg2} /></label>
                      <input
                        type="radio"
                        id="leftsidebarThemebgimg3"
                        name="leftsidebarThemeImage"
                        value={LEFTBAR_THEME_IMAGES_TYPES.IMG3}
                        checked={leftSidebarImageType === LEFTBAR_THEME_IMAGES_TYPES.IMG3}
                        onChange={e => {
                          if (e.target.checked) {
                            dispatch(changeSidebarImageType(e.target.value));
                          }
                        }}
                      />
                      <label htmlFor="leftsidebarThemebgimg3">
                        <img
                          alt="sidebar bg img"
                          width="90"
                          className="themesideimage rounded"
                          src={bgimg3}
                        />
                      </label>
                      <input
                        type="radio"
                        id="leftsidebarThemebgimg4"
                        name="leftsidebarThemeImage"
                        value={LEFTBAR_THEME_IMAGES_TYPES.IMG4}
                        checked={leftSidebarImageType === LEFTBAR_THEME_IMAGES_TYPES.IMG4}
                        onChange={e => {
                          if (e.target.checked) {
                            dispatch(changeSidebarImageType(e.target.value));
                          }
                        }}
                      />
                      <label htmlFor="leftsidebarThemebgimg4"><img alt="sidebar bg img" width="90" className="themesideimage rounded" src={bgimg4} /></label>
                      <input
                        type="radio"
                        id="leftsidebarThemenone"
                        name="leftsidebarThemeImage"
                        value={LEFTBAR_THEME_IMAGES_TYPES.NONE}
                        checked={leftSidebarImageType === LEFTBAR_THEME_IMAGES_TYPES.NONE}
                        onChange={e => {
                          if (e.target.checked) {
                            dispatch(changeSidebarImageType(e.target.value));
                          }
                        }}
                      />
                      <label htmlFor="leftsidebarThemenone">
                        <div style={{ width: "40px", height: "80px" }}>
                          <div className="bg-light border px-2 h-100 shadow-none"><div className="verticalcontent">None</div></div>
                        </div>
                      </label>
                    </div>
                  </div>
                </React.Fragment>
              )}
              <hr className="mt-1" />
              <div className="mb-3">
                <span className="mb-2 d-block" id="radio-title">Preloader</span>
                <div className="form-check form-switch"><input type="checkbox" className="form-check-input checkbox" id="checkbox_1" /><label className="form-check-label" htmlFor="checkbox_1">Preloader</label></div>
              </div>
              <h6 className="text-center">Choose Layouts</h6>
              <div className="mb-2">
                <a href="//skote-v-light.react.themesbrand.com"><img src={layout1} className="img-fluid img-thumbnail" alt="" /></a>
              </div>
              <div className="mb-2">
                <a href="//skote-v-dark.react.themesbrand.com"><img src={layout2} className="img-fluid img-thumbnail" alt="" /></a>
              </div>
              <div className="mb-2">
                <a href="//skote-v-rtl.react.themesbrand.com"><img src={layout3} className="img-fluid img-thumbnail" alt="" /></a>
              </div>
              <a className="btn btn-primary btn-block mt-3" href="//1.envato.market/skotereact"><i className="mdi mdi-cart ms-1"></i> Purchase Now</a>
            </div>
          </SimpleBar>
        </OffcanvasBody>
      </Offcanvas>
      {/* </div> */}
    </React.Fragment >
  );
};

export default RightSidebar;