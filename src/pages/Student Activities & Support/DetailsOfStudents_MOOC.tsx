import axios from "axios";
import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import ProgramDropdown from "Components/DropDowns/ProgramDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
import SemesterDropdowns from "Components/DropDowns/SemesterDropdowns";
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
import GetAllProgramDropdown from "Components/DropDowns/GetAllProgramDropdown";
import moment from "moment";
import { Tooltip } from "@mui/material";

const api = new APIClient();

const DetailsOfStudents_MOOC: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dosmData, setDOSMData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(dosmData);
  const [searchTerm, setSearchTerm] = useState("");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [filters, setFilters] = useState({
    academicYear: null,
    mccRegNo: "",
    studentName: "",
    offeredBy: "",
    moocCourseRegId: "",
    moocCoursePursued: "",
    duration: "",
    courses: "",
  });

  const fileRef = useRef<HTMLInputElement | null>(null);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = dosmData.filter((row) =>
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

    const filtered = dosmData.filter((row) =>
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

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Details of Students Enrolled for MOOC from the backend
  const fetchDOSMData = async () => {
    try {
      const response = await axios.get("/studentsEnrolledForMooc/getAll"); // Replace with your backend API endpoint
      setDOSMData(response);
      setFilteredData(response);
    } catch (error) {
      console.error(
        "Error fetching Details of Students Enrolled for MOOC:",
        error
      );
    }
  };

  // Open the modal and fetch data
  const handleListDOSMClick = () => {
    toggleModal();
    fetchDOSMData();
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
  // Fetch the data for the selected Details of Students Enrolled for MOOCID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/studentsEnrolledForMooc/edit?competitiveExamId=${id}`,
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
        courses: response.courses
          ? Object.entries(response.courses).map(([key, value]) => ({
              value: key,
              label: String(value),
            }))
          : [],
        noOfStaff: response.noOfStaff || "",
        mccRegNo: response.mccRegisterNo || "",
        studentName: response.studentName || "",
        offeredBy: response.offeredBy || "",
        moocCourseRegId: response.moocCourseId || "",
        moocCoursePursued: response.moocCoursePursued || "",
        duration: response.duration || "",
        courseDuration: response.courseDuration || "",
        file: response.documents.moocCertificate || null, // Assuming 'file' is a string or null
      };

      // Update Formik values
      validation.setValues({
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
        noOfStaff: response.noOfStaff || "",
        mccRegNo: response.mccRegisterNo || "",
        studentName: response.studentName || "",
        offeredBy: response.offeredBy || "",
        moocCourseRegId: response.moocCourseId || "",
        moocCoursePursued: response.moocCoursePursued || "",
        duration: response.duration || "",
        courseDuration: response.courseDuration || "",
        file: response.documents.moocCertificate || null, // Assuming 'file' is a string or null
        courses: mappedValues.courses || [],
      });
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error(
        "Error fetching Details of Students Enrolled for MOOC by ID:",
        error
      );
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Call the delete API and refresh the Details of Students Enrolled for MOOC
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/studentsEnrolledForMooc/deleteStudentsEnrolledForMooc?competitiveExamId=${id}`,
          ""
        );
        toast.success(
          response.message ||
            "Details of Students Enrolled for MOOC removed successfully!"
        );
        fetchDOSMData();
      } catch (error) {
        toast.error(
          "Failed to remove Details of Students Enrolled for MOOC. Please try again."
        );
        console.error(
          "Error deleting Details of Students Enrolled for MOOC:",
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
          `/studentsEnrolledForMooc/download/${fileName}`,
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
  const handleDeleteFile = async (fileName: string, docType: string) => {
    try {
      const response = await api.delete(
        `/studentsEnrolledForMooc/deleteStudentsEnrolledForMoocDocument?competitiveExamId=${editId}&docType=${docType}`,
        ""
      );
      toast.success(response.message || "File deleted successfully!");
      if (docType === "moocCertificate") {
        validation.setFieldValue("file", null);
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
      noOfStaff: "",
      mccRegNo: "",
      studentName: "",
      offeredBy: "",
      moocCourseRegId: "",
      moocCoursePursued: "",
      duration: "",
      courseDuration: "",
      file: null as File | string | null,
      courses: [] as { value: string; label: string }[],
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select academic year"),
      mccRegNo: Yup.string().required("Please enter MCC Register number"),
      studentName: Yup.string().required("Please enter student name"),
      offeredBy: Yup.string().required("Please enter offered by"),
      moocCourseRegId: Yup.string().required(
        "Please enter Mooc Course Id/Registration Number"
      ),
      file: Yup.mixed()
        .required("Please upload a file")
        .test("fileSize", "File size is too large", (value: any) => {
          // Skip size validation if file is a string (from existing data)
          if (typeof value === "string") return true;
          return value && value.size <= 50 * 1024 * 1024; // 50MB
        })
        .test("fileType", "Unsupported file format", (value: any) => {
          // Skip type validation if file is a string
          if (typeof value === "string") return true;
          return (
            value &&
            [
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ].includes(value.type)
          );
        }),
      moocCoursePursued: Yup.string().required(
        "Please enter Mooc Course Pursued"
      ),
      duration: Yup.string().required("Please enter Duration"),
      courses: Yup.array()
        .of(
          Yup.object().shape({
            value: Yup.string().required(),
            label: Yup.string().required(),
          })
        )
        .min(1, "Please select at least one program")
        .required("Please select program"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("academicYear", values.academicYear?.value || "");
        formData.append("studentName", values.studentName);
        formData.append("mccRegisterNo", values.mccRegNo);
        formData.append("offeredBy", values.offeredBy);
        formData.append("moocCourseId", values.moocCourseRegId);
        formData.append("moocCoursePursued", values.moocCoursePursued);
        formData.append("duration", values.duration);
        values.courses.forEach((course, index) => {
          formData.append(`courseIds[${index}]`, course.value);
        });

        if (isEditMode && typeof values.file === "string") {
          formData.append(
            "file",
            new Blob([], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            "empty.xlsx"
          );
        } else if (isEditMode && values.file === null) {
          formData.append(
            "file",
            new Blob([], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            "empty.xlsx"
          );
        } else if (values.file) {
          formData.append("file", values.file);
        }

        // If in edit mode, append the edit ID
        if (isEditMode && editId) {
          formData.append("studentsEnrolledForMoocId", editId);
        }

        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/studentsEnrolledForMooc/update`,
            formData
          );
          toast.success(
            response.message ||
              "Details of Students Enrolled for MOOC updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/studentsEnrolledForMooc/save",
            formData
          );
          toast.success(
            response.message ||
              "Details of Students Enrolled for MOOC added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the Details of Students Enrolled for MOOC
        handleListDOSMClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Details of Students Enrolled for MOOC. Please try again."
        );
        console.error(
          "Error creating Details of Students Enrolled for MOOC:",
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
            breadcrumbItem="Details of Students Enrolled for MOOC"
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

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        MCC Register number
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.mccRegNo &&
                          validation.errors.mccRegNo
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="mccRegNo"
                        onChange={(e) =>
                          validation.setFieldValue("mccRegNo", e.target.value)
                        }
                        placeholder="Enter MCC Register number"
                        value={validation.values.mccRegNo}
                      />
                      {validation.touched.mccRegNo &&
                        validation.errors.mccRegNo && (
                          <div className="text-danger">
                            {validation.errors.mccRegNo}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Student Name
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.studentName &&
                          validation.errors.studentName
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="studentName"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "studentName",
                            e.target.value
                          )
                        }
                        placeholder="Enter Student Name"
                        value={validation.values.studentName}
                      />
                      {validation.touched.studentName &&
                        validation.errors.studentName && (
                          <div className="text-danger">
                            {validation.errors.studentName}
                          </div>
                        )}
                    </div>
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

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Offered By
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.offeredBy &&
                          validation.errors.offeredBy
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="offeredBy"
                        onChange={(e) =>
                          validation.setFieldValue("offeredBy", e.target.value)
                        }
                        placeholder="Enter offered by"
                        value={validation.values.offeredBy}
                      />
                      {validation.touched.offeredBy &&
                        validation.errors.offeredBy && (
                          <div className="text-danger">
                            {validation.errors.offeredBy}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Mooc Course Id/Registration Number
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.moocCourseRegId &&
                          validation.errors.moocCourseRegId
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="moocCourseRegId"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "moocCourseRegId",
                            e.target.value
                          )
                        }
                        placeholder="Enter Mooc Course Id/Registration Number"
                        value={validation.values.moocCourseRegId}
                      />
                      {validation.touched.moocCourseRegId &&
                        validation.errors.moocCourseRegId && (
                          <div className="text-danger">
                            {validation.errors.moocCourseRegId}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Mooc Course Pursued
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.moocCoursePursued &&
                          validation.errors.moocCoursePursued
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="moocCoursePursued"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "moocCoursePursued",
                            e.target.value
                          )
                        }
                        placeholder="Enter Mooc Course Pursued"
                        value={validation.values.moocCoursePursued}
                      />
                      {validation.touched.moocCoursePursued &&
                        validation.errors.moocCoursePursued && (
                          <div className="text-danger">
                            {validation.errors.moocCoursePursued}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Duration
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.duration &&
                          validation.errors.duration
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="duration"
                        onChange={(e) =>
                          validation.setFieldValue("duration", e.target.value)
                        }
                        placeholder="Enter Duration"
                        value={validation.values.duration}
                      />
                      {validation.touched.duration &&
                        validation.errors.duration && (
                          <div className="text-danger">
                            {validation.errors.duration}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Certificate of Completion
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
                                "moocCertificate"
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
                        onClick={handleListDOSMClick}
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
        {/* Modal for Listing Details of Students Enrolled for MOOC*/}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "90%" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Details of Students Enrolled for MOOC
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
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>MCC Register number</th>
                  <th>Student Name</th>
                  <th>Program</th>
                  <th>Offered By</th>
                  <th>Mooc Course Id/Registration Number</th>
                  <th>Mooc Course Pursued</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((dosm, index) => (
                    <tr key={dosm.studentsEnrolledForMoocId}>
                      <td>{index + 1}</td>
                      <td>{dosm.academicYear}</td>
                      <td>{dosm.mccRegisterNo}</td>
                      <td>{dosm.studentName}</td>
                      <td>
                        <ul className="list-disc list-inside">
                          {Object.values(dosm.courses).map(
                            (courseName, idx) => (
                              <li key={idx}>
                                {typeof courseName === "string" ||
                                typeof courseName === "number"
                                  ? courseName
                                  : String(courseName)}
                              </li>
                            )
                          )}
                        </ul>
                      </td>
                      <td>{dosm.offeredBy}</td>
                      <td>{dosm.moocCourseId}</td>
                      <td>{dosm.moocCoursePursued}</td>
                      <td>{dosm.duration}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() =>
                              handleEdit(dosm.studentsEnrolledForMoocId)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleDelete(dosm.studentsEnrolledForMoocId)
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
                      No Details of Students Enrolled for MOOC available.
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

export default DetailsOfStudents_MOOC;
