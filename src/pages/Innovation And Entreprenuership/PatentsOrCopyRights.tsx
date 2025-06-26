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

const PatentsOrCopyRights: React.FC = () => {
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
        facultyName: "",
        titleOfInvention: "",
        patentNumber: "",
        filedDate: "",
        dateOfPatentGrant: "",
        assigneeInstitute: "",
        inventors: "",
        published: ""
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
            facultyName: "",
            titleOfInvention: "",
            patentNumber: "",
            filedDate: "",
            dateOfPatentGrant: "",
            assigneeInstitute: "",
            inventors: "",
            published: "",
            abstractFile: null as File | string | null,
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
            facultyName: Yup.string().required("Please enter faculty name"),
            titleOfInvention: Yup.string().required("Please enter title of invention"),
            patentNumber: Yup.string().required("Please enter patent number"),
            filedDate: Yup.date().required("Please select filed date"),
            dateOfPatentGrant: Yup.date().required("Please select date of patent grant"),
            assigneeInstitute: Yup.string().required("Please enter assignee institute"),
            inventors: Yup.string().required("Please enter inventors"),
            published: Yup.string().required("Please enter published info"),
            abstractFile: Yup.mixed()
                .required("Please upload abstract file")
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
            formData.append("otherDepartment", values.otherDepartment || "");
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
                    <Breadcrumb title="INNOVATION & ENTREPRENUERSHIP" breadcrumbItem="Patents/CopyRights" />
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
                                            <Label>Faculty Name</Label>
                                            <Input
                                                type="text"
                                                value={validation.values.facultyName}
                                                onChange={e => validation.setFieldValue("facultyName", e.target.value)}
                                                className={validation.touched.facultyName && validation.errors.facultyName ? "is-invalid" : ""}
                                            />
                                            {validation.touched.facultyName && validation.errors.facultyName && (
                                                <div className="text-danger">{validation.errors.facultyName}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Title of Invention</Label>
                                            <Input
                                                type="text"
                                                value={validation.values.titleOfInvention}
                                                onChange={e => validation.setFieldValue("titleOfInvention", e.target.value)}
                                                className={validation.touched.titleOfInvention && validation.errors.titleOfInvention ? "is-invalid" : ""}
                                            />
                                            {validation.touched.titleOfInvention && validation.errors.titleOfInvention && (
                                                <div className="text-danger">{validation.errors.titleOfInvention}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Patent Number</Label>
                                            <Input
                                                type="text"
                                                value={validation.values.patentNumber}
                                                onChange={e => validation.setFieldValue("patentNumber", e.target.value)}
                                                className={validation.touched.patentNumber && validation.errors.patentNumber ? "is-invalid" : ""}
                                            />
                                            {validation.touched.patentNumber && validation.errors.patentNumber && (
                                                <div className="text-danger">{validation.errors.patentNumber}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Filed Date</Label>
                                            <Input
                                                type="date"
                                                value={validation.values.filedDate}
                                                onChange={e => validation.setFieldValue("filedDate", e.target.value)}
                                                className={validation.touched.filedDate && validation.errors.filedDate ? "is-invalid" : ""}
                                            />
                                            {validation.touched.filedDate && validation.errors.filedDate && (
                                                <div className="text-danger">{validation.errors.filedDate}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Date of Patent Grant</Label>
                                            <Input
                                                type="date"
                                                value={validation.values.dateOfPatentGrant}
                                                onChange={e => validation.setFieldValue("dateOfPatentGrant", e.target.value)}
                                                className={validation.touched.dateOfPatentGrant && validation.errors.dateOfPatentGrant ? "is-invalid" : ""}
                                            />
                                            {validation.touched.dateOfPatentGrant && validation.errors.dateOfPatentGrant && (
                                                <div className="text-danger">{validation.errors.dateOfPatentGrant}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Assignee Institute</Label>
                                            <Input
                                                type="text"
                                                value={validation.values.assigneeInstitute}
                                                onChange={e => validation.setFieldValue("assigneeInstitute", e.target.value)}
                                                className={validation.touched.assigneeInstitute && validation.errors.assigneeInstitute ? "is-invalid" : ""}
                                            />
                                            {validation.touched.assigneeInstitute && validation.errors.assigneeInstitute && (
                                                <div className="text-danger">{validation.errors.assigneeInstitute}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Inventors</Label>
                                            <Input
                                                type="text"
                                                value={validation.values.inventors}
                                                onChange={e => validation.setFieldValue("inventors", e.target.value)}
                                                className={validation.touched.inventors && validation.errors.inventors ? "is-invalid" : ""}
                                            />
                                            {validation.touched.inventors && validation.errors.inventors && (
                                                <div className="text-danger">{validation.errors.inventors}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Published</Label>
                                            <Input
                                                type="text"
                                                value={validation.values.published}
                                                onChange={e => validation.setFieldValue("published", e.target.value)}
                                                className={validation.touched.published && validation.errors.published ? "is-invalid" : ""}
                                            />
                                            {validation.touched.published && validation.errors.published && (
                                                <div className="text-danger">{validation.errors.published}</div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Abstract Upload</Label>
                                            <Input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={e => validation.setFieldValue("abstractFile", e.currentTarget.files?.[0] || null)}
                                                className={validation.touched.abstractFile && validation.errors.abstractFile ? "is-invalid" : ""}
                                            />
                                            {validation.touched.abstractFile && validation.errors.abstractFile && (
                                                <div className="text-danger">{validation.errors.abstractFile}</div>
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
                                                List Patent/Copyrights
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
                                        Faculty Name
                                        <Input
                                            type="text"
                                            placeholder="facultyName"
                                            value={filters.department}
                                            onChange={(e) => handleFilterChange(e, "facultyName")}
                                        />
                                    </th>
                                    <th>
                                        Title of Invention
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.titleOfInvention}
                                            onChange={(e) => handleFilterChange(e, "titleOfInvention")}
                                        />
                                    </th>
                                    <th>
                                        Patent Number
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.patentNumber}
                                            onChange={(e) => handleFilterChange(e, "patentNumber")}
                                        />
                                    </th>
                                    <th>
                                        Filed Date
                                        <Input
                                            type="date"
                                            placeholder="Filter"
                                            value={filters.filedDate}
                                            onChange={(e) => handleFilterChange(e, "filedDate")}
                                        />
                                    </th>
                                    <th>
                                        Date of Patent Grant
                                        <Input
                                            type="date"
                                            placeholder="Filter"
                                            value={filters.dateOfPatentGrant}
                                            onChange={(e) => handleFilterChange(e, "dateOfPatentGrant")}
                                        />
                                    </th>
                                    <th>
                                        Assignee Institute
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.assigneeInstitute}
                                            onChange={(e) => handleFilterChange(e, "assigneeInstitute")}
                                        />
                                    </th>
                                    <th>
                                        Inventors
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.inventors}
                                            onChange={(e) => handleFilterChange(e, "inventors")}
                                        />
                                    </th>
                                    <th>
                                        Published
                                        <Input
                                            type="text"
                                            placeholder="Filter"
                                            value={filters.published}
                                            onChange={(e) => handleFilterChange(e, "published")}
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
                                            <td>{bos.facultyName}</td>
                                            <td>{bos.titleOfInvention}</td>
                                            <td>{bos.patentNumber}</td>
                                            <td>{new Date(bos.filedDate).toLocaleDateString()}</td>
                                            <td>{new Date(bos.dateOfPatentGrant).toLocaleDateString()}</td>
                                            <td>{bos.assigneeInstitute}</td>
                                            <td>{bos.inventors}</td>
                                            <td>{bos.published}</td>
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
                                            No Patent/Copyrights data available.
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

export default PatentsOrCopyRights;
