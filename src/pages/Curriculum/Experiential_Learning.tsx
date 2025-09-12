import Breadcrumb from "Components/Common/Breadcrumb";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
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
  Toast,
} from "reactstrap";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import SemesterDropdowns from "Components/DropDowns/SemesterDropdowns";
import moment from "moment";
import { toast, ToastContainer } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";
import { SEMESTER_NO_OPTIONS } from "Components/constants/layout";
import axios from "axios";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "datatables.net-buttons/js/buttons.print.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";

const api = new APIClient();

const Experiential_Learning: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [activeTab1, setActiveTab1] = useState<
    | "pedagogy"
    | "internship"
    | "fieldProject"
    | "dissertation"
    | "fellowship"
    | "bootcamp"
    | null
  >(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [experientialLearningData, setExperientialLearningData] = useState<
    any[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filters, setFilters] = useState({
    academicYear: "",
    semType: "",
    semNumber: "",
    stream: "",
    department: "",
    programType: "",
    program: "",
    courseTitle: "",
    programTitle: "",
    degree: "",
  });
  const [filteredData, setFilteredData] = useState(experientialLearningData);

  const fellowshipFileRef = useRef<HTMLInputElement>(null);
  const fellowshipStudentExcelRef = useRef<HTMLInputElement>(null);
  const pedagogyFileRef = useRef<HTMLInputElement>(null);
  const bootcampFileRef = useRef<HTMLInputElement>(null);
  const bootcampStudentExcelRef = useRef<HTMLInputElement>(null);
  const fieldProjectFileRef = useRef<HTMLInputElement>(null);
  const communicationLetterRef = useRef<HTMLInputElement>(null);
  const fieldStudentExcelRef = useRef<HTMLInputElement>(null);

  const tableRef = useRef<HTMLTableElement>(null);

  // Search/filter logic
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = experientialLearningData.filter((row) =>
      Object.values(row).some((val) =>
        String(val || "")
          .toLowerCase()
          .includes(value)
      )
    );
    setFilteredData(filtered);
  };

  // Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Modal logic
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // Fetch data
  const fetchExperientialLearningData = async () => {
    try {
      const response = await api.get(
        "/experientialLearning/getAllExperientialLearning",
        ""
      );
      setExperientialLearningData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching BOS data:", error);
    }
  };

  const handleListBosClick = () => {
    toggleModal();
    fetchExperientialLearningData();
  };

  const toggleWizard = () => setShowWizard(!showWizard);

  const mapValueToLabel = (
    value: string | number | null,
    options: { value: string | number; label: string }[]
  ): { value: string | number; label: string } | null => {
    if (!value) return null;
    const matchedOption = options.find((option) => option.value === value);
    return matchedOption ? matchedOption : { value, label: String(value) };
  };

  // Handle file download actions
  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      let updatedfileName = fileName.split("/").pop() || fileName;
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(
          `/experientialLearning/download/${updatedfileName}`,
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
        link.download = updatedfileName; // Set the file name for the download
        document.body.appendChild(link);
        link.click();

        // Clean up the URL and remove the anchor element
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("File downloaded successfully!");
      } catch (error) {
        toast.error("Failed to download upload ltter file. Please try again.");
        console.error("Error downloading file:", error);
      }
    } else {
      toast.error("No file available for download.");
    }
  };

  // Handle file deletion
  // Clear the file from the form and show success message
  const handleDeleteFileWithKey = async (
    tab: string,
    fileField: string,
    fileNameField: string,
    fileKey?: any
  ) => {
    if (fileKey) {
      try {
        await api.delete(
          `/experientialLearning/deleteCoursesWithFocusDocument?experientialLearningDocumentId=${fileKey}`,
          ""
        );
        toast.success("File deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete file. Please try again.");
        console.error("Error deleting file:", error);
        return;
      }
    }
    // Clear Formik fields for the file
    validation.setFieldValue(`${tab}.${fileField}`, null);
    validation.setFieldValue(`${tab}.${fileNameField}`, "");
  };

  // ----------- HANDLE EDIT -----------
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/experientialLearning?experientialLearningID=${id}`,
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
      // fellowship file
      const fellowshipFileInfo = getFileInfoByFolder(
        response.fellowship?.file,
        "Fellowship"
      );
      const studentExcelFileInfo = getFileInfoByFolder(
        response.fellowship?.file,
        "StudentExcelSheet"
      );
      // bootcamp file
      const bootcampFileInfo = getFileInfoByFolder(
        response.bootcamp?.file,
        "Bootcamp"
      );
      const bootcampStudentExcelFileInfo = getFileInfoByFolder(
        response.bootcamp?.file,
        "StudentExcelSheet"
      );

      // field project file
      const fieldProjectFileInfo = getFileInfoByFolder(
        response.fieldProject?.file,
        "FieldProject"
      );
      const communicationLetterFileInfo = getFileInfoByFolder(
        response.fieldProject?.file,
        "CommunicationLetter"
      );
      const fieldProjectstudentExcelFileInfo = getFileInfoByFolder(
        response.fieldProject?.file,
        "StudentExcelSheet"
      );

      // Map API response to Formik values
      const mappedValues = {
        academicYear: mapValueToLabel(response.academicYear, academicYearList),
        semType: response.semType
          ? { value: response.semType, label: response.semType.toUpperCase() }
          : null,
        semNumber: mapValueToLabel(
          String(response.semNumber),
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
        programTitle: response.programTitle || "",
        courseTitle: response.courseTitle || "",
        pedagogy: {
          pedagogyFile: null,
          pedagogyFileName: "",
          pedagogyFileKey: "",
        },
        internship: {
          totalJoiningStudentsOfIntern:
            response.internship?.totalInternStudents || "",
          orgNameOfIntern: response.internship?.internOrgName || "",
          locationOfIntern: response.internship?.internOrgLocation || "",
          addOnFieldId: response.internship?.addOnFieldId || ""
        },
        fieldProject: {
          addOnFieldId: response.fieldProject?.addOnFieldId || "",
          totalParticipatingStudents:
            response.fieldProject?.totalFieldProjectStudents || "",
          fieldProjectStartDate: response.fieldProject?.fieldProjectStratDate
            ? moment(
              response.fieldProject.fieldProjectStratDate,
              "YYYY-MM-DD"
            ).format("DD-MM-YYYY")
            : "",
          fieldProjectEndDate: response.fieldProject?.fieldProjectEndDate
            ? moment(
              response.fieldProject.fieldProjectEndDate,
              "YYYY-MM-DD"
            ).format("DD-MM-YYYY")
            : "",
          locationOfOrganisation:
            response.fieldProject?.fielsProjectOrgLocation || "",
          fieldProjectFile: null,
          fieldProjectFileName: fieldProjectFileInfo.fileName || "",
          fieldProjectFileKey: fieldProjectFileInfo.fileKey || "",
          communicationLetter: null,
          communicationLetterFileName:
            communicationLetterFileInfo.fileName || "",
          communicationLetterFileKey: communicationLetterFileInfo.fileKey || "",
          studentExcelSheet: null,
          studentExcelSheetFileName:
            fieldProjectstudentExcelFileInfo.fileName || "",
          studentExcelSheetFileKey:
            fieldProjectstudentExcelFileInfo.fileKey || "",
        },
        dissertation: {
          addOnFieldId: response.dissertations?.addOnFieldId || "",
          totalParticipatingStudentsdissertation:
            response.dissertations?.totalDissertationsStudents || "",
          dissertationStartDate:
            response.dissertations?.dissertationsStartDate || "",
          dissertationEndDate:
            response.dissertations?.dissertationsEndDate || "",
        },
        fellowship: {
          addOnFieldId: response.fellowship?.addOnFieldId || "",
          studentExcelSheet: null,
          studentExcelSheetFileName: studentExcelFileInfo.fileName,
          studentExcelSheetFileKey: studentExcelFileInfo.fileKey,
          fellowshipFile: null,
          fellowshipFileName: fellowshipFileInfo.fileName,
          fellowshipFileKey: fellowshipFileInfo.fileKey,
        },
        bootcamp: {
          addOnFieldId: response.bootcamp?.addOnFieldId || "",
          studentExcelSheet: null,
          studentExcelSheetFileName: bootcampStudentExcelFileInfo.fileName,
          studentExcelSheetFileKey: bootcampStudentExcelFileInfo.fileKey,
          bootcampFile: null,
          bootcampFileName: bootcampFileInfo.fileName,
          bootcampFileKey: bootcampFileInfo.fileKey,
        },
      };

      validation.setValues((prevValues) => ({
        ...prevValues,
        ...mappedValues,
        academicYear: mappedValues.academicYear
          ? {
            ...mappedValues.academicYear,
            value: String(mappedValues.academicYear.value),
          }
          : null,
        semType: mappedValues.semType ? { ...mappedValues.semType } : null,
        semNumber: mappedValues.semNumber
          ? {
            ...mappedValues.semNumber,
            value: String(mappedValues.semNumber.value),
          }
          : null,
        stream: mappedValues.stream ? { ...mappedValues.stream } : null,
        department: mappedValues.department
          ? { ...mappedValues.department }
          : null,
        programType: mappedValues.programType
          ? { ...mappedValues.programType }
          : null,
        degree: mappedValues.degree ? { ...mappedValues.degree } : null,
        program: Array.isArray(mappedValues.program)
          ? mappedValues.program
          : [],

        pedagogy: {
          pedagogyFile: null,
          pedagogyFileName:
            (response.pedagogy?.file &&
              Object.values(response.pedagogy.file)[0]) ||
            "",
          pedagogyFileKey: response.pedagogy?.file
            ? Object.keys(response.pedagogy.file)[0]
            : "",
          addOnFieldId: response.pedagogy?.addOnFieldId || "",
        },

        internship: {
          totalJoiningStudentsOfIntern:
            mappedValues.internship?.totalJoiningStudentsOfIntern || "",
          orgNameOfIntern: mappedValues.internship?.orgNameOfIntern || "",
          locationOfIntern: mappedValues.internship?.locationOfIntern || "",
          addOnFieldId: response.internship?.addOnFieldId || "",
        },

        fieldProject: {
          totalParticipatingStudents:
            mappedValues.fieldProject?.totalParticipatingStudents || "",
          fieldProjectStartDate: response.fieldProject?.fieldProjectStratDate
            ? moment(
              response.fieldProject.fieldProjectStratDate,
              "YYYY-MM-DD"
            ).format("DD-MM-YYYY")
            : "",
          fieldProjectEndDate: response.fieldProject?.fieldProjectEndDate
            ? moment(
              response.fieldProject.fieldProjectEndDate,
              "YYYY-MM-DD"
            ).format("DD-MM-YYYY")
            : "",
          locationOfOrganisation:
            mappedValues.fieldProject?.locationOfOrganisation || "",
          fieldProjectFile: null,
          fieldProjectFileName: fieldProjectFileInfo.fileName || "",
          fieldProjectFileKey: fieldProjectFileInfo.fileKey || "",
          communicationLetter: null,
          communicationLetterFileName:
            communicationLetterFileInfo.fileName || "",
          communicationLetterFileKey: communicationLetterFileInfo.fileKey || "",
          studentExcelSheet: null,
          studentExcelSheetFileName:
            fieldProjectstudentExcelFileInfo.fileName || "",
          studentExcelSheetFileKey:
            fieldProjectstudentExcelFileInfo.fileKey || "",
          addOnFieldId: response.fieldProject?.addOnFieldId || "",
        },

        dissertation: {
          totalParticipatingStudentsdissertation:
            mappedValues.dissertation?.totalParticipatingStudentsdissertation ||
            "",
          dissertationStartDate:
            mappedValues.dissertation?.dissertationStartDate || "",
          dissertationEndDate:
            mappedValues.dissertation?.dissertationEndDate || "",
          addOnFieldId: response.dissertations?.addOnFieldId || "",
        },

        fellowship: {
          studentExcelSheet: null,
          studentExcelSheetFileName: studentExcelFileInfo.fileName || "",
          studentExcelSheetFileKey: studentExcelFileInfo.fileKey || "",
          fellowshipFile: null,
          fellowshipFileName: fellowshipFileInfo.fileName || "",
          fellowshipFileKey: fellowshipFileInfo.fileKey || "",
          addOnFieldId: response.fellowship?.addOnFieldId || "",
        },

        bootcamp: {
          studentExcelSheet: null,
          studentExcelSheetFileName:
            bootcampStudentExcelFileInfo.fileName || "",
          studentExcelSheetFileKey: bootcampStudentExcelFileInfo.fileKey || "",
          bootcampFile: null,
          bootcampFileName: bootcampFileInfo.fileName || "",
          bootcampFileKey: bootcampFileInfo.fileKey || "",
          addOnFieldId: response.bootcamp?.addOnFieldId || "",
        },
      }));

      // Determine which tab to show based on max data and file
      const tabMap: Record<string, number> = {
        pedagogy: 1,
        internship: 2,
        fieldProject: 3,
        dissertation: 4,
        fellowship: 5,
        bootcamp: 6,
      };
      const maxTab = getMaxDataTabWithFile(response);
      // Normalize "dissertations" to "dissertation"
      const normalizedTab =
        maxTab === "dissertations" ? "dissertation" : maxTab;
      if (normalizedTab && Object.keys(tabMap).includes(normalizedTab)) {
        setActiveTab1(
          normalizedTab as
          | "pedagogy"
          | "internship"
          | "fieldProject"
          | "dissertation"
          | "fellowship"
          | "bootcamp"
        );
        setActiveTab(tabMap[normalizedTab]);
        setShowWizard(true);
      }
      setIsEditMode(true);
      setEditId(id);
      setIsFileUploadDisabled(!!response.documents?.mom);
      toggleModal();
    } catch (error) {
      console.error("Error fetching BOS data by ID:", error);
    }
  };

  function getFileInfoByFolder(fileObj: any, folder: string) {
    if (!fileObj) return { fileName: "", fileKey: "" };
    const entry = Object.entries(fileObj).find(
      ([, path]) => typeof path === "string" && path.startsWith(folder + "/")
    );
    if (!entry) return { fileName: "", fileKey: "" };
    const [key, path] = entry;
    return typeof path === "string"
      ? { fileName: path.split("/").pop(), fileKey: key }
      : { fileName: "", fileKey: "" };
  }

  function getMaxDataTabWithFile(response: any) {
    const tabs = [
      "pedagogy",
      "internship",
      "fieldProject",
      "dissertation",
      "fellowship",
      "bootcamp",
    ];
    let tabWithFile: string | null = null;
    let maxTab: string | null = null;
    let maxCount = -1;

    for (const tab of tabs) {
      // For backward compatibility, check both "dissertation" and "dissertations"
      const obj = response[tab] || response[tab + "s"];
      if (!obj) continue;

      // Check if file exists and is not empty
      const hasFile = obj.file && Object.keys(obj.file).length > 0;
      if (hasFile && !tabWithFile) {
        tabWithFile = tab;
      }

      // Count non-null, non-empty fields (excluding file)
      const count = Object.entries(obj).filter(
        ([key, value]) =>
          key !== "file" &&
          value !== null &&
          value !== "" &&
          value !== undefined
      ).length;

      if (count > maxCount) {
        maxTab = tab;
        maxCount = count;
      }
    }

    // Prefer tab with file, otherwise tab with max filled fields
    return tabWithFile || maxTab;
  }

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the correct delete API and refresh the data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        // Use the correct API for experiential learning delete
        const response = await api.delete(
          `/experientialLearning/deleteCoursesWithFocus?experientialLearningId=${deleteId}`,
          ""
        );
        toast.success(
          response.message ||
          "Experiential Learning record removed successfully!"
        );
        fetchExperientialLearningData();
      } catch (error) {
        toast.error(
          "Failed to remove Experiential Learning record. Please try again."
        );
        console.error("Error deleting Experiential Learning:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  const pedagogySchema = Yup.object({
    pedagogyFile: Yup.mixed().test(
      "fileValidation",
      "Please upload a valid file",
      function (value) {
        if (isFileUploadDisabled) return true;
        // SKIP validation in edit mode if backend file is present
        if (isEditMode && (this.parent?.pedagogyFileName || this.parent?.pedagogyFileKey)) return true;
        if (!value) {
          return this.createError({ message: "Please upload a file" });
        }
        if (value instanceof File && value.size > 3 * 1024 * 1024) {
          return this.createError({ message: "File size is too large" });
        }
        const allowedTypes = [
          "application/pdf",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/csv",
        ];
        if (value instanceof File && !allowedTypes.includes(value.type)) {
          return this.createError({ message: "Unsupported file format" });
        }
        return true;
      }
    ),
  });

  const internshipSchema = Yup.object({
    totalJoiningStudentsOfIntern: Yup.string().required(
      "Enter total number of joining students"
    ),
    orgNameOfIntern: Yup.string().required("Enter organization name"),
    locationOfIntern: Yup.string().required("Enter organization location"),
  });

  const fieldProjectSchema = Yup.object({
    totalParticipatingStudents: Yup.string().required(
      "Enter total number of participating students"
    ),
    fieldProjectStartDate: Yup.string().nullable(),
    fieldProjectEndDate: Yup.string()
      .nullable()
      .test("end-after-start", "End date cannot be before start date", function (value) {
        const { fieldProjectStartDate } = this.parent || {};
        if (!value || !fieldProjectStartDate) return true;
        const start = moment(fieldProjectStartDate, "DD-MM-YYYY", true);
        const end = moment(value, "DD-MM-YYYY", true);
        if (!start.isValid() || !end.isValid()) return true;
        return end.isSameOrAfter(start);
      }),
    locationOfOrganisation: Yup.string().required(
      "Enter location of the organisation"
    ),
    fieldProjectFile: Yup.mixed().test("fileValidation", "Please upload a valid file", function (value) {
      // skip if backend file present in edit mode
      if (isEditMode && (this.parent?.fieldProjectFileName || this.parent?.fieldProjectFileKey)) return true;
      if (!value) return this.createError({ message: "Please upload a file" });
      if (value instanceof File && value.size > 3 * 1024 * 1024) return this.createError({ message: "File size is too large" });
      const allowed = ["application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
      if (value instanceof File && !allowed.includes(value.type)) return this.createError({ message: "Unsupported file format" });
      return true;
    }),
    communicationLetter: Yup.mixed().test("fileValidation", "Please upload a valid file", function (value) {
      if (isEditMode && (this.parent?.communicationLetterFileName || this.parent?.communicationLetterFileKey)) return true;
      if (!value) return this.createError({ message: "Please upload a file" });
      if (value instanceof File && value.size > 3 * 1024 * 1024) return this.createError({ message: "File size is too large" });
      const allowedTypes = ["application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
      if (value instanceof File && !allowedTypes.includes(value.type)) return this.createError({ message: "Unsupported file format" });
      return true;
    }),
    studentExcelSheet: Yup.mixed().test("fileValidation", "Please upload a valid file", function (value) {
      if (isEditMode && (this.parent?.studentExcelSheetFileName || this.parent?.studentExcelSheetFileKey)) return true;
      if (!value) return this.createError({ message: "Please upload a file" });
      if (value instanceof File && value.size > 3 * 1024 * 1024) return this.createError({ message: "File size is too large" });
      const allowedTypes = ["application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
      if (value instanceof File && !allowedTypes.includes(value.type)) return this.createError({ message: "Unsupported file format" });
      return true;
    }),
  });

  const dissertationSchema = Yup.object({
    totalParticipatingStudentsdissertation: Yup.string().required(
      "Enter total number of participating students"
    ),
    dissertationStartDate: Yup.string().nullable(),
    dissertationEndDate: Yup.string()
      .nullable()
      .test("end-after-start", "End date cannot be before start date", function (value) {
        const { dissertationStartDate } = this.parent || {};
        if (!value || !dissertationStartDate) return true;
        const start = moment(dissertationStartDate, "DD-MM-YYYY", true);
        const end = moment(value, "DD-MM-YYYY", true);
        if (!start.isValid() || !end.isValid()) return true;
        return end.isSameOrAfter(start);
      }),
  });

  const fellowshipSchema = Yup.object({
    studentExcelSheet: Yup.mixed().test("fileValidation", "Please upload a valid file", function (value) {
      if (isEditMode && (this.parent?.studentExcelSheetFileName || this.parent?.studentExcelSheetFileKey)) return true;
      if (!value) return this.createError({ message: "Please upload a file" });
      if (value instanceof File && value.size > 3 * 1024 * 1024) return this.createError({ message: "File size is too large" });
      const allowedTypes = ["application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
      if (value instanceof File && !allowedTypes.includes(value.type)) return this.createError({ message: "Unsupported file format" });
      return true;
    }),
    fellowshipFile: Yup.mixed().test("fileValidation", "Please upload a valid file", function (value) {
      if (isEditMode && (this.parent?.fellowshipFileName || this.parent?.fellowshipFileKey)) return true;
      if (!value) return this.createError({ message: "Please upload a file" });
      if (value instanceof File && value.size > 3 * 1024 * 1024) return this.createError({ message: "File size is too large" });
      const allowedTypes = ["application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
      if (value instanceof File && !allowedTypes.includes(value.type)) return this.createError({ message: "Unsupported file format" });
      return true;
    }),
  });

  const bootcampSchema = Yup.object({
    studentExcelSheet: Yup.mixed().test("fileValidation", "Please upload a valid file", function (value) {
      if (isEditMode && (this.parent?.studentExcelSheetFileName || this.parent?.studentExcelSheetFileKey)) return true;
      if (!value) return this.createError({ message: "Please upload a file" });
      if (value instanceof File && value.size > 3 * 1024 * 1024) return this.createError({ message: "File size is too large" });
      const allowedTypes = ["application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
      if (value instanceof File && !allowedTypes.includes(value.type)) return this.createError({ message: "Unsupported file format" });
      return true;
    }),
    bootcampFile: Yup.mixed().test("fileValidation", "Please upload a valid file", function (value) {
      if (isEditMode && (this.parent?.bootcampFileName || this.parent?.bootcampFileKey)) return true;
      if (!value) return this.createError({ message: "Please upload a file" });
      if (value instanceof File && value.size > 3 * 1024 * 1024) return this.createError({ message: "File size is too large" });
      const allowedTypes = ["application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
      if (value instanceof File && !allowedTypes.includes(value.type)) return this.createError({ message: "Unsupported file format" });
      return true;
    }),
  });

  const mainSchema = Yup.object({
    academicYear: Yup.object()
      .nullable()
      .required("Please select academic year"),
    semType: Yup.object<{ value: string; label: string }>()
      .nullable()
      .required("Please select semester type"),
    semNumber: Yup.object().nullable().required("Please select semester"),
    stream: Yup.object().nullable().required("Please select stream"),
    degree: Yup.object().nullable().required("Please select degree"),
    department: Yup.object<{ value: string; label: string }>()
      .nullable()
      .required("Please select department"),
    programType: Yup.object().nullable().required("Please select program type"),
    courseTitle: Yup.string().required("Please enter Course Title"),
    programTitle: Yup.string().required("Please enter Program Title"),
  });

  // Add similar ones for Field Project, Dissertation, Fellowship, Bootcamp
  // Removed duplicate combinedSchema declaration to avoid redeclaration error.
  const isAnyTabFilled = (values: typeof validation.values) => {
    const tabs =
      (values?.pedagogy && values.pedagogy.pedagogyFile) ||
      values?.internship?.totalJoiningStudentsOfIntern ||
      values?.internship?.orgNameOfIntern ||
      values?.internship?.locationOfIntern ||
      values?.fieldProject?.totalParticipatingStudents ||
      values?.fieldProject?.fieldProjectStartDate ||
      values?.fieldProject?.fieldProjectEndDate ||
      values?.fieldProject?.locationOfOrganisation ||
      values?.fieldProject?.fieldProjectFile ||
      values?.fieldProject?.communicationLetter ||
      values?.fieldProject?.studentExcelSheet ||
      values?.dissertation?.totalParticipatingStudentsdissertation ||
      values?.dissertation?.dissertationStartDate ||
      values?.dissertation?.dissertationEndDate ||
      values?.fellowship?.studentExcelSheet ||
      values?.fellowship?.fellowshipFile ||
      values?.bootcamp?.studentExcelSheet ||
      values?.bootcamp?.bootcampFile;

    return !!tabs;
  };

  const handleTabChange = (newTabIndex: number) => {
    const tabMap = {
      1: "pedagogy",
      2: "internship",
      3: "fieldProject",
      4: "dissertation",
      5: "fellowship",
      6: "bootcamp",
    } as const;

    const newTab = tabMap[newTabIndex];
    const currentTab = activeTab1;

    // If no tab is active, allow switching
    if (!currentTab) {
      setActiveTab(newTabIndex);
      setActiveTab1(newTab);
      return;
    }

    // Check if current tab has any filled value
    const currentTabData = validation.values[currentTab] || {};
    const isCurrentTabFilled = Object.values(currentTabData).some(
      (val) =>
        val !== null &&
        val !== "" &&
        !(typeof val === "object" && Object.keys(val).length === 0)
    );

    // If trying to switch to the same tab, allow
    if (currentTab === newTab) {
      setActiveTab(newTabIndex);
      setActiveTab1(newTab);
      return;
    }

    if (isCurrentTabFilled) {
      toast.warning("You already filled one tab. Clear it before switching.");
      return;
    }

    setActiveTab(newTabIndex);
    setActiveTab1(newTab);
  };

  const getCombinedSchema = (activeTab1: string | null) => {
    const tabSchemas: Record<string, Yup.ObjectSchema<any>> = {
      pedagogy: pedagogySchema,
      internship: internshipSchema,
      fieldProject: fieldProjectSchema,
      dissertation: dissertationSchema,
      fellowship: fellowshipSchema,
      bootcamp: bootcampSchema,
    };

    return Yup.object({
      ...mainSchema.fields,
      ...(activeTab1 ? { [activeTab1]: tabSchemas[activeTab1] } : {}),
    });
  };

  const subformKeys = [
    "pedagogy",
    "internship",
    "fieldProject",
    "dissertation",
    "fellowship",
    "bootcamp",
  ];

  // Helper to check if a sub-form is filled
  const isFilled = (obj: any) =>
    obj && Object.values(obj).some(
      (val) =>
        val !== null &&
        val !== "" &&
        !(typeof val === "object" && Object.keys(val).length === 0)
    );

  const combinedSchema = getCombinedSchema(activeTab1);
  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      semType: null as { value: string; label: string } | null,
      semNumber: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      degree: null as { value: string; label: string } | null,
      programType: null as { value: string; label: string } | null,
      programTitle: "",
      courseTitle: "",
      file: null,
      pedagogy: {
        pedagogyFile: null,
        pedagogyFileName: "",
        pedagogyFileKey: "",
        addOnFieldId: "",
      },
      internship: {
        totalJoiningStudentsOfIntern: "",
        orgNameOfIntern: "",
        locationOfIntern: "",
        addOnFieldId: "",
      },
      fieldProject: {
        totalParticipatingStudents: "",
        fieldProjectStartDate: null,
        fieldProjectEndDate: null,
        locationOfOrganisation: "",
        fieldProjectFile: null,
        fieldProjectFileName: "",
        fieldProjectFileKey: "",
        communicationLetter: null,
        communicationLetterFileName: "",
        communicationLetterFileKey: "",
        studentExcelSheet: null,
        studentExcelSheetFileName: "",
        studentExcelSheetFileKey: "",
        addOnFieldId: "",
      },
      dissertation: {
        totalParticipatingStudentsdissertation: "",
        dissertationStartDate: null,
        dissertationEndDate: null,
        addOnFieldId: "",
      },
      fellowship: {
        studentExcelSheet: null,
        studentExcelSheetFileName: "",
        studentExcelSheetFileKey: "",
        fellowshipFile: null,
        fellowshipFileName: "",
        fellowshipFileKey: "",
        addOnFieldId: "",
      },
      bootcamp: {
        studentExcelSheet: null,
        studentExcelSheetFileName: "",
        studentExcelSheetFileKey: "",
        bootcampFile: null,
        bootcampFileName: "",
        bootcampFileKey: "",
        addOnFieldId: "",
      },
    },
    validationSchema: combinedSchema,
    onSubmit: async (values, { resetForm }) => {
      await validation.validateForm();
      console.log("Formik validation errors:", validation.errors);
      if (Object.keys(validation.errors).length) {
        toast.error("Fix validation errors (see console)");
        return;
      }

      if (!isAnyTabFilled(values)) {
        toast.warning("You must fill at least one experiential tab.");
        return;
      }
      const formData = new FormData();
      const dtoPayload: any = {
        id: isEditMode && editId ? editId : null,
        academicYear: values.academicYear?.value || "",
        semType: values.semType?.value || "",
        semNumber: values.semNumber?.value || "",
        streamId: values.stream?.value || "",
        departmentId: values.department?.value || "",
        programTypeId: values.programType?.value || "",
        programId: values.degree?.value || "",
        programName: values.degree?.label || "",
        programTitle: values.programTitle,
        courseTitle: values.courseTitle,
      };

      // Map subform keys to required API structure
      if (activeTab1 === "internship" && isFilled(values.internship)) {
        dtoPayload.internship = {
          totalInternStudents: values.internship.totalJoiningStudentsOfIntern || null,
          internOrgName: values.internship.orgNameOfIntern || null,
          internOrgLocation: values.internship.locationOfIntern || null,
          addOnFieldId: values.internship.addOnFieldId || null,
        };
      }
      if (activeTab1 === "fieldProject" && isFilled(values.fieldProject)) {
        dtoPayload.fieldProject = {
          totalFieldProjectStudents: values.fieldProject.totalParticipatingStudents || null,
          fieldProjectStratDate: values.fieldProject.fieldProjectStartDate
            ? moment(values.fieldProject.fieldProjectStartDate, "DD-MM-YYYY").format("YYYY-MM-DD")
            : null,
          fieldProjectEndDate: values.fieldProject.fieldProjectEndDate
            ? moment(values.fieldProject.fieldProjectEndDate, "DD-MM-YYYY").format("YYYY-MM-DD")
            : null,
          fielsProjectOrgLocation: values.fieldProject.locationOfOrganisation || null,
          addOnFieldId: values.fieldProject.addOnFieldId || null
        };
      }
      if (activeTab1 === "dissertation" && isFilled(values.dissertation)) {
        dtoPayload.dissertations = {
          totalDissertationsStudents: values.dissertation.totalParticipatingStudentsdissertation || null,
          dissertationsStartDate: values.dissertation.dissertationStartDate
            ? moment(values.dissertation.dissertationStartDate, "DD-MM-YYYY").format("YYYY-MM-DD")
            : null,
          dissertationsEndDate: values.dissertation.dissertationEndDate
            ? moment(values.dissertation.dissertationEndDate, "DD-MM-YYYY").format("YYYY-MM-DD")
            : null,
          addOnFieldId: values.dissertation.addOnFieldId || null
        };
      }
      if (activeTab1 === "fellowship" && isFilled(values.fellowship)) {
        dtoPayload.fellowship = {
          ...values.fellowship,
          addOnFieldId: values.fellowship.addOnFieldId || null,
        };
      }
      if (activeTab1 === "bootcamp" && isFilled(values.bootcamp)) {
        dtoPayload.bootcamp = {
          ...values.bootcamp,
          addOnFieldId: values.bootcamp.addOnFieldId || null,
        };
      }
      if (activeTab1 === "pedagogy" && isFilled(values.pedagogy)) {
        dtoPayload.pedagogy = {
          ...values.pedagogy,
          addOnFieldId: values.pedagogy.addOnFieldId || null,
        };
      }

      console.log("DTO Payload:", dtoPayload); // Debug log

      formData.append(
        "experientialLearningRequestDto",
        new Blob([JSON.stringify(dtoPayload)], { type: "application/json" })
      );

      // Append only the files for the selected tab (as before)
      if (activeTab1 === "pedagogy") {
        if (values.pedagogy?.pedagogyFile) formData.append("pedagogy", values.pedagogy.pedagogyFile);
      }
      if (activeTab1 === "fieldProject") {
        if (values.fieldProject?.fieldProjectFile) formData.append("fP_fieldProject", values.fieldProject.fieldProjectFile);
        if (values.fieldProject?.communicationLetter) formData.append("fP_communicationLetter", values.fieldProject.communicationLetter);
        if (values.fieldProject?.studentExcelSheet) formData.append("fP_studentExcelSheet", values.fieldProject.studentExcelSheet);
      }
      if (activeTab1 === "fellowship") {
        if (values.fellowship?.fellowshipFile) formData.append("f_fellowship", values.fellowship.fellowshipFile);
        if (values.fellowship?.studentExcelSheet) formData.append("f_studentExcelSheet", values.fellowship.studentExcelSheet);
      }
      if (activeTab1 === "bootcamp") {
        if (values.bootcamp?.bootcampFile) formData.append("b_bootcamp", values.bootcamp.bootcampFile);
        if (values.bootcamp?.studentExcelSheet) formData.append("b_studentExcelSheet", values.bootcamp.studentExcelSheet);
      }

      try {
        const response =
          isEditMode && editId
            ? await api.put(`/experientialLearning`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            : await api.create(`/experientialLearning`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });

        toast.success(
          response.message || "Experiential Learning record saved successfully!"
        );
        resetForm();
        setIsEditMode(false);
        setEditId(null);
      } catch (error) {
        toast.error("Failed to save Experiential Learning. Please try again.");
        console.error("Error creating/updating Experiential Learning:", error);
      }
    }
  });

  useEffect(() => {
    if (experientialLearningData.length === 0) return;

    const initializeDataTable = () => {
      const table = $("#id").DataTable({
        destroy: true,
        dom: "Bfrtip",
        buttons: [
          {
            extend: "copy",
          },
          {
            extend: "csv",
          },
        ],
        columnDefs: [
          {
            targets: [3, 4], // Make sure indexes match actual column positions
            visible: false,
          },
        ],
        searching: false,
        paging: false,
      });

      $(".dt-buttons").addClass("mb-3 gap-2");
      $(".buttons-copy").addClass("btn btn-success");
      $(".buttons-csv").addClass("btn btn-info");

      // Prevent duplicate toast triggers
      $("#id")
        .off("buttons-action.dt")
        .on("buttons-action.dt", function (e, buttonApi) {
          if (buttonApi.text() === "Copy") {
            toast.success("Copied to clipboard!");
          }
        });

      return table;
    };

    // Delay DataTable init slightly to allow DOM updates
    const timeout = setTimeout(() => {
      const table = initializeDataTable();
    }, 0);

    return () => {
      clearTimeout(timeout);
      const existingTable = $.fn.DataTable.isDataTable("#id");
      if (existingTable) {
        $("#id").DataTable().destroy();
      }
      $("#id").off("buttons-action.dt");
    };
  }, [experientialLearningData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Curriculum"
            breadcrumbItem="Experiential Learning"
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
                  {/* Semester Dropdowns */}
                  <Col lg={8}>
                    <SemesterDropdowns
                      semesterTypeValue={validation.values.semType}
                      semesterNoValue={validation.values.semNumber}
                      onSemesterTypeChange={(selectedOption) =>
                        validation.setFieldValue("semType", selectedOption)
                      }
                      onSemesterNoChange={(selectedOption) =>
                        validation.setFieldValue("semNumber", selectedOption)
                      }
                      isSemesterTypeInvalid={
                        validation.touched.semType &&
                        !!validation.errors.semType
                      }
                      isSemesterNoInvalid={
                        validation.touched.semNumber &&
                        !!validation.errors.semNumber
                      }
                      semesterTypeError={
                        validation.touched.semType
                          ? validation.errors.semType
                          : null
                      }
                      semesterNoError={
                        validation.touched.semNumber
                          ? Array.isArray(validation.errors.semNumber)
                            ? validation.errors.semNumber[0]
                            : validation.errors.semNumber
                          : null
                      }
                      semesterTypeTouched={!!validation.touched.semType}
                      semesterNoTouched={!!validation.touched.semNumber}
                    />
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
                      <Label>Program Title</Label>
                      <Input
                        type="text"
                        name="programTitle"
                        value={validation.values.programTitle}
                        onChange={validation.handleChange}
                        placeholder="Enter Program Name"
                        className={
                          validation.touched.programTitle &&
                            validation.errors.programTitle
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.programTitle &&
                        validation.errors.programTitle && (
                          <div className="text-danger">
                            {validation.errors.programTitle}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Course Title</Label>
                      <Input
                        type="text"
                        name="courseTitle"
                        value={validation.values.courseTitle}
                        onChange={validation.handleChange}
                        placeholder="Enter Program Name"
                        className={
                          validation.touched.courseTitle &&
                            validation.errors.courseTitle
                            ? "is-invalid"
                            : ""
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
                    <Button
                      className="btn btn-tabs toggle-wizard-button"
                      onClick={toggleWizard}
                    >
                      PEDAGOGY
                    </Button>
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
                        {[1, 2, 3, 4, 5, 6].map((tab) => (
                          <Button
                            key={tab}
                            className={`step-button ${activeTab === tab ? "active" : ""
                              }`}
                            onClick={() => handleTabChange(tab)}
                          >
                            {tab}.
                            {tab === 1
                              ? "Pedagogy"
                              : tab === 2
                                ? "Internship"
                                : tab === 3
                                  ? "Field Visit"
                                  : tab === 4
                                    ? "Projects/Dissertation"
                                    : tab === 5
                                      ? "Fellowship Report"
                                      : "Bootcamp Report"}
                          </Button>
                        ))}
                      </div>
                      <div className="tab-content">
                        {/* Pedagogy Tab */}
                        {activeTab === 1 && (
                          <Form>
                            <Row>
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label
                                    htmlFor="pedagogyFile"
                                    className="form-label"
                                  >
                                    Upload file
                                  </Label>
                                  {(isEditMode && validation.values.pedagogy.pedagogyFileName) ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.pedagogy.pedagogyFileName}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          handleDownloadFile(
                                            validation.values.pedagogy.pedagogyFileName
                                          )
                                        }
                                        title="Download File"
                                      >
                                        <i className="bi bi-download"></i>
                                      </Button>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "pedagogy",
                                            "pedagogyFile",
                                            "pedagogyFileName",
                                            validation.values.pedagogy.pedagogyFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : validation.values.pedagogy.pedagogyFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.pedagogy.pedagogyFileName}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "pedagogy",
                                            "pedagogyFile",
                                            "pedagogyFileName",
                                            validation.values.pedagogy.pedagogyFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      className={`form-control ${validation.touched.pedagogy?.pedagogyFile &&
                                        validation.errors.pedagogy?.pedagogyFile
                                        ? "is-invalid"
                                        : ""
                                        }`}
                                      type="file"
                                      id="pedagogyFile"
                                      disabled={!!validation.values.pedagogy.pedagogyFileName}
                                      onChange={(event) => {
                                        const file = event.currentTarget.files?.[0] || null;
                                        validation.setFieldValue("pedagogy.pedagogyFile", file);
                                        validation.setFieldValue("pedagogy.pedagogyFileName", file ? file.name : "");
                                        validation.setFieldValue("pedagogy.pedagogyFileKey", undefined);
                                      }}
                                    />
                                  )}
                                  {validation.touched.pedagogy?.pedagogyFile &&
                                    validation.errors.pedagogy?.pedagogyFile && (
                                      <div className="text-danger">
                                        {validation.errors.pedagogy.pedagogyFile}
                                      </div>
                                    )}
                                </div>
                              </Col>
                            </Row>
                            <Row className="mt-3">
                              <Col className="d-flex justify-content-center">
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={async () => {
                                    // If in edit mode and a backend file exists, delete it first
                                    if (isEditMode && validation.values.pedagogy?.pedagogyFileKey) {
                                      try {
                                        await handleDeleteFileWithKey(
                                          "pedagogy",
                                          "pedagogyFile",
                                          "pedagogyFileName",
                                          validation.values.pedagogy.pedagogyFileKey
                                        );
                                      } catch (err) {
                                        // swallow — handleDeleteFileWithKey already toasts on error
                                      }
                                    }

                                    // Clear Formik values for pedagogy
                                    validation.setFieldValue("pedagogy", {
                                      pedagogyFile: null,
                                      pedagogyFileName: "",
                                      pedagogyFileKey: "",
                                    });

                                    // Clear DOM input so user can re-upload same file if needed
                                    if (pedagogyFileRef.current) {
                                      pedagogyFileRef.current.value = "";
                                    }
                                  }}
                                >
                                  Clear
                                </button>
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {/* Internship Tab */}
                        {activeTab === 2 && (
                          <Form>
                            <Row>
                              <Col lg="4">
                                <Label>Total number of Interning student</Label>
                                <Input
                                  type="text"
                                  placeholder="Enter Total number of Interning student"
                                  value={validation.values.internship?.totalJoiningStudentsOfIntern}
                                  onChange={(e) =>
                                    validation.setFieldValue(
                                      "internship.totalJoiningStudentsOfIntern",
                                      e.target.value
                                    )
                                  }
                                  className={`form-control ${validation.touched.internship?.totalJoiningStudentsOfIntern &&
                                    validation.errors.internship?.totalJoiningStudentsOfIntern
                                    ? "is-invalid"
                                    : ""
                                    }`}
                                />
                              </Col>
                              <Col lg="4">
                                <Label>Organisation name</Label>
                                <Input
                                  type="text"
                                  placeholder="Enter Organisation name"
                                  value={validation.values.internship?.orgNameOfIntern}
                                  onChange={(e) =>
                                    validation.setFieldValue(
                                      "internship.orgNameOfIntern",
                                      e.target.value
                                    )
                                  }
                                  className={`form-control ${validation.touched.internship?.orgNameOfIntern &&
                                    validation.errors.internship?.orgNameOfIntern
                                    ? "is-invalid"
                                    : ""
                                    }`}
                                />
                              </Col>
                              <Col lg="4">
                                <Label>Location of the organisation</Label>
                                <Input
                                  type="text"
                                  placeholder="Enter Location of the organisation"
                                  value={validation.values.internship.locationOfIntern}
                                  onChange={(e) =>
                                    validation.setFieldValue(
                                      "internship.locationOfIntern",
                                      e.target.value
                                    )
                                  }
                                  className={`form-control ${validation.touched.internship?.locationOfIntern &&
                                    validation.errors.internship?.locationOfIntern
                                    ? "is-invalid"
                                    : ""
                                    }`}
                                />
                              </Col>
                            </Row>
                            <Row className="mt-3">
                              <Col className="d-flex justify-content-center">
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() =>
                                    validation.setFieldValue("internship", {
                                      totalJoiningStudentsOfIntern: "",
                                      orgNameOfIntern: "",
                                      locationOfIntern: "",
                                    })
                                  }
                                >
                                  Clear
                                </button>
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {/* Field Project Tab */}
                        {activeTab === 3 && (
                          <Form>
                            <Row>
                              <Col lg="4">
                                <div className="mb-3">
                                  <Label>
                                    Total number of participating student
                                  </Label>
                                  <Input
                                    type="text"
                                    placeholder="Enter Total number of participating student"
                                    value={validation.values.fieldProject?.totalParticipatingStudents}
                                    onChange={(e) =>
                                      validation.setFieldValue(
                                        "fieldProject.totalParticipatingStudents",
                                        e.target.value
                                      )
                                    }
                                    className={`form-control ${validation.touched.fieldProject?.totalParticipatingStudents &&
                                      validation.errors.fieldProject?.totalParticipatingStudents
                                      ? "is-invalid"
                                      : ""
                                      }`}
                                  />
                                </div>
                              </Col>
                              <Col lg="4">
                                <div className="mb-3">
                                  <Label>Duration of Field Visit start date</Label>
                                  <Input
                                    type="date"
                                    value={
                                      validation.values.fieldProject?.fieldProjectStartDate
                                        ? moment(validation.values.fieldProject.fieldProjectStartDate, "DD-MM-YYYY").format("YYYY-MM-DD")
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const formatted = moment(e.target.value, "YYYY-MM-DD").format("DD-MM-YYYY");
                                      validation.setFieldValue("fieldProject.fieldProjectStartDate", formatted);
                                    }}
                                    className={`form-control ${validation.touched.fieldProject?.fieldProjectStartDate && validation.errors.fieldProject?.fieldProjectStartDate ? "is-invalid" : ""}`}
                                  />
                                </div>
                              </Col>

                              <Col lg="4">
                                <div className="mb-3">
                                  <Label>Duration of Field Visit end date</Label>
                                  <Input
                                    type="date"
                                    value={
                                      validation.values.fieldProject?.fieldProjectEndDate
                                        ? moment(validation.values.fieldProject.fieldProjectEndDate, "DD-MM-YYYY").format("YYYY-MM-DD")
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const formatted = moment(e.target.value, "YYYY-MM-DD").format("DD-MM-YYYY");
                                      validation.setFieldValue("fieldProject.fieldProjectEndDate", formatted);
                                    }}
                                    className={`form-control ${validation.touched.fieldProject?.fieldProjectEndDate && validation.errors.fieldProject?.fieldProjectEndDate ? "is-invalid" : ""}`}
                                  />
                                </div>
                              </Col>
                            </Row>
                            <Row>
                              <Col lg="4">
                                <Label>Location of the organisation</Label>
                                <Input
                                  type="text"
                                  placeholder="Enter Location of the organisation"
                                  value={validation.values.fieldProject.locationOfOrganisation}
                                  onChange={(e) =>
                                    validation.setFieldValue(
                                      "fieldProject.locationOfOrganisation",
                                      e.target.value
                                    )
                                  }
                                  className={`form-control ${validation.touched.fieldProject?.locationOfOrganisation &&
                                    validation.errors.fieldProject?.locationOfOrganisation
                                    ? "is-invalid"
                                    : ""
                                    }`}
                                />
                              </Col>
                              {/* Field Visit File */}
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label htmlFor="fieldProjectFile" className="form-label">
                                    Field Visit File
                                  </Label>
                                  {(isEditMode && validation.values.fieldProject.fieldProjectFileName) ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fieldProject.fieldProjectFileName || "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          handleDownloadFile(
                                            validation.values.fieldProject.fieldProjectFileName || ""
                                          )
                                        }
                                        title="Download File"
                                      >
                                        <i className="bi bi-download"></i>
                                      </Button>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "fieldProject",
                                            "fieldProjectFile",
                                            "fieldProjectFileName",
                                            validation.values.fieldProject.fieldProjectFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : validation.values.fieldProject.fieldProjectFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fieldProject.fieldProjectFileName || "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "fieldProject",
                                            "fieldProjectFile",
                                            "fieldProjectFileName",
                                            validation.values.fieldProject.fieldProjectFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      className={`form-control ${validation.touched.fieldProject?.fieldProjectFile &&
                                        validation.errors.fieldProject?.fieldProjectFile
                                        ? "is-invalid"
                                        : ""
                                        }`}
                                      type="file"
                                      id="fieldProjectFile"
                                      disabled={!!validation.values.fieldProject.fieldProjectFile}
                                      onChange={(event) => {
                                        const file = event.currentTarget.files?.[0] || null;
                                        validation.setFieldValue("fieldProject.fieldProjectFile", file);
                                        validation.setFieldValue("fieldProject.fieldProjectFileName", file ? file.name : "");
                                        validation.setFieldValue("fieldProject.fieldProjectFileKey", undefined);
                                      }}
                                    />
                                  )}
                                </div>
                              </Col>
                              {/* Communication Letter */}
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label htmlFor="communicationLetter" className="form-label">
                                    Communication Letter
                                  </Label>
                                  {(isEditMode && validation.values.fieldProject.communicationLetterFileName) ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fieldProject.communicationLetterFileName || "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          handleDownloadFile(
                                            validation.values.fieldProject.communicationLetterFileName || ""
                                          )
                                        }
                                        title="Download File"
                                      >
                                        <i className="bi bi-download"></i>
                                      </Button>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "fieldProject",
                                            "communicationLetter",
                                            "communicationLetterFileName",
                                            validation.values.fieldProject.communicationLetterFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : validation.values.fieldProject.communicationLetterFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fieldProject.communicationLetterFileName || "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "fieldProject",
                                            "communicationLetter",
                                            "communicationLetterFileName",
                                            validation.values.fieldProject.communicationLetterFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      className={`form-control ${validation.touched.fieldProject?.communicationLetter &&
                                        validation.errors.fieldProject?.communicationLetter
                                        ? "is-invalid"
                                        : ""
                                        }`}
                                      type="file"
                                      id="communicationLetter"
                                      disabled={!!validation.values.fieldProject.communicationLetter}
                                      onChange={(event) => {
                                        const file = event.currentTarget.files?.[0] || null;
                                        validation.setFieldValue("fieldProject.communicationLetter", file);
                                        validation.setFieldValue("fieldProject.communicationLetterFileName", file ? file.name : "");
                                        validation.setFieldValue("fieldProject.communicationLetterFileKey", undefined);
                                      }}
                                    />
                                  )}
                                </div>
                              </Col>
                              {/* Student Excel Sheet */}
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label htmlFor="studentExcelSheet" className="form-label">
                                    Student Excel Sheet
                                  </Label>
                                  {(isEditMode && validation.values.fieldProject.studentExcelSheetFileName) ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fieldProject.studentExcelSheetFileName || "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          handleDownloadFile(
                                            validation.values.fieldProject.studentExcelSheetFileName || ""
                                          )
                                        }
                                        title="Download File"
                                      >
                                        <i className="bi bi-download"></i>
                                      </Button>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "fieldProject",
                                            "studentExcelSheet",
                                            "studentExcelSheetFileName",
                                            validation.values.fieldProject.studentExcelSheetFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : validation.values.fieldProject.studentExcelSheetFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fieldProject.studentExcelSheetFileName || "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "fieldProject",
                                            "studentExcelSheet",
                                            "studentExcelSheetFileName",
                                            validation.values.fieldProject.studentExcelSheetFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      className={`form-control ${validation.touched.fieldProject?.studentExcelSheet &&
                                        validation.errors.fieldProject?.studentExcelSheet
                                        ? "is-invalid"
                                        : ""
                                        }`}
                                      type="file"
                                      id="studentExcelSheet"
                                      disabled={!!validation.values.fieldProject.studentExcelSheet}
                                      onChange={(event) => {
                                        const file = event.currentTarget.files?.[0] || null;
                                        validation.setFieldValue("fieldProject.studentExcelSheet", file);
                                        validation.setFieldValue("fieldProject.studentExcelSheetFileName", file ? file.name : "");
                                        validation.setFieldValue("fieldProject.studentExcelSheetFileKey", undefined);
                                      }}
                                    />
                                  )}
                                </div>
                              </Col>
                            </Row>
                            <Row className="mt-3">
                              <Col className="d-flex justify-content-center">
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={async () => {
                                    // In edit mode, delete backend files if keys exist
                                    if (isEditMode) {
                                      try {
                                        if (validation.values.fieldProject?.fieldProjectFileKey) {
                                          await handleDeleteFileWithKey(
                                            "fieldProject",
                                            "fieldProjectFile",
                                            "fieldProjectFileName",
                                            validation.values.fieldProject.fieldProjectFileKey
                                          );
                                        }
                                      } catch (err) {
                                        /* handleDeleteFileWithKey shows toast on error */
                                      }
                                      try {
                                        if (validation.values.fieldProject?.communicationLetterFileKey) {
                                          await handleDeleteFileWithKey(
                                            "fieldProject",
                                            "communicationLetter",
                                            "communicationLetterFileName",
                                            validation.values.fieldProject.communicationLetterFileKey
                                          );
                                        }
                                      } catch (err) { }
                                      try {
                                        if (validation.values.fieldProject?.studentExcelSheetFileKey) {
                                          await handleDeleteFileWithKey(
                                            "fieldProject",
                                            "studentExcelSheet",
                                            "studentExcelSheetFileName",
                                            validation.values.fieldProject.studentExcelSheetFileKey
                                          );
                                        }
                                      } catch (err) { }
                                    }

                                    // Clear all Formik values for fieldProject
                                    validation.setFieldValue("fieldProject", {
                                      totalParticipatingStudents: "",
                                      fieldProjectStartDate: "",
                                      fieldProjectEndDate: "",
                                      locationOfOrganisation: "",
                                      fieldProjectFile: null,
                                      fieldProjectFileName: "",
                                      fieldProjectFileKey: "",
                                      communicationLetter: null,
                                      communicationLetterFileName: "",
                                      communicationLetterFileKey: "",
                                      studentExcelSheet: null,
                                      studentExcelSheetFileName: "",
                                      studentExcelSheetFileKey: "",
                                    });

                                    // Clear DOM file inputs so same file can be re-uploaded
                                    if (fieldProjectFileRef.current) fieldProjectFileRef.current.value = "";
                                    if (communicationLetterRef.current) communicationLetterRef.current.value = "";
                                    if (fieldStudentExcelRef.current) fieldStudentExcelRef.current.value = "";
                                  }}
                                >
                                  Clear
                                </button>
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {/* Dissertation Tab */}
                        {activeTab === 4 && (
                          <Form>
                            <Row>
                              <Col lg="4">
                                <div className="mb-3">
                                  <Label>
                                    Total number of participating student
                                  </Label>
                                  <Input
                                    type="text"
                                    placeholder="Enter Total number of participating student"
                                    value={
                                      validation.values.dissertation
                                        ?.totalParticipatingStudentsdissertation
                                    }
                                    onChange={(e) =>
                                      validation.setFieldValue(
                                        "dissertation.totalParticipatingStudentsdissertation",
                                        e.target.value
                                      )
                                    }
                                    className={`form-control ${validation.touched.dissertation
                                      ?.totalParticipatingStudentsdissertation &&
                                      validation.errors.dissertation
                                        ?.totalParticipatingStudentsdissertation
                                      ? "is-invalid"
                                      : ""
                                      }`}
                                  />
                                </div>
                              </Col>
                              <Col lg="4">
                                <div className="mb-3">
                                  <Label>Duration of field project start date</Label>
                                  <Input
                                    type="date"
                                    placeholder="Enter Duration of field project start date"
                                    value={
                                      validation.values.dissertation?.dissertationStartDate
                                        ? moment(validation.values.dissertation.dissertationStartDate, "DD-MM-YYYY").format("YYYY-MM-DD")
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const formattedDate = moment(e.target.value, "YYYY-MM-DD").format("DD-MM-YYYY");
                                      validation.setFieldValue("dissertation.dissertationStartDate", formattedDate);
                                    }}
                                    className={`form-control ${validation.touched.dissertation?.dissertationStartDate &&
                                      validation.errors.dissertation?.dissertationStartDate
                                      ? "is-invalid"
                                      : ""
                                      }`}
                                  />
                                </div>
                              </Col>

                              <Col lg="4">
                                <div className="mb-3">
                                  <Label>Duration of field project end date</Label>
                                  <Input
                                    type="date"
                                    placeholder="Enter Duration of field project end date"
                                    value={
                                      validation.values.dissertation?.dissertationEndDate
                                        ? moment(validation.values.dissertation.dissertationEndDate, "DD-MM-YYYY").format("YYYY-MM-DD")
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const formattedDate = moment(e.target.value, "YYYY-MM-DD").format("DD-MM-YYYY");
                                      validation.setFieldValue("dissertation.dissertationEndDate", formattedDate);
                                    }}
                                    className={`form-control ${validation.touched.dissertation?.dissertationEndDate &&
                                      validation.errors.dissertation?.dissertationEndDate
                                      ? "is-invalid"
                                      : ""
                                      }`}
                                  />
                                </div>
                              </Col>
                            </Row>
                            <Row className="mt-3">
                              <Col className="d-flex justify-content-center">
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() =>
                                    validation.setFieldValue("dissertation", {
                                      totalParticipatingStudentsdissertation:
                                        "",
                                      dissertationStartDate: "",
                                      dissertationEndDate: "",
                                    })
                                  }
                                >
                                  Clear
                                </button>
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {/* Fellowship Tab */}
                        {activeTab === 5 && (
                          <Form>
                            <Row>
                              {/* Student Excel Sheet */}
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label htmlFor="fellowshipStudentExcelSheet" className="form-label">
                                    Student Excel Sheet
                                  </Label>
                                  {(isEditMode && validation.values.fellowship.studentExcelSheetFileName) ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fellowship.studentExcelSheetFileName || "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          handleDownloadFile(
                                            validation.values.fellowship.studentExcelSheetFileName || ""
                                          )
                                        }
                                        title="Download File"
                                      >
                                        <i className="bi bi-download"></i>
                                      </Button>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "fellowship",
                                            "studentExcelSheet",
                                            "studentExcelSheetFileName",
                                            validation.values.fellowship.studentExcelSheetFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : validation.values.fellowship.studentExcelSheetFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fellowship.studentExcelSheetFileName || "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "fellowship",
                                            "studentExcelSheet",
                                            "studentExcelSheetFileName",
                                            validation.values.fellowship.studentExcelSheetFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      className={`form-control ${validation.touched.fellowship?.studentExcelSheet &&
                                        validation.errors.fellowship?.studentExcelSheet
                                        ? "is-invalid"
                                        : ""
                                        }`}
                                      type="file"
                                      id="fellowshipStudentExcelSheet"
                                      disabled={!!validation.values.fellowship.studentExcelSheet}
                                      onChange={(event) => {
                                        const file = event.currentTarget.files?.[0] || null;
                                        validation.setFieldValue("fellowship.studentExcelSheet", file);
                                        validation.setFieldValue("fellowship.studentExcelSheetFileName", file ? file.name : "");
                                        validation.setFieldValue("fellowship.studentExcelSheetFileKey", undefined);
                                      }}
                                    />
                                  )}
                                </div>
                              </Col>
                              {/* Fellowship File */}
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label htmlFor="fellowshipFile" className="form-label">
                                    Fellowship File
                                  </Label>
                                  {(isEditMode && validation.values.fellowship.fellowshipFileName) ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fellowship.fellowshipFileName || "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          handleDownloadFile(
                                            validation.values.fellowship.fellowshipFileName || ""
                                          )
                                        }
                                        title="Download File"
                                      >
                                        <i className="bi bi-download"></i>
                                      </Button>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "fellowship",
                                            "fellowshipFile",
                                            "fellowshipFileName",
                                            validation.values.fellowship.fellowshipFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : validation.values.fellowship.fellowshipFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fellowship.fellowshipFileName || "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "fellowship",
                                            "fellowshipFile",
                                            "fellowshipFileName",
                                            validation.values.fellowship.fellowshipFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      className={`form-control ${validation.touched.fellowship?.fellowshipFile &&
                                        validation.errors.fellowship?.fellowshipFile
                                        ? "is-invalid"
                                        : ""
                                        }`}
                                      type="file"
                                      id="fellowshipFile"
                                      disabled={!!validation.values.fellowship.fellowshipFile}
                                      onChange={(event) => {
                                        const file = event.currentTarget.files?.[0] || null;
                                        validation.setFieldValue("fellowship.fellowshipFile", file);
                                        validation.setFieldValue("fellowship.fellowshipFileName", file ? file.name : "");
                                        validation.setFieldValue("fellowship.fellowshipFileKey", undefined);
                                      }}
                                    />
                                  )}
                                </div>
                              </Col>
                            </Row>
                            <Row className="mt-3">
                              <Col className="d-flex justify-content-center">
                                <Button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={async () => {
                                    // In edit mode delete backend files if keys exist
                                    if (isEditMode) {
                                      try {
                                        if (validation.values.fellowship?.studentExcelSheetFileKey) {
                                          await handleDeleteFileWithKey(
                                            "fellowship",
                                            "studentExcelSheet",
                                            "studentExcelSheetFileName",
                                            validation.values.fellowship.studentExcelSheetFileKey
                                          );
                                        }
                                      } catch (err) { /* noop - handleDeleteFileWithKey shows toast */ }

                                      try {
                                        if (validation.values.fellowship?.fellowshipFileKey) {
                                          await handleDeleteFileWithKey(
                                            "fellowship",
                                            "fellowshipFile",
                                            "fellowshipFileName",
                                            validation.values.fellowship.fellowshipFileKey
                                          );
                                        }
                                      } catch (err) { /* noop */ }
                                    }

                                    // Clear all Formik values for fellowship
                                    validation.setFieldValue("fellowship", {
                                      studentExcelSheet: null,
                                      studentExcelSheetFileName: "",
                                      studentExcelSheetFileKey: "",
                                      fellowshipFile: null,
                                      fellowshipFileName: "",
                                      fellowshipFileKey: "",
                                    });

                                    // Clear DOM file inputs so same file can be re-uploaded
                                    if (fellowshipStudentExcelRef.current) fellowshipStudentExcelRef.current.value = "";
                                    if (fellowshipFileRef.current) fellowshipFileRef.current.value = "";
                                  }}
                                >
                                  Clear
                                </Button>
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {/* Bootcamp Tab */}
                        {activeTab === 6 && (
                          <Form>
                            <Row>
                              {/* Student Excel Sheet */}
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label htmlFor="bootcampStudentExcelSheet" className="form-label">
                                    Student Excel Sheet
                                  </Label>
                                  {(isEditMode && validation.values.bootcamp.studentExcelSheetFileName) ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.bootcamp.studentExcelSheetFileName || "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          handleDownloadFile(
                                            validation.values.bootcamp.studentExcelSheetFileName || ""
                                          )
                                        }
                                        title="Download File"
                                      >
                                        <i className="bi bi-download"></i>
                                      </Button>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "bootcamp",
                                            "studentExcelSheet",
                                            "studentExcelSheetFileName",
                                            validation.values.bootcamp.studentExcelSheetFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : validation.values.bootcamp.studentExcelSheetFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.bootcamp.studentExcelSheetFileName || "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "bootcamp",
                                            "studentExcelSheet",
                                            "studentExcelSheetFileName",
                                            validation.values.bootcamp.studentExcelSheetFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      className={`form-control ${validation.touched.bootcamp?.studentExcelSheet &&
                                        validation.errors.bootcamp?.studentExcelSheet
                                        ? "is-invalid"
                                        : ""
                                        }`}
                                      type="file"
                                      id="bootcampStudentExcelSheet"
                                      disabled={!!validation.values.bootcamp.studentExcelSheet}
                                      onChange={(event) => {
                                        const file = event.currentTarget.files?.[0] || null;
                                        validation.setFieldValue("bootcamp.studentExcelSheet", file);
                                        validation.setFieldValue("bootcamp.studentExcelSheetFileName", file ? file.name : "");
                                        validation.setFieldValue("bootcamp.studentExcelSheetFileKey", undefined);
                                      }}
                                    />
                                  )}
                                </div>
                              </Col>
                              {/* Bootcamp File */}
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label htmlFor="bootcampFile" className="form-label">
                                    Bootcamp File
                                  </Label>
                                  {(isEditMode && validation.values.bootcamp.bootcampFileName) ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.bootcamp.bootcampFileName || "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          handleDownloadFile(
                                            validation.values.bootcamp.bootcampFileName || ""
                                          )
                                        }
                                        title="Download File"
                                      >
                                        <i className="bi bi-download"></i>
                                      </Button>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "bootcamp",
                                            "bootcampFile",
                                            "bootcampFileName",
                                            validation.values.bootcamp.bootcampFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : validation.values.bootcamp.bootcampFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.bootcamp.bootcampFileName || "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "bootcamp",
                                            "bootcampFile",
                                            "bootcampFileName",
                                            validation.values.bootcamp.bootcampFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      className={`form-control ${validation.touched.bootcamp?.bootcampFile &&
                                        validation.errors.bootcamp?.bootcampFile
                                        ? "is-invalid"
                                        : ""
                                        }`}
                                      type="file"
                                      id="bootcampFile"
                                      disabled={!!validation.values.bootcamp.bootcampFile}
                                      onChange={(event) => {
                                        const file = event.currentTarget.files?.[0] || null;
                                        validation.setFieldValue("bootcamp.bootcampFile", file);
                                        validation.setFieldValue("bootcamp.bootcampFileName", file ? file.name : "");
                                        validation.setFieldValue("bootcamp.bootcampFileKey", undefined);
                                      }}
                                    />
                                  )}
                                </div>
                              </Col>
                            </Row>
                            <Row className="mt-3">
                              <Col className="d-flex justify-content-center">
                                <Button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={async () => {
                                    // In edit mode delete backend files if keys exist
                                    if (isEditMode) {
                                      try {
                                        if (validation.values.bootcamp?.studentExcelSheetFileKey) {
                                          await handleDeleteFileWithKey(
                                            "bootcamp",
                                            "studentExcelSheet",
                                            "studentExcelSheetFileName",
                                            validation.values.bootcamp.studentExcelSheetFileKey
                                          );
                                        }
                                      } catch (err) { /* noop */ }

                                      try {
                                        if (validation.values.bootcamp?.bootcampFileKey) {
                                          await handleDeleteFileWithKey(
                                            "bootcamp",
                                            "bootcampFile",
                                            "bootcampFileName",
                                            validation.values.bootcamp.bootcampFileKey
                                          );
                                        }
                                      } catch (err) { /* noop */ }
                                    }

                                    // Clear all Formik values for bootcamp
                                    validation.setFieldValue("bootcamp", {
                                      studentExcelSheet: null,
                                      studentExcelSheetFileName: "",
                                      studentExcelSheetFileKey: "",
                                      bootcampFile: null,
                                      bootcampFileName: "",
                                      bootcampFileKey: "",
                                    });

                                    // Clear DOM file inputs so same file can be re-uploaded
                                    if (bootcampStudentExcelRef.current) bootcampStudentExcelRef.current.value = "";
                                    if (bootcampFileRef.current) bootcampFileRef.current.value = "";
                                  }}
                                >
                                  Clear
                                </Button>
                              </Col>
                            </Row>
                          </Form>
                        )}
                      </div>
                    </div>
                  )}
                </Row>

                <Row>
                  <Col lg={12}>
                    <div className="mt-3 d-flex justify-content-between">
                      <button className="btn btn-primary" type="submit">
                        {isEditMode
                          ? "Update Experiential Learning"
                          : "Save Experiential Learning"}
                      </button>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={handleListBosClick}
                      >
                        List Experiential Learning
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
            List Experiential Learning
          </ModalHeader>
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
            <Table
              striped
              bordered
              hover
              responsive
              className="align-middle text-center"
              id="id"
              innerRef={tableRef}
              style={{ display: "none" }}
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
                  <th>Degree</th>
                  <th>Program Title</th>
                  <th>Course Title</th>

                  <th>File Path (Pedagogy)</th>

                  <th>Total number of Interning student(Internship)</th>
                  <th>Organisation name(Internship)</th>
                  <th>Location of the organisation(Internship)</th>

                  <th>Total number of participating student(Field Visit)</th>
                  <th>Duration of Field Visit start date(Field Visit)</th>
                  <th>Duration of Field Visit end date(Field Visit)</th>
                  <th>Location of Organisation(Field Visit)</th>
                  <th>Field Project File(Field Visit)</th>
                  <th>Communication Letter(Field Visit)</th>
                  <th>Student Excel Sheet(Field Visit)</th>

                  <th>
                    Total number of participating student(Projects/Dissertation)
                  </th>
                  <th>Duration of Project start date(Projects/Dissertation)</th>
                  <th>Duration of Project end date(Projects/Dissertation)</th>

                  <th>Student Excel Sheet(Fellowship)</th>
                  <th>Fellowship File(Fellowship)</th>

                  <th>Student Excel Sheet(Bootcamp)</th>
                  <th>Bootcamp File(Bootcamp)</th>
                </tr>
              </thead>
              <tbody>
                {experientialLearningData?.length > 0 ? (
                  experientialLearningData?.map((el, index) => (
                    <tr key={el.id}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{el.academicYear}</td>
                      <td>{el.semType}</td>
                      <td>{el.semNumber}</td>
                      <td>{el.streamName}</td>
                      <td>{el.departmentName}</td>
                      <td>{el.programTypeName}</td>
                      <td>{el.programName}</td>
                      <td>{el.programTitle}</td>
                      <td>{el.courseTitle}</td>

                      <td>{el.pedagogy?.filePath?.Pedagogy || "N/A"}</td>
                      <td>{el.internship?.totalInterningStudents || "N/A"}</td>
                      <td>{el.internship?.internOrgName || "N/A"}</td>
                      <td>{el.internship?.internOrgLocation || "N/A"}</td>

                      <td>
                        {el.fieldProject?.totalFieldProjectStudents || "N/A"}
                      </td>
                      <td>{el.fieldProject?.fieldProjectStratDate || "N/A"}</td>
                      <td>{el.fieldProject?.fieldProjectEndDate || "N/A"}</td>
                      <td>
                        {el.fieldProject?.fielsProjectOrgLocation || "N/A"}
                      </td>
                      <td>
                        {el.fieldProject?.filePath?.FieldProject || "N/A"}
                      </td>
                      <td>
                        {el.fieldProject?.filePath?.CommunicationLetter ||
                          "N/A"}
                      </td>
                      <td>
                        {el.fieldProject?.filePath?.StudentExcelSheet || "N/A"}
                      </td>

                      <td>
                        {el.dissertation
                          ?.totalParticipatingStudentsdissertation || "N/A"}
                      </td>
                      <td>{el.dissertation?.dissertationStartDate || "N/A"}</td>
                      <td>{el.dissertation?.dissertationEndDate || "N/A"}</td>

                      <td>
                        {el.fellowship?.filePath?.studentExcelSheetFileName ||
                          "N/A"}
                      </td>
                      <td>
                        {el.fellowship?.filePath?.fellowshipFileName || "N/A"}
                      </td>
                      <td>
                        {el.bootcamp?.filePath?.studentExcelSheetFileName ||
                          "N/A"}
                      </td>
                      <td>{el.bootcamp?.filePath?.Bootcamp || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center">
                      No EL data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
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
                  <th>Degree</th>
                  <th>Program Title</th>
                  <th>Course Title</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {experientialLearningData.length > 0 ? (
                  experientialLearningData.map((el, index) => (
                    <tr key={el.id}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{el.academicYear}</td>
                      <td>{el.semType}</td>
                      <td>{el.semNumber}</td>
                      <td>{el.streamName}</td>
                      <td>{el.departmentName}</td>
                      <td>{el.programTypeName}</td>
                      <td>{el.programName}</td>
                      <td>{el.programTitle}</td>
                      <td>{el.courseTitle}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(el.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(el.id)}
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
                      No EL data available.
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

export default Experiential_Learning;
