import Breadcrumb from "Components/Common/Breadcrumb";
import { useFormik } from "formik";
import React, { useState } from "react";
import Select from "react-select";
import * as Yup from "yup";
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
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import SemesterDropdowns from "Components/DropDowns/SemesterDropdowns";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import ProgramDropdown from "Components/DropDowns/ProgramDropdown";
import { APIClient } from "../../helpers/api_helper";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import { SEMESTER_NO_OPTIONS } from "../../Components/constants/layout";
import axios from "axios";

const api = new APIClient();

const courseType = [
  { value: "T", label: "Core" },
  { value: "P", label: "Elective" },
  { value: "A", label: "Allied" },
];

const dropdownStyles = {
  menu: (provided: any) => ({
    ...provided,
    overflowY: "auto",
  }),
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
};

const getTabValidationSchema = (tab: number | null) => {
  // Main form validation schema
  const mainFormSchema = {
    academicYear: Yup.object<{ value: string; label: string }>()
      .nullable()
      .required("Please select academic year"),
    semesterType: Yup.object<{ value: string; label: string }>()
      .nullable()
      .required("Please select a semester type"),
    semesterNo: Yup.object<{ value: string; label: string }>()
      .nullable()
      .required("Please select a semester number"),
    stream: Yup.object<{ value: string; label: string }>()
      .nullable()
      .required("Please select school"),
    department: Yup.object<{ value: string; label: string }>()
      .nullable()
      .required("Please select department"),
    programType: Yup.object()
      .nullable()
      .required("Please select programType"),
    program: Yup.array()
      .min(1, "Please select at least one program")
      .required("Please select programs"),
    degree: Yup.object().nullable().required("Please select degree"),
    otherDepartment: Yup.string(),
  };

  // Always include all fields in the schema, but only main form fields are required
  const allTabFields = {
    courseTitileG: Yup.string(),
    courseTypeG: Yup.object().nullable(),
    fileG: Yup.mixed().nullable(),
    courseTitileES: Yup.string(),
    courseTypeES: Yup.object().nullable(),
    fileES: Yup.mixed().nullable(),
    courseTitileIK: Yup.string(),
    courseTypeIK: Yup.object().nullable(),
    fileIK: Yup.mixed().nullable(),
    courseTitileEM: Yup.string(),
    courseTypeEM: Yup.object().nullable(),
    fileEM: Yup.mixed().nullable(),
    courseTitileSE: Yup.string(),
    courseTypeSE: Yup.object().nullable(),
    fileSE: Yup.mixed().nullable(),
    courseTitileEN: Yup.string(),
    courseTypeEN: Yup.object().nullable(),
    fileEN: Yup.mixed().nullable(),
    courseTitileET: Yup.string(),
    courseTypeET: Yup.object().nullable(),
    fileET: Yup.mixed().nullable(),
  };

  // Helper for file validation
  const fileValidation = (field: string) =>
    Yup.mixed().when([], {
      is: function (this: any) {
        // Only skip validation if the value is a non-empty string (existing file)
        return this && this.parent && typeof this.parent[field] === "string" && this.parent[field];
      },
      then: (schema) => schema, // No validation if file exists (string)
      otherwise: (schema) =>
        schema
          .required("Please upload a file")
          .test("fileSize", "File size is too large", (value: any) => {
            // Only check size if value is a File
            if (!value || typeof value === "string") return true;
            return value.size <= 2 * 1024 * 1024;
          })
          .test("fileType", "Unsupported file format", (value: any) => {
            // Only check type if value is a File
            if (!value || typeof value === "string") return true;
            return ["application/pdf", "image/jpeg", "image/png"].includes(value.type);
          }),
    });

  switch (tab) {
    case 1:
      return Yup.object({
        ...mainFormSchema,
        ...allTabFields,
        courseTitileG: Yup.string().required("Please enter Course Title"),
        courseTypeG: Yup.object().nullable().required("Please select course type"),
        fileG: fileValidation("fileG"),
      });
    case 2:
      return Yup.object({
        ...mainFormSchema,
        ...allTabFields,
        courseTitileES: Yup.string().required("Please enter Course Title"),
        courseTypeES: Yup.object().nullable().required("Please select course type"),
        fileES: fileValidation("fileES"),
      });
    case 3:
      return Yup.object({
        ...mainFormSchema,
        ...allTabFields,
        courseTitileIK: Yup.string().required("Please enter Course Title"),
        courseTypeIK: Yup.object().nullable().required("Please select course type"),
        fileIK: fileValidation("fileIK"),
      });
    case 4:
      return Yup.object({
        ...mainFormSchema,
        ...allTabFields,
        courseTitileEM: Yup.string().required("Please enter Course Title"),
        courseTypeEM: Yup.object().nullable().required("Please select course type"),
        fileEM: fileValidation("fileEM"),
      });
    case 5:
      return Yup.object({
        ...mainFormSchema,
        ...allTabFields,
        courseTitileSE: Yup.string().required("Please enter Course Title"),
        courseTypeSE: Yup.object().nullable().required("Please select course type"),
        fileSE: fileValidation("fileSE"),
      });
    case 6:
      return Yup.object({
        ...mainFormSchema,
        ...allTabFields,
        courseTitileEN: Yup.string().required("Please enter Course Title"),
        courseTypeEN: Yup.object().nullable().required("Please select course type"),
        fileEN: fileValidation("fileEN"),
      });
    case 7:
      return Yup.object({
        ...mainFormSchema,
        ...allTabFields,
        courseTitileET: Yup.string().required("Please enter Course Title"),
        courseTypeET: Yup.object().nullable().required("Please select course type"),
        fileET: fileValidation("fileET"),
      });
    default:
      return Yup.object({
        ...mainFormSchema,
        ...allTabFields,
      }).test(
        "at-least-one-nested",
        "Please select a Focus Area and fill at least one nested tab.",
        (values: any) => false // Always block if no tab is active
      );
  }
};

// Helper: Check if any field in the current tab is filled
const isTabFilled = (validation: any, tab: number | null) => {
  switch (tab) {
    case 1:
      return (
        validation.values.courseTitileG ||
        validation.values.courseTypeG ||
        validation.values.fileG
      );
    case 2:
      return (
        validation.values.courseTitileES ||
        validation.values.courseTypeES ||
        validation.values.fileES
      );
    case 3:
      return (
        validation.values.courseTitileIK ||
        validation.values.courseTypeIK ||
        validation.values.fileIK
      );
    case 4:
      return (
        validation.values.courseTitileEM ||
        validation.values.courseTypeEM ||
        validation.values.fileEM
      );
    case 5:
      return (
        validation.values.courseTitileSE ||
        validation.values.courseTypeSE ||
        validation.values.fileSE
      );
    case 6:
      return (
        validation.values.courseTitileEN ||
        validation.values.courseTypeEN ||
        validation.values.fileEN
      );
    case 7:
      return (
        validation.values.courseTitileET ||
        validation.values.courseTypeET ||
        validation.values.fileET
      );
    default:
      return false;
  }
};

// Helper: Clear fields for a tab
const clearTabFields = (validation: any, tab: number | null) => {
  switch (tab) {
    case 1:
      validation.setFieldValue("courseTitileG", "");
      validation.setFieldValue("courseTypeG", null);
      validation.setFieldValue("fileG", null);
      break;
    case 2:
      validation.setFieldValue("courseTitileES", "");
      validation.setFieldValue("courseTypeES", null);
      validation.setFieldValue("fileES", null);
      break;
    case 3:
      validation.setFieldValue("courseTitileIK", "");
      validation.setFieldValue("courseTypeIK", null);
      validation.setFieldValue("fileIK", null);
      break;
    case 4:
      validation.setFieldValue("courseTitileEM", "");
      validation.setFieldValue("courseTypeEM", null);
      validation.setFieldValue("fileEM", null);
      break;
    case 5:
      validation.setFieldValue("courseTitileSE", "");
      validation.setFieldValue("courseTypeSE", null);
      validation.setFieldValue("fileSE", null);
      break;
    case 6:
      validation.setFieldValue("courseTitileEN", "");
      validation.setFieldValue("courseTypeEN", null);
      validation.setFieldValue("fileEN", null);
      break;
    case 7:
      validation.setFieldValue("courseTitileET", "");
      validation.setFieldValue("courseTypeET", null);
      validation.setFieldValue("fileET", null);
      break;
    default:
      break;
  }
};

const Courses_With_Focus: React.FC = () => {
  // State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  // State variable for managing file upload status
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [CWFData, setCWFData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState(CWFData);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filters, setFilters] = useState({
    academicYear: "",
    semesterType: "",
    semesterNo: "",
    stream: "",
    department: "",
    programType: "",
    program: "",
    yearOfIntroduction: "",
    percentage: "",
  });

  // Utility
  const mapValueToLabel = (
    value: string | number | null,
    options: { value: string | number; label: string }[]
  ): { value: string | number; label: string } | null => {
    if (!value) return null;
    const matchedOption = options.find((option) => option.value === value);
    return matchedOption ? matchedOption : { value, label: String(value) };
  };

  // Table and Modal Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = CWFData.filter((row) =>
      Object.values(row).some((val) =>
        String(val || "")
          .toLowerCase()
          .includes(value)
      )
    );
    setFilteredData(filtered);
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const toggleTab = (tab: number) => {
    // Only allow switching if current tab is not filled or switching to the same tab
    if (activeTab === tab || !isTabFilled(validation, activeTab)) {
      setActiveTab(tab);
    }
  };

  const toggleWizard = () => {
    setShowWizard(!showWizard);
    if (showWizard) setActiveTab(null);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    column: string
  ) => {
    const value = e.target.value.toLowerCase();
    const updatedFilters = { ...filters, [column]: value };
    setFilters(updatedFilters);

    const filtered = CWFData.filter((row) =>
      Object.values(row).some((val) =>
        String(val || "")
          .toLowerCase()
          .includes(value)
      )
    );
    setFilteredData(filtered);
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const fetchCWFData = async () => {
    try {
      const response = await api.get(
        "/CoursesWithFocus/getAllCoursesWithFocus",
        ""
      );
      setCWFData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Courses With Focus:", error);
    }
  };

  const handleListCWFClick = () => {
    toggleModal();
    fetchCWFData();
  };

  // Edit/Delete
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(`/CoursesWithFocus?coursesWithFocusId=${id}`, "");

      const academicYearOptions = await api.get("/getAllAcademicYear", "");
      // Filter the response where isCurrent or isCurrentForAdmission is true
      const filteredAcademicYearList = academicYearOptions.filter(
        (year: any) => year.isCurrent || year.isCurrentForAdmission
      );
      // Map the filtered data to the required format
      const academicYearList = filteredAcademicYearList.map((year: any) => ({
        value: year.year,
        label: year.display
      }));

      const semesterNoOptions = SEMESTER_NO_OPTIONS

      // Map API response to Formik values
      const mappedValues = {
        academicYear: mapValueToLabel(response.academicYear, academicYearList),
        semesterType: response.semType
          ? { value: response.semType, label: response.semType.toUpperCase() }
          : null,
        semesterNo: mapValueToLabel(String(response.semNumber), semesterNoOptions) as { value: string; label: string } | null,
        stream: response.streamId
          ? { value: response.streamId.toString(), label: response.streamName }
          : null,
        department: response.departmentId
          ? { value: response.departmentId.toString(), label: response.departmentName }
          : null,
        programType: response.programTypeId
          ? { value: response.programTypeId.toString(), label: response.programTypeName }
          : null,
        degree: response.programId
          ? { value: response.programId.toString(), label: response.programName }
          : null,
        program: response.courses
          ? Object.entries(response.courses).map(([key, value]) => ({
            value: key,
            label: String(value),
          }))
          : []
      };

      // Update Formik values
      validation.setValues({
        ...validation.initialValues,
        ...mappedValues,
        // Ensure all required fields are present (even if empty)
        courseTitileG: "",
        courseTypeG: null,
        fileG: null,
        courseTitileES: "",
        courseTypeES: null,
        fileES: null,
        courseTitileIK: "",
        courseTypeIK: null,
        fileIK: null,
        courseTitileEM: "",
        courseTypeEM: null,
        fileEM: null,
        courseTitileSE: "",
        courseTypeSE: null,
        fileSE: null,
        courseTitileEN: "",
        courseTypeEN: null,
        fileEN: null,
        courseTitileET: "",
        courseTypeET: null,
        fileET: null,
        academicYear: mappedValues.academicYear
          ? { ...mappedValues.academicYear, value: String(mappedValues.academicYear.value) }
          : null,
        semesterNo: mappedValues.semesterNo
          ? { ...mappedValues.semesterNo, value: String(mappedValues.semesterNo.value) }
          : null,
      });

      const getCourseTypeOption = (value: string) =>
        courseType.find((opt) => opt.value === value) || null;

      // Nested tab data
      if (response.ecoGenderC && (response.ecoGenderC.courseTitle || response.ecoGenderC.courseType)) {
        setShowWizard(true);
        setActiveTab(1);
        validation.setFieldValue("courseTitileG", response.ecoGenderC.courseTitle || "");
        validation.setFieldValue("courseTypeG", getCourseTypeOption(response.ecoGenderC.courseType));
        validation.setFieldValue("fileG", response.ecoGenderC?.file && Object.values(response.ecoGenderC.file)[0]
          ? Object.values(response.ecoGenderC.file)[0]
          : "");
        validation.setFieldValue("fileGId", response.ecoGenderC?.coursesWithFocusAddOnFieldID || null);
      } else if (response.ecoEnvironmentalC && (response.ecoEnvironmentalC.courseTitle || response.ecoEnvironmentalC.courseType)) {
        setShowWizard(true);
        setActiveTab(2);
        validation.setFieldValue("courseTitileES", response.ecoEnvironmentalC.courseTitle || "");
        validation.setFieldValue("courseTypeES", getCourseTypeOption(response.ecoEnvironmentalC.courseTypeES));
        validation.setFieldValue("fileES", response.ecoEnvironmentalC?.file && Object.values(response.ecoEnvironmentalC.file)[0]
          ? Object.values(response.ecoEnvironmentalC.file)[0]
          : "");
        validation.setFieldValue("fileESId", response.ecoEnvironmentalC?.coursesWithFocusAddOnFieldID || null);
      } else if (response.ecoIKSC && (response.ecoIKSC.courseTitle || response.ecoIKSC.courseType)) {
        setShowWizard(true);
        setActiveTab(3);
        validation.setFieldValue("courseTitileIK", response.ecoIKSC.courseTitle || "");
        validation.setFieldValue("courseTypeIK", getCourseTypeOption(response.ecoIKSC.courseType));
        validation.setFieldValue("fileIK", response.ecoIKSC?.file && Object.values(response.ecoIKSC.file)[0]
          ? Object.values(response.ecoIKSC.file)[0]
          : "");
        validation.setFieldValue("fileIKId", response.ecoIKSC?.coursesWithFocusAddOnFieldID || null);
      } else if (response.ecoEmployC && (response.ecoEmployC.courseTitle || response.ecoEmployC.courseType)) {
        setShowWizard(true);
        setActiveTab(4);
        validation.setFieldValue("courseTitileEM", response.ecoEmployC.courseTitle || "");
        validation.setFieldValue("courseTypeEM", getCourseTypeOption(response.ecoEmployC.courseType));
        validation.setFieldValue("fileEM", response.ecoEmployC?.file && Object.values(response.ecoEmployC.file)[0]
          ? Object.values(response.ecoEmployC.file)[0]
          : "");
        validation.setFieldValue("fileEMId", response.ecoEmployC?.coursesWithFocusAddOnFieldID || null);
      } else if (response.ecoSkillC && (response.ecoSkillC.courseTitle || response.ecoSkillC.courseType)) {
        setShowWizard(true);
        setActiveTab(5);
        validation.setFieldValue("courseTitileSE", response.ecoSkillC.courseTitle || "");
        validation.setFieldValue("courseTypeSE", getCourseTypeOption(response.ecoSkillC.courseType));
        validation.setFieldValue("fileSE", response.ecoSkillC?.file && Object.values(response.ecoSkillC.file)[0]
          ? Object.values(response.ecoSkillC.file)[0]
          : "");
        validation.setFieldValue("fileSEId", response.ecoSkillC?.coursesWithFocusAddOnFieldID || null);
      } else if (response.ecoEntreC && (response.ecoEntreC.courseTitle || response.ecoEntreC.courseType)) {
        setShowWizard(true);
        setActiveTab(6);
        validation.setFieldValue("courseTitileEN", response.ecoEntreC.courseTitle || "");
        validation.setFieldValue("courseTypeEN", getCourseTypeOption(response.ecoEntreC.courseType));
        validation.setFieldValue("fileEN", response.ecoEntreC?.file && Object.values(response.ecoEntreC.file)[0]
          ? Object.values(response.ecoEntreC.file)[0]
          : "");
        validation.setFieldValue("fileENId", response.ecoEntreC?.coursesWithFocusAddOnFieldID || null);
      } else if (response.ecoEthicsC && (response.ecoEthicsC.courseTitle || response.ecoEthicsC.courseType)) {
        setShowWizard(true);
        setActiveTab(7);
        validation.setFieldValue("courseTitileET", response.ecoEthicsC.courseTitle || "");
        validation.setFieldValue("courseTypeET", getCourseTypeOption(response.ecoEthicsC.courseType));
        validation.setFieldValue("fileET", response.ecoEthicsC?.file && Object.values(response.ecoEthicsC.file)[0]
          ? Object.values(response.ecoEthicsC.file)[0]
          : "");
        validation.setFieldValue("fileETId", response.ecoEthicsC?.coursesWithFocusAddOnFieldID || null);
      } else {
        setShowWizard(false);
        setActiveTab(null);
      }
      setIsEditMode(true);
      setEditId(id);
      toggleModal();
    } catch (error) {
      toast.error("Failed to fetch data for editing.");
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Handle file download actions
  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(`/CoursesWithFocus/download/${fileName}`, {
          responseType: 'blob'
        });

        // Create a Blob from the response data
        const blob = new Blob([response], { type: "*/*" });

        // Create a URL for the Blob
        const url = window.URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName; // Set the file name for the download
        document.body.appendChild(link);
        link.click();

        // Clean up the URL and remove the anchor element
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("File downloaded successfully!");
      } catch (error) {
        toast.error("Failed to download the file. Please try again.");
        console.error("Error downloading file:", error);
      }
    } else {
      toast.error("No file available for download.");
    }
  };

  // Handle file deletion
  // Clear the file from the form and show success message
  const handleDeleteFile = async (tabKey: string) => {
    const fileId = validation.values[tabKey + "Id"];
    if (!fileId) {
      toast.error("No file to delete.");
      return;
    }
    try {
      // Call the delete API
      const response = await api.delete(`/CoursesWithFocus/deleteCoursesWithFocusDocument?coursesWithFocusDocumentId=${fileId}`, '');
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      // Remove the file from the form
      validation.setFieldValue(tabKey, null); // Clear the file from Formik state
      validation.setFieldValue(tabKey + "Id", null);
    } catch (error) {
      // Show error message
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/CoursesWithFocus/deleteCoursesWithFocus?coursesWithFocusId=${id}`,
          ""
        );
        toast.success(
          response.message || "Courses With Focus removed successfully!"
        );
        fetchCWFData();
      } catch (error) {
        toast.error("Failed to remove Courses With Focus. Please try again.");
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  // Formik
  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      semesterType: null as { value: string; label: string } | null,
      semesterNo: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      file: null,
      programType: null as { value: string; label: string } | null,
      degree: null as { value: string; label: string } | null,
      program: [] as { value: string; label: string }[],
      courses: null as { value: string; label: string } | null,
      courseType: null as { value: string; label: string } | null,
      courseTitile: null as { value: string; label: string } | null,
      courseTitileET: "" as string,
      courseTitileG: "" as string,
      courseTitileES: "" as string,
      courseTitileIK: "" as string,
      courseTitileEM: "" as string,
      courseTitileSE: "" as string,
      courseTitileEN: "" as string,
      fileG: null,
      fileES: null,
      fileIK: null,
      fileEM: null,
      fileSE: null,
      fileEN: null,
      fileET: null,
      courseTypeG: null as { value: string; label: string } | null,
      courseTypeES: null as { value: string; label: string } | null,
      courseTypeIK: null as { value: string; label: string } | null,
      courseTypeEM: null as { value: string; label: string } | null,
      courseTypeSE: null as { value: string; label: string } | null,
      courseTypeEN: null as { value: string; label: string } | null,
      courseTypeET: null as { value: string; label: string } | null,
      fileGId: null,
      fileESId: null,
      fileIKId: null,
      fileEMId: null,
      fileSEId: null,
      fileENId: null,
      fileETId: null,
    },
    validationSchema: getTabValidationSchema(activeTab),
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setErrors, setSubmitting }) => {
      // Block submit if no Focus Area tab is active
      if (!activeTab) {
        validation.setStatus("Please select a Focus Area and fill at least one focus area type.");
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      // Determine focusArea based on activeTab
      let focusArea = "";
      switch (activeTab) {
        case 1:
          focusArea = "Gender";
          break;
        case 2:
          focusArea = "Environment & Sustainability";
          break;
        case 3:
          focusArea = "Indian Knowledge System";
          break;
        case 4:
          focusArea = "Employability";
          break;
        case 5:
          focusArea = "Skill Enhancement";
          break;
        case 6:
          focusArea = "Entrepreneurship";
          break;
        case 7:
          focusArea = "Ethics";
          break;
        default:
          focusArea = "";
      }
      const coursesWithFocusRequestDto: any = {
        academicYear: Number(values.academicYear?.value) || null,
        semType: values.semesterType?.value || null,
        semNumber: Number(values.semesterNo?.value) || null,
        streamId: Number(values.stream?.value) || null,
        departmentId: Number(values.department?.value) || null,
        programTypeId: Number(values.programType?.value) || null,
        programId: Number(values.degree?.value) || null,
        focusArea: focusArea,
        courseId: Array.isArray(values.program)
          ? values.program.map((option: any) => Number(option.value))
          : [],
        ecoEntreC: {
          coursesWithFocusAddOnFieldsId: values.fileENId || null,
          courseTitle: values.courseTitileEN || null,
          courseType: values.courseTypeEN?.value || null,
        },
        ecoEmployC: {
          coursesWithFocusAddOnFieldsId: values.fileEMId || null,
          courseTitle: values.courseTitileEM || null,
          courseType: values.courseTypeEM?.value || null,
        },
        ecoSkillC: {
          coursesWithFocusAddOnFieldsId: values.fileSEId || null,
          courseTitle: values.courseTitileSE || null,
          courseType: values.courseTypeSE?.value || null,
        },
        ecoGenderC: {
          coursesWithFocusAddOnFieldsId: values.fileGId || null,
          courseTitle: values.courseTitileG || null,
          courseType: values.courseTypeG?.value || null,
        },
        ecoEnvironmentalC: {
          coursesWithFocusAddOnFieldsId: values.fileESId || null,
          courseTitle: values.courseTitileES || null,
          courseType: values.courseTypeES?.value || null,
        },
        ecoIKSC: {
          coursesWithFocusAddOnFieldsId: values.fileIKId || null,
          courseTitle: values.courseTitileIK || null,
          courseType: values.courseTypeIK?.value || null,
        },
        ecoEthicsC: {
          coursesWithFocusAddOnFieldsId: values.fileETId || null,
          courseTitle: values.courseTitileET || null,
          courseType: values.courseTypeET?.value || null,
        },
        coursesWithFocusId: isEditMode && editId ? Number(editId) : null,
      };

      console.log(values.fileGId, "File G ID");
      console.log("CoursesWithFocusRequestDto:", coursesWithFocusRequestDto);

      formData.append(
        "coursesWithFocusRequestDto",
        new Blob([JSON.stringify(coursesWithFocusRequestDto)], { type: "application/json" })
      );

      formData.append("ecoGenderC", values.fileG || new Blob());
      formData.append("ecoIKSC", values.fileIK || new Blob());
      formData.append("ecoEmployC", values.fileEM || new Blob());
      formData.append("ecoSkillC", values.fileSE || new Blob());
      formData.append("ecoEntreC", values.fileEN || new Blob());

      try {
        if (isEditMode && editId) {
          const response = await api.put(
            `/CoursesWithFocus`,
            formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
          );
          toast.success(
            response.message || "Courses With Focus updated successfully!"
          );
        } else {
          const response = await api.create(
            "/CoursesWithFocus",
            formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
          );
          toast.success(
            response.message || "Courses With Focus added successfully!"
          );
        }
        resetForm();
        setIsEditMode(false);
        setEditId(null);
        handleListCWFClick();
      } catch (error) {
        toast.error("Failed to save Courses With Focus. Please try again.");
      }
    },
  });

  // Helper for tab errors
  const showTabError = (tab: number, touched: any, error: any) =>
    activeTab === tab && touched && error ? (
      <div className="text-danger">{error}</div>
    ) : null;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Curricuum"
            breadcrumbItem="Courses With Focus"
          />
          <Card>
            <CardBody>
              <form onSubmit={validation.handleSubmit}>
                <Row>
                  {/* ...main form fields as before... */}
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
                  {/* Semester Dropdowns */}
                  <Col lg={8}>
                    <SemesterDropdowns
                      semesterTypeValue={validation.values.semesterType}
                      semesterNoValue={validation.values.semesterNo}
                      onSemesterTypeChange={(selectedOption) =>
                        validation.setFieldValue("semesterType", selectedOption)
                      }
                      onSemesterNoChange={(selectedOption) =>
                        validation.setFieldValue("semesterNo", selectedOption)
                      }
                      isSemesterTypeInvalid={
                        validation.touched.semesterType && !!validation.errors.semesterType
                      }
                      isSemesterNoInvalid={
                        validation.touched.semesterNo && !!validation.errors.semesterNo
                      }
                      semesterTypeError={
                        validation.touched.semesterType
                          ? validation.errors.semesterType
                          : null
                      }
                      semesterNoError={
                        validation.touched.semesterNo
                          ? validation.errors.semesterNo
                          : null
                      }
                      semesterTypeTouched={!!validation.touched.semesterType}
                      semesterNoTouched={!!validation.touched.semesterNo}
                    />
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
                          validation.setFieldValue("degree", null);
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Program</Label>
                      <ProgramDropdown
                        degreeId={selectedDegree?.value}
                        value={validation.values.program}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("program", selectedOption)
                        }
                        isInvalid={
                          validation.touched.program &&
                          !!validation.errors.program
                        }
                      />
                      {validation.touched.program &&
                        validation.errors.program && (
                          <div className="text-danger">
                            {Array.isArray(validation.errors.program)
                              ? validation.errors.program.join(", ")
                              : validation.errors.program}
                          </div>
                        )}
                    </div>
                  </Col>
                  <div className="mb-3 mt-3 d-grid">
                    <button
                      className="btn btn-primary toggle-wizard-button"
                      type="button"
                      onClick={toggleWizard}
                    >
                      Focus Areas
                    </button>
                  </div>
                  {showWizard && (
                    <div className="wizard clearfix">
                      <div
                        className="steps"
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(120px, 1fr))",
                          gap: "10px",
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((tab) => (
                          <button
                            key={tab}
                            className={`step-button ${activeTab === tab ? "active" : ""}`}
                            type="button"
                            onClick={() => toggleTab(tab)}
                            disabled={activeTab !== tab && isTabFilled(validation, activeTab)}
                            style={activeTab !== tab && isTabFilled(validation, activeTab) ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                          >
                            {tab === 1
                              ? "Gender"
                              : tab === 2
                                ? "Environment & Sustainability"
                                : tab === 3
                                  ? "Indian Knowledge System"
                                  : tab === 4
                                    ? "Employability"
                                    : tab === 5
                                      ? "Skill Enhancement"
                                      : tab === 6
                                        ? "Entrepreneurship"
                                        : "Ethics"}
                          </button>
                        ))}
                      </div>
                      <div className="mb-2 mt-2">
                        {activeTab && (
                          <button
                            type="button"
                            className="btn btn-outline-warning btn-sm"
                            onClick={() => clearTabFields(validation, activeTab)}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="tab-content mt-3">
                        {/* Gender */}
                        {activeTab === 1 && (
                          <Row>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Course Title</Label>
                                <Input
                                  type="text"
                                  name="courseTitileG"
                                  value={validation.values.courseTitileG}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Course Title"
                                  className={
                                    validation.touched.courseTitileG &&
                                      validation.errors.courseTitileG
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(1, validation.touched.courseTitileG, validation.errors.courseTitileG)}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Course Type</Label>
                                <Select
                                  options={courseType}
                                  value={validation.values.courseTypeG}
                                  onChange={(selectedOption) =>
                                    validation.setFieldValue(
                                      "courseTypeG",
                                      selectedOption
                                    )
                                  }
                                  placeholder="Select Course Type"
                                  styles={dropdownStyles}
                                  menuPortalTarget={document.body}
                                  className={
                                    validation.touched.courseTypeG &&
                                      validation.errors.courseTypeG
                                      ? "select-error"
                                      : ""
                                  }
                                />
                                {showTabError(1, validation.touched.courseTypeG, validation.errors.courseTypeG)}
                              </div>
                            </Col>
                            <Col sm={4}>
                              <div className="mb-3">
                                <Label htmlFor="formFile" className="form-label">
                                  Upload file
                                </Label>
                                <Input
                                  className={`form-control ${activeTab === 1 &&
                                    validation.touched.fileG &&
                                    validation.errors.fileG
                                    ? "is-invalid"
                                    : ""
                                    }`}
                                  type="file"
                                  id="gender"
                                  onChange={(event) => {
                                    validation.setFieldValue(
                                      "fileG",
                                      event.currentTarget.files
                                        ? event.currentTarget.files[0]
                                        : null
                                    );
                                  }}
                                  disabled={typeof validation.values.fileG === "string" && validation.values.fileG}
                                />
                                {showTabError(1, validation.touched.fileG, validation.errors.fileG)}
                                {validation.touched.fileG && validation.errors.fileG && (
                                  <div className="text-danger">{validation.errors.fileG}</div>
                                )}
                                {/* Show a message if the file upload button is disabled */}
                                {typeof validation.values.fileG === "string" && validation.values.fileG && (
                                  <div className="text-warning mt-2">
                                    Please remove the existing file to upload a new one.
                                  </div>
                                )}
                                {/* Only show the file name if it is a string (from the edit API) */}
                                {typeof validation.values.fileG === "string" && validation.values.fileG && (
                                  <div className="mt-2 d-flex align-items-center">
                                    <span className="me-2" style={{ fontWeight: "bold", color: "green" }}>
                                      {validation.values.fileG}
                                    </span>
                                    <Button
                                      color="link"
                                      className="text-primary"
                                      onClick={() => validation.values.fileG && handleDownloadFile(validation.values.fileG as string)}
                                      title="Download File"
                                    >
                                      <i className="bi bi-download"></i>
                                    </Button>
                                    <Button
                                      color="link"
                                      className="text-danger"
                                      onClick={() => handleDeleteFile("fileG")}
                                      title="Delete File"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </Col>
                          </Row>
                        )}
                        {/* Environment & Sustainability */}
                        {activeTab === 2 && (
                          <Row>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Course Title</Label>
                                <Input
                                  type="text"
                                  name="courseTitileES"
                                  value={validation.values.courseTitileES}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Course Title"
                                  className={
                                    validation.touched.courseTitileES &&
                                      validation.errors.courseTitileES
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(2, validation.touched.courseTitileES, validation.errors.courseTitileES)}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Course Type</Label>
                                <Select
                                  options={courseType}
                                  value={validation.values.courseTypeES}
                                  onChange={(selectedOption) =>
                                    validation.setFieldValue(
                                      "courseTypeES",
                                      selectedOption
                                    )
                                  }
                                  placeholder="Select Course Type"
                                  styles={dropdownStyles}
                                  menuPortalTarget={document.body}
                                  className={
                                    validation.touched.courseTypeES &&
                                      validation.errors.courseTypeES
                                      ? "select-error"
                                      : ""
                                  }
                                />
                                {showTabError(2, validation.touched.courseTypeES, validation.errors.courseTypeES)}
                              </div>
                            </Col>
                            <Col sm={4}>
                              <div className="mb-3">
                                <Label htmlFor="formFile" className="form-label">
                                  Upload file
                                </Label>
                                <Input
                                  className={`form-control ${activeTab === 2 &&
                                    validation.touched.fileES &&
                                    validation.errors.fileES
                                    ? "is-invalid"
                                    : ""
                                    }`}
                                  type="file"
                                  id="environment&sustainability"
                                  onChange={(event) => {
                                    validation.setFieldValue(
                                      "fileES",
                                      event.currentTarget.files
                                        ? event.currentTarget.files[0]
                                        : null
                                    );
                                  }}
                                  disabled={typeof validation.values.fileES === "string" && validation.values.fileES}
                                />
                                {showTabError(2, validation.touched.fileES, validation.errors.fileES)}
                                {validation.touched.fileES && validation.errors.fileES && (
                                  <div className="text-danger">{validation.errors.fileES}</div>
                                )}
                                {/* Show a message if the file upload button is disabled */}
                                {typeof validation.values.fileES === "string" && validation.values.fileES && (
                                  <div className="text-warning mt-2">
                                    Please remove the existing file to upload a new one.
                                  </div>
                                )}
                                {/* Only show the file name if it is a string (from the edit API) */}
                                {typeof validation.values.fileES === "string" && validation.values.fileES && (
                                  <div className="mt-2 d-flex align-items-center">
                                    <span className="me-2" style={{ fontWeight: "bold", color: "green" }}>
                                      {validation.values.fileES}
                                    </span>
                                    <Button
                                      color="link"
                                      className="text-primary"
                                      onClick={() => validation.values.fileES && handleDownloadFile(validation.values.fileES as string)}
                                      title="Download File"
                                    >
                                      <i className="bi bi-download"></i>
                                    </Button>
                                    <Button
                                      color="link"
                                      className="text-danger"
                                      onClick={() => handleDeleteFile("fileES")}
                                      title="Delete File"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </Col>
                          </Row>
                        )}
                        {/* Indian Knowledge System */}
                        {activeTab === 3 && (
                          <Row>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Course Title</Label>
                                <Input
                                  type="text"
                                  name="courseTitileIK"
                                  value={validation.values.courseTitileIK}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Course Title"
                                  className={
                                    validation.touched.courseTitileIK &&
                                      validation.errors.courseTitileIK
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(3, validation.touched.courseTitileIK, validation.errors.courseTitileIK)}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Course Type</Label>
                                <Select
                                  options={courseType}
                                  value={validation.values.courseTypeIK}
                                  onChange={(selectedOption) =>
                                    validation.setFieldValue(
                                      "courseTypeIK",
                                      selectedOption
                                    )
                                  }
                                  placeholder="Select Course Type"
                                  styles={dropdownStyles}
                                  menuPortalTarget={document.body}
                                  className={
                                    validation.touched.courseTypeIK &&
                                      validation.errors.courseTypeIK
                                      ? "select-error"
                                      : ""
                                  }
                                />
                                {showTabError(3, validation.touched.courseTypeIK, validation.errors.courseTypeIK)}
                              </div>
                            </Col>
                            <Col sm={4}>
                              <div className="mb-3">
                                <Label htmlFor="formFile" className="form-label">
                                  Upload file
                                </Label>
                                <Input
                                  className={`form-control ${activeTab === 3 &&
                                    validation.touched.fileIK &&
                                    validation.errors.fileIK
                                    ? "is-invalid"
                                    : ""
                                    }`}
                                  type="file"
                                  id="indianKnowledgeSystem"
                                  onChange={(event) => {
                                    validation.setFieldValue(
                                      "fileIK",
                                      event.currentTarget.files
                                        ? event.currentTarget.files[0]
                                        : null
                                    );
                                  }}
                                  disabled={typeof validation.values.fileIK === "string" && validation.values.fileIK}
                                />
                                {showTabError(3, validation.touched.fileIK, validation.errors.fileIK)}
                                {validation.touched.fileIK && validation.errors.fileIK && (
                                  <div className="text-danger">{validation.errors.fileIK}</div>
                                )}
                                {/* Show a message if the file upload button is disabled */}
                                {typeof validation.values.fileIK === "string" && validation.values.fileIK && (
                                  <div className="text-warning mt-2">
                                    Please remove the existing file to upload a new one.
                                  </div>
                                )}
                                {/* Only show the file name if it is a string (from the edit API) */}
                                {typeof validation.values.fileIK === "string" && validation.values.fileIK && (
                                  <div className="mt-2 d-flex align-items-center">
                                    <span className="me-2" style={{ fontWeight: "bold", color: "green" }}>
                                      {validation.values.fileIK}
                                    </span>
                                    <Button
                                      color="link"
                                      className="text-primary"
                                      onClick={() => validation.values.fileIK && handleDownloadFile(validation.values.fileIK as string)}
                                      title="Download File"
                                    >
                                      <i className="bi bi-download"></i>
                                    </Button>
                                    <Button
                                      color="link"
                                      className="text-danger"
                                      onClick={() => handleDeleteFile("fileIK")}
                                      title="Delete File"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </Col>
                          </Row>
                        )}
                        {/* Employability */}
                        {activeTab === 4 && (
                          <Row>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Course Title</Label>
                                <Input
                                  type="text"
                                  name="courseTitileEM"
                                  value={validation.values.courseTitileEM}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Course Title"
                                  className={
                                    validation.touched.courseTitileEM &&
                                      validation.errors.courseTitileEM
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(4, validation.touched.courseTitileEM, validation.errors.courseTitileEM)}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Course Type</Label>
                                <Select
                                  options={courseType}
                                  value={validation.values.courseTypeEM}
                                  onChange={(selectedOption) =>
                                    validation.setFieldValue(
                                      "courseTypeEM",
                                      selectedOption
                                    )
                                  }
                                  placeholder="Select Course Type"
                                  styles={dropdownStyles}
                                  menuPortalTarget={document.body}
                                  className={
                                    validation.touched.courseTypeEM &&
                                      validation.errors.courseTypeEM
                                      ? "select-error"
                                      : ""
                                  }
                                />
                                {showTabError(4, validation.touched.courseTypeEM, validation.errors.courseTypeEM)}
                              </div>
                            </Col>
                            <Col sm={4}>
                              <div className="mb-3">
                                <Label htmlFor="formFile" className="form-label">
                                  Upload file
                                </Label>
                                <Input
                                  className={`form-control ${activeTab === 4 &&
                                    validation.touched.fileEM &&
                                    validation.errors.fileEM
                                    ? "is-invalid"
                                    : ""
                                    }`}
                                  type="file"
                                  id="employability"
                                  onChange={(event) => {
                                    validation.setFieldValue(
                                      "fileEM",
                                      event.currentTarget.files
                                        ? event.currentTarget.files[0]
                                        : null
                                    );
                                  }}
                                  disabled={typeof validation.values.fileEM === "string" && validation.values.fileEM}
                                />
                                {showTabError(4, validation.touched.fileEM, validation.errors.fileEM)}
                                {validation.touched.fileEM && validation.errors.fileEM && (
                                  <div className="text-danger">{validation.errors.fileEM}</div>
                                )}
                                {/* Show a message if the file upload button is disabled */}
                                {typeof validation.values.fileEM === "string" && validation.values.fileEM && (
                                  <div className="text-warning mt-2">
                                    Please remove the existing file to upload a new one.
                                  </div>
                                )}
                                {/* Only show the file name if it is a string (from the edit API) */}
                                {typeof validation.values.fileEM === "string" && validation.values.fileEM && (
                                  <div className="mt-2 d-flex align-items-center">
                                    <span className="me-2" style={{ fontWeight: "bold", color: "green" }}>
                                      {validation.values.fileEM}
                                    </span>
                                    <Button
                                      color="link"
                                      className="text-primary"
                                      onClick={() => validation.values.fileEM && handleDownloadFile(validation.values.fileEM as string)}
                                      title="Download File"
                                    >
                                      <i className="bi bi-download"></i>
                                    </Button>
                                    <Button
                                      color="link"
                                      className="text-danger"
                                      onClick={() => handleDeleteFile("fileEM")}
                                      title="Delete File"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </Col>
                          </Row>
                        )}
                        {/* Skill Enhancement */}
                        {activeTab === 5 && (
                          <Row>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Course Title</Label>
                                <Input
                                  type="text"
                                  name="courseTitileSE"
                                  value={validation.values.courseTitileSE}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Course Title"
                                  className={
                                    validation.touched.courseTitileSE &&
                                      validation.errors.courseTitileSE
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(5, validation.touched.courseTitileSE, validation.errors.courseTitileSE)}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Course Type</Label>
                                <Select
                                  options={courseType}
                                  value={validation.values.courseTypeSE}
                                  onChange={(selectedOption) =>
                                    validation.setFieldValue(
                                      "courseTypeSE",
                                      selectedOption
                                    )
                                  }
                                  placeholder="Select Course Type"
                                  styles={dropdownStyles}
                                  menuPortalTarget={document.body}
                                  className={
                                    validation.touched.courseTypeSE &&
                                      validation.errors.courseTypeSE
                                      ? "select-error"
                                      : ""
                                  }
                                />
                                {showTabError(5, validation.touched.courseTypeSE, validation.errors.courseTypeSE)}
                              </div>
                            </Col>
                            <Col sm={4}>
                              <div className="mb-3">
                                <Label htmlFor="formFile" className="form-label">
                                  Upload file
                                </Label>
                                <Input
                                  className={`form-control ${activeTab === 5 &&
                                    validation.touched.fileSE &&
                                    validation.errors.fileSE
                                    ? "is-invalid"
                                    : ""
                                    }`}
                                  type="file"
                                  id="skillEnhancement"
                                  onChange={(event) => {
                                    validation.setFieldValue(
                                      "fileSE",
                                      event.currentTarget.files
                                        ? event.currentTarget.files[0]
                                        : null
                                    );
                                  }}
                                  disabled={typeof validation.values.fileSE === "string" && validation.values.fileSE}
                                />
                                {showTabError(5, validation.touched.fileSE, validation.errors.fileSE)}
                                {validation.touched.fileSE && validation.errors.fileSE && (
                                  <div className="text-danger">{validation.errors.fileSE}</div>
                                )}
                                {/* Show a message if the file upload button is disabled */}
                                {typeof validation.values.fileSE === "string" && validation.values.fileSE && (
                                  <div className="text-warning mt-2">
                                    Please remove the existing file to upload a new one.
                                  </div>
                                )}
                                {/* Only show the file name if it is a string (from the edit API) */}
                                {typeof validation.values.fileSE === "string" && validation.values.fileSE && (
                                  <div className="mt-2 d-flex align-items-center">
                                    <span className="me-2" style={{ fontWeight: "bold", color: "green" }}>
                                      {validation.values.fileSE}
                                    </span>
                                    <Button
                                      color="link"
                                      className="text-primary"
                                      onClick={() => validation.values.fileSE && handleDownloadFile(validation.values.fileSE as string)}
                                      title="Download File"
                                    >
                                      <i className="bi bi-download"></i>
                                    </Button>
                                    <Button
                                      color="link"
                                      className="text-danger"
                                      onClick={() => handleDeleteFile("fileSE")}
                                      title="Delete File"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </Col>
                          </Row>
                        )}
                        {/* Entrepreneurship */}
                        {activeTab === 6 && (
                          <Row>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Course Title</Label>
                                <Input
                                  type="text"
                                  name="courseTitileEN"
                                  value={validation.values.courseTitileEN}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Course Title"
                                  className={
                                    validation.touched.courseTitileEN &&
                                      validation.errors.courseTitileEN
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(6, validation.touched.courseTitileEN, validation.errors.courseTitileEN)}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Course Type</Label>
                                <Select
                                  options={courseType}
                                  value={validation.values.courseTypeEN}
                                  onChange={(selectedOption) =>
                                    validation.setFieldValue(
                                      "courseTypeEN",
                                      selectedOption
                                    )
                                  }
                                  placeholder="Select Course Type"
                                  styles={dropdownStyles}
                                  menuPortalTarget={document.body}
                                  className={
                                    validation.touched.courseTypeEN &&
                                      validation.errors.courseTypeEN
                                      ? "select-error"
                                      : ""
                                  }
                                />
                                {showTabError(6, validation.touched.courseTypeEN, validation.errors.courseTypeEN)}
                              </div>
                            </Col>
                            <Col sm={4}>
                              <div className="mb-3">
                                <Label htmlFor="formFile" className="form-label">
                                  Upload file
                                </Label>
                                <Input
                                  className={`form-control ${activeTab === 6 &&
                                    validation.touched.fileEN &&
                                    validation.errors.fileEN
                                    ? "is-invalid"
                                    : ""
                                    }`}
                                  type="file"
                                  id="entrepreneurship"
                                  onChange={(event) => {
                                    validation.setFieldValue(
                                      "fileEN",
                                      event.currentTarget.files
                                        ? event.currentTarget.files[0]
                                        : null
                                    );
                                  }}
                                  disabled={typeof validation.values.fileEN === "string" && validation.values.fileEN}
                                />
                                {showTabError(6, validation.touched.fileEN, validation.errors.fileEN)}
                                {validation.touched.fileEN && validation.errors.fileEN && (
                                  <div className="text-danger">{validation.errors.fileEN}</div>
                                )}
                                {/* Show a message if the file upload button is disabled */}
                                {typeof validation.values.fileEN === "string" && validation.values.fileEN && (
                                  <div className="text-warning mt-2">
                                    Please remove the existing file to upload a new one.
                                  </div>
                                )}
                                {/* Only show the file name if it is a string (from the edit API) */}
                                {typeof validation.values.fileEN === "string" && validation.values.fileEN && (
                                  <div className="mt-2 d-flex align-items-center">
                                    <span className="me-2" style={{ fontWeight: "bold", color: "green" }}>
                                      {validation.values.fileEN}
                                    </span>
                                    <Button
                                      color="link"
                                      className="text-primary"
                                      onClick={() => validation.values.fileEN && handleDownloadFile(validation.values.fileEN as string)}
                                      title="Download File"
                                    >
                                      <i className="bi bi-download"></i>
                                    </Button>
                                    <Button
                                      color="link"
                                      className="text-danger"
                                      onClick={() => handleDeleteFile("fileEN")}
                                      title="Delete File"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </Col>
                          </Row>
                        )}
                        {/* Ethics */}
                        {activeTab === 7 && (
                          <Row>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Course Title</Label>
                                <Input
                                  type="text"
                                  name="courseTitileET"
                                  value={validation.values.courseTitileET}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Course Title"
                                  className={
                                    validation.touched.courseTitileET &&
                                      validation.errors.courseTitileET
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(7, validation.touched.courseTitileET, validation.errors.courseTitileET)}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Course Type</Label>
                                <Select
                                  options={courseType}
                                  value={validation.values.courseTypeET}
                                  onChange={(selectedOption) =>
                                    validation.setFieldValue(
                                      "courseTypeET",
                                      selectedOption
                                    )
                                  }
                                  placeholder="Select Course Type"
                                  styles={dropdownStyles}
                                  menuPortalTarget={document.body}
                                  className={
                                    validation.touched.courseTypeET &&
                                      validation.errors.courseTypeET
                                      ? "select-error"
                                      : ""
                                  }
                                />
                                {showTabError(7, validation.touched.courseTypeET, validation.errors.courseTypeET)}
                              </div>
                            </Col>
                            <Col sm={4}>
                              <div className="mb-3">
                                <Label htmlFor="formFile" className="form-label">
                                  Upload file
                                </Label>
                                <Input
                                  className={`form-control ${activeTab === 7 &&
                                    validation.touched.fileET &&
                                    validation.errors.fileET
                                    ? "is-invalid"
                                    : ""
                                    }`}
                                  type="file"
                                  id="ethics"
                                  onChange={(event) => {
                                    validation.setFieldValue(
                                      "fileET",
                                      event.currentTarget.files
                                        ? event.currentTarget.files[0]
                                        : null
                                    );
                                  }}
                                  disabled={typeof validation.values.fileET === "string" && validation.values.fileET}
                                />
                                {showTabError(7, validation.touched.fileET, validation.errors.fileET)}
                                {validation.touched.fileET && validation.errors.fileET && (
                                  <div className="text-danger">{validation.errors.fileET}</div>
                                )}
                                {/* Show a message if the file upload button is disabled */}
                                {typeof validation.values.fileET === "string" && validation.values.fileET && (
                                  <div className="text-warning mt-2">
                                    Please remove the existing file to upload a new one.
                                  </div>
                                )}
                                {/* Only show the file name if it is a string (from the edit API) */}
                                {typeof validation.values.fileET === "string" && validation.values.fileET && (
                                  <div className="mt-2 d-flex align-items-center">
                                    <span className="me-2" style={{ fontWeight: "bold", color: "green" }}>
                                      {validation.values.fileET}
                                    </span>
                                    <Button
                                      color="link"
                                      className="text-primary"
                                      onClick={() => validation.values.fileET && handleDownloadFile(validation.values.fileET as string)}
                                      title="Download File"
                                    >
                                      <i className="bi bi-download"></i>
                                    </Button>
                                    <Button
                                      color="link"
                                      className="text-danger"
                                      onClick={() => handleDeleteFile("fileET")}
                                      title="Delete File"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </Col>
                          </Row>
                        )}
                      </div>
                    </div>
                  )}
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
                        onClick={handleListCWFClick}
                      >
                        List Course With Focus
                      </button>
                    </div>
                    <div className="mt-3">
                      {validation.status && (
                        <div className="text-danger mb-2">{validation.status}</div>
                      )}
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>List Course With Focus</ModalHeader>
          <ModalBody>
            <div className="mb-3">
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <Table className="table-hover custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>
                    Academic Year
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.academicYear}
                      onChange={(e) => handleFilterChange(e, "academicYear")}
                    />
                  </th>
                  <th>
                    Semester Type
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.semesterType}
                      onChange={(e) => handleFilterChange(e, "semesterType")}
                    />
                  </th>
                  <th>
                    Semester No
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.semesterNo}
                      onChange={(e) => handleFilterChange(e, "semesterNo")}
                    />
                  </th>
                  <th>
                    Stream
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.stream}
                      onChange={(e) => handleFilterChange(e, "stream")}
                    />
                  </th>
                  <th>
                    Department
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.department}
                      onChange={(e) => handleFilterChange(e, "department")}
                    />
                  </th>
                  <th>
                    Program Type
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.programType}
                      onChange={(e) => handleFilterChange(e, "programType")}
                    />
                  </th>
                  <th>
                    Program
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.program}
                      onChange={(e) => handleFilterChange(e, "program")}
                    />
                  </th>
                  <th>
                    Focus Area
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.percentage}
                      onChange={(e) => handleFilterChange(e, "percentage")}
                    />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((cwf, index) => (
                    <tr key={cwf.coursesWithFocusId}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{cwf.academicYear}</td>
                      <td>{cwf.semType}</td>
                      <td>{cwf.semNumber}</td>
                      <td>{cwf.streamName}</td>
                      <td>{cwf.departmentName}</td>
                      <td>{cwf.programTypeName}</td>
                      <td>{cwf.programName}</td>
                      <td>{cwf.focusArea}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(cwf.coursesWithFocusId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(cwf.coursesWithFocusId)}
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
                      No Courses With Focus available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Button
                color="primary"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <div>
                Page {currentPage} of {totalPages}
              </div>
              <Button
                color="primary"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </ModalBody>
        </Modal>
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

export default Courses_With_Focus;