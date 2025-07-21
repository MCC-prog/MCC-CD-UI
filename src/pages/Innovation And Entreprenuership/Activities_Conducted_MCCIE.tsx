import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import ProgramDropdown from "Components/DropDowns/ProgramDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
import SemesterDropdowns from "Components/DropDowns/SemesterDropdowns";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import { ToastContainer } from "react-toastify";
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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SEMESTER_NO_OPTIONS } from "../../Components/constants/layout";
import axios from "axios";
import moment from "moment";

const api = new APIClient();

const Activities_Conducted_MCCIE: React.FC = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variable for managing file upload status
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  // State variable for managing the modal for listing Activities Conducted MCCIE
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State variable for managing the list of Activities Conducted MCCIE data
  const [acmData, setACMData] = useState<any[]>([]);
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  // State variable for managing search term and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  // State variable for managing filters
  const [filters, setFilters] = useState({
    academicYear: "",
    stream: "",
    department: "",
    agencyName: "",
    activityName: "",
    noOfStudents: "",
    financialSupportSource: "",
    duration: "",
  });
  const [filteredData, setFilteredData] = useState(acmData);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const file2Ref = useRef<HTMLInputElement | null>(null);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = acmData.filter((row) =>
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

  // Toggle the modal for listing Activities Conducted MCCIE
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Activities Conducted MCCIE data from the backend
  const fetchACMData = async () => {
    try {
      const response = await api.get(
        "/activitiesConductedByMCCIE/getAllActivitiesConductedByMCCIE",
        ""
      );
      setACMData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Activities Conducted MCCIE data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListACMClick = () => {
    toggleModal();
    fetchACMData();
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
  // Fetch the data for the selected Activities Conducted MCCIE ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/activitiesConductedByMCCIE?activitiesConductedByMCCIEId=${id}`,
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
      };

      validation.setValues({
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,

        stream: mappedValues.stream,
        department: mappedValues.department,

        otherDepartment: "", // unless provided by response

        agencyName: response.agencyName || "",
        activityName: response.activityName || "",
        noOfStudents: response.noOfStudents || "",
        financialSupportSource: response.sourceFinancialSupport || "",
        duration: response.duration || "",

        activityPhoto: response.files?.Photograph || null,
        activityLetter: response.files?.Letter || null,
      });

      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error("Error fetching Activities Conducted MCCIE data by ID:", error);
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the Activities Conducted MCCIE data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/activitiesConductedByMCCIE/deleteActivitiesConductedByMCCIE?activitiesConductedByMCCIEId=${id}`,
          ""
        );
        toast.success(
          response.message || "Activities Conducted MCCIE removed successfully!"
        );
        fetchACMData();
      } catch (error) {
        toast.error(
          "Failed to remove Activities Conducted MCCIE. Please try again."
        );
        console.error("Error deleting Activities Conducted MCCIE:", error);
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
          `/activitiesConductedByMCCIE/download/${fileName}`,
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
  const handleDeleteFile = async (fileName: string, docType: string) => {
    try {
      // Call the delete API
      const response = await api.delete(
        `/activitiesConductedByMCCIE/deleteActivitiesConductedByMCCIEDocument?fileName=${fileName}`,
        ""
      );
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      if (docType === "activityPhoto") {
        validation.setFieldValue("activityPhoto", null);
      }
      if (docType === "activityLetter") {
        validation.setFieldValue("activityLetter", null);
      }
      // Remove the file from the form
      validation.setFieldValue("file", null); // Clear the file from Formik state
      setIsFileUploadDisabled(false); // Enable the file upload button
    } catch (error) {
      // Show error message
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  // Formik validation and submission
  // Initialize Formik with validation schema and initial values
  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      agencyName: "",
      activityName: "",
      noOfStudents: "",
      financialSupportSource: "",
      duration: "",
      activityPhoto: null as File | string | null,
      activityLetter: null as File | string | null,
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
        (department: any, schema) => {
          return department?.value === "Others"
            ? schema.required("Please specify the department")
            : schema;
        }
      ),
      agencyName: Yup.string().required("Please enter agency name"),
      activityName: Yup.string().required("Please enter activity name"),
      noOfStudents: Yup.number()
        .typeError("Enter a valid number")
        .required("Please enter number of students"),
      financialSupportSource: Yup.string().required(
        "Please enter source of financial support"
      ),
      duration: Yup.number()
        .typeError("Enter a valid number")
        .required("Please enter duration"),
      activityPhoto: Yup.mixed()
        .required("Please upload a photograph")
        .test("fileType", "Only image files allowed", (value) => {
          if (!value) return false;
          if (typeof value === "string") return true;
          return (
            value instanceof File &&
            ["image/jpeg", "image/png", "image/jpg"].includes(value.type)
          );
        }),
      activityLetter: Yup.mixed()
        .required("Please upload letter/MOU")
        .test("fileType", "Only PDF allowed", (value) => {
          if (!value) return false;
          if (typeof value === "string") return true;
          return value instanceof File && value.type === "application/pdf";
        }),
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("otherDepartment", values.otherDepartment || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append("agencyName", values.agencyName || "");
      formData.append("activityName", values.activityName || "");
      formData.append("noOfStudents", values.noOfStudents || "");
      formData.append(
        "sourceFinancialSupport",
        values.financialSupportSource || ""
      );
      formData.append("duration", values.duration || "");
      formData.append("id", editId || "");

      if (isEditMode && typeof values.activityPhoto === "string") {
        formData.append(
          "photograph",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.activityPhoto === null) {
        formData.append(
          "photograph",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.activityPhoto) {
        formData.append("photograph", values.activityPhoto);
      }

      if (isEditMode && typeof values.activityLetter === "string") {
        formData.append(
          "letter",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.activityLetter === null) {
        formData.append(
          "letter",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.activityLetter) {
        formData.append("letter", values.activityLetter);
      }
      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/activitiesConductedByMCCIE`,
            formData
          );
          toast.success(
            response.message ||
              "Activities Conducted MCCIE updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/activitiesConductedByMCCIE",
            formData
          );
          toast.success(
            response.message || "Activities Conducted MCCIE added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        if (file2Ref.current) {
          file2Ref.current.value = "";
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the Activities Conducted MCCIE List
        handleListACMClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Activities Conducted MCCIE. Please try again."
        );
        console.error("Error creating Activities Conducted MCCIE:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="INNOVATION & ENTREPRENUERSHIP"
            breadcrumbItem="Activities Conducted MCCIE"
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
                            {validation.errors.department}
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
                              {validation.errors.otherDepartment}
                            </div>
                          )}
                      </div>
                    </Col>
                  )}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Agency Name</Label>
                      <Input
                        type="text"
                        value={validation.values.agencyName}
                        onChange={(e) =>
                          validation.setFieldValue("agencyName", e.target.value)
                        }
                        className={
                          validation.touched.agencyName &&
                          validation.errors.agencyName
                            ? "is-invalid"
                            : ""
                        }
                        placeholder="Enter Agency Name"
                      />
                      {validation.touched.agencyName &&
                        validation.errors.agencyName && (
                          <div className="text-danger">
                            {validation.errors.agencyName}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Activity Name</Label>
                      <Input
                        type="text"
                        value={validation.values.activityName}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "activityName",
                            e.target.value
                          )
                        }
                        className={
                          validation.touched.activityName &&
                          validation.errors.activityName
                            ? "is-invalid"
                            : ""
                        }
                        placeholder="Enter Activity Name"
                      />
                      {validation.touched.activityName &&
                        validation.errors.activityName && (
                          <div className="text-danger">
                            {validation.errors.activityName}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>No. of Students</Label>
                      <Input
                        placeholder="Enter No. of Students"
                        type="text"
                        value={validation.values.noOfStudents}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "noOfStudents",
                            e.target.value
                          )
                        }
                        className={
                          validation.touched.noOfStudents &&
                          validation.errors.noOfStudents
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.noOfStudents &&
                        validation.errors.noOfStudents && (
                          <div className="text-danger">
                            {validation.errors.noOfStudents}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Source of Financial Support</Label>
                      <Input
                        type="text"
                        placeholder="Enter Source of Financial Support"
                        value={validation.values.financialSupportSource}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "financialSupportSource",
                            e.target.value
                          )
                        }
                        className={
                          validation.touched.financialSupportSource &&
                          validation.errors.financialSupportSource
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.financialSupportSource &&
                        validation.errors.financialSupportSource && (
                          <div className="text-danger">
                            {validation.errors.financialSupportSource}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Duration (in month)</Label>
                      <Input
                        type="text"
                        placeholder="Enter Duration (in month)"
                        value={validation.values.duration}
                        onChange={(e) =>
                          validation.setFieldValue("duration", e.target.value)
                        }
                        className={
                          validation.touched.duration &&
                          validation.errors.duration
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.duration &&
                        validation.errors.duration && (
                          <div className="text-danger">
                            {validation.errors.duration}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Upload Photograph of the Activity</Label>
                      <Input
                        type="file"
                        innerRef={fileRef}
                        accept="image/*"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "activityPhoto",
                            e.currentTarget.files?.[0] || null
                          )
                        }
                        className={
                          validation.touched.activityPhoto &&
                          validation.errors.activityPhoto
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.activityPhoto &&
                        validation.errors.activityPhoto && (
                          <div className="text-danger">
                            {validation.errors.activityPhoto}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.activityPhoto === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.activityPhoto}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.activityPhoto as string
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
                                validation.values.activityPhoto as string,
                                "activityPhoto"
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
                      <Label>Upload Letter/ MOU (Only PDF)</Label>
                      <Input
                        innerRef={file2Ref}
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "activityLetter",
                            e.currentTarget.files?.[0] || null
                          )
                        }
                        className={
                          validation.touched.activityLetter &&
                          validation.errors.activityLetter
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.activityLetter &&
                        validation.errors.activityLetter && (
                          <div className="text-danger">
                            {validation.errors.activityLetter}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.activityLetter === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.activityLetter}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.activityLetter as string
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
                                validation.values.activityLetter as string,
                                "activityLetter"
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
                        onClick={handleListACMClick}
                      >
                        List Activities By MCCIE
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Activities Conducted MCCIE */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Activities By MCCIE
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
                  <th>Stream</th>
                  <th>Department</th>
                  <th>Agency Name</th>
                  <th>Activity Name</th>
                  <th>No. of Students</th>
                  <th>Financial Support Source</th>
                  <th>Duration (in month)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((acm, index) => (
                    <tr key={acm.id}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{acm.academicYear}</td>
                      <td>{acm.streamName}</td>
                      <td>{acm.departmentName}</td>
                      <td>{acm.agencyName}</td>
                      <td>{acm.activityName}</td>
                      <td>{acm.noOfStudents}</td>
                      <td>{acm.sourceFinancialSupport}</td>
                      <td>{acm.duration}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(acm.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(acm.id)}
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
                      No Activities By MCCIE data available.
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

export default Activities_Conducted_MCCIE;
