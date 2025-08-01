import React, { useState, useEffect } from "react";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

//i18n
import { withTranslation } from "react-i18next";
// Redux
import { Link } from "react-router-dom";
import withRouter from "../../Common/withRouter";
import { createSelector } from 'reselect';

// users
import user1 from "../../../assets/images/users/avatar-1.png";

import { useSelector } from "react-redux";
import { APIClient } from "../../../helpers/api_helper"; // assuming this is your API handler

const api = new APIClient();
const ProfileMenu = (props: any) => {
  // Declare a new state variable, which we'll call "menu"
  const [menu, setMenu] = useState(false);

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [employee, setEmployee] = useState<any>(null);
  const [employeeImageSrc, setEmployeeImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      try {
        const response = await api.get(
          "centralized/commonApi/employee/notification-info",
          ""
        );

        if (response && response.employeeId) {
          setEmployee(response);

          // Convert photoByte to data URI if it exists
          if (response.photoByte) {
            const base64String = response.photoByte;
            const imageSrc = `data:image/jpeg;base64,${base64String}`;
            setEmployeeImageSrc(imageSrc);
          }
        }
      } catch (error) {
        console.error("Error fetching employee info:", error);
      }
    };

    fetchEmployeeInfo();
  }, []);
  const selectProfileProperties = createSelector(
    (state: any) => state.Profile,
    (profile) => ({
      user: profile?.user || null,
    })
  );

  const { user } = useSelector(selectProfileProperties);


  useEffect(() => {
    if (localStorage.getItem("userInfo")) {
        const obj = JSON.parse(localStorage.getItem("userInfo") || "");
        setUsername(obj.userName);
        setRole(obj.role);
    } else {
      setUsername("UNKNOWN");
      setRole("UNKNOWN");
    }
  }, [user]);

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="d-inline-block"
      >
        <DropdownToggle
          className="btn header-item "
          id="page-header-user-dropdown"
          tag="button"
        >
          <img
            className="rounded-circle header-profile-user"
            src={employeeImageSrc || user1}
            alt="Header Avatar"
          />
          <span className="d-none d-xl-inline-block ms-2 me-1">{username?.toUpperCase() || "admin"}</span>
          <i className="mdi mdi-chevron-down d-none d-xl-inline-block" />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          {/* <DropdownItem tag="a" href={process.env.PUBLIC_URL + "/profile"}>
            {" "}
            <i className="bx bx-user font-size-16 align-middle me-1" />
            {props.t("Profile")}{" "}
          </DropdownItem>
          <DropdownItem tag="a" href={process.env.PUBLIC_URL + "/auth-lock-screen"}>
            <i className="bx bx-lock-open font-size-16 align-middle me-1" />
            {props.t("Lock screen")}
          </DropdownItem> */}
          <div className="dropdown-divider" />
          <Link
            to="/logout"
            className="dropdown-item"
            onClick={() => {
              localStorage.clear(); // Clears all data from localStorage
              sessionStorage.clear(); // (Optional) Clears session storage as well
            }}
          >
            <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
            <span>{props.t("Logout")}</span>
          </Link>

        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default withRouter(withTranslation()(ProfileMenu));