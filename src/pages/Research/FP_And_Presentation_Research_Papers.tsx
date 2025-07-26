import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import { useFormik } from "formik";
import * as Yup from "yup";
import React, { useState } from "react";
import { Button, Card, CardBody, Col, Container, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "reactstrap";
import Breadcrumb from 'Components/Common/Breadcrumb';
import { APIClient } from "helpers/api_helper";
import { toast, ToastContainer } from "react-toastify";
import moment from "moment";
import axios from "axios";

const api = new APIClient();

const FP_And_Presentation_Research_Papers = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  // State variable for managing file upload status
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  // State variable for managing faculty participationData data
  const [facultyParticipationData, setFacultyParticipationData] = useState<any[]>([]);
  // State variable for managing the modal for listing Faculty Participation
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
    type: "",
    mode: "",
    level: "",
    role: "",
    paperTitle: "",
    organisingInstitute: "",
    fromDate: "",
    toDate: ""
  });

  const [filteredData, setFilteredData] = useState(facultyParticipationData);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = facultyParticipationData.filter((row) =>
      Object.values(row).some((val) =>
        String(val || "").toLowerCase().includes(value)
      )
    );
    setFilteredData(filtered);
  };

  // Handle column-specific filters
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>, column: string) => {
    const value = e.target.value.toLowerCase();
    const updatedFilters = { ...filters, [column]: value };
    setFilters(updatedFilters);

    const filtered = facultyParticipationData.filter((row) =>
      Object.values(row).some((val) =>
        String(val || "").toLowerCase().includes(value)
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

  // Toggle the modal for listing Faculty Participation
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
      type: null as { value: string; label: string } | null,
      mode: null as { value: string; label: string } | null,
      level: null as { value: string; label: string } | null,
      role: null as { value: string; label: string } | null,
      paperTitle: "",
      organisingInstitute: "",
      fromDate: "",
      toDate: "",
      facultyCertificate: null as File | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>().nullable().required("Please select academic year"),
      stream: Yup.object<{ value: string; label: string }>().nullable().required("Please select school"),
      department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
      otherDepartment: Yup.string().when("department", (department: any, schema) => {
        return department?.value === "Others"
          ? schema.required("Please specify the department")
          : schema;
      }),
      facultyName: Yup.string().required("Please enter faculty name"),
      type: Yup.object<{ value: string; label: string }>().nullable().required("Please select type"),
      mode: Yup.object<{ value: string; label: string }>().nullable().required("Please select mode"),
      level: Yup.object<{ value: string; label: string }>().nullable().required("Please select level"),
      role: Yup.object<{ value: string; label: string }>().nullable().required("Please select role"),
      paperTitle: Yup.string().required("Please enter title of the paper"),
      organisingInstitute: Yup.string().required("Please enter organizing institute"),
      fromDate: Yup.date().required("Please select from date"),
      toDate: Yup.date().required("Please select to date"),
      facultyCertificate: Yup.mixed().required("Please upload the certificate"),
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();
      formData.append("facultyParticipationId", editId || "null");
      formData.append("academicYear", values.academicYear?.value || "null");
      formData.append("departmentId", values.department?.value || "null");
      formData.append("streamId", values.stream?.value || "null");
      formData.append("otherDepartment", values.otherDepartment || "null");
      formData.append("facultyName", values.facultyName || "null");
      formData.append("type", values.type?.value || "null");
      formData.append("mode", values.mode?.value || "null");
      formData.append("level", values.level?.value || "null");
      formData.append("role", values.role?.value || "null");
      formData.append("paperTitle", values.paperTitle || "null");
      formData.append("organisingInstitute", values.organisingInstitute || "null");
      formData.append("fromDate", values.fromDate ? moment(values.fromDate, "YYYY-MM-DD").format("DD/MM/YYYY") : "null");
      formData.append("toDate", values.toDate ? moment(values.toDate, "YYYY-MM-DD").format("DD/MM/YYYY") : "null");
      // Append the file
      if (typeof values.facultyCertificate === "string") {
        // If the file is just a name, send null
        formData.append("facultyCertificate", "null");
      } else if (values.facultyCertificate instanceof File) {
        // If the file is a File object, send the file
        formData.append("facultyCertificate", values.facultyCertificate);
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/facultyParticipation/update`, formData);
          toast.success(response.message || "Faculty Participation updated successfully!");
        } else {
          // Call the save API
          const response = await api.create("/facultyParticipation/save", formData);
          toast.success(response.message || "Faculty Participation added successfully!");
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // Display the Faculty Participation List
        handleListFPClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Faculty Participation. Please try again.");
        console.error("Error creating/updating Faculty Participation:", error);
      }
    },
  });

  const fetchFPData = async () => {
    try {
      const response = await api.get("/facultyParticipation/getAll", '');
      setFacultyParticipationData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Faculty Participation data:", error);
    }
  }

  // Open the modal and fetch data
  const handleListFPClick = () => {
    toggleModal();
    fetchFPData();
  };

  // Handle edit action
  // Fetch the data for the selected BOS ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(`/facultyParticipation/edit?facultyParticipationId=${id}`, '');
      const academicYearOptions = await api.get("/getAllAcademicYear", "");

      // Filter the response where isCurrent or isCurrentForAdmission is true
      const filteredAcademicYearList = academicYearOptions.filter(
        (year: any) => year.isCurrent || year.isCurrentForAdmission
      );

      // Map the filtered data to the required format
      const academicYearList = filteredAcademicYearList.map((year: any) => ({
        value: year.year,
        label: year.display
      }));

      // Map API response to Formik values
      const mappedValues = {
        academicYear: mapValueToLabel(response.academicYear, academicYearList),
        stream: response.streamId
          ? { value: response.streamId.toString(), label: response.streamName }
          : null,
        department: response.departmentId
          ? { value: response.departmentId.toString(), label: response.departmentName }
          : null,
        otherDepartment: response.otherDepartment || "",
        facultyName: response.facultyName || "",
        type: response.type ? { value: response.type, label: response.type } : null,
        mode: response.mode ? { value: response.mode.toLowerCase(), label: response.mode } : null,
        level: response.level ? { value: response.level.toLowerCase(), label: response.level } : null,
        role: response.role ? { value: response.role.toLowerCase(), label: response.role } : null,
        paperTitle: response.paperTitle || "",
        organisingInstitute: response.organisingInstitute || "",
        fromDate: response.fromDate
          ? moment(response.fromDate, "DD/MM/YYYY").isValid()
            ? moment(response.fromDate, "DD/MM/YYYY").format("YYYY-MM-DD")
            : ""
          : "",
        toDate: response.toDate
          ? moment(response.toDate, "DD/MM/YYYY").isValid()
            ? moment(response.toDate, "DD/MM/YYYY").format("YYYY-MM-DD")
            : ""
          : "",
        facultyCertificate: response.document?.facultyCertificate || null,
      };

      // Update Formik values
      validation.setValues({
        ...mappedValues,
        academicYear: mappedValues.academicYear
          ? { ...mappedValues.academicYear, value: String(mappedValues.academicYear.value) }
          : null,
        stream: mappedValues.stream
          ? { ...mappedValues.stream, value: String(mappedValues.stream.value) }
          : null,
        department: mappedValues.department
          ? { ...mappedValues.department, value: String(mappedValues.department.value) }
          : null,
      });

      // Set edit mode and toggle modal
      setIsEditMode(true);
      setEditId(id); // Store the ID of the record being edited
      // Disable file upload if a file exists
      setIsFileUploadDisabled(!!response.document?.facultyCertificate);
      toggleModal();
    } catch (error) {
      console.error("Error fetching Faculty Participation data by ID:", error);
    }
  };

  // Handle file download actions
  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(`/facultyParticipation/download/${fileName}`, {
          responseType: 'blob'
        });

        // Create a Blob from the response data
        const blob = new Blob([response], { type: "*/*" });

        // Create a URL for the Blob
        const url = window.URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName; // Set the file name for the download
        document.body.appendChild(link);
        link.click();

        // Clean up the URL and remove the anchor element
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("File downloaded successfully!");
      } catch (error) {
        toast.error("Failed to download upload ltter file. Please try again.");
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
      const response = await api.delete(`/facultyParticipation/deleteFacultyParticipationDocument?facultyParticipationId=${editId}&docType=facultyCertificate`, '');
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      // Remove the file from the form
      validation.setFieldValue("facultyCertificate", null); // Clear the file from Formik state
      setIsFileUploadDisabled(false); // Enable the file upload button
    } catch (error) {
      // Show error message
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  // Map value to label for dropdowns
  const mapValueToLabel = (value: string | number | null, options: { value: string | number; label: string }[]): { value: string | number; label: string } | null => {
    if (!value) return null;
    const matchedOption = options.find((option) => option.value === value);
    return matchedOption ? matchedOption : { value, label: String(value) };
  };

  function handleDelete(facultyDataId: any): void {
    setDeleteId(facultyDataId);
    setIsDeleteModalOpen(true);
  }

  // Confirm deletion of the record
  // Call the delete API and refresh the BOS data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(`/facultyParticipation/deleteFacultyParticipation?facultyParticipationId=${id}`, '');
        toast.success(response.message || "Faculty Participation record removed successfully!");
        fetchFPData();
      } catch (error) {
        toast.error("Failed to remove Faculty Participation Record. Please try again.");
        console.error("Error deleting Faculty Participation:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Research" breadcrumbItem="FP And Presentation Research Papers" />
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
                          validation.setFieldValue("academicYear", selectedOption)
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
                          validation.touched.stream && !!validation.errors.stream
                        }
                      />
                      {validation.touched.stream && validation.errors.stream && (
                        <div className="text-danger">{validation.errors.stream}</div>
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
                          validation.setFieldValue("department", selectedOption);
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
                          className={`form-control ${validation.touched.otherDepartment && validation.errors.otherDepartment ? "is-invalid" : ""
                            }`}
                          value={validation.values.otherDepartment}
                          onChange={(e) => validation.setFieldValue("otherDepartment", e.target.value)}
                          placeholder="Enter Department Name"
                        />
                        {validation.touched.otherDepartment && validation.errors.otherDepartment && (
                          <div className="text-danger">{validation.errors.otherDepartment}</div>
                        )}
                      </div>
                    </Col>
                  )}
                  {/* Faculty Name */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Faculty Name</Label>
                      <Input
                        type="text"
                        name="facultyName"
                        value={validation.values.facultyName}
                        onChange={(e) => validation.setFieldValue("facultyName", e.target.value)}
                        className={`form-control ${validation.touched.facultyName && validation.errors.facultyName ? "is-invalid" : ""}`}
                        placeholder="Enter Faculty Name"
                      />
                      {validation.touched.facultyName && validation.errors.facultyName && (
                        <div className="text-danger">{validation.errors.facultyName}</div>
                      )}
                    </div>
                  </Col>

                  {/* Type Dropdown */}
                  {/* Type Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Type</Label>
                      <Input
                        type="select"
                        value={validation.values.type?.value || ""}
                        onChange={(e) => {
                          const selected = e.target.value
                            ? { value: e.target.value, label: ((e.target as unknown) as HTMLSelectElement).options[((e.target as unknown) as HTMLSelectElement).selectedIndex].text }
                            : null;
                          validation.setFieldValue("type", selected);
                        }}
                        className={`form-control ${validation.touched.type && validation.errors.type ? "is-invalid" : ""}`}
                      >
                        <option value="">Select Type</option>
                        <option value="workshop">Workshop</option>
                        <option value="seminar">Seminar</option>
                        <option value="conference">Conference</option>
                      </Input>
                      {validation.touched.type && validation.errors.type && (
                        <div className="text-danger">{validation.errors.type}</div>
                      )}
                    </div>
                  </Col>

                  {/* Mode Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Mode</Label>
                      <Input
                        type="select"
                        value={validation.values.mode?.value || ""}
                        onChange={(e) => {
                          const selected = e.target.value
                            ? { value: e.target.value, label: ((e.target as unknown) as HTMLSelectElement).options[((e.target as unknown) as HTMLSelectElement).selectedIndex].text }
                            : null;
                          validation.setFieldValue("mode", selected);
                        }}
                        className={`form-control ${validation.touched.mode && validation.errors.mode ? "is-invalid" : ""}`}
                      >
                        <option value="">Select Mode</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                      </Input>
                      {validation.touched.mode && validation.errors.mode && (
                        <div className="text-danger">{validation.errors.mode}</div>
                      )}
                    </div>
                  </Col>

                  {/* Level Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Level</Label>
                      <Input
                        type="select"
                        value={validation.values.level?.value || ""}
                        onChange={(e) => {
                          const selected = e.target.value
                            ? { value: e.target.value, label: ((e.target as unknown) as HTMLSelectElement).options[((e.target as unknown) as HTMLSelectElement).selectedIndex].text }
                            : null;
                          validation.setFieldValue("level", selected);
                        }}
                        className={`form-control ${validation.touched.level && validation.errors.level ? "is-invalid" : ""}`}
                      >
                        <option value="">Select Level</option>
                        <option value="state">State</option>
                        <option value="national">National</option>
                        <option value="international">International</option>
                      </Input>
                      {validation.touched.level && validation.errors.level && (
                        <div className="text-danger">{validation.errors.level}</div>
                      )}
                    </div>
                  </Col>

                  {/* Role Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Role</Label>
                      <Input
                        type="select"
                        value={validation.values.role?.value || ""}
                        onChange={(e) => {
                          const selected = e.target.value
                            ? { value: e.target.value, label: ((e.target as unknown) as HTMLSelectElement).options[((e.target as unknown) as HTMLSelectElement).selectedIndex].text }
                            : null;
                          validation.setFieldValue("role", selected);
                        }}
                        className={`form-control ${validation.touched.role && validation.errors.role ? "is-invalid" : ""}`}
                      >
                        <option value="">Select Role</option>
                        <option value="presentor">Presentor</option>
                        <option value="participant">Participant</option>
                        <option value="resource person">Resource Person</option>
                      </Input>
                      {validation.touched.role && validation.errors.role && (
                        <div className="text-danger">{validation.errors.role}</div>
                      )}
                    </div>
                  </Col>

                  {/* Title of the Paper */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Title of the Paper</Label>
                      <Input
                        type="text"
                        value={validation.values.paperTitle}
                        onChange={(e) => validation.setFieldValue("paperTitle", e.target.value)}
                        className={`form-control ${validation.touched.paperTitle && validation.errors.paperTitle ? "is-invalid" : ""}`}
                        placeholder="Enter Title of the Paper"
                      />
                      {validation.touched.paperTitle && validation.errors.paperTitle && (
                        <div className="text-danger">{validation.errors.paperTitle}</div>
                      )}
                    </div>
                  </Col>

                  {/* Organizing Institute */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Organizing Institute</Label>
                      <Input
                        type="text"
                        value={validation.values.organisingInstitute}
                        onChange={(e) => validation.setFieldValue("organisingInstitute", e.target.value)}
                        className={`form-control ${validation.touched.organisingInstitute && validation.errors.organisingInstitute ? "is-invalid" : ""}`}
                        placeholder="Enter Organizing Institute"
                      />
                      {validation.touched.organisingInstitute && validation.errors.organisingInstitute && (
                        <div className="text-danger">{validation.errors.organisingInstitute}</div>
                      )}
                    </div>
                  </Col>

                  {/* From Date */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>From Date</Label>
                      <Input
                        type="date"
                        className={`form-control ${validation.touched.fromDate && validation.errors.fromDate ? "is-invalid" : ""}`}
                        value={validation.values.fromDate || ""}
                        onChange={(e) => {
                          validation.setFieldValue("fromDate", e.target.value); // Store as YYYY-MM-DD
                        }}
                        placeholder="dd/mm/yyyy"
                      />
                      {validation.touched.fromDate && validation.errors.fromDate && (
                        <div className="text-danger">
                          {typeof validation.errors.fromDate === "string" && validation.errors.fromDate}
                        </div>
                      )}
                    </div>
                  </Col>

                  {/* To Date */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>To Date</Label>
                      <Input
                        type="date"
                        className={`form-control ${validation.touched.toDate && validation.errors.toDate ? "is-invalid" : ""}`}
                        value={validation.values.toDate || ""}
                        onChange={(e) => {
                          validation.setFieldValue("toDate", e.target.value); // Store as YYYY-MM-DD
                        }}
                        placeholder="dd/mm/yyyy"
                      />
                      {validation.touched.toDate && validation.errors.toDate && (
                        <div className="text-danger">
                          {typeof validation.errors.toDate === "string" && validation.errors.toDate}
                        </div>
                      )}
                    </div>
                  </Col>

                  {/* Upload Certificate */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Upload Certificate</Label>
                      <Input
                        type="file"
                        onChange={(e) => validation.setFieldValue("facultyCertificate", e.target.files?.[0] || null)}
                        className={`form-control ${validation.touched.facultyCertificate && validation.errors.facultyCertificate ? "is-invalid" : ""}`}
                        disabled={isFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.facultyCertificate && validation.errors.facultyCertificate && (
                        <div className="text-danger">{validation.errors.facultyCertificate}</div>
                      )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.facultyCertificate === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span className="me-2" style={{ fontWeight: "bold", color: "green" }}>
                            {validation.values.facultyCertificate}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() => {
                              if (typeof validation.values.facultyCertificate === "string") {
                                handleDownloadFile(validation.values.facultyCertificate);
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
                        onClick={handleListFPClick}
                      >
                        List FPRP
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Faculty Participation */}
        <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg" style={{ maxWidth: "100%", width: "auto" }}>
          <ModalHeader toggle={toggleModal}>List FP and Presentation Reserach Papers</ModalHeader>
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
                    School
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.stream}
                      onChange={(e) => handleFilterChange(e, "stream")}
                    />
                  </th>
                  <th>
                    Department
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.department}
                      onChange={(e) => handleFilterChange(e, "department")}
                    />
                  </th>
                  <th>
                    Faculty Name
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.facultyName}
                      onChange={(e) => handleFilterChange(e, "programType")}
                    />
                  </th>
                  <th>
                    Type
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.type}
                      onChange={(e) => handleFilterChange(e, "type")}
                    />
                  </th>
                  <th>
                    Mode
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.mode}
                      onChange={(e) => handleFilterChange(e, "mode")}
                    />
                  </th>
                  <th>
                    Level
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.level}
                      onChange={(e) => handleFilterChange(e, "level")}
                    />
                  </th>
                  <th>
                    Role
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.role}
                      onChange={(e) => handleFilterChange(e, "role")}
                    />
                  </th>
                  <th>
                    Title of Paper
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.paperTitle}
                      onChange={(e) => handleFilterChange(e, "paperTitle")}
                    />
                  </th>
                  <th>
                    Organizing Institute
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.organisingInstitute}
                      onChange={(e) => handleFilterChange(e, "organisingInstitute")}
                    />
                  </th>
                  <th>
                    From Date
                    <Input
                      type="date"
                      value={filters.fromDate}
                      onChange={(e) => handleFilterChange(e, "fromDate")}
                    />
                  </th>
                  <th>
                    To Date
                    <Input
                      type="date"
                      value={filters.toDate}
                      onChange={(e) => handleFilterChange(e, "toDate")}
                    />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((fp, index) => (
                    <tr key={fp.facultyParticipationId}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{fp.academicYear}</td>
                      <td>{fp.streamName}</td>
                      <td>{fp.departmentName}</td>
                      <td>{fp.facultyName}</td>
                      <td>{fp.type}</td>
                      <td>{fp.mode}</td>
                      <td>{fp.level}</td>
                      <td>{fp.role}</td>
                      <td>{fp.paperTitle}</td>
                      <td>{fp.organisingInstitute}</td>
                      <td>{fp.fromDate}</td>
                      <td>{fp.toDate}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(fp.facultyParticipationId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(fp.facultyParticipationId)}
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
                      No Faculty Program data available.
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
        <Modal isOpen={isDeleteModalOpen} toggle={() => setIsDeleteModalOpen(false)}>
          <ModalHeader toggle={() => setIsDeleteModalOpen(false)}>Confirm Deletion</ModalHeader>
          <ModalBody>
            Are you sure you want to delete this record? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={() => confirmDelete(deleteId!)}>
              Delete
            </Button>
            <Button color="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
      <ToastContainer />
    </React.Fragment >
  );
};

export default FP_And_Presentation_Research_Papers;