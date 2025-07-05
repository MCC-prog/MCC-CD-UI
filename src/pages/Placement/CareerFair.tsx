import Breadcrumb from "Components/Common/Breadcrumb";
import { ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
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
    Row,
} from "reactstrap";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const api = new APIClient();

const CareerFair: React.FC = () => {
    // State variables for managing modal, edit mode, and delete confirmation
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchCareerFair = async () => {
        try {
            const response = await api.get("/careerFair/getAllCareerFair", "");
            if (response && Array.isArray(response) && response.length > 0) {
                // Get the latest uploaded file (last item in the array)
                const data = response[response.length - 1];
                setEditId(data.id?.toString() || null);
                setIsEditMode(!!data.file?.CareerFair);
                setIsFileUploadDisabled(!!data.file?.CareerFair);
                validation.setFieldValue("careerFairFile", data.file?.CareerFair || null, false);
            } else {
                setIsEditMode(false); // No file, not in edit mode
            }
        } catch (error) {
            toast.error("Failed to fetch Career Fair data.");
            setIsEditMode(false);
        }
    };
    // Fetch the Career Fair data when the component mounts
    useEffect(() => {
        fetchCareerFair();
    }, []);

    // Handle file download actions
    const handleDownloadFile = async (fileName: string) => {
        if (fileName) {
            try {
                // Ensure you set responseType to 'blob' to handle binary data
                const response = await axios.get(`/careerFair/download/${fileName}`, {
                    responseType: 'blob'
                });

                // Create a Blob from the response data
                const blob = new Blob([response], { type: "*/*" });

                // Create a URL for the Blob
                const url = window.URL.createObjectURL(blob);

                // Create a temporary anchor element to trigger the download
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName; // Set the file name for the download
                document.body.appendChild(link);
                link.click();

                // Clean up the URL and remove the anchor element
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast.success("File downloaded successfully!");
            } catch (error) {
                toast.error("Failed to download CareerFair file. Please try again.");
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
            // Call the delete API with the filename
            const response = await api.delete(
                `/careerFair/deleteCareerFairDocument?fileName=${validation.values.careerFairFile}`,
                ''
            );
            toast.success(response.message || "File deleted successfully!");
            validation.setFieldValue("careerFairFile", null);
            setIsFileUploadDisabled(false);
        } catch (error) {
            toast.error("Failed to delete the file. Please try again.");
            console.error("Error deleting file:", error);
        }
    };

    // Formik validation and submission
    // Initialize Formik with validation schema and initial values
    const validation = useFormik({
        initialValues: {
            careerFairFile: null as File | string | null,
        },
        validationSchema: Yup.object({
            careerFairFile: Yup.mixed().test(
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
            )
        }),
        onSubmit: async (values, { resetForm }) => {
            // Create FormData object
            const formData = new FormData();

            formData.append("id", editId || "");

            // Append the file with the key `file`
            if (typeof values.careerFairFile === "string") {
                formData.append("careerFair", "null");
            } else if (values.careerFairFile instanceof File) {
                formData.append("careerFair", values.careerFairFile);
            }
            try {
                const response = isEditMode && editId
                    ? await api.put(`/careerFair`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    })
                    : await api.create(`/careerFair`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                toast.success(response.message || "Research Guide record saved successfully!");
                // Refresh the page data to show the uploaded file
                fetchCareerFair();
            } catch (error) {
                toast.error("Failed to save Research Guide. Please try again.");
                console.error("Error creating/updating Research Guide:", error);
            }
        }
    });

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Placement" breadcrumbItem="Career Fair" />
                    <Card>
                        <CardBody>
                            <form onSubmit={validation.handleSubmit}>
                                <Input type="hidden" name="id" value={editId || ""} />
                                <Row>
                                    <Col lg={4}>
                                        <div className="mb-3">
                                            <Label>Report On Career Fair</Label>
                                            <Input
                                                type="file"
                                                onChange={(e) => validation.setFieldValue("careerFairFile", e.target.files?.[0] || null)}
                                                className={`form-control ${validation.touched.careerFairFile && validation.errors.careerFairFile ? "is-invalid" : ""}`}
                                                disabled={isFileUploadDisabled} // Disable the button if a file exists
                                            />
                                            {validation.touched.careerFairFile && validation.errors.careerFairFile && (
                                                <div className="text-danger">{validation.errors.careerFairFile}</div>
                                            )}
                                            {/* Show a message if the file upload button is disabled */}
                                            {isFileUploadDisabled && (
                                                <div className="text-warning mt-2">
                                                    Please remove the existing file to upload a new one.
                                                </div>
                                            )}
                                            {/* Only show the file name if it is a string (from the edit API) */}
                                            {typeof validation.values.careerFairFile === "string" && (
                                                <div className="mt-2 d-flex align-items-center">
                                                    <span className="me-2" style={{ fontWeight: "bold", color: "green" }}>
                                                        {validation.values.careerFairFile}
                                                    </span>
                                                    <Button
                                                        color="link"
                                                        className="text-primary"
                                                        onClick={() => {
                                                            if (typeof validation.values.careerFairFile === "string") {
                                                                handleDownloadFile(validation.values.careerFairFile);
                                                            }
                                                        }}
                                                        title="Download File"
                                                    >
                                                        <i className="bi bi-download"></i>
                                                    </Button>
                                                    <Button
                                                        color="link"
                                                        className="text-danger"
                                                        onClick={() => setShowDeleteModal(true)}
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
                                            {(!validation.values.careerFairFile || typeof validation.values.careerFairFile !== "string") && (
                                                <button className="btn btn-primary" type="submit">
                                                    {isEditMode ? "Update" : "Save"}
                                                </button>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </form>
                        </CardBody>
                    </Card>
                </Container>
            </div>
            <ToastContainer />
            <Modal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(false)}>
                <ModalBody>
                    Are you sure you want to delete this file?
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={() => {
                        handleDeleteFile();
                        setShowDeleteModal(false);
                    }}>
                        Yes
                    </Button>
                    <Button color="secondary" onClick={() => setShowDeleteModal(false)}>
                        No
                    </Button>
                </ModalFooter>
            </Modal>
        </React.Fragment>
    );
};

export default CareerFair;
