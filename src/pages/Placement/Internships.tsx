import Breadcrumb from "Components/Common/Breadcrumb";
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
    Row,
} from "reactstrap";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const api = new APIClient();

const Internships: React.FC = () => {
// State variables for managing modal, edit mode, and delete confirmation
const [isEditMode, setIsEditMode] = useState(false);
const [editId, setEditId] = useState<string | null>(null);

const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const rowsPerPage = 10;

const fileRef = useRef<HTMLInputElement | null>(null);
// Calculate the paginated data
const indexOfLastRow = currentPage * rowsPerPage;
const indexOfFirstRow = indexOfLastRow - rowsPerPage;

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
        semesterType: null as { value: string; label: string } | null,
        semesterNo: null as { value: string; label: string } | null,
        stream: null as { value: string; label: string } | null,
        department: null as { value: string; label: string } | null,
        otherDepartment: "",
        file: null as File | string | null,
        programType: null as { value: string; label: string } | null,
        degree: null as { value: string; label: string } | null,
        program: [] as { value: string; label: string }[],
        revisionPercentage: "",
        conductedDate: "",
    },
    validationSchema: Yup.object({
        academicYear: Yup.object<{ value: string; label: string }>()
            .nullable()
            .required("Please select academic year"),
        semesterType: Yup.object<{ value: string; label: string }>()
            .nullable()
            .required("Please select a semester type"), // Single object for single-select
        semesterNo: Yup.object<{ value: string; label: string }>()
            .nullable()
            .required("Please select a semester number"),
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
        file: Yup.mixed().test(
            "fileValidation",
            "Please upload a valid file",
            function (value) {
                // Skip validation if the file upload is disabled (file exists)
                if (isFileUploadDisabled) {
                    return true;
                }
                // Perform validation if the file upload is enabled (file doesn't exist)
                if (!value) {
                    return this.createError({ message: "Please upload a file" });
                }
                // Check file size (2MB limit)
                if (value instanceof File && value.size > 2 * 1024 * 1024) {
                    return this.createError({ message: "File size is too large" });
                }
                // Check file type
                const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
                if (value instanceof File && !allowedTypes.includes(value.type)) {
                    return this.createError({ message: "Unsupported file format" });
                }
                return true;
            }
        ),
        programType: Yup.object<{ value: string; label: string }>()
            .nullable()
            .required("Please select program type"),
        degree: Yup.object<{ value: string; label: string }>()
            .nullable()
            .required("Please select degree"),
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
        formData.append("yearOfIntroduction", values.conductedDate || "");
        formData.append("semType", values.semesterType?.value || "");
        formData.append("semesterNo", String(values.semesterNo?.value || ""));
        formData.append("programTypeId", values.programType?.value || "");
        formData.append("percentage", values.revisionPercentage || "");
        formData.append("streamId", values.stream?.value || "");
        formData.append(
            "courseIds",
            values.program.map((option) => option.value).join(",") || ""
        );
        formData.append("programId", values.degree?.value || "");
        formData.append("bosId", editId || "");
        formData.append("otherDepartment", values.otherDepartment || "");

        if (isEditMode && typeof values.file === "string") {
            formData.append(
                "mom",
                new Blob([], { type: "application/pdf" }),
                "empty.pdf"
            );
        } else if (isEditMode && values.file === null) {
            formData.append(
                "mom",
                new Blob([], { type: "application/pdf" }),
                "empty.pdf"
            );
        } else if (values.file) {
            formData.append("mom", values.file);
        }

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
                <Breadcrumb title="Placement" breadcrumbItem="Career Fair" />
                <Card>
                    <CardBody>
                        <form onSubmit={validation.handleSubmit}>
                            <Row>
                                <Col sm={4}>
                                    <div className="mb-3">
                                        <Label htmlFor="formFile" className="form-label">
                                            Upload placement cell
                                        </Label>
                                        <Input
                                            className={`form-control ${validation.touched.file && validation.errors.file
                                                    ? "is-invalid"
                                                    : ""
                                                }`}
                                            type="file"
                                            id="formFile"
                                            innerRef={fileRef}
                                            onChange={(event) => {
                                                validation.setFieldValue(
                                                    "file",
                                                    event.currentTarget.files
                                                        ? event.currentTarget.files[0]
                                                        : null
                                                );
                                            }}
                                            disabled={isFileUploadDisabled} // Disable the button if a file exists
                                        />
                                        {validation.touched.file && validation.errors.file && (
                                            <div className="text-danger">
                                                {validation.errors.file}
                                            </div>
                                        )}
                                        {/* Show a message if the file upload button is disabled */}
                                        {isFileUploadDisabled && (
                                            <div className="text-warning mt-2">
                                                Please remove the existing file to upload a new one.
                                            </div>
                                        )}
                                        {/* Only show the file name if it is a string (from the edit API) */}
                                        {typeof validation.values.file === "string" && (
                                            <div className="mt-2 d-flex align-items-center">
                                                <span
                                                    className="me-2"
                                                    style={{ fontWeight: "bold", color: "green" }}
                                                >
                                                    {validation.values.file}
                                                </span>
                                                <Button
                                                    color="link"
                                                    className="text-primary"
                                                    onClick={() =>
                                                        handleDownloadFile(
                                                            validation.values.file as string
                                                        )
                                                    }
                                                    title="Download File"
                                                >
                                                    <i className="bi bi-download"></i>
                                                </Button>
                                                <Button
                                                    color="link"
                                                    className="text-danger"
                                                    onClick={() => handleDeleteFile()}
                                                    title="Delete File"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Col>

                                <Col sm={4}>
                                    <div className="mb-3">
                                        <Label htmlFor="formFile" className="form-label">
                                            Upload Department
                                        </Label>
                                        <Input
                                            className={`form-control ${validation.touched.file && validation.errors.file
                                                    ? "is-invalid"
                                                    : ""
                                                }`}
                                            type="file"
                                            id="formFile"
                                            innerRef={fileRef}
                                            onChange={(event) => {
                                                validation.setFieldValue(
                                                    "file",
                                                    event.currentTarget.files
                                                        ? event.currentTarget.files[0]
                                                        : null
                                                );
                                            }}
                                            disabled={isFileUploadDisabled} // Disable the button if a file exists
                                        />
                                        {validation.touched.file && validation.errors.file && (
                                            <div className="text-danger">
                                                {validation.errors.file}
                                            </div>
                                        )}
                                        {/* Show a message if the file upload button is disabled */}
                                        {isFileUploadDisabled && (
                                            <div className="text-warning mt-2">
                                                Please remove the existing file to upload a new one.
                                            </div>
                                        )}
                                        {/* Only show the file name if it is a string (from the edit API) */}
                                        {typeof validation.values.file === "string" && (
                                            <div className="mt-2 d-flex align-items-center">
                                                <span
                                                    className="me-2"
                                                    style={{ fontWeight: "bold", color: "green" }}
                                                >
                                                    {validation.values.file}
                                                </span>
                                                <Button
                                                    color="link"
                                                    className="text-primary"
                                                    onClick={() =>
                                                        handleDownloadFile(
                                                            validation.values.file as string
                                                        )
                                                    }
                                                    title="Download File"
                                                >
                                                    <i className="bi bi-download"></i>
                                                </Button>
                                                <Button
                                                    color="link"
                                                    className="text-danger"
                                                    onClick={() => handleDeleteFile()}
                                                    title="Delete File"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Col>

                                <Col sm={4}>
                                    <div className="mb-3">
                                        <Label htmlFor="formFile" className="form-label">
                                            Upload personal 
                                        </Label>
                                        <Input
                                            className={`form-control ${validation.touched.file && validation.errors.file
                                                    ? "is-invalid"
                                                    : ""
                                                }`}
                                            type="file"
                                            id="formFile"
                                            innerRef={fileRef}
                                            onChange={(event) => {
                                                validation.setFieldValue(
                                                    "file",
                                                    event.currentTarget.files
                                                        ? event.currentTarget.files[0]
                                                        : null
                                                );
                                            }}
                                            disabled={isFileUploadDisabled} // Disable the button if a file exists
                                        />
                                        {validation.touched.file && validation.errors.file && (
                                            <div className="text-danger">
                                                {validation.errors.file}
                                            </div>
                                        )}
                                        {/* Show a message if the file upload button is disabled */}
                                        {isFileUploadDisabled && (
                                            <div className="text-warning mt-2">
                                                Please remove the existing file to upload a new one.
                                            </div>
                                        )}
                                        {/* Only show the file name if it is a string (from the edit API) */}
                                        {typeof validation.values.file === "string" && (
                                            <div className="mt-2 d-flex align-items-center">
                                                <span
                                                    className="me-2"
                                                    style={{ fontWeight: "bold", color: "green" }}
                                                >
                                                    {validation.values.file}
                                                </span>
                                                <Button
                                                    color="link"
                                                    className="text-primary"
                                                    onClick={() =>
                                                        handleDownloadFile(
                                                            validation.values.file as string
                                                        )
                                                    }
                                                    title="Download File"
                                                >
                                                    <i className="bi bi-download"></i>
                                                </Button>
                                                <Button
                                                    color="link"
                                                    className="text-danger"
                                                    onClick={() => handleDeleteFile()}
                                                    title="Delete File"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </div>
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
                                    </div>
                                </Col>
                            </Row>
                        </form>
                    </CardBody>
                </Card>
            </Container>
        </div>
        <ToastContainer />
    </React.Fragment>
);
};


export default Internships;
