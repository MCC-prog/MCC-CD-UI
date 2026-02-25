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
  Tooltip,
} from "reactstrap";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast, ToastContainer } from "react-toastify";
import GetAllProgramDropdown from "Components/DropDowns/GetAllProgramDropdown";
import moment from "moment";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import Select from "react-select";
const api = new APIClient();

const StudentProgression_Competitive_Exams: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sceData, setSCEData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(sceData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipOpenIdProof, setTooltipOpenIdProof] = useState(false);
  const [tooltipOpenCompetitiveExam, setTooltipOpenCompetitiveExam] =
    useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const toggleTooltipIdProof = () => setTooltipOpenIdProof(!tooltipOpenIdProof);
  const toggleTooltipCompetitiveExam = () =>
    setTooltipOpenCompetitiveExam(!tooltipOpenCompetitiveExam);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [isFile2UploadDisabled, setIsFile2UploadDisabled] = useState(false);
  const [isFile3UploadDisabled, setIsFile3UploadDisabled] = useState(false);
  const [filters, setFilters] = useState({
    academicYear: null,
    noOfStaff: "",
    studentName: "",
    date: "",
    compExamName: "",
    proofOfCAE: "",
    stream: null,
    department: null,
    courses: "",
    status: null,
    excel: null,
  });
  const fileRef = useRef<HTMLInputElement | null>(null);
  const fileRef1 = useRef<HTMLInputElement | null>(null);
  const fileRef2 = useRef<HTMLInputElement | null>(null);
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

  // Fetch Student Progression - Competitive Exams from the backend
  const fetchSCEData = async () => {
    try {
      const response = await axios.get(
        "/studentProgressionCompetitiveExam/getAll"
      ); // Replace with your backend API endpoint
      setSCEData(response);
      setFilteredData(response);
    } catch (error) {
      console.error(
        "Error fetching Student Progression - Competitive Exams:",
        error
      );
    }
  };

  // Open the modal and fetch data
  const handleListBosClick = () => {
    toggleModal();
    fetchSCEData();
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

  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
  };

  const status = [
    { value: "Appeared", label: "Appeared" },
    { value: "Cleared", label: "Cleared" },
  ];

  // Handle edit action
  // Fetch the data for the selected BOS ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/studentProgressionCompetitiveExam/edit?competitiveExamId=${id}`,
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
        courses: response.courses
          ? Object.entries(response.courses).map(([key, value]) => ({
              value: key,
              label: String(value),
            }))
          : [],
        // noOfStaff: response.noOfStaff || "",
        // studentName: response.studentName || "",
        // date: response.date
        //   ? moment(response.date).format("DD/MM/YYYY") // Convert to dd/mm/yyyy format
        //   : "",
        // compExamName: response.competitiveExamName || "",
        // proofOfCAE: response.appearedForExam || "",
        // status: response.status
        //   ? { value: response.status, label: response.status }
        //   : null,
        excel: response.documents?.excel || null,
        idCard: response.documents?.idCard || null,
        // competitiveExam: response.documents?.competitiveExam || null,
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
        stream: mappedValues.stream
          ? { ...mappedValues.stream, value: String(mappedValues.stream.value) }
          : null,
        department: mappedValues.department
          ? {
              ...mappedValues.department,
              value: String(mappedValues.department.value),
            }
          : null,
        courses: mappedValues.courses || [],
        // noOfStaff: response.noOfStaff || "",
        // studentName: response.studentName || "",
        // date: response.date
        //   ? moment(response.date).format("DD/MM/YYYY") // Convert to dd/mm/yyyy format
        //   : "",
        // compExamName: response.competitiveExamName || "",
        // proofOfCAE: response.appearedForExam || "",
        // status: mappedValues.status
        //   ? {
        //       ...mappedValues.status,
        //       value: String(mappedValues.status.value),
        //     }
        //   : null,
        excel: response.documents?.excel || null, // Use the file from the response
        idCard: response.documents?.idCard || null,
        // competitiveExam: response.documents?.competitiveExam || null,
      });
      setSelectedStream(streamOption);
      setSelectedDepartment(departmentOption);
      setIsFileUploadDisabled(!!response.documents?.excel);
      setIsFile2UploadDisabled(!!response.documents?.idCard);
      // setIsFile3UploadDisabled(!!response.documents?.competitiveExam);
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error(
        "Error fetching Student Progression - Competitive Exams by ID:",
        error
      );
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Call the delete API and refresh the Student Progression - Competitive Exams
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/studentProgressionCompetitiveExam/deleteCompetitiveExam?competitiveExamId=${id}`,
          ""
        );
        setIsModalOpen(false);
        toast.success(
          response.message ||
            "Student Progression - Competitive Exams removed successfully!"
        );
        fetchSCEData();
      } catch (error) {
        toast.error(
          "Failed to remove Student Progression - Competitive Exams. Please try again."
        );
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
          `/studentProgressionCompetitiveExam/download/${fileName}`,
          {
            responseType: "blob",
          }
        );
        // Check if the response is valid

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
        `/studentProgressionCompetitiveExam/deleteCompetitiveExamDocument?competitiveExamId=${editId}&docType=${docType}`,
        ""
      );
      toast.success(response.message || "File deleted successfully!");
      if (docType === "excel") {
        validation.setFieldValue("excel", null);
        setIsFileUploadDisabled(false);
      } else if (docType === "idCard") {
        validation.setFieldValue("idCard", null);
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
      // noOfStaff: "",
      // studentName: "",
      // date: "",
      // compExamName: "",
      // proofOfCAE: "",
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      courses: [] as { value: string; label: string }[],
      // status: null as { value: string; label: string } | null,
      excel: null as File | string | null,
      idCard: null as File | string | null,
      // competitiveExam: null as File | string | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select academic year"),
      stream: Yup.object().nullable().required("Please select stream"),
      // studentName: Yup.string().required("Please enter area of guidance"),
      // compExamName: Yup.string().required("Please enter competitive exam name"),
      // proofOfCAE: Yup.string().required(
      //   "Please enter proof of Completion/Appeared for exam"
      // ),
      department: Yup.object().nullable().required("Please select department"),
      courses: Yup.array()
        .of(
          Yup.object().shape({
            value: Yup.string().required(),
            label: Yup.string().required(),
          })
        )
        .min(1, "Please select at least one program")
        .required("Please select program"),
      // status: Yup.object().nullable().required("Please select status"),
      excel: Yup.mixed()
        .required("Please upload a file")
        .test("fileSize", "File size is too large", (value: any) => {
          // Skip size validation if file is a string (from existing data)
          if (typeof value === "string") return true;
          return value && value.size <= 50 * 1024 * 1024; // 50MB
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
      idCard: Yup.mixed().test(
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
      // competitiveExam: Yup.mixed()
      //   .required("Please upload a file")
      //   .test("fileSize", "File size is too large", (value: any) => {
      //     // Skip size validation if file is a string (from existing data)
      //     if (typeof value === "string") return true;
      //     return value && value.size <= 50 * 1024 * 1024; // 50MB
      //   })
      //   .test("fileType", "Unsupported file format", (value: any) => {
      //     // Skip type validation if file is a string
      //     if (typeof value === "string") return true;
      //     return (
      //       value &&
      //       [
      //         "application/vnd.ms-excel",
      //         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      //       ].includes(value.type)
      //     );
      //   }),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("academicYear", values.academicYear?.value || "");
        // formData.append("studentName", values.studentName);
        // formData.append("competitiveExamName", values.compExamName);
        // formData.append("appearedForExam", values.proofOfCAE);
        formData.append("streamId", values.stream?.value || "");
        formData.append("departmentId", values.department?.value || "");
        values.courses.forEach((course, index) => {
          formData.append(`courseIds[${index}]`, course.value);
        });
        // formData.append("status", values.status?.value || "");
        // // If the date is provided, format it to YYYY-MM-DD
        // if (values.date) {
        //   const formattedDate = moment(values.date, "DD/MM/YYYY").format(
        //     "YYYY-MM-DD"
        //   );
        //   formData.append("date", formattedDate);
        // }
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

        if (isEditMode && typeof values.idCard === "string") {
          formData.append(
            "idCard",
            new Blob([], { type: "application/pdf" }),
          "empty.pdf"
          );
        } else if (isEditMode && values.idCard === null) {
          formData.append(
            "idCard",
           new Blob([], { type: "application/pdf" }),
          "empty.pdf"
          );
        } else if (values.idCard) {
          formData.append("idCard", values.idCard);
        }

        // if (isEditMode && typeof values.competitiveExam === "string") {
        //   formData.append(
        //     "competitiveExam",
        //     new Blob([], {
        //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        //     }),
        //     "empty.xlsx"
        //   );
        // } else if (isEditMode && values.competitiveExam === null) {
        //   formData.append(
        //     "competitiveExam",
        //     new Blob([], {
        //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        //     }),
        //     "empty.xlsx"
        //   );
        // } else if (values.competitiveExam) {
        //   formData.append("competitiveExam", values.competitiveExam);
        // }

        // If in edit mode, append the edit ID
        if (isEditMode && editId) {
          formData.append("competitiveExamId", editId);
        }
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/studentProgressionCompetitiveExam/update`,
            formData
          );
          toast.success(
            response.message ||
              "Student Progression - Competitive Exams updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/studentProgressionCompetitiveExam/save",
            formData
          );
          toast.success(
            response.message ||
              "Student Progression - Competitive Exams added successfully!"
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
        if (fileRef2.current) {
          fileRef2.current.value = "";
        }
        setIsFileUploadDisabled(false);
        setIsFile2UploadDisabled(false);
        // setIsFile3UploadDisabled(false);
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the BOS List
        handleListBosClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Student Progression - Competitive Exams. Please try again."
        );
        console.error("Error creating BOS:", error);
      }
    },
  });

  useEffect(() => {
    if (sceData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
      destroy: true,
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Student_Progression_Competitive_Exams_Data",
          title: "Student Progression - Competitive Exams Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Student_Progression_Competitive_Exams_Data",
          title: "Student Progression - Competitive Exams Data Export",
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
  }, [sceData]);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Student Activities & Support"
            breadcrumbItem="Student Progression - Competitive Exams"
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
                  {/* <Col sm={4}>
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
                        placeholder="Enter student name"
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

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Competitive Exam Name
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.compExamName &&
                          validation.errors.compExamName
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="compExamName"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "compExamName",
                            e.target.value
                          )
                        }
                        placeholder="Enter Competitive Exam Name"
                        value={validation.values.compExamName}
                      />
                      {validation.touched.compExamName &&
                        validation.errors.compExamName && (
                          <div className="text-danger">
                            {validation.errors.compExamName}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Status</Label>
                      <Select
                        options={status}
                        value={validation.values.status}
                        onChange={(selectedOptions) =>
                          validation.setFieldValue("status", selectedOptions)
                        }
                        placeholder="Select Status"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.status && validation.errors.status
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.status &&
                        validation.errors.status && (
                          <div className="text-danger">
                            {validation.errors.status}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Proof of Completion/Appeared for exam
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.proofOfCAE &&
                          validation.errors.proofOfCAE
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="proofOfCAE"
                        onChange={(e) =>
                          validation.setFieldValue("proofOfCAE", e.target.value)
                        }
                        placeholder="Enter Proof of Completion/Appeared for exam"
                        value={validation.values.proofOfCAE}
                      />
                      {validation.touched.proofOfCAE &&
                        validation.errors.proofOfCAE && (
                          <div className="text-danger">
                            {validation.errors.proofOfCAE}
                          </div>
                        )}
                    </div>
                  </Col> */}

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Template in Excel
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
                        Upload an Excel file. Max size 10MB.
                      </Tooltip>
                      <Input
                        className={`form-control ${
                          validation.touched.excel && validation.errors.excel
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        innerRef={fileRef}
                        onChange={(event) => {
                          validation.setFieldValue(
                            "excel",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.excel && validation.errors.excel && (
                        <div className="text-danger">
                          {validation.errors.excel}
                        </div>
                      )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
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
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload ID Card Proof
                        <i
                          id="infoIconIdProof"
                          className="bi bi-info-circle ms-2"
                          style={{ cursor: "pointer", color: "#0d6efd" }}
                        ></i>
                      </Label>
                      <Tooltip
                        placement="right"
                        isOpen={tooltipOpenIdProof}
                        target="infoIconIdProof"
                        toggle={toggleTooltipIdProof}
                      >
                        Merged PDF for Bulk Data.
                      </Tooltip>
                      <Input
                        className={`form-control ${
                          validation.touched.idCard && validation.errors.idCard
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        innerRef={fileRef1}
                        onChange={(event) => {
                          validation.setFieldValue(
                            "idCard",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFile2UploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.idCard &&
                        validation.errors.idCard && (
                          <div className="text-danger">
                            {validation.errors.idCard}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFile2UploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.idCard === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.idCard}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.idCard as string
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
                                validation.values.idCard as string,
                                "idCard"
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
                  {/* <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload student Details Competitive Exam
                        <i
                          id="infoIconCompetitiveExam"
                          className="bi bi-info-circle ms-2"
                          style={{ cursor: "pointer", color: "#0d6efd" }}
                        ></i>
                      </Label>
                      <Tooltip
                        placement="right"
                        isOpen={tooltipOpenCompetitiveExam}
                        target="infoIconCompetitiveExam"
                        toggle={toggleTooltipCompetitiveExam}
                      >
                        Bulk Data Upload in Excel.
                      </Tooltip>
                      <Input
                        className={`form-control ${
                          validation.touched.competitiveExam &&
                          validation.errors.competitiveExam
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        innerRef={fileRef2}
                        onChange={(event) => {
                          validation.setFieldValue(
                            "competitiveExam",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFile3UploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.competitiveExam &&
                        validation.errors.competitiveExam && (
                          <div className="text-danger">
                            {validation.errors.competitiveExam}
                          </div>
                        )}
                      {isFile3UploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {typeof validation.values.competitiveExam ===
                        "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.competitiveExam}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.competitiveExam as string
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
                                validation.values.competitiveExam as string,
                                "competitiveExam"
                              )
                            }
                            title="Delete File"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      )}
                    </div>
                  </Col> */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Excel Template</Label>
                      <div>
                        <a
                           href={`${process.env.PUBLIC_URL}/templateFiles/YEAR_DEPT NAME_COMPETITVE EXAM.xlsx`}
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
                        onClick={handleListBosClick}
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
            List Student Progression - Competitive Exams
          </ModalHeader>
          <ModalBody>
            <Table striped bordered hover id="id" innerRef={tableRef}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  {/* <th>Student Name</th> */}
                  <th>School</th>
                  <th>Department</th>
                  <th>Program</th>
                  {/* <th>Competitive Exam Name</th>
                  <th>Status</th> */}
                  <th className="d-none">File Path(Excel)</th>
                  <th className="d-none">File Path(ID Proof)</th>
                  <th className="d-none">File Path(Competitive Exam)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sceData.length > 0 ? (
                  sceData.map((bos, index) => (
                    <tr key={bos.competitiveExamId}>
                      <td>{index + 1}</td>
                      <td>{bos.academicYear}</td>
                      {/* <td>{bos.studentName}</td> */}
                      <td>{bos.streamName}</td>
                      <td>{bos.departmentName}</td>
                      <td>
                        <ul className="list-disc list-inside">
                          {Object.values(bos.courses).map((courseName, idx) => (
                            <li key={idx}>
                              {typeof courseName === "string" ||
                              typeof courseName === "number"
                                ? courseName
                                : String(courseName)}
                            </li>
                          ))}
                        </ul>
                      </td>
                      {/* <td>{bos.competitiveExamName}</td>
                      <td>{bos.status}</td> */}
                      <td className="d-none">
                        {bos.filePath?.competitiveExam || "N/A"}
                      </td>
                      <td className="d-none">
                        {bos.filePath?.idCard || "N/A"}
                      </td>
                      <td className="d-none">{bos.filePath?.excel || "N/A"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(bos.competitiveExamId)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(bos.competitiveExamId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={13} className="text-center">
                      No Student Progression - Competitive Exams available.
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

export default StudentProgression_Competitive_Exams;
