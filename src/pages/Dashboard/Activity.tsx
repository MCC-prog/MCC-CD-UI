import React from "react";
import { Card, CardBody, CardTitle } from "reactstrap";
import { Link } from "react-router-dom";

const Activity: React.FC = () => {
  return (
    <React.Fragment>
      <Card style={{ height: "300px", overflow: "hidden" }}>
        <CardBody style={{ height: "100%", overflowY: "auto", padding: "10px" }}>
          <CardTitle className="mb-3" style={{ fontSize: "16px" }}>Notice Board</CardTitle>
          <ul className="verti-timeline list-unstyled" style={{ margin: "0", padding: "0" }}>
            <li className="event-list" style={{ marginBottom: "10px" }}>
              <div className="event-timeline-dot" style={{ marginRight: "10px" }}>
                <i className="bx bx-right-arrow-circle font-size-14" />
              </div>
              <div className="flex-shrink-0 d-flex">
                <div className="me-2">
                  <h5 className="font-size-12" style={{ margin: "0" }}>
                    22 Nov <i className="bx bx-right-arrow-alt font-size-12 text-primary align-middle ms-1" />
                  </h5>
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontSize: "12px" }}>Responded to need “Volunteer Activities”
                  </div>
                </div>
              </div>
            </li>

            <li className="event-list" style={{ marginBottom: "10px" }}>
              <div className="event-timeline-dot" style={{ marginRight: "10px" }}>
                <i className="bx bx-right-arrow-circle font-size-14" />
              </div>
              <div className="d-flex">
                <div className="flex-shrink-0 me-2">
                  <h5 className="font-size-12" style={{ margin: "0" }}>
                    17 Nov <i className="bx bx-right-arrow-alt font-size-12 text-primary align-middle ms-1" />
                  </h5>
                </div>
                <div className="flex-grow-1">
                  <div id="activitytext" style={{ fontSize: "12px" }}>
                    Everyone realizes why a new common language would be desirable...<Link to="#" style={{ fontSize: "12px" }}>Read More</Link>
                  </div>
                </div>
              </div>
            </li>

            <li className="event-list active" style={{ marginBottom: "10px" }}>
              <div className="event-timeline-dot" style={{ marginRight: "10px" }}>
                <i className="bx bxs-right-arrow-circle font-size-14 bx-fade-right" />
              </div>
              <div className="flex-shrink-0 d-flex">
                <div className="me-2">
                  <h5 className="font-size-12" style={{ margin: "0" }}>
                    15 Nov <i className="bx bx-right-arrow-alt font-size-12 text-primary align-middle ms-1" />
                  </h5>
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontSize: "12px" }}>Joined the group “Boardsmanship Forum”</div>
                </div>
              </div>
            </li>

            <li className="event-list" style={{ marginBottom: "10px" }}>
              <div className="event-timeline-dot" style={{ marginRight: "10px" }}>
                <i className="bx bx-right-arrow-circle font-size-14" />
              </div>
              <div className="d-flex">
                <div className="flex-shrink-0 me-2">
                  <h5 className="font-size-12" style={{ margin: "0" }}>
                    22 Nov <i className="bx bx-right-arrow-alt font-size-12 text-primary align-middle ms-1" />
                  </h5>
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontSize: "12px" }}>Responded to need “In-Kind Opportunity”</div>
                </div>
              </div>
            </li>
          </ul>
          <div className="text-center mt-3">
            <Link to="#" className="btn btn-primary waves-effect waves-light btn-sm" style={{ fontSize: "12px" }}>
              View More <i className="mdi mdi-arrow-right ms-1" />
            </Link>
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default Activity;