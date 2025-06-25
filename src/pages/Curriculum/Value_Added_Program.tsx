import axios from "axios";
import Breadcrumb from "Components/Common/Breadcrumb";
import { SEMESTER_NO_OPTIONS } from "Components/constants/layout";
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
import moment from "moment";

const api = new APIClient();
const Value_Added_Program: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vapData, setVapData] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  // State variable for managing filters
  const [filters, setFilters] = useState({
    academicYear: "",
    stream: "",
    noOfCredits: "",
    startDate: "",
    studentName: "",
    registerNumber: "",
    courseTitle: "",
    NumberOfStudentsEnrl: "",
    NumberOfStudentsCompleted: "",
    endDate: "",
    resourcePerson: "",
    hostingInstOrg: "",
  });
  const [filteredData, setFilteredData] = useState(vapData);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = vapData.filter((row) =>
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

    const filtered = vapData.filter((row) =>
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
  const fetchVapData = async () => {
    try {
      const response = await axios.get(
        "/valueAddedCourse/getAllValueAddedCourse"
      ); // Replace with your backend API endpoint
      setVapData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching BOS data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListVAPClick = () => {
    toggleModal();
    fetchVapData();
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
        `/valueAddedCourse/edit?valueAddedCourseId=${id}`,
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
        otherDepartment: "", // Add default value for otherDepartment
        noOfCredits: response.noOfCredits || "",
        startDate: response.startDate ? response.startDate : "",
        endDate: response.endDate ? response.endDate : "",
        studentName: response.studentName || "",
        registerNumber: response.registerNo || "",
        courseTitle: response.courseTitle || "",
        NumberOfStudentsEnrl: response.noOfStudentsEnrolled || "",
        NumberOfStudentsCompleted: response.noOfStudentsCompleted || "",
        resourcePerson: response.resourcePerson || "",
        hostingInstOrg: response.organization || "",
        file: response.documents?.valueAddedCourse || null,
      };

      // Update Formik values
      validation.setValues({
        ...mappedValues,
        academicYear: mappedValues.academicYear
          ? {
              value: String(mappedValues.academicYear.value),
              label: mappedValues.academicYear.label || "",
            }
          : null,
        stream: mappedValues.stream
          ? {
              value: String(mappedValues.stream.value),
              label: mappedValues.stream.label || "",
            }
          : null,
        department: mappedValues.department
          ? {
              value: String(mappedValues.department.value),
              label: mappedValues.department.label || "",
            }
          : null,
        otherDepartment: mappedValues.otherDepartment || "",
        noOfCredits: mappedValues.noOfCredits || "",
        studentName: mappedValues.studentName || "",
        registerNumber: mappedValues.registerNumber || "",
        courseTitle: mappedValues.courseTitle || "",
        NumberOfStudentsEnrl: mappedValues.NumberOfStudentsEnrl || "",
        NumberOfStudentsCompleted: mappedValues.NumberOfStudentsCompleted || "",
        resourcePerson: mappedValues.resourcePerson || "",
        hostingInstOrg: mappedValues.hostingInstOrg || "",
      });
      setIsEditMode(true);
      setEditId(id);
      toggleModal();
    } catch (error) {
      console.error("Error fetching BOS data by ID:", error);
    }
  };

  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/valueAddedCourse/deleteValueAddedCourse?valueAddedCourseId=${id}`,
          ""
        );
        toast.success(
          response.message || "Value Added Program removed successfully!"
        );
        fetchVapData();
      } catch (error) {
        toast.error("Failed to remove Value Added Program. Please try again.");
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
          `/valueAddedCourse/download/${fileName}`,
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
        `/valueAddedCourse/deleteNewProgramDocument?valueAddedCourseId=${editId}`,
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
      otherDepartment: "",
      noOfCredits: "",
      startDate: "",
      studentName: "",
      registerNumber: "",
      courseTitle: "",
      NumberOfStudentsEnrl: "",
      NumberOfStudentsCompleted: "",
      endDate: "",
      resourcePerson: "",
      hostingInstOrg: "",
      file: null as File | string | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select academic year"),
      stream: Yup.object().nullable().required("Please select school"),
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
      noOfCredits: Yup.number()
        .typeError("Please enter a valid number")
        .min(0, "Percentage cannot be less than 0")
        .max(100, "Percentage cannot be more than 100")
        .required("Please enter revision percentage"),
      startDate: Yup.string()
        .required("Start date is required")
        .test("is-valid-date", "Invalid start date", (value) =>
          moment(value, "DD/MM/YYYY", true).isValid()
        ),

      endDate: Yup.string()
        .required("End date is required")
        .test("is-valid-date", "Invalid end date", (value) =>
          moment(value, "DD/MM/YYYY", true).isValid()
        ),

      studentName: Yup.string().required("Please enter student name"),
      registerNumber: Yup.string().required("Please enter register number"),
      courseTitle: Yup.string().required("Please enter course title"),
      NumberOfStudentsEnrl: Yup.number()
        .typeError("Please enter a valid number")
        .min(0, "Number of students enrolled cannot be less than 0")
        .required("Please enter number of students enrolled"),
      NumberOfStudentsCompleted: Yup.number()
        .typeError("Please enter a valid number")
        .min(0, "Number of students completed cannot be less than 0")
        .required("Please enter number of students completed"),
      resourcePerson: Yup.string().required("Please enter resource person"),
      hostingInstOrg: Yup.string().required(
        "Please enter hosting institution/ organization"
      ),
      file: Yup.mixed().test(
        "fileValidation",
        "Please upload a valid Excel file",
        function (value) {
          if (isFileUploadDisabled) return true;

          if (!value) {
            return this.createError({ message: "Please upload a file" });
          }

          // File size check (2MB)
          if (value instanceof File && value.size > 2 * 1024 * 1024) {
            return this.createError({
              message: "File size is too large (max 2MB)",
            });
          }

          // ✅ Allowed MIME types for Excel
          const allowedTypes = [
            "application/vnd.ms-excel", // .xls
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
          ];

          if (value instanceof File && !allowedTypes.includes(value.type)) {
            return this.createError({
              message: "Only Excel files are allowed",
            });
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
      formData.append("streamId", values.stream?.value || "");
      formData.append("noOfCredits", values.noOfCredits || "");
      formData.append("startDate", values.startDate || "");
      formData.append("endDate", values.endDate || "");
      formData.append("studentName", values.studentName || "");
      formData.append("registerNo", values.registerNumber || "");
      formData.append("courseTitle", values.courseTitle || "");
      formData.append(
        "noOfStudentsEnrolled",
        values.NumberOfStudentsEnrl || ""
      );
      formData.append(
        "noOfStudentsCompleted",
        values.NumberOfStudentsCompleted || ""
      );
      formData.append("resourcePerson", values.resourcePerson || "");
      formData.append("organization", values.hostingInstOrg || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("otherDepartment", values.otherDepartment || "");
      // formData.append("excel", values.file as File); // Append the file
      formData.append("valueAddedCourseId", editId || ""); // Append the edit ID if in edit mode

      if (isEditMode && typeof values.file === "string") {
        formData.append(
          "excel",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.file === null) {
        formData.append(
          "excel",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.file) {
        formData.append("excel", values.file);
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/valueAddedCourse/updateValueAddedCourse`,
            formData
          );
          toast.success(
            response.message || "Value Added Program updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create("/valueAddedCourse/save", formData);
          toast.success(
            response.message || "Value Added Program added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = ""; // Clear the file input
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the BOS List
        handleListVAPClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Value Added Program. Please try again.");
        console.error("Error creating BOS:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Value Added Program"
            breadcrumbItem="Value Added Program"
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
                      <Label>Stream </Label>
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
                      <Label>Student name</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.studentName &&
                          validation.errors.studentName
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.studentName}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "studentName",
                            e.target.value
                          )
                        }
                        placeholder="Enter Student name"
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
                      <Label>Register number </Label>
                      <Input
                        type="number"
                        className={`form-control ${
                          validation.touched.registerNumber &&
                          validation.errors.registerNumber
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.registerNumber}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "registerNumber",
                            e.target.value
                          )
                        }
                        placeholder="Enter Register number"
                      />
                      {validation.touched.registerNumber &&
                        validation.errors.registerNumber && (
                          <div className="text-danger">
                            {validation.errors.registerNumber}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Course title </Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.courseTitle &&
                          validation.errors.courseTitle
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.courseTitle}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "courseTitle",
                            e.target.value
                          )
                        }
                        placeholder="Enter Course title"
                      />
                      {validation.touched.courseTitle &&
                        validation.errors.courseTitle && (
                          <div className="text-danger">
                            {validation.errors.courseTitle}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>No of students enrolled</Label>
                      <Input
                        type="number"
                        className={`form-control ${
                          validation.touched.NumberOfStudentsEnrl &&
                          validation.errors.NumberOfStudentsEnrl
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.NumberOfStudentsEnrl}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "NumberOfStudentsEnrl",
                            e.target.value
                          )
                        }
                        placeholder="Enter students enrolled"
                      />
                      {validation.touched.NumberOfStudentsEnrl &&
                        validation.errors.NumberOfStudentsEnrl && (
                          <div className="text-danger">
                            {validation.errors.NumberOfStudentsEnrl}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>No of students completed</Label>
                      <Input
                        type="number"
                        className={`form-control ${
                          validation.touched.NumberOfStudentsCompleted &&
                          validation.errors.NumberOfStudentsCompleted
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.NumberOfStudentsCompleted}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "NumberOfStudentsCompleted",
                            e.target.value
                          )
                        }
                        placeholder="Enter students completed"
                      />
                      {validation.touched.NumberOfStudentsCompleted &&
                        validation.errors.NumberOfStudentsCompleted && (
                          <div className="text-danger">
                            {validation.errors.NumberOfStudentsCompleted}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Start date </Label>
                      <Input
                        type="date"
                        className={`form-control ${
                          validation.touched.startDate &&
                          validation.errors.startDate
                            ? "is-invalid"
                            : ""
                        }`}
                        value={
                          validation.values.startDate
                            ? moment(
                                validation.values.startDate,
                                "DD/MM/YYYY"
                              ).format("YYYY-MM-DD")
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY");
                          validation.setFieldValue("startDate", formattedDate);
                        }}
                        placeholder="dd/mm/yyyy"
                      />
                      {validation.touched.startDate &&
                        validation.errors.startDate && (
                          <div className="text-danger">
                            {validation.errors.startDate}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>End date </Label>
                      <Input
                        type="date"
                        className={`form-control ${
                          validation.touched.endDate &&
                          validation.errors.endDate
                            ? "is-invalid"
                            : ""
                        }`}
                        value={
                          validation.values.endDate
                            ? moment(
                                validation.values.endDate,
                                "DD/MM/YYYY"
                              ).format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
                          validation.setFieldValue("endDate", formattedDate);
                        }}
                        placeholder="dd/mm/yyyy"
                      />
                      {validation.touched.endDate &&
                        validation.errors.endDate && (
                          <div className="text-danger">
                            {validation.errors.endDate}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Resource person </Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.resourcePerson &&
                          validation.errors.resourcePerson
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.resourcePerson}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "resourcePerson",
                            e.target.value
                          )
                        }
                        placeholder="Enter Resource Person"
                      />
                      {validation.touched.resourcePerson &&
                        validation.errors.resourcePerson && (
                          <div className="text-danger">
                            {validation.errors.resourcePerson}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Hosting institution/ organization</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.hostingInstOrg &&
                          validation.errors.hostingInstOrg
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.hostingInstOrg}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "hostingInstOrg",
                            e.target.value
                          )
                        }
                        placeholder="Enter Course title"
                      />
                      {validation.touched.hostingInstOrg &&
                        validation.errors.hostingInstOrg && (
                          <div className="text-danger">
                            {validation.errors.hostingInstOrg}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>No of credits</Label>
                      <Input
                        type="number"
                        className={`form-control ${
                          validation.touched.noOfCredits &&
                          validation.errors.noOfCredits
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.noOfCredits}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "noOfCredits",
                            e.target.value
                          )
                        }
                        placeholder="Enter Revision Percentage"
                      />
                      {validation.touched.noOfCredits &&
                        validation.errors.noOfCredits && (
                          <div className="text-danger">
                            {validation.errors.noOfCredits}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload ValueAddedCourse
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.file && validation.errors.file
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        innerRef={fileRef}
                        accept=".xls, .xlsx"
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
                        className="btn btn-secondary"
                        type="button"
                        onClick={handleListVAPClick}
                      >
                        List of Value Added Program
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
          <ModalHeader toggle={toggleModal}>List</ModalHeader>
          <ModalBody>
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
                    Department Name
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.stream}
                      onChange={(e) => handleFilterChange(e, "semesterType")}
                    />
                  </th>
                  <th>
                    Student Name
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.studentName}
                      onChange={(e) => handleFilterChange(e, "semesterNo")}
                    />
                  </th>
                  <th>
                    Register Name
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.registerNumber}
                      onChange={(e) => handleFilterChange(e, "semesterNo")}
                    />
                  </th>
                  <th>
                    Course Title
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.courseTitle}
                      onChange={(e) => handleFilterChange(e, "semesterNo")}
                    />
                  </th>
                  <th>
                    No of students enrolled
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.NumberOfStudentsEnrl}
                      onChange={(e) => handleFilterChange(e, "semesterNo")}
                    />
                  </th>
                  <th>
                    No of students completed
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.NumberOfStudentsCompleted}
                      onChange={(e) => handleFilterChange(e, "semesterNo")}
                    />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((vap, index) => (
                    <tr key={vap.id}>
                      <td>{index + 1}</td>
                      <td>{vap.academicYear}</td>
                      <td>{vap.departmentName}</td>
                      <td>{vap.studentName}</td>
                      <td>{vap.registerNo}</td>
                      <td>{vap.courseTitle}</td>
                      <td>{vap.noOfStudentsEnrolled}</td>
                      <td>{vap.noOfStudentsCompleted}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(vap.valueAddedCourseId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(vap.valueAddedCourseId)}
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

export default Value_Added_Program;
