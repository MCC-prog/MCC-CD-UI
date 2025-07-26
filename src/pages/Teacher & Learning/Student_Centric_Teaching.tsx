import Breadcrumb from "Components/Common/Breadcrumb";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import * as Yup from "yup";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NavItem,
  NavLink,
  Row,
  TabContent,
  Table,
  TabPane,
} from "reactstrap";
import { Link } from "react-router-dom";
import classNames from "classnames";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import SemesterDropdowns from "Components/DropDowns/SemesterDropdowns";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import ProgramDropdown from "Components/DropDowns/ProgramDropdown";
import { toast, ToastContainer } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";
import axios from "axios";
import { SEMESTER_NO_OPTIONS } from "Components/constants/layout";
import GetAllProgramDropdown from "Components/DropDowns/GetAllProgramDropdown";

const api = new APIClient();
// Helper: Check if any field in the current tab is filled
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
    courses: Yup.array()
      .of(
        Yup.object().shape({
          value: Yup.string().required(),
          label: Yup.string().required(),
        })
      )
      .min(1, "Please select at least one program")
      .required("Please select program"),
    otherDepartment: Yup.string(),
  };

  // Always include all fields in the schema, but only main form fields are required
  const allTabFields = {
    caseStudyEL: Yup.string(),
    indVisitEL: Yup.string(),
    workShopEL: Yup.string(),
    simulationtEL: Yup.string(),
    ojtInternEL: Yup.string(),
    exhibitionEL: Yup.string(),
    awarenesDriveEL: Yup.string(),
    streetPlaysEL: Yup.string(),
    fileEL: Yup.mixed().nullable(),
    caseStudyPL: Yup.string(),
    indVisitPL: Yup.string(),
    workShopPL: Yup.string(),
    simulationtPL: Yup.string(),
    ojtInternPL: Yup.string(),
    exhibitionPL: Yup.string(),
    awarenesDrivePL: Yup.string(),
    streetPlaysPL: Yup.string(),
    filePL: Yup.mixed().nullable(),
    caseStudyProblemLg: Yup.string(),
    indVisitProblemLg: Yup.string(),
    workShopProblemLg: Yup.string(),
    simulationtProblemLg: Yup.string(),
    ojtInternProblemLg: Yup.string(),
    exhibitionProblemLg: Yup.string(),
    awarenesDriveProblemLg: Yup.string(),
    streetPlaysProblemLg: Yup.string(),
    fileProblemLg: Yup.mixed().nullable(),
  };

  // Helper for file validation
  const fileValidation = (field: string) =>
    Yup.mixed().when([], {
      is: function (this: any) {
        // Only skip validation if the value is a non-empty string (existing file)
        return (
          this &&
          this.parent &&
          typeof this.parent[field] === "string" &&
          this.parent[field]
        );
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
            return ["application/pdf", "image/jpeg", "image/png"].includes(
              value.type
            );
          }),
    });

  switch (tab) {
    case 1:
      return Yup.object({
        ...mainFormSchema,
        ...allTabFields,
        caseStudyEL: Yup.string().required("Please enter case study"),
        indVisitEL: Yup.string().required("Please enter Industrial Visit"),
        workShopEL: Yup.string().required("Please enter Workshop"),
        simulationtEL: Yup.string().required("Please enter Simulation"),
        ojtInternEL: Yup.string().required("Please enter OJT/Internship"),
        exhibitionEL: Yup.string().required("Please enter Exhibition"),
        awarenesDriveEL: Yup.string().required("Please enter Awareness Drive"),
        streetPlaysEL: Yup.string().required("Please enter Street Plays"),
        fileEL: fileValidation("fileEL"),
      });
    case 2:
      return Yup.object({
        ...mainFormSchema,
        ...allTabFields,
        caseStudyPL: Yup.string().required("Please enter case study"),
        indVisitPL: Yup.string().required("Please enter Industrial Visit"),
        workShopPL: Yup.string().required("Please enter Workshop"),
        simulationtPL: Yup.string().required("Please enter Simulation"),
        ojtInternPL: Yup.string().required("Please enter OJT/Internship"),
        exhibitionPL: Yup.string().required("Please enter Exhibition"),
        awarenesDrivePL: Yup.string().required("Please enter Awareness Drive"),
        streetPlaysPL: Yup.string().required("Please enter Street Plays"),
        filePL: fileValidation("filePL"),
      });
    case 3:
      return Yup.object({
        ...mainFormSchema,
        ...allTabFields,
        caseStudyProblemLg: Yup.string().required("Please enter case study"),
        indVisitProblemLg: Yup.string().required(
          "Please enter Industrial Visit"
        ),
        workShopProblemLg: Yup.string().required("Please enter Workshop"),
        simulationtProblemLg: Yup.string().required("Please enter Simulation"),
        ojtInternProblemLg: Yup.string().required(
          "Please enter OJT/Internship"
        ),
        exhibitionProblemLg: Yup.string().required("Please enter Exhibition"),
        awarenesDriveProblemLg: Yup.string().required(
          "Please enter Awareness Drive"
        ),
        streetPlaysProblemLg: Yup.string().required(
          "Please enter Street Plays"
        ),
        fileProblemLg: fileValidation("fileProblemLg"),
      });
    default:
      return Yup.object({
        ...mainFormSchema,
        ...allTabFields,
      }).test(
        "at-least-one-nested",
        "Please select a Advance Learners Type and fill at least one nested tab.",
        (values: any) => false // Always block if no tab is active
      );
  }
};

// Helper: Clear fields for a tab
const clearTabFields = (validation: any, tab: number | null) => {
  switch (tab) {
    case 1:
      validation.setFieldValue("caseStudyEL", "");
      validation.setFieldValue("indVisitEL", "");
      validation.setFieldValue("workShopEL", "");
      validation.setFieldValue("simulationtEL", "");
      validation.setFieldValue("ojtInternEL", "");
      validation.setFieldValue("exhibitionEL", "");
      validation.setFieldValue("awarenesDriveEL", "");
      validation.setFieldValue("streetPlaysEL", "");
      validation.setFieldValue("fileEL", null);
      break;
    case 2:
      validation.setFieldValue("caseStudyPL", "");
      validation.setFieldValue("indVisitPL", "");
      validation.setFieldValue("workShopPL", "");
      validation.setFieldValue("simulationtPL", "");
      validation.setFieldValue("ojtInternPL", "");
      validation.setFieldValue("exhibitionPL", "");
      validation.setFieldValue("awarenesDrivePL", "");
      validation.setFieldValue("streetPlaysPL", "");
      validation.setFieldValue("filePL", null);
      break;
    case 3:
      validation.setFieldValue("caseStudyProblemLg", "");
      validation.setFieldValue("indVisitProblemLg", "");
      validation.setFieldValue("workShopProblemLg", "");
      validation.setFieldValue("simulationtProblemLg", "");
      validation.setFieldValue("ojtInternProblemLg", "");
      validation.setFieldValue("exhibitionProblemLg", "");
      validation.setFieldValue("awarenesDriveProblemLg", "");
      validation.setFieldValue("streetPlaysProblemLg", "");
      validation.setFieldValue("fileProblemLg", null);
      break;
    default:
      break;
  }
};

const Student_Centric_Teaching: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [CWFData, setCWFData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState(CWFData);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

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

  // Handle global search
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

  const fetchCWFData = async () => {
    try {
      const response = await api.get("/studentCentricMethodology/getAll", "");
      setCWFData(response);
      setFilteredData(response);
    } catch (error) {
      console.error(
        "Error fetching Student Centric Teaching Methodology:",
        error
      );
    }
  };

  const handleListCWFClick = () => {
    toggleModal();
    fetchCWFData();
  };

  const mapValueToLabel = (
    value: string | number | null,
    options: { value: string | number; label: string }[]
  ): { value: string | number; label: string } | null => {
    if (!value) return null;
    const matchedOption = options.find((option) => option.value === value);
    return matchedOption ? matchedOption : { value, label: String(value) };
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/studentCentricMethodology/edit?studentCentricMethodologyId=${id}`,
        ""
      );

      const academicYearOptions = await api.get("/getAllAcademicYear", "");
      const filteredAcademicYearList = academicYearOptions.filter(
        (year: any) => year.isCurrent || year.isCurrentForAdmission
      );

      const academicYearList = filteredAcademicYearList.map((year: any) => ({
        value: year.year,
        label: year.display,
      }));

      const semesterNoOptions = SEMESTER_NO_OPTIONS;

      // Base mapped values
      const mappedValues = {
        academicYear: mapValueToLabel(response.academicYear, academicYearList),
        semesterType: response.semType
          ? { value: response.semType, label: response.semType.toUpperCase() }
          : null,
        semesterNo: mapValueToLabel(
          String(response.semester),
          semesterNoOptions
        ) as { value: string; label: string } | null,
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
        courseTitle: response.courseTitle,
      };

      const streamOption = mapValueToLabel(response.streamId, []);
      const departmentOption = mapValueToLabel(response.departmentId, []);
      const programTypeOption = mapValueToLabel(response.programTypeId, []);
      const degreeOption = mapValueToLabel(response.programId, []);

      // Set common form values
      validation.setValues({
        ...validation.initialValues,
        ...mappedValues,
        courses: mappedValues.courses || [],
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
        semesterNo: mappedValues.semesterNo
          ? {
              ...mappedValues.semesterNo,
              value: String(mappedValues.semesterNo.value),
            }
          : null,
      });

      // Track if a match was found
      let matchedTab = false;

      // Experiential Learning
      if (response.experientialLearningDto) {
        const el = response.experientialLearningDto;
        validation.setFieldValue("caseStudyEL", el.caseStudy || "");
        validation.setFieldValue("indVisitEL", el.industrialVisit || "");
        validation.setFieldValue("workShopEL", el.workShop || "");
        validation.setFieldValue("simulationtEL", el.simulation || "");
        validation.setFieldValue("ojtInternEL", el.internship || "");
        validation.setFieldValue("exhibitionEL", el.exhibition || "");
        validation.setFieldValue("awarenesDriveEL", el.awarenessDrive || "");
        validation.setFieldValue("streetPlaysEL", el.streetPlays || "");
        validation.setFieldValue(
          "fileEL",
          el.documents?.ExperientialLearning || null
        );

        setActiveTab(1);
        matchedTab = true;
      }

      // Participative Learning
      else if (response.participativeLearningDto) {
        const pl = response.participativeLearningDto;
        validation.setFieldValue("caseStudyPL", pl.caseStudy || "");
        validation.setFieldValue("indVisitPL", pl.industrialVisit || "");
        validation.setFieldValue("workShopPL", pl.workShop || "");
        validation.setFieldValue("simulationtPL", pl.simulation || "");
        validation.setFieldValue("ojtInternPL", pl.internship || "");
        validation.setFieldValue("exhibitionPL", pl.exhibition || "");
        validation.setFieldValue("awarenesDrivePL", pl.awarenessDrive || "");
        validation.setFieldValue("streetPlaysPL", pl.streetPlays || "");
        validation.setFieldValue(
          "filePL",
          pl.documents?.ParticipativeLearning || null
        );

        setActiveTab(2);
        matchedTab = true;
      }

      // Problem-Based Learning
      else if (response.problemLearningDto) {
        const pr = response.problemLearningDto;
        validation.setFieldValue("caseStudyProblemLg", pr.caseStudy || "");
        validation.setFieldValue("indVisitProblemLg", pr.industrialVisit || "");
        validation.setFieldValue("workShopProblemLg", pr.workShop || "");
        validation.setFieldValue("simulationtProblemLg", pr.simulation || "");
        validation.setFieldValue("ojtInternProblemLg", pr.internship || "");
        validation.setFieldValue("exhibitionProblemLg", pr.exhibition || "");
        validation.setFieldValue(
          "awarenesDriveProblemLg",
          pr.awarenessDrive || ""
        );
        validation.setFieldValue("streetPlaysProblemLg", pr.streetPlays || "");
        validation.setFieldValue(
          "fileProblemLg",
          pr.documents?.ProblemBasedLearning || null
        );

        setActiveTab(3);
        matchedTab = true;
      }

      if (matchedTab) {
        setShowWizard(true);
      } else {
        setShowWizard(false);
        setActiveTab(null);
      }

      // Set dropdown selections
      setSelectedStream(streamOption);
      setSelectedDepartment(departmentOption);
      setSelectedProgramType(programTypeOption);

      setIsEditMode(true);
      setEditId(id);
      toggleModal();
    } catch (error) {
      toast.error("Failed to fetch data for editing.");
    }
  };

  const isTabFilled = (validation: any, tab: number | null) => {
    switch (tab) {
      case 1:
        return (
          validation.values.caseStudyEL ||
          validation.values.indVisitEL ||
          validation.values.workShopEL ||
          validation.values.simulationtEL ||
          validation.values.ojtInternEL ||
          validation.values.exhibitionEL ||
          validation.values.awarenesDriveEL ||
          validation.values.streetPlaysEL ||
          validation.values.fileEL
        );
      case 2:
        return (
          validation.values.caseStudyPL ||
          validation.values.indVisitPL ||
          validation.values.workShopPL ||
          validation.values.simulationtPL ||
          validation.values.ojtInternPL ||
          validation.values.exhibitionPL ||
          validation.values.awarenesDrivePL ||
          validation.values.streetPlaysPL ||
          validation.values.filePL
        );
      case 3:
        return (
          validation.values.caseStudyProblemLg ||
          validation.values.indVisitProblemLg ||
          validation.values.workShopProblemLg ||
          validation.values.simulationtProblemLg ||
          validation.values.ojtInternProblemLg ||
          validation.values.exhibitionProblemLg ||
          validation.values.awarenesDriveProblemLg ||
          validation.values.streetPlaysProblemLg ||
          validation.values.fileProblemLg
        );
      default:
        return false;
    }
  };

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

  // Handle file download actions
  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(
          `/CoursesWithFocus/download/${fileName}`,
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
        toast.error("Failed to download the file. Please try again.");
        // console.error("Error downloading file:", error);
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
      const response = await api.delete(
        `/CoursesWithFocus/deleteCoursesWithFocusDocument?coursesWithFocusDocumentId=${fileId}`,
        ""
      );
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      // Remove the file from the form
      validation.setFieldValue(tabKey, null); // Clear the file from Formik state
      validation.setFieldValue(tabKey + "Id", null);
    } catch (error) {
      // Show error message
      toast.error("Failed to delete the file. Please try again.");
      // console.error("Error deleting file:", error);
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
          `/studentCentricMethodology/deleteStudentCentricMethodology?studentCentricMethodologyId=${id}`,
          ""
        );
        toast.success(
          response.message ||
            "Student Centric Teaching Methodology removed successfully!"
        );
        fetchCWFData();
      } catch (error) {
        toast.error(
          "Failed to remove Student Centric Teaching Methodology. Please try again."
        );
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  type OptionType = { value: string; label: string } | null;

  interface FormValues {
    academicYear: OptionType;
    semesterType: OptionType;
    semesterNo: OptionType;
    stream: OptionType;
    department: OptionType;
    otherDepartment: string;
    courses: { value: string; label: string }[];
    courseTitle: string;
    caseStudyEL: string;
    indVisitEL: string;
    workShopEL: string;
    simulationtEL: string;
    ojtInternEL: string;
    exhibitionEL: string;
    awarenesDriveEL: string;
    streetPlaysEL: string;
    fileEL: File | null;
    caseStudyPL: string;
    indVisitPL: string;
    workShopPL: string;
    simulationtPL: string;
    ojtInternPL: string;
    exhibitionPL: string;
    awarenesDrivePL: string;
    streetPlaysPL: string;
    filePL: File | null;
    caseStudyProblemLg: string;
    indVisitProblemLg: string;
    workShopProblemLg: string;
    simulationtProblemLg: string;
    ojtInternProblemLg: string;
    exhibitionProblemLg: string;
    awarenesDriveProblemLg: string;
    streetPlaysProblemLg: string;
    fileProblemLg: File | null;
  }
  // console.log("Active tab before formik init:", activeTab);
  const validation = useFormik<FormValues>({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      semesterType: null as { value: string; label: string } | null,
      semesterNo: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      courses: [],
      courseTitle: "",
      caseStudyEL: "",
      indVisitEL: "",
      workShopEL: "",
      simulationtEL: "",
      ojtInternEL: "",
      exhibitionEL: "",
      awarenesDriveEL: "",
      streetPlaysEL: "",
      fileEL: null,
      caseStudyPL: "",
      indVisitPL: "",
      workShopPL: "",
      simulationtPL: "",
      ojtInternPL: "",
      exhibitionPL: "",
      awarenesDrivePL: "",
      streetPlaysPL: "",
      filePL: null,
      caseStudyProblemLg: "",
      indVisitProblemLg: "",
      workShopProblemLg: "",
      simulationtProblemLg: "",
      ojtInternProblemLg: "",
      exhibitionProblemLg: "",
      awarenesDriveProblemLg: "",
      streetPlaysProblemLg: "",
      fileProblemLg: null,
    },
    validationSchema: getTabValidationSchema(activeTab),
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setErrors, setSubmitting }) => {
      // Block submit if no Focus Area tab is active
      // if (!activeTab) {
      //   validation.setStatus(
      //     "Please select a Focus Area and fill at least one focus area type."
      //   );
      //   setSubmitting(false);
      //   return;
      // }
      // console.log("Submit triggered with values:", values);

      const formData = new FormData();
      const isExperintalLearningFilled =
        !!values.caseStudyEL ||
        !!values.indVisitEL ||
        !!values.workShopEL ||
        !!values.simulationtEL ||
        !!values.ojtInternEL ||
        !!values.exhibitionEL ||
        !!values.awarenesDriveEL ||
        !!values.streetPlaysEL;
      const isParticipateLearningFilled =
        !!values.caseStudyPL ||
        !!values.indVisitPL ||
        !!values.workShopPL ||
        !!values.simulationtPL ||
        !!values.ojtInternPL ||
        !!values.exhibitionPL ||
        !!values.awarenesDrivePL ||
        !!values.streetPlaysPL;
      const isProblemLearningFilled =
        !!values.caseStudyProblemLg ||
        !!values.indVisitProblemLg ||
        !!values.workShopProblemLg ||
        !!values.simulationtProblemLg ||
        !!values.ojtInternProblemLg ||
        !!values.exhibitionProblemLg ||
        !!values.awarenesDriveProblemLg ||
        !!values.awarenesDriveProblemLg;

      const advanceLearnersRequestDto = {
        studentCentricMethodologyId: editId || null,
        academicYear: Number(values.academicYear?.value || 0),
        semType: values.semesterType?.value || "",
        semester: Number(values.semesterNo?.value || ""),
        streamId: Number(values.stream?.value || 0),
        departmentId: Number(values.department?.value || 0),
        courseIds: Array.isArray(values.courses)
          ? values.courses.map((option: any) => Number(option.value))
          : [],
        courseTitle: values.courseTitle,
        methodologyTab: isExperintalLearningFilled
          ? "ExperientialLearning"
          : isParticipateLearningFilled
          ? "ParticipativeLearning"
          : isProblemLearningFilled
          ? "ProblemLearning"
          : null,
        experientialLearningDto:
          activeTab === 1
            ? {
                caseStudy: values.caseStudyEL,
                industrialVisit: values.indVisitEL,
                workShop: values.workShopEL,
                simulation: values.simulationtEL,
                internship: values.ojtInternEL,
                exhibition: values.exhibitionEL,
                awarenessDrive: values.awarenesDriveEL,
                streetPlays: values.streetPlaysEL,
              }
            : null,
        problemLearningDto:
          activeTab === 2
            ? {
                caseStudy: values.caseStudyPL,
                industrialVisit: values.indVisitPL,
                workShop: values.workShopPL,
                simulation: values.simulationtPL,
                internship: values.ojtInternPL,
                exhibition: values.exhibitionPL,
                awarenessDrive: values.awarenesDrivePL,
                streetPlays: values.streetPlaysPL,
              }
            : null,
        participativeLearningDto:
          activeTab === 3
            ? {
                caseStudy: values.caseStudyPL,
                industrialVisit: values.indVisitPL,
                workShop: values.workShopPL,
                simulation: values.simulationtPL,
                internship: values.ojtInternPL,
                exhibition: values.exhibitionPL,
                awarenessDrive: values.awarenesDrivePL,
                streetPlays: values.streetPlaysPL,
              }
            : null,
      };

      console.log("Request DTO:", advanceLearnersRequestDto);

      formData.append(
        "studentCentricMethodologyRequestDto ",
        new Blob([JSON.stringify(advanceLearnersRequestDto)], {
          type: "application/json",
        })
      );

      let selectedFile: File | null = null;

      if (values.fileEL) {
        selectedFile = values.fileEL;
      } else if (values.filePL) {
        selectedFile = values.filePL;
      } else if (values.fileProblemLg) {
        selectedFile = values.fileProblemLg;
      }

      if (isEditMode) {
        if (typeof selectedFile === "string" || selectedFile === null) {
          formData.append(
            "file",
            new Blob([], { type: "application/pdf" }),
            "empty.pdf"
          );
        } else {
          formData.append("file", selectedFile);
        }
      } else {
        if (selectedFile) {
          formData.append("file", selectedFile);
        }
      }

      // console.log("Form Data:", formData);
      try {
        const response =
          isEditMode && editId
            ? await api.put(`/studentCentricMethodology/update`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              })
            : await api.create(`/studentCentricMethodology/save`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
        toast.success(response.message || "Successfully submitted!");
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
      } catch (error) {
        toast.error("Submission failed.");
        // console.error("Form submission error:", error);
      }
    },
  });

  const showTabError = (tab: number, touched: any, error: any) =>
    activeTab === tab && touched && error ? (
      <div className="text-danger">{error}</div>
    ) : null;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Teacher & Learning"
            breadcrumbItem="Student Centric Teaching Methodology"
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
                  {/* Program  Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Program</Label>
                      <GetAllProgramDropdown
                        placeholder="Select Program"
                        value={validation.values.courses}
                        onChange={(selectedOption) => {
                          validation.setFieldValue("courses", selectedOption);
                        }}
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

                  {/* Semester Dropdowns */}
                  <Col lg={8}>
                    <SemesterDropdowns
                      semesterTypeValue={validation.values.semesterType} // Single object for single-select
                      semesterNoValue={validation.values.semesterNo} // Array for multiselect
                      onSemesterTypeChange={
                        (selectedOption) =>
                          validation.setFieldValue(
                            "semesterType",
                            selectedOption
                          ) // Single object
                      }
                      onSemesterNoChange={
                        (selectedOptions) =>
                          validation.setFieldValue(
                            "semesterNo",
                            selectedOptions
                          ) // Array of selected values
                      }
                      isSemesterTypeInvalid={
                        validation.touched.semesterType &&
                        !!validation.errors.semesterType
                      }
                      isSemesterNoInvalid={
                        validation.touched.semesterNo &&
                        !!validation.errors.semesterNo
                      }
                      semesterTypeError={
                        validation.touched.semesterType
                          ? Array.isArray(validation.errors.semesterType)
                            ? validation.errors.semesterType.join(", ")
                            : validation.errors.semesterType
                          : null
                      }
                      semesterNoError={
                        validation.touched.semesterNo
                          ? Array.isArray(validation.errors.semesterNo)
                            ? validation.errors.semesterNo.join(", ")
                            : validation.errors.semesterNo
                          : null
                      }
                      semesterTypeTouched={!!validation.touched.semesterType}
                      semesterNoTouched={!!validation.touched.semesterNo}
                    />
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Course Title</Label>
                      <Input
                        type="text"
                        placeholder="Enter Course Title"
                        className={`form-control ${
                          validation.touched.courseTitle &&
                          validation.errors.courseTitle
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.courseTitle}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "courseTitle",
                            e.target.value
                          )
                        }
                      />
                      {validation.touched.courseTitle &&
                        validation.errors.courseTitle && (
                          <div className="text-danger">
                            {validation.errors.courseTitle}
                          </div>
                        )}
                    </div>
                  </Col>
                  <div className="mb-3 mt-3 d-grid">
                    <button
                      className="btn btn-primary toggle-wizard-button"
                      onClick={toggleWizard}
                      type="button"
                    >
                      Methodology Tabs
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
                        {[1, 2, 3].map((tab) => (
                          <button
                            type="button"
                            key={tab}
                            className={`step-button ${
                              activeTab === tab ? "active" : ""
                            }`}
                            onClick={() => toggleTab(tab)}
                            disabled={
                              activeTab !== tab &&
                              isTabFilled(validation, activeTab)
                            }
                            style={
                              activeTab !== tab &&
                              isTabFilled(validation, activeTab)
                                ? { opacity: 0.5, cursor: "not-allowed" }
                                : {}
                            }
                          >
                            {tab}.{" "}
                            {tab === 1
                              ? "Experiental Learning"
                              : tab === 2
                              ? "Participative Learning"
                              : "Problem Learning"}
                          </button>
                        ))}
                      </div>
                      <div className="mb-2 mt-2">
                        {activeTab && (
                          <button
                            type="button"
                            className="btn btn-outline-warning btn-sm"
                            onClick={() =>
                              clearTabFields(validation, activeTab)
                            }
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="tab-content">
                        {/* Gender */}
                        {activeTab === 1 && (
                          <Row>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Case Study</Label>
                                <Input
                                  type="text"
                                  name="caseStudyEL"
                                  value={validation.values.caseStudyEL}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Case Study"
                                  className={
                                    validation.touched.caseStudyEL &&
                                    validation.errors.caseStudyEL
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  1,
                                  validation.touched.caseStudyEL,
                                  validation.errors.caseStudyEL
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Industrial Visit</Label>
                                <Input
                                  type="text"
                                  name="indVisitEL"
                                  value={validation.values.indVisitEL}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Industrial Visit"
                                  className={
                                    validation.touched.indVisitEL &&
                                    validation.errors.indVisitEL
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  1,
                                  validation.touched.indVisitEL,
                                  validation.errors.indVisitEL
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Workshop</Label>
                                <Input
                                  type="text"
                                  name="workShopEL"
                                  value={validation.values.workShopEL}
                                  onChange={validation.handleChange}
                                  placeholder="Enter workshop"
                                  className={
                                    validation.touched.workShopEL &&
                                    validation.errors.workShopEL
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  1,
                                  validation.touched.workShopEL,
                                  validation.errors.workShopEL
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Simulation</Label>
                                <Input
                                  type="text"
                                  name="simulationtEL"
                                  value={validation.values.simulationtEL}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Simulation"
                                  className={
                                    validation.touched.simulationtEL &&
                                    validation.errors.simulationtEL
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  1,
                                  validation.touched.simulationtEL,
                                  validation.errors.simulationtEL
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>OJT/Internship</Label>
                                <Input
                                  type="text"
                                  name="ojtInternEL"
                                  value={validation.values.ojtInternEL}
                                  onChange={validation.handleChange}
                                  placeholder="Enter OJT/Internship"
                                  className={
                                    validation.touched.ojtInternEL &&
                                    validation.errors.ojtInternEL
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  1,
                                  validation.touched.ojtInternEL,
                                  validation.errors.ojtInternEL
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Exhibition</Label>
                                <Input
                                  type="text"
                                  name="exhibitionEL"
                                  value={validation.values.exhibitionEL}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Exhibition"
                                  className={
                                    validation.touched.exhibitionEL &&
                                    validation.errors.exhibitionEL
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  1,
                                  validation.touched.exhibitionEL,
                                  validation.errors.exhibitionEL
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Awareness Drive</Label>
                                <Input
                                  type="text"
                                  name="awarenesDriveEL"
                                  value={validation.values.awarenesDriveEL}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Awareness Drive"
                                  className={
                                    validation.touched.awarenesDriveEL &&
                                    validation.errors.awarenesDriveEL
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  1,
                                  validation.touched.awarenesDriveEL,
                                  validation.errors.awarenesDriveEL
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Street Plays</Label>
                                <Input
                                  type="text"
                                  name="streetPlaysEL"
                                  value={validation.values.streetPlaysEL}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Street Plays"
                                  className={
                                    validation.touched.streetPlaysEL &&
                                    validation.errors.streetPlaysEL
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  1,
                                  validation.touched.streetPlaysEL,
                                  validation.errors.streetPlaysEL
                                )}
                              </div>
                            </Col>
                            <Col sm={4}>
                              <div className="mb-3">
                                <Label
                                  htmlFor="formFile"
                                  className="form-label"
                                >
                                  Upload file
                                </Label>
                                <Input
                                  className={`form-control ${
                                    activeTab === 1 &&
                                    validation.touched.fileEL &&
                                    validation.errors.fileEL
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  type="file"
                                  id="fileEL"
                                  onChange={(event) => {
                                    validation.setFieldValue(
                                      "fileEL",
                                      event.currentTarget.files
                                        ? event.currentTarget.files[0]
                                        : null
                                    );
                                  }}
                                />
                                {showTabError(
                                  1,
                                  validation.touched.fileEL,
                                  validation.errors.fileEL
                                )}
                                {isFileUploadDisabled && (
                                  <div className="text-warning mt-2">
                                    Please remove the existing file to upload a
                                    new one.
                                  </div>
                                )}
                                {/* Only show the file name if it is a string (from the edit API) */}
                                {typeof validation.values.fileEL ===
                                  "string" && (
                                  <div className="mt-2 d-flex align-items-center">
                                    <span
                                      className="me-2"
                                      style={{
                                        fontWeight: "bold",
                                        color: "green",
                                      }}
                                    >
                                      {validation.values.fileEL}
                                    </span>
                                    <Button
                                      color="link"
                                      className="text-primary"
                                      onClick={() =>
                                        handleDownloadFile(
                                          typeof validation.values.fileEL ===
                                            "string"
                                            ? validation.values.fileEL
                                            : ""
                                        )
                                      }
                                      title="Download File"
                                    >
                                      <i className="bi bi-download"></i>
                                    </Button>
                                    <Button
                                      color="link"
                                      className="text-danger"
                                      onClick={() => handleDeleteFile("fileEL")}
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
                                <Label>Case Study</Label>
                                <Input
                                  type="text"
                                  name="caseStudyPL"
                                  value={validation.values.caseStudyPL}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Case Study"
                                  className={
                                    validation.touched.caseStudyPL &&
                                    validation.errors.caseStudyPL
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  2,
                                  validation.touched.caseStudyPL,
                                  validation.errors.caseStudyPL
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Industrial Visit</Label>
                                <Input
                                  type="text"
                                  name="indVisitPL"
                                  value={validation.values.indVisitPL}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Industrial Visit"
                                  className={
                                    validation.touched.indVisitPL &&
                                    validation.errors.indVisitPL
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  2,
                                  validation.touched.indVisitPL,
                                  validation.errors.indVisitPL
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Workshop</Label>
                                <Input
                                  type="text"
                                  name="workShopPL"
                                  value={validation.values.workShopPL}
                                  onChange={validation.handleChange}
                                  placeholder="Enter workshop"
                                  className={
                                    validation.touched.workShopPL &&
                                    validation.errors.workShopPL
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  2,
                                  validation.touched.workShopPL,
                                  validation.errors.workShopPL
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Simulation</Label>
                                <Input
                                  type="text"
                                  name="simulationtPL"
                                  value={validation.values.simulationtPL}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Simulation"
                                  className={
                                    validation.touched.simulationtPL &&
                                    validation.errors.simulationtPL
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  2,
                                  validation.touched.simulationtPL,
                                  validation.errors.simulationtPL
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>OJT/Internship</Label>
                                <Input
                                  type="text"
                                  name="ojtInternPL"
                                  value={validation.values.ojtInternPL}
                                  onChange={validation.handleChange}
                                  placeholder="Enter OJT/Internship"
                                  className={
                                    validation.touched.ojtInternPL &&
                                    validation.errors.ojtInternPL
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  2,
                                  validation.touched.ojtInternPL,
                                  validation.errors.ojtInternPL
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Exhibition</Label>
                                <Input
                                  type="text"
                                  name="exhibitionPL"
                                  value={validation.values.exhibitionPL}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Exhibition"
                                  className={
                                    validation.touched.exhibitionPL &&
                                    validation.errors.exhibitionPL
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  2,
                                  validation.touched.exhibitionPL,
                                  validation.errors.exhibitionPL
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Awareness Drive</Label>
                                <Input
                                  type="text"
                                  name="awarenesDrivePL"
                                  value={validation.values.awarenesDrivePL}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Awareness Drive"
                                  className={
                                    validation.touched.awarenesDrivePL &&
                                    validation.errors.awarenesDrivePL
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  2,
                                  validation.touched.awarenesDrivePL,
                                  validation.errors.awarenesDrivePL
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Street Plays</Label>
                                <Input
                                  type="text"
                                  name="streetPlaysPL"
                                  value={validation.values.streetPlaysPL}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Street Plays"
                                  className={
                                    validation.touched.streetPlaysPL &&
                                    validation.errors.streetPlaysPL
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  2,
                                  validation.touched.streetPlaysPL,
                                  validation.errors.streetPlaysPL
                                )}
                              </div>
                            </Col>
                            <Col sm={4}>
                              <div className="mb-3">
                                <Label
                                  htmlFor="formFile"
                                  className="form-label"
                                >
                                  Upload file
                                </Label>
                                <Input
                                  className={`form-control ${
                                    activeTab === 2 &&
                                    validation.touched.filePL &&
                                    validation.errors.filePL
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  type="file"
                                  id="gender"
                                  onChange={(event) => {
                                    validation.setFieldValue(
                                      "filePL",
                                      event.currentTarget.files
                                        ? event.currentTarget.files[0]
                                        : null
                                    );
                                  }}
                                />
                                {showTabError(
                                  2,
                                  validation.touched.filePL,
                                  validation.errors.filePL
                                )}
                                {isFileUploadDisabled && (
                                  <div className="text-warning mt-2">
                                    Please remove the existing file to upload a
                                    new one.
                                  </div>
                                )}
                                {/* Show a message if the file upload button is disabled */}
                                {typeof validation.values.filePL ===
                                  "string" && (
                                  <div className="text-warning mt-2">
                                    Please remove the existing file to upload a
                                    new one.
                                  </div>
                                )}
                                {/* Only show the file name if it is a string (from the edit API) */}
                                {typeof validation.values.filePL === "string" &&
                                  validation.values.filePL && (
                                    <div className="mt-2 d-flex align-items-center">
                                      <span
                                        className="me-2"
                                        style={{
                                          fontWeight: "bold",
                                          color: "green",
                                        }}
                                      >
                                        {validation.values.filePL}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          validation.values.filePL &&
                                          handleDownloadFile(
                                            validation.values
                                              .filePL as unknown as string
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
                                          handleDeleteFile("filePL")
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
                        )}
                        {/* Indian Knowledge System */}
                        {activeTab === 3 && (
                          <Row>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Case Study</Label>
                                <Input
                                  type="text"
                                  name="caseStudyProblemLg"
                                  value={validation.values.caseStudyProblemLg}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Case Study"
                                  className={
                                    validation.touched.caseStudyProblemLg &&
                                    validation.errors.caseStudyProblemLg
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  3,
                                  validation.touched.caseStudyProblemLg,
                                  validation.errors.caseStudyProblemLg
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Industrial Visit</Label>
                                <Input
                                  type="text"
                                  name="indVisitProblemLg"
                                  value={validation.values.indVisitProblemLg}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Industrial Visit"
                                  className={
                                    validation.touched.indVisitProblemLg &&
                                    validation.errors.indVisitProblemLg
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  3,
                                  validation.touched.indVisitProblemLg,
                                  validation.errors.indVisitProblemLg
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Workshop</Label>
                                <Input
                                  type="text"
                                  name="workShopProblemLg"
                                  value={validation.values.workShopProblemLg}
                                  onChange={validation.handleChange}
                                  placeholder="Enter workshop"
                                  className={
                                    validation.touched.workShopProblemLg &&
                                    validation.errors.workShopProblemLg
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  3,
                                  validation.touched.workShopProblemLg,
                                  validation.errors.workShopProblemLg
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Simulation</Label>
                                <Input
                                  type="text"
                                  name="simulationtProblemLg"
                                  value={validation.values.simulationtProblemLg}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Simulation"
                                  className={
                                    validation.touched.simulationtProblemLg &&
                                    validation.errors.simulationtProblemLg
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  3,
                                  validation.touched.simulationtProblemLg,
                                  validation.errors.simulationtProblemLg
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>OJT/Internship</Label>
                                <Input
                                  type="text"
                                  name="ojtInternProblemLg"
                                  value={validation.values.ojtInternProblemLg}
                                  onChange={validation.handleChange}
                                  placeholder="Enter OJT/Internship"
                                  className={
                                    validation.touched.ojtInternProblemLg &&
                                    validation.errors.ojtInternProblemLg
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  3,
                                  validation.touched.ojtInternProblemLg,
                                  validation.errors.ojtInternProblemLg
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Exhibition</Label>
                                <Input
                                  type="text"
                                  name="exhibitionProblemLg"
                                  value={validation.values.exhibitionProblemLg}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Exhibition"
                                  className={
                                    validation.touched.exhibitionProblemLg &&
                                    validation.errors.exhibitionProblemLg
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  3,
                                  validation.touched.exhibitionProblemLg,
                                  validation.errors.exhibitionProblemLg
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Awareness Drive</Label>
                                <Input
                                  type="text"
                                  name="awarenesDriveProblemLg"
                                  value={
                                    validation.values.awarenesDriveProblemLg
                                  }
                                  onChange={validation.handleChange}
                                  placeholder="Enter Awareness Drive"
                                  className={
                                    validation.touched.awarenesDriveProblemLg &&
                                    validation.errors.awarenesDriveProblemLg
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  3,
                                  validation.touched.awarenesDriveProblemLg,
                                  validation.errors.awarenesDriveProblemLg
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Street Plays</Label>
                                <Input
                                  type="text"
                                  name="streetPlaysProblemLg"
                                  value={validation.values.streetPlaysProblemLg}
                                  onChange={validation.handleChange}
                                  placeholder="Enter Street Plays"
                                  className={
                                    validation.touched.streetPlaysProblemLg &&
                                    validation.errors.streetPlaysProblemLg
                                      ? "input-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  3,
                                  validation.touched.streetPlaysProblemLg,
                                  validation.errors.streetPlaysProblemLg
                                )}
                              </div>
                            </Col>
                            <Col sm={4}>
                              <div className="mb-3">
                                <Label
                                  htmlFor="formFile"
                                  className="form-label"
                                >
                                  Upload file
                                </Label>
                                <Input
                                  className={`form-control ${
                                    activeTab === 3 &&
                                    validation.touched.fileProblemLg &&
                                    validation.errors.fileProblemLg
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
                                  disabled={
                                    typeof validation.values.fileProblemLg ===
                                      "string" &&
                                    validation.values.fileProblemLg
                                  }
                                />
                                {showTabError(
                                  3,
                                  validation.touched.fileProblemLg,
                                  validation.errors.fileProblemLg
                                )}
                                {isFileUploadDisabled && (
                                  <div className="text-warning mt-2">
                                    Please remove the existing file to upload a
                                    new one.
                                  </div>
                                )}
                                {/* Only show the file name if it is a string (from the edit API) */}
                                {typeof validation.values.fileProblemLg ===
                                  "string" && (
                                  <div className="mt-2 d-flex align-items-center">
                                    <span
                                      className="me-2"
                                      style={{
                                        fontWeight: "bold",
                                        color: "green",
                                      }}
                                    >
                                      {validation.values.fileProblemLg}
                                    </span>
                                    <Button
                                      color="link"
                                      className="text-primary"
                                      onClick={() =>
                                        validation.values.fileProblemLg &&
                                        handleDownloadFile(
                                          validation.values
                                            .fileProblemLg as unknown as string
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
                                        handleDeleteFile("fileProblemLg")
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
                        List Student Centric Teaching
                      </button>
                    </div>
                    <div className="mt-3">
                      {validation.status && (
                        <div className="text-danger mb-2">
                          {validation.status}
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Advanced Learners */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>List Advanced Learners</ModalHeader>
          <ModalBody>
            {/* Global Search */}
            <div className="mb-3">
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            {/* Table with Pagination */}
            <Table
              striped
              bordered
              hover
              responsive
              className="align-middle text-center"
            >
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>Semester Type</th>
                  <th>Semester No</th>
                  <th>Stream</th>
                  <th>Department</th>
                  <th>Courses</th>
                  <th>Course Title</th>
                  <th>Methodology Tab</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((als, index) => (
                    <tr key={als.studentCentricMethodologyId}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{als.academicYear}</td>
                      <td>{als.semType}</td>
                      <td>{als.semester}</td>
                      <td>{als.streamName}</td>
                      <td>{als.departmentName}</td>
                      <td>
                        <ul className="list-disc list-inside">
                          {Object.values(als.courses).map((courseName, idx) => (
                            <li key={idx}>
                              {typeof courseName === "string" ||
                              typeof courseName === "number"
                                ? courseName
                                : String(courseName)}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>{als.courseTitle}</td>
                      <td>{als.methodologyTab}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() =>
                              handleEdit(als.studentCentricMethodologyId)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleDelete(als.studentCentricMethodologyId)
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
                    <td colSpan={11} className="text-center">
                      No Advanced Learners data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            {/* Pagination Controls */}
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

export default Student_Centric_Teaching;
