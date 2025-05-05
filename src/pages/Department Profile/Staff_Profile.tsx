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

const Staff_Profile: React.FC = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bosData, setBosData] = useState<any[]>([]);
    const [selectedStream, setSelectedStream] = useState<any>(null);

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
            noOfStaff: "",
            fullTime: "",
            partTime: "",
            guestFaculty: "",
            professorOfPractice: "",
            stream: null,
        },
        validationSchema: Yup.object({
            academicYear: Yup.object().nullable().required("Please select academic year"),
            stream: Yup.object().nullable().required("Please select stream"),
            noOfStaff: Yup.string().required("Please enter no of staff"),
            fullTime: Yup.string().required("Please enter full time"),
            partTime: Yup.string().required("Please enter part time"),
            guestFaculty: Yup.string().required("Please enter guest faculty"),
            professorOfPractice: Yup.string().required("Please enter professor of practice"),
        }),
        onSubmit: (values) => {
            console.log("Submitting form...", values);
        },
    });

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Staff Profile" breadcrumbItem="Staff Profile" />
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
                                            <Label>School</Label>
                                            <StreamDropdown
                                                value={validation.values.stream}
                                                onChange={(selectedOption) => {
                                                    validation.setFieldValue("stream", selectedOption);
                                                    setSelectedStream(selectedOption);
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

                                    <Col sm={4}>
                                        <div className="mb-3">
                                            <Label htmlFor="formFile" className="form-label">No of Staff</Label>
                                            <Input
                                                className={`form-control ${validation.touched.noOfStaff && validation.errors.noOfStaff ? "is-invalid" : ""}`}
                                                type="text"
                                                id="noOfStaff"
                                                onChange={(e) => validation.setFieldValue("noOfStaff", e.target.value)}
                                                placeholder="Enter no of staff"
                                            />
                                            {validation.touched.noOfStaff && validation.errors.noOfStaff && (
                                                <div className="text-danger">{validation.errors.noOfStaff}</div>
                                            )}
                                        </div>
                                    </Col>

                                    <Col sm={4}>
                                        <div className="mb-3">
                                            <Label htmlFor="formFile" className="form-label">Full Time</Label>
                                            <Input
                                                className={`form-control ${validation.touched.fullTime && validation.errors.fullTime ? "is-invalid" : ""}`}
                                                type="text"
                                                id="fullTime"
                                                onChange={(e) => validation.setFieldValue("fullTime", e.target.value)}
                                                placeholder="Enter full time"
                                            />
                                            {validation.touched.fullTime && validation.errors.fullTime && (
                                                <div className="text-danger">{validation.errors.fullTime}</div>
                                            )}
                                        </div>
                                    </Col>

                                    <Col sm={4}>
                                        <div className="mb-3">
                                            <Label htmlFor="formFile" className="form-label">Part Time</Label>
                                            <Input
                                                className={`form-control ${validation.touched.partTime && validation.errors.partTime ? "is-invalid" : ""}`}
                                                type="text"
                                                id="partTime"
                                                onChange={(e) => validation.setFieldValue("partTime", e.target.value)}
                                                placeholder="Enter part time"
                                            />
                                            {validation.touched.partTime && validation.errors.partTime && (
                                                <div className="text-danger">{validation.errors.partTime}</div>
                                            )}
                                        </div>
                                    </Col>

                                    <Col sm={4}>
                                        <div className="mb-3">
                                            <Label htmlFor="formFile" className="form-label">Guest Faculty</Label>
                                            <Input
                                                className={`form-control ${validation.touched.guestFaculty && validation.errors.guestFaculty ? "is-invalid" : ""}`}
                                                type="text"
                                                id="guestFaculty"
                                                onChange={(e) => validation.setFieldValue("guestFaculty", e.target.value)}
                                                placeholder="Enter guest faculty"
                                            />
                                            {validation.touched.guestFaculty && validation.errors.guestFaculty && (
                                                <div className="text-danger">{validation.errors.guestFaculty}</div>
                                            )}
                                        </div>
                                    </Col>

                                    <Col sm={4}>
                                        <div className="mb-3">
                                            <Label htmlFor="formFile" className="form-label">Professor of Practice</Label>
                                            <Input
                                                className={`form-control ${validation.touched.professorOfPractice && validation.errors.professorOfPractice ? "is-invalid" : ""}`}
                                                type="text"
                                                id="professorOfPractice"
                                                onChange={(e) => validation.setFieldValue("professorOfPractice", e.target.value)}
                                                placeholder="Enter professor of practice"
                                            />
                                            {validation.touched.professorOfPractice && validation.errors.professorOfPractice && (
                                                <div className="text-danger">{validation.errors.professorOfPractice}</div>
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
                                            {/* <button
                                                className="btn btn-primary"
                                                type="button"
                                                onClick={handleListBosClick}
                                            >
                                                List BOS
                                            </button> */}
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

export default Staff_Profile;