import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import { ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
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
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";

const api = new APIClient();

const Skill_Development_Workshop: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skillDevelopmentData, setSkillDevelopmentData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [filteredData, setFilteredData] = useState(skillDevelopmentData);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const fileRef1 = useRef<HTMLInputElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };


  const ModeType = [
    { value: "ONLINE", label: "ONLINE" },
    { value: "OFFLINE", label: "OFFLINE" },
    { value: "HYBRID", label: "HYBRID" },
  ];

  // Fetch Skill Development data from the backend
  const fetchSkillDevelopmentData = async () => {
    try {
      const response = await api.get(
        "/skillDevelopmentWorkshop/getAllSkillDevelopmentWorkshop",
        ""
      );
      const data = response?.data || response;
      if (Array.isArray(data)) {
        setSkillDevelopmentData(data);
        setFilteredData(data);
      } else {
        console.error("Unexpected response format:", response);
        setSkillDevelopmentData([]);
      }
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
        stream: response.streamId
          ? {
            value: response.streamId.toString(),
            label: response.streamName,
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
        mode: response.mode
          ? {
            value: response.mode,
            label: response.mode,
          }
          : null,
        skillDevelopmentDoc: response.skillDevelopmentDoc?.SkillDevelopment || null,
      });
      setSelectedStream(streamOption);
      setSelectedDepartment(departmentOption);
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      // Disable the file upload button if a file exists
      setIsFileUploadDisabled(!!response.skillDevelopmentDoc?.SkillDevelopment);
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
        setIsModalOpen(false);

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
  const handleDeleteFile = async (fileName: string) => {
    try {
      // Call the delete API
      const response = await api.delete(
        `/skillDevelopmentWorkshop/deleteSkillDevelopmentWorkshopDocument?fileName=${fileName}`,
        ""
      );
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      if (isEditMode) {
        // Clear the file field in edit mode
        validation.setFieldValue("skillDevelopmentDoc", null);
        setIsFileUploadDisabled(false); // Enable the file upload button
      }
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
      mode: null as { value: string; label: string } | null,
      skillDevelopmentDoc: null as string | null,
      // skillDevelopmentDetails: null as string | null,
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
      mode: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select Mode"),
      skillDevelopmentDoc: Yup.mixed().test(
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
      // skillDevelopmentDetails: Yup.mixed()
      //   .required("Please upload a file")
      //   .test("fileSize", "File size is too large", (value: any) => {
      //     return value && value.size <= 2 * 1024 * 1024; // 2MB limit
      //   })
      //   .test("fileType", "Unsupported file format", (value: any) => {
      //     return (
      //       value &&
      //       ["application/pdf", "image/jpeg", "image/png"].includes(value.type)
      //     );
      //   }),
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
      formData.append("mode", values.mode?.value || "");
      // Append the file
      if (isEditMode && typeof values.skillDevelopmentDoc === "string") {
        // Pass an empty Blob instead of null
        formData.append("skillDevelopmentDoc", new Blob([]), "empty.pdf");
      } else if (isEditMode && values.skillDevelopmentDoc === null) {
        formData.append("skillDevelopmentDoc", new Blob([]), "empty.pdf");
      } else if (values.skillDevelopmentDoc) {
        formData.append("skillDevelopmentDoc", values.skillDevelopmentDoc);
      }
      // if (isEditMode && typeof values.skillDevelopmentDetails === "string") {
      //   formData.append("skillDevelopmentDetails", new Blob([]), "empty.pdf");
      // } else if (isEditMode && values.skillDevelopmentDetails === null) {
      //   formData.append("skillDevelopmentDetails", new Blob([]), "empty.pdf");
      // } else if (values.skillDevelopmentDetails) {
      //   formData.append(
      //     "skillDevelopmentDetails",
      //     values.skillDevelopmentDetails
      //   );
      // }

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
        if (fileRef.current) {
          fileRef.current.value = "";
        }
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
  useEffect(() => {
    if (skillDevelopmentData.length === 0) return; // wait until data is loaded

    const table = $("#skillDevelopmentDataId").DataTable({
      destroy: true, // destroy existing instance if re-rendered
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Skill_Development_Workshop_Data",
          title: "Skill Development Workshop Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Skill_Development_Workshop_Data",
          title: "Skill Development Workshop Data Export",
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
  }, [skillDevelopmentData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Industry Collaboration"
            breadcrumbItem="Skill Development Program(conducted by college/Department)"
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
                        className={`form-control ${validation.touched.facultyName &&
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
                      <Label>Staff Enhancement Activity Type</Label>
                      <Select
                        options={StaffEnhancementProgramType}
                        value={validation.values.staffEnhancementProgramType}
                        onChange={(selectedOption) =>
                          validation.setFieldValue(
                            "staffEnhancementProgramType",
                            selectedOption
                          )
                        }
                        placeholder="Select Staff Enhancement Activity Type"
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
                        className={`form-control ${validation.touched.title && validation.errors.title
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
                      <Label>Collaborating Organization / Department</Label>
                      <Input
                        type="text"
                        className={`form-control ${validation.touched.organizedBy &&
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
                        placeholder="Enter Collaborating Organization / Department"
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
                        className={`form-control ${validation.touched.fromDate &&
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
                        className={`form-control ${validation.touched.toDate && validation.errors.toDate
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Mode Type</Label>
                      <Select
                        options={ModeType}
                        value={validation.values.mode}
                        onChange={(selectedOption) =>
                          validation.setFieldValue(
                            "mode",
                            selectedOption
                          )
                        }
                        placeholder="Select Staff Mode Type"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.mode &&
                            validation.errors.mode
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.mode &&
                        validation.errors.mode && (
                          <div className="text-danger">
                            {validation.errors.mode}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Report
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
                        className={`form-control ${validation.touched.skillDevelopmentDoc &&
                          validation.errors.skillDevelopmentDoc
                          ? "is-invalid"
                          : ""
                          }`}
                        type="file"
                        id="formFile"
                        innerRef={fileRef}
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
                              onClick={() => handleDeleteFile(validation.values.skillDevelopmentDoc as string)}
                              title="Delete File"
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        )}
                    </div>
                  </Col>
                  
                  {/* <Col lg={4}>
                    <div className="mb-3">
                      <Label>Report Template</Label>
                      <div>
                        <a
                          href={`${process.env.PUBLIC_URL}/templateFiles/Industry_collaboration _ skill_enhancement.docx`}
                          download
                          className="btn btn-primary btn-sm"
                        >
                          Report Template
                        </a>
                      </div>
                    </div>
                  </Col> */}
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
            <Table
              striped
              bordered
              hover
              id="skillDevelopmentDataId"
              innerRef={tableRef}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>Schools</th>
                  <th>Department</th>
                  <th>Faculty Name</th>
                  <th>Staff Enhancement Activity Type</th>
                  <th>Title</th>
                  <th>Collaborating Organization / Department</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Mode Type</th>
                   <th className="d-none">Report File Path</th> {/* Hidden */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {skillDevelopmentData.length > 0 ? (
                  skillDevelopmentData.map((skillDevelopment, index) => (
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
                      <td>{skillDevelopment.mode}</td>
                      <td className="d-none">{skillDevelopment?.filePath?.SkillDevelopment || "N/A"}</td> {/* Hidden */}
                      <td>
                        <div className="d-flex justify-content-center gap-2">
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
                        </div>
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

export default Skill_Development_Workshop;
