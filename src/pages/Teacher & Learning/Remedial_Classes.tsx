import Breadcrumb from "Components/Common/Breadcrumb";
import { useFormik } from "formik";
import React, { useState } from "react";
import Select from "react-select";
import * as Yup from "yup";
import { Card, CardBody, Col, Container, Form, Input, Label, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";

const Remedial_Classes: React.FC = () => {
    
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
            courseTitile: "",
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
                        breadcrumbItem="Remedial Classes"
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
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Course</Label>
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


export default Remedial_Classes;