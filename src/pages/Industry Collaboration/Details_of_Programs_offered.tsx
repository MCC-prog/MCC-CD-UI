import Breadcrumb from 'Components/Common/Breadcrumb';
import AcademicYearDropdown from 'Components/DropDowns/AcademicYearDropdown';
import DegreeDropdown from 'Components/DropDowns/DegreeDropdown';
import DepartmentDropdown from 'Components/DropDowns/DepartmentDropdown';
import ProgramDropdown from 'Components/DropDowns/ProgramDropdown';
import ProgramTypeDropdown from 'Components/DropDowns/ProgramTypeDropdown';
import SemesterDropdowns from 'Components/DropDowns/SemesterDropdowns';
import StreamDropdown from 'Components/DropDowns/StreamDropdown';
import { ToastContainer } from "react-toastify";
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Card, CardBody, Col, Container, Input, Label, Modal, ModalBody, ModalHeader, Row, Table } from 'reactstrap';
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const api = new APIClient();

const Details_of_Programs_offered: React.FC = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailsProgramOfferedData, setDetailsProgramOfferedData] = useState<any[]>([]);
    const [selectedStream, setSelectedStream] = useState<any>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
    const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
    const [selectedDegree, setSelectedDegree] = useState<any>(null);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    // Fetch DetailsProgramOffered data from the backend
    const fetchDetailsProgramOfferedData = async () => {
        try {
            const response = await api.get("/detailsProgramOffered/getAllDetailsProgramOffered", '');
            setDetailsProgramOfferedData(response.data);
            console.log("Details of Program Offered data fetched successfully:", response.data);
        } catch (error) {
            console.error("Error fetching Details Of Program Offered data:", error);
        }
    };

    // Open the modal and fetch data
    const handleListDetailsProgramOfferedClick = () => {
        toggleModal();
        fetchDetailsProgramOfferedData();
    };

    const handleEdit = (id: string) => {
        console.log("Edit DetailsProgramOffered with ID:", id);
        // Add your edit logic here
    };

    const handleDelete = (id: string) => {
        console.log("Delete DetailsProgramOffered with ID:", id);
        // Add your delete logic here
    };

    const validation = useFormik({
        initialValues: {
            academicYear: null as { value: string; label: string } | null,
            stream: null as { value: string; label: string } | null,
            department: null as { value: string; label: string } | null,
            programType: null as { value: string; label: string } | null,
            degree: null as { value: string; label: string } | null,
            program: null as { value: string; label: string } | null,
            agencyName: "",
            numberOfStudent: "",
            duration: "",
            file: null,
        },
        validationSchema: Yup.object({
            academicYear: Yup.object<{ value: string; label: string }>().nullable().required("Please select academic year"),
            stream: Yup.object<{ value: string; label: string }>().nullable().required("Please select school"),
            department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
            programType: Yup.object<{ value: string; label: string }>().nullable().required("Please select program type"),
            degree: Yup.object().nullable().required("Please select degree"),
            program: Yup.object<{ value: string; label: string }>().nullable().required("Please select program"),
            agencyName: Yup.string().required("Please select Agency Name"),
            numberOfStudent: Yup.number()
                .typeError("Please enter a valid number")
                .min(0, "Percentage cannot be less than 0")
                .max(100, "Percentage cannot be more than 100")
                .required("Please enter revision percentage"),
            duration: Yup.string().required("Please select Duration(in Month)"),
            file: Yup.mixed()
                .required("Please upload a file")
                .test("fileSize", "File size is too large", (value: any) => {
                    return value && value.size <= 2 * 1024 * 1024; // 2MB limit
                })
                .test("fileType", "Unsupported file format", (value: any) => {
                    return value && ["application/pdf", "image/jpeg", "image/png"].includes(value.type);
                }),
        }),
        onSubmit: async (values, { resetForm }) => {

            // Create FormData object
            const formData = new FormData();

            // Append fields to FormData
            formData.append("academicYear", values.academicYear?.value || "");
            formData.append("streamId", values.stream?.value || "");
            formData.append("departmentId", values.department?.value || "");
            formData.append("programTypeId", values.programType?.value || "");
            formData.append("programId", values.degree?.value || "");
            formData.append("courseIds", "1,2");
            formData.append("agencyName", values.agencyName || "");
            formData.append("numberOfStudent", values.numberOfStudent || "");
            formData.append("duration", values.duration || "");
             
            // Append the file
            if (values.file) {
                formData.append("mou", values.file);
            } else {
                console.error("No file selected");
            }

            try {
                const response = await api.create("/detailsProgramOffered/saveDetailsProgramOffered", formData);
                // Display success message
                toast.success(response.message || "Details of Program Offered added successfully!");
                console.log("Details of Program Offered created successfully:", response.data);
                // Reset the form fields
                resetForm();
                // display the detailsProgramOffered List
                handleListDetailsProgramOfferedClick();
            } catch (error) {
                // Display error message
                toast.error("Failed to save Details of Program Offered. Please try again.");
                console.error("Error creating Details of Program Offered:", error);
            }
        }
    });

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Details of Program Offered/Courses Delivered In Collaboration with Industry" breadcrumbItem="Industry Collaboration" />
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
                                                isInvalid={validation.touched.degree && !!validation.errors.degree}
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
                                                value={validation.values.program ? [validation.values.program] : []}
                                                onChange={(selectedOptions) =>
                                                    validation.setFieldValue("program", selectedOptions.length > 0 ? selectedOptions[0] : null)
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
                                                          <Label>Agency Name</Label>
                                                          <Input
                                                            type="text"
                                                            className={`form-control ${
                                                              validation.touched.agencyName &&
                                                              validation.errors.agencyName
                                                                ? "is-invalid"
                                                                : ""
                                                            }`}
                                                            value={validation.values.agencyName}
                                                            onChange={(e) =>
                                                              validation.setFieldValue(
                                                                "agencyName",
                                                                e.target.value
                                                              )
                                                            }
                                                            placeholder="Enter Agency Name"
                                                          />
                                                          {validation.touched.agencyName &&
                                                            validation.errors.agencyName && (
                                                              <div className="text-danger">
                                                                {validation.errors.agencyName}
                                                              </div>
                                                            )}
                                                        </div>
                                                      </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Number of Student</Label>
                                            <Input
                                                type="number"
                                                className={`form-control ${validation.touched.numberOfStudent && validation.errors.numberOfStudent ? "is-invalid" : ""}`}
                                                value={validation.values.numberOfStudent}
                                                onChange={(e) => validation.setFieldValue("numberOfStudent", e.target.value)}
                                                placeholder="Enter Number Of Student"
                                            />
                                            {validation.touched.numberOfStudent && validation.errors.numberOfStudent && (
                                                <div className="text-danger">{validation.errors.numberOfStudent}</div>
                                            )}
                                        </div>
                                    </Col>
                                     <Col lg={4}>
                                                        <div className="mb-3">
                                                          <Label>Duration(in Month)</Label>
                                                          <Input
                                                            type="text"
                                                            className={`form-control ${
                                                              validation.touched.duration &&
                                                              validation.errors.duration
                                                                ? "is-invalid"
                                                                : ""
                                                            }`}
                                                            value={validation.values.duration}
                                                            onChange={(e) =>
                                                              validation.setFieldValue(
                                                                "duration",
                                                                e.target.value
                                                              )
                                                            }
                                                            placeholder="Enter Duration(in Month)"
                                                          />
                                                          {validation.touched.duration &&
                                                            validation.errors.duration && (
                                                              <div className="text-danger">
                                                                {validation.errors.duration}
                                                              </div>
                                                            )}
                                                        </div>
                                                      </Col>
                                    <Col sm={4}>
                                        <div className="mb-3">
                                            <Label htmlFor="formFile" className="form-label">Upload MOU</Label>
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
                                                onClick={handleListDetailsProgramOfferedClick}
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
                {/* Modal for Listing DetailsProgramOffered */}
                <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg"
                    style={{ maxWidth: "100%", width: "auto" }} >
                    <ModalHeader toggle={toggleModal}>List Details of Program Offered/Courses Delivered In Collaboration with Industry</ModalHeader>
                    <ModalBody>
                        <Table bordered>
                            <thead>
                                <tr>
                                    <th>Sl.No</th>
                                    <th>Academic Year</th>
                                    <th>Stream</th>
                                    <th>Department</th>
                                    <th>Program Type</th>
                                    <th>Program</th>
                                    <th>Course</th>
                                    <th>Agency Name</th>
                                    <th>Number Of Student</th>
                                    <th>Durationt</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detailsProgramOfferedData.length > 0 ? (
                                    detailsProgramOfferedData.map((detailsProgramOffered, index) => (
                                        <tr key={detailsProgramOffered.detailsProgramOfferedDataId}>
                                            <td>{index + 1}</td>
                                            <td>{detailsProgramOffered.academicYear}</td>
                                            <td>{detailsProgramOffered.streamName}</td>
                                            <td>{detailsProgramOffered.departmentName}</td>
                                            <td>{detailsProgramOffered.programTypeName}</td>
                                            <td>{detailsProgramOffered.programName}</td>
                                            <td>{detailsProgramOffered.courseName}</td>
                                            <td>{detailsProgramOffered.agencyName}</td>
                                            <td>{detailsProgramOffered.numberOfStudent}</td>
                                            <td>{detailsProgramOffered.duration}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-warning me-2"
                                                    onClick={() => handleEdit(detailsProgramOffered.detailsProgramOfferedDataId)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(detailsProgramOffered.detailsProgramOfferedDataId)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={11} className="text-center">
                                            No Details Program Offered data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </ModalBody>
                </Modal>
            </div>
            <ToastContainer />
        </React.Fragment>
    );
};

export default Details_of_Programs_offered;