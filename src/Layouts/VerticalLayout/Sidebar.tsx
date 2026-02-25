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
        <div className="navbar-brand-box" style={{ padding: "5px 5px" }}>
          <span className="logo-lg" style={{ display: "block", width: "100%" }}>
            <img
              src={logo}
              alt="Logo"
              style={{
                width: "100%",
                height: "auto", 
                objectFit: "contain",
                display: "block",
                background: "transparent",
                opacity: 0.95, // slightly more visible
                mixBlendMode: "screen", // better blending for dark backgrounds
                filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))", // subtle shadow for visibility
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
