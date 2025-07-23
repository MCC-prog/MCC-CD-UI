import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Col,
  Row,
  Input,
  Label,
  Button,
  CardBody,
  Card,
  Container,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Modal,
  ModalHeader,
  ModalBody,
  Table,
  ModalFooter,
} from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import { APIClient } from "../../helpers/api_helper";
import { toast, ToastContainer } from "react-toastify";
import moment from "moment";
import axios from "axios";

const api = new APIClient();

// Ensure the file exports a default module
const Research_Publications = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variable for managing file upload status
  const [isFrontPageFileUploadDisabled, setIsFrontPageFileUploadDisabled] =
    useState(false);
  const [
    isResearchArticleFileUploadDisabled,
    setIsResearchArticleFileUploadDisabled,
  ] = useState(false);
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  const [researchPaperData, setResearchPaperData] = useState<any[]>([]);
  // State variable for managing the modal for listing BOS
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State variable for managing search term and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  // State variable for managing filters
  const [filters, setFilters] = useState({
    academicYear: "",
    facultyName: "",
    coAuthors: "",
    stream: "",
    department: "",
    indexation: "",
    journalName: "",
    paperTitle: "",
    issn: "",
    publisher: "",
    publicationDate: "",
  });
  const [filteredData, setFilteredData] = useState(researchPaperData);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = researchPaperData.filter((row) =>
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

    const filtered = researchPaperData.filter((row) =>
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

  // Formik validation and submission
  // Initialize Formik with validation schema and initial values

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      facultyName: "",
      coAuthors: "",
      indexation: null as { value: string; label: string } | null,
      journalName: "",
      titleOfPaper: "",
      volume: "",
      issue: "",
      pageNumber: "",
      issxl: "",
      doi: "",
      publicationDate: "",
      publisher: "",
      researchPublication: null as File | null,
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
        (department: any, schema) =>
          department?.value === "Others"
            ? schema.required("Please specify the department")
            : schema.nullable()
      ),
      facultyName: Yup.string().required("Please enter faculty name"),
      coAuthors: Yup.string().required("Please enter co-authors"),
      indexation: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select indexation"),
      journalName: Yup.string().required("Please enter journal name"),
      titleOfPaper: Yup.string().required("Please enter title of paper"),
      volume: Yup.string().required("Please enter volume"),
      issue: Yup.string().required("Please enter issue"),
      pageNumber: Yup.number()
        .required("Please enter page number")
        .positive("Page number must be positive")
        .integer("Page number must be an integer"),
      issxl: Yup.string().required("Please enter ISSXL"),
      doi: Yup.string().required("Please enter DOI"),
      publicationDate: Yup.date().required("Please select from date"),
      publisher: Yup.string().required("Please enter publisher"),
      researchPublication: Yup.mixed().test(
        "fileValidation",
        "Please upload a valid file",
        function (value) {
          // Skip validation if the file upload is disabled (file exists)
          if (isResearchArticleFileUploadDisabled) {
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

      // Create a plain JavaScript object from form values
      formData.append("researchPublicationId", editId || "");
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append("facultyName", values.facultyName);
      formData.append("coAuthors", values.coAuthors);
      formData.append("indexation", values.indexation?.value || "");
      formData.append("journalName", values.journalName);
      formData.append("paperTitle", values.titleOfPaper);
      formData.append("volume", values.volume);
      formData.append("issue", values.issue);
      formData.append("pageNumber", values.pageNumber);
      formData.append("issn", values.issxl);
      formData.append("doi", values.doi);
      formData.append(
        "publicationDate",
        values.publicationDate
          ? moment(values.publicationDate, "YYYY-MM-DD").format("DD/MM/YYYY")
          : ""
      );
      formData.append("publisher", values.publisher);
      formData.append("otherDepartment", values.otherDepartment || "");
      // Append files if they exist
      if (values.researchPublication) {
        formData.append("researchPublication", values.researchPublication);
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/researchPublication/update`,
            formData
          );
          toast.success(
            response.message || "Research Publication updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/researchPublication/save",
            formData
          );
          toast.success(
            response.message || "Research Publication added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // Display the Research Publication List
        handleListResearchClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Research Publication. Please try again.");
        console.error("Error creating/updating Research Publication:", error);
      }
    },
  });

  const fetchResearchData = async () => {
    try {
      const response = await api.get("/researchPublication/getAll", "");
      setResearchPaperData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching BOS data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListResearchClick = () => {
    toggleModal();
    fetchResearchData();
  };

  // Handle edit action
  // Fetch the data for the selected BOS ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/researchPublication/edit?researchPublicationId=${id}`,
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
        facultyName: response.facultyName || "",
        coAuthors: response.coAuthors || "",
        indexation: response.indexation
          ? {
              value: response.indexation.toString(),
              label: response.indexation,
            }
          : null,
        journalName: response.journalName || "",
        titleOfPaper: response.paperTitle || "",
        volume: response.volume || "",
        issue: response.issue || "",
        pageNumber: response.pageNumber || "",
        issxl: response.issn || "",
        doi: response.doi || "",
        publicationDate: response.publicationDate
          ? moment(response.publicationDate, "DD/MM/YYYY").isValid()
            ? moment(response.publicationDate, "DD/MM/YYYY").format(
                "YYYY-MM-DD"
              )
            : ""
          : "",
        publisher: response.publisher || "",
        otherDepartment: "", // Add default value for otherDepartment
        researchPublication: response.documents.researchPublication, // File uploads are not pre-filled
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
        stream: mappedValues.stream
          ? { ...mappedValues.stream, value: String(mappedValues.stream.value) }
          : null,
        department: mappedValues.department
          ? {
              ...mappedValues.department,
              value: String(mappedValues.department.value),
            }
          : null,
        indexation: mappedValues.indexation
          ? {
              ...mappedValues.indexation,
              value: String(mappedValues.indexation.value),
            }
          : null,
      });

      // Set edit mode and toggle modal
      setIsEditMode(true);
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error("Error fetching Research Publication data by ID:", error);
    }
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

  function handleDelete(researchDataId: any): void {
    setDeleteId(researchDataId);
    setIsDeleteModalOpen(true);
  }

  // Confirm deletion of the record
  // Call the delete API and refresh the BOS data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/researchPublication/delete?researchPublicationId=${id}`,
          ""
        );
        toast.success(
          response.message ||
            "Research Publication record removed successfully!"
        );
        fetchResearchData();
      } catch (error) {
        toast.error("Failed to remove Research Record. Please try again.");
        console.error("Error deleting Research:", error);
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
          `/researchPublication/download/${fileName}`,
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
        toast.error(
          "Failed to download research publication file. Please try again."
        );
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
        `/researchPublication/deleteResearchPublicationDocument?researchPublicationId=${editId}&docType=researchPublication`,
        ""
      );
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      // Remove the file from the form
      validation.setFieldValue("researchPublication", null); // Clear the file from Formik state
      setIsFrontPageFileUploadDisabled(false); // Enable the file upload button
    } catch (error) {
      // Show error message
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Research" breadcrumbItem="Research Publications" />
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
                            {typeof validation.errors.academicYear ===
                              "string" && validation.errors.academicYear}
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
                            {typeof validation.errors.stream === "string" &&
                              validation.errors.stream}
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
                            {typeof validation.errors.department === "string" &&
                              validation.errors.department}
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
                          className={`form-control ${
                            validation.touched.otherDepartment &&
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
                              {typeof validation.errors.otherDepartment ===
                                "string" && validation.errors.otherDepartment}
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
                        name="facultyName"
                        value={validation.values.facultyName}
                        onChange={validation.handleChange}
                        className={`form-control ${
                          validation.touched.facultyName &&
                          validation.errors.facultyName
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter Faculty Name"
                      />
                      {validation.touched.facultyName &&
                        validation.errors.facultyName && (
                          <div className="text-danger">
                            {typeof validation.errors.facultyName ===
                              "string" && validation.errors.facultyName}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Co-authors</Label>
                      <Input
                        type="text"
                        name="coAuthors"
                        value={validation.values.coAuthors}
                        onChange={validation.handleChange}
                        className={`form-control ${
                          validation.touched.coAuthors &&
                          validation.errors.coAuthors
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter Co-authors"
                      />
                      {validation.touched.coAuthors &&
                        validation.errors.coAuthors && (
                          <div className="text-danger">
                            {typeof validation.errors.coAuthors === "string" &&
                              validation.errors.coAuthors}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Indexation</Label>
                      <Input
                        type="select"
                        value={validation.values.indexation?.value || ""}
                        onChange={(e) =>
                          validation.setFieldValue("indexation", {
                            value: e.target.value,
                            label: e.target.value,
                          })
                        }
                        className={`form-control ${
                          validation.touched.indexation &&
                          validation.errors.indexation
                            ? "is-invalid"
                            : ""
                        }`}
                      >
                        <option value="">Select Indexation</option>
                        <option value="Scopus">Scopus</option>
                        <option value="Web of Science">Web of Science</option>
                        <option value="ABDC">ABDC</option>
                        <option value="UGC">UGC</option>
                      </Input>
                      {validation.touched.indexation &&
                        validation.errors.indexation && (
                          <div className="text-danger">
                            {typeof validation.errors.indexation === "string" &&
                              validation.errors.indexation}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Journal Name</Label>
                      <Input
                        type="text"
                        name="journalName"
                        value={validation.values.journalName}
                        onChange={validation.handleChange}
                        className={`form-control ${
                          validation.touched.journalName &&
                          validation.errors.journalName
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter Journal Name"
                      />
                      {validation.touched.journalName &&
                        validation.errors.journalName && (
                          <div className="text-danger">
                            {typeof validation.errors.journalName ===
                              "string" && validation.errors.journalName}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Title of Paper</Label>
                      <Input
                        type="text"
                        name="titleOfPaper"
                        value={validation.values.titleOfPaper}
                        onChange={validation.handleChange}
                        className={`form-control ${
                          validation.touched.titleOfPaper &&
                          validation.errors.titleOfPaper
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter Title of Paper"
                      />
                      {validation.touched.titleOfPaper &&
                        validation.errors.titleOfPaper && (
                          <div className="text-danger">
                            {typeof validation.errors.titleOfPaper ===
                              "string" && validation.errors.titleOfPaper}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Volume</Label>
                      <Input
                        type="text"
                        name="volume"
                        value={validation.values.volume}
                        onChange={validation.handleChange}
                        className={`form-control ${
                          validation.touched.volume && validation.errors.volume
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter Volume"
                      />
                      {validation.touched.volume &&
                        validation.errors.volume && (
                          <div className="text-danger">
                            {typeof validation.errors.volume === "string" &&
                              validation.errors.volume}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Issue</Label>
                      <Input
                        type="text"
                        name="issue"
                        value={validation.values.issue}
                        onChange={validation.handleChange}
                        className={`form-control ${
                          validation.touched.issue && validation.errors.issue
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter Issue"
                      />
                      {validation.touched.issue && validation.errors.issue && (
                        <div className="text-danger">
                          {typeof validation.errors.issue === "string" &&
                            validation.errors.issue}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Page Number</Label>
                      <Input
                        type="number"
                        name="pageNumber"
                        value={validation.values.pageNumber}
                        onChange={validation.handleChange}
                        className={`form-control ${
                          validation.touched.pageNumber &&
                          validation.errors.pageNumber
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter Page Number"
                      />
                      {validation.touched.pageNumber &&
                        validation.errors.pageNumber && (
                          <div className="text-danger">
                            {typeof validation.errors.pageNumber === "string" &&
                              validation.errors.pageNumber}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>ISSXL</Label>
                      <Input
                        type="text"
                        name="issxl"
                        value={validation.values.issxl}
                        onChange={validation.handleChange}
                        className={`form-control ${
                          validation.touched.issxl && validation.errors.issxl
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter ISSXL"
                      />
                      {validation.touched.issxl && validation.errors.issxl && (
                        <div className="text-danger">
                          {typeof validation.errors.issxl === "string" &&
                            validation.errors.issxl}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>DOI</Label>
                      <Input
                        type="text"
                        name="doi"
                        value={validation.values.doi}
                        onChange={validation.handleChange}
                        className={`form-control ${
                          validation.touched.doi && validation.errors.doi
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter DOI"
                      />
                      {validation.touched.doi && validation.errors.doi && (
                        <div className="text-danger">
                          {typeof validation.errors.doi === "string" &&
                            validation.errors.doi}
                        </div>
                      )}
                    </div>
                  </Col>

                  {/* Date of Publication */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Date of Publication</Label>
                      <Input
                        type="date"
                        className={`form-control ${
                          validation.touched.publicationDate &&
                          validation.errors.publicationDate
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.publicationDate || ""}
                        onChange={(e) => {
                          validation.setFieldValue(
                            "publicationDate",
                            e.target.value
                          ); // Store as YYYY-MM-DD
                        }}
                        placeholder="dd/mm/yyyy"
                      />
                      {validation.touched.publicationDate &&
                        validation.errors.publicationDate && (
                          <div className="text-danger">
                            {typeof validation.errors.publicationDate ===
                              "string" && validation.errors.publicationDate}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Publisher</Label>
                      <Input
                        type="text"
                        name="publisher"
                        value={validation.values.publisher}
                        onChange={validation.handleChange}
                        className={`form-control ${
                          validation.touched.publisher &&
                          validation.errors.publisher
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter Publisher"
                      />
                      {validation.touched.publisher &&
                        validation.errors.publisher && (
                          <div className="text-danger">
                            {typeof validation.errors.publisher === "string" &&
                              validation.errors.publisher}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>First Page Research Article Uplaod</Label>
                      <Input
                        type="file"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "researchPublication",
                            e.target.files?.[0] || null
                          )
                        }
                        className={`form-control ${
                          validation.touched.researchPublication &&
                          validation.errors.researchPublication
                            ? "is-invalid"
                            : ""
                        }`}
                        disabled={isFrontPageFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.researchPublication &&
                        validation.errors.researchPublication && (
                          <div className="text-danger">
                            {validation.errors.researchPublication}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFrontPageFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.researchPublication ===
                        "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.researchPublication}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() => {
                              if (
                                typeof validation.values.researchPublication ===
                                "string"
                              ) {
                                handleDownloadFile(
                                  validation.values.researchPublication
                                );
                              }
                            }}
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
                        onClick={handleListResearchClick}
                      >
                        List RP's
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
          <ModalHeader toggle={toggleModal}>
            List Research Publications
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
                  <th>Academic Year</th>
                  <th>Faculty Name</th>
                  <th>Co-authors</th>
                  <th>Stream</th>
                  <th>Department</th>
                  <th>Indexation</th>
                  <th>JournalName</th>
                  <th>PaperTitle</th>
                  <th>ISSN</th>
                  <th>PublicationDate</th>
                  <th>Publisher</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((research, index) => (
                    <tr key={research.researchPublicationId}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{research.academicYear}</td>
                      <td>{research.facultyName}</td>
                      <td>{research.coAuthors}</td>
                      <td>{research.streamName}</td>
                      <td>{research.departmentName}</td>
                      <td>{research.indexation}</td>
                      <td>{research.journalName}</td>
                      <td>{research.paperTitle}</td>
                      <td>{research.issn}</td>
                      <td>{research.publicationDate}</td>
                      <td>{research.publisher}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() =>
                              handleEdit(research.researchPublicationId)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleDelete(research.researchPublicationId)
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
                    <td colSpan={11} className="text-center">
                      No Research data available.
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

export default Research_Publications;
