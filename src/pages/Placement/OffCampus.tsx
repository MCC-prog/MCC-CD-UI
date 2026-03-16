import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import ProgramDropdown from "Components/DropDowns/ProgramDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
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
<<<<<<< HEAD
=======
import { ex } from "@fullcalendar/core/internal-common";
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181

const api = new APIClient();

const OffCampus: React.FC = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variable for managing file upload status
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
<<<<<<< HEAD
=======
  const [isExcelUploadDisabled, setIsExcelUploadDisabled] = useState(false);
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
  // State variable for managing the modal for listing Off-Campus placement
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State variable for managing the list of Off-Campus placement data
  const [campusData, setCampusData] = useState<any[]>([]);
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  // State variable for managing program options in the dropdown
  // This will be used to populate the program dropdown based Off selected program
  const [programOptions, setProgramOptions] = useState<
    { value: string; label: string }[]
  >([]);
  // State variable for managing search term and pagination

  const [filteredData, setFilteredData] = useState(campusData);
  const tableRef = useRef<HTMLTableElement>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);
<<<<<<< HEAD
=======
   const fileRef1 = useRef<HTMLInputElement | null>(null);
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181

  // Toggle the modal for listing Off-Campus placement
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Off-Campus placement data from the backend
  const fetchOnCampusPlacementData = async () => {
    try {
      const response = await api.get(
        "/onOffCampusPlacementData/getAllOnOffCampusPlacementData?screenType=off",
        ""
      );
      setCampusData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Off-Campus placement data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListOnCampusClick = () => {
    toggleModal();
    fetchOnCampusPlacementData();
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
  // Fetch the data for the selected Off-Campus placement ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/onOffCampusPlacementData?OnOffCampusPlacementDataId=${id}&screenType=off`,
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
<<<<<<< HEAD
            value: response.departmentId.toString(),
            label: response.departmentName,
          }
          : null,
        programType: response.programTypeId
          ? {
            value: response.programTypeId.toString(),
            label: response.programTypeName,
          }
=======
              value: response.departmentId.toString(),
              label: response.departmentName,
            }
          : null,
        programType: response.programTypeId
          ? {
              value: response.programTypeId.toString(),
              label: response.programTypeName,
            }
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
          : null,

        otherDepartment: "",
      };

      // Update Formik values
      validation.setValues({
        ...mappedValues,
        file: response.documents?.mom || null,
<<<<<<< HEAD
        academicYear: mappedValues.academicYear
          ? {
            ...mappedValues.academicYear,
            value: String(mappedValues.academicYear.value),
          }
          : null,
        program: response.programId
          ? {
            value: response.programId.toString(),
            label: response.programName,
          }
=======
        excel: response.documents?.excel || null,
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
         degree: response.programId
          ? {
              value: response.programId.toString(),
              label: response.programName,
            }
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
          : null,
      });
      // In your handleEdit, after setting Formik values:
      if (response.file?.file) {
        validation.setFieldValue("file", response.file.file);
        setIsFileUploadDisabled(true);
      } else {
        validation.setFieldValue("file", null);
        setIsFileUploadDisabled(false);
      }
<<<<<<< HEAD
=======
       if (response.file?.excel) {
        validation.setFieldValue("excel", response.file.excel);
        setIsExcelUploadDisabled(true);
      } else {
        validation.setFieldValue("excel", null);
        setIsExcelUploadDisabled(false);
      }
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
      setIsEditMode(true);
      setEditId(id);
      toggleModal();
    } catch (error) {
      console.error("Error fetching Off-Campus placement data by ID:", error);
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the Off-Campus placement data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/onOffCampusPlacementData/deleteOnOffCampusPlacementData?onOffCampusPlacementDataId=${id}`,
          ""
        );
        setIsModalOpen(false);

        toast.success(
<<<<<<< HEAD
          response.message || "Off-Campus placement removed successfully!"
=======
         "Off-Campus placement removed successfully!"
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
        );
        fetchOnCampusPlacementData();
      } catch (error) {
        toast.error("Failed to remove Off-Campus placement. Please try again.");
        console.error("Error deleting Off-Campus placement:", error);
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
          `/onOffCampusPlacementData/download/${fileName}`,
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
<<<<<<< HEAD
  const handleDeleteFile = async (fileName: string) => {
=======
  const handleDeleteFile = async (fileName: string, fieldType?: string) => {
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
    try {
      // Call the delete API
      const response = await api.delete(
        `/onOffCampusPlacementData/deleteOnOffCampusPlacementDataDocument?fileName=${fileName}`,
        ""
      );
      // Show success message
<<<<<<< HEAD
toast.success(response.message || "File deleted successfully!");
      // Remove the file from the form
      validation.setFieldValue("file", null); // Clear the file from Formik state
      setIsFileUploadDisabled(false); // Enable the file upload button
      validation.setFieldValue("file", null);
      setIsFileUploadDisabled(false);
=======
      toast.success(response.message || "File deleted successfully!");
      // Remove the file from the form
      if (fieldType === "excel") {
        validation.setFieldValue("excel", null); // Clear the excel file from Formik state
        setIsExcelUploadDisabled(false); // Enable the excel upload button
      } else {
        validation.setFieldValue("file", null); // Clear the file from Formik state
        setIsFileUploadDisabled(false); // Enable the file upload button
      }
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
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
      file: null as File | string | null,
<<<<<<< HEAD
      programType: null as { value: string; label: string } | null,
      program: null as { value: string; label: string } | null,
=======
      excel: null as File | string | null,
      programType: null as { value: string; label: string } | null,
    degree: null as { value: string; label: string } | null,
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select academic year"),
      stream: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select school"),
      programType: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select program type"),
<<<<<<< HEAD
      program: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select programs"),
=======
      degree: Yup.object<{ value: string; label: string }>()
             .nullable()
             .required("Please select degree"),
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
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
<<<<<<< HEAD
      file: Yup.mixed()
=======
      excel: Yup.mixed()
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
        .required("Please upload a file")
        .test(
          "fileType",
          "Only Excel files (.xls, .xlsx) or CSV files (.csv) are allowed",
          function (value) {
            if (isFileUploadDisabled) {
              return true;
            }
            if (!value) {
              return this.createError({ message: "Please upload a file" });
            }
            if (typeof value === "string") {
              return true;
            }
<<<<<<< HEAD
            if (value instanceof File && value.size > 2 * 1024 * 1024) {
=======
            if (value instanceof File && value.size > 10 * 1024 * 1024) {
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
              return this.createError({ message: "File size is too large" });
            }
            const allowedTypes = [
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "text/csv",
<<<<<<< HEAD
              "application/csv"
            ];
            const allowedExtensions = [".xls", ".xlsx", ".csv"];
            const fileName = value instanceof File ? value.name : "";
            const hasValidExtension = allowedExtensions.some(ext =>
=======
              "application/csv",
            ];
            const allowedExtensions = [".xls", ".xlsx", ".csv"];
            const fileName = value instanceof File ? value.name : "";
            const hasValidExtension = allowedExtensions.some((ext) =>
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
              fileName.toLowerCase().endsWith(ext)
            );
            if (
              value instanceof File &&
              !allowedTypes.includes(value.type) &&
              !hasValidExtension
            ) {
              return this.createError({
<<<<<<< HEAD
                message: "Only Excel files (.xls, .xlsx) or CSV files (.csv) are allowed"
=======
                message:
                  "Only Excel files (.xls, .xlsx) or CSV files (.csv) are allowed",
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
              });
            }
            return true;
          }
<<<<<<< HEAD
        )
=======
        ),

     file: Yup.mixed()
       .required("Please upload a ZIP file")
       .test("fileExtension", "Only .zip file allowed", (value) => {
         if (!value || typeof value === "string") return true;
         if (value instanceof File) {
           return value.name.toLowerCase().endsWith(".zip");
         }
         return true;
       })
       .test("fileSize", "File size must be less than 500 MB", (value) => {
         if (!value || typeof value === "string") return true;
         if (value instanceof File) {
           return value.size <= 500 * 1024 * 1024; // ⬅️ 500 MB limit
         }
         return true;
       }),
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("programTypeId", values.programType?.value || "");
      formData.append("streamId", values.stream?.value || "");
<<<<<<< HEAD
      formData.append("programId", values.program?.value || "");
=======
     formData.append("programId", values.degree?.value || "");
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
      formData.append("id", editId || "");
      formData.append("otherDepartment", values.otherDepartment || "");
      formData.append("screenType", "off");

<<<<<<< HEAD
      if (isEditMode && typeof values.file === "string") {
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

=======
       if (isEditMode && typeof values.excel === "string") {
        formData.append(
          "excel",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.excel === null) {
        formData.append(
          "excel",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.excel) {
        formData.append("excel", values.excel);
      }

      if (isEditMode && typeof values.file === "string") {
        // Existing file in DB → keep empty placeholder
        formData.append(
          "file",
          new Blob([], { type: "application/octet-stream" }),
          "empty.zip"
        );
      } else if (isEditMode && values.file === null) {
        // No new file chosen in edit mode → send empty placeholder
        formData.append(
          "file",
          new Blob([], { type: "application/octet-stream" }),
          "empty.zip"
        );
      } else if (values.file instanceof File) {
        // User uploaded a ZIP file
        formData.append("file", values.file);
      } else {
        // Fallback
        formData.append(
          "file",
          new Blob([], { type: "application/octet-stream" }),
          "empty.zip"
        );
      }
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/onOffCampusPlacementData`, formData);
          toast.success(
<<<<<<< HEAD
            response.message || "Off-Campus placement updated successfully!"
=======
             "Off-Campus placement updated successfully!"
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/onOffCampusPlacementData",
            formData
          );
          toast.success(
<<<<<<< HEAD
            response.message || "Off-Campus placement added successfully!"
=======
            "Off-Campus placement added successfully!"
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
<<<<<<< HEAD
        setIsFileUploadDisabled(false); // Enable file upload for new entries
=======
          if (fileRef1.current) {
          fileRef1.current.value = "";
        }
        setIsFileUploadDisabled(false); // Enable file upload for new entries
        setIsExcelUploadDisabled(false);
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the Off-Campus placement List
        handleListOnCampusClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Off-Campus placement. Please try again.");
        console.error("Error creating Off-Campus placement:", error);
      }
    },
  });

<<<<<<< HEAD
  // Fetch programs when programType changes
  useEffect(() => {
    const fetchPrograms = async () => {
      if (
        validation.values.programType &&
        validation.values.programType.value
      ) {
        try {
          const response = await api.get(
            `/ProgramsByProgramTypeId?programTypeId=${validation.values.programType.value}`,
            ""
          );
          const options = (response || []).map((item: any) => ({
            value: item.id.toString(),
            label: item.name,
          }));
          setProgramOptions(options);
        } catch (error) {
          setProgramOptions([]);
        }
      } else {
        setProgramOptions([]);
      }
    };
    fetchPrograms();
  }, [validation.values.programType]);

=======
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
  useEffect(() => {
    if (campusData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
      destroy: true, // destroy existing instance if re-rendered
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
<<<<<<< HEAD
=======
          filename: "Off_Campus_Placement_Data",
          title: "Off Campus Placement Data Export",
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
<<<<<<< HEAD
=======
          filename: "Off_Campus_Placement_Data",
          title: "Off Campus Placement Data Export",
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
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
  }, [campusData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Placement"
            breadcrumbItem="Off Campus Placement Data"
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
<<<<<<< HEAD
                          className={`form-control ${validation.touched.otherDepartment &&
                            validation.errors.otherDepartment
                            ? "is-invalid"
                            : ""
                            }`}
=======
                          className={`form-control ${
                            validation.touched.otherDepartment &&
                            validation.errors.otherDepartment
                              ? "is-invalid"
                              : ""
                          }`}
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
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
<<<<<<< HEAD
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Program</Label>
                      <Input
                        type="select"
                        name="program"
                        value={validation.values.program?.value || ""}
                        onChange={(e) => {
                          const selected = programOptions.find(
                            (opt) => opt.value === e.target.value
                          );
                          validation.setFieldValue("program", selected || null);
                        }}
                        className={
                          validation.touched.program &&
                            validation.errors.program
                            ? "is-invalid"
                            : ""
                        }
                      >
                        <option value="">Select Program</option>
                        {programOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Input>
                      {validation.touched.program &&
                        validation.errors.program && (
                          <div className="text-danger">
                            {typeof validation.errors.program === "string"
                              ? validation.errors.program
                              : ""}
=======
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
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
<<<<<<< HEAD
                        Upload Placement Details
                      </Label>
                      <Input
                        className={`form-control ${validation.touched.file && validation.errors.file ? "is-invalid" : ""}`}
                        type="file"
                        id="formFile"
                        innerRef={fileRef}
                        onChange={(event) => {
                          const file = event.currentTarget.files ? event.currentTarget.files[0] : null;
                          validation.setFieldTouched("file", true, true);
                          validation.setFieldValue("file", file, true);

                          // Reset file input if invalid file is selected
                          if (
                            file &&
                            ![".xls", ".xlsx", ".csv"].some(ext => file.name.toLowerCase().endsWith(ext))
                          ) {
                            event.target.value = "";
                          }
=======
                        Upload Proof (compiled Pdf in .zip format)
                      </Label>
                      <Input
                        type="file"
                        accept=".zip"
                        innerRef={fileRef}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0] ?? null;
                          validation.setFieldValue("file", file);
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
                        }}
                        disabled={isFileUploadDisabled}
                      />
                      {validation.touched.file && validation.errors.file && (
                        <div className="text-danger">
                          {validation.errors.file}
                        </div>
                      )}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Show file name, download, and delete buttons if file is a string */}
                      {typeof validation.values.file === "string" &&
                        validation.values.file && (
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
                                  validation.values.file as string
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
<<<<<<< HEAD
=======
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Off Campus Excel
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.excel && validation.errors.excel
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        innerRef={fileRef1}
                        accept=".xls, .xlsx"
                        onChange={(event) => {
                          validation.setFieldValue(
                            "excel",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isExcelUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.excel && validation.errors.excel && (
                        <div className="text-danger">
                          {validation.errors.excel}
                        </div>
                      )}
                      {/* Show a message if the file upload button is disabled */}
                      {isExcelUploadDisabled &&
                        typeof validation.values.excel === "string" && (
                          <div className="text-warning mt-2">
                            Please remove the existing file to upload a new one.
                          </div>
                        )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.excel === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.excel}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.excel as string
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
                                validation.values.excel as string,
                                "excel"
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
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Download Template</Label>
                      <div>
                        <a
<<<<<<< HEAD
                          href="/templateFiles/bos.pdf"
=======
                          href={`${process.env.PUBLIC_URL}/templateFiles/YEAR_DEPT_OFF CAMPUS.xlsx`}
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
                          download
                          className="btn btn-primary btn-sm"
                        >
                          Placement Details
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
                        onClick={handleListOnCampusClick}
                      >
                        List Off-Campus placement details
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Off-Campus placement */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Off-Campus placement
          </ModalHeader>
          <ModalBody>
<<<<<<< HEAD
            <Table
              striped
              bordered
              hover
              id="id"
              innerRef={tableRef}
            >
=======
            <Table striped bordered hover id="id" innerRef={tableRef}>
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
              <thead>
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
<<<<<<< HEAD
                  <th>Stream</th>
=======
                  <th>School</th>
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
                  <th>Department</th>
                  <th>Program Type</th>
                  <th>Program</th>
                  <th className="d-none">File Path</th> {/* Hidden */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campusData.length > 0 ? (
                  campusData.map((campus, index) => (
                    <tr key={campus.id}>
                      <td>{index + 1}</td>
                      <td>{campus.academicYear}</td>
                      <td>{campus.streamName}</td>
                      <td>{campus.departmentName}</td>
                      <td>{campus.programTypeName}</td>
                      <td>{campus.programName}</td>
<<<<<<< HEAD
                      <td className="d-none">{campus?.filePath?.file || "N/A"}</td> {/* Hidden */}
=======
                      <td className="d-none">
                        {campus?.filePath?.file || "N/A"}
                      </td>{" "}
                      {/* Hidden */}
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(campus.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(campus.id)}
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
                      No Off-Campus Placement data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </ModalBody>
        </Modal>
        {/* Confirmation Modal */}
        <Modal
<<<<<<< HEAD
=======
          className="delete-popup"
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
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

export default OffCampus;
