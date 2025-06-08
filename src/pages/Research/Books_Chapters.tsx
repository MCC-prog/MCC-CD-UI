import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Col, Row, Input, Label, Button, CardBody, Card, Container, Nav, NavItem, NavLink, TabContent, TabPane, Modal, ModalHeader, ModalBody, Table } from "reactstrap";
import Breadcrumb from 'Components/Common/Breadcrumb';
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";

const Books_Chapters = () => {
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
  const [selectedType, setSelectedType] = useState<string>("Research Article");

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      facultyName: "",
      coAuthors: "",
      bookTitle: "",
      editor: "",
      isbxl: "",
      frontPageUpload: null as File | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>().nullable().required("Please select academic year"),
      stream: Yup.object<{ value: string; label: string }>().nullable().required("Please select school"),
      department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
      otherDepartment: Yup.string().when("department", (department: any, schema) =>
        department?.value === "Others"
          ? schema.required("Please specify the department")
          : schema.nullable()
      ),
      facultyName: Yup.string().required("Please enter faculty name"),
      coAuthors: Yup.string().required("Please enter co-authors"),
      bookTitle: Yup.string().required("Please enter book title"),
      editor: Yup.string().required("Please enter editor name"),
      isbxl: Yup.string().required("Please enter ISBXL"),
      frontPageUpload: Yup.mixed().required("Please upload the front page"),
      dateOfPublication: Yup.string().required("Please select date of publication"),
      publisher: Yup.string().required("Please enter publisher")
    }),
    onSubmit: async (values: any) => {
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
          <Breadcrumb title="Research" breadcrumbItem="Books/Chapters" />
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
                      {validation.touched.academicYear && validation.errors.academicYear && (
                        <div className="text-danger">
                          {typeof validation.errors.academicYear === 'string' && validation.errors.academicYear}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Faculty Name</Label>
                      <Input
                        type="text"
                        name="facultyName"
                        value={validation.values.facultyName}
                        onChange={validation.handleChange}
                        className={`form-control ${validation.touched.facultyName && validation.errors.facultyName ? "is-invalid" : ""}`}
                        placeholder="Enter Faculty Name"
                      />
                      {validation.touched.facultyName && validation.errors.facultyName && (
                        <div className="text-danger">
                          {typeof validation.errors.facultyName === 'string' && validation.errors.facultyName}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Co-authors</Label>
                      <Input
                        type="text"
                        name="coAuthors"
                        value={validation.values.coAuthors}
                        onChange={validation.handleChange}
                        className={`form-control ${validation.touched.coAuthors && validation.errors.coAuthors ? "is-invalid" : ""}`}
                        placeholder="Enter Co-authors"
                      />
                      {validation.touched.coAuthors && validation.errors.coAuthors && (
                        <div className="text-danger">
                          {typeof validation.errors.coAuthors === 'string' && validation.errors.coAuthors}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Book Title</Label>
                      <Input
                        type="text"
                        name="bookTitle"
                        value={validation.values.bookTitle}
                        onChange={validation.handleChange}
                        className={`form-control ${validation.touched.bookTitle && validation.errors.bookTitle ? "is-invalid" : ""}`}
                        placeholder="Enter Book Title"
                      />
                      {validation.touched.bookTitle && validation.errors.bookTitle && (
                        <div className="text-danger">
                          {typeof validation.errors.bookTitle === 'string' && validation.errors.bookTitle}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Editor</Label>
                      <Input
                        type="text"
                        name="editor"
                        value={validation.values.editor}
                        onChange={validation.handleChange}
                        className={`form-control ${validation.touched.editor && validation.errors.editor ? "is-invalid" : ""}`}
                        placeholder="Enter Editor Name"
                      />
                      {validation.touched.editor && validation.errors.editor && (
                        <div className="text-danger">
                          {typeof validation.errors.editor === 'string' && validation.errors.editor}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Publisher</Label>
                      <Input
                        type="text"
                        name="publisher"
                        value={validation.values.publisher}
                        onChange={validation.handleChange}
                        className={`form-control ${validation.touched.publisher && validation.errors.publisher ? "is-invalid" : ""}`}
                        placeholder="Enter Publisher"
                      />
                      {validation.touched.publisher && validation.errors.publisher && (
                        <div className="text-danger">
                          {typeof validation.errors.publisher === 'string' && validation.errors.publisher}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>ISBXL</Label>
                      <Input
                        type="text"
                        name="isbxl"
                        value={validation.values.isbxl}
                        onChange={validation.handleChange}
                        className={`form-control ${validation.touched.isbxl && validation.errors.isbxl ? "is-invalid" : ""}`}
                        placeholder="Enter ISBXL"
                      />
                      {validation.touched.isbxl && validation.errors.isbxl && (
                        <div className="text-danger">
                          {typeof validation.errors.isbxl === 'string' && validation.errors.isbxl}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Date of Publication</Label>
                      <Input
                        type="date"
                        name="dateOfPublication"
                        value={validation.values.dateOfPublication}
                        onChange={validation.handleChange}
                        className={`form-control ${validation.touched.dateOfPublication && validation.errors.dateOfPublication ? "is-invalid" : ""}`}
                      />
                      {validation.touched.dateOfPublication && validation.errors.dateOfPublication && (
                        <div className="text-danger">
                          {typeof validation.errors.dateOfPublication === 'string' && validation.errors.dateOfPublication}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Front Page Upload</Label>
                      <Input
                        type="file"
                        name="frontPageUpload"
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0] || null;
                          validation.setFieldValue("frontPageUpload", file);
                        }}
                        className={`form-control ${validation.touched.frontPageUpload && validation.errors.frontPageUpload ? "is-invalid" : ""}`}
                      />
                      {validation.touched.frontPageUpload && validation.errors.frontPageUpload && (
                        <div className="text-danger">
                          {typeof validation.errors.frontPageUpload === 'string' && validation.errors.frontPageUpload}
                        </div>
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
                        List Books/Chapters
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

export default Books_Chapters;