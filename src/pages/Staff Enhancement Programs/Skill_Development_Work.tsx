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

const Skill_Development_Work: React.FC = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variable for managing file upload status
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  // State variable for managing the modal for listing Skill Development Workshops
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State variable for managing the list of Skill Development Workshops
  const [swdData, setSWDData] = useState<any[]>([]);
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  // State variable for managing search term and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(swdData);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
  };

  const Type = [
    { value: "National", label: "National" },
    { value: "International", label: "International" },
  ];


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

  // Toggle the modal for listing Skill Development Workshops
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Skill Development Workshops from the backend
  const fetchSWDData = async () => {
    try {
      const response = await api.get(
        "/fdpsMoocsSkillDevelopmentWorkshop/getAllFdpsMoocsSkillDevelopmentWorkshop?screenType=skillDevelopment",
        ""
      );
      setSWDData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Skill Development Workshops:", error);
    }
  };

  // Open the modal and fetch data
  const handleListSDWClick = () => {
    toggleModal();
    fetchSWDData();
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
        `/fdpsMoocsSkillDevelopmentWorkshop?fdpsMoocsSkillDevelopmentWorkshopId=${id}&screenType=skillDevelopment`,
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

      const fileObject = response.file || null;
      const fileName = fileObject ? Object.values(fileObject)[0] : null;

      // Map API response to Formik values
      const mappedValues = {
        academicYear: mapValueToLabel(response.year, academicYearList),
        stream: response.streamId
          ? { value: response.streamId.toString(), label: response.streamName }
          : null,
        department: response.departmentId
          ? {
              value: response.departmentId.toString(),
              label: response.departmentName,
            }
          : null,
        startDate: response.startDate
          ? moment(response.startDate).format("DD/MM/YYYY")
          : "",
        endDate: response.endDate
          ? moment(response.endDate).format("DD/MM/YYYY")
          : "",
        otherDepartment: "", // Add default value for otherDepartment
        file: fileName,
        titleOfFdp: response.title || "",
        orgInst: response.organizingInstitution || "",
        type: response.identity
          ? { value: response.identity, label: response.identity }
          : null,
      };
      const streamOption = mapValueToLabel(response.streamId, []); // Replace [] with stream options array if available
      const departmentOption = mapValueToLabel(response.departmentId, []); // Replace [] with department options array if available

      // Update Formik values
      validation.setValues({
        ...mappedValues,
        file:
          typeof mappedValues.file === "string" ||
          mappedValues.file instanceof File ||
          mappedValues.file === null
            ? mappedValues.file
            : null,
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
        facultyName: response.facultyName || "", // Ensure facultyName is included
      });
      setSelectedStream(streamOption);
      setSelectedDepartment(departmentOption);

      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      // Disable the file upload button if a file exists
      setIsFileUploadDisabled(!!fileName);
      toggleModal();
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
        const response = await api.delete(
          `/fdpsMoocsSkillDevelopmentWorkshop/deleteFdpsMoocsSkillDevelopmentWorkshop?fdpsMoocsSkillDevelopmentWorkshopId=${id}`,
          ""
        );
        setIsModalOpen(false);

        toast.success(
          response.message || "Skill Development Workshop removed successfully!"
        );
        fetchSWDData();
      } catch (error) {
        toast.error("Failed to remove Skill Development Workshop. Please try again.");
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
          `/fdpsMoocsSkillDevelopmentWorkshop/download/${fileName}`,
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
        `/fdpsMoocsSkillDevelopmentWorkshop/deleteFdpsMoocsSkillDevelopmentWorkshopDocument?fdpsMoocsSkillDevelopmentWorkshopDocumentId=${editId}`,
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
      facultyName: "",
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      file: null as File | string | null,
      startDate: "",
      endDate: "",
      titleOfFdp: "",
      orgInst: "",
      type: null as { value: string; label: string } | null,
    },
    validationSchema: Yup.object({
      facultyName: Yup.string().required("Please enter faculty name"),
      titleOfFdp: Yup.string().required(
        "Please enter Title of Skill Development Workshops"
      ),
      orgInst: Yup.string().required("Please enter Organizing Institution"),
      startDate: Yup.string()
        .required("Please select date")
        .matches(
          /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
          "Date must be in dd/mm/yyyy format"
        ),
      endDate: Yup.string()
        .required("Please select date")
        .matches(
          /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
          "Date must be in dd/mm/yyyy format"
        ),
      academicYear: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select academic year"),
      type: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select type"),
      stream: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select school"),
      department: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select department"),
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
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("year", values.academicYear?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("startDate", values.startDate || "");
      formData.append("endDate", values.endDate || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append("identity", values.type?.value || "");
      formData.append("id", editId || "");
      formData.append("otherDepartment", values.otherDepartment || "");
      formData.append("organizingInstitution", values.orgInst || "");
      formData.append("facultyName", values.facultyName || "");
      formData.append("title", values.titleOfFdp || "");
      formData.append("screenType", "skillDevelopment");

      if (isEditMode && typeof values.file === "string") {
        // Pass an empty PDF instead of null
        formData.append(
          "file",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.file === null) {
        formData.append(
          "file",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.file) {
        formData.append("file", values.file);
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/fdpsMoocsSkillDevelopmentWorkshop`,
            formData
          );
          toast.success(
            response.message || "Skill Development Workshop updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/fdpsMoocsSkillDevelopmentWorkshop",
            formData
          );
          toast.success(
            response.message || "Skill Development Workshop added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        setIsFileUploadDisabled(false); // Enable the file upload button
        // display the BOS List
        handleListSDWClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Skill Development Workshop. Please try again.");
        console.error("Error creating BOS:", error);
      }
    },
  });

  useEffect(() => {
    if (swdData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
      destroy: true,
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Skill_Development_Work_Data",
          title: "Skill Development Work Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Skill_Development_Work_Data",
          title: "Skill Development Work Data Export",
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
  }, [swdData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Staff Enhancement Programs"
            breadcrumbItem="Skill Development Workshop"
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
                      <Label>Faculty name</Label>
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
                        placeholder="Enter Faculty name"
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
                      <Label>Title of Skill Development Workshops</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.titleOfFdp &&
                          validation.errors.titleOfFdp
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.titleOfFdp}
                        onChange={(e) =>
                          validation.setFieldValue("titleOfFdp", e.target.value)
                        }
                        placeholder="Enter Title of Skill Development Workshops"
                      />
                      {validation.touched.titleOfFdp &&
                        validation.errors.titleOfFdp && (
                          <div className="text-danger">
                            {validation.errors.titleOfFdp}
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
                      <Label>Organizing Institution</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.orgInst &&
                          validation.errors.orgInst
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.orgInst}
                        onChange={(e) =>
                          validation.setFieldValue("orgInst", e.target.value)
                        }
                        placeholder="Enter Organizing Institution"
                      />
                      {validation.touched.orgInst &&
                        validation.errors.orgInst && (
                          <div className="text-danger">
                            {validation.errors.orgInst}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Type</Label>
                      <Select
                        options={Type}
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
                          {validation.errors.type}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Certificate of Completion/Participation of Skill
                        Development Workshop
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
                        onClick={handleListSDWClick}
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
        {/* Modal for Listing Skill Development Workshops */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Skill Development Workshops
          </ModalHeader>
          <ModalBody>
            <Table striped bordered hover id="id" innerRef={tableRef}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>School</th>
                  <th>Department</th>
                   <th>Faculty name</th>
                  <th>Title of Skill Development Workshops</th>
                  <th>Start date</th>
                  <th>End date</th>
                  <th>Organizing Institution</th>
                  <th>Type</th>
                  <th className="d-none">File</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {swdData.length > 0 ? (
                  swdData.map((bos, index) => (
                    <tr key={bos.id}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{bos.year}</td>
                      <td>{bos.streamName}</td>
                      <td>{bos.departmentName}</td>
                      <td>{bos.facultyName}</td>
                      <td>{bos.title}</td>
                      <td>{bos.startDate}</td>
                      <td>{bos.endDate}</td>
                      <td>{bos.organizingInstitution}</td>
                      <td>{bos.identity}</td>
                      <td className="d-none">{bos.filePath.file || "N/A"}</td>
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
                    <td colSpan={11} className="text-center">
                      No Skill Development Workshops available.
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

export default Skill_Development_Work;
