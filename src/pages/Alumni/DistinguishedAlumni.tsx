import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import { ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Table,
} from "reactstrap";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SEMESTER_NO_OPTIONS } from "../../Components/constants/layout";
import axios from "axios";

const api = new APIClient();

const DistinguishedAlumni: React.FC = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variable for managing file upload status
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  // State variable for managing the modal for listing Alumini
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State variable for managing the list of Alumini data
  const [bosData, setAluminiData] = useState<any[]>([]);
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  // State variable for managing search term and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  // State variable for managing filters
  const [filters, setFilters] = useState({
    academicYear: "",
    name: "",
    registerNumber: "",
    batch: "",
    stream: "",
    department: "",
    programType: "",
    program: "",
    jobRole: ""
  });
  const [filteredData, setFilteredData] = useState(bosData);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [programOptions, setProgramOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await api.get("/getAllProgram", "");
        // Map API response to dropdown options
        const options = response
          .filter((p: any) => p.isOpen) // Only open programs
          .map((p: any) => ({
            value: String(p.id),
            label: `${p.code} - ${p.name}`,
          }));
        setProgramOptions(options);
      } catch (error) {
        console.error("Error fetching programs:", error);
      }
    };
    fetchPrograms();
  }, []);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = bosData.filter((row) =>
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

    const filtered = bosData.filter((row) =>
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

  // Toggle the modal for listing Alumini
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Alumini data from the backend
  const fetchAluminiData = async () => {
    try {
      const response = await api.get("/distinguishAlumniOfTheLastFiveYears/getAllDistinguishAlumniOfTheLastFiveYears", "");
      setAluminiData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Alumini data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListAluminiClick = () => {
    toggleModal();
    fetchAluminiData();
  };

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
  // Fetch the data for the selected Alumini ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(`/distinguishAlumniOfTheLastFiveYears?distinguishAlumniOfTheLastFiveYearsId=${id}`, "");
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

      // Map API response to Formik values
      const mappedValues = {
        academicYear: mapValueToLabel(response.academicYear, academicYearList),
        stream: response.streamId
          ? { value: response.streamId.toString(), label: response.streamName }
          : null,
        department: response.departmentId
          ? {
            value: response.departmentId.toString(),
            label: response.departmentName,
          }
          : null,
        program: response.programId
          ? {
            value: response.programId.toString(),
            label: response.programName,
          } : null,
        otherDepartment: "", // default
        name: response.name || "",
        registerNumber: response.registerNumber || "",
        batch: response.batchId
        ? {
          value: response.batchId.toString(),
          label: response.batchName,
        }
        : null,
        jobRole: response.jobRole
          ? { value: response.jobRole, label: response.jobRole }
          : null,
      };

      // Update Formik values
      validation.setValues({
        ...mappedValues,
        academicYear: mappedValues.academicYear
          ? { ...mappedValues.academicYear, value: String(mappedValues.academicYear.value) }
          : null,
        stream: mappedValues.stream
          ? { ...mappedValues.stream, value: String(mappedValues.stream.value) }
          : null,
        department: mappedValues.department
          ? { ...mappedValues.department, value: String(mappedValues.department.value) }
          : null,
        program: mappedValues.program
          ? { ...mappedValues.program, value: String(mappedValues.program.value) }
          : null,
        batch: mappedValues.batch
          ? { ...mappedValues.batch, value: String(mappedValues.batch.value) }
          : null,
        jobRole: mappedValues.jobRole
          ? { ...mappedValues.jobRole, value: String(mappedValues.jobRole.value) }
          : null,
      });

      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error("Error fetching Alumini data by ID:", error);
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the Alumini data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(`/distinguishAlumniOfTheLastFiveYears/deleteDistinguishAlumniOfTheLastFiveYears?distinguishAlumniOfTheLastFiveYearsId=${id}`, "");
        toast.success(
          response.message || "Curriculum Alumini removed successfully!"
        );
        fetchAluminiData();
      } catch (error) {
        toast.error("Failed to remove Curriculum Alumini. Please try again.");
        console.error("Error deleting Alumini:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  // Formik validation and submission
  // Initialize Formik with validation schema and initial values
  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      program: null as { value: string; label: string } | null,
      name: "",
      registerNumber: "",
      batch: null as { value: string; label: string } | null,
      jobRole: null as { value: string; label: string } | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select academic year"),
      stream: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select school"),
      department: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select department"),
      otherDepartment: Yup.string().when(
        "department",
        (department: any, schema) => {
          return department?.value === "Others"
            ? schema.required("Please specify the department")
            : schema;
        }
      ),
      jobRole: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select job role"),
      name: Yup.string().required("Please enter name"),
      registerNumber: Yup.string().required("Please enter register number"),
      batch: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select batch"),
      program: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select program"),
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append("id", editId || "");
      formData.append("name", values.name || "");
      formData.append("registerNumber", values.registerNumber || "");
      formData.append("batchId", values.batch?.value || "");
      formData.append("jobRole", values.jobRole?.value || "");
      formData.append("programId", values.program?.value || "");

      try {
        const response = isEditMode && editId
          ? await api.put(`/distinguishAlumniOfTheLastFiveYears`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          : await api.create(`/distinguishAlumniOfTheLastFiveYears`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          toast.success(
            response.message || "Curriculum Alumini updated successfully!"
          );
        // Refresh the page data to show the uploaded file
        fetchAluminiData();

        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the Alumini List
        handleListAluminiClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Curriculum Alumini. Please try again.");
        console.error("Error creating Alumini:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Curricuum" breadcrumbItem="Alumini" />
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Name</Label>
                      <Input
                        type="text"
                        name="name"
                        value={validation.values.name || ""}
                        onChange={e => validation.setFieldValue("name", e.target.value)}
                        placeholder="Enter Name"
                        className={validation.touched.name && validation.errors.name ? "is-invalid" : ""}
                      />
                      {validation.touched.name && validation.errors.name && (
                        <div className="text-danger">{validation.errors.name}</div>
                      )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Register Number</Label>
                      <Input
                        type="text"
                        name="registerNumber"
                        value={validation.values.registerNumber || ""}
                        onChange={e => validation.setFieldValue("registerNumber", e.target.value)}
                        placeholder="Enter Register Number"
                        className={validation.touched.registerNumber && validation.errors.registerNumber ? "is-invalid" : ""}
                      />
                      {validation.touched.registerNumber && validation.errors.registerNumber && (
                        <div className="text-danger">{validation.errors.registerNumber}</div>
                      )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Batch</Label>
                      <Input
                        type="select"
                        name="batch"
                        value={validation.values.batch?.value || ""}
                        onChange={e => {
                          const val = e.target.value;
                          const selected = val
                            ? { value: val, label: val }
                            : null;
                          validation.setFieldValue("batch", selected);
                        }}
                        className={validation.touched.batch && validation.errors.batch ? "is-invalid" : ""}
                      >
                        <option value="">Select Batch</option>
                        <option value="2023">b2</option>
                        <option value="2024">b1</option>
                        <option value="2025">b0</option>
                      </Input>
                      {validation.touched.batch && validation.errors.batch && (
                        <div className="text-danger">{validation.errors.batch}</div>
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
                          className={`form-control ${validation.touched.otherDepartment &&
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
                      <Label>Program</Label>
                      <Input
                        type="select"
                        name="program"
                        value={validation.values.program?.value || ""}
                        onChange={e => {
                          const selected = programOptions.find(opt => opt.value === e.target.value) || null;
                          validation.setFieldValue("program", selected);
                        }}
                        className={validation.touched.program && validation.errors.program ? "is-invalid" : ""}
                      >
                        <option value="">Select Program</option>
                        {programOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Input>
                      {validation.touched.program && validation.errors.program && (
                        <div className="text-danger">
                          {Array.isArray(validation.errors.program)
                            ? validation.errors.program.join(", ")
                            : validation.errors.program}
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Job Role</Label>
                      <Input
                        type="select"
                        name="jobRole"
                        value={validation.values.jobRole?.value || ""}
                        onChange={e => {
                          const val = e.target.value;
                          const selected = val
                            ? { value: val, label: val }
                            : null;
                          validation.setFieldValue("jobRole", selected);
                        }}
                        className={validation.touched.jobRole && validation.errors.jobRole ? "is-invalid" : ""}
                      >
                        <option value="">Select Job Role</option>
                        <option value="Higher Education">Higher Education</option>
                        <option value="Company">Company</option>
                      </Input>
                      {validation.touched.jobRole && validation.errors.jobRole && (
                        <div className="text-danger">{validation.errors.jobRole}</div>
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
                        onClick={handleListAluminiClick}
                      >
                        List Alumni
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Alumini */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>List Alumini</ModalHeader>
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
                    Name
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.name}
                      onChange={(e) => handleFilterChange(e, "name")}
                    />
                  </th>
                  <th>Register Number
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.registerNumber}
                      onChange={(e) => handleFilterChange(e, "registerNumber")}
                    />
                  </th>
                  <th>
                    Batch
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.batch}
                      onChange={(e) => handleFilterChange(e, "batch")}
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
                    Program
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.program}
                      onChange={(e) => handleFilterChange(e, "program")}
                    />
                  </th>
                  <th>
                    Job Role
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.jobRole}
                      onChange={(e) => handleFilterChange(e, "jobRole")}
                    />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((alumini, index) => (
                    <tr key={alumini.bosDataId}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{alumini.academicYear}</td>
                      <td>{alumini.name}</td>
                      <td>{alumini.registerNumber}</td>
                      <td>{alumini.batchName}</td>
                      <td>{alumini.streamName}</td>
                      <td>{alumini.departmentName}</td>
                      <td>{alumini.programName}</td>
                      <td>{alumini.jobRole}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(alumini.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(alumini.id)}
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
                      No Alumini data available.
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

export default DistinguishedAlumni;
