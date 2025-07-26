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
import { toast, ToastContainer } from "react-toastify";
import { APIClient } from "helpers/api_helper";
import moment from "moment";
import axios from "axios";

const api = new APIClient();

const Books_Chapters = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variable for managing file upload status
  const [isFrontPageFileUploadDisabled, setIsFrontPageFileUploadDisabled] =
    useState(false);
  // State variable for managing book chapters data
  const [bookChaptersData, setBookChaptersData] = useState<any[]>([]);
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  // State variable for managing the modal for listing BOS
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    coAuthors: "",
    bookTitle: "",
    editor: "",
    publisher: "",
    isbxl: "",
    dateOfPublication: "",
  });
  const [filteredData, setFilteredData] = useState(bookChaptersData);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = bookChaptersData.filter((row) =>
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

    const filtered = bookChaptersData.filter((row) =>
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
  const [selectedType, setSelectedType] = useState<string>("Research Article");

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      facultyName: "",
      coAuthors: "",
      bookTitle: "",
      editor: "",
      isbxl: "",
      publisher: "",
      dateOfPublication: "",
      bookChapter: null as File | null,
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
      bookTitle: Yup.string().required("Please enter book title"),
      editor: Yup.string().required("Please enter editor name"),
      isbxl: Yup.string().required("Please enter ISBXL"),
      bookChapter: Yup.mixed().test(
        "fileValidation",
        "Please upload a valid file",
        function (value) {
          // Skip validation if the file upload is disabled (file exists)
          if (isFrontPageFileUploadDisabled) {
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
      dateOfPublication: Yup.string().required(
        "Please select date of publication"
      ),
      publisher: Yup.string().required("Please enter publisher"),
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("bookChapterId", editId || "");
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("facultyName", values.facultyName || "");
      formData.append("coAuthors", values.coAuthors || "");
      formData.append("bookTitle", String(values.bookTitle || ""));
      formData.append("editor", values.editor || "");
      formData.append("isbn", values.isbxl || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append("publicationDate", values.dateOfPublication || "");
      formData.append("publisher", values.publisher || "");
      formData.append("otherDepartment", values.otherDepartment || "null");

      // Append the file
      if (typeof values.bookChapter === "string") {
        // If the file is just a name, send null
        formData.append("bookChapter", "null");
      } else if (values.bookChapter instanceof File) {
        // If the file is a File object, send the file
        formData.append("bookChapter", values.bookChapter);
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/bookChapter/update`, formData);
          toast.success(
            response.message || "Book Chapter record updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create("/bookChapter/save", formData);
          toast.success(
            response.message || "Book Chapter record added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // Display the Book Chapter List
        handleListBooksChaptersClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Book Chapter. Please try again.");
        console.error("Error creating/updating Book Chapter:", error);
      }
    },
  });

  const fetchBooksChaptersData = async () => {
    try {
      const response = await api.get("/bookChapter/getAll", "");
      setBookChaptersData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Book Chapter data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListBooksChaptersClick = () => {
    toggleModal();
    fetchBooksChaptersData();
  };

  // Handle edit action
  // Fetch the data for the selected BOS ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/bookChapter/edit?bookChapterId=${id}`,
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
        bookTitle: response.bookTitle || "",
        editor: response.editor || "",
        isbxl: response.isbn || "",
        dateOfPublication: response.publicationDate || "",
        publisher: response.publisher || "",
        otherDepartment: "", // Add default value for otherDepartment
        bookChapter: response.documents?.bookChapter || null,
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

  function handleDelete(bookChapterDataId: any): void {
    setDeleteId(bookChapterDataId);
    setIsDeleteModalOpen(true);
  }

  // Confirm deletion of the record
  // Call the delete API and refresh the BOS data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/bookChapter/deleteBookChapter?bookChapterId=${id}`,
          ""
        );
        toast.success(
          response.message || "Book Chapter record removed successfully!"
        );
        fetchBooksChaptersData();
      } catch (error) {
        toast.error("Failed to remove Book Chapter Record. Please try again.");
        console.error("Error deleting book chapter:", error);
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
        const response = await axios.get(`/bookChapter/download/${fileName}`, {
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
        toast.error(
          "Failed to download frontPage uploaded file. Please try again."
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
        `/bookChapter/deleteBookChapterDocument?bookChapterId=${editId}&docType=bookChapter`,
        ""
      );
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      // Remove the file from the form
      validation.setFieldValue("bookChapter", null); // Clear the file from Formik state
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
          <Breadcrumb title="Research" breadcrumbItem="Books/Chapters" />
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
                      <Label>Book Title</Label>
                      <Input
                        type="text"
                        name="bookTitle"
                        value={validation.values.bookTitle}
                        onChange={validation.handleChange}
                        className={`form-control ${
                          validation.touched.bookTitle &&
                          validation.errors.bookTitle
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter Book Title"
                      />
                      {validation.touched.bookTitle &&
                        validation.errors.bookTitle && (
                          <div className="text-danger">
                            {typeof validation.errors.bookTitle === "string" &&
                              validation.errors.bookTitle}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Editor</Label>
                      <Input
                        type="text"
                        name="editor"
                        value={validation.values.editor}
                        onChange={validation.handleChange}
                        className={`form-control ${
                          validation.touched.editor && validation.errors.editor
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter Editor Name"
                      />
                      {validation.touched.editor &&
                        validation.errors.editor && (
                          <div className="text-danger">
                            {typeof validation.errors.editor === "string" &&
                              validation.errors.editor}
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
                      <Label>ISBXL</Label>
                      <Input
                        type="text"
                        name="isbxl"
                        value={validation.values.isbxl}
                        onChange={validation.handleChange}
                        className={`form-control ${
                          validation.touched.isbxl && validation.errors.isbxl
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter ISBXL"
                      />
                      {validation.touched.isbxl && validation.errors.isbxl && (
                        <div className="text-danger">
                          {typeof validation.errors.isbxl === "string" &&
                            validation.errors.isbxl}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Date of Publication</Label>
                      <Input
                        type="date" // Use native date input
                        className={`form-control ${
                          validation.touched.dateOfPublication &&
                          validation.errors.dateOfPublication
                            ? "is-invalid"
                            : ""
                        }`}
                        value={
                          validation.values.dateOfPublication
                            ? moment(
                                validation.values.dateOfPublication,
                                "DD/MM/YYYY"
                              ).format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
                          validation.setFieldValue(
                            "dateOfPublication",
                            formattedDate
                          );
                        }}
                        placeholder="dd/mm/yyyy"
                      />
                      {validation.touched.dateOfPublication &&
                        validation.errors.dateOfPublication && (
                          <div className="text-danger">
                            {typeof validation.errors.dateOfPublication ===
                              "string" && validation.errors.dateOfPublication}
                          </div>
                        )}
                    </div>
                  </Col>

                  {/* Front Page Upload */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Front Page Upload</Label>
                      <Input
                        type="file"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "bookChapter",
                            e.target.files?.[0] || null
                          )
                        }
                        className={`form-control ${
                          validation.touched.bookChapter &&
                          validation.errors.bookChapter
                            ? "is-invalid"
                            : ""
                        }`}
                        disabled={isFrontPageFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.bookChapter &&
                        validation.errors.bookChapter && (
                          <div className="text-danger">
                            {validation.errors.bookChapter}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFrontPageFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.bookChapter === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.bookChapter}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() => {
                              if (
                                typeof validation.values.bookChapter ===
                                "string"
                              ) {
                                handleDownloadFile(
                                  validation.values.bookChapter
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
                        onClick={handleListBooksChaptersClick}
                      >
                        List Books/Chapters
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
                  <th>Faculty Name</th>
                  <th>Co-Authors</th>
                  <th>Book Title</th>
                  <th>Editor</th>
                  <th>Publisher</th>
                  <th>ISBXL</th>
                  <th>Date of Publication</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((books, index) => (
                    <tr key={books.bookChapterId}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{books.academicYear}</td>
                      <td>{books.streamName}</td>
                      <td>{books.departmentName}</td>
                      <td>{books.facultyName}</td>
                      <td>{books.coAuthors}</td>
                      <td>{books.bookTitle}</td>
                      <td>{books.editor}</td>
                      <td>{books.publisher}</td>
                      <td>{books.isbn}</td>
                      <td>{books.publicationDate}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(books.bookChapterId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(books.bookChapterId)}
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
                      No Books/Chapters data available.
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

export default Books_Chapters;
