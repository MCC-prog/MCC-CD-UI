import axios from "axios";
import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import Select from "react-select";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import { useFormik } from "formik";
import React, { useState } from "react";
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
import { toast, ToastContainer } from "react-toastify";
import moment from "moment";

const api = new APIClient();

const Professor_Practice: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bosData, setBosData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(bosData);
  const [filters, setFilters] = useState({
    facultyType: "",
    name: "",
    stream: "",
    department: "",
    designation: "",
    qualification: "",
    vidwaanId: "",
    dateOfJoining: "",
    academicExp: "",
    industryExp: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch BOS data from the backend
  const fetchBosData = async () => {
    try {
      const response = await axios.get(
        "/teacherDetails/getAllClassRoomTools?screenName=PROFESSORPRACTICE"
      ); // Replace with your backend API endpoint
      setBosData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching BOS data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListTeachersClick = () => {
    toggleModal();
    fetchBosData();
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
        `/teacherDetails/edit?id=${id}&screenName=PROFESSORPRACTICE`,
        ""
      );
      if (!response) {
        toast.error("No data found for the selected ID.");
        return;
      }

      // Map API response to Formik values
      const mappedValues = {
        facultyType: mapValueToLabel(
          response.facultyType,
          facultyType // Assuming you have a facultyType options array
        ),
        designation: mapValueToLabel(
          response.designation,
          designationType // Assuming you have a designationType options array
        ),
        stream: mapValueToLabel(response.streamId, []), // Assuming you have a stream options array
        department: mapValueToLabel(
          response.departmentId,
          [] // Assuming you have a department options array
        ),
        otherDepartment: response.otherDepartment || "",
        academicExp: response.academicExperience || "",
        industryExp: response.industrialExperience || "",
        name: response.name || "",
        qualification: response.qualification || "",
        dateOfJoining: response.joiningDate ? response.joiningDate : "",
        vidwaanId: response.vidwanId || "",
      };
      const streamOption = mapValueToLabel(response.streamId, []); // Replace [] with stream options array if available
      const departmentOption = mapValueToLabel(response.departmentId, []); // Replace [] with department options array if available
      // Update Formik values
      validation.setValues({
        ...mappedValues,
        facultyType: mapValueToLabel(response.facultyType, facultyType),
        designation: mapValueToLabel(response.designation, designationType),
        stream: mapValueToLabel(response.streamName, []), // Replace [] with stream options array if available
        department: mapValueToLabel(
          response.departmentName,
          [] // Replace [] with department options array if available
        ),
        otherDepartment: response.otherDepartment || "",
        academicExp: response.academicExperience || "",
        industryExp: response.industrialExperience || "",
        name: response.name || "",
        qualification: response.qualification || "",
        vidwaanId: response.vidwanId || "",
      });
      setSelectedStream(streamOption);
      setSelectedDepartment(departmentOption);
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
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
        const response = await api.delete(
          `/teacherDetails/deleteClassRoomTools?id=${id}&screenName=PROFESSORPRACTICE`,
          ""
        );
        toast.success(
          response.message || "Professor of Practice removed successfully!"
        );
        fetchBosData();
      } catch (error) {
        toast.error(
          "Failed to remove Professor of Practice. Please try again."
        );
        console.error("Error deleting BOS:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };
  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
  };

  const facultyType = [
    { value: "FT", label: "Full-Time" },
    { value: "POP", label: "Proffessor of Practice" },
    { value: "GF", label: "Guest Faculty" },
    { value: "VF", label: "Visiting Faculty" },
  ];

  const designationType = [
    { value: "Lecturer", label: "Lecturer" },
    { value: "Assistant Proffessor", label: "Assistant Proffessor" },
    { value: "Associate Proffessor", label: "Associate Proffessor" },
  ];

  const validation = useFormik({
    initialValues: {
      facultyType: null as { value: string | number; label: string } | null,
      designation: null as { value: string | number; label: string } | null,
      stream: null as { value: string | number; label: string } | null,
      department: null as { value: string | number; label: string } | null,
      otherDepartment: "",
      academicExp: "",
      industryExp: "",
      name: "",
      qualification: "",
      dateOfJoining: "",
      vidwaanId: "",
    },
    validationSchema: Yup.object({
      facultyType: Yup.object()
        .nullable()
        .required("Please select faculty type"),
      name: Yup.string().required("Please enter name"),
      stream: Yup.object().nullable().required("Please select school"),
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
      designation: Yup.object()
        .nullable()
        .required("Please select designation"),
      industryExp: Yup.number()
        .typeError("Please enter a valid number")
        .min(0, "Percentage cannot be less than 0")
        .max(100, "Percentage cannot be more than 100")
        .required("Please enter industry experience"),
      academicExp: Yup.number()
        .typeError("Please enter a valid number")
        .min(0, "Percentage cannot be less than 0")
        .max(100, "Percentage cannot be more than 100")
        .required("Please enter academic experience"),
      qualification: Yup.string().required("Please enter qualification"),
      vidwaanId: Yup.string().required("Please enter vidwaanId"),
      dateOfJoining: Yup.string().required("Please select date"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        screenName: "PROFESSORPRACTICE",
        facultyType: values.facultyType?.value || "",
        name: values.name,
        streamId: selectedStream?.value || 0,
        departmentId: selectedDepartment?.value || 0,
        designation: values.designation?.value || "",
        qualification: values.qualification,
        joiningDate: values.dateOfJoining || "",
        academicExperience: values.academicExp || 0,
        industrialExperience: values.industryExp || 0,
        vidwanId: values.vidwaanId,
      };

      // If editing, include the ID
      if (isEditMode && editId) {
        payload["teacherDetailsId"] = editId;
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/teacherDetails/update`, payload);
          toast.success(
            response.message || "Professor of Practice updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create("/teacherDetails/save", payload);
          toast.success(
            response.message || "Professor of Practice added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        handleListTeachersClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Professor of Practice. Please try again.");
        console.error("Error creating BOS:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Staff Profile"
            breadcrumbItem="Professor of Practice"
          />
          <Card>
            <CardBody>
              <form onSubmit={validation.handleSubmit}>
                <Row>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Faculty Type</Label>
                      <Select
                        options={facultyType}
                        value={validation.values.facultyType}
                        onChange={(selectedOptions) =>
                          validation.setFieldValue(
                            "facultyType",
                            selectedOptions
                          )
                        }
                        placeholder="Select Faculty Type"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.facultyType &&
                          validation.errors.facultyType
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.facultyType &&
                        validation.errors.facultyType && (
                          <div className="text-danger">
                            {validation.errors.facultyType}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Name</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.name && validation.errors.name
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.name}
                        onChange={(e) =>
                          validation.setFieldValue("name", e.target.value)
                        }
                        placeholder="Enter Name"
                      />
                      {validation.touched.name && validation.errors.name && (
                        <div className="text-danger">
                          {validation.errors.name}
                        </div>
                      )}
                    </div>
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

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Designation</Label>
                      <Select
                        options={designationType}
                        value={validation.values.designation}
                        onChange={(selectedOptions) =>
                          validation.setFieldValue(
                            "designation",
                            selectedOptions
                          )
                        }
                        placeholder="Select designation"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.designation &&
                          validation.errors.designation
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.designation &&
                        validation.errors.designation && (
                          <div className="text-danger">
                            {validation.errors.designation}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Qualification</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.qualification &&
                          validation.errors.qualification
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.qualification}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "qualification",
                            e.target.value
                          )
                        }
                        placeholder="Enter qualification"
                      />
                      {validation.touched.qualification &&
                        validation.errors.qualification && (
                          <div className="text-danger">
                            {validation.errors.qualification}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Date of Joining</Label>
                      <Input
                        type="date"
                        className={`form-control ${
                          validation.touched.dateOfJoining &&
                          validation.errors.dateOfJoining
                            ? "is-invalid"
                            : ""
                        }`}
                        value={
                          validation.values.dateOfJoining
                            ? moment(
                                validation.values.dateOfJoining,
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
                            "dateOfJoining",
                            formattedDate
                          );
                        }}
                        placeholder="dd/mm/yyyy"
                      />
                      {validation.touched.dateOfJoining &&
                        validation.errors.dateOfJoining && (
                          <div className="text-danger">
                            {validation.errors.dateOfJoining}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Academic Experience</Label>
                      <Input
                        type="number"
                        className={`form-control ${
                          validation.touched.academicExp &&
                          validation.errors.academicExp
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.academicExp}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "academicExp",
                            e.target.value
                          )
                        }
                        placeholder="Enter academic experience"
                      />
                      {validation.touched.academicExp &&
                        validation.errors.academicExp && (
                          <div className="text-danger">
                            {validation.errors.academicExp}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Industry Experience</Label>
                      <Input
                        type="number"
                        className={`form-control ${
                          validation.touched.industryExp &&
                          validation.errors.industryExp
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.industryExp}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "industryExp",
                            e.target.value
                          )
                        }
                        placeholder="Enter industry experience"
                      />
                      {validation.touched.industryExp &&
                        validation.errors.industryExp && (
                          <div className="text-danger">
                            {validation.errors.industryExp}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>VIDWAAN ID</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.vidwaanId &&
                          validation.errors.vidwaanId
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.vidwaanId}
                        onChange={(e) =>
                          validation.setFieldValue("vidwaanId", e.target.value)
                        }
                        placeholder="Enter vidwaanId"
                      />
                      {validation.touched.vidwaanId &&
                        validation.errors.vidwaanId && (
                          <div className="text-danger">
                            {validation.errors.vidwaanId}
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
                        onClick={handleListTeachersClick}
                      >
                        List
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing BOS */}
        <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>
            List Professor Practice
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
            <Table className="table-hover custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>
                    Faculty Type
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.facultyType}
                      onChange={(e) => handleFilterChange(e, "facultyType")}
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
                  <th>
                    School
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
                    Designation
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.designation}
                      onChange={(e) => handleFilterChange(e, "designation")}
                    />
                  </th>
                  <th>
                    VIDWAAN ID
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.vidwaanId}
                      onChange={(e) => handleFilterChange(e, "vidwaanId")}
                    />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((bos, index) => (
                    <tr key={bos.teacherDetailsId}>
                      <td>{index + 1}</td>
                      <td>{bos.facultyType}</td>
                      <td>{bos.name}</td>
                      <td>{bos.streamName}</td>
                      <td>{bos.departmentName}</td>
                      <td>{bos.designation}</td>
                      <td>{bos.vidwanId}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEdit(bos.teacherDetailsId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(bos.teacherDetailsId)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">
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

export default Professor_Practice;
