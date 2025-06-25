import Breadcrumb from "Components/Common/Breadcrumb";
import { useFormik } from "formik";
import React, { useRef, useState } from "react";
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
import { Link } from "react-router-dom";
import classNames from "classnames";
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
  // State variable for managing filters
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
  const [filteredData, setFilteredData] = useState(experientialLearningData);
  const fellowshipFileRef = useRef<HTMLInputElement>(null);
  const studentExcelRef = useRef<HTMLInputElement>(null);

  const bootcampFileRef = useRef<HTMLInputElement>(null);
  const bootcampStudentExcelRef = useRef<HTMLInputElement>(null);

  const fieldProjectFileRef = useRef<HTMLInputElement>(null);
  const communicationLetterRef = useRef<HTMLInputElement>(null);
  const fieldStudentExcelRef = useRef<HTMLInputElement>(null);

  // Handle global search
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

  // Handle column-specific filters
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    column: string
  ) => {
    const value = e.target.value.toLowerCase();
    const updatedFilters = { ...filters, [column]: value };
    setFilters(updatedFilters);

    const filtered = experientialLearningData.filter((row) =>
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

  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Toggle the modal for listing BOS
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch BOS data from the backend
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

  // Open the modal and fetch data
  const handleListBosClick = () => {
    toggleModal();
    fetchExperientialLearningData();
  };

  const toggleWizard = () => {
    setShowWizard(!showWizard);
  };

  const mapValueToLabel = (
    value: string | number | null,
    options: { value: string | number; label: string }[]
  ): { value: string | number; label: string } | null => {
    if (!value) return null;
    const matchedOption = options.find((option) => option.value === value);
    return matchedOption ? matchedOption : { value, label: String(value) };
  };
  // Handle edit action
  // Fetch the data for the selected BOS ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/experientialLearning?experientialLearningID=${id}`,
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
        revisionPercentage: response.percentage || "",
        conductedDate: response.yearOfIntroduction
          ? response.yearOfIntroduction
          : "",
        otherDepartment: "",
        file: response.documents?.mom || null,
        // Add these lines:
        programName: response.programName || "",
        courseTitile: response.courseTitile || "",
        pedagogy: response.pedagogy || { pedagogyFile: null },
        internship: response.internship || {
          totalJoiningStudentsOfIntern: "",
          orgNameOfIntern: "",
          locationOfIntern: "",
        },
        fieldProject: response.fieldProject || {
          totalParticipatingStudents: "",
          fieldProjectStartDate: null,
          fieldProjectEndDate: null,
          locationOfOrganisation: "",
          fieldProjectFile: null,
          communicationLetter: null,
          studentExcelSheet: null,
        },
        dissertation: response.dissertation || {
          totalParticipatingStudentsdissertation: "",
          dissertationStartDate: null,
          dissertationEndDate: null,
        },
        fellowship: response.fellowship || {
          studentExcelSheet: null,
          fellowshipFile: null,
        },
        bootcamp: response.bootcamp || {
          studentExcelSheet: null,
          bootcampFile: null,
        },
      };

      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      // Disable the file upload button if a file exists
      setIsFileUploadDisabled(!!response.documents?.mom);
      toggleModal();
    } catch (error) {
      console.error("Error fetching BOS data by ID:", error);
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the BOS data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(`/bos/deleteBos?bosId=${id}`, "");
        toast.success(
          response.message || "Curriculum BOS removed successfully!"
        );
        fetchExperientialLearningData();
      } catch (error) {
        toast.error("Failed to remove Curriculum BOS. Please try again.");
        console.error("Error deleting BOS:", error);
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
        // Skip validation if the file upload is disabled (file exists)
        if (isFileUploadDisabled) {
          return true;
        }
        // Perform validation if the file upload is enabled (file doesn't exist)
        if (!value) {
          return this.createError({ message: "Please upload a file" });
        }
        // Check file size (2MB limit)
        if (value instanceof File && value.size > 2 * 1024 * 1024) {
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
    fieldProjectStartDate: Yup.date()
      .required("Enter field project start date")
      .nullable(),
    fieldProjectEndDate: Yup.date()
      .required("Enter field project end date")
      .nullable(),
    locationOfOrganisation: Yup.string().required(
      "Enter location of the organisation"
    ),
    fieldProjectFile: Yup.mixed().test(
      "fileValidation",
      "Please upload a valid file",
      function (value) {
        if (!value) {
          return this.createError({ message: "Please upload a file" });
        }
        if (value instanceof File && value.size > 2 * 1024 * 1024) {
          return this.createError({ message: "File size is too large" });
        }
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
        if (value instanceof File && !allowedTypes.includes(value.type)) {
          return this.createError({ message: "Unsupported file format" });
        }
        return true;
      }
    ),
    communicationLetter: Yup.mixed().test(
      "fileValidation",
      "Please upload a valid file",
      function (value) {
        if (!value) {
          return this.createError({ message: "Please upload a file" });
        }
        if (value instanceof File && value.size > 2 * 1024 * 1024) {
          return this.createError({ message: "File size is too large" });
        }
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
        if (value instanceof File && !allowedTypes.includes(value.type)) {
          return this.createError({ message: "Unsupported file format" });
        }
        return true;
      }
    ),
    studentExcelSheet: Yup.mixed().test(
      "fileValidation",
      "Please upload a valid file",
      function (value) {
        if (!value) {
          return this.createError({ message: "Please upload a file" });
        }
        if (value instanceof File && value.size > 2 * 1024 * 1024) {
          return this.createError({ message: "File size is too large" });
        }
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
        if (value instanceof File && !allowedTypes.includes(value.type)) {
          return this.createError({ message: "Unsupported file format" });
        }
        return true;
      }
    ),
  });

  const dissertationSchema = Yup.object({
    totalParticipatingStudentsdissertation: Yup.string().required(
      "Enter total number of participating students"
    ),
    dissertationStartDate: Yup.date()
      .required("Enter dissertation start date")
      .nullable(),
    dissertationEndDate: Yup.date()
      .required("Enter dissertation end date")
      .nullable(),
  });

  const fellowshipSchema = Yup.object({
    studentExcelSheet: Yup.mixed().test(
      "fileValidation",
      "Please upload a valid file",
      function (value) {
        if (!value) {
          return this.createError({ message: "Please upload a file" });
        }
        if (value instanceof File && value.size > 2 * 1024 * 1024) {
          return this.createError({ message: "File size is too large" });
        }
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
        if (value instanceof File && !allowedTypes.includes(value.type)) {
          return this.createError({ message: "Unsupported file format" });
        }
        return true;
      }
    ),
    fellowshipFile: Yup.mixed().test(
      "fileValidation",
      "Please upload a valid file",
      function (value) {
        if (!value) {
          return this.createError({ message: "Please upload a file" });
        }
        if (value instanceof File && value.size > 2 * 1024 * 1024) {
          return this.createError({ message: "File size is too large" });
        }
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
        if (value instanceof File && !allowedTypes.includes(value.type)) {
          return this.createError({ message: "Unsupported file format" });
        }
        return true;
      }
    ),
  });

  const bootcampSchema = Yup.object({
    studentExcelSheet: Yup.mixed().test(
      "fileValidation",
      "Please upload a valid file",
      function (value) {
        if (!value) {
          return this.createError({ message: "Please upload a file" });
        }
        if (value instanceof File && value.size > 2 * 1024 * 1024) {
          return this.createError({ message: "File size is too large" });
        }
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
        if (value instanceof File && !allowedTypes.includes(value.type)) {
          return this.createError({ message: "Unsupported file format" });
        }
        return true;
      }
    ),
    bootcampFile: Yup.mixed().test(
      "fileValidation",
      "Please upload a valid file",
      function (value) {
        if (!value) {
          return this.createError({ message: "Please upload a file" });
        }
        if (value instanceof File && value.size > 2 * 1024 * 1024) {
          return this.createError({ message: "File size is too large" });
        }
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
        if (value instanceof File && !allowedTypes.includes(value.type)) {
          return this.createError({ message: "Unsupported file format" });
        }
        return true;
      }
    ),
  });

  const mainSchema = Yup.object({
    academicYear: Yup.object()
      .nullable()
      .required("Please select academic year"),
    semesterType: Yup.object<{ value: string; label: string }>()
      .nullable()
      .required("Please select semester type"),
    semesterNo: Yup.object().nullable().required("Please select semester"),
    stream: Yup.object().nullable().required("Please select stream"),
    degree: Yup.object().nullable().required("Please select degree"),
    department: Yup.object<{ value: string; label: string }>()
      .nullable()
      .required("Please select department"),
    programType: Yup.object().nullable().required("Please select program type"),
    courseTitile: Yup.string().required("Please enter Course Title"),
    programName: Yup.string().required("Please enter Program Name"),
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

    const currentTabData = currentTab ? validation.values[currentTab] : {};
    const newTabData = newTab ? validation.values[newTab] : {};

    const isCurrentTabFilled = Object.values(currentTabData || {}).some(
      (val) => !!val
    );
    const isNewTabFilled = Object.values(newTabData || {}).some((val) => !!val);

    if (isCurrentTabFilled && newTab !== currentTab) {
      toast.warning("You already filled one tab. Clear it before switching.");
      return;
    }

    if (!isCurrentTabFilled && isNewTabFilled) {
      toast.warning("At least one tab should be filled.");
      return;
    }

    // Allow tab switch
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

  const combinedSchema = getCombinedSchema(activeTab1);
  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      semesterType: null as { value: string; label: string } | null,
      semesterNo: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      degree: null as { value: string; label: string } | null,
      programType: null as { value: string; label: string } | null,
      programName: "",
      courseTitile: "",
      file: null,
      pedagogy: {
        pedagogyFile: null,
      },
      internship: {
        totalJoiningStudentsOfIntern: "",
        orgNameOfIntern: "",
        locationOfIntern: "",
      },
      fieldProject: {
        totalParticipatingStudents: "",
        fieldProjectStartDate: null,
        fieldProjectEndDate: null,
        locationOfOrganisation: "",
        fieldProjectFile: null,
        communicationLetter: null,
        studentExcelSheet: null,
      },
      dissertation: {
        totalParticipatingStudentsdissertation: "",
        dissertationStartDate: null,
        dissertationEndDate: null,
      },
      fellowship: {
        studentExcelSheet: null,
        fellowshipFile: null,
      },
      bootcamp: {
        studentExcelSheet: null,
        bootcampFile: null,
      },
    },
    validationSchema: combinedSchema,
    onSubmit: async (values, { resetForm }) => {
      console.log("Submitting form...", values);
      if (!isAnyTabFilled(values)) {
        toast.warning("You must fill at least one experiential tab.");
        return;
      }
      const formData = new FormData();
      // formData.append("pedagogyFile", values.pedagogy.pedagogyFile || "");
      // formData.append(
      //   "internship",
      //   JSON.stringify({
      //     totalJoiningStudentsOfIntern:
      //       values.internship.totalJoiningStudentsOfIntern,
      //     orgNameOfIntern: values.internship.orgNameOfIntern,
      //     locationOfIntern: values.internship.locationOfIntern,
      //   }) || ""
      // );
      // formData.append(
      //   "fieldProject",
      //   JSON.stringify({
      //     totalParticipatingStudents:
      //       values.fieldProject.totalParticipatingStudents,
      //     fieldProjectStartDate: values.fieldProject.fieldProjectStartDate
      //       ? moment(values.fieldProject.fieldProjectStartDate).format(
      //           "YYYY-MM-DD"
      //         )
      //       : "",
      //     fieldProjectEndDate: values.fieldProject.fieldProjectEndDate
      //       ? moment(values.fieldProject.fieldProjectEndDate).format(
      //           "YYYY-MM-DD"
      //         )
      //       : "",
      //     locationOfOrganisation: values.fieldProject.locationOfOrganisation,
      //     fieldProjectFile: values.fieldProject.fieldProjectFile || "",
      //     communicationLetter: values.fieldProject.communicationLetter || "",
      //     studentExcelSheet: values.fieldProject.studentExcelSheet || "",
      //   }) || ""
      // );
      // formData.append(
      //   "dissertation",
      //   JSON.stringify({
      //     totalParticipatingStudentsdissertation:
      //       values.dissertation.totalParticipatingStudentsdissertation,
      //     dissertationStartDate: values.dissertation.dissertationStartDate
      //       ? moment(values.dissertation.dissertationStartDate).format(
      //           "YYYY-MM-DD"
      //         )
      //       : "",
      //     dissertationEndDate: values.dissertation.dissertationEndDate
      //       ? moment(values.dissertation.dissertationEndDate).format(
      //           "YYYY-MM-DD"
      //         )
      //       : "",
      //   }) || ""
      // );
      // formData.append(
      //   "fellowship",
      //   JSON.stringify({
      //     studentExcelSheet: values.fellowship.studentExcelSheet || "",
      //     fellowshipFile: values.fellowship.fellowshipFile || "",
      //   })
      // );
      // formData.append(
      //   "bootcamp",
      //   JSON.stringify({
      //     studentExcelSheet: values.bootcamp.studentExcelSheet || "",
      //     bootcampFile: values.bootcamp.bootcampFile || "",
      //   }) || ""
      // );
      // Construct dtoPayload object from form values
      const dtoPayload = {
        academicYear: values.academicYear?.value || "",
        semesterType: values.semesterType?.value || "",
        semesterNo: values.semesterNo?.value || "",
        streamId: values.stream?.value || "",
        departmentId: values.department?.value || "",
        programTypeId: values.programType?.value || "",
        programId: values.degree?.value || "",
        programName: values.programName,
        courseTitile: values.courseTitile,
        pedagogy: values.pedagogy || null,
        internship: {
          totalInternStudents:
            values.internship.totalJoiningStudentsOfIntern || "",
          internOrgName: values.internship.orgNameOfIntern || "",
          internOrgLocation: values.internship.locationOfIntern || "",
        },
        fieldProject: {
          totalFieldProjectStudents:
            values.fieldProject.totalParticipatingStudents || "",
          fieldProjectStratDate: values.fieldProject.fieldProjectStartDate
            ? moment(values.fieldProject.fieldProjectStartDate).format(
                "YYYY-MM-DD"
              )
            : null,
          fieldProjectEndDate: values.fieldProject.fieldProjectEndDate
            ? moment(values.fieldProject.fieldProjectEndDate).format(
                "YYYY-MM-DD"
              )
            : null,
          fielsProjectOrgLocation:
            values.fieldProject.locationOfOrganisation || "",
        },
        dissertation: {
          totalDissertationsStudents:
            values.dissertation.totalParticipatingStudentsdissertation || "",
          dissertationsStartDate: values.dissertation.dissertationStartDate
            ? moment(values.dissertation.dissertationStartDate).format(
                "YYYY-MM-DD"
              )
            : null,
          dissertationsEndDate: values.dissertation.dissertationEndDate
            ? moment(values.dissertation.dissertationEndDate).format(
                "YYYY-MM-DD"
              )
            : null,
        },
        fellowship: values.fellowship || null,
        bootcamp: values.bootcamp || null,
      };

      formData.append(
        "experientialLearningRequestDto",
        new Blob([JSON.stringify(dtoPayload)], { type: "application/json" })
      );
      formData.append("pedagogy", values.pedagogy?.pedagogyFile || new Blob());
      formData.append(
        "fP_fieldProject",
        values.fieldProject?.fieldProjectFile || new Blob()
      );
      formData.append(
        "fP_communicationLetter",
        values.fieldProject?.communicationLetter || new Blob()
      );
      formData.append(
        "fP_studentExcelSheet",
        values.fieldProject?.studentExcelSheet || new Blob()
      );
      formData.append(
        "f_fellowship",
        values.fellowship?.fellowshipFile || new Blob()
      );
      formData.append(
        "f_studentExcelSheet",
        values.fellowship?.studentExcelSheet || new Blob()
      );
      formData.append(
        "b_bootcamp",
        values.bootcamp?.bootcampFile || new Blob()
      );
      formData.append(
        "b_studentExcelSheet",
        values.bootcamp?.studentExcelSheet || new Blob()
      );

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
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // handleListExperiential LearningClick(); // Refresh the list
      } catch (error) {
        toast.error("Failed to save Experiential Learning. Please try again.");
        console.error("Error creating/updating Experiential Learning:", error);
      }
    },
  });

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
                      semesterTypeValue={validation.values.semesterType}
                      semesterNoValue={validation.values.semesterNo}
                      onSemesterTypeChange={(selectedOption) =>
                        validation.setFieldValue("semesterType", selectedOption)
                      }
                      onSemesterNoChange={(selectedOption) =>
                        validation.setFieldValue("semesterNo", selectedOption)
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
                          ? validation.errors.semesterType
                          : null
                      }
                      semesterNoError={
                        validation.touched.semesterNo
                          ? Array.isArray(validation.errors.semesterNo)
                            ? validation.errors.semesterNo[0]
                            : validation.errors.semesterNo
                          : null
                      }
                      semesterTypeTouched={!!validation.touched.semesterType}
                      semesterNoTouched={!!validation.touched.semesterNo}
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
                        name="programName"
                        value={validation.values.programName}
                        onChange={validation.handleChange}
                        placeholder="Enter Program Name"
                        className={
                          validation.touched.programName &&
                          validation.errors.programName
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.programName &&
                        validation.errors.programName && (
                          <div className="text-danger">
                            {validation.errors.programName}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Course Title</Label>
                      <Input
                        type="text"
                        name="courseTitile"
                        value={validation.values.courseTitile}
                        onChange={validation.handleChange}
                        placeholder="Enter Program Name"
                        className={
                          validation.touched.courseTitile &&
                          validation.errors.courseTitile
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.courseTitile &&
                        validation.errors.courseTitile && (
                          <div className="text-danger">
                            {validation.errors.courseTitile}
                          </div>
                        )}
                    </div>
                  </Col>
                  <div className="mb-3 mt-3 d-grid">
                    <Button
                      className="btn btn-tabs toggle-wizard-button"
                      onClick={toggleWizard}
                    >
                      Experiential Learning
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
                            className={`step-button ${
                              activeTab === tab ? "active" : ""
                            }`}
                            onClick={() => handleTabChange(tab)}
                          >
                            {tab}.
                            {tab === 1
                              ? "Pedagogy"
                              : tab === 2
                              ? "Internship"
                              : tab === 3
                              ? "Field Project"
                              : tab === 4
                              ? "Projects/Dissertation"
                              : tab === 5
                              ? "Fellowship"
                              : "Bootcamp"}
                          </Button>
                        ))}
                      </div>
                      <div className="tab-content">
                        {activeTab === 1 && (
                          <Form>
                            <Row>
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
                                      validation.touched.pedagogy
                                        ?.pedagogyFile &&
                                      validation.errors.pedagogy?.pedagogyFile
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="pedagogyFile"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "pedagogy.pedagogyFile",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />
                                  {validation.touched.pedagogy?.pedagogyFile &&
                                    validation.errors.pedagogy
                                      ?.pedagogyFile && (
                                      <div className="text-danger">
                                        {
                                          validation.errors.pedagogy
                                            .pedagogyFile
                                        }
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
                                  onClick={() =>
                                    validation.setFieldValue("pedagogy", {
                                      pedagogyFile: null,
                                    })
                                  }
                                  disabled={isFileUploadDisabled}
                                >
                                  Clear
                                </button>
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {activeTab === 2 && (
                          <Form>
                            <Row>
                              <Col lg="4">
                                <Label>Total number of joining student</Label>
                                <Input
                                  type="text"
                                  placeholder="Enter Total number of joining student"
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
                                  <Label>
                                    Duration of field project start date
                                  </Label>
                                  <Input
                                    type="date"
                                    placeholder="Enter Duration of field project start date"
                                    value={
                                      validation.values.fieldProject
                                        .fieldProjectStartDate
                                        ? moment(
                                            validation.values.fieldProject
                                              .fieldProjectStartDate,
                                            "DD/MM/YYYY"
                                          ).format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const formattedDate = moment(
                                        e.target.value,
                                        "YYYY-MM-DD"
                                      ).format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
                                      validation.setFieldValue(
                                        "fieldProject.fieldProjectStartDate",
                                        formattedDate
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
                                  <Label>
                                    Duration of field project end date
                                  </Label>
                                  <Input
                                    type="date"
                                    placeholder="Enter Duration of field project end date"
                                    value={
                                      validation.values.fieldProject
                                        .fieldProjectEndDate
                                        ? moment(
                                            validation.values.fieldProject
                                              .fieldProjectEndDate,
                                            "DD/MM/YYYY"
                                          ).format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const formattedDate = moment(
                                        e.target.value,
                                        "YYYY-MM-DD"
                                      ).format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
                                      validation.setFieldValue(
                                        "fieldProject.fieldProjectEndDate",
                                        formattedDate
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
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label
                                    htmlFor="formFile"
                                    className="form-label"
                                  >
                                    Field project
                                  </Label>
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
                                    innerRef={fieldProjectFileRef}
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "fieldProject.fieldProjectFile",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />
                                  {validation.touched.fieldProject
                                    ?.fieldProjectFile &&
                                    validation.errors.fieldProject
                                      ?.fieldProjectFile && (
                                      <div className="text-danger">
                                        {
                                          validation.errors.fieldProject
                                            .fieldProjectFile
                                        }
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
                                    Communication letter
                                  </Label>
                                  <Input
                                    type="file"
                                    className={`form-control ${
                                      validation.touched.fieldProject
                                        ?.communicationLetter &&
                                      validation.errors.fieldProject
                                        ?.communicationLetter
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    id="communicationLetter"
                                    innerRef={communicationLetterRef}
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "fieldProject.communicationLetter",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />
                                </div>
                              </Col>
                            </Row>
                            <Row>
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label
                                    htmlFor="formFile"
                                    className="form-label"
                                  >
                                    Student xlame Excel sheet
                                  </Label>
                                  <Input
                                    type="file"
                                    className={`form-control ${
                                      validation.touched.fieldProject
                                        ?.studentExcelSheet &&
                                      validation.errors.fieldProject
                                        ?.studentExcelSheet
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    id="studentExcelSheet"
                                    innerRef={fieldStudentExcelRef}
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "fieldProject.studentExcelSheet",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />
                                </div>
                              </Col>
                            </Row>
                            <Row className="mt-3">
                              <Col className="d-flex justify-content-center">
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() => {
                                    validation.setFieldValue("fieldProject", {
                                      totalParticipatingStudents: "",
                                      fieldProjectStartDate: "",
                                      fieldProjectEndDate: "",
                                      locationOfOrganisation: "",
                                      fieldProjectFile: null,
                                      communicationLetter: null,
                                      studentExcelSheet: null,
                                    });

                                    // Clear input file values
                                    if (fieldProjectFileRef.current) {
                                      fieldProjectFileRef.current.value = "";
                                    }
                                    if (communicationLetterRef.current) {
                                      communicationLetterRef.current.value = "";
                                    }
                                    if (fieldStudentExcelRef.current) {
                                      fieldStudentExcelRef.current.value = "";
                                    }
                                  }}
                                >
                                  Clear
                                </button>
                              </Col>
                            </Row>
                          </Form>
                        )}
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
                                  <Label>
                                    Duration of field project start date
                                  </Label>
                                  <Input
                                    type="date"
                                    placeholder="Enter Duration of field project start date"
                                    value={
                                      validation.values.dissertation
                                        .dissertationStartDate
                                        ? moment(
                                            validation.values.dissertation
                                              .dissertationStartDate,
                                            "DD/MM/YYYY"
                                          ).format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const formattedDate = moment(
                                        e.target.value,
                                        "YYYY-MM-DD"
                                      ).format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
                                      validation.setFieldValue(
                                        "dissertation.dissertationStartDate",
                                        formattedDate
                                      );
                                    }}
                                    className={`form-control ${
                                      validation.touched.dissertation
                                        ?.dissertationStartDate &&
                                      validation.errors.dissertation
                                        ?.dissertationStartDate
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                  />
                                </div>
                              </Col>
                              <Col lg="4">
                                <div className="mb-3">
                                  <Label>
                                    Duration of field project end date
                                  </Label>
                                  <Input
                                    type="date"
                                    placeholder="Enter Duration of field project end date"
                                    value={
                                      validation.values.dissertation
                                        .dissertationEndDate
                                        ? moment(
                                            validation.values.dissertation
                                              .dissertationEndDate,
                                            "DD/MM/YYYY"
                                          ).format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const formattedDate = moment(
                                        e.target.value,
                                        "YYYY-MM-DD"
                                      ).format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
                                      validation.setFieldValue(
                                        "dissertation.dissertationEndDate",
                                        formattedDate
                                      );
                                    }}
                                    className={`form-control ${
                                      validation.touched.dissertation
                                        ?.dissertationEndDate &&
                                      validation.errors.dissertation
                                        ?.dissertationEndDate
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
                        {activeTab === 5 && (
                          <Form>
                            <Row>
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label
                                    htmlFor="formFile"
                                    className="form-label"
                                  >
                                    Student Excel sheet
                                  </Label>
                                  <Input
                                    type="file"
                                    innerRef={studentExcelRef}
                                    className={`form-control ${
                                      validation.touched.fellowship
                                        ?.studentExcelSheet &&
                                      validation.errors.fellowship
                                        ?.studentExcelSheet
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    id="studentExcelSheet"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "fellowship.studentExcelSheet",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />
                                  {validation.touched.fellowship
                                    ?.studentExcelSheet &&
                                    validation.errors.fellowship
                                      ?.studentExcelSheet && (
                                      <div className="text-danger">
                                        {
                                          validation.errors.fellowship
                                            .studentExcelSheet
                                        }
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
                                    Fellowship
                                  </Label>
                                  <Input
                                    type="file"
                                    className={`form-control ${
                                      validation.touched.fellowship
                                        ?.fellowshipFile &&
                                      validation.errors.fellowship
                                        ?.fellowshipFile
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    innerRef={fellowshipFileRef}
                                    id="fellowshipFile"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "fellowship.fellowshipFile",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />
                                  {validation.touched.fellowship
                                    ?.fellowshipFile &&
                                    validation.errors.fellowship
                                      ?.fellowshipFile && (
                                      <div className="text-danger">
                                        {
                                          validation.errors.fellowship
                                            .fellowshipFile
                                        }
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
                                  onClick={() => {
                                    validation.setFieldValue("fellowship", {
                                      studentExcelSheet: null,
                                      fellowshipFile: null,
                                    });

                                    // Clear the actual file inputs
                                    if (fellowshipFileRef.current) {
                                      fellowshipFileRef.current.value = "";
                                    }
                                    if (studentExcelRef.current) {
                                      studentExcelRef.current.value = "";
                                    }
                                  }}
                                >
                                  Clear
                                </button>
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {activeTab === 6 && (
                          <Form>
                            <Row>
                              <Col sm={4}>
                                <div className="mb-3">
                                  <Label
                                    htmlFor="formFile"
                                    className="form-label"
                                  >
                                    Student Excel sheet
                                  </Label>
                                  <Input
                                    type="file"
                                    innerRef={bootcampStudentExcelRef}
                                    className={`form-control ${
                                      validation.touched.bootcamp
                                        ?.studentExcelSheet &&
                                      validation.errors.bootcamp
                                        ?.studentExcelSheet
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    id="studentExcelSheet"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "bootcamp.studentExcelSheet",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />

                                  {validation.touched.bootcamp
                                    ?.studentExcelSheet &&
                                    validation.errors.bootcamp
                                      ?.studentExcelSheet && (
                                      <div className="text-danger">
                                        {
                                          validation.errors.bootcamp
                                            .studentExcelSheet
                                        }
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
                                    Bootcamp
                                  </Label>
                                  <Input
                                    type="file"
                                    innerRef={bootcampFileRef}
                                    className={`form-control ${
                                      validation.touched.bootcamp
                                        ?.bootcampFile &&
                                      validation.errors.bootcamp?.bootcampFile
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    id="bootcampFile"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "bootcamp.bootcampFile",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />
                                  {validation.touched.bootcamp?.bootcampFile &&
                                    validation.errors.bootcamp
                                      ?.bootcampFile && (
                                      <div className="text-danger">
                                        {
                                          validation.errors.bootcamp
                                            .bootcampFile
                                        }
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
                                  onClick={() => {
                                    validation.setFieldValue("bootcamp", {
                                      studentExcelSheet: null,
                                      bootcampFile: null,
                                    });

                                    // Clear actual file input values
                                    if (bootcampStudentExcelRef.current) {
                                      bootcampStudentExcelRef.current.value =
                                        "";
                                    }
                                    if (bootcampFileRef.current) {
                                      bootcampFileRef.current.value = "";
                                    }
                                  }}
                                >
                                  Clear
                                </button>
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

            {/* Table with Pagination */}
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
                    Year of Introduction
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.yearOfIntroduction}
                      onChange={(e) =>
                        handleFilterChange(e, "yearOfIntroduction")
                      }
                    />
                  </th>
                  <th>
                    Percentage
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
                  currentRows.map((bos, index) => (
                    <tr key={bos.id}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{bos.academicYear}</td>
                      <td>{bos.semType}</td>
                      <td>{bos.semesterNo}</td>
                      <td>{bos.streamName}</td>
                      <td>{bos.departmentName}</td>
                      <td>{bos.programTypeName}</td>
                      <td>{bos.programName}</td>
                      <td>{bos.yearOfIntroduction}</td>
                      <td>{bos.percentage}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(bos.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(bos.id)}
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
                      No BOS data available.
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

export default Experiential_Learning;
