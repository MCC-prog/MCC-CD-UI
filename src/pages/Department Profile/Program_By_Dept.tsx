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

const Program_By_Dept: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [programDeptData, setProgramDeptData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(programDeptData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    academicYear: "",
    ug: "",
    pg: "",
    phd: "",
    stream: "",
  });

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = programDeptData.filter((row) =>
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

    const filtered = programDeptData.filter((row) =>
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
  // Fetch Program offered by the dept from the backend
  const fetchprogramDeptData = async () => {
    try {
      const response = await axios.get(
        "/programsOfferedByDept/getAllProgramsOfferedByDept"
      ); // Replace with your backend API endpoint
      setProgramDeptData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Program offered by the dept:", error);
    }
  };

  // Open the modal and fetch data
  const handlePBDList = () => {
    toggleModal();
    fetchprogramDeptData();
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
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/programsOfferedByDept?programsOfferedByDeptId=${id}`,
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
        ug: response.ug || "",
        pg: response.pg || "",
        phd: response.phd || "",
      };

      // Update Formik values
      validation.setValues({
        ...mappedValues,
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
        stream: mappedValues.stream
          ? {
              value: String(mappedValues.stream.value),
              label: mappedValues.stream.label || "",
            }
          : null,
        ug: response.ug || "",
        pg: response.pg || "",
        phd: response.phd || "",
      });
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error("Error fetching Program offered by the dept by ID:", error);
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the Program offered by the dept
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/programsOfferedByDept/deleteNewCoursesIntroduced?programsOfferedByDeptId=${id}`,
          ""
        );
        toast.success(
          response.message ||
            "Program offered by the dept removed successfully!"
        );
        fetchprogramDeptData();
      } catch (error) {
        toast.error(
          "Failed to remove Program offered by the dept. Please try again."
        );
        console.error("Error deleting Program offered by the dept:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  interface OptionType {
    value: string | number;
    label: string;
  }

  const validation = useFormik({
    initialValues: {
      academicYear: null as OptionType | null,
      ug: "",
      pg: "",
      phd: "",
      stream: null as OptionType | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .shape({
          value: Yup.mixed().required(),
          label: Yup.string().required(),
        })
        .nullable()
        .required("Please select academic year"),
      stream: Yup.object()
        .shape({
          value: Yup.mixed().required(),
          label: Yup.string().required(),
        })
        .nullable()
        .required("Please select stream"),
      ug: Yup.string().required("Please enter ug"),
      pg: Yup.string().required("Please enter pg"),
      phd: Yup.string().required("Please enter ph.d"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append(
          "academicYear",
          values.academicYear?.value ? String(values.academicYear.value) : ""
        );
        formData.append(
          "streamId",
          values.stream?.value ? String(values.stream.value) : ""
        );
        formData.append("ug", values.ug || "");
        formData.append("pg", values.pg || "");
        formData.append("phd", values.phd || "");

        // If editing, include ID
        if (isEditMode && editId) {
          formData.append("id", editId);
        }
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/programsOfferedByDept`, formData);
          toast.success(
            response.message ||
              "Program offered by the dept updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create("/programsOfferedByDept", formData);
          toast.success(
            response.message ||
              "Program offered by the dept added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the Program offered by the dept List
        handlePBDList();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Program offered by the dept. Please try again."
        );
        console.error("Error creating Program offered by the dept:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Department Profile"
            breadcrumbItem="Program offered by the dept"
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
                        UG
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.ug && validation.errors.ug
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="ug"
                        onChange={(e) =>
                          validation.setFieldValue("ug", e.target.value)
                        }
                        placeholder="Enter UG"
                        value={validation.values.ug}
                      />
                      {validation.touched.ug && validation.errors.ug && (
                        <div className="text-danger">
                          {validation.errors.ug}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        PG
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.pg && validation.errors.pg
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="pg"
                        onChange={(e) =>
                          validation.setFieldValue("pg", e.target.value)
                        }
                        placeholder="Enter PG"
                        value={validation.values.pg}
                      />
                      {validation.touched.pg && validation.errors.pg && (
                        <div className="text-danger">
                          {validation.errors.pg}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Ph.D
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.phd && validation.errors.phd
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="phd"
                        onChange={(e) =>
                          validation.setFieldValue("phd", e.target.value)
                        }
                        placeholder="Enter Ph.D"
                        value={validation.values.phd}
                      />
                      {validation.touched.phd && validation.errors.phd && (
                        <div className="text-danger">
                          {validation.errors.phd}
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
                        onClick={handlePBDList}
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
        {/* Modal for Listing Program offered by the dept */}
        <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>
            List of Program By Dept
          </ModalHeader>
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
                  <th>UG</th>
                  <th>PG</th>
                  <th>Phd</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((pbd, index) => (
                    <tr key={pbd.id}>
                      <td>{index + 1}</td>
                      <td>{pbd.academicYear}</td>
                      <td>{pbd.streamName}</td>
                      <td>{pbd.ug}</td>
                      <td>{pbd.pg}</td>
                      <td>{pbd.phd}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEdit(pbd.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(pbd.id)}
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
                      No Program offered by the dept available.
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

export default Program_By_Dept;
