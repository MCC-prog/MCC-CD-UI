import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
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
import axios from "axios";

const api = new APIClient();

const Consultancy_Undertaken_by_Staff: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consultancyUndertakenData, setConsultancyUndertakenData] = useState<
    any[]
  >([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [filteredData, setFilteredData] = useState(consultancyUndertakenData);
  const [filters, setFilters] = useState({
    academicYear: "",
    stream: "",
    department: "",
    facultyName: "",
    agencyName: "",
    titleProject: "",
    numberTrainees: "",
    addressAgency: "",
    revenueGenerated: "",
    file: null as string | null,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = consultancyUndertakenData.filter((row) =>
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

    const filtered = consultancyUndertakenData.filter((row) =>
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

  // Fetch  data from the backend
  const fetchConsultancyUndertakenData = async () => {
    try {
      const response = await api.get(
        "/consultancyUdertakenByStaff/getAllConsultancyUdertakenByStaff",
        ""
      );
      setConsultancyUndertakenData(response.data);
      setFilteredData(response);
    } catch (error) {
      console.error(
        "Error fetching Consultancy Undertaken By Staff data:",
        error
      );
    }
  };

  // Open the modal and fetch data
  const handleListConsultancyUndertakenClick = () => {
    toggleModal();
    fetchConsultancyUndertakenData();
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
      const response = await api.get(
        `/consultancyUdertakenByStaff?consultancyUdertakenByStaffId=${id}`,
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
              label: response.empStringName,
            }
          : null,
        department: response.departmentId
          ? {
              value: response.departmentId.toString(),
              label: response.departmentName,
            }
          : null,
        file: response.documents?.certificate || null,
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
        facultyName: response.facultyName || null,
        agencyName: response.agencyName || "",
        titleProject: response.titleOfProject || "",
        numberTrainees: response.noOfTrainees || "",
        addressAgency: response.addressOfAgency || "",
        revenueGenerated: response.revenueGenerated || "",
        file: response.certificate?.certificate || null,
      });
      setSelectedStream(streamOption);
      setSelectedDepartment(departmentOption);
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      // Disable the file upload button if a file exists
      setIsFileUploadDisabled(!!response.certificate?.certificate);
      toggleModal();
    } catch (error) {
      console.error(
        "Error fetching Consultancy Undertaken By Staff data by ID:",
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
          `/consultancyUdertakenByStaff/deleteConsultancyUdertakenByStaff?consultancyUdertakenByStaffId=${id}`,
          ""
        );
        toast.success(
          response.message ||
            "Consultancy Undertaken By Staff removed successfully!"
        );
        fetchConsultancyUndertakenData();
      } catch (error) {
        toast.error(
          "Failed to remove Consultancy Undertaken By Staff. Please try again."
        );
        console.error(
          "Error deleting Consultancy Undertaken By Staff :",
          error
        );
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
          `/consultancyUdertakenByStaff/download/${fileName}`,
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
        `/consultancyUdertakenByStaff/deleteConsultancyUdertakenByStaffDocument?consultancyUdertakenByStaffDocumentId=${editId}`,
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
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      facultyName: "",
      agencyName: "",
      titleProject: "",
      numberTrainees: "",
      addressAgency: "",
      revenueGenerated: "",
      file: null as string | null,
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
      agencyName: Yup.string().required("Please select Agency Name"),
      titleProject: Yup.string().required("Please select Title of the Project"),
      numberTrainees: Yup.string().required("Please Number of  Trainees"),
      addressAgency: Yup.string().required(
        "Please select Address of the Agency"
      ),
      revenueGenerated: Yup.string().required(
        "Please select Revenue Generated"
      ),
      file: Yup.mixed()
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
      formData.append("empStreamId", values.stream?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("facultyName", values.facultyName || "");
      formData.append("agencyName", values.agencyName || "");
      formData.append("titleOfProject", values.titleProject || "");
      formData.append("noOfTrainees", values.numberTrainees || "");
      formData.append("addressOfAgency", values.addressAgency || "");
      formData.append("revenueGenerated", values.revenueGenerated || "");

      // Append the file
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
          const response = await api.put(
            `/consultancyUdertakenByStaff`,
            formData
          );
          toast.success(
            response.message ||
              "Consultancy Undertaken By Staff updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/consultancyUdertakenByStaff",
            formData
          );
          toast.success(
            response.message ||
              "Consultancy Undertaken By Staff added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        setIsFileUploadDisabled(false); // Enable the file upload button
        handleListConsultancyUndertakenClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Consultancy Undertaken By Staff. Please try again."
        );
        console.error("Error creating Consultancy Undertaken By Staff:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="CONSULTANCY UNDERTAKEN BY STAFF"
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
                      <Label>Agency Name</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.agencyName &&
                          validation.errors.agencyName
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.agencyName}
                        onChange={(e) =>
                          validation.setFieldValue("agencyName", e.target.value)
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
                      <Label>Title of the Project</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.titleProject &&
                          validation.errors.titleProject
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.titleProject}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "titleProject",
                            e.target.value
                          )
                        }
                        placeholder="Enter Title of the Project"
                      />
                      {validation.touched.titleProject &&
                        validation.errors.titleProject && (
                          <div className="text-danger">
                            {validation.errors.titleProject}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Number of Trainees</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.numberTrainees &&
                          validation.errors.numberTrainees
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.numberTrainees}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "numberTrainees",
                            e.target.value
                          )
                        }
                        placeholder="Enter Number of Trainees"
                      />
                      {validation.touched.numberTrainees &&
                        validation.errors.numberTrainees && (
                          <div className="text-danger">
                            {validation.errors.numberTrainees}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Address of the Agency</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.addressAgency &&
                          validation.errors.addressAgency
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.addressAgency}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "addressAgency",
                            e.target.value
                          )
                        }
                        placeholder="Enter Address of the Agency"
                      />
                      {validation.touched.addressAgency &&
                        validation.errors.addressAgency && (
                          <div className="text-danger">
                            {validation.errors.addressAgency}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Revenue Generated</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.revenueGenerated &&
                          validation.errors.revenueGenerated
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.revenueGenerated}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "revenueGenerated",
                            e.target.value
                          )
                        }
                        placeholder="Enter Revenue Generated"
                      />
                      {validation.touched.revenueGenerated &&
                        validation.errors.revenueGenerated && (
                          <div className="text-danger">
                            {validation.errors.revenueGenerated}
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
                        onClick={handleListConsultancyUndertakenClick}
                      >
                        List Consultancy Undertaken By Staff
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Consultancy Undertaken */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Consultancy Undertaken By Staff
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
                  <th>Sl.No</th>
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
                    Agency Name
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.agencyName}
                      onChange={(e) => handleFilterChange(e, "agencyName")}
                    />
                  </th>
                  <th>
                    Title Project
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.titleProject}
                      onChange={(e) => handleFilterChange(e, "titleProject")}
                    />
                  </th>
                  <th>
                    Number Trainees
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.numberTrainees}
                      onChange={(e) => handleFilterChange(e, "numberTrainees")}
                    />
                  </th>
                  <th>
                    Address Agency
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.addressAgency}
                      onChange={(e) => handleFilterChange(e, "addressAgency")}
                    />
                  </th>
                  <th>
                    Revenue Generated
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.revenueGenerated}
                      onChange={(e) =>
                        handleFilterChange(e, "revenueGenerated")
                      }
                    />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((consultancyUndertaken, index) => (
                    <tr key={consultancyUndertaken.consultancyUndertakenDataId}>
                      <td>{index + 1}</td>
                      <td>{consultancyUndertaken.academicYear}</td>
                      <td>{consultancyUndertaken.empStringName}</td>
                      <td>{consultancyUndertaken.departmentName}</td>
                      <td>{consultancyUndertaken.facultyName}</td>
                      <td>{consultancyUndertaken.agencyName}</td>
                      <td>{consultancyUndertaken.titleOfProject}</td>
                      <td>{consultancyUndertaken.noOfTrainees}</td>
                      <td>{consultancyUndertaken.addressOfAgency}</td>
                      <td>{consultancyUndertaken.revenueGenerated}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(consultancyUndertaken.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(consultancyUndertaken.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center">
                      No MOUS data available.
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

export default Consultancy_Undertaken_by_Staff;
