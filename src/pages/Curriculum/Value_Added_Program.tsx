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

const Value_Added_Program: React.FC = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bosData, setBosData] = useState<any[]>([]);
    const [selectedStream, setSelectedStream] = useState<any>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

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
            stream: null,
            noOfCredits: "",
            startDate: "",
            studentName: "",
            registerNumber: "",
            courseTitle: "",
            NumberOfStudentsEnrl: "",
            NumberOfStudentsCompleted: "",
            endDate: "",
            resourcePerson: "",
            hostingInstOrg: "",
        },
        validationSchema: Yup.object({
            academicYear: Yup.object().nullable().required("Please select academic year"),
            stream: Yup.object().nullable().required("Please select school"),
            noOfCredits: Yup.number()
                .typeError("Please enter a valid number")
                .min(0, "Percentage cannot be less than 0")
                .max(100, "Percentage cannot be more than 100")
                .required("Please enter revision percentage"),
            startDate: Yup.date().required("Please select conducted date"),
            studentName: Yup.string().required("Please enter student name"),
            registerNumber: Yup.string().required("Please enter register number"),
            courseTitle: Yup.string().required("Please enter course title"),
            NumberOfStudentsEnrl: Yup.number()
                .typeError("Please enter a valid number")
                .min(0, "Number of students enrolled cannot be less than 0")
                .required("Please enter number of students enrolled"),
            NumberOfStudentsCompleted: Yup.number()
                .typeError("Please enter a valid number")
                .min(0, "Number of students completed cannot be less than 0")
                .required("Please enter number of students completed"),
            endDate: Yup.date().required("Please select end date"),
            resourcePerson: Yup.string().required("Please enter resource person"),
            hostingInstOrg: Yup.string().required("Please enter hosting institution/ organization"),
        }),
        onSubmit: (values) => {
            console.log("Submitting form...", values);
        },
    });

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Value Added Program" breadcrumbItem="Value Added Program" />
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
                                            <Label>School/ Department </Label>
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

                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Student name</Label>
                                            <Input
                                                type="text"
                                                className={`form-control ${validation.touched.studentName && validation.errors.studentName ? "is-invalid" : ""}`}
                                                value={validation.values.studentName}
                                                onChange={(e) => validation.setFieldValue("studentName", e.target.value)}
                                                placeholder="Enter Student name"
                                            />
                                            {validation.touched.studentName && validation.errors.studentName && (
                                                <div className="text-danger">{validation.errors.studentName}</div>
                                            )}
                                        </div>
                                    </Col>

                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Register number </Label>
                                            <Input
                                                type="number"
                                                className={`form-control ${validation.touched.registerNumber && validation.errors.registerNumber ? "is-invalid" : ""}`}
                                                value={validation.values.registerNumber}
                                                onChange={(e) => validation.setFieldValue("registerNumber", e.target.value)}
                                                placeholder="Enter Register number"
                                            />
                                            {validation.touched.registerNumber && validation.errors.registerNumber && (
                                                <div className="text-danger">{validation.errors.registerNumber}</div>
                                            )}
                                        </div>
                                    </Col>

                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Course title </Label>
                                            <Input
                                                type="text"
                                                className={`form-control ${validation.touched.courseTitle && validation.errors.courseTitle ? "is-invalid" : ""}`}
                                                value={validation.values.courseTitle}
                                                onChange={(e) => validation.setFieldValue("courseTitle", e.target.value)}
                                                placeholder="Enter Course title"
                                            />
                                            {validation.touched.courseTitle && validation.errors.courseTitle && (
                                                <div className="text-danger">{validation.errors.courseTitle}</div>
                                            )}
                                        </div>
                                    </Col>

                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>No of students enrolled</Label>
                                            <Input
                                                type="number"
                                                className={`form-control ${validation.touched.NumberOfStudentsEnrl && validation.errors.NumberOfStudentsEnrl ? "is-invalid" : ""}`}
                                                value={validation.values.NumberOfStudentsEnrl}
                                                onChange={(e) => validation.setFieldValue("NumberOfStudentsEnrl", e.target.value)}
                                                placeholder="Enter students enrolled"
                                            />
                                            {validation.touched.NumberOfStudentsEnrl && validation.errors.NumberOfStudentsEnrl && (
                                                <div className="text-danger">{validation.errors.NumberOfStudentsEnrl}</div>
                                            )}
                                        </div>
                                    </Col>

                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>No of students completed</Label>
                                            <Input
                                                type="number"
                                                className={`form-control ${validation.touched.NumberOfStudentsCompleted && validation.errors.NumberOfStudentsCompleted ? "is-invalid" : ""}`}
                                                value={validation.values.NumberOfStudentsCompleted}
                                                onChange={(e) => validation.setFieldValue("NumberOfStudentsCompleted", e.target.value)}
                                                placeholder="Enter students completed"
                                            />
                                            {validation.touched.NumberOfStudentsCompleted && validation.errors.NumberOfStudentsCompleted && (
                                                <div className="text-danger">{validation.errors.NumberOfStudentsCompleted}</div>
                                            )}
                                        </div>
                                    </Col>

                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Start date </Label>
                                            <Input
                                                type="date"
                                                className={`form-control ${validation.touched.startDate && validation.errors.startDate ? "is-invalid" : ""}`}
                                                value={validation.values.startDate}
                                                onChange={(e) => validation.setFieldValue("startDate", e.target.value)}
                                            />
                                            {validation.touched.startDate && validation.errors.startDate && (
                                                <div className="text-danger">{validation.errors.startDate}</div>
                                            )}
                                        </div>
                                    </Col>

                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>End date </Label>
                                            <Input
                                                type="date"
                                                className={`form-control ${validation.touched.endDate && validation.errors.endDate ? "is-invalid" : ""}`}
                                                value={validation.values.endDate}
                                                onChange={(e) => validation.setFieldValue("endDate", e.target.value)}
                                            />
                                            {validation.touched.endDate && validation.errors.endDate && (
                                                <div className="text-danger">{validation.errors.endDate}</div>
                                            )}
                                        </div>
                                    </Col>

                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Resource person </Label>
                                            <Input
                                                type="text"
                                                className={`form-control ${validation.touched.resourcePerson && 
                                                    validation.errors.resourcePerson ? "is-invalid" : ""}`}
                                                value={validation.values.resourcePerson}
                                                onChange={(e) => validation.setFieldValue("resourcePerson", e.target.value)}
                                                placeholder="Enter Resource Person"
                                            />
                                            {validation.touched.resourcePerson && validation.errors.resourcePerson && (
                                                <div className="text-danger">{validation.errors.resourcePerson}</div>
                                            )}
                                        </div>
                                    </Col>

                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Hosting institution/ organization</Label>
                                            <Input
                                                type="text"
                                                className={`form-control ${validation.touched.hostingInstOrg && validation.errors.hostingInstOrg ? "is-invalid" : ""}`}
                                                value={validation.values.hostingInstOrg}
                                                onChange={(e) => validation.setFieldValue("hostingInstOrg", e.target.value)}
                                                placeholder="Enter Course title"
                                            />
                                            {validation.touched.hostingInstOrg && validation.errors.hostingInstOrg && (
                                                <div className="text-danger">{validation.errors.hostingInstOrg}</div>
                                            )}
                                        </div>
                                    </Col>

                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>No of credits</Label>
                                            <Input
                                                type="number"
                                                className={`form-control ${validation.touched.noOfCredits && validation.errors.noOfCredits ? "is-invalid" : ""}`}
                                                value={validation.values.noOfCredits}
                                                onChange={(e) => validation.setFieldValue("noOfCredits", e.target.value)}
                                                placeholder="Enter Revision Percentage"
                                            />
                                            {validation.touched.noOfCredits && validation.errors.noOfCredits && (
                                                <div className="text-danger">{validation.errors.noOfCredits}</div>
                                            )}
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

export default Value_Added_Program;