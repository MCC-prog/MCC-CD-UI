import axios from "axios";
import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import Select from "react-select";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
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
  Tooltip,
} from "reactstrap";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { co } from "@fullcalendar/core/internal-common";

const api = new APIClient();

const Conference_Seminars_Workshops: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cswData, setCSWData] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(cswData);
  const [filters, setFilters] = useState({
    academicYear: "",
    stream: "",
    department: "",
    level: "",
    funding: "",
    collaboratingOrg: "",
    amount: "",
    fromDate: "",
    toDate: "",
    location: "",
    conferenceTitle: "",
    collaboratingOrganisation: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const brochureRef = useRef<HTMLInputElement | null>(null);
  const conferenceRef = useRef<HTMLInputElement | null>(null);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = cswData.filter((row) =>
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

    const filtered = cswData.filter((row) =>
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

  // Fetch Conference, Seminars & Workshops data from the backend
  const fetchCSWData = async () => {
    try {
      const response = await axios.get("/conference/getAll"); // Replace with your backend API endpoint
      setCSWData(response);
      setFilteredData(response);
    } catch (error) {
      console.error(
        "Error fetching Conference, Seminars & Workshops data:",
        error
      );
    }
  };

  // Open the modal and fetch data
  const handleListCSWClick = () => {
    toggleModal();
    fetchCSWData();
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
  // Fetch the data for the selected Conference, Seminars & Workshops ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(`/conference/edit?conferenceId=${id}`, "");
      if (!response) {
        toast.error("No data found for the selected ID.");
        return;
      }

      // Map API response to Formik values
      const mappedValues = {
        level: mapValueToLabel(
          response.level,
          level // Assuming you have a level options array
        ),
        funding: mapValueToLabel(
          response.funding,
          capType // Assuming you have a capType options array
        ),
        collaboratingOrg: response.collaboratingOrganisation || "",
        amount: response.amount || "",
        TOTCSWT: response.conferenceTitle || "",
        brochure: response.documents?.brochure || null,
        conference: response.documents?.conference || null,
        academicYear: response.academicYear
          ? { value: response.academicYear, label: response.academicYear }
          : null,
        stream: response.streamId
          ? { value: response.streamId.toString(), label: response.streamName }
          : null,
        department: response.departmentId
          ? {
              value: response.departmentId.toString(),
              label: response.departmentName,
            }
          : null,
        fromDate: response.fromDate
          ? moment(response.fromDate, "DD/MM/YYYY").format("DD/MM/YYYY")
          : "",

        toDate: response.toDate
          ? moment(response.toDate, "DD/MM/YYYY").format("DD/MM/YYYY")
          : "",

        location: response.location || "",
      };
      const streamOption = mapValueToLabel(response.streamId, []); // Replace [] with stream options array if available
      const departmentOption = mapValueToLabel(response.departmentId, []); // Replace [] with department options array if available

      // Update Formik values
      validation.setValues({
        ...mappedValues,
        level: mapValueToLabel(response.level, level),
        funding: mapValueToLabel(response.funding, capType),
      });
      setSelectedStream(streamOption);
      setSelectedDepartment(departmentOption);

      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error(
        "Error fetching Conference, Seminars & Workshops data by ID:",
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
  // Call the delete API and refresh the Conference, Seminars & Workshops data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/conference/deleteConference?conferenceId=${id}`,
          ""
        );
        toast.success(
          response.message ||
            "Conference, Seminars & Workshops removed successfully!"
        );
        fetchCSWData();
      } catch (error) {
        toast.error(
          "Failed to remove Conference, Seminars & Workshops. Please try again."
        );
        console.error(
          "Error deleting Conference, Seminars & Workshops:",
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

  const level = [
    { value: "International", label: "International" },
    { value: "National", label: "National" },
    { value: "State", label: "State" },
    { value: "Institutional", label: "Institutional" },
  ];

  const capType = [
    { value: "Institutional", label: "Institutional" },
    { value: "Others", label: "Others" },
  ];

  // Handle file download actions
  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(`/conference/download/${fileName}`, {
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
        toast.error("Failed to download excel file. Please try again.");
        console.error("Error downloading file:", error);
      }
    } else {
      toast.error("No file available for download.");
    }
  };

  // Handle file deletion
  // Clear the file from the form and show success message
  const handleDeleteFile = async (fileName: string, docType: string) => {
    try {
      // Call the delete API
      const response = await api.delete(
        `/conference/deleteConferenceDocuments?conferenceId=${editId}&docType=${docType}`,
        ""
      );
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      // Remove the file from the form
      if (docType === "brochure") {
        validation.setFieldValue("brochure", null);
      } else if (docType === "conference") {
        validation.setFieldValue("conference", null);
      }
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
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      level: null as { value: string | number; label: string } | null,
      funding: null as { value: string | number; label: string } | null,
      collaboratingOrg: "",
      amount: "",
      TOTCSWT: "",
      fromDate: "",
      toDate: "",
      location: "",
      brochure: null as File | string | null,
      conference: null as File | string | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select an academic year"),
      stream: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select school"),
      department: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select department"),
      level: Yup.object().nullable().required("Please select level"),
      funding: Yup.object().nullable().required("Please select funding"),
      amount: Yup.number()
        .required("Please enter industry experience")
        .min(0, "Amount cannot be negative"),
      location: Yup.string().required("Please enter location"),
      TOTCSWT: Yup.string().required(
        "Please enter Title of the Conference/Seminar/Workshop Title"
      ),
      fromDate: Yup.string()
        .required("From date is required")
        .test("is-valid-date", "Invalid start date", (value) =>
          moment(value, "DD/MM/YYYY", true).isValid()
        ),
      toDate: Yup.string()
        .required("To date is required")
        .test("is-valid-date", "Invalid start date", (value) =>
          moment(value, "DD/MM/YYYY", true).isValid()
        ),
      brochure: Yup.mixed().test(
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
      conference: Yup.mixed().test(
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
      try {
        const formData = new FormData();
        // Append form values to FormData
        formData.append(
          "academicYear",
          values.academicYear ? values.academicYear.value : ""
        );
        formData.append("streamId", values.stream ? values.stream.value : "");
        formData.append(
          "departmentId",
          values.department ? values.department.value : ""
        );
        formData.append(
          "level",
          values.level ? values.level.value.toString() : ""
        );
        formData.append(
          "funding",
          values.funding ? values.funding.value.toString() : ""
        );
        formData.append("collaboratingOrganisation", values.collaboratingOrg);
        formData.append("amount", values.amount.toString());
        formData.append("conferenceTitle", values.TOTCSWT);
        formData.append(
          "fromDate",
          values.fromDate
            ? moment(values.fromDate, "DD/MM/YYYY").format("DD/MM/YYYY")
            : ""
        );
        formData.append(
          "toDate",
          values.toDate
            ? moment(values.toDate, "DD/MM/YYYY").format("DD/MM/YYYY")
            : ""
        );
        formData.append("location", values.location);

        if (isEditMode && typeof values.brochure === "string") {
          // Pass an empty PDF instead of null
          formData.append(
            "brochure",
            new Blob([], { type: "application/pdf" }),
            "empty.pdf"
          );
        } else if (isEditMode && values.brochure === null) {
          formData.append(
            "brochure",
            new Blob([], { type: "application/pdf" }),
            "empty.pdf"
          );
        } else if (values.brochure) {
          formData.append("brochure", values.brochure);
        }

        if (isEditMode && typeof values.conference === "string") {
          // Pass an empty PDF instead of null
          formData.append(
            "conference",
            new Blob([], { type: "application/pdf" }),
            "empty.pdf"
          );
        } else if (isEditMode && values.conference === null) {
          formData.append(
            "conference",
            new Blob([], { type: "application/pdf" }),
            "empty.pdf"
          );
        } else if (values.conference) {
          formData.append("conference", values.conference);
        }
        // If in edit mode, append the edit ID
        if (isEditMode && editId) {
          formData.append("conferenceId", editId);
        }

        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/conference/update`, formData);
          toast.success(
            response.message ||
              "Conference, Seminars & Workshops updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create("/conference/save", formData);
          toast.success(
            response.message ||
              "Conference, Seminars & Workshops added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (brochureRef.current) {
          brochureRef.current.value = "";
        }
        if (conferenceRef.current) {
          conferenceRef.current.value = "";
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        handleListCSWClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Conference, Seminars & Workshops. Please try again."
        );
        console.error(
          "Error creating Conference, Seminars & Workshops:",
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
            breadcrumbItem="Conference, Seminars & Workshops"
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
                      <Label>Level</Label>
                      <Select
                        options={level}
                        value={validation.values.level}
                        onChange={(selectedOptions) =>
                          validation.setFieldValue("level", selectedOptions)
                        }
                        placeholder="Select Level"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.level && validation.errors.level
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.level && validation.errors.level && (
                        <div className="text-danger">
                          {validation.errors.level}
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
                      <Label>
                        Title of the Conference/Seminar/Workshop Title
                      </Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.TOTCSWT &&
                          validation.errors.TOTCSWT
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.TOTCSWT}
                        onChange={(e) =>
                          validation.setFieldValue("TOTCSWT", e.target.value)
                        }
                        placeholder="Enter Title of the Conference/Seminar/Workshop Title"
                      />
                      {validation.touched.TOTCSWT &&
                        validation.errors.TOTCSWT && (
                          <div className="text-danger">
                            {validation.errors.TOTCSWT}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>From Date</Label>
                      <Input
                        type="date" // Use native date input
                        className={`form-control ${
                          validation.touched.fromDate &&
                          validation.errors.fromDate
                            ? "is-invalid"
                            : ""
                        }`}
                        value={
                          validation.values.fromDate
                            ? moment(
                                validation.values.fromDate,
                                "DD/MM/YYYY"
                              ).format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
                          validation.setFieldValue("fromDate", formattedDate);
                        }}
                        placeholder="dd/mm/yyyy"
                      />
                      {validation.touched.fromDate &&
                        validation.errors.fromDate && (
                          <div className="text-danger">
                            {validation.errors.fromDate}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>To Date</Label>
                      <Input
                        type="date" // Use native date input
                        className={`form-control ${
                          validation.touched.toDate && validation.errors.toDate
                            ? "is-invalid"
                            : ""
                        }`}
                        value={
                          validation.values.toDate
                            ? moment(
                                validation.values.toDate,
                                "DD/MM/YYYY"
                              ).format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
                          validation.setFieldValue("toDate", formattedDate);
                        }}
                        placeholder="dd/mm/yyyy"
                      />
                      {validation.touched.toDate &&
                        validation.errors.toDate && (
                          <div className="text-danger">
                            {validation.errors.toDate}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Collaborating Organization(optional)</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.collaboratingOrg &&
                          validation.errors.collaboratingOrg
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.collaboratingOrg}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "collaboratingOrg",
                            e.target.value
                          )
                        }
                        placeholder="Enter collaborating organization"
                      />
                      {validation.touched.collaboratingOrg &&
                        validation.errors.collaboratingOrg && (
                          <div className="text-danger">
                            {validation.errors.collaboratingOrg}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Location</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.location &&
                          validation.errors.location
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.location}
                        onChange={(e) =>
                          validation.setFieldValue("location", e.target.value)
                        }
                        placeholder="Enter location"
                      />
                      {validation.touched.location &&
                        validation.errors.location && (
                          <div className="text-danger">
                            {validation.errors.location}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Funding</Label>
                      <Select
                        options={capType}
                        value={validation.values.funding}
                        onChange={(selectedOptions) =>
                          validation.setFieldValue("funding", selectedOptions)
                        }
                        placeholder="Select funding"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.funding &&
                          validation.errors.funding
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.funding &&
                        validation.errors.funding && (
                          <div className="text-danger">
                            {validation.errors.funding}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        className={`form-control ${
                          validation.touched.amount && validation.errors.amount
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.amount}
                        onChange={(e) =>
                          validation.setFieldValue("amount", e.target.value)
                        }
                        placeholder="Enter industry experience"
                      />
                      {validation.touched.amount &&
                        validation.errors.amount && (
                          <div className="text-danger">
                            {validation.errors.amount}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Brochure
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
                          validation.touched.brochure &&
                          validation.errors.brochure
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        innerRef={brochureRef}
                        onChange={(event) => {
                          validation.setFieldValue(
                            "brochure",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.brochure &&
                        validation.errors.brochure && (
                          <div className="text-danger">
                            {validation.errors.brochure}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.brochure === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.brochure}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.brochure as string
                              )
                            }
                            title="Download File"
                          >
                            <i className="bi bi-download"></i>
                          </Button>
                          <Button
                            color="link"
                            className="text-danger"
                            onClick={() =>
                              handleDeleteFile(
                                validation.values.brochure as string,
                                "brochure"
                              )
                            }
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
                        Upload Conference/Seminar/workshop
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
                          validation.touched.conference &&
                          validation.errors.conference
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        innerRef={conferenceRef}
                        onChange={(event) => {
                          validation.setFieldValue(
                            "conference",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.conference &&
                        validation.errors.conference && (
                          <div className="text-danger">
                            {validation.errors.conference}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.conference === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.conference}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.conference as string
                              )
                            }
                            title="Download File"
                          >
                            <i className="bi bi-download"></i>
                          </Button>
                          <Button
                            color="link"
                            className="text-danger"
                            onClick={() =>
                              handleDeleteFile(
                                validation.values.conference as string,
                                "conference"
                              )
                            }
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
                      <Label>Download Collaboration/Funding agency</Label>
                      <div>
                        <a
                          href="/templateFiles/bos.pdf"
                          download
                          className="btn btn-primary btn-sm"
                        >
                          Collaboration/Funding agency Template
                        </a>
                      </div>
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Download Feedback Excel</Label>
                      <div>
                        <a
                          href="/templateFiles/bos.pdf"
                          download
                          className="btn btn-primary btn-sm"
                        >
                          Feedback Excel Template
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
                        onClick={handleListCSWClick}
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
        {/* Modal for Listing Conference, Seminars & Workshops */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Conference, Seminars & Workshops
          </ModalHeader>
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
                  <th>Academic Year</th>
                  <th>Level</th>
                  <th>Stream</th>
                  <th>Department</th>
                  <th>Conference Title</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Collaborating Organisation</th>
                  <th>Location</th>
                  <th>Funding</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((cds, index) => (
                    <tr key={cds.conferenceId}>
                      <td>{index + 1}</td>
                      <td>{cds.academicYear}</td>
                      <td>{cds.level}</td>
                      <td>{cds.streamName}</td>
                      <td>{cds.departmentName}</td>
                      <td>{cds.conferenceTitle}</td>
                      <td>{cds.fromDate}</td>
                      <td>{cds.toDate}</td>
                      <td>{cds.collaboratingOrganisation}</td>
                      <td>{cds.location}</td>
                      <td>{cds.funding}</td>
                      <td>{cds.amount}</td>

                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEdit(cds.conferenceId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(cds.conferenceId)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No Conference, Seminars & Workshops data available.
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

export default Conference_Seminars_Workshops;
