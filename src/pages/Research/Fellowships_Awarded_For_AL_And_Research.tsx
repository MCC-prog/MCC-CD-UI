import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Col, Row, Input, Label, Button, CardBody, Card, Container, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import Breadcrumb from 'Components/Common/Breadcrumb';
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";

const Fellowships_Awarded_For_AL_And_Research = () => {
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isMultidisciplinary, setIsMultidisciplinary] = useState<string>("No");
  const [activeTab, setActiveTab] = useState<string>("1");

  const validationSchema = Yup.object({
    academicYear: Yup.object<{ value: string; label: string }>().nullable().required("Please select academic year"),
    stream: Yup.object<{ value: string; label: string }>().nullable().required("Please select school"),
    department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
    otherDepartment: Yup.string().when("department", (department: any, schema) => {
      return department?.value === "Others"
        ? schema.required("Please specify the department")
        : schema;
    }),
    facultyName: Yup.string().required("Please enter faculty name"),
    projectTitle: Yup.string().required("Please enter project title"),
    amount: Yup.number()
      .typeError("Please enter a valid number")
      .min(0, "Amount cannot be less than 0")
      .required("Please enter the amount"),
    monthOfGrant: Yup.string().required("Please enter the month of grant"),
    typeOfFunding: Yup.object<{ value: string; label: string }>().nullable().required("Please select type of funding"),
    principalInvestigator: isMultidisciplinary === "Yes" && activeTab === "1"
      ? Yup.object({
        name: Yup.string().required("Please enter name"),
        qualification: Yup.string().required("Please enter qualification"),
        designation: Yup.string().required("Please enter designation"),
        department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
        date: Yup.date().required("Please select a date"),
        abstractFile: Yup.mixed().required("Please upload the abstract file"),
        sanctionOrderFile: Yup.mixed().required("Please upload the sanction order file"),
      })
      : Yup.object(),
    coInvestigator: isMultidisciplinary === "Yes" && activeTab === "2"
      ? Yup.object({
        name: Yup.string().required("Please enter name"),
        qualification: Yup.string().required("Please enter qualification"),
        designation: Yup.string().required("Please enter designation"),
        department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
        abstractFile: Yup.mixed().required("Please upload the abstract file"),
        sanctionOrderFile: Yup.mixed().required("Please upload the sanction order file"),
        fellowshipFile: Yup.mixed().required("Please upload the fellowship file"),
      })
      : Yup.object(),
  });

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      facultyName: "",
      projectTitle: "",
      amount: "",
      monthOfGrant: "",
      typeOfFunding: null as { value: string; label: string } | null,
      principalInvestigator: {
        name: "",
        qualification: "",
        designation: "",
        department: null as { value: string; label: string } | null,
        date: "",
        abstractFile: null as File | null,
        sanctionOrderFile: null as File | null,
      },
      coInvestigator: {
        name: "",
        qualification: "",
        designation: "",
        department: null as { value: string; label: string } | null,
        abstractFile: null as File | null,
        sanctionOrderFile: null as File | null,
        fellowshipFile: null as File | null,
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log("Form Submitted:", values);
    },
  });

  const renderPrincipalInvestigatorDepartmentDropdown = () => (
    <Input
      type="select"
      name="principalInvestigator.department"
      value={validation.values.principalInvestigator.department?.value || ""}
      onChange={(e) =>
        validation.setFieldValue("principalInvestigator.department", { value: e.target.value, label: e.target.value })
      }
      className={`form-control ${validation.touched.principalInvestigator?.department && validation.errors.principalInvestigator?.department ? "is-invalid" : ""}`}
    >
      <option value="">Select Department</option>
      <option value="Computer Science">Computer Science</option>
      <option value="Mathematics">Mathematics</option>
      <option value="Physics">Physics</option>
      <option value="Chemistry">Chemistry</option>
      <option value="Others">Others</option>
    </Input>
  );

  const renderCoInvestigatorDepartmentDropdown = () => (
    <Input
      type="select"
      name="coInvestigator.department"
      value={validation.values.coInvestigator.department?.value || ""}
      onChange={(e) =>
        validation.setFieldValue("coInvestigator.department", { value: e.target.value, label: e.target.value })
      }
      className={`form-control ${validation.touched.coInvestigator?.department && validation.errors.coInvestigator?.department ? "is-invalid" : ""}`}
    >
      <option value="">Select Department</option>
      <option value="Biology">Biology</option>
      <option value="Economics">Economics</option>
      <option value="History">History</option>
      <option value="Geography">Geography</option>
      <option value="Others">Others</option>
    </Input>
  );

  const renderPrincipalInvestigatorForm = () => (
    <Row>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Name</Label>
          <Input
            type="text"
            name="principalInvestigator.name"
            value={validation.values.principalInvestigator.name}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.principalInvestigator?.name && validation.errors.principalInvestigator?.name ? "is-invalid" : ""}`}
            placeholder="Enter Name"
          />
          {validation.touched.principalInvestigator?.name && validation.errors.principalInvestigator?.name && (
            <div className="text-danger">{validation.errors.principalInvestigator.name}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Qualification</Label>
          <Input
            type="text"
            name="principalInvestigator.qualification"
            value={validation.values.principalInvestigator.qualification}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.principalInvestigator?.qualification && validation.errors.principalInvestigator?.qualification ? "is-invalid" : ""}`}
            placeholder="Enter Qualification"
          />
          {validation.touched.principalInvestigator?.qualification && validation.errors.principalInvestigator?.qualification && (
            <div className="text-danger">{validation.errors.principalInvestigator.qualification}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Designation</Label>
          <Input
            type="text"
            name="principalInvestigator.designation"
            value={validation.values.principalInvestigator.designation}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.principalInvestigator?.designation && validation.errors.principalInvestigator?.designation ? "is-invalid" : ""}`}
            placeholder="Enter Designation"
          />
          {validation.touched.principalInvestigator?.designation && validation.errors.principalInvestigator?.designation && (
            <div className="text-danger">{validation.errors.principalInvestigator.designation}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Department</Label>
          {renderPrincipalInvestigatorDepartmentDropdown()}
          {validation.touched.principalInvestigator?.department && validation.errors.principalInvestigator?.department && (
            <div className="text-danger">{validation.errors.principalInvestigator.department}</div>
          )}
        </div>
      </Col>

      <Col lg={4}>
        <div className="mb-3">
          <Label>Enter Date</Label>
          <Input
            type="date"
            name="principalInvestigator.date"
            value={validation.values.principalInvestigator.date}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.principalInvestigator?.date && validation.errors.principalInvestigator?.date ? "is-invalid" : ""}`}
          />
          {validation.touched.principalInvestigator?.date && validation.errors.principalInvestigator?.date && (
            <div className="text-danger">{validation.errors.principalInvestigator.date}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Abstract of the Project</Label>
          <Input
            type="file"
            name="principalInvestigator.abstractFile"
            onChange={(event) => validation.setFieldValue("principalInvestigator.abstractFile", event.currentTarget.files?.[0] || null)}
            className={`form-control ${validation.touched.principalInvestigator?.abstractFile && validation.errors.principalInvestigator?.abstractFile ? "is-invalid" : ""}`}
          />
          {validation.touched.principalInvestigator?.abstractFile && validation.errors.principalInvestigator?.abstractFile && (
            <div className="text-danger">{validation.errors.principalInvestigator.abstractFile}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Sanction Order</Label>
          <Input
            type="file"
            name="principalInvestigator.sanctionOrderFile"
            onChange={(event) => validation.setFieldValue("principalInvestigator.sanctionOrderFile", event.currentTarget.files?.[0] || null)}
            className={`form-control ${validation.touched.principalInvestigator?.sanctionOrderFile && validation.errors.principalInvestigator?.sanctionOrderFile ? "is-invalid" : ""}`}
          />
          {validation.touched.principalInvestigator?.sanctionOrderFile && validation.errors.principalInvestigator?.sanctionOrderFile && (
            <div className="text-danger">{validation.errors.principalInvestigator.sanctionOrderFile}</div>
          )}
        </div>
      </Col>
    </Row>
  );

  const renderCoInvestigatorForm = () => (
    <Row>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Name</Label>
          <Input
            type="text"
            name="coInvestigator.name"
            value={validation.values.coInvestigator.name}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.coInvestigator?.name && validation.errors.coInvestigator?.name ? "is-invalid" : ""}`}
            placeholder="Enter Name"
          />
          {validation.touched.coInvestigator?.name && validation.errors.coInvestigator?.name && (
            <div className="text-danger">{validation.errors.coInvestigator.name}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Qualification</Label>
          <Input
            type="text"
            name="coInvestigator.qualification"
            value={validation.values.coInvestigator.qualification}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.coInvestigator?.qualification && validation.errors.coInvestigator?.qualification ? "is-invalid" : ""}`}
            placeholder="Enter Qualification"
          />
          {validation.touched.coInvestigator?.qualification && validation.errors.coInvestigator?.qualification && (
            <div className="text-danger">{validation.errors.coInvestigator.qualification}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Designation</Label>
          <Input
            type="text"
            name="coInvestigator.designation"
            value={validation.values.coInvestigator.designation}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.coInvestigator?.designation && validation.errors.coInvestigator?.designation ? "is-invalid" : ""}`}
            placeholder="Enter Designation"
          />
          {validation.touched.coInvestigator?.designation && validation.errors.coInvestigator?.designation && (
            <div className="text-danger">{validation.errors.coInvestigator.designation}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Department</Label>
          {renderCoInvestigatorDepartmentDropdown()}
          {validation.touched.coInvestigator?.department && validation.errors.coInvestigator?.department && (
            <div className="text-danger">{validation.errors.coInvestigator.department}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Abstract of the Project</Label>
          <Input
            type="file"
            name="coInvestigator.abstractFile"
            onChange={(event) => validation.setFieldValue("coInvestigator.abstractFile", event.currentTarget.files?.[0] || null)}
            className={`form-control ${validation.touched.coInvestigator?.abstractFile && validation.errors.coInvestigator?.abstractFile ? "is-invalid" : ""}`}
          />
          {validation.touched.coInvestigator?.abstractFile && validation.errors.coInvestigator?.abstractFile && (
            <div className="text-danger">{validation.errors.coInvestigator.abstractFile}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Sanction Order</Label>
          <Input
            type="file"
            name="coInvestigator.sanctionOrderFile"
            onChange={(event) => validation.setFieldValue("coInvestigator.sanctionOrderFile", event.currentTarget.files?.[0] || null)}
            className={`form-control ${validation.touched.coInvestigator?.sanctionOrderFile && validation.errors.coInvestigator?.sanctionOrderFile ? "is-invalid" : ""}`}
          />
          {validation.touched.coInvestigator?.sanctionOrderFile && validation.errors.coInvestigator?.sanctionOrderFile && (
            <div className="text-danger">{validation.errors.coInvestigator.sanctionOrderFile}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Fellowship</Label>
          <Input
            type="file"
            name="coInvestigator.fellowshipFile"
            onChange={(event) => validation.setFieldValue("coInvestigator.fellowshipFile", event.currentTarget.files?.[0] || null)}
            className={`form-control ${validation.touched.coInvestigator?.fellowshipFile && validation.errors.coInvestigator?.fellowshipFile ? "is-invalid" : ""}`}
          />
          {validation.touched.coInvestigator?.fellowshipFile && validation.errors.coInvestigator?.fellowshipFile && (
            <div className="text-danger">{validation.errors.coInvestigator.fellowshipFile}</div>
          )}
        </div>
      </Col>
    </Row>
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Research" breadcrumbItem="Management_Funded_Project" />
          <Card>
            <CardBody>
              <form onSubmit={validation.handleSubmit}>
                <Row>
                  {/* Academic Year Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Academic Year</Label>
                      <AcademicYearDropdown
                        value={validation.values.academicYear}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("academicYear", selectedOption)
                        }
                        isInvalid={
                          validation.touched.academicYear &&
                          !!validation.errors.academicYear
                        }
                      />
                      {validation.touched.academicYear &&
                        validation.errors.academicYear && (
                          <div className="text-danger">
                            {validation.errors.academicYear}
                          </div>
                        )}
                    </div>
                  </Col>

                  {/* School Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>School</Label>
                      <StreamDropdown
                        value={validation.values.stream}
                        onChange={(selectedOption) => {
                          validation.setFieldValue("stream", selectedOption);
                          setSelectedStream(selectedOption);
                          validation.setFieldValue("department", null);
                          setSelectedDepartment(null);
                        }}
                        isInvalid={
                          validation.touched.stream && !!validation.errors.stream
                        }
                      />
                      {validation.touched.stream && validation.errors.stream && (
                        <div className="text-danger">{validation.errors.stream}</div>
                      )}
                    </div>
                  </Col>

                  {/* Department Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Department</Label>
                      <DepartmentDropdown
                        streamId={selectedStream?.value}
                        value={validation.values.department}
                        onChange={(selectedOption) => {
                          validation.setFieldValue("department", selectedOption);
                          setSelectedDepartment(selectedOption);
                          validation.setFieldValue("programType", null);
                        }}
                        isInvalid={
                          validation.touched.department &&
                          !!validation.errors.department
                        }
                      />
                      {validation.touched.department &&
                        validation.errors.department && (
                          <div className="text-danger">
                            {validation.errors.department}
                          </div>
                        )}
                    </div>
                  </Col>
                  {validation.values.department?.value === "Others" && (
                    <Col lg={4}>
                      <div className="mb-3">
                        <Label>Specify Department</Label>
                        <Input
                          type="text"
                          className={`form-control ${validation.touched.otherDepartment && validation.errors.otherDepartment ? "is-invalid" : ""
                            }`}
                          value={validation.values.otherDepartment}
                          onChange={(e) => validation.setFieldValue("otherDepartment", e.target.value)}
                          placeholder="Enter Department Name"
                        />
                        {validation.touched.otherDepartment && validation.errors.otherDepartment && (
                          <div className="text-danger">{validation.errors.otherDepartment}</div>
                        )}
                      </div>
                    </Col>
                  )}

                  {/* Faculty Name */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Faculty Name</Label>
                      <Input
                        type="text"
                        value={validation.values.facultyName}
                        onChange={(e) => validation.setFieldValue("facultyName", e.target.value)}
                        className={`form-control ${validation.touched.facultyName && validation.errors.facultyName ? "is-invalid" : ""
                          }`}
                        placeholder="Enter Faculty Name"
                      />
                      {validation.touched.facultyName && validation.errors.facultyName && (
                        <div className="text-danger">{validation.errors.facultyName}</div>
                      )}
                    </div>
                  </Col>

                  {/* Title of the Project */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Title of the Project</Label>
                      <Input
                        type="text"
                        value={validation.values.projectTitle}
                        onChange={(e) => validation.setFieldValue("projectTitle", e.target.value)}
                        className={`form-control ${validation.touched.projectTitle && validation.errors.projectTitle ? "is-invalid" : ""
                          }`}
                        placeholder="Enter Project Title"
                      />
                      {validation.touched.projectTitle && validation.errors.projectTitle && (
                        <div className="text-danger">{validation.errors.projectTitle}</div>
                      )}
                    </div>
                  </Col>

                  {/* Amount */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        value={validation.values.amount}
                        onChange={(e) => validation.setFieldValue("amount", e.target.value)}
                        className={`form-control ${validation.touched.amount && validation.errors.amount ? "is-invalid" : ""
                          }`}
                        placeholder="Enter Amount"
                      />
                      {validation.touched.amount && validation.errors.amount && (
                        <div className="text-danger">{validation.errors.amount}</div>
                      )}
                    </div>
                  </Col>

                  {/* Month of Grant */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Month of Grant</Label>
                      <Input
                        type="text"
                        value={validation.values.monthOfGrant}
                        onChange={(e) => validation.setFieldValue("monthOfGrant", e.target.value)}
                        className={`form-control ${validation.touched.monthOfGrant && validation.errors.monthOfGrant ? "is-invalid" : ""
                          }`}
                        placeholder="Enter Month of Grant"
                      />
                      {validation.touched.monthOfGrant && validation.errors.monthOfGrant && (
                        <div className="text-danger">{validation.errors.monthOfGrant}</div>
                      )}
                    </div>
                  </Col>

                  {/* Type of Funding Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Type of Funding</Label>
                      <Input
                        type="select"
                        value={validation.values.typeOfFunding?.value || ""}
                        onChange={(e) =>
                          validation.setFieldValue("typeOfFunding", { value: e.target.value, label: e.target.value })
                        }
                        className={`form-control ${validation.touched.typeOfFunding && validation.errors.typeOfFunding ? "is-invalid" : ""
                          }`}
                      >
                        <option value="">Select Type of Funding</option>
                        <option value="Management">Management</option>
                        <option value="External Funding Agency">External Funding Agency</option>
                      </Input>
                      {validation.touched.typeOfFunding && validation.errors.typeOfFunding && (
                        <div className="text-danger">{validation.errors.typeOfFunding}</div>
                      )}
                    </div>
                  </Col>
                  {/* Multidisciplinary Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Multidisciplinary</Label>
                      <Input
                        type="select"
                        value={isMultidisciplinary}
                        onChange={(e) => setIsMultidisciplinary(e.target.value)}
                        className="form-control"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </Input>
                    </div>
                  </Col>
                </Row>
                {isMultidisciplinary === "Yes" && (
                  <div>
                    <Nav tabs>
                      <NavItem>
                        <NavLink
                          className={activeTab === "1" ? "active" : ""}
                          onClick={() => setActiveTab("1")}
                        >
                          Principal Investigator Details
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={activeTab === "2" ? "active" : ""}
                          onClick={() => setActiveTab("2")}
                        >
                          Co-Investigator Details
                        </NavLink>
                      </NavItem>
                    </Nav>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId="1">{renderPrincipalInvestigatorForm()}</TabPane>
                      <TabPane tabId="2">{renderCoInvestigatorForm()}</TabPane>
                    </TabContent>
                  </div>
                )}
                <Button type="submit" color="primary">
                  Submit
                </Button>
              </form>
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Fellowships_Awarded_For_AL_And_Research;