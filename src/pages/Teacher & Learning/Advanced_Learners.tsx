import Breadcrumb from "Components/Common/Breadcrumb";
import { useFormik } from "formik";
import React, { useState } from "react";
import Select from "react-select";
import * as Yup from "yup";
import { Card, CardBody, Col, Container, Form, Input, Label, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import { Link } from "react-router-dom";
import classNames from "classnames";

const Advanced_Learners: React.FC = () => {
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
        { value: "T", label: "Theory" },
        { value: "P", label: "Practical" },
    ]
    const projectType = [
        { value: "In", label: "Internal" },
        { value: "Ex", label: "External" },
    ]
    const Type = [
        { value: "Funded", label: "Funded" },
        { value: "Non-Funded", label: "Non-Funded" },
    ]
    const programType = [
        { value: "T", label: "UG" },
        { value: "P", label: "PG" },
    ]
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
            semType: null,
            projectType: null,
            Type: null,
            semester: [],
            stream: null,
            department: null as { value: string; label: string } | null,
            programType: null,
            programName: "",
            courseTitile: null,
            mentorShip: null,
            file: null,
        },
        validationSchema: Yup.object({
            academicYear: Yup.object().nullable().required("Please select academic year"),
            semType: Yup.object().nullable().required("Please select semester type"),
            semester: Yup.array().min(1, "Please select at least one semester").required("Please select semester"),
            projectType: Yup.object().nullable().required("Please select project type"),
            Type: Yup.object().nullable().required("Please select type"),
            stream: Yup.object().nullable().required("Please select stream"),
            department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
            programType: Yup.object().nullable().required("Please select programType"),
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
                        breadcrumbItem="Advanced Learners"
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
                                                    validation.setFieldValue(
                                                        "semType",
                                                        selectedOption
                                                    )
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
                                                    validation.setFieldValue("programType", selectedOption)
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
                                    <div className="mb-3 mt-3 d-grid">
                                        <button className="btn btn-primary toggle-wizard-button" onClick={toggleWizard}>
                                            Advance Learners Type
                                        </button>
                                    </div>
                                    {showWizard && (
                                        <div className="wizard clearfix">
                                            <div
                                                className="steps"
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                                                    gap: "10px"
                                                }}
                                            >
                                                {[1, 2].map((tab) => (
                                                    <button
                                                        key={tab}
                                                        className={`step-button ${activeTab === tab ? "active" : ""}`}
                                                        onClick={() => toggleTab(tab)}
                                                    >
                                                        {tab}. {tab === 1 ? "Research Project" : "Peer Teaching"}
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
                                                                    <Input type="text" placeholder="Enter Project Title" />
                                                                </div>
                                                            </Col>
                                                            <Col lg="4">
                                                                <div className="mb-3">
                                                                    <Label>Duration</Label>
                                                                    <Input type="text" placeholder="Enter Duration" />
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
                                                                    <Input type="text" placeholder="Enter Guide Name" />
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
                                                                    <Input type="text" placeholder="Enter Amount" />
                                                                </div>
                                                            </Col>
                                                            <Col sm={4}>
                                                                <div className="mb-3">
                                                                    <Label htmlFor="formFile" className="form-label">
                                                                        Project Sanction Letter (Upload file)
                                                                    </Label>
                                                                    <Input
                                                                        className={`form-control ${validation.touched.file && validation.errors.file
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
                                                                    {validation.touched.file && validation.errors.file && (
                                                                        <div className="text-danger">
                                                                            {validation.errors.file}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </Col>
                                                            <Col sm={4}>
                                                                <div className="mb-3">
                                                                    <Label htmlFor="formFile" className="form-label">
                                                                        Synopsis Letter (Upload file)
                                                                    </Label>
                                                                    <Input
                                                                        className={`form-control ${validation.touched.file && validation.errors.file
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
                                                                    {validation.touched.file && validation.errors.file && (
                                                                        <div className="text-danger">
                                                                            {validation.errors.file}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </Col>
                                                            <Col lg={4}>
                                                                <div className="mb-3">
                                                                    <Label>Project Sanction Letter (Download)</Label>
                                                                    <div>
                                                                        <a href="/templateFiles/bos.pdf" download className="btn btn-primary btn-sm" >
                                                                            Download Template
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                            <Col lg={4}>
                                                                <div className="mb-3">
                                                                    <Label>Synopsis Letter (Download)</Label>
                                                                    <div>
                                                                        <a href="/templateFiles/bos.pdf" download className="btn btn-primary btn-sm" >
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
                                                                            validation.setFieldValue("courseTitile", selectedOption)
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
                                                                            validation.setFieldValue("mentorShip", selectedOption)
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
                                                                <Input type="text" placeholder="Enter Register Number" />
                                                            </Col>
                                                            <Col lg="4">
                                                                <Label>Teacher Co-Ordinator</Label>
                                                                <Input type="text" placeholder="Enter Teacher Co-Ordinator" />
                                                            </Col>
                                                            <Col sm={4}>
                                                                <div className="mb-3">
                                                                    <Label htmlFor="formFile" className="form-label">
                                                                        Peer Teaching (Upload file)
                                                                    </Label>
                                                                    <Input
                                                                        className={`form-control ${validation.touched.file && validation.errors.file
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
                                                                    {validation.touched.file && validation.errors.file && (
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
                                                                        <a href="/templateFiles/bos.pdf" download className="btn btn-primary btn-sm" >
                                                                            Download Template
                                                                        </a>
                                                                    </div>
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


export default Advanced_Learners;