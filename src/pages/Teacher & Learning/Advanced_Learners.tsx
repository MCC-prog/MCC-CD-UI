import Breadcrumb from "Components/Common/Breadcrumb";
import { useFormik } from "formik";
import React, { useState } from "react";
import Select from "react-select";
import * as Yup from "yup";
import {
  Card,
  CardBody,
  Col,
  Container,
  Form,
  Input,
  Label,
  NavItem,
  NavLink,
  Row,
  TabContent,
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

const api = new APIClient();

const Advanced_Learners: React.FC = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const toggleTab = (tab) => {
    setActiveTab(activeTab === tab ? null : tab); // Collapse if clicked again
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

  const academicYear = [
    { value: "2024", label: "2023-2024" },
    { value: "2025", label: "2024-2025" },
  ];
  const semType = [
    { value: "T", label: "Theory" },
    { value: "P", label: "Practical" },
  ];
  const projectType = [
    { value: "In", label: "Internal" },
    { value: "Ex", label: "External" },
  ];
  const Type = [
    { value: "Funded", label: "Funded" },
    { value: "Non-Funded", label: "Non-Funded" },
  ];
  const programType = [
    { value: "T", label: "UG" },
    { value: "P", label: "PG" },
  ];
  const semester: any = [
    { value: "1", label: "I" },
    { value: "2", label: "II" },
    { value: "3", label: "III" },
    { value: "4", label: "IV" },
    { value: "5", label: "V" },
    { value: "6", label: "VI" },
  ];
  const stream = [
    {
      value: "School of Humanities & Social Sciences",
      label: "School of Humanities & Social Sciences",
    },
    { value: "School of Commerce", label: "School of Commerce" },
    { value: "School of Management", label: "School of Management" },
    {
      value: "School of Natural & Applied Sciences",
      label: "School of Natural & Applied Sciences",
    },
  ];
  const department = [
    { value: "Science", label: "Science" },
    { value: "Arts", label: "Arts" },
  ];
  const courseTitile = [
    { value: "G", label: "B.COM.General" },
    { value: "P", label: "B.COM.Professional" },
  ];
  const mentorShip = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];

  const getformiksSchema = (activeTab: number) =>
    Yup.object().shape({
      academicYear: Yup.object()
        .nullable()
        .required("Please select academic year"),
      semesterType: Yup.object()
        .nullable()
        .required("Please select semester type"),
      semesterNo: Yup.object().nullable().required("Please select semester"),

      stream: Yup.object().nullable().required("Please select stream"),
      department: Yup.object().nullable().required("Please select department"),
      programType: Yup.object()
        .nullable()
        .required("Please select programType"),
      // Research Tab Fields
      researchProjectTitle: Yup.string().when([], {
        is: () => activeTab === 1,
        then: (schema) =>
          schema
            .required("Please enter project title")
            .min(2, "Project title must be at least 2 characters long"),
        otherwise: (schema) => schema.notRequired(),
      }),
      projectType: Yup.object().when([], {
        is: () => activeTab === 1,
        then: (schema) => schema.required("Please select project type"),
        otherwise: (schema) => schema.notRequired(),
      }),
      Type: Yup.object().when([], {
        is: () => activeTab === 1,
        then: (schema) => schema.required("Please select type"),
        otherwise: (schema) => schema.notRequired(),
      }),
      researchDuration: Yup.string().when([], {
        is: () => activeTab === 1,
        then: (schema) =>
          schema
            .required("Please enter duration")
            .matches(/^\d+$/, "Duration must be a number"),
        otherwise: (schema) => schema.notRequired(),
      }),
      researchGuideName: Yup.string().when([], {
        is: () => activeTab === 1,
        then: (schema) =>
          schema
            .required("Please enter guide name")
            .min(2, "Guide name must be at least 2 characters long"),
        otherwise: (schema) => schema.notRequired(),
      }),
      researchAmount: Yup.number().when([], {
        is: () => activeTab === 1,
        then: (schema) =>
          schema
            .required("Please enter amount")
            .positive("Amount must be a positive number")
            .integer("Amount must be an integer"),
        otherwise: (schema) => schema.notRequired(),
      }),
      file: Yup.mixed().when([], {
        is: () => activeTab === 1,
        then: (schema) =>
          schema
            .required("Please upload a file")
            .test("fileSize", "File size is too large", (value: any) => {
              return value && value.size <= 2 * 1024 * 1024;
            })
            .test("fileType", "Unsupported file format", (value: any) => {
              return (
                value &&
                ["application/pdf", "image/jpeg", "image/png"].includes(
                  value.type
                )
              );
            }),
        otherwise: (schema) => schema.notRequired(),
      }),
      SynopsisFile: Yup.mixed().when([], {
        is: () => activeTab === 1,
        then: (schema) =>
          schema
            .required("Please upload a file")
            .test("fileSize", "File size is too large", (value: any) => {
              return value && value.size <= 2 * 1024 * 1024;
            })
            .test("fileType", "Unsupported file format", (value: any) => {
              return (
                value &&
                ["application/pdf", "image/jpeg", "image/png"].includes(
                  value.type
                )
              );
            }),
        otherwise: (schema) => schema.notRequired(),
      }),

      // Peer Tab Fields
      peerCourseTitile: Yup.object()
        .nullable()
        .when([], {
          is: () => activeTab === 2,
          then: (schema) => schema.required("Please select course title"),
        }),
      peerMentorShip: Yup.object()
        .nullable()
        .when([], {
          is: () => activeTab === 2,
          then: (schema) => schema.required("Please select mentorship"),
        }),
      peerRegisterNumber: Yup.string().when([], {
        is: () => activeTab === 2,
        then: (schema) =>
          schema
            .required("Please enter register number")
            .matches(/^\d+$/, "Register number must be a number"),
        otherwise: (schema) => schema.notRequired(),
      }),
      peerTeacherCoOrdinator: Yup.string().when([], {
        is: () => activeTab === 2,
        then: (schema) =>
          schema
            .required("Please enter teacher co-ordinator")
            .min(
              2,
              "Teacher co-ordinator name must be at least 2 characters long"
            ),
        otherwise: (schema) => schema.notRequired(),
      }),
      peerFile: Yup.mixed().when([], {
        is: () => activeTab === 2,
        then: (schema) =>
          schema
            .required("Please upload a file")
            .test("fileSize", "File size is too large", (value: any) => {
              return value && value.size <= 2 * 1024 * 1024;
            })
            .test("fileType", "Unsupported file format", (value: any) => {
              return (
                value &&
                ["application/pdf", "image/jpeg", "image/png"].includes(
                  value.type
                )
              );
            }),
        otherwise: (schema) => schema.notRequired(),
      }),
    });

  const schema = React.useMemo(() => getformiksSchema(activeTab), [activeTab]);

  type OptionType = { value: string; label: string } | null;

  interface FormValues {
    academicYear: OptionType;
    semesterType: OptionType;
    semesterNo: OptionType;
    stream: OptionType;
    department: OptionType;
    programType: OptionType;
    programName: string;
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
      programName: "",
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

    validationSchema: schema,
    validateOnChange: false,
    validateOnBlur: false,

    onSubmit: async (values, { resetForm }) => {
      console.log("Submit triggered with values:", values);

      try {
        const advanceLearnersRequestDto = {
          AdvanceLearnerId: null,
          academicYear: Number(values.academicYear?.value || 0),
          semType: values.semesterType?.value || "",
          semesterNo: Number(values.semesterNo?.value || 0),
          streamId: Number(values.stream?.value || 0),
          departmentId: Number(values.department?.value || 0),
          programTypeId: Number(values.programType?.value || 0),
          programId: Number(values.Type?.value || 0),
          advanceLearnersType:
            activeTab === 1 ? "ResearchProject" : "PeerTeaching",
          researchProjectDto:
            activeTab === 1
              ? {
                  researchProjectId: null,
                  projectTitle: values.researchProjectTitle,
                  duration: Number(values.researchDuration),
                  typeOfProject: values.projectType?.value || "",
                  guideName: values.researchGuideName,
                  fundType: values.researchProjectType || "",
                  amount: Number(values.researchAmount),
                }
              : {},
          peerTeachingDto:
            activeTab === 2
              ? {
                  courseTitle: values.peerCourseTitile || "",
                  mentorshipType: values.peerMentorShip || "",
                  registerNumber: values.peerRegisterNumber,
                  teacherCoOrdinator: values.peerTeacherCoOrdinator,
                }
              : {},
        };

        const formData = new FormData();
        formData.append(
          "advanceLearnersRequestDto",
          JSON.stringify(advanceLearnersRequestDto)
        );

        if (values.file && (values.file as any) instanceof File) {
          formData.append("projectSanctionLetter", values.file);
        }

        if (
          values.SynopsisFile &&
          (values.SynopsisFile as any) instanceof File
        ) {
          formData.append("synopsisReport", values.SynopsisFile);
        }

        if (values.peerFile && (values.peerFile as any) instanceof File) {
          formData.append("peerTeaching", values.peerFile);
        }
        console.log("Form Data:", formData);
        // POST to your endpoint
        const response = await api.create("/advanceLearners/save", formData);
        toast.success(response.message || "Successfully submitted!");
        resetForm();
      } catch (error) {
        toast.error("Submission failed.");
        console.error("Form submission error:", error);
      }
    },
  });

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
                            onClick={() => toggleTab(tab)}
                            type="button"
                          >
                            {tab}.{" "}
                            {tab === 1 ? "Research Project" : "Peer Teaching"}
                          </button>
                        ))}
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
                              </div>
                              {formik.touched.researchProjectTitle &&
                                formik.errors.researchProjectTitle && (
                                  <div className="text-danger">
                                    {formik.errors.researchProjectTitle}
                                  </div>
                                )}
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
                                {formik.touched.researchDuration &&
                                  formik.errors.researchDuration && (
                                    <div className="text-danger">
                                      {formik.errors.researchDuration}
                                    </div>
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
                                {formik.touched.projectType &&
                                  formik.errors.projectType && (
                                    <div className="text-danger">
                                      {formik.errors.projectType}
                                    </div>
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
                                {formik.touched.researchGuideName &&
                                  formik.errors.researchGuideName && (
                                    <div className="text-danger">
                                      {formik.errors.researchGuideName}
                                    </div>
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
                                {formik.touched.Type && formik.errors.Type && (
                                  <div className="text-danger">
                                    {formik.errors.Type}
                                  </div>
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
                                {formik.touched.researchAmount &&
                                  formik.errors.researchAmount && (
                                    <div className="text-danger">
                                      {formik.errors.researchAmount}
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
                                {formik.touched.file && formik.errors.file && (
                                  <div className="text-danger">
                                    {formik.errors.file}
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
                                {formik.touched.SynopsisFile &&
                                  formik.errors.SynopsisFile && (
                                    <div className="text-danger">
                                      {formik.errors.SynopsisFile}
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
                                {formik.touched.peerCourseTitile &&
                                  formik.errors.peerCourseTitile && (
                                    <div className="text-danger">
                                      {formik.errors.peerCourseTitile}
                                    </div>
                                  )}
                              </div>
                            </Col>
                            <Col lg={4}>
                              <div className="mb-3">
                                <Label>MentorShip</Label>
                                <Select
                                  options={mentorShip}
                                  value={formik.values.peerMentorShip}
                                  onChange={(selectedOption) =>
                                    formik.setFieldValue(
                                      "peerMentorShip",
                                      selectedOption
                                    )
                                  }
                                  placeholder="Select Program Type"
                                  styles={dropdownStyles}
                                  menuPortalTarget={document.body}
                                  className={
                                    formik.touched.peerMentorShip &&
                                    formik.errors.peerMentorShip
                                      ? "select-error"
                                      : ""
                                  }
                                />
                                {formik.touched.peerMentorShip &&
                                  formik.errors.peerMentorShip && (
                                    <div className="text-danger">
                                      {formik.errors.peerMentorShip}
                                    </div>
                                  )}
                              </div>
                            </Col>
                            <Col lg="4">
                              <Label>Register Number</Label>
                              <Input
                                type="number"
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
                              {formik.touched.peerRegisterNumber &&
                                formik.errors.peerRegisterNumber && (
                                  <div className="text-danger">
                                    {formik.errors.peerRegisterNumber}
                                  </div>
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
                              {formik.touched.peerTeacherCoOrdinator &&
                                formik.errors.peerTeacherCoOrdinator && (
                                  <div className="text-danger">
                                    {formik.errors.peerTeacherCoOrdinator}
                                  </div>
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
                                {formik.touched.peerFile &&
                                  formik.errors.peerFile && (
                                    <div className="text-danger">
                                      {formik.errors.peerFile}
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
                        {isEditMode ? "Update Advanced Learners" : "Save Advanced Learners" }
                      </button>
                      <button className="btn btn-secondary" type="button">
                        List Advanced Learners
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
      </div>
      <ToastContainer />
    </React.Fragment>
  );
};

export default Advanced_Learners;
