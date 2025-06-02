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
      type: "Research Article",
      facultyName: "",
      coAuthors: "",
      indexation: "",
      journalName: "",
      titleOfPaper: "",
      volume: "",
      issue: "",
      pageNumber: "",
      issxl: "",
      doi: "",
      dateOfPublication: "",
      publisher: "",
      bookTitle: "",
      editor: "",
      isbxl: "",
      frontPageUpload: null as File | null,
      researchArticleUpload: null as File | null,
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
      type: Yup.string().required("Please select type"),
      facultyName: Yup.string().required("Please enter faculty name"),
      coAuthors: Yup.string().required("Please enter co-authors"),
      indexation: Yup.string().required("Please select indexation"),
      journalName: Yup.string().required("Please enter journal name"),
      titleOfPaper: Yup.string().required("Please enter title of paper"),
      volume: Yup.string().required("Please enter volume"),
      issue: Yup.string().required("Please enter issue"),
      pageNumber: Yup.number().required("Please enter page number").positive("Page number must be positive").integer("Page number must be an integer"),
      issxl: Yup.string().required("Please enter ISSXL"),
      doi: Yup.string().required("Please enter DOI"),
      bookTitle: Yup.string().required("Please enter book title"),
      editor: Yup.string().required("Please enter editor name"),
      isbxl: Yup.string().required("Please enter ISBXL"),
      frontPageUpload: Yup.mixed().required("Please upload the front page"),
      dateOfPublication: Yup.string().required("Please select date of publication"),
      publisher: Yup.string().required("Please enter publisher"),
      researchArticleUpload: Yup.mixed().required("Please upload the research article"),
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
                      {validation.touched.academicYear &&
                        validation.errors.academicYear && (
                          <div className="text-danger">
                            {typeof validation.errors.academicYear === "string" && validation.errors.academicYear}
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
                       
                      </div>
                    </Col>
                  )}
                  {/* Type Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Type</Label>
                      <Input
                        type="select"
                        value={validation.values.type}
                        onChange={(e) => {
                          validation.setFieldValue("type", e.target.value);
                          setSelectedType(e.target.value);
                        }}
                        className={`form-control ${validation.touched.type && validation.errors.type ? "is-invalid" : ""}`}
                      >
                        <option value="Research Article">Research Article</option>
                        <option value="Book Chapters/Books">Book Chapters/Books</option>
                      </Input>
                      
                    </div>
                  </Col>
                </Row>
                {/* Conditional Rendering Based on Type */}
                {selectedType === "Research Article" && (
                  <Row>
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
                       
                      </div>
                    </Col>
                    <Col lg={4}>
                      <div className="mb-3">
                        <Label>Indexation</Label>
                        <Input
                          type="select"
                          value={validation.values.indexation}
                          onChange={(e) => validation.setFieldValue("indexation", e.target.value)}
                          className={`form-control ${validation.touched.indexation && validation.errors.indexation ? "is-invalid" : ""}`}
                        >
                          <option value="">Select Indexation</option>
                          <option value="Scopus">Scopus</option>
                          <option value="Web of Science">Web of Science</option>
                          <option value="ABDC">ABDC</option>
                          <option value="UGC-Care">UGC-Care</option>
                        </Input>
                        
                      </div>
                    </Col>
                    <Col lg={4}>
                      <div className="mb-3">
                        <Label>Journal Name</Label>
                        <Input
                          type="text"
                          name="journalName"
                          value={validation.values.journalName}
                          onChange={validation.handleChange}
                          className={`form-control ${validation.touched.journalName && validation.errors.journalName ? "is-invalid" : ""}`}
                          placeholder="Enter Journal Name"
                        />
                        
                      </div>
                    </Col>
                    <Col lg={4}>
                      <div className="mb-3">
                        <Label>Title of Paper</Label>
                        <Input
                          type="text"
                          name="titleOfPaper"
                          value={validation.values.titleOfPaper}
                          onChange={validation.handleChange}
                          className={`form-control ${validation.touched.titleOfPaper && validation.errors.titleOfPaper ? "is-invalid" : ""}`}
                          placeholder="Enter Title of Paper"
                        />
                        
                      </div>
                    </Col>
                    <Col lg={4}>
                      <div className="mb-3">
                        <Label>Volume</Label>
                        <Input
                          type="text"
                          name="volume"
                          value={validation.values.volume}
                          onChange={validation.handleChange}
                          className={`form-control ${validation.touched.volume && validation.errors.volume ? "is-invalid" : ""}`}
                          placeholder="Enter Volume"
                        />
                        
                      </div>
                    </Col>
                    <Col lg={4}>
                      <div className="mb-3">
                        <Label>Issue</Label>
                        <Input
                          type="text"
                          name="issue"
                          value={validation.values.issue}
                          onChange={validation.handleChange}
                          className={`form-control ${validation.touched.issue && validation.errors.issue ? "is-invalid" : ""}`}
                          placeholder="Enter Issue"
                        />
                       
                      </div>
                    </Col>
                    <Col lg={4}>
                      <div className="mb-3">
                        <Label>Page Number</Label>
                        <Input
                          type="number"
                          name="pageNumber"
                          value={validation.values.pageNumber}
                          onChange={validation.handleChange}
                          className={`form-control ${validation.touched.pageNumber && validation.errors.pageNumber ? "is-invalid" : ""}`}
                          placeholder="Enter Page Number"
                        />
                       
                      </div>
                    </Col>
                    <Col lg={4}>
                      <div className="mb-3">
                        <Label>ISSXL</Label>
                        <Input
                          type="text"
                          name="issxl"
                          value={validation.values.issxl}
                          onChange={validation.handleChange}
                          className={`form-control ${validation.touched.issxl && validation.errors.issxl ? "is-invalid" : ""}`}
                          placeholder="Enter ISSXL"
                        />
                        
                      </div>
                    </Col>
                    <Col lg={4}>
                      <div className="mb-3">
                        <Label>DOI</Label>
                        <Input
                          type="text"
                          name="doi"
                          value={validation.values.doi}
                          onChange={validation.handleChange}
                          className={`form-control ${validation.touched.doi && validation.errors.doi ? "is-invalid" : ""}`}
                          placeholder="Enter DOI"
                        />
                       
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
                        
                      </div>
                    </Col>
                    <Col lg={4}>
                      <div className="mb-3">
                        <Label>Research Article Upload</Label>
                        <Input
                          type="file"
                          name="researchArticleUpload"
                          onChange={(event) => {
                            const file = event.currentTarget.files?.[0] || null;
                            validation.setFieldValue("researchArticleUpload", file);
                          }}
                          className={`form-control ${validation.touched.researchArticleUpload && validation.errors.researchArticleUpload ? "is-invalid" : ""}`}
                        />
                        
                      </div>
                    </Col>
                  </Row>
                )}

                {selectedType === "Book Chapters/Books" && (
                  <Row>
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
                        
                      </div>
                    </Col>
                  </Row>
                )}
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