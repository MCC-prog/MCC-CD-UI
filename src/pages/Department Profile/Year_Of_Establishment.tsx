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
import GetAllDepartmentDropdown from "Components/DropDowns/GetAllDepartmentDropdown";
import GetAllProgramDropdown from "Components/DropDowns/GetAllProgramDropdown";
const api = new APIClient();

const Year_Of_Establishment: React.FC = () => {
  document.title = "MCC - Centralized Data";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bosData, setBosData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(bosData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    academicYear: "",
    yearOfEst: "",
    stream: "",
  });
  const tableRef = useRef<HTMLTableElement>(null);

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
      const response = await axios.get(
        "/establishmentYear/getAllEstablishmentYear"
      ); // Replace with your backend API endpoint
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
        `/establishmentYear/edit?establishmentYearId=${id}`,
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
        // academicYear: mapValueToLabel(response.academicYear, academicYearList),
        yearOfEst: response.yearOfEstablishment || "",
        // stream: response.streamId
        //   ? { value: response.streamId.toString(), label: response.streamName }
        //   : null,
        department: response.departmentId
          ? { value: response.departmentId.toString(), label: response.departmentName }
          : null,
      program: response.courses
          ? Object.entries(response.courses).map(([key, value]) => ({
              value: key,
              label: String(value),
            }))
          : [],
      };

      // Update Formik values
      validation.setValues({
        ...mappedValues,
        department: mappedValues.department
          ? {
            value: String(mappedValues.department.value),
            label: mappedValues.department.label || "",
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
          `/establishmentYear/deleteEstablishmentYear?establishmentYearId=${id}`,
          ""
        );
        setIsModalOpen(false);

        toast.success(
          response.message || "Year of establishment removed successfully!"
        );
        fetchBosData();
      } catch (error) {
        toast.error(
          "Failed to remove Year of establishment. Please try again."
        );
        console.error("Error deleting BOS:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  const validation = useFormik({
    initialValues: {
      yearOfEst: "",
      department: null as { value: string; label: string } | null,
      program: [] as { value: string; label: string }[],
    },
    validationSchema: Yup.object({
      yearOfEst: Yup.number().required("Please enter year of establishment"),
      department: Yup.object().nullable().required("Please select department"),
      program: Yup.array()
        .min(1, "Please select at least one program")
        .required("Please select program"),
    }),
    onSubmit: async (values, { resetForm }) => {
      console.log("✅ Submitting form", values);
      const payload = {
        yearOfEstablishment: values.yearOfEst || "",
        departmentId: values.department?.value || "",
        courseIds: values.program.map((p) => p.value) || [],
      };

      if (isEditMode && editId) payload["establismentYearId"] = editId;

      try {
        const response = isEditMode
          ? await api.put(`/establishmentYear/update`, payload)
          : await api.create(`/establishmentYear/save`, payload);

        toast.success(response.message || "Operation successful!");
        resetForm();
        setIsEditMode(false);
        setEditId(null);
        handleListBosClick();
      } catch (error) {
        toast.error("Failed to save Year of establishment. Please try again.");
        console.error(error);
      }
    },
  });


  useEffect(() => {
    if (bosData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
      destroy: true,
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Year_Of_Establishment_Data",
          title: "Year of Establishment Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Year_Of_Establishment_Data",
          title: "Year of Establishment Data Export",
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
  }, [bosData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Department Profile"
            breadcrumbItem="Year of Establishment"
          />
          <Card style={{ minHeight: "300px", overflow: "visible" }}>
            <CardBody style={{ overflow: "visible" }}>
              <form onSubmit={validation.handleSubmit}>
                <Row>
                  {/* Academic Year Dropdown */}
                  {/* <Col lg={4}>
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
                  </Col> */}

                  {/* <Col lg={4}>
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
                  </Col> */}

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Department</Label>
                      <GetAllDepartmentDropdown
                        value={validation.values.department}
                        onChange={(selectedOption) => {
                          validation.setFieldValue(
                            "department",
                            selectedOption
                          );
                          setSelectedDepartment(selectedOption);
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
                      <Label> Program </Label>
                      <GetAllProgramDropdown
                        value={validation.values.program}
                        onChange={(selectedOption) => {
                          validation.setFieldValue(
                            "program",
                            selectedOption
                          );
                          setSelectedDepartment(selectedOption);
                        }}
                        isInvalid={
                          validation.touched.program &&
                          !!validation.errors.program
                        }
                      />
                      {validation.touched.program &&
                        validation.errors.program && (
                          <div className="text-danger">
                            {typeof validation.errors.program === "string"
                              ? validation.errors.program
                              : Array.isArray(validation.errors.program)
                                ? (validation.errors.program as any).join(", ")
                                : String(validation.errors.program)}
                          </div>
                        )}
                    </div>
                  </Col>


                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Year of Establishment
                      </Label>
                      <Input
                        className={`form-control ${validation.touched.yearOfEst &&
                          validation.errors.yearOfEst
                          ? "is-invalid"
                          : ""
                          }`}
                        type="text"
                        id="yearOfEst"
                        value={validation.values.yearOfEst}
                        onChange={(e) =>
                          validation.setFieldValue("yearOfEst", e.target.value)
                        }
                        placeholder="Enter year of establishment"
                      />
                      {validation.touched.yearOfEst &&
                        validation.errors.yearOfEst && (
                          <div className="text-danger">
                            {validation.errors.yearOfEst}
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
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List of Year of Establishment
          </ModalHeader>
          <ModalBody>
            <Table striped bordered hover id="id" innerRef={tableRef}>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  {/* <th>Academic Year</th>
                  <th>School</th> */}
                  <th>Department</th>
                  <th>Program</th>
                  <th>Year of Establishment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bosData.length > 0 ? (
                  bosData.map((bos, index) => (
                    <tr key={bos.establismentYearId}>
                      <td>{index + 1}</td>
                      {/* <td>{bos.academicYear}</td>
                      <td>{bos.streamName}</td> */}
                      <td>{bos.departmentName}</td>
                     <td>{Object.values(bos.courses).join(", ")}</td>    
                      <td>{bos.yearOfEstablishment}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(bos.establismentYearId)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(bos.establismentYearId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      No Year of Establishment data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </ModalBody>
        </Modal>
        {/* Confirmation Modal */}
        <Modal
        className="delete-popup"
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

export default Year_Of_Establishment;
