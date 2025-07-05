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

const Internships: React.FC = () => {
    // State variables for managing modal, edit mode, and delete confirmation
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    const [isFileUploadDisabled, setIsFileUploadDisabled] = useState({
        placementFile: false,
        departmentFile: false,
        personalFile: false,
    });

    const [showDeleteModal, setShowDeleteModal] = useState<null | "placementFile" | "departmentFile" | "personalFile">(null);

    const fileRefs = {
        placementFile: useRef<HTMLInputElement | null>(null),
        departmentFile: useRef<HTMLInputElement | null>(null),
        personalFile: useRef<HTMLInputElement | null>(null),
    };

    // Fetch internships on initial load
    const fetchInternships = async () => {
        try {
            const response = await api.get("/internship/getAllInternship", "");
            if (response && Array.isArray(response) && response.length > 0) {
                const data = response[response.length - 1]; // latest
                setEditId(data.id?.toString() || null);
                setIsEditMode(true);

                // Map API keys to Formik fields
                validation.setFieldValue("placementFile", data.file?.PlacementCell || null, false);
                validation.setFieldValue("departmentFile", data.file?.Department || null, false);
                validation.setFieldValue("personalFile", data.file?.Pepartment || null, false);

                setIsFileUploadDisabled({
                    placementFile: !!data.file?.PlacementCell,
                    departmentFile: !!data.file?.Department,
                    personalFile: !!data.file?.Pepartment,
                });
            } else {
                setIsEditMode(false);
                setEditId(null);
                setIsFileUploadDisabled({
                    placementFile: false,
                    departmentFile: false,
                    personalFile: false,
                });
            }
        } catch (error) {
            toast.error("Failed to fetch Internship data.");
            setIsEditMode(false);
        }
    };

    useEffect(() => {
        fetchInternships();
    }, []);

    // Download file
    // Handle file download actions
    const handleDownloadFile = async (fileName: string) => {
        if (fileName) {
            try {
                // Ensure you set responseType to 'blob' to handle binary data
                const response = await axios.get(`/internship/download/${fileName}`, {
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
                toast.error("Failed to download file. Please try again.");
                console.error("Error downloading file:", error);
            }
        } else {
            toast.error("No file available for download.");
        }
    };

    // Delete file
    const handleDeleteFile = async (fileKey: "placementFile" | "departmentFile" | "personalFile") => {
        try {
            const fileName = validation.values[fileKey];
            if (!fileName || typeof fileName !== "string") {
                toast.error("No file to delete.");
                return;
            }
            await api.delete(
                `internship/deleteInternshipDocument?fileName=${fileName}`,
                ""
            );
            toast.success("File deleted successfully!");
            validation.setFieldValue(fileKey, null);
            setIsFileUploadDisabled(prev => ({ ...prev, [fileKey]: false }));
            setShowDeleteModal(null);
            // Optionally, clear the file input
            if (fileRefs[fileKey].current) fileRefs[fileKey].current!.value = "";
        } catch (error) {
            toast.error("Failed to delete the file. Please try again.");
            console.error("Error deleting file:", error);
        }
    };

    // Formik validation and submission
    const validation = useFormik({
        initialValues: {
            placementFile: null as File | string | null,
            departmentFile: null as File | string | null,
            personalFile: null as File | string | null,
        },
        validationSchema: Yup.object({
            placementFile: Yup.mixed().test(
                "fileValidation",
                "Please upload a valid file",
                function (value) {
                    if (isFileUploadDisabled.placementFile) return true;
                    if (!value) return this.createError({ message: "Please upload a file" });
                    if (value instanceof File && value.size > 2 * 1024 * 1024) {
                        return this.createError({ message: "File size is too large" });
                    }
                    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
                    if (value instanceof File && !allowedTypes.includes(value.type)) {
                        return this.createError({ message: "Unsupported file format" });
                    }
                    return true;
                }
            ),
            departmentFile: Yup.mixed().test(
                "fileValidation",
                "Please upload a valid file",
                function (value) {
                    if (isFileUploadDisabled.departmentFile) return true;
                    if (!value) return this.createError({ message: "Please upload a file" });
                    if (value instanceof File && value.size > 2 * 1024 * 1024) {
                        return this.createError({ message: "File size is too large" });
                    }
                    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
                    if (value instanceof File && !allowedTypes.includes(value.type)) {
                        return this.createError({ message: "Unsupported file format" });
                    }
                    return true;
                }
            ),
            personalFile: Yup.mixed().test(
                "fileValidation",
                "Please upload a valid file",
                function (value) {
                    if (isFileUploadDisabled.personalFile) return true;
                    if (!value) return this.createError({ message: "Please upload a file" });
                    if (value instanceof File && value.size > 2 * 1024 * 1024) {
                        return this.createError({ message: "File size is too large" });
                    }
                    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
                    if (value instanceof File && !allowedTypes.includes(value.type)) {
                        return this.createError({ message: "Unsupported file format" });
                    }
                    return true;
                }
            ),
        }),
        onSubmit: async (values, { resetForm }) => {
            const formData = new FormData();
            if (values.placementFile && values.placementFile instanceof File) {
                formData.append("placementCell", values.placementFile);
            }
            if (values.departmentFile && values.departmentFile instanceof File) {
                formData.append("department", values.departmentFile);
            }
            if (values.personalFile && values.personalFile instanceof File) {
                formData.append("personal", values.personalFile);
            }
            if (isEditMode && editId) {
                formData.append("id", editId);
            }
            try {
                if (isEditMode && editId) {
                    await api.put("/internship", formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                    });
                    toast.success("Internship updated successfully!");
                } else {
                    await api.create("/internship", formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                    });
                    toast.success("Internship added successfully!");
                }
                fetchInternships();
            } catch (error) {
                toast.error("Failed to save Internship. Please try again.");
                console.error("Error saving Internship:", error);
            }
        },
    });

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Placement" breadcrumbItem="Internships" />
                    <Card>
                        <CardBody>
                            <form onSubmit={validation.handleSubmit}>
                                <Row>
                                    {/* Placement File */}
                                    <Col sm={4}>
                                        <div className="mb-3">
                                            <Label htmlFor="placementFile" className="form-label">
                                                Upload Placement Cell
                                            </Label>
                                            <Input
                                                className={`form-control ${validation.touched.placementFile && validation.errors.placementFile
                                                    ? "is-invalid"
                                                    : ""
                                                    }`}
                                                type="file"
                                                id="placementFile"
                                                innerRef={fileRefs.placementFile}
                                                onChange={(event) => {
                                                    validation.setFieldValue(
                                                        "placementFile",
                                                        event.currentTarget.files
                                                            ? event.currentTarget.files[0]
                                                            : null
                                                    );
                                                }}
                                                disabled={isFileUploadDisabled.placementFile}
                                            />
                                            {validation.touched.placementFile && validation.errors.placementFile && (
                                                <div className="text-danger">
                                                    {validation.errors.placementFile}
                                                </div>
                                            )}
                                            {isFileUploadDisabled.placementFile && (
                                                <div className="text-warning mt-2">
                                                    Please remove the existing file to upload a new one.
                                                </div>
                                            )}
                                            {typeof validation.values.placementFile === "string" && (
                                                <div className="mt-2 d-flex align-items-center">
                                                    <span
                                                        className="me-2"
                                                        style={{ fontWeight: "bold", color: "green" }}
                                                    >
                                                        {validation.values.placementFile}
                                                    </span>
                                                    <Button
                                                        color="link"
                                                        className="text-primary"
                                                        onClick={() =>
                                                            handleDownloadFile(
                                                                validation.values.placementFile as string
                                                            )
                                                        }
                                                        title="Download File"
                                                    >
                                                        <i className="bi bi-download"></i>
                                                    </Button>
                                                    <Button
                                                        color="link"
                                                        className="text-danger"
                                                        onClick={() => setShowDeleteModal("placementFile")}
                                                        title="Delete File"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                    {/* Department File */}
                                    <Col sm={4}>
                                        <div className="mb-3">
                                            <Label htmlFor="departmentFile" className="form-label">
                                                Upload Department
                                            </Label>
                                            <Input
                                                className={`form-control ${validation.touched.departmentFile && validation.errors.departmentFile
                                                    ? "is-invalid"
                                                    : ""
                                                    }`}
                                                type="file"
                                                id="departmentFile"
                                                innerRef={fileRefs.departmentFile}
                                                onChange={(event) => {
                                                    validation.setFieldValue(
                                                        "departmentFile",
                                                        event.currentTarget.files
                                                            ? event.currentTarget.files[0]
                                                            : null
                                                    );
                                                }}
                                                disabled={isFileUploadDisabled.departmentFile}
                                            />
                                            {validation.touched.departmentFile && validation.errors.departmentFile && (
                                                <div className="text-danger">
                                                    {validation.errors.departmentFile}
                                                </div>
                                            )}
                                            {isFileUploadDisabled.departmentFile && (
                                                <div className="text-warning mt-2">
                                                    Please remove the existing file to upload a new one.
                                                </div>
                                            )}
                                            {typeof validation.values.departmentFile === "string" && (
                                                <div className="mt-2 d-flex align-items-center">
                                                    <span
                                                        className="me-2"
                                                        style={{ fontWeight: "bold", color: "green" }}
                                                    >
                                                        {validation.values.departmentFile}
                                                    </span>
                                                    <Button
                                                        color="link"
                                                        className="text-primary"
                                                        onClick={() =>
                                                            handleDownloadFile(
                                                                validation.values.departmentFile as string
                                                            )
                                                        }
                                                        title="Download File"
                                                    >
                                                        <i className="bi bi-download"></i>
                                                    </Button>
                                                    <Button
                                                        color="link"
                                                        className="text-danger"
                                                        onClick={() => setShowDeleteModal("departmentFile")}
                                                        title="Delete File"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                    {/* Personal File */}
                                    <Col sm={4}>
                                        <div className="mb-3">
                                            <Label htmlFor="personalFile" className="form-label">
                                                Upload Personal
                                            </Label>
                                            <Input
                                                className={`form-control ${validation.touched.personalFile && validation.errors.personalFile
                                                    ? "is-invalid"
                                                    : ""
                                                    }`}
                                                type="file"
                                                id="personalFile"
                                                innerRef={fileRefs.personalFile}
                                                onChange={(event) => {
                                                    validation.setFieldValue(
                                                        "personalFile",
                                                        event.currentTarget.files
                                                            ? event.currentTarget.files[0]
                                                            : null
                                                    );
                                                }}
                                                disabled={isFileUploadDisabled.personalFile}
                                            />
                                            {validation.touched.personalFile && validation.errors.personalFile && (
                                                <div className="text-danger">
                                                    {validation.errors.personalFile}
                                                </div>
                                            )}
                                            {isFileUploadDisabled.personalFile && (
                                                <div className="text-warning mt-2">
                                                    Please remove the existing file to upload a new one.
                                                </div>
                                            )}
                                            {typeof validation.values.personalFile === "string" && (
                                                <div className="mt-2 d-flex align-items-center">
                                                    <span
                                                        className="me-2"
                                                        style={{ fontWeight: "bold", color: "green" }}
                                                    >
                                                        {validation.values.personalFile}
                                                    </span>
                                                    <Button
                                                        color="link"
                                                        className="text-primary"
                                                        onClick={() =>
                                                            handleDownloadFile(
                                                                validation.values.personalFile as string
                                                            )
                                                        }
                                                        title="Download File"
                                                    >
                                                        <i className="bi bi-download"></i>
                                                    </Button>
                                                    <Button
                                                        color="link"
                                                        className="text-danger"
                                                        onClick={() => setShowDeleteModal("personalFile")}
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
                                            {(!isFileUploadDisabled.placementFile ||
                                                !isFileUploadDisabled.departmentFile ||
                                                !isFileUploadDisabled.personalFile) && (
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
            {/* Confirmation Modal */}
            <Modal isOpen={!!showDeleteModal} toggle={() => setShowDeleteModal(null)}>
                <ModalBody>
                    Are you sure you want to delete this file?
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="danger"
                        onClick={() => {
                            if (showDeleteModal) handleDeleteFile(showDeleteModal);
                        }}
                    >
                        Yes
                    </Button>
                    <Button color="secondary" onClick={() => setShowDeleteModal(null)}>
                        No
                    </Button>
                </ModalFooter>
            </Modal>
            <ToastContainer />
        </React.Fragment>
    );
};

export default Internships;