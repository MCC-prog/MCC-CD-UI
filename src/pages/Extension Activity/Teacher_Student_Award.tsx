import Breadcrumb from "Components/Common/Breadcrumb";
import { ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import React, { useState } from "react";
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
import GetAllDepartmentDropdown from "Components/DropDowns/GetAllDepartmentDropdown";
import axios from "axios";

const api = new APIClient();

const Teacher_Student_Award: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teacherStudentAwardData, setTeacherStudentAwardData] = useState<any[]>(
    []
  );
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [filteredData, setFilteredData] = useState(teacherStudentAwardData);
  const [filters, setFilters] = useState({
    name: "",
    department: "",
    organisation: "",
    awardReceivedYear: "",
    file: null as string | null,
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = teacherStudentAwardData.filter((row) =>
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

    const filtered = teacherStudentAwardData.filter((row) =>
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

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch teacherStudentAward data from the backend
  const fetchTeacherStudentAwardData = async () => {
    try {
      const response = await api.get(
        "/studentAwardExtensionActivity/getAllStudentAwardExtensionActivity",
        ""
      );
      setTeacherStudentAwardData(response.data);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Teacher Student Award:", error);
    }
  };

  // Open the modal and fetch data
  const handleListTeacherStudentAwardClick = () => {
    toggleModal();
    fetchTeacherStudentAwardData();
  };

  const mapValueToLabel = (
    value: string | number | null,
    options: { value: string | number; label: string }[]
  ): { value: string | number; label: string } | null => {
    if (!value) return null;
    const matchedOption = options.find((option) => option.value === value);
    return matchedOption ? matchedOption : { value, label: String(value) };
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/studentAwardExtensionActivity/edit?studentAwardExtensionActivityId=${id}`,
        ""
      );

      // Map API response to Formik values
      const mappedValues = {
        name: response.name || "",
        department: response.departmentId
          ? {
              value: response.departmentId.toString(),
              label: response.departmentName,
            }
          : null,
        organisation: response.organisation || "",
        awardReceivedYear: response.awardReceivedYear || "",
        file: response.document?.recognitionCertificate || null,
      };
      // Update Formik values
      validation.setValues({
        ...mappedValues,
        file: response.document?.recognitionCertificate || null,
      });

      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      setIsFileUploadDisabled(!!response.documents?.recognitionCertificate);
      toggleModal();
    } catch (error) {
      console.error("Error fetching Student Award data by ID:", error);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/studentAwardExtensionActivity/deleteStudentAwardExtensionActivity?studentAwardExtensionActivityId=${id}`,
          ""
        );
        toast.success(
          response.message || "Teacher Student Award  removed successfully!"
        );
        fetchTeacherStudentAwardData();
      } catch (error) {
        toast.error(
          "Failed to remove Teacher Student Award . Please try again."
        );
        console.error("Error deleting Teacher Student Award:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(
          `/studentAwardExtensionActivity/download/${fileName}`,
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
        `/studentAwardExtensionActivity/deleteStudentAwardExtensionActivityDocument?studentAwardExtensionActivityId=${editId}`,
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

  const validation = useFormik({
    initialValues: {
      name: "",
      department: null as { value: string; label: string } | null,
      organisation: "",
      awardReceivedYear: "",
      file: null as File | string | null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please select Presenter Name"),
      department: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select department"),
      organisation: Yup.string().required("Please select Organization"),
      awardReceivedYear: Yup.string().required(
        "Please select Year of Receiving Award"
      ),
      file: Yup.mixed()
        .required("Please upload a file")
        .test("fileSize", "File size is too large", (value: any) => {
          if (typeof value === "string") return true;
          return value && value.size <= 2 * 1024 * 1024; // 2MB limit
        })
        .test("fileType", "Unsupported file format", (value: any) => {
          if (typeof value === "string") return true;
          return (
            value &&
            ["application/pdf", "image/jpeg", "image/png"].includes(value.type)
          );
        }),
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("name", values.name || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("organisation", values.organisation || "");
      formData.append("awardReceivedYear", values.awardReceivedYear || "");

      if (isEditMode && typeof values.file === "string") {
        // Pass an empty Blob instead of null
        formData.append("file", new Blob([]), "empty.pdf");
      } else if (isEditMode && values.file === null) {
        formData.append("file", new Blob([]), "empty.pdf");
      } else if (values.file) {
        formData.append("file", values.file);
      }

      // If editing, include ID
      if (isEditMode && editId) {
        formData.append("studentAwardExtensionActivityId", editId);
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/studentAwardExtensionActivity/update`,
            formData
          );
          toast.success(
            response.message || "Teacher Student Award updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/studentAwardExtensionActivity/save",
            formData
          );
          toast.success(
            response.message || "Teacher Student Award added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        setIsFileUploadDisabled(false); // Enable the file upload button
        handleListTeacherStudentAwardClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Teacher Student Award. Please try again.");
        console.error("Error creating Teacher Student Award:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Teacher Student Award"
            breadcrumbItem="Teacher Student Award"
          />
          <Card>
            <CardBody>
              <form onSubmit={validation.handleSubmit}>
                <Row>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Presenter Name</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.name && validation.errors.name
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.name}
                        onChange={(e) =>
                          validation.setFieldValue("name", e.target.value)
                        }
                        placeholder="Enter Presenter Name"
                      />
                      {validation.touched.name && validation.errors.name && (
                        <div className="text-danger">
                          {validation.errors.name}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Department</Label>
                      <GetAllDepartmentDropdown
                        value={validation.values.department}
                        onChange={(selectedOption) => {
                          validation.setFieldValue(
                            "department",
                            selectedOption
                          );
                          setSelectedDepartment(selectedOption);
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Organization</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.organisation &&
                          validation.errors.organisation
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.organisation}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "organisation",
                            e.target.value
                          )
                        }
                        placeholder="Enter Organization"
                      />
                      {validation.touched.organisation &&
                        validation.errors.organisation && (
                          <div className="text-danger">
                            {validation.errors.organisation}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Year Of Receiving Award</Label>
                      <Input
                        type="number"
                        className={`form-control ${
                          validation.touched.awardReceivedYear &&
                          validation.errors.awardReceivedYear
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.awardReceivedYear}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "awardReceivedYear",
                            e.target.value
                          )
                        }
                        placeholder="Enter Year Of Receiving Award"
                      />
                      {validation.touched.awardReceivedYear &&
                        validation.errors.awardReceivedYear && (
                          <div className="text-danger">
                            {validation.errors.awardReceivedYear}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Teacher Student Award
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
                        Upload an Excel or PDF file. Max size 10MB.
                      </Tooltip>
                      <Input
                        className={`form-control ${
                          validation.touched.file && validation.errors.file
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
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
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={handleListTeacherStudentAwardClick}
                      >
                        List Teacher Student Award
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Award */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Teacher Student Award
          </ModalHeader>
          <ModalBody>
            <div className="mb-3">
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <Table
              striped
              bordered
              hover
              responsive
              className="align-middle text-center"
            >
              <thead className="table-dark">
                <tr>
                  <th>Sl.No</th>
                  <th>Presenter Name</th>
                  <th>Department</th>
                  <th>Organization</th>
                  <th>Year Of Receiving Award</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((award, index) => (
                    <tr key={award.awardId}>
                      <td>{index + 1}</td>
                      <td>{award.name}</td>
                      <td>{award.departmentName}</td>
                      <td>{award.organisation}</td>
                      <td>{award.awardReceivedYear}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() =>
                            handleEdit(award.studentAwardExtensionActivityId)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            handleDelete(award.studentAwardExtensionActivityId)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center">
                      No Teacher Student Award data available.
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

export default Teacher_Student_Award;
