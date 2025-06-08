import axios from "axios";
import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import Select from "react-select";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
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
import { toast, ToastContainer } from "react-toastify";
import moment from "moment";

const api = new APIClient();

const CapacityDevelopment_Skills: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cdsData, setCDSData] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(cdsData);
  const [filters, setFilters] = useState({
    academicYear: "",
    lifeSkills: "",
    type: "",
    qualification: "",
    LanguageAndCommunication: "",
    awarenessOfTrends: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = cdsData.filter((row) =>
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

    const filtered = cdsData.filter((row) =>
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

  // Fetch Capacity development & Skills enhancement data from the backend
  const fetchCDSData = async () => {
    try {
      const response = await axios.get("/teacherDetails/getAllClassRoomTools"); // Replace with your backend API endpoint
      setCDSData(response);
      setFilteredData(response);
    } catch (error) {
      console.error(
        "Error fetching Capacity development & Skills enhancement data:",
        error
      );
    }
  };

  // Open the modal and fetch data
  const handleListTeachersClick = () => {
    toggleModal();
    fetchCDSData();
  };

  const mapValueToLabel = (
    value: string | number | null,
    options: { value: string | number; label: string }[]
  ): { value: string | number; label: string } | null => {
    if (!value) return null;
    const matchedOption = options.find((option) => option.value === value);
    return matchedOption ? matchedOption : { value, label: String(value) };
  };

  // Handle edit action
  // Fetch the data for the selected Capacity development & Skills enhancement ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/teacherDetails/edit?id=${id}&screenName=TEACHERDETAILS`,
        ""
      );
      if (!response) {
        toast.error("No data found for the selected ID.");
        return;
      }

      // Map API response to Formik values
      const mappedValues = {
        lifeSkills: mapValueToLabel(
          response.lifeSkills,
          lifeSkills // Assuming you have a lifeSkills options array
        ),
        type: mapValueToLabel(
          response.type,
          capType // Assuming you have a capType options array
        ),
        LanguageAndCommunication: response.academicExperience || "",
        awarenessOfTrends: response.industrialExperience || "",
        qualification: response.qualification || "",
        file: response.document?.excel || null,
        academicYear: response.academicYear
          ? { value: response.academicYear, label: response.academicYear }
          : null,
      };

      // Update Formik values
      validation.setValues({
        ...mappedValues,
        academicYear: null, // Assuming you handle academic year separately
        lifeSkills: mapValueToLabel(response.lifeSkills, lifeSkills),
        type: mapValueToLabel(response.type, capType),
        LanguageAndCommunication: response.academicExperience || "",
        awarenessOfTrends: response.industrialExperience || "",
        qualification: response.qualification || "",
      });
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error(
        "Error fetching Capacity development & Skills enhancement data by ID:",
        error
      );
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the Capacity development & Skills enhancement data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/teacherDetails/deleteClassRoomTools?id=${id}&screenName=TEACHERDETAILS`,
          ""
        );
        toast.success(
          response.message ||
            "Capacity development & Skills enhancement removed successfully!"
        );
        fetchCDSData();
      } catch (error) {
        toast.error(
          "Failed to remove Capacity development & Skills enhancement. Please try again."
        );
        console.error(
          "Error deleting Capacity development & Skills enhancement:",
          error
        );
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };
  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
  };

  const lifeSkills = [
    { value: "Yoga", label: "Yoga" },
    { value: "Physical fitness", label: "Physical fitness" },
    { value: "Health", label: "Health" },
    { value: "Hygiene", label: "Hygiene" },
  ];

  const capType = [
    { value: "Digital Literacy", label: "Digital Literacy" },
    { value: "Data Literacy", label: "Data Literacy" },
    { value: "AI Literacy", label: "AI Literacy" },
  ];

  // Handle file download actions
  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(
          `/studentStrengthProgramWise/download/${fileName}`,
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
        toast.error("Failed to download excel file. Please try again.");
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
        `/studentStrengthProgramWise/deleteTotalStudStrengthDocument?totalStudentStrengthId=${editId}`,
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
      academicYear: null as { value: string; label: string } | null,
      lifeSkills: null as { value: string | number; label: string } | null,
      type: null as { value: string | number; label: string } | null,
      LanguageAndCommunication: "",
      awarenessOfTrends: "",
      qualification: "",
      file: null as File | string | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select an academic year"),
      lifeSkills: Yup.object()
        .nullable()
        .required("Please select faculty type"),
      type: Yup.object().nullable().required("Please select Type"),
      awarenessOfTrends: Yup.string().required(
        "Please enter awareness of trends in technology"
      ),
      LanguageAndCommunication: Yup.string().required(
        "Please enter Language And Communication skills"
      ),
      qualification: Yup.string().required("Please enter qualification"),
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
      const payload = {
        lifeSkills: values.lifeSkills?.value || "",
        type: values.type?.value || "",
        academicExperience: values.LanguageAndCommunication || 0,
        industrialExperience: values.awarenessOfTrends || 0,
      };

      // If editing, include the ID
      if (isEditMode && editId) {
        payload["teacherDetailsId"] = editId;
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/teacherDetails/update`, payload);
          toast.success(
            response.message ||
              "Capacity development & Skills enhancement updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create("/teacherDetails/save", payload);
          toast.success(
            response.message ||
              "Capacity development & Skills enhancement added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        handleListTeachersClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Capacity development & Skills enhancement. Please try again."
        );
        console.error(
          "Error creating Capacity development & Skills enhancement:",
          error
        );
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Student Activities & Support"
            breadcrumbItem="Capacity Development & Skills Enhancement"
          />
          <Card>
            <CardBody>
              <form onSubmit={validation.handleSubmit}>
                <Row>
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

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Soft skills</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.qualification &&
                          validation.errors.qualification
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.qualification}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "qualification",
                            e.target.value
                          )
                        }
                        placeholder="Enter soft skills"
                      />
                      {validation.touched.qualification &&
                        validation.errors.qualification && (
                          <div className="text-danger">
                            {validation.errors.qualification}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Language and communication skills</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.LanguageAndCommunication &&
                          validation.errors.LanguageAndCommunication
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.LanguageAndCommunication}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "LanguageAndCommunication",
                            e.target.value
                          )
                        }
                        placeholder="Enter Language and communication skills"
                      />
                      {validation.touched.LanguageAndCommunication &&
                        validation.errors.LanguageAndCommunication && (
                          <div className="text-danger">
                            {validation.errors.LanguageAndCommunication}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Life Skills</Label>
                      <Select
                        options={lifeSkills}
                        value={validation.values.lifeSkills}
                        onChange={(selectedOptions) =>
                          validation.setFieldValue(
                            "lifeSkills",
                            selectedOptions
                          )
                        }
                        placeholder="Select Life Skills"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.lifeSkills &&
                          validation.errors.lifeSkills
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.lifeSkills &&
                        validation.errors.lifeSkills && (
                          <div className="text-danger">
                            {validation.errors.lifeSkills}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Type</Label>
                      <Select
                        options={capType}
                        value={validation.values.type}
                        onChange={(selectedOptions) =>
                          validation.setFieldValue("type", selectedOptions)
                        }
                        placeholder="Select Type"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.type && validation.errors.type
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.type && validation.errors.type && (
                        <div className="text-danger">
                          {validation.errors.type}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Awareness of trends in technology</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.awarenessOfTrends &&
                          validation.errors.awarenessOfTrends
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.awarenessOfTrends}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "awarenessOfTrends",
                            e.target.value
                          )
                        }
                        placeholder="Enter awareness of trends in technology"
                      />
                      {validation.touched.awarenessOfTrends &&
                        validation.errors.awarenessOfTrends && (
                          <div className="text-danger">
                            {validation.errors.awarenessOfTrends}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload a report on initiatives taken by the department
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Download Capacity Development Dept Year</Label>
                      <div>
                        <a
                          href="/templateFiles/bos.pdf"
                          download
                          className="btn btn-primary btn-sm"
                        >
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
                        {isEditMode ? "Update" : "Save"}
                      </button>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={handleListTeachersClick}
                      >
                        List
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Capacity development & Skills enhancement */}
        <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>List Teacher Details</ModalHeader>
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
                    Soft Skills
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.qualification}
                      onChange={(e) => handleFilterChange(e, "qualification")}
                    />
                  </th>
                  <th>
                    Language and Communication Skills
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.LanguageAndCommunication}
                      onChange={(e) =>
                        handleFilterChange(e, "LanguageAndCommunication")
                      }
                    />
                  </th>
                  <th>
                    Life Skills
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.lifeSkills}
                      onChange={(e) => handleFilterChange(e, "lifeSkills")}
                    />
                  </th>
                  <th>
                    Type
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.type}
                      onChange={(e) => handleFilterChange(e, "type")}
                    />
                  </th>
                  <th>
                    Qualification
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.qualification}
                      onChange={(e) => handleFilterChange(e, "qualification")}
                    />
                  </th>

                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((cds, index) => (
                    <tr key={cds.teacherDetailsId}>
                      <td>{index + 1}</td>
                      <td>{cds.academicYear}</td>
                      <td>{cds.softSkills}</td>
                      <td>{cds.streamName}</td>
                      <td>{cds.departmentName}</td>
                      <td>{cds.type}</td>
                      <td>{cds.qualification}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(cds.teacherDetailsId)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(cds.teacherDetailsId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No Capacity development & Skills enhancement data
                      available.
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

export default CapacityDevelopment_Skills;
