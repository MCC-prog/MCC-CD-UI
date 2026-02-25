import axios from "axios";
import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import ProgramDropdown from "Components/DropDowns/ProgramDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
import SemesterDropdowns from "Components/DropDowns/SemesterDropdowns";
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
import GetAllProgramDropdown from "Components/DropDowns/GetAllProgramDropdown";
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

const DetailsOfStudents_MOOC: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dosmData, setDOSMData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(dosmData);
  const [searchTerm, setSearchTerm] = useState("");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [isFile2UploadDisabled, setIsFile2UploadDisabled] = useState(false);
  const [filters, setFilters] = useState({
    academicYear: null,
    mccRegNo: "",
    studentName: "",
    offeredBy: "",
    moocCourseRegId: "",
    moocCoursePursued: "",
    duration: "",
    courses: "",
  });

  const fileRef = useRef<HTMLInputElement | null>(null);
  const file2Ref = useRef<HTMLInputElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Calculate the paginated data
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Details of Students Enrolled for MOOC from the backend
  const fetchDOSMData = async () => {
    try {
      const response = await axios.get("/studentsEnrolledForMooc/getAll"); // Replace with your backend API endpoint
      setDOSMData(response);
      setFilteredData(response);
    } catch (error) {
      console.error(
        "Error fetching Details of Students Enrolled for MOOC:",
        error
      );
    }
  };

  // Open the modal and fetch data
  const handleListDOSMClick = () => {
    toggleModal();
    fetchDOSMData();
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
  // Fetch the data for the selected Details of Students Enrolled for MOOCID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/studentsEnrolledForMooc/edit?competitiveExamId=${id}`,
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
        // courses: response.courses
        //   ? Object.entries(response.courses).map(([key, value]) => ({
        //       value: key,
        //       label: String(value),
        //     }))
        //   : [],
        // noOfStaff: response.noOfStaff || "",
        // mccRegNo: response.mccRegisterNo || "",
        // studentName: response.studentName || "",
        // offeredBy: response.offeredBy || "",
        // moocCourseRegId: response.moocCourseId || "",
        // moocCoursePursued: response.moocCoursePursued || "",
        // duration: response.duration || "",
        // courseDuration: response.courseDuration || "",
        file: response.documents.moocCertificate || null, // Assuming 'file' is a string or null
        excel: response.documents.excel || null, // Assuming 'file' is a string or null
      };

      // Update Formik values
      validation.setValues({
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
        stream: mappedValues.stream
          ? { ...mappedValues.stream, value: String(mappedValues.stream.value) }
          : null,
        department: mappedValues.department
          ? {
              ...mappedValues.department,
              value: String(mappedValues.department.value),
            }
          : null,
        // noOfStaff: response.noOfStaff || "",
        // mccRegNo: response.mccRegisterNo || "",
        // studentName: response.studentName || "",
        // offeredBy: response.offeredBy || "",
        // moocCourseRegId: response.moocCourseId || "",
        // moocCoursePursued: response.moocCoursePursued || "",
        // duration: response.duration || "",
        // courseDuration: response.courseDuration || "",
        file: response.documents.moocCertificate || null, // Assuming 'file' is a string or null
        excel: response.documents.excel || null, // Assuming 'file' is a string or null
        // courses: mappedValues.courses || [],
      });
      setIsFileUploadDisabled(!!response.documents.moocCertificate); // Disable file upload if a file exists
      setIsFile2UploadDisabled(!!response.documents.excel); // Disable file upload if a file exists
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error(
        "Error fetching Details of Students Enrolled for MOOC by ID:",
        error
      );
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Call the delete API and refresh the Details of Students Enrolled for MOOC
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/studentsEnrolledForMooc/deleteStudentsEnrolledForMooc?competitiveExamId=${id}`,
          ""
        );
        setIsModalOpen(false);
        toast.success(
          response.message ||
            "Details of Students Enrolled for MOOC removed successfully!"
        );
        fetchDOSMData();
      } catch (error) {
        toast.error(
          "Failed to remove Details of Students Enrolled for MOOC. Please try again."
        );
        console.error(
          "Error deleting Details of Students Enrolled for MOOC:",
          error
        );
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
          `/studentsEnrolledForMooc/download/${fileName}`,
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
  const handleDeleteFile = async (fileName: string, docType: string) => {
    try {
      const response = await api.delete(
        `/studentsEnrolledForMooc/deleteStudentsEnrolledForMoocDocument?competitiveExamId=${editId}&docType=${docType}`,
        ""
      );
      toast.success(response.message || "File deleted successfully!");
      if (docType === "moocCertificate") {
        validation.setFieldValue("file", null);
        setIsFileUploadDisabled(false); // Enable the file upload button
      } else if (docType === "excel") {
        validation.setFieldValue("excel", null);
        setIsFile2UploadDisabled(false); // Enable the file upload button
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
      // noOfStaff: "",
      // mccRegNo: "",
      // studentName: "",
      // offeredBy: "",
      // moocCourseRegId: "",
      // moocCoursePursued: "",
      // duration: "",
      // courseDuration: "",
      file: null as File | string | null,
      excel: null as File | string | null,
      // courses: [] as { value: string; label: string }[],
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select academic year"),
      stream: Yup.object().nullable().required("Please select school"),
      department: Yup.object().nullable().required("Please select department"),
      // mccRegNo: Yup.string().required("Please enter MCC Register number"),
      // studentName: Yup.string().required("Please enter student name"),
      // offeredBy: Yup.string().required("Please enter Mooc Offering Institute"),
      // moocCourseRegId: Yup.string().required(
      //   "Please enter Mooc Course Id/Registration Number"
      // ),
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
          if (value instanceof File && value.size > 500 * 1024 * 1024) {
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
      // moocCoursePursued: Yup.string().required(
      //   "Please enter Mooc Course Title"
      // ),
      excel: Yup.mixed()
        .required("Please upload a file")
        .test("fileSize", "File size is too large", (value: any) => {
          // Skip size validation if file is a string (from existing data)
          if (typeof value === "string") return true;
          return value && value.size <= 500 * 1024 * 1024; // 50MB
        })
        .test("fileType", "Unsupported file format", (value: any) => {
          // Skip type validation if file is a string
          if (typeof value === "string") return true;
          return (
            value &&
            [
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ].includes(value.type)
          );
        }),
      // duration: Yup.string().required("Please enter Duration"),
      // courses: Yup.array()
      //   .of(
      //     Yup.object().shape({
      //       value: Yup.string().required(),
      //       label: Yup.string().required(),
      //     })
      //   )
      //   .min(1, "Please select at least one program")
      //   .required("Please select program"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("academicYear", values.academicYear?.value || "");
        formData.append("streamId", values.stream?.value || "");
        formData.append("departmentId", values.department?.value || "");
        // formData.append("studentName", values.studentName);
        // formData.append("mccRegisterNo", values.mccRegNo);
        // formData.append("offeredBy", values.offeredBy);
        // formData.append("moocCourseId", values.moocCourseRegId);
        // formData.append("moocCoursePursued", values.moocCoursePursued);
        // formData.append("duration", values.duration);
        // values.courses.forEach((course, index) => {
        //   formData.append(`courseIds[${index}]`, course.value);
        // });
       formData.append("studentsEnrolledForMoocId", editId || "");


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

        if (isEditMode && typeof values.excel === "string") {
          formData.append(
            "excel",
            new Blob([], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            "empty.xlsx"
          );
        } else if (isEditMode && values.excel === null) {
          formData.append(
            "excel",
            new Blob([], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            "empty.xlsx"
          );
        } else if (values.excel) {
          formData.append("excel", values.excel);
        }
        // If in edit mode, append the edit ID
        if (isEditMode && editId) {
          formData.append("studentsEnrolledForMoocId", editId);
        }

        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/studentsEnrolledForMooc/update`,
            formData
          );
          toast.success(
            response.message ||
              "Details of Students Enrolled for MOOC updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/studentsEnrolledForMooc/save",
            formData
          );
          toast.success(
            response.message ||
              "Details of Students Enrolled for MOOC added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        if (file2Ref.current) {
          file2Ref.current.value = "";
        }
        setIsFileUploadDisabled(false);
        setIsFile2UploadDisabled(false);
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the Details of Students Enrolled for MOOC
        handleListDOSMClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Details of Students Enrolled for MOOC. Please try again."
        );
        console.error(
          "Error creating Details of Students Enrolled for MOOC:",
          error
        );
      }
    },
  });

  useEffect(() => {
    if (dosmData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
      destroy: true,
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Details_of_Students_Enrolled_for_MOOC_Data",
          title: "Details of Students Enrolled for MOOC Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Details_of_Students_Enrolled_for_MOOC_Data",
          title: "Details of Students Enrolled for MOOC Data Export",
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
  }, [dosmData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Student Activities & Support"
            breadcrumbItem="Details of Students Enrolled for MOOC"
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

                  {/* <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        MCC Register number
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.mccRegNo &&
                          validation.errors.mccRegNo
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="mccRegNo"
                        onChange={(e) =>
                          validation.setFieldValue("mccRegNo", e.target.value)
                        }
                        placeholder="Enter MCC Register number"
                        value={validation.values.mccRegNo}
                      />
                      {validation.touched.mccRegNo &&
                        validation.errors.mccRegNo && (
                          <div className="text-danger">
                            {validation.errors.mccRegNo}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Student Name
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.studentName &&
                          validation.errors.studentName
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="studentName"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "studentName",
                            e.target.value
                          )
                        }
                        placeholder="Enter Student Name"
                        value={validation.values.studentName}
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
                      <Label>Program</Label>
                      <GetAllProgramDropdown
                        value={validation.values.courses}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("courses", selectedOption)
                        }
                        isInvalid={
                          validation.touched.courses &&
                          !!validation.errors.courses
                        }
                      />
                      {validation.touched.courses &&
                        validation.errors.courses && (
                          <div className="text-danger">
                            {Array.isArray(validation.errors.courses)
                              ? validation.errors.courses.join(", ")
                              : validation.errors.courses}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Mooc Offering Institute
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.offeredBy &&
                          validation.errors.offeredBy
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="offeredBy"
                        onChange={(e) =>
                          validation.setFieldValue("offeredBy", e.target.value)
                        }
                        placeholder="Enter Mooc Offering Institute"
                        value={validation.values.offeredBy}
                      />
                      {validation.touched.offeredBy &&
                        validation.errors.offeredBy && (
                          <div className="text-danger">
                            {validation.errors.offeredBy}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Mooc Course Id/Registration Number
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.moocCourseRegId &&
                          validation.errors.moocCourseRegId
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="moocCourseRegId"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "moocCourseRegId",
                            e.target.value
                          )
                        }
                        placeholder="Enter Mooc Course Id/Registration Number"
                        value={validation.values.moocCourseRegId}
                      />
                      {validation.touched.moocCourseRegId &&
                        validation.errors.moocCourseRegId && (
                          <div className="text-danger">
                            {validation.errors.moocCourseRegId}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Mooc Course Title
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.moocCoursePursued &&
                          validation.errors.moocCoursePursued
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="moocCoursePursued"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "moocCoursePursued",
                            e.target.value
                          )
                        }
                        placeholder="Enter Mooc Course Title"
                        value={validation.values.moocCoursePursued}
                      />
                      {validation.touched.moocCoursePursued &&
                        validation.errors.moocCoursePursued && (
                          <div className="text-danger">
                            {validation.errors.moocCoursePursued}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Duration
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.duration &&
                          validation.errors.duration
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="duration"
                        onChange={(e) =>
                          validation.setFieldValue("duration", e.target.value)
                        }
                        placeholder="Enter Duration"
                        value={validation.values.duration}
                      />
                      {validation.touched.duration &&
                        validation.errors.duration && (
                          <div className="text-danger">
                            {validation.errors.duration}
                          </div>
                        )}
                    </div>
                  </Col> */}

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Certificate of Completion
                      </Label>
                      <Tooltip
                        placement="right"
                        open={tooltipOpen}
                        onClose={() => setTooltipOpen(false)}
                        onOpen={() => setTooltipOpen(true)}
                        title={<span>Upload pdf file. Max size 10MB.</span>}
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
                                "moocCertificate"
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
                        Upload Excel
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
                          validation.touched.excel && validation.errors.excel
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        innerRef={file2Ref}
                        onChange={(event) => {
                          validation.setFieldValue(
                            "excel",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFile2UploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.excel && validation.errors.excel && (
                        <div className="text-danger">
                          {validation.errors.excel}
                        </div>
                      )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFile2UploadDisabled && (
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
                          href={`${process.env.PUBLIC_URL}/templateFiles/moocs_template.xlsx`}
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
                        {isEditMode ? "Update" : "Save"}
                      </button>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={handleListDOSMClick}
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
        {/* Modal for Listing Details of Students Enrolled for MOOC*/}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Details of Students Enrolled for MOOC
          </ModalHeader>
          <ModalBody>
            <Table striped bordered hover id="id" innerRef={tableRef}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>School</th>
                  <th>Department</th>
                  {/* <th>MCC Register number</th>
                  <th>Student Name</th>
                  <th>Program</th>
                  <th>Mooc Offering Institute</th>
                  <th>Mooc Course Id/Registration Number</th>
                  <th>Mooc Course Title</th>
                  <th>Duration</th> */}
                  <th className="d-none">File Path</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dosmData.length > 0 ? (
                  dosmData.map((dosm, index) => (
                    <tr key={dosm.studentsEnrolledForMoocId}>
                      <td>{index + 1}</td>
                      <td>{dosm.academicYear}</td>
                      <td>{dosm.streamName}</td>
                      <td>{dosm.departmentName}</td>
                      {/* <td>{dosm.mccRegisterNo}</td>
                      <td>{dosm.studentName}</td>
                      <td>
                        <ul className="list-disc list-inside">
                          {Object.values(dosm.courses).map(
                            (courseName, idx) => (
                              <li key={idx}>
                                {typeof courseName === "string" ||
                                typeof courseName === "number"
                                  ? courseName
                                  : String(courseName)}
                              </li>
                            )
                          )}
                        </ul>
                      </td>
                      <td>{dosm.offeredBy}</td>
                      <td>{dosm.moocCourseId}</td>
                      <td>{dosm.moocCoursePursued}</td>
                      <td>{dosm.duration}</td> */}
                      <td className="d-none">
                        {dosm?.filePath.moocCertificate}
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() =>
                              handleEdit(dosm.studentsEnrolledForMoocId)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleDelete(dosm.studentsEnrolledForMoocId)
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
                    <td colSpan={13} className="text-center">
                      No Details of Students Enrolled for MOOC available.
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

export default DetailsOfStudents_MOOC;
