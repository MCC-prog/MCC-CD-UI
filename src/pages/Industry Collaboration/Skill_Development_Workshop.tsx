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
import React, { useState } from "react";
import Select from "react-select";
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
import axios from "axios";

const api = new APIClient();

const Skill_Development_Workshop: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skillDevelopmentData, setSkillDevelopmentData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [filteredData, setFilteredData] = useState(skillDevelopmentData);
  const [filters, setFilters] = useState({
    academicYear: "",
    stream: "",
    department: "",
    facultyName: "",
    staffEnhancementProgramType: "",
    title: "",
    organizedBy: "",
    fromDate: "",
    toDate: "",
    skillDevelopmentDoc: null as string | null,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = skillDevelopmentData.filter((row) =>
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

    const filtered = skillDevelopmentData.filter((row) =>
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

  // Fetch Skill Development data from the backend
  const fetchSkillDevelopmentData = async () => {
    try {
      const response = await api.get(
        "/skillDevelopmentWorkshop/getAllSkillDevelopmentWorkshop",
        ""
      );
      setSkillDevelopmentData(response.data);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Skill Development Workshop data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListSkillDevelopmentClick = () => {
    toggleModal();
    fetchSkillDevelopmentData();
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
  // Fetch the data for the selected new Courses Introduced ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/skillDevelopmentWorkshop?skillDevelopmentWorkshopId=${id}`,
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
        stream: response.empStreamId
          ? {
              value: response.empStreamId.toString(),
              label: response.empStreamName,
            }
          : null,
        department: response.departmentId
          ? {
              value: response.departmentId.toString(),
              label: response.departmentName,
            }
          : null,
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
        stream: mappedValues.stream || null,
        department: mappedValues.department || null,
        staffEnhancementProgramType: response.staffEnhProgramType
          ? {
              value: response.staffEnhProgramType,
              label: response.staffEnhProgramType,
            }
          : null,
        facultyName: response.facultyName || "",
        title: response.title || "",
        organizedBy: response.organizedBy || "",
        fromDate: response.fromDate || "",
        toDate: response.toDate || "",
        skillDevelopmentDoc: response.documents?.skillDevelopmentDoc || null,
      });
      setSelectedStream(streamOption);
      setSelectedDepartment(departmentOption);
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      // Disable the file upload button if a file exists
      setIsFileUploadDisabled(!!response.documents?.mous);
      setIsFileUploadDisabled(!!response.documents?.activity);
      toggleModal();
    } catch (error) {
      console.error(
        "Error fetching Skill Development Workshop data by ID:",
        error
      );
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/skillDevelopmentWorkshop/deleteSkillDevelopmentWorkshop?skillDevelopmentWorkshopId=${id}`,
          ""
        );
        toast.success(
          response.message || "Skill Development Workshop removed successfully!"
        );
        fetchSkillDevelopmentData();
      } catch (error) {
        toast.error(
          "Failed to remove Skill Development Workshop. Please try again."
        );
        console.error("Error deleting Skill Development Workshop :", error);
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
        const response = await axios.get(
          `/skillDevelopmentWorkshop/download/${fileName}`,
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
  const handleDeleteFile = async () => {
    try {
      // Call the delete API
      const response = await api.delete(
        `/skillDevelopmentWorkshop/deleteSkillDevelopmentWorkshopDocument?skillDevelopmentWorkshopDocumentId=${editId}`,
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

  const StaffEnhancementProgramType = [
    { value: "FDP", label: "FDP" },
    { value: "MOOCS", label: "MOOCS" },
    {
      value: "SKILL ENHANCEMENT WORKSHOP",
      label: "SKILL ENHANCEMENT WORKSHOP",
    },
  ];

  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
  };
  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      facultyName: "",
      staffEnhancementProgramType: null as {
        value: string;
        label: string;
      } | null,
      title: "",
      organizedBy: "",
      fromDate: "",
      toDate: "",
      skillDevelopmentDoc: null as string | null,
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
      facultyName: Yup.string().required("Please select Faculty Name"),
      staffEnhancementProgramType: Yup.object<{
        value: string;
        label: string;
      }>()
        .nullable()
        .required("Please select Centralised Centres"),
      title: Yup.string().required("Please select Title"),
      organizedBy: Yup.string().required("Please select Organized By"),
      fromDate: Yup.date().required("Please select From Date"),
      toDate: Yup.date().required("Please select To Date"),
      skillDevelopmentDoc: Yup.mixed()
        .required("Please upload a file")
        .test("fileSize", "File size is too large", (value: any) => {
          return value && value.size <= 2 * 1024 * 1024; // 2MB limit
        })
        .test("fileType", "Unsupported file format", (value: any) => {
          return (
            value &&
            ["application/pdf", "image/jpeg", "image/png"].includes(value.type)
          );
        }),
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("facultyName", values.facultyName || "");
      formData.append(
        "staffEnhProgramType",
        values.staffEnhancementProgramType?.value || ""
      );
      formData.append("organizedBy", values.organizedBy || "");
      formData.append("title", values.title || "");
      formData.append("fromDate", formatDate(values.fromDate) || "");
      formData.append("toDate", formatDate(values.toDate) || "");
      // Append the file
      if (isEditMode && typeof values.skillDevelopmentDoc === "string") {
        // Pass an empty Blob instead of null
        formData.append("skillDevelopmentDoc", new Blob([]), "empty.pdf");
      } else if (isEditMode && values.skillDevelopmentDoc === null) {
        formData.append("skillDevelopmentDoc", new Blob([]), "empty.pdf");
      } else if (values.skillDevelopmentDoc) {
        formData.append("skillDevelopmentDoc", values.skillDevelopmentDoc);
      }

      if (isEditMode && editId) {
        formData.append("id", editId);
      }
      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/skillDevelopmentWorkshop`, formData);
          toast.success(
            response.message ||
              "Skill Development Workshop updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/skillDevelopmentWorkshop",
            formData
          );
          toast.success(
            response.message || "Skill Development Workshop added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        setIsFileUploadDisabled(false); // Enable the file upload button
        handleListSkillDevelopmentClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Skill Development Workshop. Please try again."
        );
        console.error("Error creating Skill Development Workshop:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Skill Development Workshop"
            breadcrumbItem="Industry Collaboration"
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
                      <Label>Faculty Name</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.facultyName &&
                          validation.errors.facultyName
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.facultyName}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "facultyName",
                            e.target.value
                          )
                        }
                        placeholder="Enter Faculty Name"
                      />
                      {validation.touched.facultyName &&
                        validation.errors.facultyName && (
                          <div className="text-danger">
                            {validation.errors.facultyName}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Staff Enhancement ProgramType</Label>
                      <Select
                        options={StaffEnhancementProgramType}
                        value={validation.values.staffEnhancementProgramType}
                        onChange={(selectedOption) =>
                          validation.setFieldValue(
                            "staffEnhancementProgramType",
                            selectedOption
                          )
                        }
                        placeholder="Select Staff Enhancement ProgramType"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.staffEnhancementProgramType &&
                          validation.errors.staffEnhancementProgramType
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.staffEnhancementProgramType &&
                        validation.errors.staffEnhancementProgramType && (
                          <div className="text-danger">
                            {validation.errors.staffEnhancementProgramType}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Title</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.title && validation.errors.title
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.title}
                        onChange={(e) =>
                          validation.setFieldValue("title", e.target.value)
                        }
                        placeholder="Enter Title"
                      />
                      {validation.touched.title && validation.errors.title && (
                        <div className="text-danger">
                          {validation.errors.title}
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Organization By</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.organizedBy &&
                          validation.errors.organizedBy
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.organizedBy}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "organizedBy",
                            e.target.value
                          )
                        }
                        placeholder="Enter Organization By"
                      />
                      {validation.touched.organizedBy &&
                        validation.errors.organizedBy && (
                          <div className="text-danger">
                            {validation.errors.organizedBy}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>From Date</Label>
                      <Input
                        type="date"
                        className={`form-control ${
                          validation.touched.fromDate &&
                          validation.errors.fromDate
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.fromDate}
                        onChange={(e) =>
                          validation.setFieldValue("fromDate", e.target.value)
                        }
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
                        type="date"
                        className={`form-control ${
                          validation.touched.toDate && validation.errors.toDate
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.toDate}
                        onChange={(e) =>
                          validation.setFieldValue("toDate", e.target.value)
                        }
                      />
                      {validation.touched.toDate &&
                        validation.errors.toDate && (
                          <div className="text-danger">
                            {validation.errors.toDate}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Certificate
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
                          validation.touched.skillDevelopmentDoc &&
                          validation.errors.skillDevelopmentDoc
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        onChange={(event) => {
                          validation.setFieldValue(
                            "skillDevelopmentDoc",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.skillDevelopmentDoc &&
                        validation.errors.skillDevelopmentDoc && (
                          <div className="text-danger">
                            {validation.errors.skillDevelopmentDoc}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.skillDevelopmentDoc ===
                        "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.skillDevelopmentDoc}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.skillDevelopmentDoc as string
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
                        onClick={handleListSkillDevelopmentClick}
                      >
                        List Skill Development Workshop
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Skill Development Workshop */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Skill Development Workshop
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
            <Table bordered>
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
                    Schools
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
                      onChange={(e) => handleFilterChange(e, "facultyName")}
                    />
                  </th>
                  <th>
                    Staff Enhancement ProgramType
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.staffEnhancementProgramType}
                      onChange={(e) =>
                        handleFilterChange(e, "staffEnhancementProgramType")
                      }
                    />
                  </th>
                  <th>
                    Title
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.title}
                      onChange={(e) => handleFilterChange(e, "title")}
                    />
                  </th>
                  <th>
                    Organization By
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.organizedBy}
                      onChange={(e) => handleFilterChange(e, "organizedBy")}
                    />
                  </th>
                  <th>
                    From Date
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.fromDate}
                      onChange={(e) => handleFilterChange(e, "fromDate")}
                    />
                  </th>
                  <th>
                    To Date
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.toDate}
                      onChange={(e) => handleFilterChange(e, "toDate")}
                    />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((skillDevelopment, index) => (
                    <tr key={skillDevelopment.skillDevelopmentDataId}>
                      <td>{index + 1}</td>
                      <td>{skillDevelopment.academicYear}</td>
                      <td>{skillDevelopment.streamName}</td>
                      <td>{skillDevelopment.departmentName}</td>
                      <td>{skillDevelopment.facultyName}</td>
                      <td>{skillDevelopment.staffEnhProgramType}</td>
                      <td>{skillDevelopment.title}</td>
                      <td>{skillDevelopment.organizedBy}</td>
                      <td>{skillDevelopment.fromDate}</td>
                      <td>{skillDevelopment.toDate}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(skillDevelopment.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(skillDevelopment.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center">
                      No Skill Development Workshop data available.
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

export default Skill_Development_Workshop;
