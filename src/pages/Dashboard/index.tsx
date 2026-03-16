import Breadcrumb from "Components/Common/Breadcrumb";
import React from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import WelComeback from "./WelComeback";
import Activity from "./Activity";
import Calender from "pages/Calendar";
<<<<<<< HEAD
=======
import ChecklistLink from "./ChecklistLink";

>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181

const Dashboard = () => {
  document.title = "MCC - Centralized Data";

<<<<<<< HEAD
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
=======
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
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
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
