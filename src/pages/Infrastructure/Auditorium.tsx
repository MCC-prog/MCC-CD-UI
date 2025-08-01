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
  ModalHeader,
  Row,
  Table,
  Tooltip,
} from "reactstrap";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const api = new APIClient();

const Auditorium: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classroomData, setClassroomData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [filters, setFilters] = useState({
    blockName: "",
    seatingCapacity: "",
  });
  const [filteredData, setFilteredData] = useState(classroomData);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = classroomData.filter((row) =>
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

    const filtered = classroomData.filter((row) =>
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

  // Toggle the modal for listing ComputerLabs_SimulationLab data
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Auditorium data from the backend
  const fetchAuditoriumData = async () => {
    try {
      const response = await api.get(
        "/infrastructureAuditorium/getAllAuditorium",
        ""
      );
      setClassroomData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Auditorium data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListAuditoriumClick = () => {
    toggleModal();
    fetchAuditoriumData();
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
  // Fetch the data for the selected Classrooms data ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/infrastructureAuditorium/edit?auditoriumId=${id}`,
        ""
      );
      // Map API response to Formik values
      const mappedValues = {
        blockName: response.blockName || "",
        seatingCapacity: response.seatingCapacity || "",
        file: response.document?.auditorium || null,
      };

      // Update Formik values
      validation.setValues({
        ...mappedValues,
      });
      // In your handleEdit, after setting Formik values:
      if (response.document?.auditorium) {
        validation.setFieldValue("file", response.document.auditorium);
        setIsFileUploadDisabled(true);
      } else {
        validation.setFieldValue("file", null);
        setIsFileUploadDisabled(false);
      }
      setIsEditMode(true);
      setEditId(id);
      toggleModal();
    } catch (error) {
      console.error("Error fetching Classrooms data data by ID:", error);
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the ComputerLabs and SimulationLab data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/infrastructureAuditorium/deleteAuditorium?auditoriumId=${id}`,
          ""
        );
        toast.success(
          response.message || "Auditorium data removed successfully!"
        );
        fetchAuditoriumData();
      } catch (error) {
        toast.error("Failed to remove Auditorium data. Please try again.");
        console.error("Error deleting Auditorium data:", error);
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
        const response = await axios.get(
          `/infrastructureAuditorium/download/${fileName}`,
          {
            responseType: "blob",
          }
        );

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
        toast.error("Failed to download  file. Please try again.");
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
        `/infrastructureAuditorium/deleteAuditoriumDocument?auditoriumId=${editId}`,
        ""
      );
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      // Remove the file from the form
      validation.setFieldValue("file", null); // Clear the file from Formik state
      setIsFileUploadDisabled(false); // Enable the file upload button
      validation.setFieldValue("file", null);
      setIsFileUploadDisabled(false);
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
      blockName: "",
      seatingCapacity: "",
      file: null as File | string | null,
    },
    validationSchema: Yup.object({
      blockName: Yup.string().required("Please select block name"),
      seatingCapacity: Yup.number().required("Please enter seating capacity"),
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
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();
      // Append fields to FormData
      formData.append("auditoriumId", editId || "");
      formData.append("blockName", values.blockName);
      formData.append("seatingCapacity", String(values.seatingCapacity));

      if (isEditMode && typeof values.file === "string") {
        formData.append(
          "file",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.file === null) {
        formData.append(
          "file",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.file) {
        formData.append("file", values.file);
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/infrastructureAuditorium/update`,
            formData
          );
          toast.success(response.message || "Auditorium updated successfully!");
        } else {
          // Call the save API
          const response = await api.create(
            "/infrastructureAuditorium/save",
            formData
          );
          toast.success(response.message || "Auditorium added successfully!");
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        setIsFileUploadDisabled(false);
        handleListAuditoriumClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Auditorium details. Please try again.");
        console.error("Error creating Auditorium details:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Auditorium" breadcrumbItem="Infrastructure" />
          <Card>
            <CardBody>
              <form onSubmit={validation.handleSubmit}>
                <Row>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="blockName" className="form-label">
                        Block Name
                      </Label>
                      <Input
                        type="select"
                        name="blockName"
                        id="blockName"
                        value={validation.values.blockName || ""}
                        onChange={(e) =>
                          validation.setFieldValue("blockName", e.target.value)
                        }
                        className={
                          validation.touched.blockName &&
                          validation.errors?.blockName
                            ? "is-invalid"
                            : ""
                        }
                      >
                        <option value="">Select Block Name</option>
                        <option value="DJB">DJB</option>
                        <option value="GJB">GJB</option>
                        <option value="MTB">MTB</option>
                        <option value="LSCB">LSCB</option>
                        <option value="MOC">MOC</option>
                        <option value="AB">AB</option>
                      </Input>
                      {validation.touched.blockName &&
                        validation.errors?.blockName && (
                          <div className="text-danger">
                            {validation.errors.blockName}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="seatingCapacity" className="form-label">
                        Seating Capacity
                      </Label>
                      <Input
                        type="number"
                        name="seatingCapacity"
                        id="seatingCapacity"
                        value={validation.values.seatingCapacity || ""}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "seatingCapacity",
                            e.target.value
                          )
                        }
                        placeholder="Enter seating capacity"
                        className={
                          validation.touched.seatingCapacity &&
                          validation.errors?.seatingCapacity
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.seatingCapacity &&
                        validation.errors?.seatingCapacity && (
                          <div className="text-danger">
                            {validation.errors.seatingCapacity}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Pdf
                        <i
                          id="infoIcon"
                          className="bi bi-info-circle ms-2"
                          style={{ cursor: "pointer", color: "#0d6efd" }}
                        ></i>
                      </Label>
                      <Tooltip
                        placement="right"
                        isOpen={tooltipOpen}
                        target="infoIcon"
                        toggle={toggleTooltip}
                      >
                        Upload an PDF file. Max size 10MB.
                      </Tooltip>
                      <Input
                        className={`form-control ${
                          validation.touched.file && validation.errors.file
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
                        disabled={isFileUploadDisabled}
                      />
                      {validation.touched.file && validation.errors.file && (
                        <div className="text-danger">
                          {validation.errors.file}
                        </div>
                      )}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Show file name, download, and delete buttons if file is a string */}
                      {typeof validation.values.file === "string" &&
                        validation.values.file && (
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
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={handleListAuditoriumClick}
                      >
                        List Activities
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Classrooms data */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>List Auditorium data</ModalHeader>
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
            <Table
              striped
              bordered
              hover
              responsive
              className="align-middle text-center"
            >
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Block Name</th>
                  <th>No. of Computer Labs</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((campus, index) => (
                    <tr key={campus.auditoriumId}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{campus.blockName}</td>
                      <td>{campus.seatingCapacity}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(campus.auditoriumId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(campus.auditoriumId)}
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
                      No Auditorium related data available.
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

export default Auditorium;
