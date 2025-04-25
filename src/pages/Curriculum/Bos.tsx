import axios from 'axios';
import Breadcrumb from 'Components/Common/Breadcrumb';
import AcademicYearDropdown from 'Components/DropDowns/AcademicYearDropdown';
import DegreeDropdown from 'Components/DropDowns/DegreeDropdown';
import DepartmentDropdown from 'Components/DropDowns/DepartmentDropdown';
import ProgramDropdown from 'Components/DropDowns/ProgramDropdown';
import ProgramTypeDropdown from 'Components/DropDowns/ProgramTypeDropdown';
import SemesterDropdowns from 'Components/DropDowns/SemesterDropdowns';
import StreamDropdown from 'Components/DropDowns/StreamDropdown';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Card, CardBody, Col, Container, Input, Label, Modal, ModalBody, ModalHeader, Row, Table } from 'reactstrap';
import * as Yup from "yup";

const Bos: React.FC = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bosData, setBosData] = useState<any[]>([]);
    const [selectedStream, setSelectedStream] = useState<any>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
    const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
    const [selectedDegree, setSelectedDegree] = useState<any>(null);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    // Fetch BOS data from the backend
    const fetchBosData = async () => {
        try {
            const response = await axios.get("/api/bos"); // Replace with your backend API endpoint
            setBosData(response.data);
        } catch (error) {
            console.error("Error fetching BOS data:", error);
        }
    };

    // Open the modal and fetch data
    const handleListBosClick = () => {
        toggleModal();
        fetchBosData();
    };

    const handleEdit = (id: string) => {
        console.log("Edit BOS with ID:", id);
        // Add your edit logic here
    };

    const handleDelete = (id: string) => {
        console.log("Delete BOS with ID:", id);
        // Add your delete logic here
    };

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
            revisionPercentage: "",
            conductedDate: "",
        },
        validationSchema: Yup.object({
            academicYear: Yup.object().nullable().required("Please select academic year"),
            semesterType: Yup.object()
                .nullable()
                .required("Please select a semester type"), // Single object for single-select
            semesterNo: Yup.array()
                .min(1, "Please select at least one semester number")
                .required("Please select semester numbers"),
            stream: Yup.object().nullable().required("Please select school"),
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
                                                    Sample BOS Template
                                                </a>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg={12}>
                                        <div className="mt-3 d-flex justify-content-between">
                                            <button className="btn btn-primary" type="submit">
                                                Save
                                            </button>
                                            <button
                                                className="btn btn-primary"
                                                type="button"
                                                onClick={handleListBosClick}
                                            >
                                                List BOS
                                            </button>
                                        </div>
                                    </Col>
                                </Row>
                            </form>
                        </CardBody>
                    </Card>
                </Container>
                {/* Modal for Listing BOS */}
                <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
                    <ModalHeader toggle={toggleModal}>List BOS</ModalHeader>
                    <ModalBody>
                        <Table bordered>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Degree</th>
                                    <th>Program</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bosData.length > 0 ? (
                                    bosData.map((bos, index) => (
                                        <tr key={bos.id}>
                                            <td>{index + 1}</td>
                                            <td>{bos.degree}</td>
                                            <td>{bos.program}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-warning me-2"
                                                    onClick={() => handleEdit(bos.id)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(bos.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center">
                                            No BOS data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </ModalBody>
                </Modal>
            </div>
        </React.Fragment>
    );
};

export default Bos;