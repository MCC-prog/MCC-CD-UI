import Breadcrumb from "Components/Common/Breadcrumb";
import { useFormik } from "formik";
import React, { useState } from "react";
import Select from "react-select";
import * as Yup from "yup";
import {
  Card,
  CardBody,
  Col,
  Container,
  Form,
  Input,
  Label,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import { Link } from "react-router-dom";
import classNames from "classnames";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import SemesterDropdowns from "Components/DropDowns/SemesterDropdowns";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import ProgramDropdown from "Components/DropDowns/ProgramDropdown";

const Student_Centric_Teaching: React.FC = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);

  const toggleTab = (tab) => {
    setActiveTab(activeTab === tab ? null : tab); // Collapse if clicked again
  };

  const toggleWizard = () => {
    setShowWizard(!showWizard);
  };

  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
  };

  const academicYear = [
    { value: "2024", label: "2023-2024" },
    { value: "2025", label: "2024-2025" },
  ];
  const semType = [
    { value: "T", label: "Theory" },
    { value: "P", label: "Practical" },
  ];
  const projectType = [
    { value: "In", label: "Internal" },
    { value: "Ex", label: "External" },
  ];
  const Type = [
    { value: "Funded", label: "Funded" },
    { value: "Non-Funded", label: "Non-Funded" },
  ];
  const programType = [
    { value: "T", label: "UG" },
    { value: "P", label: "PG" },
  ];
  const semester: any = [
    { value: "1", label: "I" },
    { value: "2", label: "II" },
    { value: "3", label: "III" },
    { value: "4", label: "IV" },
    { value: "5", label: "V" },
    { value: "6", label: "VI" },
  ];
  const stream = [
    {
      value: "School of Humanities & Social Sciences",
      label: "School of Humanities & Social Sciences",
    },
    { value: "School of Commerce", label: "School of Commerce" },
    { value: "School of Management", label: "School of Management" },
    {
      value: "School of Natural & Applied Sciences",
      label: "School of Natural & Applied Sciences",
    },
  ];
  const department = [
    { value: "Science", label: "Science" },
    { value: "Arts", label: "Arts" },
  ];
  const courseTitile = [
    { value: "G", label: "B.COM.General" },
    { value: "P", label: "B.COM.Professional" },
  ];
  const mentorShip = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];
  const validation = useFormik({
    initialValues: {
      academicYear: null,
      semesterType: null,
      semesterNo: [],
      stream: null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      file: null,
      programType: null,
      degree: null,
      program: null,
      courseTitle: "",
      courseTitile: null,
      mentorShip: null,
      projectType: null,
      Type: null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select academic year"),
      semType: Yup.object().nullable().required("Please select semester type"),
      semester: Yup.array()
        .min(1, "Please select at least one semester")
        .required("Please select semester"),
      projectType: Yup.object()
        .nullable()
        .required("Please select project type"),
      Type: Yup.object().nullable().required("Please select type"),
      stream: Yup.object().nullable().required("Please select stream"),
      department: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select department"),
      programType: Yup.object()
        .nullable()
        .required("Please select programType"),
      courseTitile: Yup.string().required("Please enter Course Titile"),
      mentorShip: Yup.string().required("Please enter Course Titile"),
      programName: Yup.string().required("Please enter Program Name"),
      file: Yup.mixed()
        .required("Please upload a file")
        .test("fileSize", "File size is too large", (value: any) => {
          return value && value.size <= 2 * 1024 * 1024; // 2MB limit
        })
        .test("fileType", "Unsupported file format", (value: any) => {
          return (
            value &&
            ["application/pdf", "image/jpeg", "image/png"].includes(value.type)
          );
        }),
    }),
    onSubmit: (values) => {
      console.log("Submitting form...", values);
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Teacher & Learning"
            breadcrumbItem="Student Centric Teaching Methodology"
          />
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
                          validation.setFieldValue(
                            "academicYear",
                            selectedOption
                          )
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
                          validation.touched.stream &&
                          !!validation.errors.stream
                        }
                      />
                      {validation.touched.stream &&
                        validation.errors.stream && (
                          <div className="text-danger">
                            {validation.errors.stream}
                          </div>
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
                          validation.setFieldValue(
                            "department",
                            selectedOption
                          );
                          setSelectedDepartment(selectedOption);
                          validation.setFieldValue("programType", null);
                          setSelectedProgramType(null);
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
                          className={`form-control ${
                            validation.touched.otherDepartment &&
                            validation.errors.otherDepartment
                              ? "is-invalid"
                              : ""
                          }`}
                          value={validation.values.otherDepartment}
                          onChange={(e) =>
                            validation.setFieldValue(
                              "otherDepartment",
                              e.target.value
                            )
                          }
                          placeholder="Enter Department Name"
                        />
                        {validation.touched.otherDepartment &&
                          validation.errors.otherDepartment && (
                            <div className="text-danger">
                              {validation.errors.otherDepartment}
                            </div>
                          )}
                      </div>
                    </Col>
                  )}
                  {/* Program  Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Program Level</Label>
                      <ProgramTypeDropdown
                        placeholder="Select Program Level"
                        deptId={selectedDepartment?.value} // Pass the selected department ID
                        value={validation.values.programType}
                        onChange={(selectedOption) => {
                          validation.setFieldValue(
                            "programType",
                            selectedOption
                          );
                          setSelectedProgramType(selectedOption);
                          validation.setFieldValue("degree", null);
                        }}
                        isInvalid={
                          validation.touched.programType &&
                          !!validation.errors.programType
                        }
                      />
                      {validation.touched.programType &&
                        validation.errors.programType && (
                          <div className="text-danger">
                            {validation.errors.programType}
                          </div>
                        )}
                    </div>
                  </Col>

                  {/* Semester Dropdowns */}
                  <Col lg={8}>
                    <SemesterDropdowns
                      semesterTypeValue={validation.values.semesterType} // Single object for single-select
                      semesterNoValue={validation.values.semesterNo} // Array for multiselect
                      onSemesterTypeChange={
                        (selectedOption) =>
                          validation.setFieldValue(
                            "semesterType",
                            selectedOption
                          ) // Single object
                      }
                      onSemesterNoChange={
                        (selectedOptions) =>
                          validation.setFieldValue(
                            "semesterNo",
                            selectedOptions
                          ) // Array of selected values
                      }
                      isSemesterTypeInvalid={
                        validation.touched.semesterType &&
                        !!validation.errors.semesterType
                      }
                      isSemesterNoInvalid={
                        validation.touched.semesterNo &&
                        !!validation.errors.semesterNo
                      }
                      semesterTypeError={
                        validation.touched.semesterType
                          ? Array.isArray(validation.errors.semesterType)
                            ? validation.errors.semesterType.join(", ")
                            : validation.errors.semesterType
                          : null
                      }
                      semesterNoError={
                        validation.touched.semesterNo
                          ? Array.isArray(validation.errors.semesterNo)
                            ? validation.errors.semesterNo.join(", ")
                            : validation.errors.semesterNo
                          : null
                      }
                      semesterTypeTouched={!!validation.touched.semesterType}
                      semesterNoTouched={!!validation.touched.semesterNo}
                    />
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Course Title</Label>
                      <Input
                        type="text"
                        placeholder="Enter Course Title"
                        className={`form-control ${
                          validation.touched.courseTitle &&
                          validation.errors.courseTitle
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.courseTitle}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "courseTitle",
                            e.target.value
                          )
                        }
                      />
                      {validation.touched.courseTitle &&
                        validation.errors.courseTitle && (
                          <div className="text-danger">
                            {validation.errors.courseTitle}
                          </div>
                        )}
                    </div>
                  </Col>
                  <div className="mb-3 mt-3 d-grid">
                    <button
                      className="btn btn-primary toggle-wizard-button"
                      onClick={toggleWizard}
                    >
                      Methodology Tabs
                    </button>
                  </div>
                  {showWizard && (
                    <div className="wizard clearfix">
                      <div
                        className="steps"
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(120px, 1fr))",
                          gap: "10px",
                        }}
                      >
                        {[1, 2, 3].map((tab) => (
                          <button
                            key={tab}
                            className={`step-button ${
                              activeTab === tab ? "active" : ""
                            }`}
                            onClick={() => toggleTab(tab)}
                          >
                            {tab}.{" "}
                            {tab === 1
                              ? "Experiental Learning"
                              : tab === 2
                              ? "Participative Learning"
                              : "Problem Learning"}
                          </button>
                        ))}
                      </div>

                      <div className="tab-content">
                        {activeTab === 1 && (
                          <Form>
                            <Row>
                              <Col lg="4">
                                <div className="mb-3">
                                  <Label>Project Title</Label>
                                  <Input
                                    type="text"
                                    placeholder="Enter Project Title"
                                  />
                                </div>
                              </Col>
                              <Col lg="4">
                                <div className="mb-3">
                                  <Label>Duration</Label>
                                  <Input
                                    type="text"
                                    placeholder="Enter Duration"
                                  />
                                </div>
                              </Col>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Semester Type</Label>
                                  <Select
                                    options={projectType}
                                    value={validation.values.projectType}
                                    onChange={(selectedOption) =>
                                      validation.setFieldValue(
                                        "projectType",
                                        selectedOption
                                      )
                                    }
                                    placeholder="Select Project Type"
                                    styles={dropdownStyles}
                                    menuPortalTarget={document.body}
                                    className={
                                      validation.touched.projectType &&
                                      validation.errors.projectType
                                        ? "select-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.projectType &&
                                    validation.errors.projectType && (
                                      <div className="text-danger">
                                        {validation.errors.projectType}
                                      </div>
                                    )}
                                </div>
                              </Col>
                              <Col lg="4">
                                <div className="mb-3">
                                  <Label>Guide Name</Label>
                                  <Input
                                    type="text"
                                    placeholder="Enter Guide Name"
                                  />
                                </div>
                              </Col>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Type</Label>
                                  <Select
                                    options={Type}
                                    value={validation.values.Type}
                                    onChange={(selectedOption) =>
                                      validation.setFieldValue(
                                        "Type",
                                        selectedOption
                                      )
                                    }
                                    placeholder="Select Type"
                                    styles={dropdownStyles}
                                    menuPortalTarget={document.body}
                                    className={
                                      validation.touched.Type &&
                                      validation.errors.Type
                                        ? "select-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.Type &&
                                    validation.errors.Type && (
                                      <div className="text-danger">
                                        {validation.errors.Type}
                                      </div>
                                    )}
                                </div>
                              </Col>
                              <Col lg="4">
                                <div className="mb-3">
                                  <Label>Amount</Label>
                                  <Input
                                    type="text"
                                    placeholder="Enter Amount"
                                  />
                                </div>
                              </Col>
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label
                                    htmlFor="formFile"
                                    className="form-label"
                                  >
                                    Project Sanction Letter (Upload file)
                                  </Label>
                                  <Input
                                    className={`form-control ${
                                      validation.touched.file &&
                                      validation.errors.file
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="syllabus"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "syllabus",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />
                                  {validation.touched.file &&
                                    validation.errors.file && (
                                      <div className="text-danger">
                                        {validation.errors.file}
                                      </div>
                                    )}
                                </div>
                              </Col>
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label
                                    htmlFor="formFile"
                                    className="form-label"
                                  >
                                    Synopsis Letter (Upload file)
                                  </Label>
                                  <Input
                                    className={`form-control ${
                                      validation.touched.file &&
                                      validation.errors.file
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="syllabus"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "syllabus",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />
                                  {validation.touched.file &&
                                    validation.errors.file && (
                                      <div className="text-danger">
                                        {validation.errors.file}
                                      </div>
                                    )}
                                </div>
                              </Col>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>
                                    Project Sanction Letter (Download)
                                  </Label>
                                  <div>
                                    <a
                                      href="/templateFiles/bos.pdf"
                                      download
                                      className="btn btn-primary btn-sm"
                                    >
                                      Download Template
                                    </a>
                                  </div>
                                </div>
                              </Col>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Synopsis Letter (Download)</Label>
                                  <div>
                                    <a
                                      href="/templateFiles/bos.pdf"
                                      download
                                      className="btn btn-primary btn-sm"
                                    >
                                      Download Template
                                    </a>
                                  </div>
                                </div>
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {activeTab === 2 && (
                          <Form>
                            <Row>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course</Label>
                                  <Select
                                    options={courseTitile}
                                    value={validation.values.courseTitile}
                                    onChange={(selectedOption) =>
                                      validation.setFieldValue(
                                        "courseTitile",
                                        selectedOption
                                      )
                                    }
                                    placeholder="Select Program Type"
                                    styles={dropdownStyles}
                                    menuPortalTarget={document.body}
                                    className={
                                      validation.touched.courseTitile &&
                                      validation.errors.courseTitile
                                        ? "select-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.courseTitile &&
                                    validation.errors.courseTitile && (
                                      <div className="text-danger">
                                        {validation.errors.courseTitile}
                                      </div>
                                    )}
                                </div>
                              </Col>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>MentorShip</Label>
                                  <Select
                                    options={mentorShip}
                                    value={validation.values.mentorShip}
                                    onChange={(selectedOption) =>
                                      validation.setFieldValue(
                                        "mentorShip",
                                        selectedOption
                                      )
                                    }
                                    placeholder="Select Program Type"
                                    styles={dropdownStyles}
                                    menuPortalTarget={document.body}
                                    className={
                                      validation.touched.mentorShip &&
                                      validation.errors.mentorShip
                                        ? "select-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.mentorShip &&
                                    validation.errors.mentorShip && (
                                      <div className="text-danger">
                                        {validation.errors.mentorShip}
                                      </div>
                                    )}
                                </div>
                              </Col>
                              <Col lg="4">
                                <Label>Register Number</Label>
                                <Input
                                  type="text"
                                  placeholder="Enter Register Number"
                                />
                              </Col>
                              <Col lg="4">
                                <Label>Teacher Co-Ordinator</Label>
                                <Input
                                  type="text"
                                  placeholder="Enter Teacher Co-Ordinator"
                                />
                              </Col>
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label
                                    htmlFor="formFile"
                                    className="form-label"
                                  >
                                    Peer Teaching (Upload file)
                                  </Label>
                                  <Input
                                    className={`form-control ${
                                      validation.touched.file &&
                                      validation.errors.file
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="syllabus"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "syllabus",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />
                                  {validation.touched.file &&
                                    validation.errors.file && (
                                      <div className="text-danger">
                                        {validation.errors.file}
                                      </div>
                                    )}
                                </div>
                              </Col>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Peer Teaching (Download)</Label>
                                  <div>
                                    <a
                                      href="/templateFiles/bos.pdf"
                                      download
                                      className="btn btn-primary btn-sm"
                                    >
                                      Download Template
                                    </a>
                                  </div>
                                </div>
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {activeTab === 3 && (
                          <Col lg={4}>
                            <div className="mb-3">
                              <Label>Peer Teaching (Download)</Label>
                              <div>
                                <a
                                  href="/templateFiles/bos.pdf"
                                  download
                                  className="btn btn-primary btn-sm"
                                >
                                  Download Template
                                </a>
                              </div>
                            </div>
                          </Col>
                        )}
                      </div>
                    </div>
                  )}
                </Row>

                <div className="mt-3 d-grid">
                  <button className="btn btn-primary btn-block" type="submit">
                    Submit Application
                  </button>
                </div>
              </form>
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Student_Centric_Teaching;
