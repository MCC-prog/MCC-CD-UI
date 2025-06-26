import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import ProgramDropdown from "Components/DropDowns/ProgramDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
import SemesterDropdowns from "Components/DropDowns/SemesterDropdowns";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import { ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import React, { useRef, useState } from "react";
import {
    Button,
    Card,
    CardBody,
    Col,
    Container,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Table,
} from "reactstrap";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SEMESTER_NO_OPTIONS } from "../../Components/constants/layout";
import axios from "axios";
import moment from "moment";

const api = new APIClient();

const Activities_Conducted_MCCIE: React.FC = () => {
    // State variables for managing modal, edit mode, and delete confirmation
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    // State variable for managing delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    // State variable for managing file upload status
    const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
    // State variable for managing the modal for listing BOS
    const [isModalOpen, setIsModalOpen] = useState(false);
    // State variable for managing the list of BOS data
    const [bosData, setBosData] = useState<any[]>([]);
    // State variables for managing selected options in dropdowns
    const [selectedStream, setSelectedStream] = useState<any>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
    const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
    const [selectedDegree, setSelectedDegree] = useState<any>(null);
    // State variable for managing search term and pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    // State variable for managing filters
    const [filters, setFilters] = useState({
        academicYear: "",
        stream: "",
        department: "",
        agencyName: "",
        activityName: "",
        noOfStudents: "",
        financialSupportSource: "",
        duration: ""
    });
    const [filteredData, setFilteredData] = useState(bosData);

    const fileRef = useRef<HTMLInputElement | null>(null);

    // Handle global search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);

        const filtered = bosData.filter((row) =>
            Object.values(row).some((val) =>
                String(val || "")
                    .toLowerCase()
                    .includes(value)
            )
        );
        setFilteredData(filtered);
    };

    // Handle column-specific filters
    const handleFilterChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        column: string
    ) => {
        const value = e.target.value.toLowerCase();
        const updatedFilters = { ...filters, [column]: value };
        setFilters(updatedFilters);

        const filtered = bosData.filter((row) =>
            Object.values(row).some((val) =>
                String(val || "")
                    .toLowerCase()
                    .includes(value)
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

    // Toggle the modal for listing BOS
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    // Fetch BOS data from the backend
    const fetchBosData = async () => {
        try {
            const response = await api.get("/bos/getAllBos", "");
            setBosData(response);
            setFilteredData(response);
        } catch (error) {
            console.error("Error fetching BOS data:", error);
        }
    };

    // Open the modal and fetch data
    const handleListBosClick = () => {
        toggleModal();
        fetchBosData();
    };

    // Map value to label for dropdowns
    const mapValueToLabel = (
        value: string | number | null,
        options: { value: string | number; label: string }[]
    ): { value: string | number; label: string } | null => {
        if (!value) return null;
        const matchedOption = options.find((option) => option.value === value);
        return matchedOption ? matchedOption : { value, label: String(value) };
    };

    // Handle edit action
    // Fetch the data for the selected BOS ID and populate the form fields
    const handleEdit = async (id: string) => {
        try {
            const response = await api.get(`/bos/edit?bosId=${id}`, "");
            const academicYearOptions = await api.get("/getAllAcademicYear", "");
            // Filter the response where isCurrent or isCurrentForAdmission is true
            const filteredAcademicYearList = academicYearOptions.filter(
                (year: any) => year.isCurrent || year.isCurrentForAdmission
            );
            // Map the filtered data to the required format
            const academicYearList = filteredAcademicYearList.map((year: any) => ({
                value: year.year,
                label: year.display,
            }));

            const semesterNoOptions = SEMESTER_NO_OPTIONS;

            // Map API response to Formik values
            const mappedValues = {
                academicYear: mapValueToLabel(response.academicYear, academicYearList),
                semesterType: response.semType
                    ? { value: response.semType, label: response.semType.toUpperCase() }
                    : null,
                semesterNo: mapValueToLabel(
                    String(response.semesterNo),
                    semesterNoOptions
                ) as { value: string; label: string } | null,
                stream: response.streamId
                    ? { value: response.streamId.toString(), label: response.streamName }
                    : null,
                department: response.departmentId
                    ? {
                        value: response.departmentId.toString(),
                        label: response.departmentName,
                    }
                    : null,
                programType: response.programTypeId
                    ? {
                        value: response.programTypeId.toString(),
                        label: response.programTypeName,
                    }
                    : null,
                degree: response.programId
                    ? {
                        value: response.programId.toString(),
                        label: response.programName,
                    }
                    : null,
                program: response.courses
                    ? Object.entries(response.courses).map(([key, value]) => ({
                        value: key,
                        label: String(value),
                    }))
                    : [],
                revisionPercentage: response.percentage || "",
                conductedDate: response.yearOfIntroduction
                    ? response.yearOfIntroduction
                    : "",
                otherDepartment: "", // Add default value for otherDepartment
                file: response.documents?.mom || null,
            };
            setIsEditMode(true); // Set edit mode
            setEditId(id); // Store the ID of the record being edited
            toggleModal();
        } catch (error) {
            console.error("Error fetching BOS data by ID:", error);
        }
    };

    // Handle delete action
    // Set the ID of the record to be deleted and open the confirmation modal
    const handleDelete = (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    // Confirm deletion of the record
    // Call the delete API and refresh the BOS data
    const confirmDelete = async (id: string) => {
        if (deleteId) {
            try {
                const response = await api.delete(`/bos/deleteBos?bosId=${id}`, "");
                toast.success(
                    response.message || "Curriculum BOS removed successfully!"
                );
                fetchBosData();
            } catch (error) {
                toast.error("Failed to remove Curriculum BOS. Please try again.");
                console.error("Error deleting BOS:", error);
            } finally {
                setIsDeleteModalOpen(false);
                setDeleteId(null);
            }
        }
    };

    // Handle file download actions
    const handleDownloadFile = async (fileName: string) => {
        if (fileName) {
            try {
                // Ensure you set responseType to 'blob' to handle binary data
                const response = await axios.get(`/bos/download/${fileName}`, {
                    responseType: "blob",
                });

                // Create a Blob from the response data
                const blob = new Blob([response], { type: "*/*" });

                // Create a URL for the Blob
                const url = window.URL.createObjectURL(blob);

                // Create a temporary anchor element to trigger the download
                const link = document.createElement("a");
                link.href = url;
                link.download = fileName; // Set the file name for the download
                document.body.appendChild(link);
                link.click();

                // Clean up the URL and remove the anchor element
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast.success("File downloaded successfully!");
            } catch (error) {
                toast.error("Failed to download MOM file. Please try again.");
                console.error("Error downloading file:", error);
            }
        } else {
            toast.error("No file available for download.");
        }
    };

    // Handle file deletion
    // Clear the file from the form and show success message
    const handleDeleteFile = async () => {
        try {
            // Call the delete API
            const response = await api.delete(
                `/bos/deleteBosDocument?bosDocumentId=${editId}`,
                ""
            );
            // Show success message
            toast.success(response.message || "File deleted successfully!");
            // Remove the file from the form
            validation.setFieldValue("file", null); // Clear the file from Formik state
            setIsFileUploadDisabled(false); // Enable the file upload button
        } catch (error) {
            // Show error message
            toast.error("Failed to delete the file. Please try again.");
            console.error("Error deleting file:", error);
        }
    };

    // Formik validation and submission
    // Initialize Formik with validation schema and initial values
    const validation = useFormik({
        initialValues: {
            academicYear: null as { value: string; label: string } | null,
            stream: null as { value: string; label: string } | null,
            department: null as { value: string; label: string } | null,
            otherDepartment: "",
            agencyName: "",
            activityName: "",
            noOfStudents: "",
            financialSupportSource: "",
            duration: "",
            activityPhoto: null,
            activityLetter: null,
        },
        validationSchema: Yup.object({
            academicYear: Yup.object<{ value: string; label: string }>()
                .nullable()
                .required("Please select academic year"),
            stream: Yup.object<{ value: string; label: string }>()
                .nullable()
                .required("Please select school"),
            department: Yup.object<{ value: string; label: string }>()
                .nullable()
                .required("Please select department"),
            otherDepartment: Yup.string().when(
                "department",
                (department: any, schema) => {
                    return department?.value === "Others"
                        ? schema.required("Please specify the department")
                        : schema;
                }
            ),
            agencyName: Yup.string().required("Please enter agency name"),
            activityName: Yup.string().required("Please enter activity name"),
            noOfStudents: Yup.number().typeError("Enter a valid number").required("Please enter number of students"),
            financialSupportSource: Yup.string().required("Please enter source of financial support"),
            duration: Yup.number().typeError("Enter a valid number").required("Please enter duration"),
            activityPhoto: Yup.mixed()
                .required("Please upload a photograph")
                .test("fileType", "Only image files allowed", (value) => {
                    if (!value) return false;
                    if (typeof value === "string") return true;
                    return value instanceof File && ["image/jpeg", "image/png", "image/jpg"].includes(value.type);
                }),
            activityLetter: Yup.mixed()
                .required("Please upload letter/MOU")
                .test("fileType", "Only PDF allowed", (value) => {
                    if (!value) return false;
                    if (typeof value === "string") return true;
                    return value instanceof File && value.type === "application/pdf";
                }),
        }),
        onSubmit: async (values, { resetForm }) => {
            // Create FormData object
            const formData = new FormData();

            // Append fields to FormData
            formData.append("academicYear", values.academicYear?.value || "");
            formData.append("departmentId", values.department?.value || "");
            try {
                if (isEditMode && editId) {
                    // Call the update API
                    const response = await api.put(`/bos/updateCurriculumBos`, formData);
                    toast.success(
                        response.message || "Curriculum BOS updated successfully!"
                    );
                } else {
                    // Call the save API
                    const response = await api.create("/bos/saveCurriculumBos", formData);
                    toast.success(
                        response.message || "Curriculum BOS added successfully!"
                    );
                }
                // Reset the form fields
                resetForm();
                if (fileRef.current) {
                    fileRef.current.value = "";
                }
                setIsEditMode(false); // Reset edit mode
                setEditId(null); // Clear the edit ID
                // display the BOS List
                handleListBosClick();
            } catch (error) {
                // Display error message
                toast.error("Failed to save Curriculum BOS. Please try again.");
                console.error("Error creating BOS:", error);
            }
        },
    });

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="INNOVATION & ENTREPRENUERSHIP" breadcrumbItem="Activities Conducted MCCIE" />
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
                                                    validation.setFieldValue(
                                                        "academicYear",
                                                        selectedOption
                                                    )
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
                                    {/* Stream Dropdown */}
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
                                                    validation.touched.stream &&
                                                    !!validation.errors.stream
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
                                    {/* Department Dropdown */}
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Department</Label>
                                            <DepartmentDropdown
                                                streamId={selectedStream?.value}
                                                value={validation.values.department}
                                                onChange={(selectedOption) => {
                                                    validation.setFieldValue(
                                                        "department",
                                                        selectedOption
                                                    );
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
                                                    className={`form-control ${validation.touched.otherDepartment &&
                                                        validation.errors.otherDepartment
                                                        ? "is-invalid"
                                                        : ""
                                                        }`}
                                                    value={validation.values.otherDepartment}
                                                    onChange={(e) =>
                                                        validation.setFieldValue(
                                                            "otherDepartment",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter Department Name"
                                                />
                                                {validation.touched.otherDepartment &&
                                                    validation.errors.otherDepartment && (
                                                        <div className="text-danger">
                                                            {validation.errors.otherDepartment}
                                                        </div>
                                                    )}
                                            </div>
                                        </Col>
                                    )}
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Agency Name</Label>
                                            <Input
                                                type="text"
                                                value={validation.values.agencyName}
                                                onChange={e => validation.setFieldValue("agencyName", e.target.value)}
                                                className={validation.touched.agencyName && validation.errors.agencyName ? "is-invalid" : ""}
                                            />
                                            {validation.touched.agencyName && validation.errors.agencyName && (
                                                <div className="text-danger">{validation.errors.agencyName}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Activity Name</Label>
                                            <Input
                                                type="text"
                                                value={validation.values.activityName}
                                                onChange={e => validation.setFieldValue("activityName", e.target.value)}
                                                className={validation.touched.activityName && validation.errors.activityName ? "is-invalid" : ""}
                                            />
                                            {validation.touched.activityName && validation.errors.activityName && (
                                                <div className="text-danger">{validation.errors.activityName}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>No. of Students</Label>
                                            <Input
                                                type="text"
                                                value={validation.values.noOfStudents}
                                                onChange={e => validation.setFieldValue("noOfStudents", e.target.value)}
                                                className={validation.touched.noOfStudents && validation.errors.noOfStudents ? "is-invalid" : ""}
                                            />
                                            {validation.touched.noOfStudents && validation.errors.noOfStudents && (
                                                <div className="text-danger">{validation.errors.noOfStudents}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Source of Financial Support</Label>
                                            <Input
                                                type="text"
                                                value={validation.values.financialSupportSource}
                                                onChange={e => validation.setFieldValue("financialSupportSource", e.target.value)}
                                                className={validation.touched.financialSupportSource && validation.errors.financialSupportSource ? "is-invalid" : ""}
                                            />
                                            {validation.touched.financialSupportSource && validation.errors.financialSupportSource && (
                                                <div className="text-danger">{validation.errors.financialSupportSource}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Duration (in month)</Label>
                                            <Input
                                                type="text"
                                                value={validation.values.duration}
                                                onChange={e => validation.setFieldValue("duration", e.target.value)}
                                                className={validation.touched.duration && validation.errors.duration ? "is-invalid" : ""}
                                            />
                                            {validation.touched.duration && validation.errors.duration && (
                                                <div className="text-danger">{validation.errors.duration}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Upload Photograph of the Activity</Label>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => validation.setFieldValue("activityPhoto", e.currentTarget.files?.[0] || null)}
                                                className={validation.touched.activityPhoto && validation.errors.activityPhoto ? "is-invalid" : ""}
                                            />
                                            {validation.touched.activityPhoto && validation.errors.activityPhoto && (
                                                <div className="text-danger">{validation.errors.activityPhoto}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Upload Letter/ MOU (Only PDF)</Label>
                                            <Input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={e => validation.setFieldValue("activityLetter", e.currentTarget.files?.[0] || null)}
                                                className={validation.touched.activityLetter && validation.errors.activityLetter ? "is-invalid" : ""}
                                            />
                                            {validation.touched.activityLetter && validation.errors.activityLetter && (
                                                <div className="text-danger">{validation.errors.activityLetter}</div>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg={12}>
                                        <div className="mt-3 d-flex justify-content-between">
                                            <button className="btn btn-primary" type="submit">
                                                {isEditMode ? "Update" : "Save"}
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                type="button"
                                                onClick={handleListBosClick}
                                            >
                                                List Activities By MCCIE
                                            </button>
                                        </div>
                                    </Col>
                                </Row>
                            </form>
                        </CardBody>
                    </Card>
                </Container>
                {/* Modal for Listing BOS */}
                <Modal
                    isOpen={isModalOpen}
                    toggle={toggleModal}
                    size="lg"
                    style={{ maxWidth: "100%", width: "auto" }}
                >
                    <ModalHeader toggle={toggleModal}>List Activities By MCCIE</ModalHeader>
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
                                        Agency Name
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.agencyName}
                                            onChange={(e) => handleFilterChange(e, "agencyName")}
                                        />
                                    </th>
                                    <th>
                                        Activity Name
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.activityName}
                                            onChange={(e) => handleFilterChange(e, "activityName")}
                                        />
                                    </th>
                                    <th>
                                        No. of Students
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.noOfStudents}
                                            onChange={(e) => handleFilterChange(e, "noOfStudents")}
                                        />
                                    </th>
                                    <th>
                                        Financial Support Source
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.financialSupportSource}
                                            onChange={(e) => handleFilterChange(e, "financialSupportSource")}
                                        />
                                    </th>
                                    <th>
                                        Duration (in month)
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.duration}
                                            onChange={(e) => handleFilterChange(e, "duration")}
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
                                            <td>{bos.streamName}</td>
                                            <td>{bos.departmentName}</td>
                                            <td>{bos.agencyName}</td>
                                            <td>{bos.activityName}</td>
                                            <td>{bos.noOfStudents}</td>
                                            <td>{bos.financialSupportSource}</td>
                                            <td>{bos.duration}</td>
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
                                            No Activities By MCCIE data available.
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
                {/* Confirmation Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    toggle={() => setIsDeleteModalOpen(false)}
                >
                    <ModalHeader toggle={() => setIsDeleteModalOpen(false)}>
                        Confirm Deletion
                    </ModalHeader>
                    <ModalBody>
                        Are you sure you want to delete this record? This action cannot be
                        undone.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" onClick={() => confirmDelete(deleteId!)}>
                            Delete
                        </Button>
                        <Button
                            color="secondary"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
            <ToastContainer />
        </React.Fragment>
    );
};

export default Activities_Conducted_MCCIE;
