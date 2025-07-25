import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown, DropdownToggle, DropdownMenu, Row, Col } from "reactstrap";
import SimpleBar from "simplebar-react";

//Import images
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import avatar4 from "../../assets/images/users/avatar-4.jpg";

//i18n
import { withTranslation } from "react-i18next";
import { APIClient } from "../../helpers/api_helper"; // assuming this is your API handler

const api = new APIClient();

const NotificationDropdown = (props: any) => {
  const [menu, setMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get(
          "centralized/commonApi/employee/notification-info",
          ""
        );
        if (response && response.notifications) {
          setNotifications(response.notifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    const intervalId = setInterval(fetchNotifications, 60000); // Poll every 1 minute

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="dropdown d-inline-block"
        tag="li"
      >
        <DropdownToggle
          className="btn header-item noti-icon position-relative"
          tag="button"
          id="page-header-notifications-dropdown"
        >
          <i className="bx bx-bell bx-tada" />
          {notifications.length > 0 && (
            <span className="badge bg-danger rounded-pill">
              {notifications.length}
            </span>
          )}
        </DropdownToggle>

        <DropdownMenu className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0">
          <div className="p-3">
            <Row className="align-items-center">
              <Col>
                <h6 className="m-0"> {props.t("Notifications")} </h6>
              </Col>
            </Row>
          </div>

          <SimpleBar style={{ height: isExpanded ? "400px" : "230px" }}>
            {notifications.map((notif: any, index: number) => (
              <Link to="#" className="text-reset notification-item" key={index}>
                <div className="d-flex align-items-start">
                  <div className="me-2 text-info fw-bold">→</div>
                  <div className="flex-grow-1">
                    <h6 className="mt-0 mb-1">{notif.message}</h6>
                  </div>
                </div>
              </Link>
            ))}
          </SimpleBar>

          <div className="p-2 border-top d-grid">
            <button
              className="btn btn-sm btn-link font-size-14 text-center"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <i className="mdi mdi-arrow-right-circle me-1"></i>{" "}
              {isExpanded ? props.t("Show Less") : props.t("View More..")}
            </button>
          </div>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default withTranslation()(NotificationDropdown);
