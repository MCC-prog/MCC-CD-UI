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
import { toast, ToastContainer } from "react-toastify";
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
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import GetAllDepartmentDropdown from "Components/DropDowns/GetAllDepartmentDropdown";
const api = new APIClient();

const Number_OfBooks_Dept: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noBooksData, setNoBooksData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch BOS data from the backend
  const fetchNoBooksData = async () => {
    try {
      const response = await axios.get(
        "/numberOfBooksInDeptLibrary/getAllNumberOfBooksInDeptLibrary"
      ); // Replace with your backend API endpoint
      setNoBooksData(response);
    } catch (error) {
      console.error("Error fetching BOS data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListNOBDClick = () => {
    toggleModal();
    fetchNoBooksData();
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
        `/numberOfBooksInDeptLibrary?numberOfBooksInDeptLibraryId=${id}`,
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
        department: response.departmentId
          ? {
              value: response.departmentId.toString(),
              label: response.departmentName || "",
            }
          : null,
        NumberOfBooks: response.noOfBooksInDeptLib || "",
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
      console.error(
        "Error fetching Number of books in the department library by ID:",
        error
      );
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the Number of books in the department library
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/numberOfBooksInDeptLibrary/deleteNumberOfBooksInDeptLibrary?numberOfBooksInDeptLibraryId=${id}`,
          ""
        );
        setIsModalOpen(false);
        toast.success(
          response.message ||
            "Number of books in the department library removed successfully!"
        );
        fetchNoBooksData();
      } catch (error) {
        toast.error(
          "Failed to remove Number of books in the department library. Please try again."
        );
        console.error(
          "Error deleting Number of books in the department library:",
          error
        );
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      NumberOfBooks: "",
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select academic year"),
      stream: Yup.object().nullable().required("Please select stream"),
      department: Yup.object().nullable().required("Please select department"),
      NumberOfBooks: Yup.number().required(
        "Please enter Number of books in the department library"
      ),
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
        formData.append("noOfBooksInDeptLib", values.NumberOfBooks || "");
        formData.append(
          "departmentId",
          values.department?.value ? String(values.department.value) : ""
        );

        // If editing, include ID
        if (isEditMode && editId) {
          formData.append("id", editId);
        }
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/numberOfBooksInDeptLibrary`,
            formData
          );
          toast.success(
            response.message ||
              "Number of books in the department library updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/numberOfBooksInDeptLibrary",
            formData
          );
          toast.success(
            response.message ||
              "Number of books in the department library added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the Number of books in the department library List
        handleListNOBDClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Number of books in the department library. Please try again."
        );
        console.error(
          "Error creating Number of books in the department library:",
          error
        );
      }
    },
  });

  useEffect(() => {
    if (noBooksData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
      destroy: true,
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Number_OfBooks_Dept_Data",
          title: "Number of Books in Department Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Number_OfBooks_Dept_Data",
          title: "Number of Books in Department Data Export",
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
  }, [noBooksData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Department Profile"
            breadcrumbItem="Number of books in the department library"
          />
          <Card style={{ minHeight: "350px", overflow: "visible" }}>
            <CardBody style={{ overflow: "visible" }}>
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

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Number of books in the department library
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.NumberOfBooks &&
                          validation.errors.NumberOfBooks
                            ? "is-invalid"
                            : ""
                        }`}
                        type="number"
                        id="NumberOfBooks"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "NumberOfBooks",
                            e.target.value
                          )
                        }
                        value={validation.values.NumberOfBooks}
                        placeholder="Enter Number of books in the department library"
                      />
                      {validation.touched.NumberOfBooks &&
                        validation.errors.NumberOfBooks && (
                          <div className="text-danger">
                            {validation.errors.NumberOfBooks}
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
                        onClick={handleListNOBDClick}
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
        {/* Modal for Listing Number of books in the department library */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List of Number of books in the department library
          </ModalHeader>
          <ModalBody>
            <Table striped bordered hover id="id" innerRef={tableRef}>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>School</th>
                  <th>Department</th>
                  <th>Number of books in the department library</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {noBooksData.length > 0 ? (
                  noBooksData.map((nob, index) => (
                    <tr key={nob.id}>
                      <td>{index + 1}</td>
                      <td>{nob.academicYear}</td>
                      <td>{nob.streamName}</td>
                      <td>{nob.departmentName}</td>
                      <td>{nob.noOfBooksInDeptLib}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(nob.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(nob.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center">
                      No Number of books in the department library available.
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

export default Number_OfBooks_Dept;
