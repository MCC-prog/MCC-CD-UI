import Breadcrumb from "Components/Common/Breadcrumb";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import * as Yup from "yup";
import { Card, CardBody, Col, Container, Input, Label, Row } from "reactstrap";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import SemesterDropdowns from "Components/DropDowns/SemesterDropdowns";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
import { APIClient } from "../../helpers/api_helper";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
} from "reactstrap";
import { SEMESTER_NO_OPTIONS } from "Components/constants/layout";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
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
import { Tooltip } from "reactstrap";

const api = new APIClient();

const New_Programs_Introduced: React.FC = () => {
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variable for managing the list of New Program Introduced data
  const [bosData, setBosData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState(bosData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMomUploadDisabled, setIsMomUploadDisabled] = useState(false);
  const [isSyllabusUploadDisabled, setIsSyllabusUploadDisabled] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const sylRef = useRef<HTMLInputElement | null>(null);

  const tableRef = useRef<HTMLTableElement>(null);

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

  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Toggle the modal for listing New Program Introduced
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch New Program Introduced data from the backend
  const fetchBosData = async () => {
    try {
      const response = await api.get("/newProgram/getAllNewProgram", "");
      setBosData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching New Program Introduced data:", error);
    }
  };

  const handleListNPIClick = () => {
    toggleModal();
    fetchBosData();
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

  const formatDateForInput = (date: string): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format date from dd/mm/yyyy to dd-mm-yyyy
  // and handle invalid date formats
  const editFormatDate = (date: string): string => {
    if (!date) {
      console.error("Invalid date:", date);
      return ""; // Return an empty string for invalid dates
    }

    // Parse the date in dd/mm/yyyy format
    const [day, month, year] = date.split("/");
    if (!day || !month || !year) {
      console.error("Invalid date format:", date);
      return ""; // Return an empty string for invalid formats
    }

    // Create a new Date object
    const parsedDate = new Date(`${year}-${month}-${day}`);
    if (isNaN(parsedDate.getTime())) {
      console.error("Invalid parsed date:", date);
      return ""; // Return an empty string for invalid parsed dates
    }

    // Format the date as dd-mm-yyyy
    const formattedDay = String(parsedDate.getDate()).padStart(2, "0");
    const formattedMonth = String(parsedDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const formattedYear = parsedDate.getFullYear();
    return `${formattedDay}-${formattedMonth}-${formattedYear}`;
  };

  // Handle edit action
  // Fetch the data for the selected New Program Introduced ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(`/newProgram/edit?newProgramId=${id}`, "");
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
        semesterType: response.semType
          ? { value: response.semType, label: response.semType.toUpperCase() }
          : null,
        semesterNo: mapValueToLabel(
          String(response.semesterNo),
          semesterNoOptions
        ) as { value: string; label: string } | null,
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
        degree: response.degreeId
          ? {
              value: response.degreeId.toString(),
              label: response.degreeName,
            }
          : null,
        program: response.courses
          ? Object.entries(response.courses).map(([key, value]) => ({
              value: key,
              label: String(value),
            }))
          : [],
        otherDepartment: "", // Add default value for otherDepartment
        file: response.documents?.mom || null,
        syllabusFile: response.documents?.syllabus || null,
        YearofIntroduction: response.introductionYear
          ? response.introductionYear
          : "",
      };
      const streamOption = mapValueToLabel(response.streamId, []); // Replace [] with stream options array if available
      const departmentOption = mapValueToLabel(response.departmentId, []); // Replace [] with department options array if available
      const programTypeOption = mapValueToLabel(response.programTypeId, []); // Replace [] with program type options array if available
      const degreeOption = mapValueToLabel(response.programId, []);
      // Update Formik values
      validation.setValues({
        ...mappedValues,
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
        semesterNo: mappedValues.semesterNo
          ? {
              ...mappedValues.semesterNo,
              value: String(mappedValues.semesterNo.value),
            }
          : null,
        programName: response.programName || "",
      });
      setSelectedStream(streamOption);
      setSelectedDepartment(departmentOption);
      setSelectedProgramType(programTypeOption);
      setSelectedDegree(degreeOption);
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      setIsMomUploadDisabled(!!response.documents?.mom);
      setIsSyllabusUploadDisabled(!!response.documents?.syllabus);
      toggleModal();
    } catch (error) {
      console.error("Error fetching New Program Introduced data by ID:", error);
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the New Program Introduced data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/newProgram/deleteNewProgram?newProgramId=${id}`,
          ""
        );
        setIsModalOpen(false);

        toast.success(
          response.message || "New Program Introduced removed successfully!"
        );
        fetchBosData();
      } catch (error) {
        toast.error(
          "Failed to remove New Program Introduced. Please try again."
        );
        console.error("Error deleting New Program Introduced:", error);
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
        const response = await axios.get(`/newProgram/download/${fileName}`, {
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
  const handleDeleteFile = async (p0: string, docType: string) => {
    try {
      // Call the delete API
      const response = await api.delete(
        `/newProgram/deleteNewProgramDocument?newProgramId=${editId}&docType=${docType}`,
        ""
      );
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      if (docType === "mom") {
        validation.setFieldValue("file", null);
        setIsMomUploadDisabled(false); // Re-enable only MOM upload
        if (fileRef.current) fileRef.current.value = "";
      } else if (docType === "syllabus") {
        validation.setFieldValue("syllabusFile", null);
        setIsSyllabusUploadDisabled(false); // Re-enable only Syllabus upload
        if (sylRef.current) sylRef.current.value = "";
      }
    } catch (error) {
      // Show error message
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      semesterType: null as { value: string; label: string } | null,
      semesterNo: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      programType: null as { value: string; label: string } | null,
      degree: null as { value: string; label: string } | null,
      programName: "",
      YearofIntroduction: "",
      file: null as File | string | null,
      syllabusFile: null as File | string | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select academic year"),
      semesterType: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select a semester type"),
      semesterNo: Yup.object()
        .nullable()
        .required("Please select semester number"),
      stream: Yup.object().nullable().required("Please select stream"),
      department: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select department"),
      programName: Yup.string().required("Please select programName"),
      YearofIntroduction: Yup.string().required(
        "Please select Year of Introduction"
      ),
      programType: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select program type"),
      degree: Yup.object().nullable().required("Please select degree"),

      file: Yup.mixed().test(
        "fileValidation",
        "Please upload a valid file",
        function (value) {
          // Skip validation if the file upload is disabled (file exists)
          if (isMomUploadDisabled) {
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
      syllabusFile: Yup.mixed().test(
        "fileValidation",
        "Please upload a valid file",
        function (value) {
          // Skip validation if the file upload is disabled (file exists)
          if (isSyllabusUploadDisabled) {
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
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("academicYear", String(values.academicYear?.value || ""));
      formData.append("departmentId", String(values.department?.value || ""));
      formData.append("yearOfIntroduction", values.YearofIntroduction || "");
      formData.append("semType", values.semesterType?.value || "");
      formData.append("semesterNo", String(values.semesterNo?.value || ""));
      formData.append("programTypeId", String(values.programType?.value || ""));
      formData.append("streamId", String(values.stream?.value || ""));
      formData.append("programId", String(values.degree?.value || ""));
      formData.append("newProgramId", String(editId || ""));
      formData.append("otherDepartment", values.otherDepartment || "");
      formData.append("programName", values.programName || "");

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

      if (isEditMode && typeof values.syllabusFile === "string") {
        formData.append(
          "syllabus",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.syllabusFile === null) {
        formData.append(
          "syllabus",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.syllabusFile) {
        formData.append("syllabus", values.syllabusFile);
      }
      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/newProgram/updateProgram`, formData);
          toast.success(
            response.message || "New Program Introduced updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/newProgram/saveProgram",
            formData
          );
          toast.success(
            response.message || "New Program Introduced added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = ""; // Clear the file input
        }
        if (sylRef.current) {
          sylRef.current.value = ""; // Clear the syllabus file input
        }

        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        setIsMomUploadDisabled(false); // Enable file upload for new entries
        setIsSyllabusUploadDisabled(false); // Enable syllabus upload for new entries
        // display the BOS List
        handleListNPIClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save New Program Introduced. Please try again.");
        console.error("Error creating New Program Introduced:", error);
      }
    },
  });

  useEffect(() => {
    if (bosData.length === 0) return;

    const initializeDataTable = () => {
      const table = $("#bosDataId").DataTable({
        destroy: true,
        dom: "Bfrtip",

        paging: true,
        searching: false,
        pageLength: 10,
        info: true,

        columnDefs: [
          {
            targets: [10, 11], // hide MOM & Syllabus columns
            visible: false,
          },
          {
            targets: 12, // Actions column
            orderable: false,
            searchable: false,
            visible: true,
          },
        ],

        buttons: [
          { extend: "copy",
            filename: "New_Programs_Introduced_Data",
            title: "New Programs Introduced Data Export",
           },
          {
            extend: "csv",
            filename: "New_Programs_Introduced_Data",
            title: "New Programs Introduced Data Export",
            exportOptions: {
              modifier: { page: "all" },
              columns: function (idx) {
                return idx !== 12; // Exclude actions only
              },
            },
          },
        ],
      });

      $(".dt-buttons").addClass("mb-3 gap-2");
      $(".buttons-copy").addClass("btn btn-success");
      $(".buttons-csv").addClass("btn btn-info");

      // Prevent duplicate toast triggers
      $("#bosDataId")
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
      const existingTable = $.fn.DataTable.isDataTable("#bosDataId");
      if (existingTable) {
        $("#bosDataId").DataTable().destroy();
      }
      $("#bosDataId").off("buttons-action.dt");
    };
  }, [bosData]);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Curricuum"
            breadcrumbItem="New Program Introduced"
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
                  {/* Semester Dropdowns */}
                  <Col lg={8}>
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
                      <Label>Program Name</Label>
                      <Input
                        type="text"
                        name="programName"
                        value={validation.values.programName}
                        onChange={validation.handleChange}
                        placeholder="Enter Program Name"
                        className={
                          validation.touched.programName &&
                          validation.errors.programName
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.programName &&
                        validation.errors.programName && (
                          <div className="text-danger">
                            {validation.errors.programName}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Year of Introduction</Label>
                      <Input
                        type="date"
                        name="YearofIntroduction"
                        // value={validation.values.YearofIntroduction}
                        value={
                          validation.values.YearofIntroduction
                            ? moment(
                                validation.values.YearofIntroduction,
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
                          validation.setFieldValue(
                            "YearofIntroduction",
                            formattedDate
                          );
                        }}
                        placeholder="Enter Year of Introduction"
                        className={
                          validation.touched.YearofIntroduction &&
                          validation.errors.YearofIntroduction
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.YearofIntroduction &&
                        validation.errors.YearofIntroduction && (
                          <div className="text-danger">
                            {validation.errors.YearofIntroduction}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="momFile" className="form-label">
                        Upload MOM
                        <i
                          id="infoIconMom"
                          className="bi bi-info-circle ms-2"
                          style={{ cursor: "pointer", color: "#0d6efd" }}
                        ></i>
                      </Label>

                      <Tooltip
                        placement="right"
                        isOpen={tooltipOpen}
                        target="infoIconMom"
                        toggle={toggleTooltip}
                      >
                        Upload a PDF file. Max size 10MB.
                      </Tooltip>

                      <Input
                        type="file"
                        id="momFile"
                        innerRef={fileRef}
                        className={`form-control ${
                          validation.touched.file && validation.errors.file
                            ? "is-invalid"
                            : ""
                        }`}
                        disabled={isMomUploadDisabled}
                        onChange={(event) => {
                          const file = event.currentTarget.files
                            ? event.currentTarget.files[0]
                            : null;
                          validation.setFieldValue("file", file);
                          if (typeof validation.values.file === "string") {
                            setIsMomUploadDisabled(true);
                          } else {
                            setIsMomUploadDisabled(false);
                          }
                        }}
                      />

                      {validation.touched.file && validation.errors.file && (
                        <div className="text-danger">
                          {validation.errors.file}
                        </div>
                      )}

                      {isMomUploadDisabled &&
                        typeof validation.values.file === "string" && (
                          <div className="text-warning mt-2">
                            Please remove the existing file to upload a new one.
                          </div>
                        )}

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
                                "mom"
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
                      <Label htmlFor="syllabusFile" className="form-label">
                        Upload Syllabus
                        <i
                          id="infoIconSyllabus"
                          className="bi bi-info-circle ms-2"
                          style={{ cursor: "pointer", color: "#0d6efd" }}
                        ></i>
                      </Label>

                      <Tooltip
                        placement="right"
                        isOpen={tooltipOpen}
                        target="infoIconSyllabus"
                        toggle={toggleTooltip}
                      >
                        Upload a PDF file. Max size 10MB.
                      </Tooltip>

                      <Input
                        type="file"
                        id="syllabusFile"
                        innerRef={sylRef}
                        className={`form-control ${
                          validation.touched.syllabusFile &&
                          validation.errors.syllabusFile
                            ? "is-invalid"
                            : ""
                        }`}
                        disabled={isSyllabusUploadDisabled}
                        onChange={(event) => {
                          const file = event.currentTarget.files
                            ? event.currentTarget.files[0]
                            : null;
                          validation.setFieldValue("syllabusFile", file);
                          if (
                            typeof validation.values.syllabusFile === "string"
                          ) {
                            setIsSyllabusUploadDisabled(true);
                          } else {
                            setIsSyllabusUploadDisabled(false);
                          }
                        }}
                      />

                      {validation.touched.syllabusFile &&
                        validation.errors.syllabusFile && (
                          <div className="text-danger">
                            {validation.errors.syllabusFile}
                          </div>
                        )}

                      {isSyllabusUploadDisabled &&
                        typeof validation.values.syllabusFile === "string" && (
                          <div className="text-warning mt-2">
                            Please remove the existing file to upload a new one.
                          </div>
                        )}

                      {typeof validation.values.syllabusFile === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.syllabusFile}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.syllabusFile as string
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
                                validation.values.syllabusFile as string,
                                "syllabus"
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
                      <Label>Download Template</Label>
                      <div>
                        <a
                          href={`${process.env.PUBLIC_URL}/templateFiles/BOS_MOM_New Program_Dept Name.docx`}
                          download
                          className="btn btn-primary btn-sm"
                        >
                          Template
                        </a>
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col lg={12}>
                    <div className="mt-3 d-flex justify-content-between">
                      <button className="btn btn-primary" type="submit">
                        {isEditMode ? "Update " : "Save "}
                      </button>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={handleListNPIClick}
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
        {/* Modal for Listing New Program Introduced */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List New Program Introduced
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
            <Table
              striped
              bordered
              hover
              responsive
              className="align-middle text-center"
              id="bosDataId"
            >
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>Semester Type</th>
                  <th>Semester No</th>
                  <th>School</th>
                  <th>Department</th>
                  <th>Program Type</th>
                  <th>Degree</th>
                  <th>Program Name</th>
                  <th>Introduction Year</th>

                  {/* HIDDEN EXPORT-ONLY */}
                  <th className="export-hidden">MOM (File Path)</th>
                  <th className="export-hidden">Syllabus (File Path)</th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {bosData.length > 0 ? (
                  bosData.map((npi, index) => (
                    <tr key={npi.newProgramId}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{npi.academicYear}</td>
                      <td>{npi.semType}</td>
                      <td>{npi.semesterNo}</td>
                      <td>{npi.streamName}</td>
                      <td>{npi.departmentName}</td>
                      <td>{npi.programTypeName}</td>
                      <td>{npi.degreeName}</td>
                      <td>{npi.programName}</td>
                      <td>{npi.introductionYear}</td>

                      {/* Hidden Export Columns */}
                      <td>{npi.filePath?.mom || "N/A"}</td>
                      <td>{npi.filePath?.syllabus || "N/A"}</td>

                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(npi.newProgramId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(npi.newProgramId)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={13} className="text-center">
                      No New Program Introduced data available.
                    </td>
                  </tr>
                )}
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

export default New_Programs_Introduced;
