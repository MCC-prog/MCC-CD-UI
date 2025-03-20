import React from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";

import avatar1 from "../../assets/images/users/avatar-1.jpg";
import profileImg from "../../assets/images/profile-img.png";

const WelComeback: React.FC = () => {
  return (
    <React.Fragment>
      <Card style={{ height: "203px", overflow: "hidden", fontSize: "10px", marginTop: "-5px" }}>
        <div className="bg-primary-subtle" style={{ padding: "10px" }}>
          <Row>
            <Col xs={7}>
              <div className="text-primary">
                <h5 className="text-primary" style={{ fontSize: "12px", marginBottom: "5px" }}>
                  Welcome Back!
                </h5>
                <p style={{ fontSize: "10px", marginBottom: "0" }}>Skote Dashboard</p>
              </div>
            </Col>
            <Col xs={5} className="align-self-end">
              <img src={profileImg} alt="" className="img-fluid" style={{ maxHeight: "60px" }} />
            </Col>
          </Row>
        </div>
        <CardBody className="pt-0" style={{ padding: "10px" }}>
          <Row>
            <Col sm={4}>
              <div className="avatar-md profile-user-wid mb-3">
                <img
                  src={avatar1}
                  alt=""
                  className="img-thumbnail rounded-circle"
                  style={{ maxHeight: "50px" }}
                />
              </div>
              <h5 className="font-size-14 text-truncate" style={{ fontSize: "12px", marginBottom: "5px" }}>
                Henry Price
              </h5>
              <p className="text-muted mb-0 text-truncate" style={{ fontSize: "10px" }}>
                UI/UX Designer
              </p>
            </Col>

            <Col sm={8}>
              <div className="pt-3">
                <Row>
                  <Col xs={6}>
                    <h5 className="font-size-14" style={{ fontSize: "12px", marginBottom: "5px" }}>
                      125
                    </h5>
                    <p className="text-muted mb-0" style={{ fontSize: "10px" }}>
                      Projects
                    </p>
                  </Col>
                  <Col xs={6}>
                    <h5 className="font-size-14" style={{ fontSize: "14px", marginBottom: "5px" }}>
                      $1245
                    </h5>
                    <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                      Revenue
                    </p>
                  </Col>
                </Row>
                <div className="mt-3">
                  <Link to="#" className="btn btn-primary btn-sm" style={{ fontSize: "12px", padding: "5px 10px" }}>
                    View Profile <i className="mdi mdi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default WelComeback;