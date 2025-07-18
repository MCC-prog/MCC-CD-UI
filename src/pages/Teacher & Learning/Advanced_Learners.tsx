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
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import SemesterDropdowns from "Components/DropDowns/SemesterDropdowns";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
import { toast, ToastContainer } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";
import { s } from "@fullcalendar/core/internal-common";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import { SEMESTER_NO_OPTIONS } from "Components/constants/layout";
import axios from "axios";

const api = new APIClient();

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
    programType: Yup.object().nullable().required("Please select programType"),
    otherDepartment: Yup.string(),
    degree: Yup.object<{ value: string; label: string }>()
      .nullable()
      .required("Please select degree"),
  };

  // Always include all fields in the schema, but only main form fields are required
  const allTabFields = {
    researchProjectTitle: Yup.string(),
    projectType: Yup.object().nullable(),
    Type: Yup.object().nullable(),
    researchDuration: Yup.string(),
    researchGuideName: Yup.string(),
    researchAmount: Yup.number(),
    file: Yup.mixed().nullable(),
    SynopsisFile: Yup.mixed().nullable(),
    peerCourseTitile: Yup.object().nullable(),
    peerMentorShip: Yup.object().nullable(),
    peerRegisterNumber: Yup.string(),
    peerTeacherCoOrdinator: Yup.string(),
    peerFile: Yup.mixed().nullable(),
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
        researchProjectTitle: Yup.string().required(
          "Please enter project title"
        ),
        projectType: Yup.object()
          .nullable()
          .required("Please select project type"),
        Type: Yup.object().nullable().required("Please select type"),
        researchDuration: Yup.string()
          .required("Please enter duration")
          .matches(/^\d+$/, "Duration must be a number"),
        researchGuideName: Yup.string()
          .required("Please enter guide name")
          .min(2, "Guide name must be at least 2 characters long"),
        researchAmount: Yup.number()
          .required("Please enter amount")
          .positive("Amount must be a positive number")
          .integer("Amount must be an integer"),
        file: fileValidation("file"),
        SynopsisFile: fileValidation("SynopsisFile"),
      });
    case 2:
      return Yup.object({
        ...mainFormSchema,
        ...allTabFields,
        peerCourseTitile: Yup.object()
          .nullable()
          .required("Please select course title"),
        peerMentorShip: Yup.object()
          .nullable()
          .required("Please select mentorship"),
        peerRegisterNumber: Yup.string().required(
          "Please enter register number"
        ),
        peerTeacherCoOrdinator: Yup.string()
          .required("Please enter teacher co-ordinator")
          .min(
            2,
            "Teacher co-ordinator name must be at least 2 characters long"
          ),
        peerFile: fileValidation("peerFile"),
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

const Advanced_Learners: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [advancedLearnerData, setAdvancedLearnerData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [researchProjectId, setResearchProjectId] = useState<number | null>(
    null
  );
  const [peerTeachingId, setPeerTeachingId] = useState<number | null>(null);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [editResData, setEditResData] = useState<any>(null);

  const clearTabFields = async (validation: any, tab: number | null) => {
    try {
      let deleteId = null;

      if (tab === 1 && editResData?.researchProjectDto?.researchProjectId) {
        deleteId = editResData.researchProjectDto.researchProjectId;
      } else if (tab === 2 && editResData?.peerTeachingDto?.peerTeachingId) {
        deleteId = editResData.peerTeachingDto.peerTeachingId;
      }

      if (deleteId) {
        await api.delete(
          `/advanceLearners/deleteAdvanceLearnerTabsAndDoc?advanceLearnerAddTabId=${deleteId}`,""
        );
      }
      switch (tab) {
        case 1:
          validation.setFieldValue("researchProjectTitle", "");
          validation.setFieldValue("projectType", null);
          validation.setFieldValue("Type", null);
          validation.setFieldValue("researchDuration", "");
          validation.setFieldValue("researchGuideName", "");
          validation.setFieldValue("researchAmount", "");
          validation.setFieldValue("file", null);
          validation.setFieldValue("SynopsisFile", null);

          break;
        case 2:
          validation.setFieldValue("peerCourseTitile", null);
          validation.setFieldValue("peerMentorShip", null);
          validation.setFieldValue("peerRegisterNumber", "");
          validation.setFieldValue("peerTeacherCoOrdinator", "");
          validation.setFieldValue("peerFile", null);

          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Delete API failed", error);
    }
  };

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

    const filtered = advancedLearnerData.filter((row) =>
      Object.values(row).some((val) =>
        String(val || "")
          .toLowerCase()
          .includes(value)
      )
    );
    setFilteredData(filtered);
  };

  // Toggle the modal for listing Advanced Learners
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Advanced Learners data from the backend
  const fetchExperientialLearningData = async () => {
    try {
      const response = await api.get(
        "/advanceLearners/getAllAdvanceLearners",
        ""
      );
      setAdvancedLearnerData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Advanced Learners data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListBosClick = () => {
    toggleModal();
    fetchExperientialLearningData();
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
        `/advanceLearners/edit?advanceLearnersId=${id}`,
        ""
      );

      const academicYearOptions = await api.get("/getAllAcademicYear", "");
      setEditResData(response);
      // Filter the response where isCurrent or isCurrentForAdmission is true
      const filteredAcademicYearList = academicYearOptions.filter(
        (year: any) => year.isCurrent || year.isCurrentForAdmission
      );
      // Map the filtered data to the required format
      const academicYearList = filteredAcademicYearList.map((year: any) => ({
        value: year.year,
        label: year.display,
      }));

      const semesterNoOptions = SEMESTER_NO_OPTIONS;
      // Map API response to Formik values
      const mappedValues = {
        academicYear: mapValueToLabel(response.academicYear, academicYearList),
        semesterType: response.semType
          ? { value: response.semType, label: response.semType.toUpperCase() }
          : null,
        semesterNo: mapValueToLabel(
          String(response.semesterNo),
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
        programType: response.programTypeId
          ? {
              value: response.programTypeId.toString(),
              label: response.programTypeName,
            }
          : null,
        degree: response.programId
          ? {
              value: response.programId.toString(),
              label: response.programName,
            }
          : null,
        program: response.courses
          ? Object.entries(response.courses).map(([key, value]) => ({
              value: key,
              label: String(value),
            }))
          : [],
        researchProjectType: response.researchProjectDto
          ? {
              value: response.researchProjectDto.typeOfProject,
              label: response.researchProjectDto.typeOfProject,
            }
          : null,
        researchProjectTitle: response.researchProjectDto?.projectTitle || "",
        projectType: response.researchProjectDto
          ? {
              value: response.researchProjectDto.typeOfProject,
              label: response.researchProjectDto.typeOfProject,
            }
          : null,
        Type: response.researchProjectDto
          ? {
              value: response.researchProjectDto.fundType,
              label: response.researchProjectDto.fundType,
            }
          : null,
        researchDuration: response.researchProjectDto
          ? response.researchProjectDto.duration || ""
          : "",
        researchGuideName: response.researchProjectDto
          ? response.researchProjectDto.guideName || ""
          : "",
        researchAmount: response.researchProjectDto
          ? response.researchProjectDto.amount || ""
          : "",
        file: response.documents?.projectSanctionLetter || null,
        SynopsisFile: response.documents?.synopsisReport || null,
        peerCourseTitile: response.peerTeachingDto
          ? {
              value: response.peerTeachingDto.courseTitle,
              label: response.peerTeachingDto.courseTitle,
            }
          : null,
        peerMentorShip: response.peerTeachingDto
          ? {
              value: response.peerTeachingDto.mentorship,
              label: response.peerTeachingDto.mentorship
                ? response.peerTeachingDto.mentorship === "true"
                  ? "Yes"
                  : "No"
                : "",
            }
          : null,
        peerRegisterNumber: response.peerTeachingDto?.registerNo || "",
        peerTeacherCoOrdinator:
          response.peerTeachingDto?.teacherCordinator || "",
        peerFile: response.documents?.peerTeaching || null,
      };
      const streamOption = mapValueToLabel(response.streamId, []); // Replace [] with stream options array if available
      const departmentOption = mapValueToLabel(response.departmentId, []); // Replace [] with department options array if available
      const programTypeOption = mapValueToLabel(response.programTypeId, []); // Replace [] with program type options array if available
      const degreeOption = mapValueToLabel(response.programId, []);

      // Update Formik values
      formik.setValues({
        ...formik.initialValues,
        ...mappedValues,
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
        researchProjectTitle: response.researchProjectDto?.projectTitle || "",
        projectType: response.researchProjectDto
          ? {
              value: response.researchProjectDto.typeOfProject,
              label: response.researchProjectDto.typeOfProject,
            }
          : null,
        Type: response.researchProjectDto
          ? {
              value: response.researchProjectDto.fundType,
              label: response.researchProjectDto.fundType,
            }
          : null,
        researchDuration: response.researchProjectDto
          ? response.researchProjectDto.duration || ""
          : "",
        researchGuideName: response.researchProjectDto
          ? response.researchProjectDto.guideName || ""
          : "",
        researchAmount: response.researchProjectDto
          ? response.researchProjectDto.amount || ""
          : "",
        file: response.documents.projectSanctionLetter || null, // Reset file field
        SynopsisFile: response.documents.synopsisReport || null, // Reset SynopsisFile field
        peerCourseTitile: response.peerTeachingDto
          ? {
              value: response.peerTeachingDto.courseTitle,
              label: response.peerTeachingDto.courseTitle,
            }
          : null,
        peerMentorShip: response.peerTeachingDto
          ? {
              value: response.peerTeachingDto.mentorship,
              label: response.peerTeachingDto.mentorship
                ? response.peerTeachingDto.mentorship === "true"
                  ? "Yes"
                  : "No"
                : "",
            }
          : null,
        peerRegisterNumber: response.peerTeachingDto?.registerNo || "",
        peerTeacherCoOrdinator:
          response.peerTeachingDto?.teacherCordinator || "",
        peerFile: response.documents.peerTeaching || null, // Reset peerFile field
      });

      const getCourseTypeOption = (value: string) =>
        projectType.find((opt) => opt.value === value) || null;

      // Nested tab data
      if (
        response.researchProjectDto &&
        (response.researchProjectDto.projectTitle ||
          response.researchProjectDto.typeOfProject)
      ) {
        setShowWizard(true);
        setActiveTab(1);
        formik.setFieldValue(
          "researchProjectTitle",
          response.researchProjectDto.projectTitle || ""
        );
        formik.setFieldValue(
          "projectType",
          getCourseTypeOption(response.researchProjectDto.typeOfProject)
        );
        formik.setFieldValue(
          "Type",
          response.researchProjectDto.fundType
            ? {
                value: response.researchProjectDto.fundType,
                label: response.researchProjectDto.fundType,
              }
            : null
        );
        formik.setFieldValue(
          "researchDuration",
          response.researchProjectDto.duration || ""
        );
        formik.setFieldValue(
          "researchGuideName",
          response.researchProjectDto.guideName || ""
        );
        formik.setFieldValue(
          "researchAmount",
          response.researchProjectDto.amount || ""
        );
        formik.setFieldValue(
          "file",
          response.documents.projectSanctionLetter || null
        );
        formik.setFieldValue(
          "SynopsisFile",
          response.documents.synopsisReport || null
        );
        formik.setFieldValue(
          "researchProjectId",
          response.researchProjectDto?.researchProjectId || null
        );
        setResearchProjectId(
          response.researchProjectDto?.researchProjectId || null
        );
      } else if (
        response.peerTeachingDto &&
        (response.peerTeachingDto.courseTitle ||
          response.peerTeachingDto.registerNo)
      ) {
        setSelectedStream(streamOption);
        setSelectedDepartment(departmentOption);
        setSelectedProgramType(programTypeOption);
        setPeerTeachingId(response.peerTeachingDto?.peerTeachingId || null);
        setSelectedDegree(degreeOption);

        setShowWizard(true);
        setActiveTab(2);
        formik.setFieldValue(
          "peerCourseTitile",
          response.peerTeachingDto.courseTitle
            ? {
                value: response.peerTeachingDto.courseTitle,
                label: response.peerTeachingDto.courseTitle,
              }
            : null
        );
        formik.setFieldValue(
          "peerMentorShip",
          response.peerTeachingDto.mentorship
            ? {
                value: response.peerTeachingDto.mentorship,
                label: response.peerTeachingDto.mentorship
                  ? response.peerTeachingDto.mentorship === "true"
                    ? "Yes"
                    : "No"
                  : "",
              }
            : null
        );
        formik.setFieldValue(
          "peerRegisterNumber",
          response.peerTeachingDto.registerNo || ""
        );
        formik.setFieldValue(
          "peerTeacherCoOrdinator",
          response.peerTeachingDto.teacherCordinator || ""
        );
        formik.setFieldValue(
          "peerFile",
          response.documents.peerTeaching || null
        );

        formik.setFieldValue(
          "peerTeachingId",
          response.peerTeachingDto?.peerTeachingId || null
        );
      } else {
        setShowWizard(false);
        setActiveTab(null);
      }
      setResearchProjectId(
        response.researchProjectDto?.researchProjectId || null
      );
      setPeerTeachingId(response.peerTeachingDto?.peerTeachingId || null);

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
          validation.values.researchProjectTitle ||
          validation.values.projectType ||
          validation.values.researchDuration ||
          validation.values.researchGuideName ||
          validation.values.researchAmount ||
          validation.values.file ||
          validation.values.SynopsisFile
        );
      case 2:
        return (
          validation.values.peerCourseTitile ||
          validation.values.peerMentorShip ||
          validation.values.peerRegisterNumber ||
          validation.values.peerTeacherCoOrdinator ||
          validation.values.peerFile
        );
      default:
        return false;
    }
  };

  const toggleTab = (tab: number) => {
    // Only allow switching if current tab is not filled or switching to the same tab
    if (activeTab === tab || !isTabFilled(formik, activeTab)) {
      setActiveTab(tab);
    }
  };
  const toggleWizard = () => {
    setShowWizard(!showWizard);
  };

  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
  };

  const projectType = [
    { value: "In", label: "Internal" },
    { value: "Ex", label: "External" },
  ];
  const Type = [
    { value: "Funded", label: "Funded" },
    { value: "Non-Funded", label: "Non-Funded" },
  ];

  const courseTitile = [
    { value: "G", label: "B.COM.General" },
    { value: "P", label: "B.COM.Professional" },
  ];
  const mentorShipOpt = [
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ];

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the Advanced Learners data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/advanceLearners/deleteAdvanceLearner?advanceLearnerId=${id}`,
          ""
        );
        toast.success(
          response.message || "Advanced Learners removed successfully!"
        );
        fetchExperientialLearningData();
      } catch (error) {
        toast.error("Failed to remove Advanced Learners. Please try again.");
        console.error("Error deleting Advanced Learners:", error);
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
          `/advanceLearners/download/${fileName}`,
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
  const handleDeleteFile = async (p0: string, docType: string) => {
    try {
      // Call the delete API
      const response = await api.delete(
        `/advanceLearners/deleteAdvanceLearnerDocument?advanceLearnerAddTabId=${editId}&docType=${docType}`,
        ""
      );
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      if (docType === "projectSanctionLetter") {
        formik.setFieldValue("file", null);
      } else if (docType === "synopsisReport") {
        formik.setFieldValue("SynopsisFile", null);
      } else if (docType === "peerTeaching") {
        formik.setFieldValue("peerFile", null);
      }
      setIsFileUploadDisabled(false); // Enable the file upload button
    } catch (error) {
      // Show error message
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  type OptionType = { value: string; label: string } | null;

  interface FormValues {
    academicYear: OptionType;
    semesterType: OptionType;
    semesterNo: OptionType;
    stream: OptionType;
    department: OptionType;
    programType: OptionType;
    degree: OptionType | null; // Assuming degree is optional
    Type: OptionType;
    projectType: OptionType;
    researchProjectTitle: string;
    researchDuration: string;
    researchGuideName: string;
    researchAmount: string;
    researchProjectType: OptionType;
    SynopsisFile: File | null;
    file: File | null;
    peerCourseTitile: OptionType;
    peerMentorShip: OptionType;
    peerRegisterNumber: string;
    peerTeacherCoOrdinator: string;
    peerFile: File | null;
  }

  const formik = useFormik<FormValues>({
    initialValues: {
      academicYear: null,
      semesterType: null,
      semesterNo: null,
      stream: null,
      department: null,
      programType: null,
      degree: null,
      Type: null,
      projectType: null,
      researchProjectTitle: "",
      researchDuration: "",
      researchGuideName: "",
      researchAmount: "",
      researchProjectType: null,
      SynopsisFile: null,
      file: null,
      peerCourseTitile: null,
      peerMentorShip: null,
      peerRegisterNumber: "",
      peerTeacherCoOrdinator: "",
      peerFile: null,
    },
    validationSchema: getTabValidationSchema(activeTab),
    enableReinitialize: true,

    onSubmit: async (values, { resetForm, setErrors, setSubmitting }) => {
      // Block submit if no Focus Area tab is active
      if (!activeTab) {
        formik.setStatus(
          "Please select a Focus Area and fill at least one focus area type."
        );
        setSubmitting(false);
        return;
      }
      console.log("Submit triggered with values:", values);

      const formData = new FormData();
      const isResearchProjectFilled =
        !!values.researchProjectTitle ||
        !!values.researchDuration ||
        !!values.projectType ||
        !!values.researchGuideName ||
        !!values.researchProjectType ||
        !!values.researchAmount;
      const isPeerTeachingFilled =
        !!values.peerCourseTitile ||
        !!values.peerMentorShip ||
        !!values.peerRegisterNumber ||
        !!values.peerTeacherCoOrdinator;

      const advanceLearnersRequestDto = {
        advanceLearnerId: editId || null,
        academicYear: Number(values.academicYear?.value || 0),
        semType: values.semesterType?.value || "",
        semesterNo: Number(values.semesterNo?.value || 0),
        streamId: Number(values.stream?.value || 0),
        departmentId: Number(values.department?.value || 0),
        programTypeId: Number(values.programType?.value || 0),
        programId: values.degree ? Number(values.degree.value) : null,
        advanceLearnerType: isResearchProjectFilled
          ? "ResearchProject"
          : isPeerTeachingFilled
          ? "PeerTeaching"
          : null,
        researchProjectDto:
          activeTab === 1
            ? {
                researchProjectId: researchProjectId,
                projectTitle: values.researchProjectTitle,
                duration: Number(values.researchDuration),
                typeOfProject: values.projectType?.value || "",
                guideName: values.researchGuideName,
                amount: Number(values.researchAmount),
              }
            : null,
        peerTeachingDto:
          activeTab === 2
            ? {
                peerTeachingId: peerTeachingId,
                courseTitle: values.peerCourseTitile,
                mentorship: values.peerMentorShip,
                registerNo: values.peerRegisterNumber,
                teacherCordinator: values.peerTeacherCoOrdinator,
              }
            : null,
      };

      console.log("Request DTO:", advanceLearnersRequestDto);

      formData.append(
        "advanceLearnersRequestDto",
        new Blob([JSON.stringify(advanceLearnersRequestDto)], {
          type: "application/json",
        })
      );

      // JSON.stringify(advanceLearnersRequestDto)
      // );

      // formData.append("projectSanctionLetter", values.file || new Blob());
      // formData.append("synopsisReport", values.SynopsisFile || new Blob());
      // formData.append("peerTeaching", values.peerFile || new Blob());

      if (isEditMode && typeof values.file === "string") {
        // Pass an empty PDF instead of null
        formData.append(
          "projectSanctionLetter",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.file === null) {
        formData.append(
          "projectSanctionLetter",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.file) {
        formData.append("projectSanctionLetter", values.file);
      }
      if (isEditMode && typeof values.SynopsisFile === "string") {
        // Pass an empty PDF instead of null
        formData.append(
          "synopsisReport",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.SynopsisFile === null) {
        formData.append(
          "synopsisReport",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.SynopsisFile) {
        formData.append("synopsisReport", values.SynopsisFile);
      }
      if (isEditMode && typeof values.peerFile === "string") {
        // Pass an empty PDF instead of null
        formData.append(
          "peerTeaching",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.peerFile === null) {
        formData.append(
          "peerTeaching",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.peerFile) {
        formData.append("peerTeaching", values.peerFile);
      }
      console.log("Form Data:", formData);
      try {
        const response =
          isEditMode && editId
            ? await api.put(`/advanceLearners/update`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              })
            : await api.create(`/advanceLearners/save`, formData, {
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
        console.error("Form submission error:", error);
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
            title="Teacher & Learning"
            breadcrumbItem="Advanced Learners"
          />
          <Card>
            <CardBody>
              <form onSubmit={formik.handleSubmit}>
                <Row>
                  {/* Academic Year Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Academic Year</Label>
                      <AcademicYearDropdown
                        value={formik.values.academicYear}
                        onChange={(selectedOption) =>
                          formik.setFieldValue("academicYear", selectedOption)
                        }
                        isInvalid={
                          formik.touched.academicYear &&
                          !!formik.errors.academicYear
                        }
                      />
                      {formik.touched.academicYear &&
                        formik.errors.academicYear && (
                          <div className="text-danger">
                            {formik.errors.academicYear}
                          </div>
                        )}
                    </div>
                  </Col>
                  {/* Semester Dropdowns */}
                  <Col lg={8}>
                    <SemesterDropdowns
                      semesterTypeValue={formik.values.semesterType}
                      semesterNoValue={formik.values.semesterNo}
                      onSemesterTypeChange={(selectedOption) =>
                        formik.setFieldValue("semesterType", selectedOption)
                      }
                      onSemesterNoChange={(selectedOption) =>
                        formik.setFieldValue("semesterNo", selectedOption)
                      }
                      isSemesterTypeInvalid={
                        formik.touched.semesterType &&
                        !!formik.errors.semesterType
                      }
                      isSemesterNoInvalid={
                        formik.touched.semesterNo && !!formik.errors.semesterNo
                      }
                      semesterTypeError={
                        formik.touched.semesterType
                          ? formik.errors.semesterType
                          : null
                      }
                      semesterNoError={
                        formik.touched.semesterNo
                          ? formik.errors.semesterNo
                          : null
                      }
                      semesterTypeTouched={!!formik.touched.semesterType}
                      semesterNoTouched={!!formik.touched.semesterNo}
                    />
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>School</Label>
                      <StreamDropdown
                        value={formik.values.stream}
                        onChange={(selectedOption) => {
                          formik.setFieldValue("stream", selectedOption);
                          setSelectedStream(selectedOption);
                          formik.setFieldValue("department", null);
                          setSelectedDepartment(null);
                        }}
                        isInvalid={
                          formik.touched.stream && !!formik.errors.stream
                        }
                      />
                      {formik.touched.stream && formik.errors.stream && (
                        <div className="text-danger">
                          {formik.errors.stream}
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
                        value={formik.values.department}
                        onChange={(selectedOption) => {
                          formik.setFieldValue("department", selectedOption);
                          setSelectedDepartment(selectedOption);
                          formik.setFieldValue("programType", null);
                          setSelectedProgramType(null);
                        }}
                        isInvalid={
                          formik.touched.department &&
                          !!formik.errors.department
                        }
                      />
                      {formik.touched.department &&
                        formik.errors.department && (
                          <div className="text-danger">
                            {formik.errors.department}
                          </div>
                        )}
                    </div>
                  </Col>
                  {/* Program Type Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Program Type</Label>
                      <ProgramTypeDropdown
                        deptId={selectedDepartment?.value}
                        value={formik.values.programType}
                        onChange={(selectedOption) => {
                          formik.setFieldValue("programType", selectedOption);
                          setSelectedProgramType(selectedOption);
                          formik.setFieldValue("degree", null);
                        }}
                        isInvalid={
                          formik.touched.programType &&
                          !!formik.errors.programType
                        }
                      />
                      {formik.touched.programType &&
                        formik.errors.programType && (
                          <div className="text-danger">
                            {formik.errors.programType}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Degree</Label>
                      <DegreeDropdown
                        programTypeId={selectedProgramType?.value}
                        value={formik.values.degree}
                        onChange={(selectedOption) => {
                          formik.setFieldValue("degree", selectedOption);
                          setSelectedDegree(selectedOption);
                          formik.setFieldValue("program", null);
                        }}
                        isInvalid={
                          formik.touched.degree && !!formik.errors.degree
                        }
                      />
                      {formik.touched.degree && formik.errors.degree && (
                        <div className="text-danger">
                          {formik.errors.degree}
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
                      Advance Learners Type
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
                        {[1, 2].map((tab) => (
                          <button
                            key={tab}
                            className={`step-button ${
                              activeTab === tab ? "active" : ""
                            }`}
                            type="button"
                            onClick={() => toggleTab(tab)}
                            disabled={
                              activeTab !== tab &&
                              isTabFilled(formik, activeTab)
                            }
                            style={
                              activeTab !== tab &&
                              isTabFilled(formik, activeTab)
                                ? { opacity: 0.5, cursor: "not-allowed" }
                                : {}
                            }
                          >
                            {tab}.{" "}
                            {tab === 1 ? "Research Project" : "Peer Teaching"}
                          </button>
                        ))}
                      </div>

                      <div className="mb-2 mt-2">
                        {activeTab && (
                          <button
                            type="button"
                            className="btn btn-outline-warning btn-sm"
                            onClick={() => clearTabFields(formik, activeTab)}
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="tab-content">
                        {activeTab === 1 && (
                          //   <Form>
                          <Row>
                            <Col lg="4">
                              <div className="mb-3">
                                <Label>Project Title</Label>
                                <Input
                                  type="text"
                                  className={`form-control ${
                                    formik.touched.researchProjectTitle &&
                                    formik.errors.researchProjectTitle
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  value={formik.values.researchProjectTitle}
                                  onChange={(e) =>
                                    formik.setFieldValue(
                                      "researchProjectTitle",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter Project Title"
                                />
                                {showTabError(
                                  1,
                                  formik.touched.researchProjectTitle,
                                  formik.errors.researchProjectTitle
                                )}
                              </div>
                            </Col>
                            <Col lg="4">
                              <div className="mb-3">
                                <Label>Duration</Label>
                                <Input
                                  type="text"
                                  className={`form-control ${
                                    formik.touched.researchDuration &&
                                    formik.errors.researchDuration
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  value={formik.values.researchDuration}
                                  onChange={(e) =>
                                    formik.setFieldValue(
                                      "researchDuration",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter Duration"
                                />
                                {showTabError(
                                  1,
                                  formik.touched.researchDuration,
                                  formik.errors.researchDuration
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Semester Type</Label>
                                <Select
                                  options={projectType}
                                  value={formik.values.projectType}
                                  onChange={(selectedOption) =>
                                    formik.setFieldValue(
                                      "projectType",
                                      selectedOption
                                    )
                                  }
                                  placeholder="Select Project Type"
                                  styles={dropdownStyles}
                                  menuPortalTarget={document.body}
                                  className={
                                    formik.touched.projectType &&
                                    formik.errors.projectType
                                      ? "select-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  1,
                                  formik.touched.projectType,
                                  formik.errors.projectType
                                )}
                              </div>
                            </Col>
                            <Col lg="4">
                              <div className="mb-3">
                                <Label>Guide Name</Label>
                                <Input
                                  type="text"
                                  placeholder="Enter Guide Name"
                                  className={`form-control ${
                                    formik.touched.researchGuideName &&
                                    formik.errors.researchGuideName
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  value={formik.values.researchGuideName}
                                  onChange={(e) =>
                                    formik.setFieldValue(
                                      "researchGuideName",
                                      e.target.value
                                    )
                                  }
                                />
                                {showTabError(
                                  1,
                                  formik.touched.researchGuideName,
                                  formik.errors.researchGuideName
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Type</Label>
                                <Select
                                  options={Type}
                                  value={formik.values.Type}
                                  onChange={(selectedOption) =>
                                    formik.setFieldValue("Type", selectedOption)
                                  }
                                  placeholder="Select Type"
                                  styles={dropdownStyles}
                                  menuPortalTarget={document.body}
                                  className={
                                    formik.touched.Type && formik.errors.Type
                                      ? "select-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  1,
                                  formik.touched.Type,
                                  formik.errors.Type
                                )}
                              </div>
                            </Col>
                            <Col lg="4">
                              <div className="mb-3">
                                <Label>Amount</Label>
                                <Input
                                  type="number"
                                  placeholder="Enter Amount"
                                  className={`form-control ${
                                    formik.touched.researchAmount &&
                                    formik.errors.researchAmount
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  value={formik.values.researchAmount}
                                  onChange={(e) =>
                                    formik.setFieldValue(
                                      "researchAmount",
                                      e.target.value
                                    )
                                  }
                                />
                                {showTabError(
                                  1,
                                  formik.touched.researchAmount,
                                  formik.errors.researchAmount
                                )}
                              </div>
                            </Col>
                            <Col sm={4}>
                              <div className="mb-3">
                                <Label
                                  htmlFor="formFile"
                                  className="form-label"
                                >
                                  Project Sanction Letter (Upload file)
                                </Label>
                                <Input
                                  className={`form-control ${
                                    formik.touched.file && formik.errors.file
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  type="file"
                                  id="syllabus"
                                  onChange={(event) => {
                                    formik.setFieldValue(
                                      "file",
                                      event.currentTarget.files
                                        ? event.currentTarget.files[0]
                                        : null
                                    );
                                  }}
                                />
                                {showTabError(
                                  1,
                                  formik.touched.file,
                                  formik.errors.file
                                )}
                                {isFileUploadDisabled && (
                                  <div className="text-warning mt-2">
                                    Please remove the existing file to upload a
                                    new one.
                                  </div>
                                )}
                                {/* Only show the file name if it is a string (from the edit API) */}
                                {typeof formik.values.file === "string" && (
                                  <div className="mt-2 d-flex align-items-center">
                                    <span
                                      className="me-2"
                                      style={{
                                        fontWeight: "bold",
                                        color: "green",
                                      }}
                                    >
                                      {formik.values.file}
                                    </span>
                                    <Button
                                      color="link"
                                      className="text-primary"
                                      onClick={() =>
                                        handleDownloadFile(
                                          typeof formik.values.file === "string"
                                            ? formik.values.file
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
                                      onClick={() =>
                                        handleDeleteFile(
                                          typeof formik.values.file === "string"
                                            ? formik.values.file
                                            : "",
                                          "projectSanctionLetter"
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
                                <Label
                                  htmlFor="formFile"
                                  className="form-label"
                                >
                                  Synopsis Letter (Upload file)
                                </Label>
                                <Input
                                  className={`form-control ${
                                    formik.touched.SynopsisFile &&
                                    formik.errors.SynopsisFile
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  type="file"
                                  id="syllabus"
                                  onChange={(event) => {
                                    formik.setFieldValue(
                                      "SynopsisFile",
                                      event.currentTarget.files
                                        ? event.currentTarget.files[0]
                                        : null
                                    );
                                  }}
                                />
                                {showTabError(
                                  1,
                                  formik.touched.SynopsisFile,
                                  formik.errors.SynopsisFile
                                )}
                                {isFileUploadDisabled && (
                                  <div className="text-warning mt-2">
                                    Please remove the existing file to upload a
                                    new one.
                                  </div>
                                )}
                                {/* Only show the file name if it is a string (from the edit API) */}
                                {typeof formik.values.SynopsisFile ===
                                  "string" && (
                                  <div className="mt-2 d-flex align-items-center">
                                    <span
                                      className="me-2"
                                      style={{
                                        fontWeight: "bold",
                                        color: "green",
                                      }}
                                    >
                                      {formik.values.SynopsisFile}
                                    </span>
                                    <Button
                                      color="link"
                                      className="text-primary"
                                      onClick={() =>
                                        handleDownloadFile(
                                          typeof formik.values.SynopsisFile ===
                                            "string"
                                            ? formik.values.SynopsisFile
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
                                      onClick={() =>
                                        handleDeleteFile(
                                          typeof formik.values.SynopsisFile ===
                                            "string"
                                            ? formik.values.SynopsisFile
                                            : "",
                                          "synopsisReport"
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
                                <Label>
                                  Project Sanction Letter (Download)
                                </Label>
                                <div>
                                  <a
                                    href="/templateFiles/bos.pdf"
                                    download
                                    className="btn btn-primary btn-sm"
                                  >
                                    Download Template
                                  </a>
                                </div>
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Synopsis Letter (Download)</Label>
                                <div>
                                  <a
                                    href="/templateFiles/bos.pdf"
                                    download
                                    className="btn btn-primary btn-sm"
                                  >
                                    Download Template
                                  </a>
                                </div>
                              </div>
                            </Col>
                          </Row>
                          //   </Form>
                        )}
                        {activeTab === 2 && (
                          //   <Form>
                          <Row>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>Course</Label>
                                <Select
                                  options={courseTitile}
                                  value={formik.values.peerCourseTitile}
                                  onChange={(selectedOption) =>
                                    formik.setFieldValue(
                                      "peerCourseTitile",
                                      selectedOption
                                    )
                                  }
                                  placeholder="Select Program Type"
                                  styles={dropdownStyles}
                                  menuPortalTarget={document.body}
                                  className={
                                    formik.touched.peerCourseTitile &&
                                    formik.errors.peerCourseTitile
                                      ? "select-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  2,
                                  formik.touched.peerCourseTitile,
                                  formik.errors.peerCourseTitile
                                )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>MentorShip</Label>
                                <Select
                                  options={mentorShipOpt}
                                  value={formik.values.peerMentorShip}
                                  onChange={(selectedOption) =>
                                    formik.setFieldValue(
                                      "peerMentorShip",
                                      selectedOption
                                    )
                                  }
                                  placeholder="Select MentorShip"
                                  styles={dropdownStyles}
                                  menuPortalTarget={document.body}
                                  className={
                                    formik.touched.peerMentorShip &&
                                    formik.errors.peerMentorShip
                                      ? "select-error"
                                      : ""
                                  }
                                />
                                {showTabError(
                                  2,
                                  formik.touched.peerMentorShip,
                                  formik.errors.peerMentorShip
                                )}
                              </div>
                            </Col>
                            <Col lg="4">
                              <Label>Register Number</Label>
                              <Input
                                type="text"
                                placeholder="Enter Register Number"
                                className={`form-control ${
                                  formik.touched.peerRegisterNumber &&
                                  formik.errors.peerRegisterNumber
                                    ? "is-invalid"
                                    : ""
                                }`}
                                value={formik.values.peerRegisterNumber}
                                onChange={(e) =>
                                  formik.setFieldValue(
                                    "peerRegisterNumber",
                                    e.target.value
                                  )
                                }
                              />
                              {showTabError(
                                2,
                                formik.touched.peerRegisterNumber,
                                formik.errors.peerRegisterNumber
                              )}
                            </Col>
                            <Col lg="4">
                              <Label>Teacher Co-Ordinator</Label>
                              <Input
                                type="text"
                                placeholder="Enter Teacher Co-Ordinator"
                                className={`form-control ${
                                  formik.touched.peerTeacherCoOrdinator &&
                                  formik.errors.peerTeacherCoOrdinator
                                    ? "is-invalid"
                                    : ""
                                }`}
                                value={formik.values.peerTeacherCoOrdinator}
                                onChange={(e) =>
                                  formik.setFieldValue(
                                    "peerTeacherCoOrdinator",
                                    e.target.value
                                  )
                                }
                              />
                              {showTabError(
                                2,
                                formik.touched.peerTeacherCoOrdinator,
                                formik.errors.peerTeacherCoOrdinator
                              )}
                            </Col>
                            <Col sm={4}>
                              <div className="mb-3">
                                <Label
                                  htmlFor="formFile"
                                  className="form-label"
                                >
                                  Peer Teaching (Upload file)
                                </Label>
                                <Input
                                  className={`form-control ${
                                    formik.touched.peerFile &&
                                    formik.errors.peerFile
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  type="file"
                                  id="peerFile"
                                  onChange={(event) => {
                                    formik.setFieldValue(
                                      "peerFile",
                                      event.currentTarget.files
                                        ? event.currentTarget.files[0]
                                        : null
                                    );
                                  }}
                                />
                                {showTabError(
                                  2,
                                  formik.touched.peerFile,
                                  formik.errors.peerFile
                                )}
                                {isFileUploadDisabled && (
                                  <div className="text-warning mt-2">
                                    Please remove the existing file to upload a
                                    new one.
                                  </div>
                                )}
                                {/* Only show the file name if it is a string (from the edit API) */}
                                {typeof formik.values.peerFile === "string" && (
                                  <div className="mt-2 d-flex align-items-center">
                                    <span
                                      className="me-2"
                                      style={{
                                        fontWeight: "bold",
                                        color: "green",
                                      }}
                                    >
                                      {formik.values.peerFile}
                                    </span>
                                    <Button
                                      color="link"
                                      className="text-primary"
                                      onClick={() =>
                                        handleDownloadFile(
                                          typeof formik.values.peerFile ===
                                            "string"
                                            ? formik.values.peerFile
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
                                      onClick={() =>
                                        handleDeleteFile(
                                          typeof formik.values.peerFile ===
                                            "string"
                                            ? formik.values.peerFile
                                            : "",
                                          "peerTeaching"
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
                                <Label>Peer Teaching (Download)</Label>
                                <div>
                                  <a
                                    href="/templateFiles/bos.pdf"
                                    download
                                    className="btn btn-primary btn-sm"
                                  >
                                    Download Template
                                  </a>
                                </div>
                              </div>
                            </Col>
                          </Row>
                          //   </Form>
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
                        onClick={handleListBosClick}
                      >
                        List
                      </button>
                    </div>
                    <div className="mt-3">
                      {formik.status && (
                        <div className="text-danger mb-2">{formik.status}</div>
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
                  <th>Program Type</th>
                  <th>Program</th>
                  <th>AdvanceLearnerType</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((als, index) => (
                    <tr key={als.advanceLearnerId}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{als.academicYear}</td>
                      <td>{als.semType}</td>
                      <td>{als.semesterNo}</td>
                      <td>{als.streamName}</td>
                      <td>{als.departmentName}</td>
                      <td>{als.programTypeName}</td>
                      <td>{als.programName}</td>
                      <td>{als.advanceLearnerType}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(als.advanceLearnerId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(als.advanceLearnerId)}
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

export default Advanced_Learners;
