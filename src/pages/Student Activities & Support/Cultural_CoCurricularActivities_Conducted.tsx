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
} from "reactstrap";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast, ToastContainer } from "react-toastify";
import moment from "moment";
import { Tooltip } from "@mui/material";
import AssociationDropdown from "Components/DropDowns/AssociationDropdown";

const api = new APIClient();

const Cultural_CoCurricularActivities_Conducted: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ccacData, setCCACData] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(ccacData);
  const [filters, setFilters] = useState({
    academicYear: "",
    level: "",
    type: "",
    noOfParticipants: "",
    hostingClgNme: "",
    studentName: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLInputElement | null>(null);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = ccacData.filter((row) =>
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

    const filtered = ccacData.filter((row) =>
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

  // Fetch Cultural & Co-Curricular activities conducted in the college data from the backend
  const fetchCCACData = async () => {
    try {
      const response = await axios.get("/cocurricularActivities/getAll"); // Replace with your backend API endpoint
      setCCACData(response);
      setFilteredData(response);
    } catch (error) {
      console.error(
        "Error fetching Cultural & Co-Curricular activities conducted in the college data:",
        error
      );
    }
  };

  // Open the modal and fetch data
  const handleListCCACClick = () => {
    toggleModal();
    fetchCCACData();
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
  // Fetch the data for the selected Cultural & Co-Curricular activities conducted in the college ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/cocurricularActivities/edit?intercollegiateEventsId=${id}`,
        ""
      );

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
      // Map API response to Formik values
      const mappedValues = {
        noOfParticipants: response.noOfParticipants || "",
        academicYear: mapValueToLabel(response.academicYear, academicYearList),
        stream: response.streamId
          ? { value: response.streamId.toString(), label: response.streamName }
          : null,
        department: response.departmentId
          ? {
              value: response.departmentId.toString(),
              label: response.departmentName,
            }
          : null,
        association: response.associationId
          ? {
              value: response.associationId.toString(),
              label: response.associationName,
            }
          : null,
        fromDate: response.fromDate,
        toDate: response.toDate,
        eventTitle: response.eventTitle || "",
        file: response.documents?.CoCurricularActivities || null,
        imageStudent: response.documents?.studentImage || null,
      };

      // Update Formik values
      validation.setValues({
        ...mappedValues,
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
        noOfParticipants: response.noOfParticipants || "",
        fromDate: mappedValues.fromDate || "",
        toDate: mappedValues.toDate || "",
      });
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error(
        "Error fetching Cultural & Co-Curricular activities conducted in the college data by ID:",
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
  // Call the delete API and refresh the Cultural & Co-Curricular activities conducted in the college data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/cocurricularActivities/deleteCocurricularActivities?cocurricularActivitiesId=${id}`,
          ""
        );
        toast.success(
          response.message ||
            "Cultural & Co-Curricular activities conducted in the college removed successfully!"
        );
        fetchCCACData();
      } catch (error) {
        toast.error(
          "Failed to remove Cultural & Co-Curricular activities conducted in the college. Please try again."
        );
        console.error(
          "Error deleting Cultural & Co-Curricular activities conducted in the college:",
          error
        );
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
          `/cocurricularActivities/download/${fileName}`,
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

  const handleDeleteFile = async (fileName: string, docType: string) => {
    try {
      const response = await api.delete(
        `/cocurricularActivities/deleteCocurricularActivitiesDocument?cocurricularActivitiesId=${editId}&docType=${docType}`,
        ""
      );
      toast.success(response.message || "File deleted successfully!");
      if (docType === "CoCurricularActivities") {
        validation.setFieldValue("file", null);
      }
      if (docType === "studentImage") {
        validation.setFieldValue("imageStudent", null);
      }
      setIsFileUploadDisabled(false); // Enable the file upload button
    } catch (error) {
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      association: null as { value: string; label: string } | null,
      noOfParticipants: "",
      fromDate: "",
      toDate: "",
      eventTitle: "",
      file: null as File | string | null,
      imageStudent: null as File | string | null,
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
      eventTitle: Yup.string().required("Please enter eventTitle"),
      noOfParticipants: Yup.string().required(
        "Please enter no. of participants"
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
          const allowedTypes = ["application/pdf"];
          if (value instanceof File && !allowedTypes.includes(value.type)) {
            return this.createError({ message: "Unsupported file format" });
          }
          return true;
        }
      ),
      imageStudent: Yup.mixed().test(
        "fileValidation",
        "Please upload a valid JPEG file",
        function (value) {
          if (isFileUploadDisabled) {
            return true;
          }
          if (!value) {
            return this.createError({ message: "Please upload a file" });
          }
          // Limit to 10MB for JPEG
          if (value instanceof File && value.size > 10 * 1024 * 1024) {
            return this.createError({ message: "File size is too large" });
          }
          const allowedTypes = ["image/jpeg"]; // Only JPEG allowed
          if (value instanceof File && !allowedTypes.includes(value.type)) {
            return this.createError({ message: "Only JPEG format is allowed" });
          }
          return true;
        }
      ),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("academicYear", values.academicYear?.value || "");
        formData.append("streamId", values.stream?.value || "");
        formData.append("departmentId", values.department?.value || "");
        formData.append("associationId", values.association?.value || "");
        formData.append("noOfParticipants", values.noOfParticipants);
        formData.append("eventTitle", values.eventTitle || "");
        formData.append("noOfParticipants", values.noOfParticipants || "");
        // If the date is provided, format it to YYYY-MM-DD
        if (values.fromDate) {
          const formattedDate = moment(values.fromDate, "DD/MM/YYYY").format(
            "DD/MM/YYYY"
          );
          formData.append("fromDate", formattedDate);
        }
        if (values.toDate) {
          const formattedDate = moment(values.toDate, "DD/MM/YYYY").format(
            "DD/MM/YYYY"
          );
          formData.append("toDate", formattedDate);
        }
        if (isEditMode && typeof values.file === "string") {
          // Pass an empty PDF instead of null
          formData.append(
            "coCurricularActivities",
            new Blob([], { type: "application/pdf" }),
            "empty.pdf"
          );
        } else if (isEditMode && values.file === null) {
          formData.append(
            "coCurricularActivities",
            new Blob([], { type: "application/pdf" }),
            "empty.pdf"
          );
        } else if (values.file) {
          formData.append("coCurricularActivities", values.file);
        }
        if (isEditMode && typeof values.imageStudent === "string") {
          // Pass an empty JPEG instead of null
          formData.append(
            "studentImage",
            new Blob([], { type: "image/jpeg" }),
            "empty.jpg"
          );
        } else if (isEditMode && values.imageStudent === null) {
          formData.append(
            "studentImage",
            new Blob([], { type: "image/jpeg" }),
            "empty.jpg"
          );
        } else if (values.imageStudent) {
          formData.append("studentImage", values.imageStudent);
        }
        // If in edit mode, append the edit ID
        if (isEditMode && editId) {
          formData.append("coCurricularActivityId", editId);
        }

        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/cocurricularActivities/update`,
            formData
          );
          toast.success(
            response.message ||
              "Cultural & Co-Curricular activities conducted in the college updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/cocurricularActivities/save",
            formData
          );
          toast.success(
            response.message ||
              "Cultural & Co-Curricular activities conducted in the college added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        if (imgRef.current) {
          imgRef.current.value = "";
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        handleListCCACClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Cultural & Co-Curricular activities conducted in the college. Please try again."
        );
        console.error(
          "Error creating Cultural & Co-Curricular activities conducted in the college:",
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
            breadcrumbItem="Cultural & Co-Curricular activities conducted in the college"
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

                  {/* Department Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Association</Label>
                      <AssociationDropdown
                        value={validation.values.association}
                        onChange={(selectedOption) => {
                          validation.setFieldValue(
                            "association",
                            selectedOption
                          );
                        }}
                        isInvalid={
                          validation.touched.association &&
                          !!validation.errors.association
                        }
                      />
                      {validation.touched.association &&
                        validation.errors.association && (
                          <div className="text-danger">
                            {validation.errors.association}
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
                      <Label>Event Title</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.eventTitle &&
                          validation.errors.eventTitle
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.eventTitle}
                        onChange={(e) =>
                          validation.setFieldValue("eventTitle", e.target.value)
                        }
                        placeholder="Enter event name"
                      />
                      {validation.touched.eventTitle &&
                        validation.errors.eventTitle && (
                          <div className="text-danger">
                            {validation.errors.eventTitle}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>No. of Participants</Label>
                      <Input
                        type="number"
                        className={`form-control ${
                          validation.touched.noOfParticipants &&
                          validation.errors.noOfParticipants
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.noOfParticipants}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "noOfParticipants",
                            e.target.value
                          )
                        }
                        placeholder="Enter No. of Participants"
                      />
                      {validation.touched.noOfParticipants &&
                        validation.errors.noOfParticipants && (
                          <div className="text-danger">
                            {validation.errors.noOfParticipants}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Participation/Winning
                      </Label>
                      <Tooltip
                        placement="right"
                        open={tooltipOpen}
                        onClose={() => setTooltipOpen(false)}
                        onOpen={() => setTooltipOpen(true)}
                        title={<span>Upload file. Max size 10MB.</span>}
                        arrow
                      >
                        <i
                          id="infoIcon"
                          className="bi bi-info-circle ms-2"
                          style={{ cursor: "pointer", color: "#0d6efd" }}
                        ></i>
                      </Tooltip>
                      <Input
                        className={`form-control ${
                          validation.touched.file && validation.errors.file
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        innerRef={fileRef} // Use ref to reset the file input
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
                            onClick={() =>
                              handleDeleteFile(
                                validation.values.file as string,
                                "CoCurricularActivities"
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
                        Upload Image of Students
                      </Label>
                      <Tooltip
                        placement="right"
                        open={tooltipOpen}
                        onClose={() => setTooltipOpen(false)}
                        onOpen={() => setTooltipOpen(true)}
                        title={<span>Upload Jpeg. Max size 10MB.</span>}
                        arrow
                      >
                        <i
                          id="infoIcon"
                          className="bi bi-info-circle ms-2"
                          style={{ cursor: "pointer", color: "#0d6efd" }}
                        ></i>
                      </Tooltip>
                      <Input
                        className={`form-control ${
                          validation.touched.imageStudent &&
                          validation.errors.imageStudent
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        innerRef={imgRef} // Use ref to reset the file input
                        onChange={(event) => {
                          validation.setFieldValue(
                            "imageStudent",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        accept="image/jpeg" // Accept only image files
                        disabled={isFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.imageStudent &&
                        validation.errors.imageStudent && (
                          <div className="text-danger">
                            {validation.errors.imageStudent}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.imageStudent === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.imageStudent}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.imageStudent as string
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
                                validation.values.imageStudent as string,
                                "studentImage"
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
                        onClick={handleListCCACClick}
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
        {/* Modal for Listing Cultural & Co-Curricular activities conducted in the college */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "90%" }}
        >
          <ModalHeader toggle={toggleModal}>List Cultural & Co-Curricular activities conducted in the college</ModalHeader>
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
                  <th>School</th>
                  <th>Department</th>
                  <th>Association</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Event Title</th>
                  <th>No. of Participants</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((cds, index) => (
                    <tr key={cds.coCurricularActivityId}>
                      <td>{index + 1}</td>
                      <td>{cds.academicYear}</td>
                      <td>{cds.streamName}</td>
                      <td>{cds.departmentName}</td>
                      <td>{cds.associationName}</td>
                      <td>{cds.fromDate}</td>
                      <td>{cds.toDate}</td>
                      <td>{cds.eventTitle}</td>
                      <td>{cds.noOfParticipants}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() =>
                              handleEdit(cds.coCurricularActivityId)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleDelete(cds.coCurricularActivityId)
                            }
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
                      No Cultural & Co-Curricular activities conducted in the
                      college data available.
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

export default Cultural_CoCurricularActivities_Conducted;
