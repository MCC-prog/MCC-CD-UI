import Breadcrumb from "Components/Common/Breadcrumb";
import { useFormik } from "formik";
import React, { useState } from "react";
import Select from "react-select";
import * as Yup from "yup";
import { Card, CardBody, Col, Container, Form, Input, Label, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import { Link } from "react-router-dom";
import classNames from "classnames";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import SemesterDropdowns from "Components/DropDowns/SemesterDropdowns";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import ProgramDropdown from "Components/DropDowns/ProgramDropdown";

const Courses_With_Focus: React.FC = () => {
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

  const courseType = [
    { value: "T", label: "Core" },
    { value: "P", label: "Elective" },
    { value: "A", label: "Allied" },
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
      courses: null,
      courseType: null,
      courseTitile: "",
    },
    validationSchema: Yup.object({ academicYear: Yup.object().nullable().required("Please select academic year"),
      semType: Yup.object().nullable().required("Please select semester type"),
      semester: Yup.array().min(1, "Please select at least one semester") .required("Please select semester"),
      stream: Yup.object().nullable().required("Please select stream"),
      department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
      programType: Yup.object().nullable().required("Please select programType"),
      courses: Yup.object().nullable().required("Please enter Program "),
      program: Yup.object().nullable().required("Please enter Degree"),
      courseType: Yup.object().nullable().required("Please select course type"),
      courseTitile: Yup.string().required("Please select Course Title"),
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
            title="Courses With Focus"
            breadcrumbItem="Courses With Focus"
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
                                    {/* Semester Dropdowns */}
                                    <Col lg={8}>
                                        <SemesterDropdowns
                                            semesterTypeValue={validation.values.semesterType} // Single object for single-select
                                            semesterNoValue={validation.values.semesterNo} // Array for multiselect
                                            onSemesterTypeChange={(selectedOption) =>
                                                validation.setFieldValue("semesterType", selectedOption) // Single object
                                            }
                                            onSemesterNoChange={(selectedOptions) =>
                                                validation.setFieldValue("semesterNo", selectedOptions) // Array of selected values
                                            }
                                            isSemesterTypeInvalid={
                                                validation.touched.semesterType && !!validation.errors.semesterType
                                            }
                                            isSemesterNoInvalid={
                                                validation.touched.semesterNo && !!validation.errors.semesterNo
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
                                    {/* Program Type Dropdown */}
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Program Type</Label>
                                            <ProgramTypeDropdown
                                                deptId={selectedDepartment?.value} // Pass the selected department ID
                                                value={validation.values.programType}
                                                onChange={(selectedOption) => {
                                                    validation.setFieldValue("programType", selectedOption);
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
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Degree</Label>
                                            <DegreeDropdown
                                                programTypeId={selectedProgramType?.value}
                                                value={validation.values.degree}
                                                onChange={(selectedOption) => {
                                                    validation.setFieldValue("degree", selectedOption);
                                                    setSelectedDegree(selectedOption);
                                                    validation.setFieldValue("program", null);
                                                }}
                                                isInvalid={
                                                    validation.touched.degree &&
                                                    !!validation.errors.degree
                                                }
                                            />
                                            {validation.touched.degree && validation.errors.degree && (
                                                <div className="text-danger">{validation.errors.degree}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Program</Label>
                                            <ProgramDropdown
                                                degreeId={selectedDegree?.value}
                                                value={validation.values.program}
                                                onChange={(selectedOption) =>
                                                    validation.setFieldValue("program", selectedOption)
                                                }
                                                isInvalid={
                                                    validation.touched.program &&
                                                    !!validation.errors.program
                                                }
                                            />
                                            {validation.touched.program && validation.errors.program && (
                                                <div className="text-danger">{validation.errors.program}</div>
                                            )}
                                        </div>
                                    </Col>
                  <div className="mb-3 mt-3 d-grid">
                    <button
                      className="btn btn-primary toggle-wizard-button"
                      onClick={toggleWizard}
                    >
                      Focus Areas
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
                        {[1, 2, 3, 4, 5, 6, 7].map((tab) => (
                          <button
                            key={tab}
                            className={`step-button ${
                              activeTab === tab ? "active" : ""
                            }`}
                            onClick={() => toggleTab(tab)}
                          >
                            {tab}.
                            {tab === 1
                              ? "Gender"
                              : tab === 2
                              ? "Environment & Sustainability"
                              : tab === 3
                              ? "Indian Knowledge System"
                              : tab === 4
                              ? "Employability"
                              : tab === 5
                              ? "Skill Enhancement"
                              : tab === 6
                              ? "Entrepreneurship"
                              : "Ethics"}
                          </button>
                        ))}
                      </div>
                      <div className="tab-content">
                        {activeTab === 1 && (
                          <Form>
                            <Row>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Title</Label>
                                  <Input
                                    type="text"
                                    name="courseTitile"
                                    value={validation.values.courseTitile}
                                    onChange={validation.handleChange}
                                    placeholder="Enter Course Titile"
                                    className={
                                      validation.touched.courseTitile &&
                                      validation.errors.courseTitile
                                        ? "input-error"
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
                                  <Label>Course Type</Label>
                                  <Select
                                    options={courseType}
                                    value={validation.values.courseType}
                                    onChange={(selectedOptions) =>
                                      validation.setFieldValue(
                                        "courseType",
                                        selectedOptions
                                      )
                                    }
                                    placeholder="Select Course Type"
                                    isMulti
                                    styles={dropdownStyles}
                                    menuPortalTarget={document.body}
                                    className={
                                      validation.touched.courseType &&
                                      validation.errors.courseType
                                        ? "select-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.courseType &&
                                    validation.errors.courseType && (
                                      <div className="text-danger">
                                        {validation.errors.courseType}
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
                                    Upload file
                                  </Label>
                                  <Input
                                    className={`form-control ${
                                      validation.touched.file &&
                                      validation.errors.file
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="gender"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "gender",
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
                            </Row>
                          </Form>
                        )}
                        {activeTab === 2 && (
                          <Form>
                            <Row>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Title</Label>
                                  <Input
                                    type="text"
                                    name="courseTitile"
                                    value={validation.values.courseTitile}
                                    onChange={validation.handleChange}
                                    placeholder="Enter Course Titile"
                                    className={
                                      validation.touched.courseTitile &&
                                      validation.errors.courseTitile
                                        ? "input-error"
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
                                  <Label>Course Type</Label>
                                  <Select
                                    options={courseType}
                                    value={validation.values.courseType}
                                    onChange={(selectedOptions) =>
                                      validation.setFieldValue(
                                        "courseType",
                                        selectedOptions
                                      )
                                    }
                                    placeholder="Select Course Type"
                                    isMulti
                                    styles={dropdownStyles}
                                    menuPortalTarget={document.body}
                                    className={
                                      validation.touched.courseType &&
                                      validation.errors.courseType
                                        ? "select-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.courseType &&
                                    validation.errors.courseType && (
                                      <div className="text-danger">
                                        {validation.errors.courseType}
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
                                    Upload file
                                  </Label>
                                  <Input
                                    className={`form-control ${
                                      validation.touched.file &&
                                      validation.errors.file
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="environment&sustainability"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "environment&sustainability",
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
                            </Row>
                          </Form>
                        )}
                        {activeTab === 3 && (
                          <Form>
                            <Row>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Title</Label>
                                  <Input
                                    type="text"
                                    name="courseTitile"
                                    value={validation.values.courseTitile}
                                    onChange={validation.handleChange}
                                    placeholder="Enter Course Titile"
                                    className={
                                      validation.touched.courseTitile &&
                                      validation.errors.courseTitile
                                        ? "input-error"
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
                                  <Label>Course Type</Label>
                                  <Select
                                    options={courseType}
                                    value={validation.values.courseType}
                                    onChange={(selectedOptions) =>
                                      validation.setFieldValue(
                                        "courseType",
                                        selectedOptions
                                      )
                                    }
                                    placeholder="Select Course Type"
                                    isMulti
                                    styles={dropdownStyles}
                                    menuPortalTarget={document.body}
                                    className={
                                      validation.touched.courseType &&
                                      validation.errors.courseType
                                        ? "select-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.courseType &&
                                    validation.errors.courseType && (
                                      <div className="text-danger">
                                        {validation.errors.courseType}
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
                                    Upload file
                                  </Label>
                                  <Input
                                    className={`form-control ${
                                      validation.touched.file &&
                                      validation.errors.file
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="indianKnowledgeSystem"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "indianKnowledgeSystem",
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
                            </Row>
                          </Form>
                        )}
                        {activeTab === 4 && (
                          <Form>
                            <Row>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Title</Label>
                                  <Input
                                    type="text"
                                    name="courseTitile"
                                    value={validation.values.courseTitile}
                                    onChange={validation.handleChange}
                                    placeholder="Enter Course Titile"
                                    className={
                                      validation.touched.courseTitile &&
                                      validation.errors.courseTitile
                                        ? "input-error"
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
                                  <Label>Course Type</Label>
                                  <Select
                                    options={courseType}
                                    value={validation.values.courseType}
                                    onChange={(selectedOptions) =>
                                      validation.setFieldValue(
                                        "courseType",
                                        selectedOptions
                                      )
                                    }
                                    placeholder="Select Course Type"
                                    isMulti
                                    styles={dropdownStyles}
                                    menuPortalTarget={document.body}
                                    className={
                                      validation.touched.courseType &&
                                      validation.errors.courseType
                                        ? "select-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.courseType &&
                                    validation.errors.courseType && (
                                      <div className="text-danger">
                                        {validation.errors.courseType}
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
                                    Upload file
                                  </Label>
                                  <Input
                                    className={`form-control ${
                                      validation.touched.file &&
                                      validation.errors.file
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="employability"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "employability",
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
                            </Row>
                          </Form>
                        )}
                        {activeTab === 5 && (
                          <Form>
                            <Row>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Title</Label>
                                  <Input
                                    type="text"
                                    name="courseTitile"
                                    value={validation.values.courseTitile}
                                    onChange={validation.handleChange}
                                    placeholder="Enter Course Titile"
                                    className={
                                      validation.touched.courseTitile &&
                                      validation.errors.courseTitile
                                        ? "input-error"
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
                                  <Label>Course Type</Label>
                                  <Select
                                    options={courseType}
                                    value={validation.values.courseType}
                                    onChange={(selectedOptions) =>
                                      validation.setFieldValue(
                                        "courseType",
                                        selectedOptions
                                      )
                                    }
                                    placeholder="Select Course Type"
                                    isMulti
                                    styles={dropdownStyles}
                                    menuPortalTarget={document.body}
                                    className={
                                      validation.touched.courseType &&
                                      validation.errors.courseType
                                        ? "select-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.courseType &&
                                    validation.errors.courseType && (
                                      <div className="text-danger">
                                        {validation.errors.courseType}
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
                                    Upload file
                                  </Label>
                                  <Input
                                    className={`form-control ${
                                      validation.touched.file &&
                                      validation.errors.file
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="skillEnhancement"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "skillEnhancement",
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
                            </Row>
                          </Form>
                        )}
                        {activeTab === 6 && (
                          <Form>
                            <Row>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Title</Label>
                                  <Input
                                    type="text"
                                    name="courseTitile"
                                    value={validation.values.courseTitile}
                                    onChange={validation.handleChange}
                                    placeholder="Enter Course Titile"
                                    className={
                                      validation.touched.courseTitile &&
                                      validation.errors.courseTitile
                                        ? "input-error"
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
                                  <Label>Course Type</Label>
                                  <Select
                                    options={courseType}
                                    value={validation.values.courseType}
                                    onChange={(selectedOptions) =>
                                      validation.setFieldValue(
                                        "courseType",
                                        selectedOptions
                                      )
                                    }
                                    placeholder="Select Course Type"
                                    isMulti
                                    styles={dropdownStyles}
                                    menuPortalTarget={document.body}
                                    className={
                                      validation.touched.courseType &&
                                      validation.errors.courseType
                                        ? "select-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.courseType &&
                                    validation.errors.courseType && (
                                      <div className="text-danger">
                                        {validation.errors.courseType}
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
                                    Upload file
                                  </Label>
                                  <Input
                                    className={`form-control ${
                                      validation.touched.file &&
                                      validation.errors.file
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="entrepreneurship"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "entrepreneurship",
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
                            </Row>
                          </Form>
                        )}
                        {activeTab === 7 && (
                          <Form>
                            <Row>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Title</Label>
                                  <Input
                                    type="text"
                                    name="courseTitile"
                                    value={validation.values.courseTitile}
                                    onChange={validation.handleChange}
                                    placeholder="Enter Course Titile"
                                    className={
                                      validation.touched.courseTitile &&
                                      validation.errors.courseTitile
                                        ? "input-error"
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
                                  <Label>Course Type</Label>
                                  <Select
                                    options={courseType}
                                    value={validation.values.courseType}
                                    onChange={(selectedOptions) =>
                                      validation.setFieldValue(
                                        "courseType",
                                        selectedOptions
                                      )
                                    }
                                    placeholder="Select Course Type"
                                    isMulti
                                    styles={dropdownStyles}
                                    menuPortalTarget={document.body}
                                    className={
                                      validation.touched.courseType &&
                                      validation.errors.courseType
                                        ? "select-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.courseType &&
                                    validation.errors.courseType && (
                                      <div className="text-danger">
                                        {validation.errors.courseType}
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
                                    Upload file
                                  </Label>
                                  <Input
                                    className={`form-control ${
                                      validation.touched.file &&
                                      validation.errors.file
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="ethics"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "ethics",
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
                            </Row>
                          </Form>
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

export default Courses_With_Focus;
