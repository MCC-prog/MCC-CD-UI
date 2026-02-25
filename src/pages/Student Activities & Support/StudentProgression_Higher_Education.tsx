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

const StudentProgression_Higher_Education: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sheData, setSHEData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(sheData);
  const [searchTerm, setSearchTerm] = useState("");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipOpenIdProof, setTooltipOpenIdProof] = useState(false);
  const [tooltipOpenHigherEducation, setTooltipOpenHigherEducation] =
    useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const toggleTooltipIdProof = () => setTooltipOpenIdProof(!tooltipOpenIdProof);
  const toggleTooltipHigherEducation = () =>
    setTooltipOpenHigherEducation(!tooltipOpenHigherEducation);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [isFile2UploadDisabled, setIsFile2UploadDisabled] = useState(false);
  const [isFile3UploadDisabled, setIsFile3UploadDisabled] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const fileRef1 = useRef<HTMLInputElement | null>(null);
  const fileRef2 = useRef<HTMLInputElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = sheData.filter((row) =>
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

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Student Progression - Higher Education from the backend
  const fetchSHEData = async () => {
    try {
      const response = await axios.get(
        "/studentProgressionHigherEducation/getAll"
      ); // Replace with your backend API endpoint
      setSHEData(response);
      setFilteredData(response);
    } catch (error) {
      console.error(
        "Error fetching Student Progression - Higher Education:",
        error
      );
    }
  };

  // Open the modal and fetch data
  const handleListSHEClick = () => {
    toggleModal();
    fetchSHEData();
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
  // Fetch the data for the selected Student Progression - Higher EducationID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/studentProgressionHigherEducation/edit?higherEducationId=${id}`,
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
        // mccRegNo: response.mccRegisterNo || "",
        // studentName: response.studentName || "",
        // coursePurused: response.coursePursuedInMcc || "",
        // heigherEduCu: response.higherEducationCourse || "",
        // university: response.university || "",
        // location: response.location || "",
        // icalepal: response.enrollmentProof || "",
        // courseDuration: response.courseDuration || "",
        file: response.documents.excel || null, // Assuming 'file' is a string or null
        idCard: response.documents?.idCard || null,
        // higherEducation: response.documents?.higherEducation || null,
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
        // mccRegNo: response.mccRegisterNo || "",
        // studentName: response.studentName || "",
        // coursePurused: response.coursePursuedInMcc || "",
        // heigherEduCu: response.higherEducationCourse || "",
        // university: response.university || "",
        // location: response.location || "",
        // icalepal: response.enrollmentProof || "",
        // courseDuration: response.courseDuration || "",
        file: response.documents.excel || null, // Assuming 'file' is a string or null
        idCard: response.documents?.idCard || null,
        // higherEducation: response.documents?.higherEducation || null,
      });
      setIsFileUploadDisabled(!!response.documents?.excel); // Disable file upload if a file exists
      setIsFile2UploadDisabled(!!response.documents?.idCard); // Disable file upload if a file exists
      // setIsFile3UploadDisabled(!!response.documents?.higherEducation); // Disable file upload if a file exists
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error(
        "Error fetching Student Progression - Higher Education by ID:",
        error
      );
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Call the delete API and refresh the Student Progression - Higher Education
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/studentProgressionHigherEducation/deleteHigherEducation?higherEducationId=${id}`,
          ""
        );
        setIsModalOpen(false);
        toast.success(
          response.message ||
            "Student Progression - Higher Education removed successfully!"
        );
        fetchSHEData();
      } catch (error) {
        toast.error(
          "Failed to remove Student Progression - Higher Education. Please try again."
        );
        console.error(
          "Error deleting Student Progression - Higher Education:",
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
          `/studentProgressionHigherEducation/download/${fileName}`,
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
        `/studentProgressionHigherEducation/deleteHigherEducationDocument?higherEducationId=${editId}&docType=${docType}`,
        ""
      );
toast.success(response.message || "File deleted successfully!");
      if (docType === "excel") {
        validation.setFieldValue("file", null);
        setIsFileUploadDisabled(false); // Enable the file upload button
      } else if (docType === "idCard") {
        validation.setFieldValue("idCard", null);
        setIsFile2UploadDisabled(false); // Enable the file upload button
      }
      // } else if (docType === "higherEducation") {
      //   validation.setFieldValue("higherEducation", null);
      //   setIsFile3UploadDisabled(false); // Enable the file upload button
      // }
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
      // mccRegNo: "",
      // studentName: "",
      // coursePurused: "",
      // heigherEduCu: "",
      // university: "",
      // location: "",
      // icalepal: "",
      // courseDuration: "",
      file: null as File | string | null,
      idCard: null as File | string | null,
      // higherEducation: null as File | string | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select academic year"),
      stream: Yup.object().nullable().required("Please select stream"),
      department: Yup.object().nullable().required("Please select department"),
      // mccRegNo: Yup.string().required("Please enter MCC Register number"),
      // studentName: Yup.string().required("Please enter student name"),
      // coursePurused: Yup.string().required(
      //   "Please enter course pursued in MCC"
      // ),
      // heigherEduCu: Yup.string().required(
      //   "Please enter higher education course"
      // ),
      // university: Yup.string().required("Please enter university"),
      file: Yup.mixed()
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
      // location: Yup.string().required("Please enter location"),
      // icalepal: Yup.string()
      //   // .url("Please enter a valid URL")
      //   .required(
      //     "Please provide a link for Id Card/Acceptance/Admission Letter-Enrollment Proof"
      //   ),
      // courseDuration: Yup.string().required("Please enter course duration"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("academicYear", values.academicYear?.value || "");
        formData.append("streamId", values.stream?.value || "");
        formData.append("departmentId", values.department?.value || "");
        // formData.append("studentName", values.studentName);
        // formData.append("mccRegisterNo", values.mccRegNo);
        // formData.append("coursePursuedInMcc", values.coursePurused);
        // formData.append("higherEducationCourse", values.heigherEduCu);
        // formData.append("university", values.university);
        // formData.append("location", values.location);
        // formData.append("enrollmentProof", values.icalepal);
        // formData.append("courseDuration", values.courseDuration);
        if (isEditMode && typeof values.file === "string") {
          formData.append(
            "excel",
            new Blob([], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            "empty.xlsx"
          );
        } else if (isEditMode && values.file === null) {
          formData.append(
            "excel",
            new Blob([], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            "empty.xlsx"
          );
        } else if (values.file) {
          formData.append("excel", values.file);
        }

        // If in edit mode, append the edit ID
        if (isEditMode && editId) {
          formData.append("higherEducationId", editId);
        }

        if (isEditMode && typeof values.file === "string") {
          formData.append(
            "excel",
            new Blob([], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            "empty.xlsx"
          );
        } else if (isEditMode && values.file === null) {
          formData.append(
            "excel",
            new Blob([], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            "empty.xlsx"
          );
        } else if (values.file) {
          formData.append("excel", values.file);
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

        // If in edit mode, append the edit ID
        if (isEditMode && editId) {
          formData.append("higherEducationId", editId);
        }

        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/studentProgressionHigherEducation/update`,
            formData
          );
          toast.success(
            response.message ||
              "Student Progression - Higher Education updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/studentProgressionHigherEducation/save",
            formData
          );
          toast.success(
            response.message ||
              "Student Progression - Higher Education added successfully!"
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
        
        setIsFileUploadDisabled(false); // Enable the file upload button
        setIsFile2UploadDisabled(false); // Enable the file upload button
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the Student Progression - Higher EducationList
        handleListSHEClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Student Progression - Higher Education. Please try again."
        );
        console.error(
          "Error creating Student Progression - Higher Education:",
          error
        );
      }
    },
  });

  useEffect(() => {
    if (sheData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
      destroy: true,
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Student_Progression_Higher_Education_Data",
          title: "Student Progression - Higher Education Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Student_Progression_Higher_Education_Data",
          title: "Student Progression - Higher Education Data Export",
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
  }, [sheData]);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Student Activities & Support"
            breadcrumbItem="Student Progression - Higher Education"
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
                        Course Pursued in MCC
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.coursePurused &&
                          validation.errors.coursePurused
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="coursePurused"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "coursePurused",
                            e.target.value
                          )
                        }
                        placeholder="Enter Course Pursued in MCC"
                        value={validation.values.coursePurused}
                      />
                      {validation.touched.coursePurused &&
                        validation.errors.coursePurused && (
                          <div className="text-danger">
                            {validation.errors.coursePurused}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Program Enrolled For Higher Education
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.heigherEduCu &&
                          validation.errors.heigherEduCu
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="heigherEduCu"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "heigherEduCu",
                            e.target.value
                          )
                        }
                        placeholder="Enter Program Enrolled For Higher Education"
                        value={validation.values.heigherEduCu}
                      />
                      {validation.touched.heigherEduCu &&
                        validation.errors.heigherEduCu && (
                          <div className="text-danger">
                            {validation.errors.heigherEduCu}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        University
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.university &&
                          validation.errors.university
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="university"
                        onChange={(e) =>
                          validation.setFieldValue("university", e.target.value)
                        }
                        placeholder="Enter University"
                        value={validation.values.university}
                      />
                      {validation.touched.university &&
                        validation.errors.university && (
                          <div className="text-danger">
                            {validation.errors.university}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Location
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.location &&
                          validation.errors.location
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="location"
                        onChange={(e) =>
                          validation.setFieldValue("location", e.target.value)
                        }
                        placeholder="Enter location"
                        value={validation.values.location}
                      />
                      {validation.touched.location &&
                        validation.errors.location && (
                          <div className="text-danger">
                            {validation.errors.location}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Provide a link
                      </Label>
                      <Tooltip
                        placement="right"
                        open={tooltipOpen}
                        onClose={() => setTooltipOpen(false)}
                        onOpen={() => setTooltipOpen(true)}
                        title={
                          <span>
                            Provide a link for Id Card/Acceptance/Admission
                          </span>
                        }
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
                          validation.touched.icalepal &&
                          validation.errors.icalepal
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="icalepal"
                        onChange={(e) =>
                          validation.setFieldValue("icalepal", e.target.value)
                        }
                        placeholder="Enter Id Card/Acceptance/Admission Letter-Enrollment Proof-Provide a link"
                        value={validation.values.icalepal}
                      />
                      {validation.touched.icalepal &&
                        validation.errors.icalepal && (
                          <div className="text-danger">
                            {validation.errors.icalepal}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Course Duration
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.courseDuration &&
                          validation.errors.courseDuration
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="courseDuration"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "courseDuration",
                            e.target.value
                          )
                        }
                        placeholder="Enter Course Duration"
                        value={validation.values.courseDuration}
                      />
                      {validation.touched.courseDuration &&
                        validation.errors.courseDuration && (
                          <div className="text-danger">
                            {validation.errors.courseDuration}
                          </div>
                        )}
                    </div>
                  </Col> */}

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Template in Excel
                      </Label>
                      <Tooltip
                        placement="right"
                        open={tooltipOpen}
                        onClose={() => setTooltipOpen(false)}
                        onOpen={() => setTooltipOpen(true)}
                        title={
                          <span>Upload an Excel file. Max size 10MB.</span>
                        }
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
                                "higherEducation"
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
                      </Label>
                      <Tooltip
                        placement="right"
                        open={tooltipOpenIdProof}
                        onClose={() => setTooltipOpenIdProof(false)}
                        onOpen={() => setTooltipOpenIdProof(true)}
                        title={<span>Merged PDF For Bulk Data.</span>}
                        arrow
                      >
                        <i
                          id="infoIconIdProof"
                          className="bi bi-info-circle ms-2"
                          style={{ cursor: "pointer", color: "#0d6efd" }}
                        ></i>
                      </Tooltip>
                      <Input
                        className={`form-control ${
                          validation.touched.idCard &&
                          validation.errors.idCard
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
                        Upload student Details Higher Education
                      </Label>
                      <Tooltip
                        placement="right"
                        open={tooltipOpenHigherEducation}
                        onOpen={() => setTooltipOpenHigherEducation(true)}
                        onClose={() => setTooltipOpenHigherEducation(false)}
                        title={<span>Bulk data upload in Excel.</span>}
                        arrow
                      >
                        <i
                          id="infoIconHigherEducation"
                          className="bi bi-info-circle ms-2"
                          style={{ cursor: "pointer", color: "#0d6efd" }}
                        ></i>
                      </Tooltip>
                      <Input
                        className={`form-control ${
                          validation.touched.higherEducation &&
                          validation.errors.higherEducation
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        innerRef={fileRef2}
                        onChange={(event) => {
                          validation.setFieldValue(
                            "higherEducation",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFile3UploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.higherEducation &&
                        validation.errors.higherEducation && (
                          <div className="text-danger">
                            {validation.errors.higherEducation}
                          </div>
                        )}
                      {isFile3UploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {typeof validation.values.higherEducation ===
                        "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.higherEducation}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.higherEducation as string
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
                                validation.values.higherEducation as string,
                                "higherEducation"
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
                      <Label>Excel Template </Label>
                      <div>
                        <a
                          href={`${process.env.PUBLIC_URL}/templateFiles/YEAR_DEPT NAME_HIGHER EDUCATION.xlsx`}
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
                        onClick={handleListSHEClick}
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
        {/* Modal for Listing Student Progression - Higher Education*/}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Student Progression - Higher Education
          </ModalHeader>
          <ModalBody>
            <Table striped bordered hover id="id" innerRef={tableRef}>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>School</th>
                  <th>Department</th>
                  {/* <th>MCC Register number</th>
                  <th>Student Name</th>
                  <th>Course Pursued in MCC</th>
                  <th>Heigher Education Course</th>
                  <th>University</th>
                  <th>Location</th>
                  <th>Course Duration</th> */}
                  <th className="d-none">File Path(Excel)</th>
                  <th className="d-none">File Path(ID Proof)</th>
                  <th className="d-none">File Path(Competitive Exam)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sheData.length > 0 ? (
                  sheData.map((she, index) => (
                    <tr key={she.higherEducationId}>
                      <td>{index + 1}</td>
                      <td>{she.academicYear}</td>
                      <td>{she.streamName}</td>
                      <td>{she.departmentName}</td>
                      {/* <td>{she.mccRegisterNo}</td>
                      <td>{she.studentName}</td>
                      <td>{she.coursePursuedInMcc}</td>
                      <td>{she.higherEducationCourse}</td>
                      <td>{she.university}</td>
                      <td>{she.location}</td>
                      <td>{she.courseDuration}</td> */}
                      <td className="d-none">
                        {she.filePath.higherEducation || "N/A"}
                      </td>
                      <td className="d-none">
                        {she.filePath.idCard || "N/A"}
                      </td>
                      <td className="d-none">
                        {she.filePath.excel || "N/A"}
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEdit(she.higherEducationId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(she.higherEducationId)}
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
                      No Student Progression - Higher Education available.
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

export default StudentProgression_Higher_Education;
