import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import { useFormik } from "formik";
import * as Yup from "yup";
import React, { useState } from "react";
import { Button, Card, CardBody, Col, Container, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "reactstrap";
import Breadcrumb from 'Components/Common/Breadcrumb';

const FP_And_Presentation_Research_Papers = () => {

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
  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      facultyName: "",
      type: "",
      mode: "",
      level: "",
      role: "",
      titleOfPaper: "",
      organizingInstitute: "",
      fromDate: "",
      toDate: "",
      certificateFile: null as File | null,
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
      facultyName: Yup.string().required("Please enter faculty name"),
      type: Yup.string().required("Please select type"),
      mode: Yup.string().required("Please select mode"),
      level: Yup.string().required("Please select level"),
      role: Yup.string().required("Please select role"),
      titleOfPaper: Yup.string().required("Please enter title of the paper"),
      organizingInstitute: Yup.string().required("Please enter organizing institute"),
      fromDate: Yup.date().required("Please select from date"),
      toDate: Yup.date().required("Please select to date"),
      certificateFile: Yup.mixed().required("Please upload the certificate"),
    }),
    onSubmit: async (values) => {
      console.log("Form Submitted:", values);
    },
  });

  // Open the modal and fetch data
  const handleListBosClick = () => {
    toggleModal();
  };

  function handleEdit(researchDataId: any): void {
    console.log("Edit Rserach with ID:", researchDataId);
    // Open the modal for editing
    setIsModalOpen(true);
  }

  function handleDelete(researchDataId: any): void {
    console.log("Delete Research ID with ID:", researchDataId);
  }

  // State variable to track edit mode
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Research" breadcrumbItem="FP And Presentation Research Papers" />
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
                  {/* Faculty Name */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Faculty Name</Label>
                      <Input
                        type="text"
                        name="facultyName"
                        value={validation.values.facultyName}
                        onChange={(e) => validation.setFieldValue("facultyName", e.target.value)}
                        className={`form-control ${validation.touched.facultyName && validation.errors.facultyName ? "is-invalid" : ""}`}
                        placeholder="Enter Faculty Name"
                      />
                      {validation.touched.facultyName && validation.errors.facultyName && (
                        <div className="text-danger">{validation.errors.facultyName}</div>
                      )}
                    </div>
                  </Col>

                  {/* Type Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Type</Label>
                      <Input
                        type="select"
                        value={validation.values.type}
                        onChange={(e) => validation.setFieldValue("type", e.target.value)}
                        className={`form-control ${validation.touched.type && validation.errors.type ? "is-invalid" : ""}`}
                      >
                        <option value="">Select Type</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Seminar">Seminar</option>
                        <option value="Conference">Conference</option>
                      </Input>
                      {validation.touched.type && validation.errors.type && (
                        <div className="text-danger">{validation.errors.type}</div>
                      )}
                    </div>
                  </Col>

                  {/* Mode Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Mode</Label>
                      <Input
                        type="select"
                        value={validation.values.mode}
                        onChange={(e) => validation.setFieldValue("mode", e.target.value)}
                        className={`form-control ${validation.touched.mode && validation.errors.mode ? "is-invalid" : ""}`}
                      >
                        <option value="">Select Mode</option>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                      </Input>
                      {validation.touched.mode && validation.errors.mode && (
                        <div className="text-danger">{validation.errors.mode}</div>
                      )}
                    </div>
                  </Col>

                  {/* Level Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Level</Label>
                      <Input
                        type="select"
                        value={validation.values.level}
                        onChange={(e) => validation.setFieldValue("level", e.target.value)}
                        className={`form-control ${validation.touched.level && validation.errors.level ? "is-invalid" : ""}`}
                      >
                        <option value="">Select Level</option>
                        <option value="State">State</option>
                        <option value="National">National</option>
                        <option value="International">International</option>
                      </Input>
                      {validation.touched.level && validation.errors.level && (
                        <div className="text-danger">{validation.errors.level}</div>
                      )}
                    </div>
                  </Col>

                  {/* Role Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Role</Label>
                      <Input
                        type="select"
                        value={validation.values.role}
                        onChange={(e) => validation.setFieldValue("role", e.target.value)}
                        className={`form-control ${validation.touched.role && validation.errors.role ? "is-invalid" : ""}`}
                      >
                        <option value="">Select Role</option>
                        <option value="Presenter">Presenter</option>
                        <option value="Participant">Participant</option>
                        <option value="Resource Person">Resource Person</option>
                      </Input>
                      {validation.touched.role && validation.errors.role && (
                        <div className="text-danger">{validation.errors.role}</div>
                      )}
                    </div>
                  </Col>

                  {/* Title of the Paper */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Title of the Paper</Label>
                      <Input
                        type="text"
                        value={validation.values.titleOfPaper}
                        onChange={(e) => validation.setFieldValue("titleOfPaper", e.target.value)}
                        className={`form-control ${validation.touched.titleOfPaper && validation.errors.titleOfPaper ? "is-invalid" : ""}`}
                        placeholder="Enter Title of the Paper"
                      />
                      {validation.touched.titleOfPaper && validation.errors.titleOfPaper && (
                        <div className="text-danger">{validation.errors.titleOfPaper}</div>
                      )}
                    </div>
                  </Col>

                  {/* Organizing Institute */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Organizing Institute</Label>
                      <Input
                        type="text"
                        value={validation.values.organizingInstitute}
                        onChange={(e) => validation.setFieldValue("organizingInstitute", e.target.value)}
                        className={`form-control ${validation.touched.organizingInstitute && validation.errors.organizingInstitute ? "is-invalid" : ""}`}
                        placeholder="Enter Organizing Institute"
                      />
                      {validation.touched.organizingInstitute && validation.errors.organizingInstitute && (
                        <div className="text-danger">{validation.errors.organizingInstitute}</div>
                      )}
                    </div>
                  </Col>

                  {/* From Date */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>From Date</Label>
                      <Input
                        type="date"
                        value={validation.values.fromDate}
                        onChange={(e) => validation.setFieldValue("fromDate", e.target.value)}
                        className={`form-control ${validation.touched.fromDate && validation.errors.fromDate ? "is-invalid" : ""}`}
                      />
                      {validation.touched.fromDate && validation.errors.fromDate && (
                        <div className="text-danger">{validation.errors.fromDate}</div>
                      )}
                    </div>
                  </Col>

                  {/* To Date */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>To Date</Label>
                      <Input
                        type="date"
                        value={validation.values.toDate}
                        onChange={(e) => validation.setFieldValue("toDate", e.target.value)}
                        className={`form-control ${validation.touched.toDate && validation.errors.toDate ? "is-invalid" : ""}`}
                      />
                      {validation.touched.toDate && validation.errors.toDate && (
                        <div className="text-danger">{validation.errors.toDate}</div>
                      )}
                    </div>
                  </Col>

                  {/* Upload Certificate */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Upload Certificate</Label>
                      <Input
                        type="file"
                        onChange={(e) => validation.setFieldValue("certificateFile", e.target.files?.[0] || null)}
                        className={`form-control ${validation.touched.certificateFile && validation.errors.certificateFile ? "is-invalid" : ""}`}
                      />
                      {validation.touched.certificateFile && validation.errors.certificateFile && (
                        <div className="text-danger">{validation.errors.certificateFile}</div>
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
                        onClick={handleListBosClick}
                      >
                        List FPRP
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

export default FP_And_Presentation_Research_Papers;