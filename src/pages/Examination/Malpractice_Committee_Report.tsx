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
} from "reactstrap";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SEMESTER_NO_OPTIONS } from "../../Components/constants/layout";
import axios from "axios";
import moment from "moment";
import Select from "react-select";
import GetAllSubjectDropdown from "Components/DropDowns/GetAllSubjectDropdown";
import GetAllClasses from "Components/DropDowns/GetAllClasses";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import { s } from "@fullcalendar/core/internal-common";

const api = new APIClient();

const Malpractice_committee_Report: React.FC = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variable for managing file upload status
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [isFile2UploadDisabled, setIsFile2UploadDisabled] = useState(false);
  // State variable for managing the modal for listing Malpractice Committee report
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State variable for managing the list of Malpractice Committee report data
  const [mcrData, setMCRData] = useState<any[]>([]);
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
    semesterType: "",
    semesterNo: "",
    stream: "",
    department: "",
    programType: "",
    program: "",
    yearOfIntroduction: "",
    percentage: "",
    candidateName: "",
    registerNumber: "",
  });
  const [filteredData, setFilteredData] = useState(mcrData);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const fileActRef = useRef<HTMLInputElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = mcrData.filter((row) =>
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

  // Toggle the modal for listing Malpractice Committee report
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Malpractice Committee report data from the backend
  const fetchMCRData = async () => {
    try {
      const response = await api.get(
        "/malpracticeCommitteeReport/getAllMalpracticeCommitteeReport",
        ""
      );
      setMCRData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Malpractice Committee report data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListMCRClick = () => {
    toggleModal();
    fetchMCRData();
  };

  const malPractOpt = [
    { value: "Chit", label: "Chit" },
    { value: "Mobile", label: "Mobile" },
    { value: "Calculator", label: "Calculator" },
    { value: "Any other", label: "Any other" },
  ];

  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
  };

  useEffect(() => {
    if (!selectedDegree || !selectedDegree.value) {
      setOptions([]);
      return;
    }

    const fetchPrograms = async () => {
      setLoading(true);
      try {
        // ✅ Use the `value` from the selectedDegree object
        const response = await api.get(
          `getCourseByProgramId?programId=${selectedDegree.value}`,
          ""
        );
        const programsList = response.map((program: any) => ({
          value: program.id,
          label: program.courseName,
        }));
        setOptions(programsList);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch programs");
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [selectedDegree]);

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
  // Fetch the data for the selected Malpractice Committee report ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/malpracticeCommitteeReport?malpracticeCommitteeReportId=${id}`,
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

      // Map the response to Formik fields
      const mappedValues = {
        academicYear: response.academicYear
          ? {
              value: String(response.academicYear),
              label:
                academicYearList.find(
                  (opt: any) =>
                    String(opt.value) === String(response.academicYear)
                )?.label || String(response.academicYear),
            }
          : null,
        stream: response.streamId
          ? {
              value: String(response.streamId),
              label: response.streamName,
            }
          : null,
        department: response.departmentId
          ? {
              value: String(response.departmentId),
              label: response.departmentName,
            }
          : null,
        otherDepartment: "",
        subject: response.subjectId
          ? {
              value: String(response.subjectId),
              label: response.subjectName,
            }
          : null,
        class: response.classId
          ? {
              value: String(response.classId),
              label: response.className,
            }
          : null,
        file: response.file?.Invigilator || null,
        actionTaken: response.file?.ActionTaken || null,
        programType: response.programTypeId
          ? {
              value: String(response.programTypeId),
              label: response.programTypeName,
            }
          : null,
        degree: response.programId
          ? {
              value: String(response.programId),
              label: response.programName,
            }
          : null,
        program: response.courseId
          ? {
              value: String(response.courseId),
              label: response.courseName,
            }
          : null,
        revisionPercentage: "", // Assuming not in API
        conductedDate: "", // Assuming not in API
        candidateName: response.nameOfTheCandidate || "",
        nameOfTheExam: response.nameOfTheExam || "",
        registerNumber: response.registerNumber || "",
        dateOfExam: response.dateOfExam || "",
        malpracticeType: response.typeOfMalpractise
          ? {
              value: String(response.typeOfMalpractise),
              label: String(response.typeOfMalpractise),
            }
          : null,
      };
      const streamOption = mapValueToLabel(response.streamId, []); // Replace [] with stream options array if available
      const departmentOption = mapValueToLabel(response.departmentId, []); // Replace [] with department options array if available
      const programTypeOption = mapValueToLabel(response.programTypeId, []); // Replace [] with program type options array if available
      const degreeOption = mapValueToLabel(response.programId, []);
      // Set Formik values
      validation.setValues(mappedValues);
      setSelectedStream(streamOption);
      setSelectedDepartment(departmentOption);
      setSelectedProgramType(programTypeOption);
      setSelectedDegree(degreeOption);
      setIsFileUploadDisabled(!!mappedValues.file); // Disable file upload if a file exists
      setIsFile2UploadDisabled(!!mappedValues.actionTaken); // Disable file upload if a file exists
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error(
        "Error fetching Malpractice Committee report data by ID:",
        error
      );
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the Malpractice Committee report data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/malpracticeCommitteeReport/deleteMalpracticeCommitteeReport?malpracticeCommitteeReportId=${id}`,
          ""
        );
        setIsModalOpen(false);

        toast.success(
          response.message ||
            "Malpractice Committee report removed successfully!"
        );

        fetchMCRData();
      } catch (error) {
        toast.error(
          "Failed to remove Malpractice Committee report. Please try again."
        );
        console.error("Error deleting Malpractice Committee report:", error);
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
          `/malpracticeCommitteeReport/download/${fileName}`,
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
        `/malpracticeCommitteeReport/deleteMalpracticeCommitteeReportDocument?fileName=${fileName}`,
        ""
      );
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      // Remove the file from the form
      if (docType === "file") {
        validation.setFieldValue("file", null);
        setIsFileUploadDisabled(false); // Enable the file upload button
      }
      if (docType === "actionTaken") {
        validation.setFieldValue("actionTaken", null);
        setIsFile2UploadDisabled(false); // Enable the file upload button
      }
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
      subject: null as { value: string; label: string } | null,
      class: null as { value: string; label: string } | null,
      file: null as File | string | null,
      actionTaken: null as File | string | null,
      programType: null as { value: string; label: string } | null,
      degree: null as { value: string; label: string } | null,
      program: null as { value: string; label: string } | null,
      revisionPercentage: "",
      conductedDate: "",
      candidateName: "",
      nameOfTheExam: "",
      registerNumber: "",
      dateOfExam: "",
      malpracticeType: null as { value: string; label: string } | null,
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
          // Check file size (2MB limit)
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
      actionTaken: Yup.mixed().test(
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
      program: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select programs"),
      candidateName: Yup.string().required("Please enter candidate name"),
      registerNumber: Yup.string().required("Please enter register number"),
      dateOfExam: Yup.string().required("Please select date of exam"),
      malpracticeType: Yup.object()
        .nullable()
        .required("Please select type of malpractice"),
      nameOfTheExam: Yup.string().required("Please enter name of the exam"),
      degree: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select degree"),
      class: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select class"),
      subject: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select subject"),
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("programTypeId", values.programType?.value || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append("classeId", values.class?.value || "");
      formData.append("subjectId", values.subject?.value || "");
      formData.append("courseId", values.program?.value || "");
      formData.append("programId", values.degree?.value || "");
      formData.append("id", editId || "");
      formData.append("otherDepartment", values.otherDepartment || "");
      formData.append("nameOfTheCandidate", values.candidateName || "");
      formData.append("registerNumber", values.registerNumber || "");
      formData.append("nameOfTheExam", values.nameOfTheExam || "");
      formData.append("dateOfExam", values.dateOfExam || "");
      formData.append("typeOfMalpractise", values.malpracticeType?.value || "");

      if (isEditMode && typeof values.file === "string") {
        formData.append(
          "invigilator",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.file === null) {
        formData.append(
          "invigilator",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.file) {
        formData.append("invigilator", values.file);
      }

      if (isEditMode && typeof values.actionTaken === "string") {
        formData.append(
          "actionTaken",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.actionTaken === null) {
        formData.append(
          "actionTaken",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.actionTaken) {
        formData.append("actionTaken", values.actionTaken);
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/malpracticeCommitteeReport`,
            formData
          );
          toast.success(
            response.message ||
              "Malpractice Committee report updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/malpracticeCommitteeReport",
            formData
          );
          toast.success(
            response.message ||
              "Malpractice Committee report added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        if (fileActRef.current) {
          fileActRef.current.value = "";
        }
        setIsFileUploadDisabled(false); // Enable file upload for new entries
        setIsFile2UploadDisabled(false); // Enable file upload for new entries
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the Malpractice Committee report List
        handleListMCRClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Malpractice Committee report. Please try again."
        );
        console.error("Error creating Malpractice Committee report:", error);
      }
    },
  });

  useEffect(() => {
    if (mcrData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
      destroy: true,
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Malpractice_Committee_Report_Data",
          title: "Malpractice Committee Report Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Malpractice_Committee_Report_Data",
          title: "Malpractice Committee Report Data Export",
          exportOptions: {
            columns: ":not(:last-child)",
          },
        },
      ],
    });
    $(".dt-buttons").addClass("mb-3 gap-2");
    $(".buttons-copy").addClass("btn btn-success");
    $(".buttons-csv").addClass("btn btn-info");

    $("#id").on(
      "buttons-action.dt",
      function (e, buttonApi, dataTable, node, config) {
        if (buttonApi.text() === "Copy") {
          toast.success("Copied to clipboard!");
        }
      }
    );

    return () => {
      table.destroy(); // clean up
    };
  }, [mcrData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="EXAMINATION"
            breadcrumbItem=" Malpractice Committee report"
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
                          validation.setFieldValue("program", null);
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
                        deptId={selectedDepartment?.value}
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
                        value={validation.values.program ? [validation.values.program] : []}
                        onChange={(selectedOptions: any) => {
                          // ProgramDropdown expects/returns an array, but the form stores a single object or null.
                          const valueToSet = Array.isArray(selectedOptions)
                            ? selectedOptions.length > 0
                              ? selectedOptions[0]
                              : null
                            : selectedOptions;
                          validation.setFieldValue("program", valueToSet);
                        }}
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Class</Label>
                      <GetAllClasses
                        value={validation.values.class}
                        onChange={(selectedOption) => {
                          validation.setFieldValue("class", selectedOption);
                        }}
                        isInvalid={
                          validation.touched.class && !!validation.errors.class
                        }
                      />
                      {validation.touched.class && validation.errors.class && (
                        <div className="text-danger">
                          {validation.errors.class}
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Name of the Candidate</Label>
                      <Input
                        type="text"
                        name="candidateName"
                        value={validation.values.candidateName}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "candidateName",
                            e.target.value
                          )
                        }
                        placeholder="Enter Name of the Candidate"
                        className={
                          validation.touched.candidateName &&
                          validation.errors.candidateName
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.candidateName &&
                        validation.errors.candidateName && (
                          <div className="text-danger">
                            {validation.errors.candidateName}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Register Number</Label>
                      <Input
                        type="text"
                        name="registerNumber"
                        value={validation.values.registerNumber}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "registerNumber",
                            e.target.value
                          )
                        }
                        placeholder="Enter Register Number"
                        className={
                          validation.touched.registerNumber &&
                          validation.errors.registerNumber
                            ? "is-invalid"
                            : ""
                        }
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
                      <Label>Name of the Exam</Label>
                      <Input
                        type="text"
                        name="nameOfTheExam"
                        value={validation.values.nameOfTheExam}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "nameOfTheExam",
                            e.target.value
                          )
                        }
                        placeholder="Enter Name of the Exam"
                        className={
                          validation.touched.nameOfTheExam &&
                          validation.errors.nameOfTheExam
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.nameOfTheExam &&
                        validation.errors.nameOfTheExam && (
                          <div className="text-danger">
                            {validation.errors.nameOfTheExam}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Subject</Label>
                      <GetAllSubjectDropdown
                        streamId={selectedStream?.value}
                        depId={selectedDepartment?.value}
                        value={validation.values.subject}
                        onChange={(selectedOptions) =>
                          validation.setFieldValue("subject", selectedOptions)
                        }
                        isInvalid={
                          validation.touched.subject &&
                          !!validation.errors.subject
                        }
                      />
                      {validation.touched.subject &&
                        validation.errors.subject && (
                          <div className="text-danger">
                            {Array.isArray(validation.errors.subject)
                              ? validation.errors.subject.join(", ")
                              : validation.errors.subject}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Date of Exam</Label>
                      <Input
                        type="date"
                        name="dateOfExam"
                        value={validation.values.dateOfExam}
                        onChange={(e) =>
                          validation.setFieldValue("dateOfExam", e.target.value)
                        }
                        className={
                          validation.touched.dateOfExam &&
                          validation.errors.dateOfExam
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.dateOfExam &&
                        validation.errors.dateOfExam && (
                          <div className="text-danger">
                            {validation.errors.dateOfExam}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Type of Malpractice</Label>
                      <Select
                        options={malPractOpt}
                        value={validation.values.malpracticeType}
                        onChange={(selectedOption) =>
                          validation.setFieldValue(
                            "malpracticeType",
                            selectedOption
                          )
                        }
                        placeholder="Select Type of Malpractice"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.malpracticeType &&
                          validation.errors.malpracticeType
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.malpracticeType &&
                        validation.errors.malpracticeType && (
                          <div className="text-danger">
                            {typeof validation.errors.malpracticeType ===
                            "string"
                              ? validation.errors.malpracticeType
                              : ""}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Report of Invigilator
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
                                "file"
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
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Action Taken File
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.actionTaken &&
                          validation.errors.actionTaken
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        innerRef={fileActRef}
                        onChange={(event) => {
                          validation.setFieldValue(
                            "actionTaken",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFile2UploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.actionTaken &&
                        validation.errors.actionTaken && (
                          <div className="text-danger">
                            {validation.errors.actionTaken}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFile2UploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.actionTaken === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {typeof validation.values.actionTaken === "string"
                              ? validation.values.actionTaken
                              : ""}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.actionTaken as string
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
                                validation.values.actionTaken as string,
                                "actionTaken"
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
                        onClick={handleListMCRClick}
                      >
                        List Report
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Malpractice Committee report */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>List Report</ModalHeader>
          <ModalBody>
            <Table striped bordered hover id="id" innerRef={tableRef}>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>School</th>
                  <th>Department</th>
                  <th>Program Type</th>
                  <th>Degree</th>
                  <th>Program</th>
                  <th>Candidate Name</th>
                  <th>Register Number</th>
                  <th>Class</th>
                  <th>Exam Name</th>
                  <th>Subject</th>
                  <th>Date of Exam</th>
                  <th>Type of Malpractice</th>
                  {/* Hidden columns */}
                  <th className="d-none">Invigilator Report</th>
                  <th className="d-none">Action Taken Report</th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {mcrData.length > 0 ? (
                  mcrData.map((mcr, index) => (
                    <tr key={mcr.id}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{mcr.academicYear}</td>
                      <td>{mcr.streamName}</td>
                      <td>{mcr.departmentName}</td>
                      <td>{mcr.programTypeName}</td>
                      <td>{mcr.programName}</td>
                      <td>{mcr.courseName}</td>
                      <td>{mcr.nameOfTheCandidate}</td>
                      <td>{mcr.registerNumber}</td>
                      <td>{mcr.className || "N/A"}</td>
                      <td>{mcr.nameOfTheExam || "N/A"}</td>
                      <td>{mcr.subjectName || "N/A"}</td>
                      <td>{mcr.dateOfExam || "N/A"}</td>
                      <td>{mcr.typeOfMalpractise || "N/A"}</td>
                      <td className="d-none">
                        {mcr.filePath?.Invigilator || "N/A"}
                      </td>
                      <td className="d-none">
                        {mcr.filePath?.ActionTaken || "N/A"}
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(mcr.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(mcr.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={17} className="text-center">
                      No Malpractice Committee report data available.
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

export default Malpractice_committee_Report;
