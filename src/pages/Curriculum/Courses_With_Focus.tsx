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
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import SemesterDropdowns from "Components/DropDowns/SemesterDropdowns";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import ProgramDropdown from "Components/DropDowns/ProgramDropdown";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import { SEMESTER_NO_OPTIONS } from "Components/constants/layout";

const api = new APIClient();

const Courses_With_Focus: React.FC = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variable for managing the modal for listing Course With Focus
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State variable for managing the list of Courses With Focus
  const [CWFData, setCWFData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState(CWFData);
  // State variable for managing search term and pagination
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

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const toggleTab = (tab) => {
    setActiveTab(activeTab === tab ? null : tab); // Collapse if clicked again
  };

  const toggleWizard = () => {
    setShowWizard(!showWizard);
  };

  // Toggle the modal for listing Course With Focus
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Handle column-specific filters
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

  // Calculate the paginated data
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Fetch Courses With Focus from the backend
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

  // Open the modal and fetch data
  const handleListCWFClick = () => {
    toggleModal();
    fetchCWFData();
  };

  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
  };

  const courseType = [
    { value: "T", label: "Core" },
    { value: "P", label: "Elective" },
    { value: "A", label: "Allied" },
  ];

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
  // Fetch the data for the selected Course With Focus ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/CoursesWithFocus?coursesWithFocusId=${id}`,
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
        file: null,
        otherDepartment: "",
        courses: null,
        courseType: null,
        courseTitile: null,
        courseTitileET: "",
        courseTitileG: "",
        courseTitileES: "",
        courseTitileIK: "",
        courseTitileEM: "",
        courseTitileSE: "",
        courseTitileEN: "",
      };
      validation.setValues({
        ...mappedValues,
        academicYear: mappedValues.academicYear
          ? { ...mappedValues.academicYear, value: String(mappedValues.academicYear.value) }
          : null,
        semesterNo: mappedValues.semesterNo
          ? { ...mappedValues.semesterNo, value: String(mappedValues.semesterNo.value) }
          : null,
        stream: mappedValues.stream
          ? { ...mappedValues.stream, value: String(mappedValues.stream.value) }
          : null,
        department: mappedValues.department
          ? { ...mappedValues.department, value: String(mappedValues.department.value) }
          : null,
        programType: mappedValues.programType
          ? { ...mappedValues.programType, value: String(mappedValues.programType.value) }
          : null,
        degree: mappedValues.degree
          ? { ...mappedValues.degree, value: String(mappedValues.degree.value) }
          : null,
      });
 
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error("Error fetching Courses With Focus by ID:", error);
    }
  };
  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Call the delete API and refresh the Courses With Focus
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
        console.error("Error deleting Course With Focus:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

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
      courseTitileET: "",
      courseTitileG: "",
      courseTitileES: "",
      courseTitileIK: "",
      courseTitileEM: "",
      courseTitileSE: "",
      courseTitileEN: "",
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select academic year"),
      semesterType: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select a semester type"), // Single object for single-select
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
      courses: Yup.object().nullable().required("Please enter Program "),
      program: Yup.array()
        .min(1, "Please select at least one program")
        .required("Please select programs"),
      courseType: Yup.object().nullable().required("Please select course type"),
      courseTitile: Yup.string().required("Please select Course Title"),
      file: Yup.mixed()
        .required("Please upload a file")
        .test("fileSize", "File size is too large", (value: any) => {
          return value && value.size <= 2 * 1024 * 1024; // 2MB limit
        })
        .test("fileType", "Unsupported file format", (value: any) => {
          return (
            value &&
            ["application/pdf", "image/jpeg", "image/png"].includes(value.type)
          );
        }),
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("semType", values.semesterType?.value || "");
      formData.append("semesterNo", String(values.semesterNo?.value || ""));
      formData.append("programTypeId", values.programType?.value || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append(
        "courseIds",
        values.program.map((option) => option.value).join(",") || ""
      );
      formData.append("programId", values.degree?.value || "");
      formData.append("otherDepartment", values.otherDepartment || "");
      // Append the file
      if (values.file) {
        formData.append("mom", values.file);
      } else {
        console.error("No file selected");
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/centralized/CoursesWithFocus`,
            formData
          );
          toast.success(
            response.message || "Courses With Focus updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/centralized/CoursesWithFocus",
            formData
          );
          toast.success(
            response.message || "Courses With Focus added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the Course With Focus List
        handleListCWFClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Courses With Focus. Please try again.");
        console.error("Error creating Course With Focus:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Courses With Focus"
            breadcrumbItem="Courses With Focus"
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
                        deptId={selectedDepartment?.value} // Pass the selected department ID
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
                            {" "}
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
                            className={`step-button ${
                              activeTab === tab ? "active" : ""
                            }`}
                            onClick={() => toggleTab(tab)}
                          >
                            {tab}.
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
                      <div className="tab-content">
                        {activeTab === 1 && (
                          <Form>
                            <Row>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Title</Label>
                                  <Input
                                    type="text"
                                    name="courseTitileG"
                                    value={validation.values.courseTitileG}
                                    onChange={validation.handleChange}
                                    placeholder="Enter Course Titile"
                                    className={
                                      validation.touched.courseTitileG &&
                                      validation.errors.courseTitileG
                                        ? "input-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.courseTitileG &&
                                    validation.errors.courseTitileG && (
                                      <div className="text-danger">
                                        {validation.errors.courseTitileG}
                                      </div>
                                    )}
                                </div>
                              </Col>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Type</Label>
                                  <Select
                                    options={courseType}
                                    value={validation.values.courseType}
                                    onChange={(selectedOptions) =>
                                      validation.setFieldValue(
                                        "courseType",
                                        selectedOptions
                                      )
                                    }
                                    placeholder="Select Course Type"
                                    isMulti
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
                                        {validation.errors.courseType}
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
                                    Upload file
                                  </Label>
                                  <Input
                                    className={`form-control ${
                                      validation.touched.file &&
                                      validation.errors.file
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="gender"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "gender",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />
                                  {validation.touched.file &&
                                    validation.errors.file && (
                                      <div className="text-danger">
                                        {validation.errors.file}
                                      </div>
                                    )}
                                </div>
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {activeTab === 2 && (
                          <Form>
                            <Row>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Title</Label>
                                  <Input
                                    type="text"
                                    name="courseTitileES"
                                    value={validation.values.courseTitileES}
                                    onChange={validation.handleChange}
                                    placeholder="Enter Course Titile"
                                    className={
                                      validation.touched.courseTitileES &&
                                      validation.errors.courseTitileES
                                        ? "input-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.courseTitileES &&
                                    validation.errors.courseTitileES && (
                                      <div className="text-danger">
                                        {validation.errors.courseTitileES}
                                      </div>
                                    )}
                                </div>
                              </Col>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Type</Label>
                                  <Select
                                    options={courseType}
                                    value={validation.values.courseType}
                                    onChange={(selectedOptions) =>
                                      validation.setFieldValue(
                                        "courseType",
                                        selectedOptions
                                      )
                                    }
                                    placeholder="Select Course Type"
                                    isMulti
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
                                        {validation.errors.courseType}
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
                                    Upload file
                                  </Label>
                                  <Input
                                    className={`form-control ${
                                      validation.touched.file &&
                                      validation.errors.file
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="environment&sustainability"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "environment&sustainability",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />
                                  {validation.touched.file &&
                                    validation.errors.file && (
                                      <div className="text-danger">
                                        {validation.errors.file}
                                      </div>
                                    )}
                                </div>
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {activeTab === 3 && (
                          <Form>
                            <Row>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Title</Label>
                                  <Input
                                    type="text"
                                    name="courseTitileIK"
                                    value={validation.values.courseTitileIK}
                                    onChange={validation.handleChange}
                                    placeholder="Enter Course Titile"
                                    className={
                                      validation.touched.courseTitileIK &&
                                      validation.errors.courseTitileIK
                                        ? "input-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.courseTitileIK &&
                                    validation.errors.courseTitileIK && (
                                      <div className="text-danger">
                                        {validation.errors.courseTitileIK}
                                      </div>
                                    )}
                                </div>
                              </Col>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Type</Label>
                                  <Select
                                    options={courseType}
                                    value={validation.values.courseType}
                                    onChange={(selectedOptions) =>
                                      validation.setFieldValue(
                                        "courseType",
                                        selectedOptions
                                      )
                                    }
                                    placeholder="Select Course Type"
                                    isMulti
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
                                        {validation.errors.courseType}
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
                                    Upload file
                                  </Label>
                                  <Input
                                    className={`form-control ${
                                      validation.touched.file &&
                                      validation.errors.file
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="indianKnowledgeSystem"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "indianKnowledgeSystem",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />
                                  {validation.touched.file &&
                                    validation.errors.file && (
                                      <div className="text-danger">
                                        {validation.errors.file}
                                      </div>
                                    )}
                                </div>
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {activeTab === 4 && (
                          <Form>
                            <Row>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Title</Label>
                                  <Input
                                    type="text"
                                    name="courseTitileEM"
                                    value={validation.values.courseTitileEM}
                                    onChange={validation.handleChange}
                                    placeholder="Enter Course Titile"
                                    className={
                                      validation.touched.courseTitileEM &&
                                      validation.errors.courseTitileEM
                                        ? "input-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.courseTitileEM &&
                                    validation.errors.courseTitileEM && (
                                      <div className="text-danger">
                                        {validation.errors.courseTitileEM}
                                      </div>
                                    )}
                                </div>
                              </Col>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Type</Label>
                                  <Select
                                    options={courseType}
                                    value={validation.values.courseType}
                                    onChange={(selectedOptions) =>
                                      validation.setFieldValue(
                                        "courseType",
                                        selectedOptions
                                      )
                                    }
                                    placeholder="Select Course Type"
                                    isMulti
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
                                        {validation.errors.courseType}
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
                                    Upload file
                                  </Label>
                                  <Input
                                    className={`form-control ${
                                      validation.touched.file &&
                                      validation.errors.file
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="employability"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "employability",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />
                                  {validation.touched.file &&
                                    validation.errors.file && (
                                      <div className="text-danger">
                                        {validation.errors.file}
                                      </div>
                                    )}
                                </div>
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {activeTab === 5 && (
                          <Form>
                            <Row>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Title</Label>
                                  <Input
                                    type="text"
                                    name="courseTitileSE"
                                    value={validation.values.courseTitileSE}
                                    onChange={validation.handleChange}
                                    placeholder="Enter Course Titile"
                                    className={
                                      validation.touched.courseTitileSE &&
                                      validation.errors.courseTitileSE
                                        ? "input-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.courseTitileSE &&
                                    validation.errors.courseTitileSE && (
                                      <div className="text-danger">
                                        {validation.errors.courseTitileSE}
                                      </div>
                                    )}
                                </div>
                              </Col>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Type</Label>
                                  <Select
                                    options={courseType}
                                    value={validation.values.courseType}
                                    onChange={(selectedOptions) =>
                                      validation.setFieldValue(
                                        "courseType",
                                        selectedOptions
                                      )
                                    }
                                    placeholder="Select Course Type"
                                    isMulti
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
                                        {validation.errors.courseType}
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
                                    Upload file
                                  </Label>
                                  <Input
                                    className={`form-control ${
                                      validation.touched.file &&
                                      validation.errors.file
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="skillEnhancement"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "skillEnhancement",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />
                                  {validation.touched.file &&
                                    validation.errors.file && (
                                      <div className="text-danger">
                                        {validation.errors.file}
                                      </div>
                                    )}
                                </div>
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {activeTab === 6 && (
                          <Form>
                            <Row>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Title</Label>
                                  <Input
                                    type="text"
                                    name="courseTitileEN"
                                    value={validation.values.courseTitileEN}
                                    onChange={validation.handleChange}
                                    placeholder="Enter Course Titile"
                                    className={
                                      validation.touched.courseTitileEN &&
                                      validation.errors.courseTitileEN
                                        ? "input-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.courseTitileEN &&
                                    validation.errors.courseTitileEN && (
                                      <div className="text-danger">
                                        {validation.errors.courseTitileEN}
                                      </div>
                                    )}
                                </div>
                              </Col>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Type</Label>
                                  <Select
                                    options={courseType}
                                    value={validation.values.courseType}
                                    onChange={(selectedOptions) =>
                                      validation.setFieldValue(
                                        "courseType",
                                        selectedOptions
                                      )
                                    }
                                    placeholder="Select Course Type"
                                    isMulti
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
                                        {validation.errors.courseType}
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
                                    Upload file
                                  </Label>
                                  <Input
                                    className={`form-control ${
                                      validation.touched.file &&
                                      validation.errors.file
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="entrepreneurship"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "entrepreneurship",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />
                                  {validation.touched.file &&
                                    validation.errors.file && (
                                      <div className="text-danger">
                                        {validation.errors.file}
                                      </div>
                                    )}
                                </div>
                              </Col>
                            </Row>
                          </Form>
                        )}
                        {activeTab === 7 && (
                          <Form>
                            <Row>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Title</Label>
                                  <Input
                                    type="text"
                                    name="courseTitileET"
                                    value={validation.values.courseTitileET}
                                    onChange={validation.handleChange}
                                    placeholder="Enter Course Titile"
                                    className={
                                      validation.touched.courseTitileET &&
                                      validation.errors.courseTitileET
                                        ? "input-error"
                                        : ""
                                    }
                                  />
                                  {validation.touched.courseTitileET &&
                                    validation.errors.courseTitileET && (
                                      <div className="text-danger">
                                        {validation.errors.courseTitileET}
                                      </div>
                                    )}
                                </div>
                              </Col>
                              <Col lg={4}>
                                <div className="mb-3">
                                  <Label>Course Type</Label>
                                  <Select
                                    options={courseType}
                                    value={validation.values.courseType}
                                    onChange={(selectedOptions) =>
                                      validation.setFieldValue(
                                        "courseType",
                                        selectedOptions
                                      )
                                    }
                                    placeholder="Select Course Type"
                                    isMulti
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
                                        {validation.errors.courseType}
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
                                    Upload file
                                  </Label>
                                  <Input
                                    className={`form-control ${
                                      validation.touched.file &&
                                      validation.errors.file
                                        ? "is-invalid"
                                        : ""
                                    }`}
                                    type="file"
                                    id="ethics"
                                    onChange={(event) => {
                                      validation.setFieldValue(
                                        "ethics",
                                        event.currentTarget.files
                                          ? event.currentTarget.files[0]
                                          : null
                                      );
                                    }}
                                  />
                                  {validation.touched.file &&
                                    validation.errors.file && (
                                      <div className="text-danger">
                                        {validation.errors.file}
                                      </div>
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
                    Subject Tittle
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
                      <td>{cwf.subjectTittle}</td>
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
        ;
      </div>
    </React.Fragment>
  );
};

export default Courses_With_Focus;
