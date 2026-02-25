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
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";

const api = new APIClient();

const PatentsOrCopyRights: React.FC = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variable for managing file upload status
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  // State variable for managing the modal for listing Patents Filed
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State variable for managing the list of Patents Filed data
  const [patentData, setPatentData] = useState<any[]>([]);
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
    titleOfInvention: "",
    patentNumber: "",
    filedDate: "",
    dateOfPatentGrant: "",
    assigneeInstitute: "",
    inventors: "",
    published: "",
  });
  const [filteredData, setFilteredData] = useState(patentData);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = patentData.filter((row) =>
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

  // Toggle the modal for listing Patents Filed
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Patents Filed data from the backend
  const fetchPatentData = async () => {
    try {
      const response = await api.get("/patent/getAllPatent", "");
      setPatentData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Patents Filed data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListBosClick = () => {
    toggleModal();
    fetchPatentData();
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
  // Fetch the data for the selected Patents Filed ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(`/patent?patentId=${id}`, "");
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
          ? { value: response.streamId.toString(), label: response.streamName }
          : null,
        department: response.departmentId
          ? {
            value: response.departmentId.toString(),
            label: response.departmentName,
          }
          : null,
        abstractFile: response.files?.Patent || null,
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

        facultyName: response.facultyName || "",
        titleOfInvention: response.titleOfInvention || "",
        patentNumber: response.patentNumber || "",
        filedDate: response.filedDate
          ? moment(response.filedDate).format("DD/MM/YYYY")
          : "",
        dateOfPatentGrant: response.dateOfPatentGrant
          ? moment(response.dateOfPatentGrant).format("DD/MM/YYYY")
          : "",
        assigneeInstitute: response.assigneeInstitute || "",
        inventors: response.inventors || "",
        published: response.published || "",
        abstractFile: response.files?.Patent || null,

        // You can keep otherDepartment as empty if not from API
        otherDepartment: "",
      });
      setSelectedStream(streamOption);
      setSelectedDepartment(departmentOption);
      setIsFileUploadDisabled(!!response.files?.Patent); // Disable file upload if a file exists
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error("Error fetching Patents Filed data by ID:", error);
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the Patents Filed data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/patent/deletePatent?patentId=${id}`,
          ""
        );
        setIsModalOpen(false);

        toast.success(
          response.message || "Patents Filed removed successfully!"
        );
        fetchPatentData();
      } catch (error) {
        toast.error("Failed to remove Patents Filed. Please try again.");
        console.error("Error deleting Patents Filed:", error);
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
        const response = await axios.get(`/patent/download/${fileName}`, {
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
  const handleDeleteFile = async (fileName: string, docType: string) => {
    try {
      // Call the delete API
      const response = await api.delete(
        `/patent/deletePatentDocument?fileName=${fileName}`,
        ""
      );
      // Show success message
toast.success(response.message || "File deleted successfully!");
      // Remove the file from the form
      if (docType === "Patent") {
        validation.setFieldValue("abstractFile", null);
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
      titleOfInvention: "",
      patentNumber: "",
      filedDate: "",
      dateOfPatentGrant: "",
      assigneeInstitute: "",
      inventors: "",
      published: "",
      abstractFile: null as File | string | null,
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
      titleOfInvention: Yup.string().required(
        "Please enter title of invention"
      ),
      patentNumber: Yup.string().required("Please enter patent number"),
      filedDate: Yup.string()
        .required("Please select date")
        .matches(
          /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
          "Date must be in dd/mm/yyyy format"
        ),
      dateOfPatentGrant: Yup.string()
        .required("Please select date")
        .matches(
          /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
          "Date must be in dd/mm/yyyy format"
        ),
      assigneeInstitute: Yup.string().required(
        "Please enter assignee institute"
      ),
      inventors: Yup.string().required("Please enter inventors"),
      published: Yup.string().required("Please enter published info"),
      abstractFile: Yup.mixed()
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
      formData.append("titleOfInvention", values.titleOfInvention || "");
      formData.append("patentNumber", values.patentNumber || "");
      formData.append("filedDate", values.filedDate || "");
      formData.append("dateOfPatentGrant", values.dateOfPatentGrant || "");
      formData.append("assigneeInstitute", values.assigneeInstitute || "");
      formData.append("inventors", values.inventors || "");
      formData.append("published", values.published || "");
      formData.append("id", editId || "");

      if (isEditMode && typeof values.abstractFile === "string") {
        formData.append(
          "patent",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.abstractFile === null) {
        formData.append(
          "patent",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.abstractFile) {
        formData.append("patent", values.abstractFile);
      }
      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/patent`, formData);
          toast.success(
            response.message || "Patents Filed updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create("/patent", formData);
          toast.success(
            response.message || "Patents Filed added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsFileUploadDisabled(false); // Enable file upload for new entries
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the Patents Filed List
        handleListBosClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Patents Filed. Please try again.");
        console.error("Error creating Patents Filed:", error);
      }
    },
  });

  useEffect(() => {
    if (patentData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
      destroy: true,
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "PatentsOrCopyRights_Data",
          title: "Patents or CopyRights Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "PatentsOrCopyRights_Data",
          title: "Patents or CopyRights Data Export",
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
  }, [patentData]);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="INNOVATION & ENTREPRENUERSHIP"
            breadcrumbItem="Patents/CopyRights"
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
                          className={`form-control ${validation.touched.otherDepartment &&
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
                      <Label>Title of Invention</Label>
                      <Input
                        placeholder="Enter Title of Invention"
                        type="text"
                        value={validation.values.titleOfInvention}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "titleOfInvention",
                            e.target.value
                          )
                        }
                        className={
                          validation.touched.titleOfInvention &&
                            validation.errors.titleOfInvention
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.titleOfInvention &&
                        validation.errors.titleOfInvention && (
                          <div className="text-danger">
                            {validation.errors.titleOfInvention}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Patent Number</Label>
                      <Input
                        placeholder="Enter Patent Number"
                        type="text"
                        value={validation.values.patentNumber}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "patentNumber",
                            e.target.value
                          )
                        }
                        className={
                          validation.touched.patentNumber &&
                            validation.errors.patentNumber
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.patentNumber &&
                        validation.errors.patentNumber && (
                          <div className="text-danger">
                            {validation.errors.patentNumber}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Filed Date</Label>
                      <Input
                        type="date"
                        value={
                          validation.values.filedDate
                            ? moment(
                              validation.values.filedDate,
                              "DD/MM/YYYY"
                            ).format("YYYY-MM-DD")
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY");
                          validation.setFieldValue("filedDate", formattedDate);
                        }}
                        className={
                          validation.touched.filedDate &&
                            validation.errors.filedDate
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.filedDate &&
                        validation.errors.filedDate && (
                          <div className="text-danger">
                            {validation.errors.filedDate}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Date of Patent Grant</Label>
                      <Input
                        type="date"
                        value={
                          validation.values.dateOfPatentGrant
                            ? moment(
                              validation.values.dateOfPatentGrant,
                              "DD/MM/YYYY"
                            ).format("YYYY-MM-DD")
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY");
                          validation.setFieldValue(
                            "dateOfPatentGrant",
                            formattedDate
                          );
                        }}
                        className={
                          validation.touched.dateOfPatentGrant &&
                            validation.errors.dateOfPatentGrant
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.dateOfPatentGrant &&
                        validation.errors.dateOfPatentGrant && (
                          <div className="text-danger">
                            {validation.errors.dateOfPatentGrant}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Assignee Institute</Label>
                      <Input
                        placeholder="Enter Assignee Institute"
                        type="text"
                        value={validation.values.assigneeInstitute}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "assigneeInstitute",
                            e.target.value
                          )
                        }
                        className={
                          validation.touched.assigneeInstitute &&
                            validation.errors.assigneeInstitute
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.assigneeInstitute &&
                        validation.errors.assigneeInstitute && (
                          <div className="text-danger">
                            {validation.errors.assigneeInstitute}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Inventors</Label>
                      <Input
                        placeholder="Enter Inventors"
                        type="text"
                        value={validation.values.inventors}
                        onChange={(e) =>
                          validation.setFieldValue("inventors", e.target.value)
                        }
                        className={
                          validation.touched.inventors &&
                            validation.errors.inventors
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.inventors &&
                        validation.errors.inventors && (
                          <div className="text-danger">
                            {validation.errors.inventors}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Published</Label>
                      <Input
                        placeholder="Enter Published"
                        type="text"
                        value={validation.values.published}
                        onChange={(e) =>
                          validation.setFieldValue("published", e.target.value)
                        }
                        className={
                          validation.touched.published &&
                            validation.errors.published
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.published &&
                        validation.errors.published && (
                          <div className="text-danger">
                            {validation.errors.published}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Abstract Upload</Label>
                      <Input
                        innerRef={fileRef}
                        id="formFile"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "abstractFile",
                            e.currentTarget.files?.[0] || null
                          )
                        }
                        className={
                          validation.touched.abstractFile &&
                            validation.errors.abstractFile
                            ? "is-invalid"
                            : ""
                        }
                        disabled={isFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.abstractFile &&
                        validation.errors.abstractFile && (
                          <div className="text-danger">
                            {validation.errors.abstractFile}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.abstractFile === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.abstractFile}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.abstractFile as string
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
                                validation.values.abstractFile as string,
                                "Patent"
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
                        onClick={handleListBosClick}
                      >
                        List Patent/Copyrights
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Patents Filed */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>List Patents Filed</ModalHeader>
          <ModalBody>
            <Table striped bordered hover id="id" innerRef={tableRef}>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>School</th>
                  <th>Department</th>
                  <th>Faculty Name</th>
                  <th>Title of Invention</th>
                  <th>Patent Number</th>
                  <th>Filed Date</th>
                  <th>Date of Patent Grant</th>
                  <th>Assignee Institute</th>
                  <th>Inventors</th>
                  <th>Published</th>
                  <th className="d-none">FilePath</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patentData.length > 0 ? (
                  patentData.map((bos, index) => (
                    <tr key={bos.patentDataId}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{bos.academicYear}</td>
                      <td>{bos.streamName}</td>
                      <td>{bos.departmentName}</td>
                      <td>{bos.facultyName}</td>
                      <td>{bos.titleOfInvention}</td>
                      <td>{bos.patentNumber}</td>
                      <td>{new Date(bos.filedDate).toLocaleDateString()}</td>
                      <td>
                        {new Date(bos.dateOfPatentGrant).toLocaleDateString()}
                      </td>
                      <td>{bos.assigneeInstitute}</td>
                      <td>{bos.inventors}</td>
                      <td>{bos.published}</td>
                      <td className="d-none">{bos?.filePath.Patent || "N/A"}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(bos.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(bos.id)}
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
                      No Patent/Copyrights data available.
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

export default PatentsOrCopyRights;
