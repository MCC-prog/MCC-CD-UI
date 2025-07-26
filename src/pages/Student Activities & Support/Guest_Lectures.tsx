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
import Select from "react-select";
import moment from "moment";

const api = new APIClient();

const Guest_Lectures: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gLData, setGLData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(gLData);
  const [filters, setFilters] = useState({
    academicYear: "",
    stream: "",
    department: "",
    courses: "",
    semType: "",
    date: "",
    resourcePersonName: "",
    organisation: "",
    resourcePersonDesignation: "",
    titleOfTalk: "",
    targetAudience: "",
    noOfParticipants: "",
    guestLecture: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const fileRef = useRef<HTMLInputElement | null>(null);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = gLData.filter((row) =>
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

    const filtered = gLData.filter((row) =>
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

  // Fetch Guest Lectures from the backend
  const fetchGuestLectureData = async () => {
    try {
      const response = await axios.get("/guestLectures/getAll"); // Replace with your backend API endpoint
      setGLData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Guest Lectures:", error);
    }
  };

  // Open the modal and fetch data
  const handleListGLClick = () => {
    toggleModal();
    fetchGuestLectureData();
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
  // Fetch the data for the selected Guest Lectures ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/guestLectures/edit?guestLecturesId=${id}`,
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

        semType: response.semType
          ? {
              value: response.semType.toString(),
              label: response.semType,
            }
          : null,
        date: response.date
          ? moment(response.date, "DD/MM/YYYY").format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
          : "",
        resourcePersonName: response.resourcePersonName || "",
        resourcePersonOrganization: response.resourcePersonDesignation || "",
        affiliationOrg: response.organisation || "",
        titleOfTalk: response.titleOfTalk || "",
        targetAudience: response.targetAudience || "",
        noOfParticipants: response.noOfParticipants || "",
        guestLecture: response.documents.guestLecture || null, // Handle file upload
      };
      const streamOption = mapValueToLabel(response.streamId, []); // Replace [] with stream options array if available
      const departmentOption = mapValueToLabel(response.departmentId, []); // Replace [] with department options array if available

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
        semType: mappedValues.semType
          ? {
              ...mappedValues.semType,
              value: String(mappedValues.semType.value),
            }
          : null,
        date: mappedValues.date
          ? moment(mappedValues.date, "YYYY-MM-DD").format("DD/MM/YYYY") // Convert to dd/mm/yyyy for the input
          : "",
        resourcePersonName: response.resourcePersonName || "",
        resourcePersonOrganization: response.resourcePersonDesignation || "",
        affiliationOrg: response.organisation || "",
        titleOfTalk: response.titleOfTalk || "",
        targetAudience: response.targetAudience || "",
        noOfParticipants: response.noOfParticipants || "",
        guestLecture: response.documents.guestLecture || null, // Handle file upload
      });
      setSelectedStream(streamOption);
      setSelectedDepartment(departmentOption);

      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error("Error fetching Guest Lectures by ID:", error);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Call the delete API and refresh the Guest Lectures
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/guestLectures/deleteGuestLectures?guestLecturesId=${id}`,
          ""
        );
        toast.success(
          response.message || "Guest Lectures removed successfully!"
        );
        fetchGuestLectureData();
      } catch (error) {
        toast.error("Failed to remove Guest Lectures. Please try again.");
        console.error("Error deleting Guest Lectures:", error);
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

  const semType = [
    { value: "T", label: "Even" },
    { value: "P", label: "Odd" },
  ];

  // Handle file download actions
  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(
          `/guestLectures/download/${fileName}`,
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
  const handleDeleteFile = async (fileName: string, docType: string) => {
    try {
      // Call the delete API
      const response = await api.delete(
        `/guestLectures/deleteGuestLecturesDocument?guestLecturesId=${editId}&docType=${docType}`,
        ""
      );
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      // Remove the file from the form
      if (docType === "guestLecture") {
        validation.setFieldValue("guestLecture", null);
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
      department: null as { value: string; label: string } | null,
      courses: [] as { value: string; label: string }[],
      semType: null as { value: string; label: string } | null,
      date: "",
      resourcePersonName: "",
      resourcePersonOrganization: "",
      affiliationOrg: "",
      titleOfTalk: "",
      targetAudience: "",
      noOfParticipants: "",
      stream: null as { value: string; label: string } | null,
      guestLecture: null as File | string | null, // Allow file to be a string for edit mode
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select academic year"),
      stream: Yup.object().nullable().required("Please select stream"),
      department: Yup.object().nullable().required("Please select department"),
      courses: Yup.array()
        .of(
          Yup.object().shape({
            value: Yup.string().required(),
            label: Yup.string().required(),
          })
        )
        .min(1, "Please select program")
        .required("Please select program"),
      semType: Yup.object().nullable().required("Please select semester"),
      date: Yup.string()
        .required("Please select date")
        .matches(
          /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
          "Date must be in dd/mm/yyyy format"
        ),
      noOfParticipants: Yup.number()
        .required("Please enter no of participants")
        .min(1, "No. of participants must be at least 1")
        .max(1000, "No. of participants cannot exceed 1000"),

      resourcePersonName: Yup.string().required(
        "Please enter resource person name"
      ),
      resourcePersonOrganization: Yup.string().required(
        "Please enter full time"
      ),
      affiliationOrg: Yup.string().required(
        "Please enter affiliation/organization"
      ),
      titleOfTalk: Yup.string().required("Please enter title of talk"),
      targetAudience: Yup.string().required("Please enter target audience"),
      guestLecture: Yup.mixed().test(
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
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();

        formData.append("academicYear", values.academicYear?.value || "");
        formData.append("streamId", values.stream?.value || "");
        formData.append("departmentId", values.department?.value || "");
        formData.append("resourcePersonName", values.resourcePersonName || "");
        formData.append(
          "resourcePersonDesignation",
          values.resourcePersonOrganization || ""
        );
        formData.append("organisation", values.affiliationOrg || "");
        formData.append("titleOfTalk", values.titleOfTalk || "");
        formData.append("targetAudience", values.targetAudience || "");
        formData.append("semType", values.semType?.value || "");
        formData.append("date", values.date || "");
        formData.append("noOfParticipants", values.noOfParticipants || "");

        // Append courses (assuming it's a multi-select)
        values.courses.forEach((course, index) => {
          formData.append(`courseIds[${index}]`, course.value);
        });

        if (isEditMode && typeof values.guestLecture === "string") {
          // Pass an empty PDF instead of null
          formData.append(
            "file",
            new Blob([], { type: "application/pdf" }),
            "empty.pdf"
          );
        } else if (isEditMode && values.guestLecture === null) {
          formData.append(
            "file",
            new Blob([], { type: "application/pdf" }),
            "empty.pdf"
          );
        } else if (values.guestLecture) {
          formData.append("file", values.guestLecture);
        }
        // If editing, include the ID
        if (isEditMode && editId) {
          formData.append("guestLectureId", editId);
        }

        let response;

        if (isEditMode && editId) {
          response = await api.put("/guestLectures/update", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success(
            response.message || "Guest Lectures updated successfully!"
          );
        } else {
          response = await api.create("/guestLectures/save", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success(
            response.message || "Guest Lectures added successfully!"
          );
        }

        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsEditMode(false);
        setEditId(null);
        handleListGLClick();
      } catch (error) {
        toast.error("Failed to save Guest Lectures. Please try again.");
        console.error("Error creating Guest Lectures:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Student Activities & Support"
            breadcrumbItem="Guest Lectures"
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

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Semester</Label>
                      <Select
                        options={semType}
                        value={validation.values.semType}
                        onChange={(selectedOptions) =>
                          validation.setFieldValue("semType", selectedOptions)
                        }
                        placeholder="Select Semester"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.semType &&
                          validation.errors.semType
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.semType &&
                        validation.errors.semType && (
                          <div className="text-danger">
                            {validation.errors.semType}
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
                        Resource Person Name
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.resourcePersonName &&
                          validation.errors.resourcePersonName
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="resourcePersonName"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "resourcePersonName",
                            e.target.value
                          )
                        }
                        placeholder="Enter Resource Person Name"
                        value={validation.values.resourcePersonName}
                      />
                      {validation.touched.resourcePersonName &&
                        validation.errors.resourcePersonName && (
                          <div className="text-danger">
                            {validation.errors.resourcePersonName}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Resource Person Designation
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.resourcePersonOrganization &&
                          validation.errors.resourcePersonOrganization
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="resourcePersonOrganization"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "resourcePersonOrganization",
                            e.target.value
                          )
                        }
                        placeholder="Enter Resource Person Designation"
                        value={validation.values.resourcePersonOrganization}
                      />
                      {validation.touched.resourcePersonOrganization &&
                        validation.errors.resourcePersonOrganization && (
                          <div className="text-danger">
                            {validation.errors.resourcePersonOrganization}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Affiliation/Organization
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.affiliationOrg &&
                          validation.errors.affiliationOrg
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="affiliationOrg"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "affiliationOrg",
                            e.target.value
                          )
                        }
                        placeholder="Enter Affiliation/Organization"
                        value={validation.values.affiliationOrg}
                      />
                      {validation.touched.affiliationOrg &&
                        validation.errors.affiliationOrg && (
                          <div className="text-danger">
                            {validation.errors.affiliationOrg}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Title of the Talk
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.titleOfTalk &&
                          validation.errors.titleOfTalk
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="titleOfTalk"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "titleOfTalk",
                            e.target.value
                          )
                        }
                        placeholder="Enter Title of the Talk"
                        value={validation.values.titleOfTalk}
                      />
                      {validation.touched.titleOfTalk &&
                        validation.errors.titleOfTalk && (
                          <div className="text-danger">
                            {validation.errors.titleOfTalk}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Target Audience
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.targetAudience &&
                          validation.errors.targetAudience
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="targetAudience"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "targetAudience",
                            e.target.value
                          )
                        }
                        placeholder="Enter Target Audience"
                        value={validation.values.targetAudience}
                      />
                      {validation.touched.targetAudience &&
                        validation.errors.targetAudience && (
                          <div className="text-danger">
                            {validation.errors.targetAudience}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        No. of Participants
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
                        placeholder="Enter No. Of Participants"
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
                          validation.touched.guestLecture &&
                          validation.errors.guestLecture
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        innerRef={fileRef}
                        onChange={(event) => {
                          validation.setFieldValue(
                            "guestLecture",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.guestLecture &&
                        validation.errors.guestLecture && (
                          <div className="text-danger">
                            {validation.errors.guestLecture}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.guestLecture === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.guestLecture}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.guestLecture as string
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
                                validation.values.guestLecture as string,
                                "guestLecture"
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
                        onClick={handleListGLClick}
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
        {/* Modal for Listing Guest Lectures */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>List Guest Lectures</ModalHeader>
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
                  <th>Stream</th>
                  <th>Department</th>
                  <th>Semester Type</th>
                  <th>Resource Person</th>
                  <th>Resource Person Designation</th>
                  <th>Organisation</th>
                  <th>Title of Talk</th>
                  <th>Target Audience</th>
                  <th>No.Of Participants</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((gl, index) => (
                    <tr key={gl.guestLectureId}>
                      <td>{index + 1}</td>
                      <td>{gl.academicYear}</td>
                      <td>{gl.streamName}</td>
                      <td>{gl.departmentName}</td>
                      <td>{gl.semType}</td>
                      <td>{gl.resourcePersonName}</td>
                      <td>{gl.resourcePersonDesignation}</td>
                      <td>{gl.organisation}</td>
                      <td>{gl.titleOfTalk}</td>
                      <td>{gl.targetAudience}</td>
                      <td>{gl.noOfParticipants}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEdit(gl.guestLectureId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(gl.guestLectureId)}
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
                      No Guest Lectures available.
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

export default Guest_Lectures;
