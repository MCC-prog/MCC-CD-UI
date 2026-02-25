import axios from "axios";
import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import Select from "react-select";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
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
import { toast, ToastContainer } from "react-toastify";
import moment from "moment";
import { Tooltip } from "@mui/material";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
const api = new APIClient();

const Intercollegiate_Events_Awards_Won: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cswData, setCSWData] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(cswData);
  const [filters, setFilters] = useState({
    academicYear: "",
    level: "",
    type: "",
    noOfParticipants: "",
    hostingClgNme: "",
    studentName: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [isFile2UploadDisabled, setIsFile2UploadDisabled] = useState(false);
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLInputElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

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

  // Fetch Intercollegiate events and awards won data from the backend
  const fetchIEAWData = async () => {
    try {
      const response = await axios.get("/intercollegiateEvents/getAll"); // Replace with your backend API endpoint
      setCSWData(response);
      setFilteredData(response);
    } catch (error) {
      console.error(
        "Error fetching Intercollegiate events and awards won data:",
        error
      );
    }
  };

  // Open the modal and fetch data
  const handleListIEAWClick = () => {
    toggleModal();
    fetchIEAWData();
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
  // Fetch the data for the selected Intercollegiate events and awards won ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/intercollegiateEvents/edit?intercollegiateEventsId=${id}`,
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
        level: mapValueToLabel(
          response.level,
          level // Assuming you have a level options array
        ),
        eventtype: mapValueToLabel(
          response.eventType,
          capType // Assuming you have a capType options array
        ),
        actype: mapValueToLabel(
          response.academicType,
          academicTypeAll // Assuming you have an acType options array
        ),
        awtype: mapValueToLabel(
          response.awardType,
          awardTypeAll // Assuming you have an awType options array
        ),
        hostingClgNme: response.hostingCollegeName || "",
        studentName: response.studentName || "",
        noOfParticipants: response.noOfParticipants || "",
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
        fromDate: response.fromDate
          ? moment(response.fromDate).format("DD/MM/YYYY")
          : "",
        toDate: response.toDate
          ? moment(response.toDate).format("DD/MM/YYYY")
          : "",
        eventName: response.eventName || "",
        file: response.documents?.participationCertificate || null,
        imageStudent: response.documents?.studentImage || null,
        studentRegNum: response.studentRegisterNo || "",
      };
      const streamOption = mapValueToLabel(response.streamId, []); // Replace [] with stream options array if available
      const departmentOption = mapValueToLabel(response.departmentId, []); // Replace [] with department options array if available

      // Update Formik values
      validation.setValues({
        ...mappedValues,
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
        stream: mappedValues.stream || null,
        department: mappedValues.department || null,
        level: mapValueToLabel(response.level, level),
        eventtype: mapValueToLabel(response.eventType, capType),
        actype: mapValueToLabel(response.academicType, academicTypeAll),
        awtype: mapValueToLabel(response.awardType, awardTypeAll),
        hostingClgNme: response.hostingCollegeName || "",
        studentName: response.studentName || "",
        noOfParticipants: response.noOfParticipants || "",
        fromDate: mappedValues.fromDate || "",
        toDate: mappedValues.toDate || "",
        eventName: mappedValues.eventName || "",
        file: mappedValues.file || null,
        imageStudent: mappedValues.imageStudent || null,
        studentRegNum: response.studentRegisterNo || "",
      });
      setSelectedStream(streamOption);
      setSelectedDepartment(departmentOption);
      setIsFileUploadDisabled(!!response.documents?.participationCertificate); // Disable file upload if a file exists
      setIsFile2UploadDisabled(!!response.documents?.studentImage); // Disable file upload if a file exists
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error(
        "Error fetching Intercollegiate events and awards won data by ID:",
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
  // Call the delete API and refresh the Intercollegiate events and awards won data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/intercollegiateEvents/deleteIntercollegiateEvents?intercollegiateEventsId=${id}`,
          ""
        );
        setIsModalOpen(false);
        toast.success(
          response.message ||
            "Intercollegiate events and awards won removed successfully!"
        );
        fetchIEAWData();
      } catch (error) {
        toast.error(
          "Failed to remove Intercollegiate events and awards won. Please try again."
        );
        console.error(
          "Error deleting Intercollegiate events and awards won:",
          error
        );
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

  const capType = [
    { value: "Individual", label: "Individual" },
    { value: "Group Event", label: "Group Event" },
  ];

  const level = [
    { value: "International", label: "International" },
    { value: "National", label: "National" },
    { value: "State", label: "State" },
  ];

  const academicTypeAll = [
    { value: "Academic", label: "Academic" },
    { value: "Non-Academic", label: "Non-Academic" },
  ];

  const awardTypeAll = [
    { value: "Participated", label: "Participated" },
    { value: "Won", label: "Won" },
  ];

  // Handle file download actions
  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(
          `/intercollegiateEvents/download/${fileName}`,
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
      const response = await api.delete(
        `/intercollegiateEvents/deleteIntercollegiateEventsDocument?intercollegiateEventsId=${editId}&docType=${docType}`,
        ""
      );
toast.success(response.message || "File deleted successfully!");
      if (docType === "participationCertificate") {
        validation.setFieldValue("file", null);
        setIsFileUploadDisabled(false);
      }
      if (docType === "studentImage") {
        validation.setFieldValue("imageStudent", null);
        setIsFile2UploadDisabled(false);
      }
    } catch (error) {
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      level: null as { value: string | number; label: string } | null,
      eventtype: null as { value: string | number; label: string } | null,
      actype: null as { value: string | number; label: string } | null,
      awtype: null as { value: string | number; label: string } | null,
      hostingClgNme: "",
      studentName: "",
      studentRegNum: "",
      noOfParticipants: "",
      fromDate: "",
      toDate: "",
      eventName: "",
      file: null as File | string | null,
      imageStudent: null as File | string | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select an academic year"),
      stream: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select school"),
      department: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select department"),
      level: Yup.object().nullable().required("Please select level"),
      actype: Yup.object()
        .nullable()
        .required("Please select type of activity"),
      awtype: Yup.object().nullable().required("Please select award type"),
      eventtype: Yup.object().nullable().required("Please select event type"),
      studentName: Yup.string().required("Please enter industry experience"),
      studentRegNum: Yup.string().required(
        "Please enter student register number"
      ),
      hostingClgNme: Yup.string().required("Please enter hosting college name"),
      eventName: Yup.string().required("Please enter eventName"),
      noOfParticipants: Yup.string().required(
        "Please enter no. of participants"
      ),
      fromDate: Yup.string()
        .required("From date is required")
        .test("is-valid-date", "Invalid start date", (value) =>
          moment(value, "DD/MM/YYYY", true).isValid()
        ),
      toDate: Yup.string()
        .required("To date is required")
        .test("is-valid-date", "Invalid start date", (value) =>
          moment(value, "DD/MM/YYYY", true).isValid()
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
          if (value instanceof File && value.size > 100 * 1024 * 1024) {
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
      imageStudent: Yup.mixed().test(
        "fileValidation",
        "Please upload a valid JPEG file",
        function (value) {
          if (isFileUploadDisabled) {
            return true;
          }
          if (!value) {
            return this.createError({ message: "Please upload a file" });
          }
          // Limit to 10MB for JPEG
          if (value instanceof File && value.size > 10 * 1024 * 1024) {
            return this.createError({ message: "File size is too large" });
          }
          const allowedTypes = ["image/jpeg"]; // Only JPEG allowed
          if (value instanceof File && !allowedTypes.includes(value.type)) {
            return this.createError({ message: "Only JPEG format is allowed" });
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
        formData.append(
          "eventType",
          values.eventtype?.value !== undefined
            ? String(values.eventtype?.value)
            : ""
        );
        formData.append("noOfParticipants", values.noOfParticipants);
        formData.append(
          "level",
          values.level && typeof values.level === "object"
            ? String(values.level.value)
            : ""
        );
        formData.append("hostingCollegeName", values.hostingClgNme || "");
        formData.append("eventName", values.eventName || "");
        formData.append("studentName", values.studentName || "");
        formData.append("studentRegisterNo", values.studentRegNum || "");
        formData.append(
          "academicType",
          values.actype && typeof values.actype === "object"
            ? String(values.actype.value)
            : ""
        );
        formData.append(
          "awardType",
          values.awtype && typeof values.awtype === "object"
            ? String(values.awtype.value)
            : ""
        );
        // If the date is provided, format it to YYYY-MM-DD
        if (values.fromDate) {
          const formattedDate = moment(values.fromDate, "DD/MM/YYYY").format(
            "DD/MM/YYYY"
          );
          formData.append("fromDate", formattedDate);
        }
        if (values.toDate) {
          const formattedDate = moment(values.toDate, "DD/MM/YYYY").format(
            "DD/MM/YYYY"
          );
          formData.append("toDate", formattedDate);
        }
        if (isEditMode && typeof values.file === "string") {
          // Pass an empty PDF instead of null
          formData.append(
            "participationCertification",
            new Blob([], { type: "application/pdf" }),
            "empty.pdf"
          );
        } else if (isEditMode && values.file === null) {
          formData.append(
            "participationCertification",
            new Blob([], { type: "application/pdf" }),
            "empty.pdf"
          );
        } else if (values.file) {
          formData.append("participationCertification", values.file);
        }
        if (isEditMode && typeof values.imageStudent === "string") {
          // Pass an empty JPEG instead of null
          formData.append(
            "studentImage",
            new Blob([], { type: "image/jpeg" }),
            "empty.jpg"
          );
        } else if (isEditMode && values.imageStudent === null) {
          formData.append(
            "studentImage",
            new Blob([], { type: "image/jpeg" }),
            "empty.jpg"
          );
        } else if (values.imageStudent) {
          formData.append("studentImage", values.imageStudent);
        }
        // If in edit mode, append the edit ID
        if (isEditMode && editId) {
          formData.append("intercollegiateEventsId", editId);
        }

        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/intercollegiateEvents/update`,
            formData
          );
          toast.success(
            response.message ||
              "Intercollegiate events and awards won updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/intercollegiateEvents/save",
            formData
          );
          toast.success(
            response.message ||
              "Intercollegiate events and awards won added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        // Reset the file upload state
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        if (imgRef.current) {
          imgRef.current.value = "";
        }
        setIsFileUploadDisabled(false); 
        setIsFile2UploadDisabled(false);
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        handleListIEAWClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Intercollegiate events and awards won. Please try again."
        );
        console.error(
          "Error creating Intercollegiate events and awards won:",
          error
        );
      }
    },
  });

  useEffect(() => {
    if (cswData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
      destroy: true,
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Intercollegiate_Events_Awards_Won_Data",
          title: "Intercollegiate Events and Awards Won Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Intercollegiate_Events_Awards_Won_Data",
          title: "Intercollegiate Events and Awards Won Data Export",
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
  }, [cswData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Student Activities & Support"
            breadcrumbItem="Intercollegiate events and awards won"
          />
          <Card>
            <CardBody>
              <form onSubmit={validation.handleSubmit}>
                <Row>
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
                      <Label>Event Type</Label>
                      <Select
                        options={capType}
                        value={validation.values.eventtype}
                        onChange={(selectedOptions) =>
                          validation.setFieldValue("eventtype", selectedOptions)
                        }
                        placeholder="Select event type"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.eventtype &&
                          validation.errors.eventtype
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.eventtype &&
                        validation.errors.eventtype && (
                          <div className="text-danger">
                            {validation.errors.eventtype}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>No. of Participants</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.noOfParticipants &&
                          validation.errors.noOfParticipants
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.noOfParticipants}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "noOfParticipants",
                            e.target.value
                          )
                        }
                        placeholder="Enter No. of Participants"
                      />
                      {validation.touched.noOfParticipants &&
                        validation.errors.noOfParticipants && (
                          <div className="text-danger">
                            {validation.errors.noOfParticipants}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>From Date</Label>
                      <Input
                        type="date" // Use native date input
                        className={`form-control ${
                          validation.touched.fromDate &&
                          validation.errors.fromDate
                            ? "is-invalid"
                            : ""
                        }`}
                        value={
                          validation.values.fromDate
                            ? moment(
                                validation.values.fromDate,
                                "DD/MM/YYYY"
                              ).format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
                          validation.setFieldValue("fromDate", formattedDate);
                        }}
                        placeholder="dd/mm/yyyy"
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
                        type="date" // Use native date input
                        className={`form-control ${
                          validation.touched.toDate && validation.errors.toDate
                            ? "is-invalid"
                            : ""
                        }`}
                        value={
                          validation.values.toDate
                            ? moment(
                                validation.values.toDate,
                                "DD/MM/YYYY"
                              ).format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
                          validation.setFieldValue("toDate", formattedDate);
                        }}
                        placeholder="dd/mm/yyyy"
                      />
                      {validation.touched.toDate &&
                        validation.errors.toDate && (
                          <div className="text-danger">
                            {validation.errors.toDate}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Level</Label>
                      <Select
                        options={level}
                        value={validation.values.level}
                        onChange={(selectedOptions) =>
                          validation.setFieldValue("level", selectedOptions)
                        }
                        placeholder="Select Level"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.level && validation.errors.level
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.level && validation.errors.level && (
                        <div className="text-danger">
                          {validation.errors.level}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Hosting College Name</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.hostingClgNme &&
                          validation.errors.hostingClgNme
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.hostingClgNme}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "hostingClgNme",
                            e.target.value
                          )
                        }
                        placeholder="Enter hosting college name"
                      />
                      {validation.touched.hostingClgNme &&
                        validation.errors.hostingClgNme && (
                          <div className="text-danger">
                            {validation.errors.hostingClgNme}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Event Name</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.eventName &&
                          validation.errors.eventName
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.eventName}
                        onChange={(e) =>
                          validation.setFieldValue("eventName", e.target.value)
                        }
                        placeholder="Enter event name"
                      />
                      {validation.touched.eventName &&
                        validation.errors.eventName && (
                          <div className="text-danger">
                            {validation.errors.eventName}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Student Name</Label>
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
                        placeholder="Enter student name"
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
                      <Label>Student Register Number</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.studentRegNum &&
                          validation.errors.studentRegNum
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.studentRegNum}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "studentRegNum",
                            e.target.value
                          )
                        }
                        placeholder="Enter student register number"
                      />
                      {validation.touched.studentRegNum &&
                        validation.errors.studentRegNum && (
                          <div className="text-danger">
                            {validation.errors.studentRegNum}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Type Of Activity</Label>
                      <Select
                        options={academicTypeAll}
                        value={validation.values.actype}
                        onChange={(selectedOptions) =>
                          validation.setFieldValue("actype", selectedOptions)
                        }
                        placeholder="Select type of activity"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.actype && validation.errors.actype
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.actype &&
                        validation.errors.actype && (
                          <div className="text-danger">
                            {validation.errors.actype}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Award Type</Label>
                      <Select
                        options={awardTypeAll}
                        value={validation.values.awtype}
                        onChange={(selectedOptions) =>
                          validation.setFieldValue("awtype", selectedOptions)
                        }
                        placeholder="Select award type"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.awtype && validation.errors.awtype
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.awtype &&
                        validation.errors.awtype && (
                          <div className="text-danger">
                            {validation.errors.awtype}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Participation/Winning
                      </Label>
                      <Tooltip
                        placement="right"
                        open={tooltipOpen}
                        onClose={() => setTooltipOpen(false)}
                        onOpen={() => setTooltipOpen(true)}
                        title={<span>Upload file. Max size 10MB.</span>}
                        arrow
                      >
                        <i
                          id="infoIcon"
                          className="bi bi-info-circle ms-2"
                          style={{ cursor: "pointer", color: "#0d6efd" }}
                        ></i>
                      </Tooltip>
                      <Input
                        className={`form-control ${
                          validation.touched.file && validation.errors.file
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        innerRef={fileRef} // Reference for the file input
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
                            onClick={() =>
                              handleDeleteFile(
                                validation.values.file as string,
                                "participationCertificate"
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
                        Upload Image of Students
                      </Label>
                      <Tooltip
                        placement="right"
                        open={tooltipOpen}
                        onClose={() => setTooltipOpen(false)}
                        onOpen={() => setTooltipOpen(true)}
                        title={<span>Upload Jpeg. Max size 10MB.</span>}
                        arrow
                      >
                        <i
                          id="infoIcon"
                          className="bi bi-info-circle ms-2"
                          style={{ cursor: "pointer", color: "#0d6efd" }}
                        ></i>
                      </Tooltip>
                      <Input
                        className={`form-control ${
                          validation.touched.imageStudent &&
                          validation.errors.imageStudent
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        innerRef={imgRef} // Reference for the image input
                        id="formFile"
                        onChange={(event) => {
                          validation.setFieldValue(
                            "imageStudent",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        accept="image/jpeg" // Accept only image files
                        disabled={isFile2UploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.imageStudent &&
                        validation.errors.imageStudent && (
                          <div className="text-danger">
                            {validation.errors.imageStudent}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFile2UploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.imageStudent === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.imageStudent}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.imageStudent as string
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
                                validation.values.imageStudent as string,
                                "studentImage"
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
                          href={`${process.env.PUBLIC_URL}/templateFiles/YEAR_DeptorAssociation_EVENT.docx`}
                          download
                          className="btn btn-primary btn-sm"
                        >
                          Report Template
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
                        onClick={handleListIEAWClick}
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
        {/* Modal for Listing Intercollegiate events and awards won */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Intercollegiate events and awards won
          </ModalHeader>
          <ModalBody>
            <Table striped bordered hover id="id" innerRef={tableRef}>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>School</th>
                  <th>Department</th>
                  <th>Event Type</th>
                  <th>No. of Participants</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Level</th>
                  <th>Hosting College Name</th>
                  <th>Event Name</th>
                  <th>Student Name</th>
                  {/* Hidden fields */}
                  <th className="d-none">Register Number</th>
                  <th className="d-none">Type Of Activity</th>
                  <th className="d-none">Award Type</th>
                  <th className="d-none">Student Image URL</th>
                  <th className="d-none">Participation Certificate URL</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cswData.length > 0 ? (
                  cswData.map((cds, index) => (
                    <tr key={cds.intercollegiateEventsId}>
                      <td>{index + 1}</td>
                      <td>{cds.academicYear}</td>
                      <td>{cds.streamName}</td>
                      <td>{cds.departmentName}</td>
                      <td>{cds.eventType}</td>
                      <td>{cds.noOfParticipants}</td>
                      <td>{cds.fromDate}</td>
                      <td>{cds.toDate}</td>
                      <td>{cds.level}</td>
                      <td>{cds.hostingCollegeName}</td>
                      <td>{cds.eventName}</td>
                      <td>{cds.studentName}</td>
                      <td className="d-none">
                        {cds.studentRegisterNo || "N/A"}
                      </td>
                      <td className="d-none">{cds.academicType || "N/A"}</td>
                      <td className="d-none">{cds.awardType || "N/A"}</td>
                      <td className="d-none">
                        {cds.filePath?.studentImage || "N/A"}
                      </td>
                      <td className="d-none">
                        {cds.filePath?.participationCertificate || "N/A"}
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() =>
                              handleEdit(cds.intercollegiateEventsId)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleDelete(cds.intercollegiateEventsId)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={13} className="text-center py-3">
                      No intercollegiate event data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </ModalBody>
        </Modal>
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

export default Intercollegiate_Events_Awards_Won;
