import Breadcrumb from "Components/Common/Breadcrumb";
import React from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import WelComeback from "./WelComeback";
import Activity from "./Activity";
import Calender from "pages/Calendar";

const Dashboard = () => {
  document.title = "MCC - Centralized Data";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Dashboard" breadcrumbItem="Dashboard" />
          <Row className="gy-4">
            <Col xs={12} lg={7}>
              <Calender />
            </Col>
            <Col xs={12} lg={5}>
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
