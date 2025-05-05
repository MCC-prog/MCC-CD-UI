import axios from 'axios';
import Breadcrumb from 'Components/Common/Breadcrumb';
import AcademicYearDropdown from 'Components/DropDowns/AcademicYearDropdown';
import DegreeDropdown from 'Components/DropDowns/DegreeDropdown';
import DepartmentDropdown from 'Components/DropDowns/DepartmentDropdown';
import Select from "react-select";
import StreamDropdown from 'Components/DropDowns/StreamDropdown';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Card, CardBody, Col, Container, Input, Label, Modal, ModalBody, ModalHeader, Row, Table } from 'reactstrap';
import * as Yup from "yup";

const Teachers_Details: React.FC = () => {

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

    const dropdownStyles = {
        menu: (provided: any) => ({
            ...provided,
            overflowY: "auto", // Enable scrolling for additional options
        }),
        menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
    };

    const facultyType = [
        { value: "FT", label: "Full-Time" },
        { value: "POP", label: "Proffessor of Practice" },
        { value: "GF", label: "Guest Faculty" },
        { value: "VF", label: "Visiting Faculty" },
    ];

    const designationType = [
        { value: "Lecturer", label: "Lecturer" },
        { value: "Assistant Proffessor", label: "Assistant Proffessor" },
        { value: "Associate Proffessor", label: "Associate Proffessor" },
    ];

    const validation = useFormik({
        initialValues: {
            facultyType: null,
            designation: null,
            stream: null,
            department: null as { value: string; label: string } | null,
            otherDepartment: "",
            academicExp: "",
            industryExp: "",
            name: "",
            qualification: "",
            dateOfJoining: "",
            vidwaanId: ""
        },
        validationSchema: Yup.object({
            facultyType: Yup.object().nullable().required("Please select faculty type"),
            name: Yup.string().required("Please enter name"),
            stream: Yup.object().nullable().required("Please select school"),
            department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
            otherDepartment: Yup.string().when("department", (department: any, schema) => {
                return department?.value === "Others"
                    ? schema.required("Please specify the department")
                    : schema;
            }),
            designation: Yup.object().nullable().required("Please select designation"),
            industryExp: Yup.number()
                .typeError("Please enter a valid number")
                .min(0, "Percentage cannot be less than 0")
                .max(100, "Percentage cannot be more than 100")
                .required("Please enter industry experience"),
            academicExp: Yup.number()
                .typeError("Please enter a valid number")
                .min(0, "Percentage cannot be less than 0")
                .max(100, "Percentage cannot be more than 100")
                .required("Please enter academic experience"),
            qualification: Yup.string().required("Please enter qualification"),
            vidwaanId: Yup.string().required("Please enter vidwaanId"),
            dateOfJoining: Yup.date().required("Please select date")
        }),
        onSubmit: (values) => {
            console.log("Submitting form...", values);
        },
    });

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Teacher's Details" breadcrumbItem="Teacher's Details" />
                    <Card>
                        <CardBody>
                            <form onSubmit={validation.handleSubmit}>
                                <Row>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Faculty Type</Label>
                                            <Select
                                                options={facultyType}
                                                value={validation.values.facultyType}
                                                onChange={(selectedOptions) =>
                                                    validation.setFieldValue(
                                                        "facultyType",
                                                        selectedOptions
                                                    )
                                                }
                                                placeholder="Select Faculty Type"
                                                styles={dropdownStyles}
                                                menuPortalTarget={document.body}
                                                className={
                                                    validation.touched.facultyType &&
                                                        validation.errors.facultyType
                                                        ? "select-error"
                                                        : ""
                                                }
                                            />
                                            {validation.touched.facultyType &&
                                                validation.errors.facultyType && (
                                                    <div className="text-danger">
                                                        {validation.errors.facultyType}
                                                    </div>
                                                )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Name</Label>
                                            <Input
                                                type="text"
                                                className={`form-control ${validation.touched.name && validation.errors.name ? "is-invalid" : ""}`}
                                                value={validation.values.name}
                                                onChange={(e) => validation.setFieldValue("name", e.target.value)}
                                                placeholder="Enter Name"
                                            />
                                            {validation.touched.name && validation.errors.name && (
                                                <div className="text-danger">{validation.errors.name}</div>
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
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Designation</Label>
                                            <Select
                                                options={designationType}
                                                value={validation.values.designation}
                                                onChange={(selectedOptions) =>
                                                    validation.setFieldValue(
                                                        "designation",
                                                        selectedOptions
                                                    )
                                                }
                                                placeholder="Select designation"
                                                styles={dropdownStyles}
                                                menuPortalTarget={document.body}
                                                className={
                                                    validation.touched.designation &&
                                                        validation.errors.designation
                                                        ? "select-error"
                                                        : ""
                                                }
                                            />
                                            {validation.touched.designation &&
                                                validation.errors.designation && (
                                                    <div className="text-danger">
                                                        {validation.errors.designation}
                                                    </div>
                                                )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Qualification</Label>
                                            <Input
                                                type="text"
                                                className={`form-control ${validation.touched.qualification && validation.errors.qualification ? "is-invalid" : ""}`}
                                                value={validation.values.qualification}
                                                onChange={(e) => validation.setFieldValue("qualification", e.target.value)}
                                                placeholder="Enter qualification"
                                            />
                                            {validation.touched.qualification && validation.errors.qualification && (
                                                <div className="text-danger">{validation.errors.qualification}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Date of Joining</Label>
                                            <Input
                                                type="date"
                                                className={`form-control ${validation.touched.dateOfJoining && validation.errors.dateOfJoining ? "is-invalid" : ""}`}
                                                value={validation.values.dateOfJoining}
                                                onChange={(e) => validation.setFieldValue("dateOfJoining", e.target.value)}
                                                placeholder="Enter dateOfJoining"
                                            />
                                            {validation.touched.dateOfJoining && validation.errors.dateOfJoining && (
                                                <div className="text-danger">{validation.errors.dateOfJoining}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Academic Experience</Label>
                                            <Input
                                                type="number"
                                                className={`form-control ${validation.touched.academicExp && validation.errors.academicExp ? "is-invalid" : ""}`}
                                                value={validation.values.academicExp}
                                                onChange={(e) => validation.setFieldValue("academicExp", e.target.value)}
                                                placeholder="Enter academic experience"
                                            />
                                            {validation.touched.academicExp && validation.errors.academicExp && (
                                                <div className="text-danger">{validation.errors.academicExp}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Industry Experience</Label>
                                            <Input
                                                type="number"
                                                className={`form-control ${validation.touched.industryExp && validation.errors.industryExp ? "is-invalid" : ""}`}
                                                value={validation.values.industryExp}
                                                onChange={(e) => validation.setFieldValue("industryExp", e.target.value)}
                                                placeholder="Enter industry experience"
                                            />
                                            {validation.touched.industryExp && validation.errors.industryExp && (
                                                <div className="text-danger">{validation.errors.industryExp}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>VIDWAAN ID</Label>
                                            <Input
                                                type="text"
                                                className={`form-control ${validation.touched.vidwaanId && validation.errors.vidwaanId ? "is-invalid" : ""}`}
                                                value={validation.values.vidwaanId}
                                                onChange={(e) => validation.setFieldValue("vidwaanId", e.target.value)}
                                                placeholder="Enter vidwaanId"
                                            />
                                            {validation.touched.vidwaanId && validation.errors.vidwaanId && (
                                                <div className="text-danger">{validation.errors.vidwaanId}</div>
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

export default Teachers_Details;