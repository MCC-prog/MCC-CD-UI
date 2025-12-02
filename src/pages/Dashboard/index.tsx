import Breadcrumb from "Components/Common/Breadcrumb";
import React from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import WelComeback from "./WelComeback";
import Activity from "./Activity";
import Calender from "pages/Calendar";
import ChecklistLink from "./ChecklistLink";


const Dashboard = () => {
  document.title = "MCC - Centralized Data";

return (
    <React.Fragment>
      <div className="page-content dashboard-page">  {/* <-- add class */}
        <Container fluid style={{ height: "100%" }}>
          <Breadcrumb title="Dashboard" breadcrumbItem="Dashboard" />

          <Row className="gy-4 dashboard-row"> {/* <-- add class */}
            <Col xs={12} lg={7} className="dashboard-left">
              <Calender />
            </Col>

            <Col xs={12} lg={5}>
              <ChecklistLink />
              <Activity />
              <WelComeback />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
