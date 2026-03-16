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
  Tooltip,
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
import { di } from "@fullcalendar/core/internal-common";
import { t } from "i18next";

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
    // | "pedagogy"
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
  // const pedagogyFileRef = useRef<HTMLInputElement>(null);
  const bootcampFileRef = useRef<HTMLInputElement>(null);
  const bootcampStudentExcelRef = useRef<HTMLInputElement>(null);
  const fieldProjectFileRef = useRef<HTMLInputElement>(null);
  const communicationLetterRef = useRef<HTMLInputElement>(null);
  //const fieldStudentExcelRef = useRef<HTMLInputElement>(null);
  const internshipFileRef = useRef<HTMLInputElement>(null);
  const internshipExcelSheetRef = useRef<HTMLInputElement>(null);
  const dissertationFileRef = useRef<HTMLInputElement>(null);

  const tableRef = useRef<HTMLTableElement>(null);

  const [editResData, setEditResData] = useState<any>(null);

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const clearTabFields = async (validation: any, tab: number | null) => {
    try {
      // console.log("clearTabFields called with tab:", tab);
      // console.log("editResData:", editResData);
      let deleteId = null;

      if (tab === 1 && editResData?.internship?.addOnFieldId) {
        deleteId = editResData.internship.addOnFieldId;
      } else if (tab === 2 && editResData?.fieldProject?.addOnFieldId) {
        deleteId = editResData.fieldProject.addOnFieldId;
      } else if (tab === 3 && editResData?.dissertations?.addOnFieldId) {
        deleteId = editResData.dissertations.addOnFieldId;
      } else if (tab === 4 && editResData?.fellowship?.addOnFieldId) {
        deleteId = editResData.fellowship.addOnFieldId;
      } else if (tab === 5 && editResData?.bootcamp?.addOnFieldId) {
        deleteId = editResData.bootcamp.addOnFieldId;
      }
      // console.log("Delete ID:", deleteId);
      if (deleteId) {
        console.log("Hitting API...");
        await api.delete(
          `/experientialLearning/deleteExperientialLearningTabsAndDoc?experientialLearningAddTabId=${deleteId}`,
          ""
        );
      }
      switch (tab) {
        case 1:
          validation.setFieldValue("internship", {
            totalJoiningStudentsOfIntern: "",
            orgNameOfIntern: "",
            locationOfIntern: "",
            internshipFile: null,
            internshipFileName: "",
            internshipFileKey: "",
            internshipExcelSheet: null,
            internshipExcelSheetFileName: "",
            internshipExcelSheetFileKey: "",
          });
          if (internshipFileRef.current) internshipFileRef.current.value = "";
          if (internshipExcelSheetRef.current)
            internshipExcelSheetRef.current.value = "";
          break;
        case 2:
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
            // studentExcelSheet: null,
            // studentExcelSheetFileName: "",
            // studentExcelSheetFileKey: "",
          });
          if (fieldProjectFileRef.current)
            fieldProjectFileRef.current.value = "";
          if (communicationLetterRef.current)
            communicationLetterRef.current.value = "";
          // if (fieldStudentExcelRef.current)
          //   fieldStudentExcelRef.current.value = "";
          break;
        case 3:
          validation.setFieldValue("dissertation", {
            totalParticipatingStudentsdissertation: "",
            dissertationsStartDate: "",
            dissertationsEndDate: "",
            dissertationTitleOfTheProject: "",
            dissertationFile: null,
            dissertationFileName: "",
            dissertationFileKey: "",
          });
          if (dissertationFileRef.current)
            dissertationFileRef.current.value = "";
          break;
        case 4:
          validation.setFieldValue("fellowship", {
            studentExcelSheet: null,
            studentExcelSheetFileName: "",
            studentExcelSheetFileKey: "",
            fellowshipFile: null,
            fellowshipFileName: "",
            fellowshipFileKey: "",
          });
          if (fellowshipStudentExcelRef.current)
            fellowshipStudentExcelRef.current.value = "";
          if (fellowshipFileRef.current) fellowshipFileRef.current.value = "";
          break;
        case 5:
          validation.setFieldValue("bootcamp", {
            studentExcelSheet: null,
            studentExcelSheetFileName: "",
            studentExcelSheetFileKey: "",
            bootcampFile: null,
            bootcampFileName: "",
            bootcampFileKey: "",
          });
          if (bootcampStudentExcelRef.current)
            bootcampStudentExcelRef.current.value = "";
          if (bootcampFileRef.current) bootcampFileRef.current.value = "";
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error("Failed to clear tab data. Please try again.");
      console.error("Error clearing tab data:", error);
    }
  };

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

  const courseTypeOptions = [
    { value: "core", label: "CORE" },
    { value: "allied", label: "ALLIED" },
    { value: "elective", label: "ELECTIVE" },
  ];

  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
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
    fileNameKey: string,
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
    validation.setFieldValue(`${tab}.${fileNameKey}`, "");
    validation.validateForm();
  };

  // ----------- HANDLE EDIT -----------
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/experientialLearning?experientialLearningID=${id}`,
        ""
      );
      const academicYearOptions = await api.get("/getAllAcademicYear", "");
      setEditResData(response);
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
      const internshipFileInfo = getFileInfoByFolder(
        response.internship?.file,
        "Certificates"
      );
      const internshipExcelSheetFileInfo = getFileInfoByFolder(
        response.internship?.file,
        "ExcelSheet"
      );
      const communicationLetterFileInfo = getFileInfoByFolder(
        response.fieldProject?.file,
        "CommunicationLetter"
      );
      // const fieldProjectstudentExcelFileInfo = getFileInfoByFolder(
      //   response.fieldProject?.file,
      //   "StudentExcelSheet"
      // );
      const dissertationFileInfo = getFileInfoByFolder(
        response.dissertations?.file,
        "Dissertation"
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

        courseType: response.courseType
          ? {
              value: String(response.courseType),
              label: String(response.courseType),
            }
          : null,
        // pedagogy: {
        //   pedagogyFile: null,
        //   pedagogyFileName: "",
        //   pedagogyFileKey: "",
        // },
        internship: {
          totalJoiningStudentsOfIntern:
            response.internship?.totalInternStudents || "",
          orgNameOfIntern: response.internship?.internOrgName || "",
          locationOfIntern: response.internship?.internOrgLocation || "",
          internshipFile: null,
          internshipFileName: internshipFileInfo.fileName || "",
          internshipFileKey: internshipFileInfo.fileKey || "",
          internshipExcelSheet: null,
          internshipExcelSheetFileName:
            internshipExcelSheetFileInfo.fileName || "",
          internshipExcelSheetFileKey:
            internshipExcelSheetFileInfo.fileKey || "",
          addOnFieldId: response.internship?.addOnFieldId || "",
        },
        fieldProject: {
          addOnFieldId: response.fieldProject?.addOnFieldId || "",
          totalParticipatingStudents:
            response.fieldProject?.totalFieldProjectStudents || "",
          fieldProjectStartDate:
            response.fieldProject?.fieldProjectStratDate || "",
          fieldProjectEndDate: response.fieldProject?.fieldProjectEndDate || "",
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
          // studentExcelSheetFileName:
          //   fieldProjectstudentExcelFileInfo.fileName || "",
          // studentExcelSheetFileKey:
          //   fieldProjectstudentExcelFileInfo.fileKey || "",
        },
        dissertation: {
          addOnFieldId: response.dissertations?.addOnFieldId || "",
          totalParticipatingStudentsdissertation:
            response.dissertations?.totalDissertationsStudents || "",
          // convert backend date -> DD-MM-YYYY for Formik storage
          dissertationsStartDate:
            response.dissertations?.dissertationsStartDate || "",
          dissertationsEndDate:
            response.dissertations?.dissertationsEndDate || "",
          dissertationFile: null,
          dissertationFileName: dissertationFileInfo.fileName || "",
          dissertationFileKey: dissertationFileInfo.fileKey || "",
          dissertationTitleOfTheProject:
            response.dissertations?.dissertationTitleOfTheProject || "",
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
        programTitle: mappedValues.programTitle || "",
        courseTitle: mappedValues.courseTitle || "",

        courseType: response.courseType
          ? {
              value: String(response.courseType),
              label: String(response.courseType),
            }
          : null,

        // pedagogy: {
        //   pedagogyFile: null,
        //   pedagogyFileName:
        //     (response.pedagogy?.file &&
        //       Object.values(response.pedagogy.file)[0]) ||
        //     "",
        //   pedagogyFileKey: response.pedagogy?.file
        //     ? Object.keys(response.pedagogy.file)[0]
        //     : "",
        //   addOnFieldId: response.pedagogy?.addOnFieldId || "",
        // },

        internship: {
          totalJoiningStudentsOfIntern:
            mappedValues.internship?.totalJoiningStudentsOfIntern || "",
          orgNameOfIntern: mappedValues.internship?.orgNameOfIntern || "",
          locationOfIntern: mappedValues.internship?.locationOfIntern || "",
          internshipFile: null,
          internshipFileName: internshipFileInfo.fileName || "",
          internshipFileKey: internshipFileInfo.fileKey || "",
          internshipExcelSheet: null,
          internshipExcelSheetFileName:
            internshipExcelSheetFileInfo.fileName || "",
          internshipExcelSheetFileKey:
            internshipExcelSheetFileInfo.fileKey || "",
          addOnFieldId: response.internship?.addOnFieldId || "",
        },

        fieldProject: {
          totalParticipatingStudents:
            mappedValues.fieldProject?.totalParticipatingStudents || "",
          fieldProjectStartDate:
            response.fieldProject?.fieldProjectStratDate || "",
          fieldProjectEndDate: response.fieldProject?.fieldProjectEndDate || "",
          locationOfOrganisation:
            mappedValues.fieldProject?.locationOfOrganisation || "",
          fieldProjectFile: null,
          fieldProjectFileName: fieldProjectFileInfo.fileName || "",
          fieldProjectFileKey: fieldProjectFileInfo.fileKey || "",
          communicationLetter: null,
          communicationLetterFileName:
            communicationLetterFileInfo.fileName || "",
          communicationLetterFileKey: communicationLetterFileInfo.fileKey || "",
          //studentExcelSheet: null,
          // studentExcelSheetFileName:
          //   fieldProjectstudentExcelFileInfo.fileName || "",
          // studentExcelSheetFileKey:
          //   fieldProjectstudentExcelFileInfo.fileKey || "",
          addOnFieldId: response.fieldProject?.addOnFieldId || "",
        },

        dissertation: {
          totalParticipatingStudentsdissertation:
            mappedValues.dissertation?.totalParticipatingStudentsdissertation ||
            "",
          dissertationsStartDate:
            mappedValues.dissertation?.dissertationsStartDate || null,
          dissertationsEndDate:
            mappedValues.dissertation?.dissertationsEndDate || null,
          addOnFieldId: response.dissertations?.addOnFieldId || "",
          dissertationFile: null,
          dissertationFileName: dissertationFileInfo.fileName || "",
          dissertationFileKey: dissertationFileInfo.fileKey || "",
          dissertationTitleOfTheProject:
            response.dissertations?.dissertationTitleOfTheProject || "",
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
        // pedagogy: 1,
        internship: 1,
        fieldProject: 2,
        dissertation: 3,
        fellowship: 4,
        bootcamp: 5,
      };
      const maxTab = getMaxDataTabWithFile(response);
      // Normalize "dissertations" to "dissertation"
      const normalizedTab =
        maxTab === "dissertations" ? "dissertation" : maxTab;
      if (normalizedTab && Object.keys(tabMap).includes(normalizedTab)) {
        setActiveTab1(
          normalizedTab as  // | "pedagogy"
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
      // "pedagogy",
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
        setIsModalOpen(false);

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

  // const pedagogySchema = Yup.object({
  //   pedagogyFile: Yup.mixed().test(
  //     "fileValidation",
  //     "Please upload a valid file",
  //     function (value) {
  //       if (isFileUploadDisabled) return true;
  //       // SKIP validation in edit mode if backend file is present
  //       if (isEditMode && (this.parent?.pedagogyFileName || this.parent?.pedagogyFileKey)) return true;
  //       if (!value) {
  //         return this.createError({ message: "Please upload a file" });
  //       }
  //       if (value instanceof File && value.size > 3 * 1024 * 1024) {
  //         return this.createError({ message: "File size is too large" });
  //       }
  //       const allowedTypes = [
  //         "application/pdf",
  //         "application/vnd.ms-excel",
  //         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //         "text/csv",
  //       ];
  //       if (value instanceof File && !allowedTypes.includes(value.type)) {
  //         return this.createError({ message: "Unsupported file format" });
  //       }
  //       return true;
  //     }
  //   ),
  // });

  const internshipSchema = Yup.object({
    totalJoiningStudentsOfIntern: Yup.string().required(
      "Enter total number of joining students"
    ),
    orgNameOfIntern: Yup.string().required("Enter organization name"),
    locationOfIntern: Yup.string().required("Enter organization location"),
    internshipFile: Yup.mixed().when(["internshipFileKey"], {
      // Skip validation when editing and backend file exists
      is: (fileKey: any) => isEditMode && !!fileKey,

      // No upload required when backend file exists
      then: (schema) => schema.nullable(),

      // Require upload when:
      // create mode OR backend file deleted
      otherwise: (schema) =>
        schema
          .required("Please upload a valid file")
          .test("fileSize", "File size is too large", (value) => {
            if (!value || !(value instanceof File)) return false;
            return value.size <= 50 * 1024 * 1024;
          })
          .test("fileType", "Unsupported file format", (value) => {
            if (!value || !(value instanceof File)) return false;

            const allowed = [
              "application/pdf",
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "text/csv",
            ];

            return allowed.includes(value.type);
          }),
    }),
    //  internshipExcelSheet: Yup.mixed().when(
    //   ["internshipExcelSheetFileKey"],
    //   {
    //     // Skip validation when editing and backend file exists
    //     is: (fileKey: any) => isEditMode && !!fileKey,
    //     // No upload required when backend file exists
    //     then: (schema) => schema.nullable(),
    //     // Require upload when:
    //     // create mode OR backend file deleted
    //     otherwise: (schema) =>
    //       schema

    //         .required("Please upload a valid file")
    //         .test("fileSize", "File size is too large", (value) => {
    //           if (!value || !(value instanceof File)) return false;
    //           return value.size <= 3 * 1024 * 1024;
    //         })
    //         .test("fileType", "Unsupported file format", (value) => {
    //           if (!value || !(value instanceof File)) return false;
    //           const allowed = [
    //             "application/vnd.ms-excel",
    //             "text/csv",
    //           ];
    //           return allowed.includes(value.type);
    //         }),
    //   }
    // ),
    internshipExcelSheet: Yup.mixed().when(["internshipExcelSheetFileKey"], {
      is: (fileKey: any) => isEditMode && !!fileKey,
      then: (schema) => schema.nullable(),
      otherwise: (schema) =>
        schema
          .required("Please upload a file")
          .test("fileSize", "File size is too large", (value) => {
            if (!value || !(value instanceof File)) return false;
            return value.size <= 50 * 1024 * 1024;
          })
          .test("fileType", "Unsupported file format", (value) => {
            if (!value || !(value instanceof File)) return false;

            const allowed = [
              "application/pdf",
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "text/csv",
            ];

            return allowed.includes(value.type);
          }),
    }),
  });

  const fieldProjectSchema = Yup.object({
    totalParticipatingStudents: Yup.string().required(
      "Enter total number of participating students"
    ),
    fieldProjectStartDate: Yup.string()
      .nullable()
      .required("Please select start date")
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),

    fieldProjectEndDate: Yup.string()
      .nullable()
      .required("Please select end date")
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),

    locationOfOrganisation: Yup.string().required(
      "Enter location of the organisation"
    ),

    fieldProjectFile: Yup.mixed().when(["fieldProjectFileKey"], {
      is: (fileKey: any) => isEditMode && !!fileKey,
      then: (schema) => schema.nullable(),
      otherwise: (schema) =>
        schema
          .required("Please upload a file")
          .test("fileSize", "File size is too large", (value) => {
            if (!value || !(value instanceof File)) return false;
            return value.size <= 10 * 1024 * 1024;
          })
          .test("fileType", "Unsupported file format", (value) => {
            if (!value || !(value instanceof File)) return false;

            const allowed = [
              "application/pdf",
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "text/csv",
            ];

            return allowed.includes(value.type);
          }),
    }),

    communicationLetter: Yup.mixed().when(["communicationLetterFileKey"], {
      is: (fileKey: any) => isEditMode && !!fileKey,
      // Skip validation if editing and backend file exists
      then: (schema) => schema.nullable(),

      otherwise: (schema) =>
        schema
          .required("Please upload a valid file")
          .test("fileSize", "File size is too large", (value) => {
            if (!value || !(value instanceof File)) return false;
            return value.size <= 50 * 1024 * 1024;
          })
          .test("fileType", "Unsupported file format", (value) => {
            if (!value || !(value instanceof File)) return false;

            const allowedTypes = [
              "application/pdf",
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "text/csv",
            ];

            return allowedTypes.includes(value.type);
          }),
    }),
  });

  const dissertationSchema = Yup.object({
    totalParticipatingStudentsdissertation: Yup.string().required(
      "Enter total number of participating students"
    ),
    dissertationsStartDate: Yup.string()
      .nullable()
      .required("Please select start date")
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    dissertationsEndDate: Yup.string()
      .nullable()
      .required("Please select end date")
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),

    dissertationTitleOfTheProject: Yup.string().required(
      "Enter the title of the dissertation project"
    ),
    dissertationFile: Yup.mixed().when(["dissertationFileKey"], {
      // Skip validation when editing & backend file exists
      is: (fileKey: any) => isEditMode && !!fileKey,

      // Allow empty when backend file exists
      then: (schema) => schema.nullable(),

      // Require file otherwise (create mode or backend file deleted)
      otherwise: (schema) =>
        schema
          .required("Please upload a valid file")
          .test("fileSize", "File size is too large", (value) => {
            if (!value || !(value instanceof File)) return false;
            return value.size <= 50 * 1024 * 1024;
          })
          .test("fileType", "Unsupported file format", (value) => {
            if (!value || !(value instanceof File)) return false;

            const allowedTypes = [
              "application/pdf",
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "text/csv",
            ];

            return allowedTypes.includes(value.type);
          }),
    }),
  });

  const fellowshipSchema = Yup.object({
    studentExcelSheet: Yup.mixed().when(["studentExcelSheetFileKey"], {
      // Skip validation when editing AND backend file exists
      is: (fileKey: any) => isEditMode && !!fileKey,

      // Allow the field to be empty when the backend already has a file
      then: (schema) => schema.nullable(),

      // Otherwise enforce validation
      otherwise: (schema) =>
        schema
          .required("Please upload a valid file")
          .test("fileSize", "File size is too large", (value) => {
            if (!value || !(value instanceof File)) return false;
            return value.size <= 50 * 1024 * 1024;
          })
          .test("fileType", "Unsupported file format", (value) => {
            if (!value || !(value instanceof File)) return false;

            const allowedTypes = [
              "application/pdf",
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "text/csv",
            ];

            return allowedTypes.includes(value.type);
          }),
    }),

    fellowshipFile: Yup.mixed().when(["fellowshipFileKey"], {
      // Skip validation when editing and backend file exists
      is: (fileKey) => isEditMode && !!fileKey,

      // Allow no new file upload when backend file exists
      then: (schema) => schema.nullable(),

      // Validate file when no backend file exists (create mode or after delete)
      otherwise: (schema) =>
        schema
          .required("Please upload a valid file")
          .test("fileSize", "File size is too large", (value) => {
            if (!value || !(value instanceof File)) return false;
            return value.size <= 50 * 1024 * 1024;
          })
          .test("fileType", "Unsupported file format", (value) => {
            if (!value || !(value instanceof File)) return false;

            const allowedTypes = [
              "application/pdf",
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "text/csv",
            ];

            return allowedTypes.includes(value.type);
          }),
    }),
  });

  const bootcampSchema = Yup.object({
    studentExcelSheet: Yup.mixed().when(
      ["studentExcelSheetFileKey"], // 👈 Watch the backend fileKey only
      {
        // Skip validation when editing AND backend file exists
        is: (fileKey: any) => isEditMode && !!fileKey,

        // Allow the field to be empty if backend already has a file
        then: (schema) => schema.nullable(),

        // Otherwise validate normally
        otherwise: (schema) =>
          schema
            .required("Please upload a valid file")
            .test("fileSize", "File size is too large", (value) => {
              if (!value || !(value instanceof File)) return false;
              return value.size <= 50 * 1024 * 1024; // 10MB
            })
            .test("fileType", "Unsupported file format", (value) => {
              if (!value || !(value instanceof File)) return false;

              const allowedTypes = [
                "application/pdf",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "text/csv",
              ];

              return allowedTypes.includes(value.type);
            }),
      }
    ),

    bootcampFile: Yup.mixed().when(["bootcampFileKey"], {
      // Skip validation when editing AND backend file exists
      is: (fileKey: any) => isEditMode && !!fileKey,

      // No need to upload again when backend file exists
      then: (schema) => schema.nullable(),

      // Require & validate file when:
      // - create mode
      // - edit mode but backend file deleted
      otherwise: (schema) =>
        schema
          .required("Please upload a valid file")
          .test("fileSize", "File size is too large", (value) => {
            if (!value || !(value instanceof File)) return false;
            return value.size <= 50 * 1024 * 1024;
          })
          .test("fileType", "Unsupported file format", (value) => {
            if (!value || !(value instanceof File)) return false;

            const allowedTypes = [
              "application/pdf",
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "text/csv",
            ];

            return allowedTypes.includes(value.type);
          }),
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
    courseType: Yup.object().nullable().required("Please select course type"),
  });

  // Add similar ones for Field Project, Dissertation, Fellowship, Bootcamp
  // Removed duplicate combinedSchema declaration to avoid redeclaration error.
  const isAnyTabFilled = (values: typeof validation.values) => {
    console.log("Checking filled tabs with values:", values);
    const tabs =
      // (values?.pedagogy && values.pedagogy.pedagogyFile) ||
      values?.internship?.totalJoiningStudentsOfIntern ||
      values?.internship?.orgNameOfIntern ||
      values?.internship?.locationOfIntern ||
      values?.internship?.internshipFile ||
      values?.internship?.internshipExcelSheet ||
      values?.fieldProject?.totalParticipatingStudents ||
      values?.fieldProject?.fieldProjectStartDate ||
      values?.fieldProject?.fieldProjectEndDate ||
      values?.fieldProject?.locationOfOrganisation ||
      values?.fieldProject?.fieldProjectFile ||
      values?.fieldProject?.communicationLetter ||
      //values?.fieldProject?.studentExcelSheet ||
      values?.dissertation?.totalParticipatingStudentsdissertation ||
      values?.dissertation?.dissertationsStartDate ||
      values?.dissertation?.dissertationsStartDate ||
      values?.dissertation?.dissertationFile ||
      values?.dissertation?.dissertationTitleOfTheProject ||
      values?.fellowship?.studentExcelSheetFileKey ||
      values?.fellowship?.fellowshipFileKey ||
      values?.fellowship?.fellowshipFileName ||
      values?.bootcamp?.studentExcelSheetFileKey ||
      values?.bootcamp?.bootcampFileName ||
      values?.bootcamp?.bootcampFileKey;

    return !!tabs;
  };

  const handleTabChange = (newTabIndex: number) => {
    const tabMap = {
      // 1: "pedagogy",
      1: "internship",
      2: "fieldProject",
      3: "dissertation",
      4: "fellowship",
      5: "bootcamp",
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
      // pedagogy: pedagogySchema,
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
    // "pedagogy",
    "internship",
    "fieldProject",
    "dissertation",
    "fellowship",
    "bootcamp",
  ];

  // Helper to check if a sub-form is filled
  const isFilled = (obj: any) =>
    obj &&
    Object.values(obj).some(
      (val) =>
        val !== null &&
        val !== "" &&
        !(typeof val === "object" && Object.keys(val).length === 0)
    );

  const combinedSchema = getCombinedSchema(activeTab1);
  const validation = useFormik({
    enableReinitialize: true,
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
      courseType: null as { value: string; label: string } | null,
      file: null,
      // pedagogy: {
      //   pedagogyFile: null,
      //   pedagogyFileName: "",
      //   pedagogyFileKey: "",
      //   addOnFieldId: "",
      // },
      internship: {
        totalJoiningStudentsOfIntern: "",
        orgNameOfIntern: "",
        locationOfIntern: "",
        internshipFile: null,
        internshipFileName: "",
        internshipFileKey: "",
        internshipExcelSheet: null,
        internshipExcelSheetFileName: "",
        internshipExcelSheetFileKey: "",
        addOnFieldId: "",
      },
      fieldProject: {
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
        // studentExcelSheet: null,
        // studentExcelSheetFileName: "",
        // studentExcelSheetFileKey: "",
        addOnFieldId: "",
      },
      dissertation: {
        totalParticipatingStudentsdissertation: "",
        dissertationsEndDate: "",
        dissertationsStartDate: "",
        dissertationFile: null,
        dissertationFileName: "",
        dissertationFileKey: "",
        dissertationTitleOfTheProject: "",
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
        courseType: values.courseType?.value || "",
      };

      // Map subform keys to required API structure
      if (activeTab1 === "internship" && isFilled(values.internship)) {
        dtoPayload.internship = {
          totalInternStudents:
            values.internship.totalJoiningStudentsOfIntern || null,
          internOrgName: values.internship.orgNameOfIntern || null,
          internOrgLocation: values.internship.locationOfIntern || null,
          addOnFieldId: values.internship.addOnFieldId || null,
        };
      }
      if (activeTab1 === "fieldProject" && isFilled(values.fieldProject)) {
        dtoPayload.fieldProject = {
          totalFieldProjectStudents:
            values.fieldProject.totalParticipatingStudents || null,
          fieldProjectStratDate:
            values.fieldProject.fieldProjectStartDate || null,
          fieldProjectEndDate: values.fieldProject.fieldProjectEndDate || null,
          fielsProjectOrgLocation:
            values.fieldProject.locationOfOrganisation || null,
          addOnFieldId: values.fieldProject.addOnFieldId || null,
        };
      }
      if (activeTab1 === "dissertation" && isFilled(values.dissertation)) {
        dtoPayload.dissertations = {
          totalDissertationsStudents:
            values.dissertation.totalParticipatingStudentsdissertation || null,
          dissertationsStartDate:
            values.dissertation.dissertationsStartDate || null,
          dissertationsEndDate:
            values.dissertation.dissertationsEndDate || null,
          dissertationTitleOfTheProject:
            values.dissertation.dissertationTitleOfTheProject || null,
          addOnFieldId: values.dissertation.addOnFieldId || null,
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
      // if (activeTab1 === "pedagogy" && isFilled(values.pedagogy)) {
      //   dtoPayload.pedagogy = {
      //     ...values.pedagogy,
      //     addOnFieldId: values.pedagogy.addOnFieldId || null,
      //   };
      // }

      console.log("DTO Payload:", dtoPayload); // Debug log

      formData.append(
        "experientialLearningRequestDto",
        new Blob([JSON.stringify(dtoPayload)], { type: "application/json" })
      );

      // Append only the files for the selected tab (as before)
      // if (activeTab1 === "pedagogy") {
      //   if (values.pedagogy?.pedagogyFile) formData.append("pedagogy", values.pedagogy.pedagogyFile);
      // }
      if (activeTab1 === "fieldProject") {
        if (values.fieldProject?.fieldProjectFile)
          formData.append(
            "fP_fieldProject",
            values.fieldProject.fieldProjectFile
          );
        if (values.fieldProject?.communicationLetter)
          formData.append(
            "fP_communicationLetter",
            values.fieldProject.communicationLetter
          );
        // if (values.fieldProject?.studentExcelSheet)
        //   formData.append(
        //     "fP_studentExcelSheet",
        //     values.fieldProject.studentExcelSheet
        //   );
      }
      if (activeTab1 === "fellowship") {
        if (values.fellowship?.fellowshipFile)
          formData.append("f_fellowship", values.fellowship.fellowshipFile);
        if (values.fellowship?.studentExcelSheet)
          formData.append(
            "f_studentExcelSheet",
            values.fellowship.studentExcelSheet
          );
      }
      if (activeTab1 === "bootcamp") {
        if (values.bootcamp?.bootcampFile)
          formData.append("b_bootcamp", values.bootcamp.bootcampFile);
        if (values.bootcamp?.studentExcelSheet)
          formData.append(
            "b_studentExcelSheet",
            values.bootcamp.studentExcelSheet
          );
      }
      if (activeTab1 === "internship") {
        if (values.internship?.internshipFile)
          formData.append("i_certificates", values.internship.internshipFile);
        if (values.internship?.internshipExcelSheet)
          formData.append(
            "i_excelSheet",
            values.internship.internshipExcelSheet
          );
      }

      if (activeTab1 === "dissertation") {
        if (values.dissertation?.dissertationFile)
          formData.append(
            "d_dissertation",
            values.dissertation.dissertationFile
          );
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
    },
    //     onSubmit: async (values, { resetForm }) => {
    //   console.log("Submit triggered with values:", values);
    //   console.log("activeTab1:", activeTab1);
    //   console.log("isFilled(currentTab):", isFilled(values[activeTab1 || ""]));
    //   console.log("isAnyTabFilled:", isAnyTabFilled(values));
    //   console.log("validation errors:", validation.errors);

    //   await validation.validateForm();

    //   if (Object.keys(validation.errors).length) {
    //     toast.error("Fix validation errors (see console)");
    //     return;
    //   }

    //   if (!isAnyTabFilled(values)) {
    //     toast.warning("You must fill at least one experiential tab.");
    //     return;
    //   }

    //   const formData = new FormData();

    //   const dtoPayload: any = {
    //     id: isEditMode && editId ? editId : null,
    //     academicYear: values.academicYear?.value || "",
    //     semType: values.semType?.value || "",
    //     semNumber: values.semNumber?.value || "",
    //     streamId: values.stream?.value || "",
    //     departmentId: values.department?.value || "",
    //     programTypeId: values.programType?.value || "",
    //     programId: values.degree?.value || "",
    //     programName: values.degree?.label || "",
    //     programTitle: values.programTitle,
    //     courseTitle: values.courseTitle,
    //     courseType: values.courseType?.value || "",
    //   };

    //   // ====== Decide which tab is filled and attach object ======
    //   const mapTab = {
    //     internship: values.internship,
    //     fieldProject: values.fieldProject,
    //     dissertation: values.dissertation,
    //     fellowship: values.fellowship,
    //     bootcamp: values.bootcamp,
    //   };

    //   // build DTO for only that tab
    //   if (activeTab1 === "internship") {
    //     dtoPayload.internship = {
    //       totalInternStudents: values.internship.totalJoiningStudentsOfIntern || null,
    //       internOrgName: values.internship.orgNameOfIntern || null,
    //       internOrgLocation: values.internship.locationOfIntern || null,
    //       addOnFieldId: values.internship.addOnFieldId || null,
    //     };
    //   }

    //   if (activeTab1 === "fieldProject") {
    //     dtoPayload.fieldProject = {
    //       totalFieldProjectStudents: values.fieldProject.totalParticipatingStudents || null,
    //       fieldProjectStratDate: values.fieldProject.fieldProjectStartDate
    //         ? moment(values.fieldProject.fieldProjectStartDate, "DD-MM-YYYY").format("YYYY-MM-DD")
    //         : null,
    //       fieldProjectEndDate: values.fieldProject.fieldProjectEndDate
    //         ? moment(values.fieldProject.fieldProjectEndDate, "DD-MM-YYYY").format("YYYY-MM-DD")
    //         : null,
    //       fielsProjectOrgLocation: values.fieldProject.locationOfOrganisation || null,
    //       addOnFieldId: values.fieldProject.addOnFieldId || null,
    //     };
    //   }

    //   if (activeTab1 === "dissertation") {
    //     dtoPayload.dissertations = {
    //       totalDissertationsStudents: values.dissertation.totalParticipatingStudentsdissertation || null,
    //       dissertationsStartDate: values.dissertation.dissertationsStartDate
    //         ? moment(values.dissertation.dissertationsStartDate, "DD-MM-YYYY").format("YYYY-MM-DD")
    //         : null,
    //       dissertationsEndDate: values.dissertation.dissertationsEndDate
    //         ? moment(values.dissertation.dissertationsEndDate, "DD-MM-YYYY").format("YYYY-MM-DD")
    //         : null,
    //       dissertationTitleOfTheProject: values.dissertation.dissertationTitleOfTheProject || null,
    //       addOnFieldId: values.dissertation.addOnFieldId || null,
    //     };
    //   }

    //   if (activeTab1 === "fellowship") {
    //     dtoPayload.fellowship = {
    //       addOnFieldId: values.fellowship.addOnFieldId || null,
    //     };
    //   }

    //   if (activeTab1 === "bootcamp") {
    //     dtoPayload.bootcamp = {
    //       addOnFieldId: values.bootcamp.addOnFieldId || null,
    //     };
    //   }

    //   // ===========================================
    //   //        APPEND DTO JSON
    //   // ===========================================
    //   formData.append(
    //     "experientialLearningRequestDto",
    //     new Blob([JSON.stringify(dtoPayload)], { type: "application/json" })
    //   );

    //   // ===========================================
    //   //        FILE APPEND LOGIC (WORKS LIKE YOUR CWF FORM)
    //   // ===========================================
    //   const safeAppend = (key: string, file: any, tab: string) => {
    //     if (activeTab1 === tab) {
    //       if (isEditMode && file === null) {
    //         // send empty file so backend keeps old file
    //         formData.append(key, new Blob([], { type: "application/pdf" }), "empty.pdf");
    //       } else if (file instanceof File) {
    //         formData.append(key, file);
    //       } else {
    //         formData.append(key, new Blob([], { type: "application/pdf" }), "empty.pdf");
    //       }
    //     } else {
    //       // inactive tabs → send empty file
    //       formData.append(key, new Blob([], { type: "application/pdf" }), "empty.pdf");
    //     }
    //   };
    //   safeAppend("fP_fieldProject", values.fieldProject?.fieldProjectFile, "fieldProject");
    //   safeAppend("fP_communicationLetter", values.fieldProject?.communicationLetter, "fieldProject");
    //   safeAppend("d_dissertation", values.dissertation?.dissertationFile, "dissertation");
    //   safeAppend("f_fellowship", values.fellowship?.fellowshipFile, "fellowship");
    //   safeAppend("f_studentExcelSheet", values.fellowship?.studentExcelSheet, "fellowship");
    //   safeAppend("b_bootcamp", values.bootcamp?.bootcampFile, "bootcamp");
    //   safeAppend("b_studentExcelSheet", values.bootcamp?.studentExcelSheet, "bootcamp");

    //   // ===========================================
    //   //      CALL API
    //   // ===========================================
    //   try {
    //     const response =
    //       isEditMode && editId
    //         ? await api.put(`/experientialLearning`, formData, {
    //             headers: { "Content-Type": "multipart/form-data" },
    //           })
    //         : await api.create(`/experientialLearning`, formData, {
    //             headers: { "Content-Type": "multipart/form-data" },
    //           });

    //     toast.success(
    //       response.message ||
    //         (isEditMode ? "Experiential Learning updated!" : "Experiential Learning created!")
    //     );

    //     resetForm();
    //     setIsEditMode(false);
    //     setEditId(null);
    //   } catch (err) {
    //     console.error(err);
    //     toast.error("Failed to save/update. Try again.");
    //   }
    // }
  });

  useEffect(() => {
    if (experientialLearningData.length === 0) return;

    const initializeDataTable = () => {
      const table = $("#id").DataTable({
        destroy: true,
        dom: "Bfrtip",
        paging: true,
        pageLength: 10,
        info: true,
        searching: false,
        columnDefs: [
          {
            // hide columns 11–29 (your exact hidden count)
            targets: [
              11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
              27, 28, 29,
            ],
            visible: false,
          },
          {
            targets: 30, // ACTION column
            visible: true,
            orderable: false,
            searchable: false,
          },
        ],

        buttons: [
          {
            extend: "copy",
            filename: "Experiential_Learning_Data",
            title: "Experiential Learning Data Export",
          },
          {
            extend: "csv",
            filename: "Experiential_Learning_Data",
            title: "Experiential Learning Data Export",
            exportOptions: {
              modifier: { page: "all" },
              columns: function (idx) {
                return idx !== 30; // exclude ONLY Actions
              },
            },
          },
        ],
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
                      <Label>Course Type</Label>
                      <Select
                        options={courseTypeOptions}
                        value={validation.values.courseType}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("courseType", selectedOption)
                        }
                        placeholder="Select Title of Course Type"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.courseType &&
                          validation.errors.courseType
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.courseType &&
                        validation.errors.courseType && (
                          <div className="text-danger">
                            {typeof validation.errors.courseType === "string"
                              ? validation.errors.courseType
                              : ""}
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
                        placeholder="Enter Course Title"
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
                    <button
                      className="btn btn-primary toggle-wizard-button"
                      onClick={toggleWizard}
                      type="button"
                    >
                      PEDAGOGY
                    </button>
                    {/* <Button
                      className="btn btn-primary toggle-wizard-button"
                      onClick={toggleWizard}
                    >
                      PEDAGOGY
                    </Button> */}
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
                        {[1, 2, 3, 4, 5].map((tab) => (
                          <Button
                            key={tab}
                            className={`step-button ${
                              activeTab === tab ? "active" : ""
                            }`}
                            onClick={() => handleTabChange(tab)}
                          >
                            {tab}.
                            {/* {tab === 1
                              ? "Pedagogy"
                              : */}
                            {tab === 1
                              ? "Internship"
                              : tab === 2
                              ? "Field Visit"
                              : tab === 3
                              ? "Projects/Dissertation"
                              : tab === 4
                              ? "Fellowship"
                              : "Bootcamp"}
                          </Button>
                        ))}
                      </div>
                      <div className="tab-content">
                        {/* Pedagogy Tab */}
                        {/* {activeTab === 1 && (
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
                        )} */}
                        {/* Internship Tab */}
                        {activeTab === 1 && (
                          <Form>
                            <Row>
                              <Col lg="4">
                                <Label>
                                  Total number of Interning students
                                </Label>
                                <Input
                                  type="text"
                                  placeholder="Enter Total number of Interning students"
                                  value={
                                    validation.values.internship
                                      ?.totalJoiningStudentsOfIntern
                                  }
                                  onChange={(e) =>
                                    validation.setFieldValue(
                                      "internship.totalJoiningStudentsOfIntern",
                                      e.target.value
                                    )
                                  }
                                  className={`form-control ${
                                    validation.touched.internship
                                      ?.totalJoiningStudentsOfIntern &&
                                    validation.errors.internship
                                      ?.totalJoiningStudentsOfIntern
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
                                  value={
                                    validation.values.internship
                                      ?.orgNameOfIntern
                                  }
                                  onChange={(e) =>
                                    validation.setFieldValue(
                                      "internship.orgNameOfIntern",
                                      e.target.value
                                    )
                                  }
                                  className={`form-control ${
                                    validation.touched.internship
                                      ?.orgNameOfIntern &&
                                    validation.errors.internship
                                      ?.orgNameOfIntern
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
                                  value={
                                    validation.values.internship
                                      .locationOfIntern
                                  }
                                  onChange={(e) =>
                                    validation.setFieldValue(
                                      "internship.locationOfIntern",
                                      e.target.value
                                    )
                                  }
                                  className={`form-control ${
                                    validation.touched.internship
                                      ?.locationOfIntern &&
                                    validation.errors.internship
                                      ?.locationOfIntern
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                              </Col>
                            </Row>
                            <Row className="mt-3">
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label
                                    htmlFor="internshipFile"
                                    className="form-label"
                                  >
                                    Upload Certificates
                                  </Label>
                                  {isEditMode &&
                                  validation.values.internship
                                    .internshipFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.internship
                                          .internshipFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          handleDownloadFile(
                                            validation.values.internship
                                              .internshipFileName || ""
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
                                            "internship",
                                            "internshipFile",
                                            "internshipFileName",
                                            "internshipFileKey",
                                            validation.values.internship
                                              .internshipFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : validation.values.internship
                                      .internshipFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.internship
                                          .internshipFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "internship",
                                            "internshipFile",
                                            "internshipFileName",
                                            "internshipFileKey",
                                            validation.values.internship
                                              .internshipFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      className={`form-control ${
                                        validation.touched.internship
                                          ?.internshipFile &&
                                        validation.errors.internship
                                          ?.internshipFile
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                      type="file"
                                      id="internshipFile"
                                      disabled={
                                        !!validation.values.internship
                                          .internshipFile
                                      }
                                      onChange={(event) => {
                                        const file =
                                          event.currentTarget.files?.[0] ||
                                          null;
                                        validation.setFieldValue(
                                          "internship.internshipFile",
                                          file
                                        );
                                        validation.setFieldValue(
                                          "internship.internshipFileName",
                                          file ? file.name : ""
                                        );
                                        validation.setFieldValue(
                                          "internship.internshipFileKey",
                                          undefined
                                        );
                                      }}
                                    />
                                  )}
                                </div>
                              </Col>
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label
                                    htmlFor="internshipExcelSheet"
                                    className="form-label"
                                  >
                                    Upload Excel Sheet
                                  </Label>
                                  {isEditMode &&
                                  validation.values.internship
                                    .internshipExcelSheetFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.internship
                                          .internshipExcelSheetFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          handleDownloadFile(
                                            validation.values.internship
                                              .internshipExcelSheetFileName ||
                                              ""
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
                                            "internship",
                                            "internshipExcelSheet",
                                            "internshipExcelSheetFileName",
                                            "internshipExcelSheetFileKey",
                                            validation.values.internship
                                              .internshipExcelSheetFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : validation.values.internship
                                      .internshipExcelSheetFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.internship
                                          .internshipExcelSheetFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "internship",
                                            "internshipExcelSheet",
                                            "internshipExcelSheetFileName",
                                            "internshipExcelSheetFileKey",
                                            validation.values.internship
                                              .internshipExcelSheetFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      className={`form-control ${
                                        validation.touched.internship
                                          ?.internshipExcelSheet &&
                                        validation.errors.internship
                                          ?.internshipExcelSheet
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                      type="file"
                                      id="internshipExcelSheet"
                                      disabled={
                                        !!validation.values.internship
                                          .internshipExcelSheet
                                      }
                                      onChange={(event) => {
                                        const file =
                                          event.currentTarget.files?.[0] ||
                                          null;
                                        validation.setFieldValue(
                                          "internship.internshipExcelSheet",
                                          file
                                        );
                                        validation.setFieldValue(
                                          "internship.internshipExcelSheetFileName",
                                          file ? file.name : ""
                                        );
                                        validation.setFieldValue(
                                          "internship.internshipExcelSheetFileKey",
                                          undefined
                                        );
                                      }}
                                    />
                                  )}
                                </div>
                              </Col>

                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Download Template</Label>
                                  <div>
                                    <a
                                      href={`${process.env.PUBLIC_URL}/templateFiles/Experiential_Internship_Format.xlsx`}
                                      download
                                      className="btn btn-primary btn-sm"
                                    >
                                      Template(Excel)
                                    </a>
                                  </div>
                                </div>
                              </Col>
                            </Row>

                            <Row className="mt-3">
                              <Col className="d-flex justify-content-center">
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
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {/* Field Project Tab */}
                        {activeTab === 2 && (
                          <Form>
                            <Row>
                              <Col lg="4">
                                <div className="mb-3">
                                  <Label>
                                    Total number of participating students
                                  </Label>
                                  <Input
                                    type="text"
                                    placeholder="Enter Total number of participating students"
                                    value={
                                      validation.values.fieldProject
                                        ?.totalParticipatingStudents
                                    }
                                    onChange={(e) =>
                                      validation.setFieldValue(
                                        "fieldProject.totalParticipatingStudents",
                                        e.target.value
                                      )
                                    }
                                    className={`form-control ${
                                      validation.touched.fieldProject
                                        ?.totalParticipatingStudents &&
                                      validation.errors.fieldProject
                                        ?.totalParticipatingStudents
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                  />
                                </div>
                              </Col>
                              <Col lg="4">
                                <div className="mb-3">
                                  <Label>Start date</Label>
                                  <Input
                                    type="date"
                                    value={
                                      validation.values.fieldProject
                                        ?.fieldProjectStartDate || ""
                                    }
                                    onChange={(e) => {
                                      validation.setFieldValue(
                                        "fieldProject.fieldProjectStartDate",
                                        e.target.value
                                      );
                                    }}
                                    className={`form-control ${
                                      validation.touched.fieldProject
                                        ?.fieldProjectStartDate &&
                                      validation.errors.fieldProject
                                        ?.fieldProjectStartDate
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                  />
                                </div>
                              </Col>

                              <Col lg="4">
                                <div className="mb-3">
                                  <Label>End date</Label>
                                  <Input
                                    type="date"
                                    value={
                                      validation.values.fieldProject
                                        ?.fieldProjectEndDate || ""
                                    }
                                    onChange={(e) => {
                                      const formatted = e.target.value;
                                      validation.setFieldValue(
                                        "fieldProject.fieldProjectEndDate",
                                        formatted
                                      );
                                    }}
                                    className={`form-control ${
                                      validation.touched.fieldProject
                                        ?.fieldProjectEndDate &&
                                      validation.errors.fieldProject
                                        ?.fieldProjectEndDate
                                        ? "is-invalid"
                                        : ""
                                    }`}
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
                                  value={
                                    validation.values.fieldProject
                                      .locationOfOrganisation
                                  }
                                  onChange={(e) =>
                                    validation.setFieldValue(
                                      "fieldProject.locationOfOrganisation",
                                      e.target.value
                                    )
                                  }
                                  className={`form-control ${
                                    validation.touched.fieldProject
                                      ?.locationOfOrganisation &&
                                    validation.errors.fieldProject
                                      ?.locationOfOrganisation
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                              </Col>
                              {/* Field Visit File */}
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label
                                    htmlFor="fieldProjectFile"
                                    className="form-label"
                                  >
                                    Field Visit Report
                                  </Label>
                                  {isEditMode &&
                                  validation.values.fieldProject
                                    .fieldProjectFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fieldProject
                                          .fieldProjectFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          handleDownloadFile(
                                            validation.values.fieldProject
                                              .fieldProjectFileName || ""
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
                                            "fieldProjectFileKey",
                                            validation.values.fieldProject
                                              .fieldProjectFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : validation.values.fieldProject
                                      .fieldProjectFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fieldProject
                                          .fieldProjectFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "fieldProject",
                                            "fieldProjectFile",
                                            "fieldProjectFileName",
                                            "fieldProjectFileKey",
                                            validation.values.fieldProject
                                              .fieldProjectFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      className={`form-control ${
                                        validation.touched.fieldProject
                                          ?.fieldProjectFile &&
                                        validation.errors.fieldProject
                                          ?.fieldProjectFile
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                      type="file"
                                      id="fieldProjectFile"
                                      disabled={
                                        !!validation.values.fieldProject
                                          .fieldProjectFile
                                      }
                                      onChange={(event) => {
                                        const file =
                                          event.currentTarget.files?.[0] ||
                                          null;
                                        validation.setFieldValue(
                                          "fieldProject.fieldProjectFile",
                                          file
                                        );
                                        validation.setFieldValue(
                                          "fieldProject.fieldProjectFileName",
                                          file ? file.name : ""
                                        );
                                        validation.setFieldValue(
                                          "fieldProject.fieldProjectFileKey",
                                          undefined
                                        );
                                      }}
                                    />
                                  )}
                                </div>
                              </Col>
                              {/* Communication Letter */}
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label
                                    htmlFor="communicationLetter"
                                    className="form-label"
                                  >
                                    Communication Letter
                                  </Label>
                                  {isEditMode &&
                                  validation.values.fieldProject
                                    .communicationLetterFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fieldProject
                                          .communicationLetterFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          handleDownloadFile(
                                            validation.values.fieldProject
                                              .communicationLetterFileName || ""
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
                                            "communicationLetterFileKey",
                                            validation.values.fieldProject
                                              .communicationLetterFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : validation.values.fieldProject
                                      .communicationLetterFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fieldProject
                                          .communicationLetterFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "fieldProject",
                                            "communicationLetter",
                                            "communicationLetterFileName",
                                            "communicationLetterFileKey",
                                            validation.values.fieldProject
                                              .communicationLetterFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      className={`form-control ${
                                        validation.touched.fieldProject
                                          ?.communicationLetter &&
                                        validation.errors.fieldProject
                                          ?.communicationLetter
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                      type="file"
                                      id="communicationLetter"
                                      disabled={
                                        !!validation.values.fieldProject
                                          .communicationLetter
                                      }
                                      onChange={(event) => {
                                        const file =
                                          event.currentTarget.files?.[0] ||
                                          null;
                                        validation.setFieldValue(
                                          "fieldProject.communicationLetter",
                                          file
                                        );
                                        validation.setFieldValue(
                                          "fieldProject.communicationLetterFileName",
                                          file ? file.name : ""
                                        );
                                        validation.setFieldValue(
                                          "fieldProject.communicationLetterFileKey",
                                          undefined
                                        );
                                      }}
                                    />
                                  )}
                                </div>
                              </Col>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Download Template</Label>
                                  <div>
                                    <a
                                      href={`${process.env.PUBLIC_URL}/templateFiles/Field_visit.docx`}
                                      download
                                      className="btn btn-primary btn-sm"
                                    >
                                      Template
                                    </a>
                                  </div>
                                </div>
                              </Col>
                              {/* Student Excel Sheet */}
                              {/* <Col sm={4}>
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
                              </Col> */}
                            </Row>
                            <Row className="mt-3">
                              <Col className="d-flex justify-content-center">
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
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {/* Dissertation Tab */}
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
                                    className={`form-control ${
                                      validation.touched.dissertation
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
                                  <Label>Start Date</Label>
                                  <Input
                                    type="date"
                                    placeholder="Enter Start Date"
                                    value={
                                      validation.values.dissertation
                                        ?.dissertationsStartDate || ""
                                    }
                                    onChange={(e) => {
                                      const formattedDate = e.target.value;
                                      validation.setFieldValue(
                                        "dissertation.dissertationsStartDate",
                                        formattedDate
                                      );
                                    }}
                                    className={`form-control ${
                                      validation.touched.dissertation
                                        ?.dissertationsStartDate &&
                                      validation.errors.dissertation
                                        ?.dissertationsStartDate
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                  />
                                </div>
                              </Col>

                              <Col lg="4">
                                <div className="mb-3">
                                  <Label>End Date</Label>
                                  <Input
                                    type="date"
                                    placeholder="Enter End Date"
                                    value={
                                      validation.values.dissertation
                                        ?.dissertationsEndDate || ""
                                    }
                                    onChange={(e) => {
                                      const formattedDate = e.target.value;
                                      validation.setFieldValue(
                                        "dissertation.dissertationsEndDate",
                                        formattedDate
                                      );
                                    }}
                                    className={`form-control ${
                                      validation.touched.dissertation
                                        ?.dissertationsEndDate &&
                                      validation.errors.dissertation
                                        ?.dissertationsEndDate
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                  />
                                </div>
                              </Col>
                            </Row>
                            <Row className="mt-3">
                              <Col lg="4">
                                <div className="mb-3">
                                  <Label>Title of the Project</Label>
                                  <Input
                                    type="text"
                                    placeholder="Enter Title of the Project"
                                    value={
                                      validation.values.dissertation
                                        ?.dissertationTitleOfTheProject
                                    }
                                    onChange={(e) =>
                                      validation.setFieldValue(
                                        "dissertation.dissertationTitleOfTheProject",
                                        e.target.value
                                      )
                                    }
                                    className={`form-control ${
                                      validation.touched.dissertation
                                        ?.dissertationTitleOfTheProject &&
                                      validation.errors.dissertation
                                        ?.dissertationTitleOfTheProject
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                  />
                                </div>
                              </Col>
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label
                                    htmlFor="dissertationFile"
                                    className="form-label"
                                  >
                                    Upload Reports
                                    <i
                                      id="infoIcon"
                                      className="bi bi-info-circle ms-2"
                                      style={{
                                        cursor: "pointer",
                                        color: "#0d6efd",
                                      }}
                                    ></i>
                                  </Label>
                                  <Tooltip
                                    placement="right"
                                    isOpen={tooltipOpen}
                                    target="infoIcon"
                                    toggle={toggleTooltip}
                                  >
                                    For more than 1 student, upload a merged
                                    document
                                  </Tooltip>
                                  {isEditMode &&
                                  validation.values.dissertation
                                    .dissertationFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.dissertation
                                          .dissertationFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          handleDownloadFile(
                                            validation.values.dissertation
                                              .dissertationFileName || ""
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
                                            "dissertation",
                                            "dissertationFile",
                                            "dissertationFileName",
                                            "dissertationFileKey",
                                            validation.values.dissertation
                                              .dissertationFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : validation.values.dissertation
                                      .dissertationFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.dissertation
                                          .dissertationFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "dissertation",
                                            "dissertationFile",
                                            "dissertationFileName",
                                            "dissertationFileKey",
                                            validation.values.dissertation
                                              .dissertationFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      className={`form-control ${
                                        validation.touched.dissertation
                                          ?.dissertationFile &&
                                        validation.errors.dissertation
                                          ?.dissertationFile
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                      type="file"
                                      id="dissertationFile"
                                      disabled={
                                        !!validation.values.dissertation
                                          .dissertationFile
                                      }
                                      onChange={(event) => {
                                        const file =
                                          event.currentTarget.files?.[0] ||
                                          null;
                                        validation.setFieldValue(
                                          "dissertation.dissertationFile",
                                          file
                                        );
                                        validation.setFieldValue(
                                          "dissertation.dissertationFileName",
                                          file ? file.name : ""
                                        );
                                        validation.setFieldValue(
                                          "dissertation.dissertationFileKey",
                                          undefined
                                        );
                                      }}
                                    />
                                  )}
                                </div>
                              </Col>

                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Report Template</Label>
                                  <div>
                                    <a
                                      href={`${process.env.PUBLIC_URL}/templateFiles/Format_for_Project_dissertation_report.docx`}
                                      download
                                      className="btn btn-primary btn-sm"
                                    >
                                      Template
                                    </a>
                                  </div>
                                </div>
                              </Col>
                            </Row>
                            <Row className="mt-3">
                              <Col className="d-flex justify-content-center">
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
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {/* Fellowship Tab */}
                        {activeTab === 4 && (
                          <Form>
                            <Row>
                              {/* Student Excel Sheet */}
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label
                                    htmlFor="fellowshipStudentExcelSheet"
                                    className="form-label"
                                  >
                                    Student Excel Sheet
                                  </Label>
                                  {isEditMode &&
                                  validation.values.fellowship
                                    .studentExcelSheetFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fellowship
                                          .studentExcelSheetFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          handleDownloadFile(
                                            validation.values.fellowship
                                              .studentExcelSheetFileName || ""
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
                                            "studentExcelSheetFileKey",
                                            validation.values.fellowship
                                              .studentExcelSheetFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : validation.values.fellowship
                                      .studentExcelSheetFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fellowship
                                          .studentExcelSheetFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "fellowship",
                                            "studentExcelSheet",
                                            "studentExcelSheetFileName",
                                            "studentExcelSheetFileKey",
                                            validation.values.fellowship
                                              .studentExcelSheetFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      className={`form-control ${
                                        validation.touched.fellowship
                                          ?.studentExcelSheet &&
                                        validation.errors.fellowship
                                          ?.studentExcelSheet
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                      type="file"
                                      id="fellowshipStudentExcelSheet"
                                      disabled={
                                        !!validation.values.fellowship
                                          .studentExcelSheet
                                      }
                                      onChange={(event) => {
                                        const file =
                                          event.currentTarget.files?.[0] ||
                                          null;
                                        validation.setFieldValue(
                                          "fellowship.studentExcelSheet",
                                          file
                                        );
                                        validation.setFieldValue(
                                          "fellowship.studentExcelSheetFileName",
                                          file ? file.name : ""
                                        );
                                        validation.setFieldValue(
                                          "fellowship.studentExcelSheetFileKey",
                                          undefined
                                        );
                                      }}
                                    />
                                  )}
                                </div>
                              </Col>
                              {/* Fellowship File */}
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label
                                    htmlFor="fellowshipFile"
                                    className="form-label"
                                  >
                                    Fellowship Report
                                  </Label>
                                  {isEditMode &&
                                  validation.values.fellowship
                                    .fellowshipFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fellowship
                                          .fellowshipFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          handleDownloadFile(
                                            validation.values.fellowship
                                              .fellowshipFileName || ""
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
                                            "fellowshipFileKey",
                                            validation.values.fellowship
                                              .fellowshipFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : validation.values.fellowship
                                      .fellowshipFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.fellowship
                                          .fellowshipFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "fellowship",
                                            "fellowshipFile",
                                            "fellowshipFileName",
                                            "fellowshipFileKey",
                                            validation.values.fellowship
                                              .fellowshipFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      className={`form-control ${
                                        validation.touched.fellowship
                                          ?.fellowshipFile &&
                                        validation.errors.fellowship
                                          ?.fellowshipFile
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                      type="file"
                                      id="fellowshipFile"
                                      disabled={
                                        !!validation.values.fellowship
                                          .fellowshipFile
                                      }
                                      onChange={(event) => {
                                        const file =
                                          event.currentTarget.files?.[0] ||
                                          null;
                                        validation.setFieldValue(
                                          "fellowship.fellowshipFile",
                                          file
                                        );
                                        validation.setFieldValue(
                                          "fellowship.fellowshipFileName",
                                          file ? file.name : ""
                                        );
                                        validation.setFieldValue(
                                          "fellowship.fellowshipFileKey",
                                          undefined
                                        );
                                      }}
                                    />
                                  )}
                                </div>
                              </Col>
                            </Row>
                            <Row className="mt-3">
                              <Col className="d-flex justify-content-center">
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
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {/* Bootcamp Tab */}
                        {activeTab === 5 && (
                          <Form>
                            <Row>
                              {/* Student Excel Sheet */}
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label
                                    htmlFor="bootcampStudentExcelSheet"
                                    className="form-label"
                                  >
                                    Student Excel Sheet
                                  </Label>
                                  {isEditMode &&
                                  validation.values.bootcamp
                                    .studentExcelSheetFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.bootcamp
                                          .studentExcelSheetFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          handleDownloadFile(
                                            validation.values.bootcamp
                                              .studentExcelSheetFileName || ""
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
                                            "studentExcelSheetFileKey",
                                            validation.values.bootcamp
                                              .studentExcelSheetFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : validation.values.bootcamp
                                      .studentExcelSheetFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.bootcamp
                                          .studentExcelSheetFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "bootcamp",
                                            "studentExcelSheet",
                                            "studentExcelSheetFileName",
                                            "studentExcelSheetFileKey",
                                            validation.values.bootcamp
                                              .studentExcelSheetFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      className={`form-control ${
                                        validation.touched.bootcamp
                                          ?.studentExcelSheet &&
                                        validation.errors.bootcamp
                                          ?.studentExcelSheet
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                      type="file"
                                      id="bootcampStudentExcelSheet"
                                      disabled={
                                        !!validation.values.bootcamp
                                          .studentExcelSheet
                                      }
                                      onChange={(event) => {
                                        const file =
                                          event.currentTarget.files?.[0] ||
                                          null;
                                        validation.setFieldValue(
                                          "bootcamp.studentExcelSheet",
                                          file
                                        );
                                        validation.setFieldValue(
                                          "bootcamp.studentExcelSheetFileName",
                                          file ? file.name : ""
                                        );
                                        validation.setFieldValue(
                                          "bootcamp.studentExcelSheetFileKey",
                                          undefined
                                        );
                                      }}
                                    />
                                  )}
                                </div>
                              </Col>
                              {/* Bootcamp File */}
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label
                                    htmlFor="bootcampFile"
                                    className="form-label"
                                  >
                                    Bootcamp Report
                                  </Label>
                                  {isEditMode &&
                                  validation.values.bootcamp
                                    .bootcampFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.bootcamp
                                          .bootcampFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-primary"
                                        onClick={() =>
                                          handleDownloadFile(
                                            validation.values.bootcamp
                                              .bootcampFileName || ""
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
                                            "bootcampFileKey",
                                            validation.values.bootcamp
                                              .bootcampFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : validation.values.bootcamp
                                      .bootcampFileName ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span>
                                        {validation.values.bootcamp
                                          .bootcampFileName ||
                                          "No file selected"}
                                      </span>
                                      <Button
                                        color="link"
                                        className="text-danger"
                                        onClick={() => {
                                          handleDeleteFileWithKey(
                                            "bootcamp",
                                            "bootcampFile",
                                            "bootcampFileName",
                                            "bootcampFileKey",
                                            validation.values.bootcamp
                                              .bootcampFileKey
                                          );
                                        }}
                                        title="Delete File"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <Input
                                      className={`form-control ${
                                        validation.touched.bootcamp
                                          ?.bootcampFile &&
                                        validation.errors.bootcamp?.bootcampFile
                                          ? "is-invalid"
                                          : ""
                                      }`}
                                      type="file"
                                      id="bootcampFile"
                                      disabled={
                                        !!validation.values.bootcamp
                                          .bootcampFile
                                      }
                                      onChange={(event) => {
                                        const file =
                                          event.currentTarget.files?.[0] ||
                                          null;
                                        validation.setFieldValue(
                                          "bootcamp.bootcampFile",
                                          file
                                        );
                                        validation.setFieldValue(
                                          "bootcamp.bootcampFileName",
                                          file ? file.name : ""
                                        );
                                        validation.setFieldValue(
                                          "bootcamp.bootcampFileKey",
                                          undefined
                                        );
                                      }}
                                    />
                                  )}
                                </div>
                              </Col>
                            </Row>
                            <Row className="mt-3">
                              <Col className="d-flex justify-content-center">
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
            {/* <Table
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
                  <th>Course Type</th>
                  <th>Total number of Interning student(Internship)</th>
                  <th>Organisation name(Internship)</th>
                  <th>Location of the organisation(Internship)</th>
                  <th>Certificates File(Internship)</th>

                  <th>Total number of participating student(Field Visit)</th>
                  <th>Duration of Field Visit start date(Field Visit)</th>
                  <th>Duration of Field Visit end date(Field Visit)</th>
                  <th>Location of Organisation(Field Visit)</th>
                  <th>Field Project File(Field Visit)</th>
                  <th>Communication Letter(Field Visit)</th>

                  <th>
                    Total number of participating student(Projects/Dissertation)
                  </th>
                  <th>Duration of Project start date(Projects/Dissertation)</th>
                  <th>Duration of Project end date(Projects/Dissertation)</th>
                  <th>
                    Dissertation Title of the Project(Projects/Dissertation)
                  </th>
                  <th>Dissertation File(Projects/Dissertation)</th>

                  <th>Student Excel Sheet(Fellowship)</th>
                  <th>Fellowship Report(Fellowship)</th>

                  <th>Student Excel Sheet(Bootcamp)</th>
                  <th>Bootcamp Report(Bootcamp)</th>
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
                      <td>{el.courseType}</td>
                      <td>{el.internship?.totalInterningStudents || "N/A"}</td>
                      <td>{el.internship?.internOrgName || "N/A"}</td>
                      <td>{el.internship?.internOrgLocation || "N/A"}</td>
                      <td>{el.internship?.filePath?.certificates || "N/A"}</td>

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
                        {el.dissertation
                          ?.totalParticipatingStudentsdissertation || "N/A"}
                      </td>
                      <td>
                        {el.dissertation?.dissertationsStartDate || "N/A"}
                      </td>
                      <td>{el.dissertation?.dissertationsEndDate || "N/A"}</td>
                      <td>
                        {el.dissertation?.dissertationTitleOfTheProject ||
                          "N/A"}
                      </td>
                      <td>
                        {el.dissertation?.filePath?.dissertation || "N/A"}
                      </td>

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
            </Table> */}

            {/* <Table
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
                  <th>Course Type</th>
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
                      <td>{el.courseType}</td>
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
            </Table> */}
            <Table
              striped
              bordered
              hover
              responsive
              id="id"
              className="align-middle text-center"
            >
              <thead className="table-dark">
                <tr>
                  {/* 11 VISIBLE COLUMNS */}
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>Semester Type</th>
                  <th>Semester No</th>
                  <th>School</th>
                  <th>Department</th>
                  <th>Program Type</th>
                  <th>Degree</th>
                  <th>Program Title</th>
                  <th>Course Title</th>
                  <th>Course Type</th>

                  {/* 20 HIDDEN COLUMNS */}
                  <th className="export-hidden">Total Interning Students</th>
                  <th className="export-hidden">Intern Org Name</th>
                  <th className="export-hidden">Intern Org Location</th>
                  <th className="export-hidden">Intern Certificates File</th>

                  <th className="export-hidden">
                    Total Field Project Students
                  </th>
                  <th className="export-hidden">Field Start Date</th>
                  <th className="export-hidden">Field End Date</th>
                  <th className="export-hidden">Field Org Location</th>
                  <th className="export-hidden">Field Project File</th>
                  <th className="export-hidden">Communication Letter</th>

                  <th className="export-hidden">Dissertation Students</th>
                  <th className="export-hidden">Dissertation Start</th>
                  <th className="export-hidden">Dissertation End</th>
                  <th className="export-hidden">Dissertation Title</th>
                  <th className="export-hidden">Dissertation File</th>

                  <th className="export-hidden">Fellowship Excel</th>
                  <th className="export-hidden">Fellowship Report</th>

                  <th className="export-hidden">Bootcamp Excel</th>
                  <th className="export-hidden">Bootcamp Report</th>

                  {/* ACTIONS COLUMN (VISIBLE) */}
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {experientialLearningData.length > 0 ? (
                  experientialLearningData.map((el, index) => (
                    <tr key={el.id}>
                      {/* 11 visible columns */}
                      <td>{index + 1}</td>
                      <td>{el.academicYear ?? "N/A"}</td>
                      <td>{el.semType ?? "N/A"}</td>
                      <td>{el.semNumber ?? "N/A"}</td>
                      <td>{el.streamName ?? "N/A"}</td>
                      <td>{el.departmentName ?? "N/A"}</td>
                      <td>{el.programTypeName ?? "N/A"}</td>
                      <td>{el.programName ?? "N/A"}</td>
                      <td>{el.programTitle ?? "N/A"}</td>
                      <td>{el.courseTitle ?? "N/A"}</td>
                      <td>{el.courseType ?? "N/A"}</td>

                      {/* 20 HIDDEN EXPORT-ONLY columns */}
                      <td className="export-hidden">
                        {el.internship?.totalInterningStudents ?? "N/A"}
                      </td>
                      <td className="export-hidden">
                        {el.internship?.internOrgName ?? "N/A"}
                      </td>
                      <td className="export-hidden">
                        {el.internship?.internOrgLocation ?? "N/A"}
                      </td>
                      <td className="export-hidden">
                        {el.internship?.filePath?.certificates ?? "N/A"}
                      </td>

                      <td className="export-hidden">
                        {el.fieldProject?.totalFieldProjectStudents ?? "N/A"}
                      </td>
                      <td className="export-hidden">
                        {el.fieldProject?.fieldProjectStratDate ?? "N/A"}
                      </td>
                      <td className="export-hidden">
                        {el.fieldProject?.fieldProjectEndDate ?? "N/A"}
                      </td>
                      <td className="export-hidden">
                        {el.fieldProject?.fielsProjectOrgLocation ?? "N/A"}
                      </td>
                      <td className="export-hidden">
                        {el.fieldProject?.filePath?.FieldProject ?? "N/A"}
                      </td>
                      <td className="export-hidden">
                        {el.fieldProject?.filePath?.CommunicationLetter ??
                          "N/A"}
                      </td>

                      <td className="export-hidden">
                        {el.dissertation
                          ?.totalParticipatingStudentsdissertation ?? "N/A"}
                      </td>
                      <td className="export-hidden">
                        {el.dissertation?.dissertationsStartDate ?? "N/A"}
                      </td>
                      <td className="export-hidden">
                        {el.dissertation?.dissertationsEndDate ?? "N/A"}
                      </td>
                      <td className="export-hidden">
                        {el.dissertation?.dissertationTitleOfTheProject ??
                          "N/A"}
                      </td>
                      <td className="export-hidden">
                        {el.dissertation?.filePath?.dissertation ?? "N/A"}
                      </td>

                      <td className="export-hidden">
                        {el.fellowship?.filePath?.studentExcelSheetFileName ??
                          "N/A"}
                      </td>
                      <td className="export-hidden">
                        {el.fellowship?.filePath?.fellowshipFileName ?? "N/A"}
                      </td>

                      <td className="export-hidden">
                        {el.bootcamp?.filePath?.studentExcelSheetFileName ??
                          "N/A"}
                      </td>
                      <td className="export-hidden">
                        {el.bootcamp?.filePath?.Bootcamp ?? "N/A"}
                      </td>

                      {/* ACTIONS column */}
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleEdit(el.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
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
                    <td colSpan={32}>No EL data available.</td>
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

export default Experiential_Learning;
