import Breadcrumb from 'Components/Common/Breadcrumb';
import React from 'react';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import WelComeback from './WelComeback';
import Activity from './Activity';
import Calender from 'pages/Calendar';

const Dashboard = () => {
  document.title = "Home Page | MCC - Centralized Data";
  type Report = {
    title: string;
    iconClass: string;
    description: string;
  };

  const reports: Report[] = [
    { title: "UG Students Count", iconClass: "bx bx-group", description: "2,235" },
    { title: "PG Students Count", iconClass: "bx bx-group", description: "1,234" }
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Dashboard" breadcrumbItem="Dashboard" />
          <Row>
            <Col xl={6}>
              <Activity />
            </Col>
            <Col xl={6}>
              <Row>
                {(reports || []).map((report: Report, key: number) => (
                  <Col md={6} key={"_col_" + key}>
                    <Card className="mini-stats-wid">
                      <CardBody>
                        <div className="d-flex">
                          <div className="flex-grow-1">
                            <p className="text-muted fw-medium"> {report.title} </p>
                            <h4 className="mb-0">{report.description}</h4>
                          </div>
                          <div className="avatar-sm rounded-circle bg-primary align-self-center mini-stat-icon">
                            <span className="avatar-title rounded-circle bg-primary">
                              <i className={"bx " + report.iconClass + " font-size-24"} ></i>
                            </span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
              <Row>
                <Col xl={10}>
                  <WelComeback />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Calender />
          </Row>
        </Container>
      </div>
    </React.Fragment >
  );
}

export default Dashboard;