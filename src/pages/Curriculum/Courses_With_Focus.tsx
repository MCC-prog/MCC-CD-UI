import Breadcrumb from "Components/Common/Breadcrumb";
import { useFormik } from "formik";
import React, { useState } from "react";
import Select from "react-select";
import * as Yup from "yup";
import { Card, CardBody, Col, Container, Form, Input, Label, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import { Link } from "react-router-dom";
import classNames from "classnames";

const Courses_With_Focus: React.FC = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [showWizard, setShowWizard] = useState(false);

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
    { value: "T", label: "ODD" },
    { value: "P", label: "EVEN" },
  ];
  const programType = [
    { value: "T", label: "UG" },
    { value: "P", label: "PG" },
  ];
  const program = [
    { value: "T", label: "BA" },
    { value: "P", label: "BCOM" },
  ];
  const courses = [
    { value: "T", label: "HEP" },
    { value: "P", label: "HES" },
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
  const courseType = [
    { value: "T", label: "Core" },
    { value: "P", label: "Elective" },
    { value: "A", label: "Allied" },
  ];

  const validation = useFormik({
    initialValues: {
      academicYear: null,
      semType: null,
      semester: [],
      stream: null,
      department: null as { value: string; label: string } | null,
      programType: null,
      program: null,
      courses: null,
      courseType: null,
      courseTitile: "",
      file: null,
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Academic Year</Label>
                      <Select
                        options={academicYear}
                        value={validation.values.academicYear}
                        onChange={(selectedOption) =>
                          validation.setFieldValue(
                            "academicYear",
                            selectedOption
                          )
                        }
                        placeholder="Select Academic Year"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.academicYear &&
                          validation.errors.academicYear
                            ? "select-error"
                            : ""
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
                      <Label>Semester Type</Label>
                      <Select
                        options={semType}
                        value={validation.values.semType}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("semType", selectedOption)
                        }
                        placeholder="Select Semester Type"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.semType &&
                          validation.errors.semType
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.semType &&
                        validation.errors.semType && (
                          <div className="text-danger">
                            {validation.errors.semType}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Semester</Label>
                      <Select
                        options={semester}
                        value={validation.values.semester}
                        onChange={(selectedOptions) =>
                          validation.setFieldValue("semester", selectedOptions)
                        }
                        placeholder="Select Semesters"
                        isMulti
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.semester &&
                          validation.errors.semester
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.semester &&
                        validation.errors.semester && (
                          <div className="text-danger">
                            {validation.errors.semester}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Stream</Label>
                      <Select
                        options={stream}
                        value={validation.values.stream}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("stream", selectedOption)
                        }
                        placeholder="Select Stream"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.stream && validation.errors.stream
                            ? "select-error"
                            : ""
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Department</Label>
                      <Select
                        options={department}
                        value={validation.values.department}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("department", selectedOption)
                        }
                        placeholder="Select Department"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.department &&
                          validation.errors.department
                            ? "select-error"
                            : ""
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Program Type</Label>
                      <Select
                        options={programType}
                        value={validation.values.programType}
                        onChange={(selectedOption) =>
                          validation.setFieldValue(
                            "programType",
                            selectedOption
                          )
                        }
                        placeholder="Select Program Type"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.programType &&
                          validation.errors.programType
                            ? "select-error"
                            : ""
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
                      <Select
                        options={program}
                        value={validation.values.program}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("program", selectedOption)
                        }
                        placeholder="Select Degree"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.program &&
                          validation.errors.program
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.program &&
                        validation.errors.program && (
                          <div className="text-danger">
                            {validation.errors.program}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Program</Label>
                      <Select
                        options={courses}
                        value={validation.values.courses}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("courses", selectedOption)
                        }
                        placeholder="Select Program"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.courses &&
                          validation.errors.courses
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.courses &&
                        validation.errors.courses && (
                          <div className="text-danger">
                            {validation.errors.courses}
                          </div>
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
