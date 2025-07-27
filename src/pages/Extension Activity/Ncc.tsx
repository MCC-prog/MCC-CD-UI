import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import SemesterTypeDropdown from "Components/DropDowns/SemesterTypeDropdown";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
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
import GetAllProgramDropdown from "Components/DropDowns/GetAllProgramDropdown";
import axios from "axios";
import moment from "moment";

const api = new APIClient();

const NCC: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nccData, setNccData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [filteredData, setFilteredData] = useState(nccData);
  const [filters, setFilters] = useState({
    academicYear: "",
    semester: "",
    stream: "",
    program: "",
    noOfParticipants: "",
    organisation: "",
    location: "",
    date: "",
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

    const filtered = nccData.filter((row) =>
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

    const filtered = nccData.filter((row) =>
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

  // Fetch NCC data from the backend
  const fetchNccData = async () => {
    try {
      const response = await api.get("/ncc/getAll", "");
      setNccData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Ncc:", error);
    }
  };

  // Open the modal and fetch data
  const handleListNccClick = () => {
    toggleModal();
    fetchNccData();
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
      const response = await api.get(`/ncc/edit?nccId=${id}`, "");
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
        semester: response.semester
          ? { value: response.semester, label: response.semester.toUpperCase() }
          : null,
        stream: response.streamId
          ? { value: response.streamId.toString(), label: response.streamName }
          : null,
        program: response.courses
          ? Object.entries(response.courses).map(([key, value]) => ({
              value: key,
              label: String(value),
            }))
          : [],
        noOfParticipants: response.noOfParticipants || "",
        date: response.date ? response.date : "",
        organisation: response.organisation || "",
        location: response.location || "",
        file: response.documents?.NCC || null,
      };
      // Update Formik values
      validation.setValues({
        ...mappedValues,
        file: response.documents?.NCC || null,
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
      });

      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      setIsFileUploadDisabled(!!response.documents?.NCC);
      toggleModal();
    } catch (error) {
      console.error("Error fetching NCC data by ID:", error);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(`/ncc/deleteNCC?nccId=${id}`, "");
        toast.success(response.message || "NCC  removed successfully!");
        fetchNccData();
      } catch (error) {
        toast.error("Failed to remove NCC. Please try again.");
        console.error("Error deleting NCC:", error);
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
        const response = await axios.get(`/ncc/download/${fileName}`, {
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
        `/ncc/deleteNCCDocument?nccId=${editId}`,
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

  const formatDate = (date: string): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      semester: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      program: [] as { value: string; label: string }[],
      noOfParticipants: "",
      organisation: "",
      location: "",
      date: "",
      file: null as File | string | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select academic year"),
      semester: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select a semester type"), // Single object for single-select
      stream: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select school"),
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
      program: Yup.array()
        .min(1, "Please select at least one program")
        .required("Please select programs"),
      noOfParticipants: Yup.number()
        .typeError("Please enter a valid number")
        .min(0, "Number of students completed cannot be less than 0")
        .required("Please enter number of No Of Participants"),
      organisation: Yup.string().required("Please select Organization"),
      location: Yup.string().required("Please select Location"),
      date: Yup.date().required("Please select Date"),
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append(
        "courseIds",
        values.program.map((option) => option.value).join(",") || ""
      );
      formData.append("semester", values.semester?.value || "");
      formData.append("noOfParticipants", values.noOfParticipants || "");
      formData.append("organisation", values.organisation || "");
      formData.append("location", values.location || "");
      formData.append("date", formatDate(values.date) || "");

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
        formData.append("id", editId);
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/ncc/update`, formData);
          toast.success(response.message || "NCC updated successfully!");
        } else {
          // Call the save API
          const response = await api.create("/ncc/save", formData);
          toast.success(response.message || "NCC added successfully!");
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        setIsFileUploadDisabled(false); // Enable the file upload button
        handleListNccClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save NCC. Please try again.");
        console.error("Error creating NCC:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="NCC" breadcrumbItem="Extension Activity" />
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>School</Label>
                      <StreamDropdown
                        value={validation.values.stream}
                        onChange={(selectedOption) => {
                          validation.setFieldValue("stream", selectedOption);
                          setSelectedStream(selectedOption);
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Program</Label>
                      <GetAllProgramDropdown
                        value={validation.values.program}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("program", selectedOption)
                        }
                        isInvalid={
                          validation.touched.program &&
                          !!validation.errors.program
                        }
                      />
                      {validation.touched.program &&
                        validation.errors.program && (
                          <div className="text-danger">
                            {Array.isArray(validation.errors.program)
                              ? validation.errors.program.join(", ")
                              : validation.errors.program}
                          </div>
                        )}
                    </div>
                  </Col>
                  {/* Semester Dropdowns */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Semester Type</Label>
                      <SemesterTypeDropdown
                        value={validation.values.semester}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("semester", selectedOption)
                        }
                        isInvalid={
                          validation.touched.semester &&
                          !!validation.errors.semester
                        }
                      />
                      {validation.touched.semester &&
                        validation.errors.semester && (
                          <div className="text-danger">
                            {validation.errors.semester}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Date</Label>
                      <Input
                        type="date" // Use native date input
                        className={`form-control ${
                          validation.touched.date && validation.errors.date
                            ? "is-invalid"
                            : ""
                        }`}
                        value={
                          validation.values.date
                            ? moment(
                                validation.values.date,
                                "DD/MM/YYYY"
                              ).format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
                          validation.setFieldValue("date", formattedDate);
                        }}
                        placeholder="dd/mm/yyyy"
                      />
                      {validation.touched.date && validation.errors.date && (
                        <div className="text-danger">
                          {validation.errors.date}
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>No Of Participants</Label>
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
                        placeholder="Enter No Of Participants"
                      />
                      {validation.touched.noOfParticipants &&
                        validation.errors.noOfParticipants && (
                          <div className="text-danger">
                            {validation.errors.noOfParticipants}
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
                        placeholder="Enter organisation"
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
                        placeholder="Enter Location"
                      />
                      {validation.touched.location &&
                        validation.errors.location && (
                          <div className="text-danger">
                            {validation.errors.location}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload NCC
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
                      <Label>Download Template</Label>
                      <div>
                        <a
                          href="/templateFiles/bos.pdf"
                          download
                          className="btn btn-primary btn-sm"
                        >
                          Sample NCC
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
                        className="btn btn-primary"
                        type="button"
                        onClick={handleListNccClick}
                      >
                        List NCC
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing NCC */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>List NCC</ModalHeader>
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
                  <th>Sl.No</th>
                  <th>Academic Year</th>
                  <th>School</th>
                  <th>Program</th>
                  <th>Semester Type</th>
                  <th>No Of Participants</th>
                  <th>Organization</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((ncc, index) => (
                    <tr key={ncc.id}>
                      <td>{index + 1}</td>
                      <td>{ncc.academicYear}</td>
                      <td>{ncc.streamName}</td>
                      <td>
                        <ul>
                          {(Object.values(ncc.courses) as string[]).map(
                            (course, index) => (
                              <li key={index}>{course}</li>
                            )
                          )}
                        </ul>
                      </td>
                      <td>{ncc.semester}</td>
                      <td>{ncc.noOfParticipants}</td>
                      <td>{ncc.organisation}</td>
                      <td>{ncc.location}</td>
                      <td>{ncc.date}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(ncc.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(ncc.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center">
                      No NCC data available.
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

export default NCC;
