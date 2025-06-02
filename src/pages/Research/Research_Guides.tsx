import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import { useFormik } from "formik";
import * as Yup from "yup";
import React, { useState } from "react";
import { Button, Card, CardBody, Col, Container, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "reactstrap";
import Breadcrumb from 'Components/Common/Breadcrumb';

const Research_Guides = () => {
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  // State variable for managing the modal for listing BOS
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const researchPaperData: any[] = []; // Initialize with an empty array or fetch data dynamically
  const [filteredData, setFilteredData] = useState(researchPaperData);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = researchPaperData.filter((row) =>
      Object.values(row).some((val) =>
        String(val || "").toLowerCase().includes(value)
      )
    );
    setFilteredData(filtered);
  };

  // Handle column-specific filters
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>, column: string) => {
    const value = e.target.value.toLowerCase();
    const updatedFilters = { ...filters, [column]: value };
    setFilters(updatedFilters);

    const filtered = researchPaperData.filter((row) =>
      Object.values(row).some((val) =>
        String(val || "").toLowerCase().includes(value)
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

  // Formik validation and submission
  // Initialize Formik with validation schema and initial values
  const [students, setStudents] = useState<any[]>([]);

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      guideName: "",
      guideAffiliation: "",
      numberOfStudents: "",
      studentDetails: [] as any[],
      uploadLetter: null as File | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>().nullable().required("Please select academic year"),
      stream: Yup.object<{ value: string; label: string }>().nullable().required("Please select school"),
      department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
      otherDepartment: Yup.string().when("department", (department: any, schema) => {
        return department?.value === "Others"
          ? schema.required("Please specify the department")
          : schema;
      }),
      guideName: Yup.string().required("Please enter guide name"),
      guideAffiliation: Yup.string().required("Please enter guide affiliation"),
      numberOfStudents: Yup.number()
        .typeError("Please enter a valid number")
        .min(1, "Number of students must be at least 1")
        .required("Please enter the number of students"),
      studentDetails: Yup.array().of(
        Yup.object({
          name: Yup.string().required("Please enter student name"),
          yearOfJoining: Yup.string().required("Please enter year of joining"),
          title: Yup.string().required("Please enter title"),
          fundingReceived: Yup.string().required("Please specify funding received"),
          scholarship: Yup.string().required("Please specify scholarship"),
        })
      ),
      uploadLetter: Yup.mixed().required("Please upload the letter"),
    }),
    onSubmit: async (values) => {
      console.log("Form Submitted:", values);
    },
  });

  const handleNumberOfStudentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    validation.setFieldValue("numberOfStudents", value);

    if (!isNaN(value) && value > 0) {
      const updatedStudents = Array.from({ length: value }, () => ({
        name: "",
        yearOfJoining: "",
        title: "",
        fundingReceived: "",
        scholarship: "",
      }));
      validation.setFieldValue("studentDetails", updatedStudents);
      setStudents(updatedStudents);
    } else {
      validation.setFieldValue("studentDetails", []);
      setStudents([]);
    }
  };

  const handleStudentDetailsChange = (index: number, field: string, value: string) => {
    const updatedStudents = [...students];
    updatedStudents[index][field] = value;
    validation.setFieldValue("studentDetails", updatedStudents);
    setStudents(updatedStudents);
  };

  function handleEdit(researchDataId: any): void {
    console.log("Edit Rserach with ID:", researchDataId);
    // Open the modal for editing
    setIsModalOpen(true);
  }

  function handleDelete(researchDataId: any): void {
    console.log("Delete Research ID with ID:", researchDataId);
  }

  // Open the modal and fetch data
  const handleListResearchClick = () => {
    toggleModal();
  };

  // State variable to track edit mode
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Research" breadcrumbItem="Research Guides" />
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
                          validation.setFieldValue("academicYear", selectedOption)
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
                          validation.touched.stream && !!validation.errors.stream
                        }
                      />
                      {validation.touched.stream && validation.errors.stream && (
                        <div className="text-danger">{validation.errors.stream}</div>
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
                          validation.setFieldValue("department", selectedOption);
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
                          className={`form-control ${validation.touched.otherDepartment && validation.errors.otherDepartment ? "is-invalid" : ""
                            }`}
                          value={validation.values.otherDepartment}
                          onChange={(e) => validation.setFieldValue("otherDepartment", e.target.value)}
                          placeholder="Enter Department Name"
                        />
                        {validation.touched.otherDepartment && validation.errors.otherDepartment && (
                          <div className="text-danger">{validation.errors.otherDepartment}</div>
                        )}
                      </div>
                    </Col>
                  )}
                  {/* Guide Name */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Guide Name</Label>
                      <Input
                        type="text"
                        value={validation.values.guideName}
                        onChange={(e) => validation.setFieldValue("guideName", e.target.value)}
                        className={`form-control ${validation.touched.guideName && validation.errors.guideName ? "is-invalid" : ""}`}
                        placeholder="Enter Guide Name"
                      />
                      {validation.touched.guideName && validation.errors.guideName && (
                        <div className="text-danger">{validation.errors.guideName}</div>
                      )}
                    </div>
                  </Col>

                  {/* Guide Affiliation */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Guide Affiliation</Label>
                      <Input
                        type="text"
                        value={validation.values.guideAffiliation}
                        onChange={(e) => validation.setFieldValue("guideAffiliation", e.target.value)}
                        className={`form-control ${validation.touched.guideAffiliation && validation.errors.guideAffiliation ? "is-invalid" : ""}`}
                        placeholder="Enter Guide Affiliation"
                      />
                      {validation.touched.guideAffiliation && validation.errors.guideAffiliation && (
                        <div className="text-danger">{validation.errors.guideAffiliation}</div>
                      )}
                    </div>
                  </Col>

                  {/* Number of Students */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Number of Students</Label>
                      <Input
                        type="number"
                        value={validation.values.numberOfStudents}
                        onChange={handleNumberOfStudentsChange}
                        className={`form-control ${validation.touched.numberOfStudents && validation.errors.numberOfStudents ? "is-invalid" : ""}`}
                        placeholder="Enter Number of Students"
                      />
                      {validation.touched.numberOfStudents && validation.errors.numberOfStudents && (
                        <div className="text-danger">{validation.errors.numberOfStudents}</div>
                      )}
                    </div>
                  </Col>
                </Row>

                {/* Dynamic Student Details */}
                {students.map((student, index) => (
                  <div key={index} className="border p-3 mb-3">
                    <h5 className="mb-3">Student Details {index + 1}</h5>
                    <Row>
                      <Col lg={4}>
                        <div className="mb-3">
                          <Label>Student Name</Label>
                          <Input
                            type="text"
                            value={student.name}
                            onChange={(e) => handleStudentDetailsChange(index, "name", e.target.value)}
                            className={`form-control ${validation.touched.studentDetails?.[index]?.name &&
                                typeof validation.errors.studentDetails?.[index] === "object" &&
                                validation.errors.studentDetails?.[index]?.name
                                ? "is-invalid"
                                : ""
                              }`}
                            placeholder="Enter Student Name"
                          />
                          {validation.touched.studentDetails?.[index]?.name &&
                            typeof validation.errors.studentDetails?.[index] === "object" &&
                            validation.errors.studentDetails?.[index]?.name && (
                              <div className="text-danger">
                                {typeof validation.errors.studentDetails?.[index]?.name === "string"
                                  ? validation.errors.studentDetails?.[index]?.name
                                  : ""}
                              </div>
                            )}
                        </div>
                      </Col>
                      <Col lg={4}>
                        <div className="mb-3">
                          <Label>Year of Joining</Label>
                          <Input
                            type="text"
                            value={student.yearOfJoining}
                            onChange={(e) => handleStudentDetailsChange(index, "yearOfJoining", e.target.value)}
                            className={`form-control ${validation.touched.studentDetails?.[index]?.yearOfJoining &&
                                typeof validation.errors.studentDetails?.[index] === "object" &&
                                validation.errors.studentDetails?.[index]?.yearOfJoining
                                ? "is-invalid"
                                : ""
                              }`}
                            placeholder="Enter Year of Joining"
                          />
                          {validation.touched.studentDetails?.[index]?.yearOfJoining &&
                            typeof validation.errors.studentDetails?.[index] === "object" &&
                            validation.errors.studentDetails?.[index]?.yearOfJoining && (
                              <div className="text-danger">
                                {typeof validation.errors.studentDetails?.[index]?.yearOfJoining === "string"
                                  ? validation.errors.studentDetails?.[index]?.yearOfJoining
                                  : ""}
                              </div>
                            )}
                        </div>
                      </Col>
                      <Col lg={4}>
                        <div className="mb-3">
                          <Label>Title</Label>
                          <Input
                            type="text"
                            value={student.title}
                            onChange={(e) => handleStudentDetailsChange(index, "title", e.target.value)}
                            className={`form-control ${validation.touched.studentDetails?.[index]?.title &&
                                typeof validation.errors.studentDetails?.[index] === "object" &&
                                validation.errors.studentDetails?.[index]?.title
                                ? "is-invalid"
                                : ""
                              }`}
                            placeholder="Enter Title"
                          />
                          {validation.touched.studentDetails?.[index]?.title &&
                            typeof validation.errors.studentDetails?.[index] === "object" &&
                            validation.errors.studentDetails?.[index]?.title && (
                              <div className="text-danger">
                                {typeof validation.errors.studentDetails?.[index]?.title === "string"
                                  ? validation.errors.studentDetails?.[index]?.title
                                  : ""}
                              </div>
                            )}
                        </div>
                      </Col>
                      <Col lg={4}>
                        <div className="mb-3">
                          <Label>Funding Received</Label>
                          <Input
                            type="text"
                            value={student.fundingReceived}
                            onChange={(e) => handleStudentDetailsChange(index, "fundingReceived", e.target.value)}
                            className={`form-control ${validation.touched.studentDetails?.[index]?.fundingReceived &&
                                typeof validation.errors.studentDetails?.[index] === "object" &&
                                validation.errors.studentDetails?.[index]?.fundingReceived
                                ? "is-invalid"
                                : ""
                              }`}
                            placeholder="Enter Funding Received"
                          />
                          {validation.touched.studentDetails?.[index]?.fundingReceived &&
                            typeof validation.errors.studentDetails?.[index] === "object" &&
                            validation.errors.studentDetails?.[index]?.fundingReceived && (
                              <div className="text-danger">
                                {typeof validation.errors.studentDetails?.[index]?.fundingReceived === "string"
                                  ? validation.errors.studentDetails?.[index]?.fundingReceived
                                  : ""}
                              </div>
                            )}
                        </div>
                      </Col>
                      <Col lg={4}>
                        <div className="mb-3">
                          <Label>Scholarship</Label>
                          <Input
                            type="text"
                            value={student.scholarship}
                            onChange={(e) => handleStudentDetailsChange(index, "scholarship", e.target.value)}
                            className={`form-control ${validation.touched.studentDetails?.[index]?.scholarship &&
                                typeof validation.errors.studentDetails?.[index] === "object" &&
                                validation.errors.studentDetails?.[index]?.scholarship
                                ? "is-invalid"
                                : ""
                              }`}
                            placeholder="Enter Scholarship"
                          />
                          {validation.touched.studentDetails?.[index]?.scholarship &&
                            typeof validation.errors.studentDetails?.[index] === "object" &&
                            validation.errors.studentDetails?.[index]?.scholarship && (
                              <div className="text-danger">
                                {typeof validation.errors.studentDetails?.[index]?.scholarship === "string"
                                  ? validation.errors.studentDetails?.[index]?.scholarship
                                  : ""}
                              </div>
                            )}
                        </div>
                      </Col>
                    </Row>
                  </div>
                ))}
                {/* Upload Letter */}
                <Row>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Upload Letter</Label>
                      <Input
                        type="file"
                        onChange={(e) => validation.setFieldValue("uploadLetter", e.target.files?.[0] || null)}
                        className={`form-control ${validation.touched.uploadLetter && validation.errors.uploadLetter ? "is-invalid" : ""}`}
                      />
                      {validation.touched.uploadLetter && validation.errors.uploadLetter && (
                        <div className="text-danger">{validation.errors.uploadLetter}</div>
                      )}
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
                        onClick={handleListResearchClick}
                      >
                        List ResearchGuides
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing BOS */}
        <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg" style={{ maxWidth: "100%", width: "auto" }}>
          <ModalHeader toggle={toggleModal}>List BOS</ModalHeader>
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
                      onChange={(e) => handleFilterChange(e, "yearOfIntroduction")}
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
                    <tr key={bos.bosDataId}>
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
                            onClick={() => handleEdit(bos.bosDataId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(bos.bosDataId)}
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
      </div>
    </React.Fragment >
  );
};

export default Research_Guides;