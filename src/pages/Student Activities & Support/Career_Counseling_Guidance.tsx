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
  Tooltip,
} from "reactstrap";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast, ToastContainer } from "react-toastify";
import GetAllProgramDropdown from "Components/DropDowns/GetAllProgramDropdown";
import moment from "moment";

const api = new APIClient();

const Career_Counseling_Guidance: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bosData, setBosData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(bosData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const fileRef = useRef<HTMLInputElement | null>(null);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = bosData.filter((row) =>
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

  // Fetch BOS data from the backend
  const fetchCCGData = async () => {
    try {
      const response = await axios.get("/careerCounseling/getAll"); // Replace with your backend API endpoint
      setBosData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching BOS data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListCCGClick = () => {
    toggleModal();
    fetchCCGData();
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
        `/careerCounseling/edit?careerCounselingId=${id}`,
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
        courses: response.courses
          ? Object.entries(response.courses).map(([key, value]) => ({
              value: key,
              label: String(value),
            }))
          : [],
        areaOfGuidance: response.areaOfGuidance || "",
        date: response.date
          ? moment(response.date, "DD/MM/YYYY").format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
          : "",
        noOfParticipants: response.noOfParticipants || "",
        trainerResource: response.resourcePersonDetails || "",
        outcomes: response.outcomes || "",
      };

      // Update Formik values
      validation.setValues({
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
        courses: mappedValues.courses || [],
        areaOfGuidance: response.areaOfGuidance || "",
        date: mappedValues.date
          ? moment(mappedValues.date, "YYYY-MM-DD").format("DD/MM/YYYY") // Convert to dd/mm/yyyy for the input
          : "",
        noOfParticipants: response.noOfParticipants || "",
        trainerResource: response.resourcePersonDetails || "",
        outcomes: response.outcomes || "",
        careerCounseling: response.documents.careerCounseling || null, // Handle file upload
      });
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error("Error fetching BOS data by ID:", error);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Call the delete API and refresh the BOS data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/careerCounseling/deleteCareerCounseling?careerCounselingId=${id}`,
          ""
        );
        toast.success(
          response.message ||
            "Career Counseling & Guidance removed successfully!"
        );
        fetchCCGData();
      } catch (error) {
        toast.error(
          "Failed to remove Career Counseling & Guidance. Please try again."
        );
        console.error("Error deleting BOS:", error);
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
          `/careerCounseling/download/${fileName}`,
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
        `/careerCounseling/deleteCareerCounselingDocument?careerCounselingId=${editId}&docType=${docType}`,
        ""
      );
      toast.success(response.message || "File deleted successfully!");
      if (docType === "careerCounseling") {
        validation.setFieldValue("careerCounseling", null);
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
      areaOfGuidance: "",
      date: "",
      noOfParticipants: "",
      trainerResource: "",
      outcomes: "",
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      courses: [] as { value: string; label: string }[],
      careerCounseling: null as File | string | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select academic year"),
      stream: Yup.object().nullable().required("Please select stream"),
      areaOfGuidance: Yup.string().required("Please enter area of guidance"),
      noOfParticipants: Yup.number().required(
        "Please enter No. of Participants/Attendees"
      ),
      date: Yup.string().required("Please select date"),
      trainerResource: Yup.string().required(
        "Please enter trainer/resource person details"
      ),
      outcomes: Yup.string().required("Please enter outcomes"),
      department: Yup.object().nullable().required("Please select department"),
      courses: Yup.array()
        .of(
          Yup.object().shape({
            value: Yup.string().required(),
            label: Yup.string().required(),
          })
        )
        .min(1, "Please select at least one program")
        .required("Please select program"),
      careerCounseling: Yup.mixed().test(
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

        formData.append("academicYear", values.academicYear?.value || "");
        formData.append("streamId", values.stream?.value || "");
        formData.append("departmentId", values.department?.value || "");
        formData.append("areaOfGuidance", values.areaOfGuidance || "");
        formData.append("resourcePersonDetails", values.trainerResource || "");
        formData.append("outcomes", values.outcomes || "");
        const formattedDate = moment(values.date, "YYYY-MM-DD").format(
          "DD/MM/YYYY"
        );
        formData.append("date", formattedDate || "");
        formData.append("noOfParticipants", values.noOfParticipants || "");
        values.courses.forEach((course, index) => {
          formData.append(`courseIds[${index}]`, course.value);
        });

        if (isEditMode && typeof values.careerCounseling === "string") {
          formData.append(
            "file",
            new Blob([], { type: "application/pdf" }),
            "empty.pdf"
          );
        } else if (isEditMode && values.careerCounseling === null) {
          formData.append(
            "file",
            new Blob([], { type: "application/pdf" }),
            "empty.pdf"
          );
        } else if (values.careerCounseling) {
          formData.append("file", values.careerCounseling);
        }
        // If editing, include the ID
        if (isEditMode && editId) {
          formData.append("careerCounselingId", editId);
        }

        let response;

        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/careerCounseling/update`, formData);
          toast.success(
            response.message ||
              "Career Counseling & Guidance updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create("/careerCounseling/save", formData);
          toast.success(
            response.message ||
              "Career Counseling & Guidance added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the BOS List
        handleListCCGClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Career Counseling & Guidance. Please try again."
        );
        console.error("Error creating BOS:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Student Activities & Support"
            breadcrumbItem="Career Counseling & Guidance"
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
                        Area of Guidance
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.areaOfGuidance &&
                          validation.errors.areaOfGuidance
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="areaOfGuidance"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "areaOfGuidance",
                            e.target.value
                          )
                        }
                        placeholder="Enter full time"
                        value={validation.values.areaOfGuidance}
                      />
                      {validation.touched.areaOfGuidance &&
                        validation.errors.areaOfGuidance && (
                          <div className="text-danger">
                            {validation.errors.areaOfGuidance}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        name="date"
                        value={
                          validation.values.date
                            ? moment(
                                validation.values.date,
                                "DD/MM/YYYY"
                              ).format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                            : ""
                        }
                        // onChange={validation.handleChange}
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
                          validation.setFieldValue("date", formattedDate);
                        }}
                        placeholder="Enter date"
                        className={
                          validation.touched.date && validation.errors.date
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.date && validation.errors.date && (
                        <div className="text-danger">
                          {validation.errors.date}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        No. of Participants/Attendees
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.noOfParticipants &&
                          validation.errors.noOfParticipants
                            ? "is-invalid"
                            : ""
                        }`}
                        type="number"
                        id="noOfParticipants"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "noOfParticipants",
                            e.target.value
                          )
                        }
                        placeholder="Enter part time"
                        value={validation.values.noOfParticipants}
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
                        Trainer/Resource Person details
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.trainerResource &&
                          validation.errors.trainerResource
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="trainerResource"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "trainerResource",
                            e.target.value
                          )
                        }
                        placeholder="Enter guest faculty"
                        value={validation.values.trainerResource}
                      />
                      {validation.touched.trainerResource &&
                        validation.errors.trainerResource && (
                          <div className="text-danger">
                            {validation.errors.trainerResource}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Outcomes
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.outcomes &&
                          validation.errors.outcomes
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="outcomes"
                        onChange={(e) =>
                          validation.setFieldValue("outcomes", e.target.value)
                        }
                        placeholder="Enter professor of practice"
                        value={validation.values.outcomes}
                      />
                      {validation.touched.outcomes &&
                        validation.errors.outcomes && (
                          <div className="text-danger">
                            {validation.errors.outcomes}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload description of the activity
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
                          validation.touched.careerCounseling &&
                          validation.errors.careerCounseling
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        innerRef={fileRef}
                        onChange={(event) => {
                          validation.setFieldValue(
                            "careerCounseling",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.careerCounseling &&
                        validation.errors.careerCounseling && (
                          <div className="text-danger">
                            {validation.errors.careerCounseling}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.careerCounseling ===
                        "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.careerCounseling}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.careerCounseling as string
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
                                validation.values.careerCounseling as string,
                                "careerCounseling"
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
                      <Label>Download </Label>
                      <div>
                        <a
                          href="/templateFiles/Guest Lectures.pdf"
                          download
                          className="btn btn-primary btn-sm"
                        >
                          Year Dept Guest Lecture
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
                        onClick={handleListCCGClick}
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
        {/* Modal for Listing BOS */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Career Counseling & Guidance
          </ModalHeader>
          <ModalBody>
            <Table className="table-hover custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>School</th>
                  <th>Department</th>
                  <th>Program</th>
                  <th>Area of Guidance</th>
                  <th>Date</th>
                  <th>No. of Participants/Attendees</th>
                  <th>Trainer/Resource Person details</th>
                  <th>Outcomes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bosData.length > 0 ? (
                  bosData.map((bos, index) => (
                    <tr key={bos.careerCounselingId}>
                      <td>{index + 1}</td>
                      <td>{bos.academicYear}</td>
                      <td>{bos.streamName}</td>
                      <td>{bos.departmentName}</td>
                      <td>
                        <ul className="list-disc list-inside">
                          {Object.values(bos.courses).map((courseName, idx) => (
                            <li key={idx}>
                              {typeof courseName === "string" ||
                              typeof courseName === "number"
                                ? courseName
                                : String(courseName)}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>{bos.areaOfGuidance}</td>
                      <td>{bos.date}</td>
                      <td>{bos.noOfParticipants}</td>
                      <td>{bos.resourcePersonDetails}</td>
                      <td>{bos.outcomes}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEdit(bos.careerCounselingId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(bos.careerCounselingId)}
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
                      No BOS data available.
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

export default Career_Counseling_Guidance;
