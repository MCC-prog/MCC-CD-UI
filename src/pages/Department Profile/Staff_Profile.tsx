import axios from "axios";
import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import ProgramDropdown from "Components/DropDowns/ProgramDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
import SemesterDropdowns from "Components/DropDowns/SemesterDropdowns";
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

const api = new APIClient();

const Staff_Profile: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bosData, setBosData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(bosData);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Calculate the paginated data
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch BOS data from the backend
  const fetchBosData = async () => {
    try {
      const response = await axios.get("/staffProfile/getAllStaffProfile"); // Replace with your backend API endpoint
      setBosData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching BOS data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListBosClick = () => {
    toggleModal();
    fetchBosData();
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
  // Fetch the data for the selected BOS ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/staffProfile/edit?staffProfileId=${id}`,
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

      // Map API response to Formik values
      const mappedValues = {
        academicYear: mapValueToLabel(response.academicYear, academicYearList),
        stream: response.streamId
          ? { value: response.streamId.toString(), label: response.streamName }
          : null,
        noOfStaff: response.noOfStaff || "",
        fullTime: response.fullTime || "",
        partTime: response.partTime || "",
        guestFaculty: response.guestFaculty || "",
        professorOfPractice: response.professorOfPractice || "",
      };

      // Update Formik values
      validation.setValues({
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
        stream: mappedValues.stream
          ? { ...mappedValues.stream, value: String(mappedValues.stream.value) }
          : null,
        noOfStaff: response.noOfStaff || "",
        fullTime: response.fullTime || "",
        partTime: response.partTime || "",
        guestFaculty: response.guestFaculty || "",
        professorOfPractice: response.professorOfPractice || "",
      });
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error("Error fetching BOS data by ID:", error);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Call the delete API and refresh the BOS data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/staffProfile/deleteStaffProfile?staffProfileId=${id}`,
          ""
        );
        toast.success(
          response.message || "Staff Profile removed successfully!"
        );
        fetchBosData();
      } catch (error) {
        toast.error("Failed to remove Staff Profile. Please try again.");
        console.error("Error deleting BOS:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      noOfStaff: "",
      fullTime: "",
      partTime: "",
      guestFaculty: "",
      professorOfPractice: "",
      stream: null as { value: string; label: string } | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select academic year"),
      stream: Yup.object().nullable().required("Please select stream"),
      noOfStaff: Yup.string().required("Please enter no of staff"),
      fullTime: Yup.string().required("Please enter full time"),
      partTime: Yup.string().required("Please enter part time"),
      guestFaculty: Yup.string().required("Please enter guest faculty"),
      professorOfPractice: Yup.string().required(
        "Please enter professor of practice"
      ),
    }),
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        academicYear: values.academicYear?.value || "",
        streamId: values.stream?.value || "",
        noOfStaff: values.noOfStaff || "",
        fullTime: values.fullTime || "",
        partTime: values.partTime || "",
        guestFaculty: values.guestFaculty || "",
        professorOfPractice: values.professorOfPractice || "",
      };

      // If editing, include the ID
      if (isEditMode && editId) {
        payload["staffProfileId"] = editId;
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/staffProfile/update`, payload);
          toast.success(
            response.message || "Staff Profile updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create("/staffProfile/save", payload);
          toast.success(
            response.message || "Staff Profile added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the BOS List
        handleListBosClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Staff Profile. Please try again.");
        console.error("Error creating BOS:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Department Profile"
            breadcrumbItem="Staff Profile"
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

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>School</Label>
                      <StreamDropdown
                        value={validation.values.stream}
                        onChange={(selectedOption) => {
                          validation.setFieldValue("stream", selectedOption);
                          setSelectedStream(selectedOption);
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

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        No of Staff
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.noOfStaff &&
                          validation.errors.noOfStaff
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="noOfStaff"
                        onChange={(e) =>
                          validation.setFieldValue("noOfStaff", e.target.value)
                        }
                        placeholder="Enter no of staff"
                        value={validation.values.noOfStaff}
                      />
                      {validation.touched.noOfStaff &&
                        validation.errors.noOfStaff && (
                          <div className="text-danger">
                            {validation.errors.noOfStaff}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Full Time
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.fullTime &&
                          validation.errors.fullTime
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="fullTime"
                        onChange={(e) =>
                          validation.setFieldValue("fullTime", e.target.value)
                        }
                        placeholder="Enter full time"
                        value={validation.values.fullTime}
                      />
                      {validation.touched.fullTime &&
                        validation.errors.fullTime && (
                          <div className="text-danger">
                            {validation.errors.fullTime}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Part Time
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.partTime &&
                          validation.errors.partTime
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="partTime"
                        onChange={(e) =>
                          validation.setFieldValue("partTime", e.target.value)
                        }
                        placeholder="Enter part time"
                        value={validation.values.partTime}
                      />
                      {validation.touched.partTime &&
                        validation.errors.partTime && (
                          <div className="text-danger">
                            {validation.errors.partTime}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Guest Faculty
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.guestFaculty &&
                          validation.errors.guestFaculty
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="guestFaculty"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "guestFaculty",
                            e.target.value
                          )
                        }
                        placeholder="Enter guest faculty"
                        value={validation.values.guestFaculty}
                      />
                      {validation.touched.guestFaculty &&
                        validation.errors.guestFaculty && (
                          <div className="text-danger">
                            {validation.errors.guestFaculty}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Professor of Practice
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.professorOfPractice &&
                          validation.errors.professorOfPractice
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="professorOfPractice"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "professorOfPractice",
                            e.target.value
                          )
                        }
                        placeholder="Enter professor of practice"
                        value={validation.values.professorOfPractice}
                      />
                      {validation.touched.professorOfPractice &&
                        validation.errors.professorOfPractice && (
                          <div className="text-danger">
                            {validation.errors.professorOfPractice}
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
          <ModalHeader toggle={toggleModal}>List Staff Profile</ModalHeader>
          <ModalBody>
            <div className="mb-3">
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <Table
              striped
              bordered
              hover
              responsive
              className="align-middle text-center"
            >
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>Stream</th>
                  <th>No.Of Staff</th>
                  <th>Full Time</th>
                  <th>Part Time</th>
                  <th>Guest Faculty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((bos, index) => (
                    <tr key={bos.id}>
                      <td>{index + 1}</td>
                      <td>{bos.academicYear}</td>
                      <td>{bos.streamName}</td>
                      <td>{bos.noOfStaff}</td>
                      <td>{bos.fullTime}</td>
                      <td>{bos.partTime}</td>
                      <td>{bos.guestFaculty}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEdit(bos.staffProfileId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(bos.staffProfileId)}
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

export default Staff_Profile;
