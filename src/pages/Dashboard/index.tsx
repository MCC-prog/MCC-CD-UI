import Breadcrumb from 'Components/Common/Breadcrumb';
import React from 'react';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import WelComeback from './WelComeback';
import Activity from './Activity';
import Calender from 'pages/Calendar';

const Dashboard = () => {
  document.title = "MCC - Centralized Data";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Dashboard" breadcrumbItem="Dashboard" />
          <Row style={{ height: "530px" }}>
            <Col xl={7} md={7} lg={7} sm={7}>
              <Calender />
            </Col>
            <Col xl={5} md={5} lg={5} sm={5}>
              <Activity />
              <WelComeback />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment >
  );
}

export default Dashboard;