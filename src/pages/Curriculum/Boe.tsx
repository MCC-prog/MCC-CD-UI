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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React, { useEffect, useRef, useState } from "react";
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
import { SEMESTER_NO_OPTIONS } from "../../Components/constants/layout";
import axios from "axios";
import moment from "moment";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "datatables.net-buttons/js/buttons.print.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import Select from "react-select";

const api = new APIClient();

const Boe: React.FC = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variable for managing file upload status
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  // State variable for managing the modal for listing BOS
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State variable for managing the list of BOS data
  const [boeData, setBoeData] = useState<any[]>([]);
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  // State variable for managing search term and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(boeData);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const tableRef = useRef<HTMLTableElement>(null);

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = boeData.filter((row) =>
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
  const fetchBoeData = async () => {
    try {
      const response = await api.get("/boe/getAllBoe", "");
      setBoeData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching BOE data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListBoeClick = () => {
    toggleModal();
    fetchBoeData();
  };

  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
  };

  const SemesterType = [
    { value: "EVEN", label: "EVEN" },
    { value: "ODD", label: "ODD" },
  ];

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
      const response = await api.get(`/boe/edit?boeId=${id}`, "");
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
        // semesterType: response.semType
        //   ? { value: response.semType, label: response.semType.toUpperCase() }
        //   : null,
        // semesterNo: mapValueToLabel(
        //   String(response.semesterNo),
        //   semesterNoOptions
        // ) as { value: string; label: string } | null,

        semesterType: response.semType
          ? {
              value: String(response.semType),
              label: String(response.semType).toUpperCase(),
            }
          : null,
        stream: response.streamId
          ? { value: response.streamId.toString(), label: response.streamName }
          : null,
        department: response.departmentId
          ? {
              value: response.departmentId.toString(),
              label: response.departmentName,
            }
          : null,
        programType: response.programTypeId
          ? {
              value: response.programTypeId.toString(),
              label: response.programTypeName,
            }
          : null,
        degree: response.programId
          ? {
              value: response.programId.toString(),
              label: response.programName,
            }
          : null,
        program: response.courses
          ? Object.entries(response.courses).map(([key, value]) => ({
              value: key,
              label: String(value),
            }))
          : [],
        revisionPercentage: response.percentage || "",
        conductedDate: response.yearOfIntroduction
          ? moment(response.yearOfIntroduction, "DD/MM/YYYY").format(
              "DD/MM/YYYY"
            )
          : "",
        otherDepartment: "", // Add default value for otherDepartment
        file: response.documents?.mom || null,
      };

      // Update Formik values
      validation.setValues({
        ...mappedValues,
        file: response.documents?.mom || null,
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
        // semesterNo: mappedValues.semesterNo
        //   ? {
        //       ...mappedValues.semesterNo,
        //       value: String(mappedValues.semesterNo.value),
        //     }
        //   : null,
      });
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
      // If a file exists, disable the file upload button
      if (response.documents?.mom) {
        setIsFileUploadDisabled(true);
      }
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
        const response = await api.delete(`/boe/deleteBoe?boeId=${id}`, "");
        setIsModalOpen(false);
        toast.success(
          response.message || "Curriculum BOE removed successfully!"
        );
        fetchBoeData();
      } catch (error) {
        toast.error("Failed to remove Curriculum BOE. Please try again.");
        console.error("Error deleting BOE:", error);
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
        const response = await axios.get(`/boe/download/${fileName}`, {
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
        `/boe/deleteBoeDocument?boeDocumentId=${editId}`,
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

  // Formik validation and submission
  // Initialize Formik with validation schema and initial values
  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      // semesterType: null as { value: string; label: string } | null,
      // semesterNo: null as { value: string; label: string } | null,
      semesterType: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      file: null as File | string | null,
      programType: null as { value: string; label: string } | null,
      degree: null as { value: string; label: string } | null,
      program: [] as { value: string; label: string }[],
    //   revisionPercentage: "",
      conductedDate: "",
    //   introYear: "", // Added introYear field
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select academic year"),
      // semesterType: Yup.object<{ value: string; label: string }>()
      //   .nullable()
      //   .required("Please select a semester type"), // Single object for single-select
      // semesterNo: Yup.object<{ value: string; label: string }>()
      //   .nullable()
      //   .required("Please select a semester number"),
      semesterType: Yup.object()
        .nullable()
        .required("Please select semester type"),
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
          // Check file size (10MB limit)
          if (value instanceof File && value.size > 10 * 1024 * 1024) {
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
      programType: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select program type"),
      degree: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select degree"),
      program: Yup.array()
        .min(1, "Please select at least one program")
        .required("Please select programs"),
    //   revisionPercentage: Yup.number()
    //     .typeError("Please enter a valid number")
    //     .min(0, "Percentage cannot be less than 0")
    //     .max(100, "Percentage cannot be more than 100"),
      conductedDate: Yup.string()
        .required("Please select conducted date")
        .matches(/^\d{2}\/\d{2}\/\d{4}$/, "Invalid date format (DD/MM/YYYY)"),

    //   introYear: Yup.string()
    //     .required("Please select year of introduction")
    //     .matches(/^\d{4}$/, "Invalid year"),
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("yearOfIntroduction", values.conductedDate || "");
    //   formData.append("introYear", values.introYear || "");
      // formData.append("semType", values.semesterType?.value || "");
      // formData.append("semesterNo", String(values.semesterNo?.value || ""));
      formData.append("semType", values.semesterType?.value || "");
      formData.append("programTypeId", values.programType?.value || "");
    //   formData.append("percentage", values.revisionPercentage || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append(
        "courseIds",
        values.program.map((option) => option.value).join(",") || ""
      );
      formData.append("programId", values.degree?.value || "");
      formData.append("boeId", editId || "");
      formData.append("otherDepartment", values.otherDepartment || "");

      if (isEditMode && typeof values.file === "string") {
        formData.append(
          "mom",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.file === null) {
        formData.append(
          "mom",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.file) {
        formData.append("mom", values.file);
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/boe/updateBoe`, formData);
          toast.success(
            response.message || "Curriculum BOE updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create("/boe/saveBoe", formData);
          toast.success(
            response.message || "Curriculum BOE added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        setIsFileUploadDisabled(false); // Enable file upload for new entries
        // display the BOS List
        handleListBoeClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Curriculum BOE. Please try again.");
        console.error("Error creating BOE:", error);
      }
    },
  });

  useEffect(() => {
    if (boeData.length === 0) return;

    const initializeDataTable = () => {
      const table = $("#boeDataId").DataTable({
        destroy: true,
        dom: "Bfrtip",

        paging: true,
        pageLength: 10,
        info: true,
        searching: false,

        // FilePath hidden in UI
        columnDefs: [
          { targets: 9, visible: false }, // FilePath
          { targets: 10, orderable: false, searchable: false }, // Actions
        ],

        buttons: [
          {
            extend: "copy",
            filename: "Boe_Data",
            title: "BOE Data Export",
            exportOptions: {
              modifier: { page: "all" },
              columns: function (idx) {
                return idx !== 10;
              },
            },
          },
          {
            extend: "csv",
            filename: "Boe_Data",
            title: "BOE Data Export",
            exportOptions: {
              modifier: { page: "all" },
              columns: function (idx) {
                return idx !== 10;
              },
            },
          },
        ],
      });
      $(".dt-buttons").addClass("mb-3 gap-2");
      $(".buttons-copy").addClass("btn btn-success");
      $(".buttons-csv").addClass("btn btn-info");

      // Prevent duplicate toast triggers
      $("#boeDataId")
        .off("buttons-action.dt")
        .on("buttons-action.dt", function (e, buttonApi) {
          if (buttonApi.text() === "Copy") {
            toast.success("Copied to clipboard!");
          }
        });

      return table;
    };

    // Delay DataTable init slightly to allow DOM updates
    const timeout = setTimeout(() => {
      const table = initializeDataTable();
    }, 0);

    return () => {
      clearTimeout(timeout);
      const existingTable = $.fn.DataTable.isDataTable("#boeDataId");
      if (existingTable) {
        $("#boeDataId").DataTable().destroy();
      }
      $("#boeDataId").off("buttons-action.dt");
    };
  }, [boeData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Curricuum" breadcrumbItem="BOE" />
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
                  {/* <Col lg={8}>
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
                  </Col> */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Semester Type</Label>
                      <Select
                        options={SemesterType}
                        value={validation.values.semesterType}
                        onChange={(selectedOption) =>
                          validation.setFieldValue(
                            "semesterType",
                            selectedOption
                          )
                        }
                        placeholder="Select Semester Type"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.semesterType &&
                          validation.errors.semesterType
                            ? "select-error"
                            : ""
                        }
                        isClearable
                      />
                      {validation.touched.semesterType &&
                        validation.errors.semesterType && (
                          <div className="text-danger">
                            {typeof validation.errors.semesterType === "string"
                              ? validation.errors.semesterType
                              : ""}
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
                  {/* Program Type Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Program Type</Label>
                      <ProgramTypeDropdown
                        deptId={selectedDepartment?.value}
                        value={validation.values.programType}
                        onChange={(selectedOption) => {
                          validation.setFieldValue(
                            "programType",
                            selectedOption
                          );
                          setSelectedProgramType(selectedOption);
                          validation.setFieldValue("degree", null);
                        }}
                        isInvalid={
                          validation.touched.programType &&
                          !!validation.errors.programType
                        }
                      />
                      {validation.touched.programType &&
                        validation.errors.programType && (
                          <div className="text-danger">
                            {validation.errors.programType}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Degree</Label>
                      <DegreeDropdown
                        programTypeId={selectedProgramType?.value}
                        deptId={selectedDepartment?.value || null}
                        value={validation.values.degree}
                        onChange={(selectedOption) => {
                          validation.setFieldValue("degree", selectedOption);
                          setSelectedDegree(selectedOption);
                          validation.setFieldValue("program", null);
                        }}
                        isInvalid={
                          validation.touched.degree &&
                          !!validation.errors.degree
                        }
                      />
                      {validation.touched.degree &&
                        validation.errors.degree && (
                          <div className="text-danger">
                            {validation.errors.degree}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Program</Label>
                      <ProgramDropdown
                      programTypeId={selectedProgramType?.value}
                        deptId={selectedDepartment?.value || null}
                        degreeId={selectedDegree?.value}
                        value={validation.values.program}
                        onChange={(selectedOptions) =>
                          validation.setFieldValue("program", selectedOptions)
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
                  {/* <Col lg={4}>
                    <div className="mb-3">
                      <Label>Bos Conducted Date</Label>
                      <Input
                        type="date" // Use native date input
                        className={`form-control ${
                          validation.touched.conductedDate &&
                          validation.errors.conductedDate
                            ? "is-invalid"
                            : ""
                        }`}
                        value={
                          validation.values.conductedDate
                            ? moment(
                                validation.values.conductedDate,
                                "DD/MM/YYYY"
                              ).format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
                          validation.setFieldValue(
                            "conductedDate",
                            formattedDate
                          );
                        }}
                        placeholder="dd/mm/yyyy"
                      />
                      {validation.touched.conductedDate &&
                        validation.errors.conductedDate && (
                          <div className="text-danger">
                            {validation.errors.conductedDate}
                          </div>
                        )}
                    </div>
                  </Col> */}

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>BOE Conducted Date</Label>
                      <Input
                        type="date"
                        className={`form-control ${
                          validation.touched.conductedDate &&
                          validation.errors.conductedDate
                            ? "is-invalid"
                            : ""
                        }`}
                        value={
                          validation.values.conductedDate
                            ? moment(
                                validation.values.conductedDate,
                                "DD/MM/YYYY"
                              ).format("YYYY-MM-DD")
                            : ""
                        }
                        onChange={(e) => {
                          // Convert to DD/MM/YYYY for backend
                          const formatted = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY");
                          validation.setFieldValue("conductedDate", formatted);
                        }}
                      />
                      {validation.touched.conductedDate &&
                        validation.errors.conductedDate && (
                          <div className="text-danger">
                            {validation.errors.conductedDate}
                          </div>
                        )}
                    </div>
                  </Col>

                  {/* <Col lg={4}>
                    <div className="mb-3">
                      <Label>Year of Introduction</Label>
                      <DatePicker
                        selected={
                          validation.values.introYear
                            ? new Date(
                                Number(validation.values.introYear),
                                0,
                                1
                              )
                            : null
                        }
                        onChange={(date) => {
                          const formattedYear = date
                            ? moment(date).format("YYYY")
                            : "";
                          validation.setFieldValue("introYear", formattedYear);
                        }}
                        showYearPicker
                        dateFormat="yyyy"
                        className={`form-control ${
                          validation.touched.introYear &&
                          validation.errors.introYear
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholderText="Select Year"
                      />
                      {validation.touched.introYear &&
                        validation.errors.introYear && (
                          <div className="text-danger">
                            {validation.errors.introYear}
                          </div>
                        )}
                    </div>
                  </Col> */}
                  {/* <Col lg={4}>
                    <div className="mb-3">
                      <Label>Year of Introduction</Label>
                      <DatePicker
                        selected={
                          validation.values.introYear
                            ? moment(
                                validation.values.introYear,
                                "YYYY"
                              ).toDate()
                            : null
                        }
                        onChange={(date) => {
                          const formattedYear = date
                            ? moment(date).format("YYYY")
                            : "";
                          validation.setFieldValue("introYear", formattedYear);
                        }}
                        showYearPicker
                        dateFormat="yyyy"
                        className={`form-control ${
                          validation.touched.introYear &&
                          validation.errors.introYear
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholderText="Select Year"
                      />
                      {validation.touched.introYear &&
                        validation.errors.introYear && (
                          <div className="text-danger">
                            {validation.errors.introYear}
                          </div>
                        )}
                    </div>
                  </Col> */}

                  {/* <Col lg={4}>
                    <div className="mb-3">
                      <Label>Revision Percentage</Label>
                      <Input
                        type="number"
                        className={`form-control ${
                          validation.touched.revisionPercentage &&
                          validation.errors.revisionPercentage
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.revisionPercentage}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "revisionPercentage",
                            e.target.value
                          )
                        }
                        placeholder="Enter Revision Percentage"
                      />
                      {validation.touched.revisionPercentage &&
                        validation.errors.revisionPercentage && (
                          <div className="text-danger">
                            {validation.errors.revisionPercentage}
                          </div>
                        )}
                    </div>
                  </Col> */}
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload MOM
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
                          href={`${process.env.PUBLIC_URL}/templateFiles/BOE_Template.docx`}
                          download
                          className="btn btn-primary btn-sm"
                        >
                          BOE Template
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
                        onClick={handleListBoeClick}
                      >
                        List BOE
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
          <ModalHeader toggle={toggleModal}>List BOE</ModalHeader>
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
              id="boeDataId"
            >
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>Semester Type</th>
                  {/* <th>Semester No</th> */}
                  <th>School</th>
                  <th>Department</th>
                  <th>Program Type</th>
                  <th>Degree</th>
                  <th>Program</th>
                  <th>BOE Conducted Date</th>
                  {/* <th>Year of Introduction</th>
                  <th>Percentage</th> */}

                  {/* HIDDEN IN UI – SHOWN IN CSV */}
                  <th className="export-hidden">File Path</th>

                  {/* ACTIONS – UI only, not exported */}
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {boeData.map((boe, index) => (
                  <tr key={boe.boeDataId}>
                    <td>{index + 1}</td>
                    <td>{boe.academicYear}</td>
                    <td>{boe.semType}</td>
                    {/* <td>{boe.semesterNo}</td> */}
                    <td>{boe.streamName}</td>
                    <td>{boe.departmentName}</td>
                    <td>{boe.programTypeName}</td>
                    <td>{boe.programName}</td>
                    <td>{Object.values(boe.courses).join(", ")}</td>
                    <td>{boe.yearOfIntroduction}</td>
                    {/* <td>{boe.introYear}</td> */}
                    {/* <td>{boe.percentage}</td> */}

                    {/* HIDDEN IN UI */}
                    <td className="export-hidden">
                      {boe.filePath?.mom || "N/A"}
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-center gap-3">
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleEdit(boe.boeDataId)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(boe.boeDataId)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ModalBody>
        </Modal>
        {/* Confirmation Modal */}
        <Modal
        className="delete-popup"
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

export default Boe;
