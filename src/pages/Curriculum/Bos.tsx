import Breadcrumb from 'Components/Common/Breadcrumb';
import AcademicYearDropdown from 'Components/DropDowns/AcademicYearDropdown';
import DegreeDropdown from 'Components/DropDowns/DegreeDropdown';
import DepartmentDropdown from 'Components/DropDowns/DepartmentDropdown';
import ProgramDropdown from 'Components/DropDowns/ProgramDropdown';
import ProgramTypeDropdown from 'Components/DropDowns/ProgramTypeDropdown';
import SemesterNoDropdown from 'Components/DropDowns/SemesterNoDropdown';
import SemesterTypeDropdown from 'Components/DropDowns/SemesterTypeDropdown';
import StreamDropdown from 'Components/DropDowns/StreamDropdown';
import { useFormik } from 'formik';
import React from 'react';
import { Card, CardBody, Col, Container, Input, Label, Row } from 'reactstrap';
import * as Yup from "yup";

const Bos: React.FC = () => {
    const dropdownStyles = {
        menu: (provided: any) => ({
            ...provided,
            overflowY: "auto",
        }),
        menuPortal: (base: any) => ({ ...base, zIndex: 9999 })
    };

    const validation = useFormik({
        initialValues: {
            academicYear: null,
            semesterType: [],
            semesterNo: [],
            stream: null,
            department: null as { value: string; label: string } | null,
            otherDepartment: "",
            file: null,
            programType: null,
            degree: null,
            program: null,
            revisionPercentage: "",
            conductedDate: "",
        },
        validationSchema: Yup.object({
            academicYear: Yup.object().nullable().required("Please select academic year"),
            semesterType: Yup.array().min(1, "Please select at least one semester").required("Please select semester"),
            semesterNo: Yup.array().min(1, "Please select at least one semester").required("Please select semester"),
            stream: Yup.object().nullable().required("Please select stream"),
            department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
            otherDepartment: Yup.string().when("department", (department: any, schema) => {
                return department?.value === "Others"
                    ? schema.required("Please specify the department")
                    : schema;
            }),
            file: Yup.mixed()
                .required("Please upload a file")
                .test("fileSize", "File size is too large", (value: any) => {
                    return value && value.size <= 2 * 1024 * 1024; // 2MB limit
                })
                .test("fileType", "Unsupported file format", (value: any) => {
                    return value && ["application/pdf", "image/jpeg", "image/png"].includes(value.type);
                }),
            programType: Yup.object().nullable().required("Please select program type"),
            degree: Yup.object().nullable().required("Please select degree"),
            program: Yup.object().nullable().required("Please select program"),
            revisionPercentage: Yup.number()
                .typeError("Please enter a valid number")
                .min(0, "Percentage cannot be less than 0")
                .max(100, "Percentage cannot be more than 100")
                .required("Please enter revision percentage"),
            conductedDate: Yup.date().required("Please select conducted date"),
        }),
        onSubmit: (values) => {
            console.log("Submitting form...", values);
        },
    });

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="BOS" breadcrumbItem="BOS" />
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
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Semester Type</Label>
                                            <SemesterTypeDropdown
                                                value={validation.values.semesterType}
                                                onChange={(selectedOption) =>
                                                    validation.setFieldValue("semesterType", selectedOption)
                                                }
                                                isInvalid={
                                                    validation.touched.semesterType &&
                                                    !!validation.errors.semesterType
                                                }
                                            />
                                            {validation.touched.semesterType && validation.errors.semesterType && (
                                                <div className="text-danger">{validation.errors.semesterType}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Semester No.</Label>
                                            <SemesterNoDropdown
                                                value={validation.values.semesterNo}
                                                onChange={(selectedOption) =>
                                                    validation.setFieldValue("semesterNo", selectedOption)
                                                }
                                                isInvalid={
                                                    validation.touched.semesterNo &&
                                                    !!validation.errors.semesterNo
                                                }
                                            />
                                            {validation.touched.semesterNo && validation.errors.semesterNo && (
                                                <div className="text-danger">{validation.errors.semesterNo}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Stream</Label>
                                            <StreamDropdown
                                                value={validation.values.stream}
                                                onChange={(selectedOption) =>
                                                    validation.setFieldValue("stream", selectedOption)
                                                }
                                                isInvalid={
                                                    validation.touched.stream &&
                                                    !!validation.errors.stream
                                                }
                                            />
                                            {validation.touched.stream && validation.errors.stream && (
                                                <div className="text-danger">{validation.errors.stream}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Department</Label>
                                            <DepartmentDropdown
                                                value={validation.values.department}
                                                onChange={(selectedOption) =>
                                                    validation.setFieldValue("department", selectedOption)
                                                }
                                                isInvalid={
                                                    validation.touched.department &&
                                                    !!validation.errors.department
                                                }
                                            />
                                            {validation.touched.department && validation.errors.department && (
                                                <div className="text-danger">{validation.errors.department}</div>
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
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Program Type</Label>
                                            <ProgramTypeDropdown
                                                value={validation.values.programType}
                                                onChange={(selectedOption) =>
                                                    validation.setFieldValue("programType", selectedOption)
                                                }
                                                isInvalid={
                                                    validation.touched.programType &&
                                                    !!validation.errors.programType
                                                }
                                            />
                                            {validation.touched.programType && validation.errors.programType && (
                                                <div className="text-danger">{validation.errors.programType}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Degree</Label>
                                            <DegreeDropdown
                                                value={validation.values.degree}
                                                onChange={(selectedOption) =>
                                                    validation.setFieldValue("degree", selectedOption)
                                                }
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
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Conducted Date</Label>
                                            <Input
                                                type="date"
                                                className={`form-control ${validation.touched.conductedDate && validation.errors.conductedDate ? "is-invalid" : ""}`}
                                                value={validation.values.conductedDate}
                                                onChange={(e) => validation.setFieldValue("conductedDate", e.target.value)}
                                            />
                                            {validation.touched.conductedDate && validation.errors.conductedDate && (
                                                <div className="text-danger">{validation.errors.conductedDate}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Revision Percentage</Label>
                                            <Input
                                                type="number"
                                                className={`form-control ${validation.touched.revisionPercentage && validation.errors.revisionPercentage ? "is-invalid" : ""}`}
                                                value={validation.values.revisionPercentage}
                                                onChange={(e) => validation.setFieldValue("revisionPercentage", e.target.value)}
                                                placeholder="Enter Revision Percentage"
                                            />
                                            {validation.touched.revisionPercentage && validation.errors.revisionPercentage && (
                                                <div className="text-danger">{validation.errors.revisionPercentage}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col sm={4}>
                                        <div className="mb-3">
                                            <Label htmlFor="formFile" className="form-label">Upload MOM</Label>
                                            <Input
                                                className={`form-control ${validation.touched.file && validation.errors.file ? "is-invalid" : ""}`}
                                                type="file"
                                                id="formFile"
                                                onChange={(event) => {
                                                    validation.setFieldValue("file", event.currentTarget.files ? event.currentTarget.files[0] : null);
                                                }}
                                            />
                                            {validation.touched.file && validation.errors.file && (
                                                <div className="text-danger">{validation.errors.file}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Download Template</Label>
                                            <div>
                                                <a href="/templateFiles/bos.pdf" download className="btn btn-primary btn-sm" >
                                                    PDF File
                                                </a>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <div className="mt-3 d-grid">
                                    <button className="btn btn-primary btn-block" type="submit">
                                        Save Application
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

export default Bos;