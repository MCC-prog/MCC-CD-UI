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
import { toast, ToastContainer } from "react-toastify";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
const api = new APIClient();

const NumberOfStudents: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nosData, setNOSData] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(nosData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    academicYear: "",
    ug: "",
    pg: "",
  });
  const tableRef = useRef<HTMLTableElement>(null);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = nosData.filter((row) =>
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
  const fetchNOSData = async () => {
    try {
      const response = await axios.get(
        "/studentsEnrolled/getAllStudentsEnrolled"
      ); // Replace with your backend API endpoint
      setNOSData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching BOS data:", error);
    }
  };

  // Open the modal and fetch data
  const handleNOSClick = () => {
    toggleModal();
    fetchNOSData();
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
        `/studentsEnrolled/edit?studentEnrolledId=${id}`,
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
        NumberOfUg: response.ug || "",
        NumberOfPg: response.pg || "",
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
      });
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
          `/studentsEnrolled/deleteStudentsEnrolled?studentEnrolledId=${id}`,
          ""
        );
        toast.success(
          response.message ||
            "Number of Students Enrolled removed successfully!"
        );
        fetchNOSData();
      } catch (error) {
        toast.error(
          "Failed to remove Number of Students Enrolled. Please try again."
        );
        console.error("Error deleting BOS:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  interface FormValues {
    academicYear: { value: string; label: string } | null;
    NumberOfPg: string;
    NumberOfUg: string;
  }

  const validation = useFormik<FormValues>({
    initialValues: {
      academicYear: null,
      NumberOfPg: "",
      NumberOfUg: "",
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .shape({
          value: Yup.string().required(),
          label: Yup.string().required(),
        })
        .nullable()
        .required("Please select academic year"),
      NumberOfPg: Yup.string().required("Please enter PG"),
      NumberOfUg: Yup.string().required("Please enter UG"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        academicYear: values.academicYear?.value || "",
        pg: values.NumberOfPg,
        ug: values.NumberOfUg,
      };

      // If editing, include the ID
      if (isEditMode && editId) {
        payload["studentEnrolledId"] = editId;
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/studentsEnrolled/update`, payload);
          toast.success(
            response.message ||
              "Number of Students Enrolled updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create("/studentsEnrolled/save", payload);
          toast.success(
            response.message ||
              "Number of Students Enrolled added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the BOS List
        handleNOSClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Number of Students Enrolled. Please try again."
        );
        console.error("Error creating BOS:", error);
      }
    },
  });

  useEffect(() => {
    if (nosData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
      destroy: true,
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          exportOptions: {
            columns: ":not(:last-child)",
          },
        },
      ],
    });
    $(".dt-buttons").addClass("mb-3 gap-2");
    $(".buttons-copy").addClass("btn btn-success");
    $(".buttons-csv").addClass("btn btn-info");

    $("#id").on(
      "buttons-action.dt",
      function (e, buttonApi, dataTable, node, config) {
        if (buttonApi.text() === "Copy") {
          toast.success("Copied to clipboard!");
        }
      }
    );

    return () => {
      table.destroy(); // clean up
    };
  }, [nosData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Student Details"
            breadcrumbItem="Number of Students Enrolled"
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
                      <Label>UG</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.NumberOfUg &&
                          validation.errors.NumberOfUg
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.NumberOfUg}
                        onChange={(e) =>
                          validation.setFieldValue("NumberOfUg", e.target.value)
                        }
                        placeholder="Enter UG"
                      />
                      {validation.touched.NumberOfUg &&
                        validation.errors.NumberOfUg && (
                          <div className="text-danger">
                            {validation.errors.NumberOfUg}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>PG</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.NumberOfPg &&
                          validation.errors.NumberOfPg
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.NumberOfPg}
                        onChange={(e) =>
                          validation.setFieldValue("NumberOfPg", e.target.value)
                        }
                        placeholder="Enter PG"
                      />
                      {validation.touched.NumberOfPg &&
                        validation.errors.NumberOfPg && (
                          <div className="text-danger">
                            {validation.errors.NumberOfPg}
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
                        onClick={handleNOSClick}
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
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List of Number of Students
          </ModalHeader>
          <ModalBody>
            <Table striped bordered hover id="id" innerRef={tableRef}>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>UG</th>
                  <th>PG</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((bos, index) => (
                    <tr key={bos.studentEnrolledId}>
                      <td>{index + 1}</td>
                      <td>{bos.academicYear}</td>
                      <td>{bos.ug}</td>
                      <td>{bos.pg}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(bos.studentEnrolledId)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(bos.studentEnrolledId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      No Number of Students Enrolled data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
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

export default NumberOfStudents;
