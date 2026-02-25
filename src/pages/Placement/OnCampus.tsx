import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
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
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import ProgramDropdown from "Components/DropDowns/ProgramDropdown";

const api = new APIClient();

const OnCampus: React.FC = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variable for managing file upload status
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [isExcelUploadDisabled, setIsExcelUploadDisabled] = useState(false);
  // State variable for managing the modal for listing On-Campus placement
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State variable for managing the list of On-Campus placement data
  const [campusData, setCampusData] = useState<any[]>([]);
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  // State variable for managing program options in the dropdown
  // This will be used to populate the program dropdown based on selected program
  const [programOptions, setProgramOptions] = useState<
    { value: string; label: string }[]
  >([]);
  // State variable for managing search term and pagination
  const [filteredData, setFilteredData] = useState(campusData);
  const tableRef = useRef<HTMLTableElement>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const fileRef1 = useRef<HTMLInputElement | null>(null);

  // Toggle the modal for listing On-Campus placement
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch On-Campus placement data from the backend
  const fetchOnCampusPlacementData = async () => {
    try {
      const response = await api.get(
        "/onOffCampusPlacementData/getAllOnOffCampusPlacementData?screenType=on",
        ""
      );
      setCampusData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching On-Campus placement data:", error);
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
  // Fetch the data for the selected On-Campus placement ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/onOffCampusPlacementData?OnOffCampusPlacementDataId=${id}&screenType=on`,
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
        programType: response.programTypeId
          ? {
              value: response.programTypeId.toString(),
              label: response.programTypeName,
            }
          : null,

        otherDepartment: "",
      };

      // Update Formik values
      validation.setValues({
        ...mappedValues,
        file: response.documents?.file || null,
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
      if (response.file?.excel) {
        validation.setFieldValue("excel", response.file.excel);
        setIsExcelUploadDisabled(true);
      } else {
        validation.setFieldValue("excel", null);
        setIsExcelUploadDisabled(false);
      }
      setIsEditMode(true);
      setEditId(id);
      toggleModal();
    } catch (error) {
      console.error("Error fetching On-Campus placement data by ID:", error);
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the On-Campus placement data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/onOffCampusPlacementData/deleteOnOffCampusPlacementData?onOffCampusPlacementDataId=${id}`,
          ""
        );
        setIsModalOpen(false);

        toast.success(
         "On-Campus placement removed successfully!"
        );
        fetchOnCampusPlacementData();
      } catch (error) {
        toast.error("Failed to remove On-Campus placement. Please try again.");
        console.error("Error deleting On-Campus placement:", error);
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
  const handleDeleteFile = async (fileName: string, fieldType?: string) => {
    try {
      // Call the delete API
      const response = await api.delete(
        `/onOffCampusPlacementData/deleteOnOffCampusPlacementDataDocument?fileName=${fileName}`,
        ""
      );
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      if (fieldType === "excel") {
        validation.setFieldValue("excel", null); // Clear the excel file from Formik state
        setIsExcelUploadDisabled(false); // Enable the excel upload button
      } else {
        validation.setFieldValue("file", null); // Clear the file from Formik state
        setIsFileUploadDisabled(false); // Enable the file upload button
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
      // file: null as File | string | null,
      file: null as FileList | File | string | null,
      excel: null as File | string | null,

      programType: null as { value: string; label: string } | null,
      degree: null as { value: string; label: string } | null,
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
      degree: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select degree"),
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
      excel: Yup.mixed()
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
            if (value instanceof File && value.size > 10 * 1024 * 1024) {
              return this.createError({ message: "File size is too large" });
            }
            const allowedTypes = [
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "text/csv",
              "application/csv",
            ];
            const allowedExtensions = [".xls", ".xlsx", ".csv"];
            const fileName = value instanceof File ? value.name : "";
            const hasValidExtension = allowedExtensions.some((ext) =>
              fileName.toLowerCase().endsWith(ext)
            );
            if (
              value instanceof File &&
              !allowedTypes.includes(value.type) &&
              !hasValidExtension
            ) {
              return this.createError({
                message:
                  "Only Excel files (.xls, .xlsx) or CSV files (.csv) are allowed",
              });
            }
            return true;
          }
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

    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("programTypeId", values.programType?.value || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append("programId", values.degree?.value || "");
      formData.append("id", editId || "");
      formData.append("otherDepartment", values.otherDepartment || "");
      formData.append("screenType", "on");

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

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/onOffCampusPlacementData`, formData);
          toast.success(
              "On-Campus placement updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/onOffCampusPlacementData",
            formData
          );
          toast.success(
           "On-Campus placement added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        if (fileRef1.current) {
          fileRef1.current.value = "";
        }
        setIsFileUploadDisabled(false);
        setIsExcelUploadDisabled(false);
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the On-Campus placement List
        handleListOnCampusClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save On-Campus placement. Please try again.");
        console.error("Error creating On-Campus placement:", error);
      }
    },
  });

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
          filename: "On_Campus_Placement_Data",
          title: "On Campus Placement Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "On_Campus_Placement_Data",
          title: "On Campus Placement Data Export",
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
            breadcrumbItem="On Campus Placement Data"
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
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload  Upload Proof (compiled Pdf in .zip format)
                      </Label>
                      <Input
                        type="file"
                        accept=".zip"
                        innerRef={fileRef}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0] ?? null;
                          validation.setFieldValue("file", file);
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Download Template</Label>
                      <div>
                        <a
                           href={`${process.env.PUBLIC_URL}/templateFiles/YEAR_DEPT_ON CAMPUS.xlsx`}
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
                        List On-Campus placement details
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing On-Campus placement */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List On-Campus placement
          </ModalHeader>
          <ModalBody>
            <Table striped bordered hover id="id" innerRef={tableRef}>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>School</th>
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
                      <td className="d-none">
                        {campus?.filePath?.file || "N/A"}
                      </td>{" "}
                      {/* Hidden */}
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
                      No On-Campus Placement data available.
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

export default OnCampus;
