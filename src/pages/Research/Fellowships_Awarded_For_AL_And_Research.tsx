import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Col, Row, Input, Label, Button, CardBody, Card, Container, Nav, NavItem, NavLink, TabContent, TabPane, Modal, ModalBody, Table, ModalHeader } from "reactstrap";
import Breadcrumb from 'Components/Common/Breadcrumb';
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";

const Fellowships_Awarded_For_AL_And_Research = () => {
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isMultidisciplinary, setIsMultidisciplinary] = useState<string>("No");
  const [activeTab, setActiveTab] = useState<string>("1");
  // State variable for managing the modal for listing BOS
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State variable for managing edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  // State variable for managing the list of BOS data
  const [mfpData, setMfpData] = useState<any[]>([]);
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
  const [filteredData, setFilteredData] = useState(mfpData);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = mfpData.filter((row) =>
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

    const filtered = mfpData.filter((row) =>
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

  const validationSchema = Yup.object({
    academicYear: Yup.object<{ value: string; label: string }>().nullable().required("Please select academic year"),
    stream: Yup.object<{ value: string; label: string }>().nullable().required("Please select school"),
    department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
    otherDepartment: Yup.string().when("department", (department: any, schema) => {
      return department?.value === "Others"
        ? schema.required("Please specify the department")
        : schema;
    }),
    facultyName: Yup.string().required("Please enter faculty name"),
    projectTitle: Yup.string().required("Please enter project title"),
    amount: Yup.number()
      .typeError("Please enter a valid number")
      .min(0, "Amount cannot be less than 0")
      .required("Please enter the amount"),
    monthOfGrant: Yup.string().required("Please enter the month of grant"),
    typeOfFunding: Yup.object<{ value: string; label: string }>().nullable().required("Please select type of funding"),
    principalInvestigator: isMultidisciplinary === "Yes" && activeTab === "1"
      ? Yup.object({
        name: Yup.string().required("Please enter name"),
        qualification: Yup.string().required("Please enter qualification"),
        designation: Yup.string().required("Please enter designation"),
        department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
        date: Yup.date().required("Please select a date"),
        abstractFile: Yup.mixed().required("Please upload the abstract file"),
        sanctionOrderFile: Yup.mixed().required("Please upload the sanction order file"),
      })
      : Yup.object(),
    coInvestigator: isMultidisciplinary === "Yes" && activeTab === "2"
      ? Yup.object({
        name: Yup.string().required("Please enter name"),
        qualification: Yup.string().required("Please enter qualification"),
        designation: Yup.string().required("Please enter designation"),
        department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
        abstractFile: Yup.mixed().required("Please upload the abstract file"),
        sanctionOrderFile: Yup.mixed().required("Please upload the sanction order file"),
        fellowshipFile: Yup.mixed().required("Please upload the fellowship file"),
      })
      : Yup.object(),
  });

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      facultyName: "",
      projectTitle: "",
      amount: "",
      monthOfGrant: "",
      typeOfFunding: null as { value: string; label: string } | null,
      principalInvestigator: {
        name: "",
        qualification: "",
        designation: "",
        department: null as { value: string; label: string } | null,
        date: "",
        abstractFile: null as File | null,
        sanctionOrderFile: null as File | null,
      },
      coInvestigator: {
        name: "",
        qualification: "",
        designation: "",
        department: null as { value: string; label: string } | null,
        abstractFile: null as File | null,
        sanctionOrderFile: null as File | null,
        fellowshipFile: null as File | null,
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log("Form Submitted:", values);
    },
  });

  // Open the modal and fetch data
  const handleListMFPClick = () => {
    toggleModal();

  };

  const renderPrincipalInvestigatorDepartmentDropdown = () => (
    <Input
      type="select"
      name="principalInvestigator.department"
      value={validation.values.principalInvestigator.department?.value || ""}
      onChange={(e) =>
        validation.setFieldValue("principalInvestigator.department", { value: e.target.value, label: e.target.value })
      }
      className={`form-control ${validation.touched.principalInvestigator?.department && validation.errors.principalInvestigator?.department ? "is-invalid" : ""}`}
    >
      <option value="">Select Department</option>
      <option value="Computer Science">Computer Science</option>
      <option value="Mathematics">Mathematics</option>
      <option value="Physics">Physics</option>
      <option value="Chemistry">Chemistry</option>
      <option value="Others">Others</option>
    </Input>
  );

  const renderCoInvestigatorDepartmentDropdown = () => (
    <Input
      type="select"
      name="coInvestigator.department"
      value={validation.values.coInvestigator.department?.value || ""}
      onChange={(e) =>
        validation.setFieldValue("coInvestigator.department", { value: e.target.value, label: e.target.value })
      }
      className={`form-control ${validation.touched.coInvestigator?.department && validation.errors.coInvestigator?.department ? "is-invalid" : ""}`}
    >
      <option value="">Select Department</option>
      <option value="Biology">Biology</option>
      <option value="Economics">Economics</option>
      <option value="History">History</option>
      <option value="Geography">Geography</option>
      <option value="Others">Others</option>
    </Input>
  );

  const renderPrincipalInvestigatorForm = () => (
    <Row>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Name</Label>
          <Input
            type="text"
            name="principalInvestigator.name"
            value={validation.values.principalInvestigator.name}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.principalInvestigator?.name && validation.errors.principalInvestigator?.name ? "is-invalid" : ""}`}
            placeholder="Enter Name"
          />
          {validation.touched.principalInvestigator?.name && validation.errors.principalInvestigator?.name && (
            <div className="text-danger">{validation.errors.principalInvestigator.name}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Qualification</Label>
          <Input
            type="text"
            name="principalInvestigator.qualification"
            value={validation.values.principalInvestigator.qualification}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.principalInvestigator?.qualification && validation.errors.principalInvestigator?.qualification ? "is-invalid" : ""}`}
            placeholder="Enter Qualification"
          />
          {validation.touched.principalInvestigator?.qualification && validation.errors.principalInvestigator?.qualification && (
            <div className="text-danger">{validation.errors.principalInvestigator.qualification}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Designation</Label>
          <Input
            type="text"
            name="principalInvestigator.designation"
            value={validation.values.principalInvestigator.designation}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.principalInvestigator?.designation && validation.errors.principalInvestigator?.designation ? "is-invalid" : ""}`}
            placeholder="Enter Designation"
          />
          {validation.touched.principalInvestigator?.designation && validation.errors.principalInvestigator?.designation && (
            <div className="text-danger">{validation.errors.principalInvestigator.designation}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Department</Label>
          {renderPrincipalInvestigatorDepartmentDropdown()}
          {validation.touched.principalInvestigator?.department && validation.errors.principalInvestigator?.department && (
            <div className="text-danger">{validation.errors.principalInvestigator.department}</div>
          )}
        </div>
      </Col>

      <Col lg={4}>
        <div className="mb-3">
          <Label>Enter Date</Label>
          <Input
            type="date"
            name="principalInvestigator.date"
            value={validation.values.principalInvestigator.date}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.principalInvestigator?.date && validation.errors.principalInvestigator?.date ? "is-invalid" : ""}`}
          />
          {validation.touched.principalInvestigator?.date && validation.errors.principalInvestigator?.date && (
            <div className="text-danger">{validation.errors.principalInvestigator.date}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Abstract of the Project</Label>
          <Input
            type="file"
            name="principalInvestigator.abstractFile"
            onChange={(event) => validation.setFieldValue("principalInvestigator.abstractFile", event.currentTarget.files?.[0] || null)}
            className={`form-control ${validation.touched.principalInvestigator?.abstractFile && validation.errors.principalInvestigator?.abstractFile ? "is-invalid" : ""}`}
          />
          {validation.touched.principalInvestigator?.abstractFile && validation.errors.principalInvestigator?.abstractFile && (
            <div className="text-danger">{validation.errors.principalInvestigator.abstractFile}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Sanction Order</Label>
          <Input
            type="file"
            name="principalInvestigator.sanctionOrderFile"
            onChange={(event) => validation.setFieldValue("principalInvestigator.sanctionOrderFile", event.currentTarget.files?.[0] || null)}
            className={`form-control ${validation.touched.principalInvestigator?.sanctionOrderFile && validation.errors.principalInvestigator?.sanctionOrderFile ? "is-invalid" : ""}`}
          />
          {validation.touched.principalInvestigator?.sanctionOrderFile && validation.errors.principalInvestigator?.sanctionOrderFile && (
            <div className="text-danger">{validation.errors.principalInvestigator.sanctionOrderFile}</div>
          )}
        </div>
      </Col>
    </Row>
  );

  const renderCoInvestigatorForm = () => (
    <Row>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Name</Label>
          <Input
            type="text"
            name="coInvestigator.name"
            value={validation.values.coInvestigator.name}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.coInvestigator?.name && validation.errors.coInvestigator?.name ? "is-invalid" : ""}`}
            placeholder="Enter Name"
          />
          {validation.touched.coInvestigator?.name && validation.errors.coInvestigator?.name && (
            <div className="text-danger">{validation.errors.coInvestigator.name}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Qualification</Label>
          <Input
            type="text"
            name="coInvestigator.qualification"
            value={validation.values.coInvestigator.qualification}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.coInvestigator?.qualification && validation.errors.coInvestigator?.qualification ? "is-invalid" : ""}`}
            placeholder="Enter Qualification"
          />
          {validation.touched.coInvestigator?.qualification && validation.errors.coInvestigator?.qualification && (
            <div className="text-danger">{validation.errors.coInvestigator.qualification}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Designation</Label>
          <Input
            type="text"
            name="coInvestigator.designation"
            value={validation.values.coInvestigator.designation}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.coInvestigator?.designation && validation.errors.coInvestigator?.designation ? "is-invalid" : ""}`}
            placeholder="Enter Designation"
          />
          {validation.touched.coInvestigator?.designation && validation.errors.coInvestigator?.designation && (
            <div className="text-danger">{validation.errors.coInvestigator.designation}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Department</Label>
          {renderCoInvestigatorDepartmentDropdown()}
          {validation.touched.coInvestigator?.department && validation.errors.coInvestigator?.department && (
            <div className="text-danger">{validation.errors.coInvestigator.department}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Abstract of the Project</Label>
          <Input
            type="file"
            name="coInvestigator.abstractFile"
            onChange={(event) => validation.setFieldValue("coInvestigator.abstractFile", event.currentTarget.files?.[0] || null)}
            className={`form-control ${validation.touched.coInvestigator?.abstractFile && validation.errors.coInvestigator?.abstractFile ? "is-invalid" : ""}`}
          />
          {validation.touched.coInvestigator?.abstractFile && validation.errors.coInvestigator?.abstractFile && (
            <div className="text-danger">{validation.errors.coInvestigator.abstractFile}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Sanction Order</Label>
          <Input
            type="file"
            name="coInvestigator.sanctionOrderFile"
            onChange={(event) => validation.setFieldValue("coInvestigator.sanctionOrderFile", event.currentTarget.files?.[0] || null)}
            className={`form-control ${validation.touched.coInvestigator?.sanctionOrderFile && validation.errors.coInvestigator?.sanctionOrderFile ? "is-invalid" : ""}`}
          />
          {validation.touched.coInvestigator?.sanctionOrderFile && validation.errors.coInvestigator?.sanctionOrderFile && (
            <div className="text-danger">{validation.errors.coInvestigator.sanctionOrderFile}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Fellowship</Label>
          <Input
            type="file"
            name="coInvestigator.fellowshipFile"
            onChange={(event) => validation.setFieldValue("coInvestigator.fellowshipFile", event.currentTarget.files?.[0] || null)}
            className={`form-control ${validation.touched.coInvestigator?.fellowshipFile && validation.errors.coInvestigator?.fellowshipFile ? "is-invalid" : ""}`}
          />
          {validation.touched.coInvestigator?.fellowshipFile && validation.errors.coInvestigator?.fellowshipFile && (
            <div className="text-danger">{validation.errors.coInvestigator.fellowshipFile}</div>
          )}
        </div>
      </Col>
    </Row>
  );

  function handleEdit(bosDataId: any): void {
    const selectedData = mfpData.find((data) => data.bosDataId === bosDataId);
    if (selectedData) {
      // Populate the form with the selected data for editing
      validation.setValues({
        academicYear: { value: selectedData.academicYear, label: selectedData.academicYear },
        stream: { value: selectedData.streamName, label: selectedData.streamName },
        department: { value: selectedData.departmentName, label: selectedData.departmentName },
        otherDepartment: selectedData.otherDepartment || "",
        facultyName: selectedData.facultyName || "",
        projectTitle: selectedData.projectTitle || "",
        amount: selectedData.amount || "",
        monthOfGrant: selectedData.monthOfGrant || "",
        typeOfFunding: { value: selectedData.typeOfFunding, label: selectedData.typeOfFunding },
        principalInvestigator: selectedData.principalInvestigator || {
          name: "",
          qualification: "",
          designation: "",
          department: null,
          date: "",
          abstractFile: null,
          sanctionOrderFile: null,
        },
        coInvestigator: selectedData.coInvestigator || {
          name: "",
          qualification: "",
          designation: "",
          department: null,
          abstractFile: null,
          sanctionOrderFile: null,
          fellowshipFile: null,
        },
      });
      // Optionally scroll to the form or highlight it for the user
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      console.error("Data not found for the given ID:", bosDataId);
    }
  }

  function handleDelete(bosDataId: any): void {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (confirmDelete) {
      const updatedData = mfpData.filter((data) => data.bosDataId !== bosDataId);
      setMfpData(updatedData);
      setFilteredData(updatedData);
      alert("Record deleted successfully.");
    }
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Research" breadcrumbItem="Management_Funded_Project" />
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

                  {/* School Dropdown */}
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
                        value={validation.values.facultyName}
                        onChange={(e) => validation.setFieldValue("facultyName", e.target.value)}
                        className={`form-control ${validation.touched.facultyName && validation.errors.facultyName ? "is-invalid" : ""
                          }`}
                        placeholder="Enter Faculty Name"
                      />
                      {validation.touched.facultyName && validation.errors.facultyName && (
                        <div className="text-danger">{validation.errors.facultyName}</div>
                      )}
                    </div>
                  </Col>

                  {/* Title of the Project */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Title of the Project</Label>
                      <Input
                        type="text"
                        value={validation.values.projectTitle}
                        onChange={(e) => validation.setFieldValue("projectTitle", e.target.value)}
                        className={`form-control ${validation.touched.projectTitle && validation.errors.projectTitle ? "is-invalid" : ""
                          }`}
                        placeholder="Enter Project Title"
                      />
                      {validation.touched.projectTitle && validation.errors.projectTitle && (
                        <div className="text-danger">{validation.errors.projectTitle}</div>
                      )}
                    </div>
                  </Col>

                  {/* Amount */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        value={validation.values.amount}
                        onChange={(e) => validation.setFieldValue("amount", e.target.value)}
                        className={`form-control ${validation.touched.amount && validation.errors.amount ? "is-invalid" : ""
                          }`}
                        placeholder="Enter Amount"
                      />
                      {validation.touched.amount && validation.errors.amount && (
                        <div className="text-danger">{validation.errors.amount}</div>
                      )}
                    </div>
                  </Col>

                  {/* Month of Grant */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Month of Grant</Label>
                      <Input
                        type="text"
                        value={validation.values.monthOfGrant}
                        onChange={(e) => validation.setFieldValue("monthOfGrant", e.target.value)}
                        className={`form-control ${validation.touched.monthOfGrant && validation.errors.monthOfGrant ? "is-invalid" : ""
                          }`}
                        placeholder="Enter Month of Grant"
                      />
                      {validation.touched.monthOfGrant && validation.errors.monthOfGrant && (
                        <div className="text-danger">{validation.errors.monthOfGrant}</div>
                      )}
                    </div>
                  </Col>

                  {/* Type of Funding Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Type of Funding</Label>
                      <Input
                        type="select"
                        value={validation.values.typeOfFunding?.value || ""}
                        onChange={(e) =>
                          validation.setFieldValue("typeOfFunding", { value: e.target.value, label: e.target.value })
                        }
                        className={`form-control ${validation.touched.typeOfFunding && validation.errors.typeOfFunding ? "is-invalid" : ""
                          }`}
                      >
                        <option value="">Select Type of Funding</option>
                        <option value="Management">Management</option>
                        <option value="External Funding Agency">External Funding Agency</option>
                      </Input>
                      {validation.touched.typeOfFunding && validation.errors.typeOfFunding && (
                        <div className="text-danger">{validation.errors.typeOfFunding}</div>
                      )}
                    </div>
                  </Col>
                  {/* Multidisciplinary Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Multidisciplinary</Label>
                      <Input
                        type="select"
                        value={isMultidisciplinary}
                        onChange={(e) => setIsMultidisciplinary(e.target.value)}
                        className="form-control"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </Input>
                    </div>
                  </Col>
                </Row>
                {isMultidisciplinary === "Yes" && (
                  <div>
                    <Nav tabs>
                      <NavItem>
                        <NavLink
                          className={activeTab === "1" ? "active" : ""}
                          onClick={() => setActiveTab("1")}
                        >
                          Principal Investigator Details
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={activeTab === "2" ? "active" : ""}
                          onClick={() => setActiveTab("2")}
                        >
                          Co-Investigator Details
                        </NavLink>
                      </NavItem>
                    </Nav>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId="1">{renderPrincipalInvestigatorForm()}</TabPane>
                      <TabPane tabId="2">{renderCoInvestigatorForm()}</TabPane>
                    </TabContent>
                  </div>
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
                        onClick={handleListMFPClick}
                      >
                        List FA_AL_Research
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
      </div>
      {/* Modal for Listing BOS */}
      <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg" style={{ maxWidth: "100%", width: "auto" }}>
        <ModalHeader toggle={toggleModal}>List Fellowships Awarded for AL and Research</ModalHeader>
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
    </React.Fragment>
  );
};

export default Fellowships_Awarded_For_AL_And_Research;