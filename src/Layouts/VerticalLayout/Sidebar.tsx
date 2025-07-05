import React from "react";
import { Link } from "react-router-dom";

//import components
import SidebarContent from "./SidebarContent";

//import images
import logo from "../../assets/images/logoN.png";

const Sidebar = (props: any) => {
  return (
    <React.Fragment>
      <div className="vertical-menu">
        <div className="navbar-brand-box" style={{ padding: "0 10px" }}>
          <span className="logo-lg" style={{ display: "block", width: "100%" }}>
            <img
              src={logo}
              alt="Logo"
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </span>
        </div>
        <div data-simplebar className="h-100">
          {props.type !== "condensed" ? <SidebarContent /> : <SidebarContent />}
        </div>
        <div className="sidebar-background"></div>
      </div>
    </React.Fragment>
  );
};

export default Sidebar;
