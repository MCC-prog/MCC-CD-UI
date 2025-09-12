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
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";

const api = new APIClient();

const WorkshopsOrSeminars: React.FC = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variable for managing file upload status
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  // State variable for managing the modal for listing wos
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State variable for managing the list of Workshops Or Seminars Conducted
  const [wosData, setWOSData] = useState<any[]>([]);
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
    facultyName: "",
    type: "",
    mode: "",
    state: "",
    title: "",
    organizedBy: "",
    fromDate: "",
    toDate: "",
  });
  const [filteredData, setFilteredData] = useState(wosData);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = wosData.filter((row) =>
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

  // Toggle the modal for listing wos
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Workshops Or Seminars Conducted from the backend
  const fetchWOSData = async () => {
    try {
      const response = await api.get(
        "/workshopsConducted/getAllWorkshopsConducted",
        ""
      );
      setWOSData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Workshops Or Seminars Conducted:", error);
    }
  };

  // Open the modal and fetch data
  const handleListWOSClick = () => {
    toggleModal();
    fetchWOSData();
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

  const typeOPT = [
    { value: "Workshop", label: "Workshop" },
    { value: "Seminar", label: "Seminar" },
    { value: "Conference", label: "Conference" },
    { value: "Webinar", label: "Webinar" },
  ];
  const stateOpt = [
    { value: "State", label: "State" },
    { value: "National", label: "National" },
    { value: "International", label: "International" },
  ];

  const modeOpt = [
    { value: "Offline", label: "Offline" },
    { value: "Online", label: "Online" },
  ];

  // Handle edit action
  // Fetch the data for the selected BOS ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/workshopsConducted?WorkshopsConductedId=${id}`,
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
          ? { value: String(response.streamId), label: response.streamName }
          : null,
        department: response.departmentId
          ? {
              value: String(response.departmentId),
              label: response.departmentName,
            }
          : null,
        type: response.type
          ? { value: response.type, label: response.type }
          : null,
        mode: response.mode
          ? { value: response.mode, label: response.mode }
          : null,
        state: response.level
          ? { value: response.level, label: response.level }
          : null,
      };
      const streamOption = mapValueToLabel(response.streamId, []); // Replace [] with stream options array if available
      const departmentOption = mapValueToLabel(response.departmentId, []); // Replace [] with department options array if available
      validation.setValues({
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
        stream: mappedValues.stream,
        department: mappedValues.department,
        otherDepartment: "", // optional
        facultyName: response.facultyName || "",
        type: mappedValues.type,
        mode: mappedValues.mode,
        state: mappedValues.state,
        title: response.title || "",
        organizedBy: response.organizedBy || "",
        fromDate: response.fromDate
          ? moment(response.fromDate).format("DD/MM/YYYY")
          : "",
        toDate: response.toDate
          ? moment(response.toDate).format("DD/MM/YYYY")
          : "",
        certificate: response.files?.Workshops || null,
      });
      setSelectedStream(streamOption);
      setSelectedDepartment(departmentOption);
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error(
        "Error fetching Workshops Or Seminars Conducted by ID:",
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
  // Call the delete API and refresh the Workshops Or Seminars Conducted
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/workshopsConducted/deleteWorkshopsConducted?workshopsConductedId=${id}`,
          ""
        );
        toast.success(
          response.message ||
            "Workshops Or Seminars Conducted removed successfully!"
        );
        fetchWOSData();
      } catch (error) {
        toast.error(
          "Failed to remove Workshops Or Seminars Conducted. Please try again."
        );
        console.error("Error deleting wos:", error);
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
          `/workshopsConducted/download/${fileName}`,
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

  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
  };

  // Handle file deletion
  // Clear the file from the form and show success message
  const handleDeleteFile = async (fileName: string, docType: string) => {
    try {
      // Call the delete API
      const response = await api.delete(
        `/workshopsConducted/deleteWorkshopsConductedDocument?fileName=${fileName}`,
        ""
      );
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      // Remove the file from the form
      if (docType === "certificate") {
        validation.setFieldValue("certificate", null);
      }
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
      facultyName: "",
      type: null as { value: string; label: string } | null,
      mode: null as { value: string; label: string } | null,
      state: null as { value: string; label: string } | null,
      title: "",
      organizedBy: "",
      fromDate: "",
      toDate: "",
      certificate: null as File | string | null,
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
      facultyName: Yup.string().required("Please enter faculty name"),
      type: Yup.object({
        value: Yup.string().required(),
        label: Yup.string().required(),
      })
        .nullable()
        .required("Please select type"),

      mode: Yup.object({
        value: Yup.string().required(),
        label: Yup.string().required(),
      })
        .nullable()
        .required("Please select mode"),

      state: Yup.object({
        value: Yup.string().required(),
        label: Yup.string().required(),
      })
        .nullable()
        .required("Please select state"),

      title: Yup.string().required("Please enter title"),
      organizedBy: Yup.string().required("Please enter organizer"),
      fromDate: Yup.string()
        .required("Please select from date")
        .matches(
          /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
          "Date must be in dd/mm/yyyy format"
        ),
      toDate: Yup.string()
        .required("Please select to date")
        .matches(
          /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
          "Date must be in dd/mm/yyyy format"
        ),
      certificate: Yup.mixed()
        .required("Please upload abstract file")
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
      formData.append("facultyName", values.facultyName || "");
      formData.append("type", values.type?.value || "");
      formData.append("mode", values.mode?.value || "");
      formData.append("level", values.state?.value || "");
      formData.append("title", values.title || "");
      formData.append("organizedBy", values.organizedBy || "");
      formData.append("fromDate", values.fromDate || "");
      formData.append("toDate", values.toDate || "");
      formData.append("id", editId || "");

      if (isEditMode && typeof values.certificate === "string") {
        formData.append(
          "file",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.certificate === null) {
        formData.append(
          "file",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.certificate) {
        formData.append("file", values.certificate);
      }
      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/workshopsConducted`, formData);
          toast.success(
            response.message ||
              "Workshops Or Seminars Conducted updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create("/workshopsConducted", formData);
          toast.success(
            response.message ||
              "Workshops Or Seminars Conducted added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the Workshops Or Seminars Conducted
        handleListWOSClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Workshops Or Seminars Conducted. Please try again."
        );
        console.error("Error creating BOS:", error);
      }
    },
  });

  useEffect(() => {
    if (wosData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
      destroy: true,
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
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
  }, [wosData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="INNOVATION & ENTREPRENUERSHIP"
            breadcrumbItem="Workshops Or Seminars Conducted"
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
                      <Label>Faculty Name</Label>
                      <Input
                        placeholder="Enter Faculty Name"
                        type="text"
                        value={validation.values.facultyName}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "facultyName",
                            e.target.value
                          )
                        }
                        className={
                          validation.touched.facultyName &&
                          validation.errors.facultyName
                            ? "is-invalid"
                            : ""
                        }
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
                      <Label>Type</Label>
                      <Select
                        options={typeOPT}
                        value={validation.values.type}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("type", selectedOption)
                        }
                        placeholder="Select Type"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.type && validation.errors.type
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.type && validation.errors.type && (
                        <div className="text-danger">
                          {typeof validation.errors.type === "string"
                            ? validation.errors.type
                            : ""}
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Mode</Label>
                      <Select
                        options={modeOpt}
                        value={validation.values.mode}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("mode", selectedOption)
                        }
                        placeholder="Select Mode"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.mode && validation.errors.mode
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.mode && validation.errors.mode && (
                        <div className="text-danger">
                          {typeof validation.errors.mode === "string"
                            ? validation.errors.mode
                            : ""}
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Level</Label>
                      <Select
                        options={stateOpt}
                        value={validation.values.state}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("state", selectedOption)
                        }
                        placeholder="Select Level"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.state && validation.errors.state
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.state && validation.errors.state && (
                        <div className="text-danger">
                          {typeof validation.errors.state === "string"
                            ? validation.errors.state
                            : ""}
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Title</Label>
                      <Input
                        placeholder="Enter title"
                        type="text"
                        value={validation.values.title}
                        onChange={(e) =>
                          validation.setFieldValue("title", e.target.value)
                        }
                        className={
                          validation.touched.title && validation.errors.title
                            ? "is-invalid"
                            : ""
                        }
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
                      <Label>Organized By</Label>
                      <Input
                        placeholder="Enter Organized By"
                        type="text"
                        value={validation.values.organizedBy}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "organizedBy",
                            e.target.value
                          )
                        }
                        className={
                          validation.touched.organizedBy &&
                          validation.errors.organizedBy
                            ? "is-invalid"
                            : ""
                        }
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
                        value={
                          validation.values.fromDate
                            ? moment(
                                validation.values.fromDate,
                                "DD/MM/YYYY"
                              ).format("YYYY-MM-DD")
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY");
                          validation.setFieldValue("fromDate", formattedDate);
                        }}
                        className={
                          validation.touched.fromDate &&
                          validation.errors.fromDate
                            ? "is-invalid"
                            : ""
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
                        value={
                          validation.values.toDate
                            ? moment(
                                validation.values.toDate,
                                "DD/MM/YYYY"
                              ).format("YYYY-MM-DD")
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY");
                          validation.setFieldValue("toDate", formattedDate);
                        }}
                        className={
                          validation.touched.toDate && validation.errors.toDate
                            ? "is-invalid"
                            : ""
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Certificate</Label>
                      <Input
                        type="file"
                        innerRef={fileRef}
                        accept="application/pdf"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "certificate",
                            e.currentTarget.files?.[0] || null
                          )
                        }
                        className={
                          validation.touched.certificate &&
                          validation.errors.certificate
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.certificate &&
                        validation.errors.certificate && (
                          <div className="text-danger">
                            {validation.errors.certificate}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.certificate === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.certificate}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.certificate as string
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
                                validation.values.certificate as string,
                                "certificate"
                              )
                            }
                            title="Delete File"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      )}
                      <div className="form-text">
                        Name should be{" "}
                        <b>Workshop-School-Dept_faculty-title-year</b>
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
                        onClick={handleListWOSClick}
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
        {/* Modal for Listing BOS */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Workshops Or Seminars Conducted
          </ModalHeader>
          <ModalBody>
            <Table striped bordered hover id="id" innerRef={tableRef}>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>Stream</th>
                  <th>Department</th>
                  <th>Faculty Name</th>
                  <th>Type</th>
                  <th>Mode</th>
                  <th>Level</th>
                  <th>Title</th>
                  <th>Organized By</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th className="d-none">File Path</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((wos, index) => (
                    <tr key={wos.id}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{wos.academicYear}</td>
                      <td>{wos.streamName}</td>
                      <td>{wos.departmentName}</td>
                      <td>{wos.facultyName}</td>
                      <td>{wos.type}</td>
                      <td>{wos.mode}</td>
                      <td>{wos.level}</td>
                      <td>{wos.title}</td>
                      <td>{wos.organizedBy}</td>
                      <td>{wos.fromDate}</td>
                      <td>{wos.toDate}</td>
                      <td className="d-none">
                        {wos.filePath?.Workshops || "N/A"}
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(wos.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(wos.id)}
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
                      No Workshops Or Seminars Conducted data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
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

export default WorkshopsOrSeminars;
