import Breadcrumb from "Components/Common/Breadcrumb";
import { useFormik } from "formik";
import React, { useState } from "react";
import Select from "react-select";
import * as Yup from "yup";
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
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import SemesterDropdowns from "Components/DropDowns/SemesterDropdowns";
import GetAllProgramDropdown from "Components/DropDowns/GetAllProgramDropdown";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { SEMESTER_NO_OPTIONS } from "Components/constants/layout";
import { APIClient } from "../../helpers/api_helper";

const api = new APIClient();

const Innovative_Teaching_Methodologies: React.FC = () => {
  const [ITMData, setITMData] = useState<any[]>([]);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    academicYear: "",
    semesterType: "",
    semesterNo: "",
    courses: "",
    department: "",
    programType: "",
    degree: "",
    program: "",
    revisionPercentage: "",
  });
  const [filteredData, setFilteredData] = useState(ITMData);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = ITMData.filter((row) =>
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

    const filtered = ITMData.filter((row) =>
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

  // Fetch BOS data from the backend
  const fetchITMData = async () => {
    try {
      const response = await api.get(
        "/innovativeTeachingMethodology/getAll",
        ""
      );
      setITMData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching BOS data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListBosClick = () => {
    toggleModal();
    fetchITMData();
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
  // Fetch the data for the selected BOS ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/innovativeTeachingMethodology/edit?innovativeMethodologyId=${id}`,
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

      const semesterNoOptions = SEMESTER_NO_OPTIONS;

      // Map API response to Formik values
      const mappedValues = {
        academicYear: mapValueToLabel(response.academicYear, academicYearList),
        semesterType: response.semType
          ? { value: response.semType, label: response.semType.toUpperCase() }
          : null,
        semesterNo: mapValueToLabel(
          String(response.semesterNo),
          semesterNoOptions
        ) as { value: string; label: string } | null,
        courses: response.courses
          ? Object.entries(response.courses).map(([key, value]) => ({
              value: key,
              label: String(value),
            }))
          : [],
        courseName: response.courseTitle || "",
        file: response.documents?.innovativePedagogy || null,
      };

      // Update Formik values
      validation.setValues({
        ...mappedValues,
        file: response.documents?.innovativePedagogy || null,
        semesterNo: response.semesterNo
          ? { value: response.semesterNo, label: response.semesterNo }
          : null,
        semesterType: response.semType
          ? { value: response.semType, label: response.semType.toUpperCase() }
          : null,
        academicYear: response.academicYear
          ? { value: response.academicYear, label: response.academicYear }
          : null,
        courseName: response.courseTitle || "", // Ensure courseName is included
      });
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      // Disable the file upload button if a file exists
      setIsFileUploadDisabled(!!response.documents?.innovativePedagogy);
      toggleModal();
    } catch (error) {
      console.error("Error fetching BOS data by ID:", error);
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the BOS data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/innovativeTeachingMethodology/deleteInnovativeMethod?innovativeMethodologyId=${id}`,
          ""
        );
        toast.success(
          response.message ||
            "Innovative Teaching Methodologies removed successfully!"
        );
        fetchITMData();
      } catch (error) {
        toast.error(
          "Failed to remove Innovative Teaching Methodologies. Please try again."
        );
        console.error(
          "Error deleting Innovative Teaching Methodologies:",
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
          `/innovativeTeachingMethodology/download/${fileName}`,
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
          "Failed to download innovativePedagogy file. Please try again."
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
        `/innovativeTeachingMethodology/deleteInnovativeMethodDocument?innovativeMethodologyDocumentId=${editId}`,
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
      semesterType: null as { value: string; label: string } | null,
      semesterNo: null as { value: string; label: string } | null,
      courses: [] as { value: string; label: string }[],
      courseName: "",
      file: null as File | string | null,
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
      courses: Yup.array()
        .min(1, "Please select at least one program")
        .required("Please select programs"),
      courseName: Yup.string().required("Please enter Course Name"),
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
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("semType", values.semesterType?.value || "");
      formData.append("semesterNo", String(values.semesterNo?.value || ""));
      formData.append(
        "courseIds",
        values.courses
          ? values.courses.map((option) => option.value).join(",")
          : ""
      );
      formData.append("courseTitle", values.courseName || "");
      formData.append("innovativeTeachingMethodologyId", editId || "");

      // Append the file
      if (typeof values.file === "string") {
        // If the file is just a name, send null
        formData.append("innovativePedagogy", "null");
      } else if (values.file instanceof File) {
        // If the file is a File object, send the file
        formData.append("innovativePedagogy", values.file);
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/innovativeTeachingMethodology/update`,
            formData
          );
          toast.success(
            response.message ||
              "Innovative Teaching Methodologies updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/innovativeTeachingMethodology/save",
            formData
          );
          toast.success(
            response.message ||
              "Innovative Teaching Methodologies added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the Innovative Teaching Methodologies List
        handleListBosClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Innovative Teaching Methodologies. Please try again."
        );
        console.error(
          "Error creating Innovative Teaching Methodologies:",
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
            title="Innovative teaching methodology"
            breadcrumbItem="Innovative teaching methodology"
          />
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
                            {validation.errors.academicYear}
                          </div>
                        )}
                    </div>
                  </Col>
                  {/* Semester Dropdowns */}
                  <Col lg={8}>
                    <SemesterDropdowns
                      semesterTypeValue={validation.values.semesterType}
                      semesterNoValue={validation.values.semesterNo}
                      onSemesterTypeChange={(selectedOption) =>
                        validation.setFieldValue("semesterType", selectedOption)
                      }
                      onSemesterNoChange={(selectedOption) =>
                        validation.setFieldValue("semesterNo", selectedOption)
                      }
                      isSemesterTypeInvalid={
                        validation.touched.semesterType &&
                        !!validation.errors.semesterType
                      }
                      isSemesterNoInvalid={
                        validation.touched.semesterNo &&
                        !!validation.errors.semesterNo
                      }
                      semesterTypeError={
                        validation.touched.semesterType
                          ? validation.errors.semesterType
                          : null
                      }
                      semesterNoError={
                        validation.touched.semesterNo
                          ? validation.errors.semesterNo
                          : null
                      }
                      semesterTypeTouched={!!validation.touched.semesterType}
                      semesterNoTouched={!!validation.touched.semesterNo}
                    />
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Program</Label>
                      <GetAllProgramDropdown
                        value={validation.values.courses}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("courses", selectedOption)
                        }
                        isInvalid={
                          validation.touched.courses &&
                          !!validation.errors.courses
                        }
                      />
                      {validation.touched.courses &&
                        validation.errors.courses && (
                          <div className="text-danger">
                            {Array.isArray(validation.errors.courses)
                              ? validation.errors.courses.join(", ")
                              : validation.errors.courses}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Course Name</Label>
                      <Input
                        type="text"
                        name="courseName"
                        value={validation.values.courseName}
                        onChange={validation.handleChange}
                        placeholder="Enter Course Name"
                        className={
                          validation.touched.courseName &&
                          validation.errors.courseName
                            ? "input-error"
                            : ""
                        }
                      />
                      {validation.touched.courseName &&
                        validation.errors.courseName && (
                          <div className="text-danger">
                            {validation.errors.courseName}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Innovative Pedagogy
                      </Label>
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
                        onClick={handleListBosClick}
                      >
                        List ITM
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Innovative Teaching Methodologies */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Innovative Teaching Methodologies
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
                    Semester Type
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.semesterType}
                      onChange={(e) => handleFilterChange(e, "semesterType")}
                    />
                  </th>
                  <th>
                    Semester No
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.semesterNo}
                      onChange={(e) => handleFilterChange(e, "semesterNo")}
                    />
                  </th>
                  <th>
                    Stream
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.courses}
                      onChange={(e) => handleFilterChange(e, "stream")}
                    />
                  </th>
                  <th>
                    Program
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.courses}
                      onChange={(e) => handleFilterChange(e, "program")}
                    />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((bos, index) => (
                    <tr key={bos.innovativeTeachingMethodologyId}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{bos.academicYear}</td>
                      <td>{bos.semType}</td>
                      <td>{bos.semesterNo}</td>
                      <td>
                        <ul>
                          {(Object.values(bos.courses) as string[]).map(
                            (course, index) => (
                              <li key={index}>{course}</li>
                            )
                          )}
                        </ul>
                      </td>

                      <td>{bos.courseTitle}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() =>
                              handleEdit(bos.innovativeTeachingMethodologyId)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleDelete(bos.innovativeTeachingMethodologyId)
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
                      No Innovative Teaching Methodologies data available.
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

export default Innovative_Teaching_Methodologies;
