import React, { useEffect, useState } from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";

import avatar1 from "../../assets/images/users/avatar-1.png";
import profileImg from "../../assets/images/profile-img.png";
import { APIClient } from "../../helpers/api_helper"; // assuming this is your API handler

const api = new APIClient();
const WelComeback: React.FC = () => {
  const [menu, setMenu] = useState(false);
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

  return (
    <React.Fragment>
      <div
        style={{
          maxHeight: "250px",
        }}
      >
        <Card
          style={{
            fontSize: "10px",
            marginTop: "-5px",
          }}
        >
          <div className="bg-primary-subtle" style={{ padding: "10px" }}>
            <Row>
              <Col xs={7}>
                <div className="text-primary">
                  <h5
                    className="text-primary"
                    style={{ fontSize: "12px", marginBottom: "5px" }}
                  >
                    Welcome Back!
                  </h5>
                </div>
              </Col>
              <Col xs={5} className="align-self-end">
                <img
                  src={profileImg}
                  alt=""
                  className="img-fluid"
                  style={{ maxHeight: "60px" }}
                />
              </Col>
            </Row>
          </div>

          <CardBody className="pt-0" style={{ padding: "10px" }}>
            <Row className="align-items-center">
              <Col sm={4}>
                <div className="avatar-md profile-user-wid mb-2">
                  <img
                    src={employeeImageSrc || avatar1}
                    alt="Employee"
                    className="img-thumbnail rounded-circle"
                    style={{ maxHeight: "65px", width: "65px" }}
                  />
                </div>
                <h5
                  className="font-size-14 text-truncate"
                  style={{ fontSize: "13px", marginBottom: "4px" }}
                >
                  {employee?.empName || "Employee Name"}
                </h5>
                <p
                  className="text-muted mb-0 text-truncate"
                  style={{ fontSize: "11px" }}
                >
                  {employee?.designationName || "Designation"}
                </p>
              </Col>

              <Col sm={8} className="d-flex flex-column justify-content-center">
                <p style={{ fontSize: "12px", marginBottom: "6px" }}>
                  <strong>Email:</strong> {employee?.email || "Email"}
                </p>
                <p style={{ fontSize: "12px", marginBottom: "6px" }}>
                  <strong>Department:</strong>{" "}
                  {employee?.departmentName || "Department"}
                </p>
                <p style={{ fontSize: "12px", marginBottom: "0" }}>
                  <strong>Date of Join:</strong> {employee?.doj || "DOJ"}
                </p>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    </React.Fragment>
  );
};

export default WelComeback;
