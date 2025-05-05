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
import { Button, Card, CardBody, Col, Container, Input, Label, Modal, ModalBody, ModalHeader, Row, Table } from 'reactstrap';
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const api = new APIClient();

const Bos: React.FC = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bosData, setBosData] = useState<any[]>([]);
    const [selectedStream, setSelectedStream] = useState<any>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
    const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
    const [selectedDegree, setSelectedDegree] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const [filters, setFilters] = useState({
        academicYear: "",
        semesterType: "",
        semesterNo: "",
        stream: "",
        department: "",
        programType: "",
        program: "",
        yearOfIntroduction: "",
        percentage: "",
    });

    const [filteredData, setFilteredData] = useState(bosData);

    // Handle global search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = bosData.filter((row) =>
            Object.values(row).some((val) =>
                String(val || "").toLowerCase().includes(value)
            )
        );
        setFilteredData(filtered);
    };

    // Handle column-specific filters
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>, column: string) => {
        const value = e.target.value.toLowerCase();
        const updatedFilters = { ...filters, [column]: value };
        setFilters(updatedFilters);

        const filtered = bosData.filter((row) =>
            Object.values(row).some((val) =>
                String(val || "").toLowerCase().includes(value)
            )
        );
        setFilteredData(filtered);
    };

    // Calculate the paginated data
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

    // Handle page change
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Calculate total pages
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    // Fetch BOS data from the backend
    const fetchBosData = async () => {
        try {
            const response = await api.get("/bos/getAllBos", '');
            setBosData(response);
            setFilteredData(response);
            console.log("BOS data fetched successfully:", response);
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

    const formatDate = (date: string): string => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const validation = useFormik({
        initialValues: {
            academicYear: null as { value: string; label: string } | null,
            semesterType: null as { value: string; label: string } | null,
            semesterNo: null as { value: string; label: string } | null,
            stream: null as { value: string; label: string } | null,
            department: null as { value: string; label: string } | null,
            otherDepartment: "",
            file: null,
            programType: null as { value: string; label: string } | null,
            degree: null as { value: string; label: string } | null,
            program: [] as { value: string; label: string }[],
            revisionPercentage: "",
            conductedDate: "",
        },
        validationSchema: Yup.object({
            academicYear: Yup.object<{ value: string; label: string }>().nullable().required("Please select academic year"),
            semesterType: Yup.object<{ value: string; label: string }>()
                .nullable()
                .required("Please select a semester type"), // Single object for single-select
            semesterNo: Yup.object<{ value: string; label: string }>()
                .nullable()
                .required("Please select a semester number"),
            stream: Yup.object<{ value: string; label: string }>().nullable().required("Please select school"),
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
            programType: Yup.object<{ value: string; label: string }>().nullable().required("Please select program type"),
            degree: Yup.object().nullable().required("Please select degree"),
            program: Yup.array()
                .min(1, "Please select at least one program")
                .required("Please select programs"),
            revisionPercentage: Yup.number()
                .typeError("Please enter a valid number")
                .min(0, "Percentage cannot be less than 0")
                .max(100, "Percentage cannot be more than 100")
                .required("Please enter revision percentage"),
            conductedDate: Yup.date().required("Please select conducted date"),
        }),
        onSubmit: async (values, { resetForm }) => {

            // Create FormData object
            const formData = new FormData();

            // Append fields to FormData
            formData.append("academicYear", values.academicYear?.value || "");
            formData.append("departmentId", values.department?.value || "");
            formData.append("yearOfIntroduction", formatDate(values.conductedDate) || "");
            formData.append("semType", values.semesterType?.value || "");
            formData.append("semesterNo", values.semesterNo?.value || "");
            formData.append("programTypeId", values.programType?.value || "");
            formData.append("percentage", values.revisionPercentage || "");
            formData.append("streamId", values.stream?.value || "");
            formData.append("courseIds", values.program.map((option) => option.value).join(",") || "");
            formData.append("programId", values.degree?.value || "");

            // Append the file
            if (values.file) {
                formData.append("mom", values.file);
            } else {
                console.error("No file selected");
            }

            try {
                const response = await api.create("/bos/saveCurriculumBos", formData);
                // Display success message
                toast.success(response.message || "Curriculum BOS added successfully!");
                console.log("BOS created successfully:", response.data);
                // Reset the form fields
                resetForm();
                // display the BOS List
                handleListBosClick();
            } catch (error) {
                // Display error message
                toast.error("Failed to save Curriculum BOS. Please try again.");
                console.error("Error creating BOS:", error);
            }
        }
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
                                            semesterTypeValue={validation.values.semesterType}
                                            semesterNoValue={validation.values.semesterNo}
                                            onSemesterTypeChange={(selectedOption) =>
                                                validation.setFieldValue("semesterType", selectedOption)
                                            }
                                            onSemesterNoChange={(selectedOption) =>
                                                validation.setFieldValue("semesterNo", selectedOption)
                                            }
                                            isSemesterTypeInvalid={
                                                validation.touched.semesterType && !!validation.errors.semesterType
                                            }
                                            isSemesterNoInvalid={
                                                validation.touched.semesterNo && !!validation.errors.semesterNo
                                            }
                                            semesterTypeError={
                                                validation.touched.semesterType
                                                    ? validation.errors.semesterType
                                                    : null
                                            }
                                            semesterNoError={
                                                validation.touched.semesterNo
                                                    ? validation.errors.semesterNo
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
                                                value={validation.values.program}
                                                onChange={(selectedOptions) =>
                                                    validation.setFieldValue("program", selectedOptions)
                                                }
                                                isInvalid={validation.touched.program && !!validation.errors.program}
                                            />
                                            {validation.touched.program && validation.errors.program && (
                                                <div className="text-danger">
                                                    {Array.isArray(validation.errors.program)
                                                        ? validation.errors.program.join(", ")
                                                        : validation.errors.program}
                                                </div>
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
                <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg" style={{ maxWidth: "100%", width: "auto" }}>
                    <ModalHeader toggle={toggleModal}>List BOS</ModalHeader>
                    <ModalBody>
                        {/* Global Search */}
                        <div className="mb-3">
                            <Input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>

                        {/* Table with Pagination */}
                        <Table className="table-hover custom-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>
                                        Academic Year
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.academicYear}
                                            onChange={(e) => handleFilterChange(e, "academicYear")}
                                        />
                                    </th>
                                    <th>
                                        Semester Type
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.semesterType}
                                            onChange={(e) => handleFilterChange(e, "semesterType")}
                                        />
                                    </th>
                                    <th>
                                        Semester No
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.semesterNo}
                                            onChange={(e) => handleFilterChange(e, "semesterNo")}
                                        />
                                    </th>
                                    <th>
                                        Stream
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.stream}
                                            onChange={(e) => handleFilterChange(e, "stream")}
                                        />
                                    </th>
                                    <th>
                                        Department
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.department}
                                            onChange={(e) => handleFilterChange(e, "department")}
                                        />
                                    </th>
                                    <th>
                                        Program Type
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.programType}
                                            onChange={(e) => handleFilterChange(e, "programType")}
                                        />
                                    </th>
                                    <th>
                                        Program
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.program}
                                            onChange={(e) => handleFilterChange(e, "program")}
                                        />
                                    </th>
                                    <th>
                                        Year of Introduction
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.yearOfIntroduction}
                                            onChange={(e) => handleFilterChange(e, "yearOfIntroduction")}
                                        />
                                    </th>
                                    <th>
                                        Percentage
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.percentage}
                                            onChange={(e) => handleFilterChange(e, "percentage")}
                                        />
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRows.length > 0 ? (
                                    currentRows.map((bos, index) => (
                                        <tr key={bos.bosDataId}>
                                            <td>{indexOfFirstRow + index + 1}</td>
                                            <td>{bos.academicYear}</td>
                                            <td>{bos.semType}</td>
                                            <td>{bos.semesterNo}</td>
                                            <td>{bos.streamName}</td>
                                            <td>{bos.departmentName}</td>
                                            <td>{bos.programTypeName}</td>
                                            <td>{bos.programName}</td>
                                            <td>{bos.yearOfIntroduction}</td>
                                            <td>{bos.percentage}</td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button
                                                        className="btn btn-sm btn-warning"
                                                        onClick={() => handleEdit(bos.bosDataId)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDelete(bos.bosDataId)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={11} className="text-center">
                                            No BOS data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                        {/* Pagination Controls */}
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <Button
                                color="primary"
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                Previous
                            </Button>
                            <div>
                                Page {currentPage} of {totalPages}
                            </div>
                            <Button
                                color="primary"
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </ModalBody>
                </Modal>
            </div>
            <ToastContainer />
        </React.Fragment>
    );
};

export default Bos;