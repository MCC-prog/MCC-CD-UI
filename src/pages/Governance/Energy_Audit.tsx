import axios from "axios";
import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
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
  Tooltip,
} from "reactstrap";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "datatables.net-buttons/js/buttons.print.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";

const api = new APIClient();

const EnergyAudit: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [energyAuditData, setEnergyAuditData] = useState<any[]>([]);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(energyAuditData);
  const [filters, setFilters] = useState({
    academicYear: "",
    file: null as string | null,
  });

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const tableRef = useRef<HTMLTableElement>(null);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = energyAuditData.filter((row) =>
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

    const filtered = energyAuditData.filter((row) =>
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

  // Fetch energy audit data from the backend
  const fetchEnergyAuditData = async () => {
    try {
      const response = await axios.get(
        "/governanceEnergyAudit/getAllEnergyAudit"
      ); // Replace with your backend API endpoint
      setEnergyAuditData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching energy audit data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListEnergyAuditClick = () => {
    toggleModal();
    fetchEnergyAuditData();
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
  // Fetch the data for the selected energy audit ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/governanceEnergyAudit/edit?energyAuditId=${id}`,
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
        file: response.document?.energyAudit || null,
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
      // Disable the file upload button if a file exists
      setIsFileUploadDisabled(!!response.document?.energyAudit);
      toggleModal();
    } catch (error) {
      console.error("Error fetching energy audit data by ID:", error);
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the Policy data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/governanceEnergyAudit/deleteEnergyAudit?energyAuditId=${id}`,
          ""
        );
        toast.success(response.message || "Energy Audit removed successfully!");
        fetchEnergyAuditData();
      } catch (error) {
        toast.error("Failed to remove Energy Audit. Please try again.");
        console.error("Error deleting energy audit:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  // Handle file download actions
  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(
          `/governanceEnergyAudit/download/${fileName}`,
          {
            responseType: "blob",
          }
        );

        // Create a Blob from the response data
        const blob = new Blob([response], { type: "*/*" });

        // Create a URL for the Blob
        const url = window.URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger the download
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName; // Set the file name for the download
        document.body.appendChild(link);
        link.click();

        // Clean up the URL and remove the anchor element
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("File downloaded successfully!");
      } catch (error) {
        toast.error("Failed to download pdf file. Please try again.");
        console.error("Error downloading file:", error);
      }
    } else {
      toast.error("No file available for download.");
    }
  };

  // Handle file deletion
  // Clear the file from the form and show success message
  const handleDeleteFile = async () => {
    try {
      // Call the delete API
      const response = await api.delete(
        `/governanceEnergyAudit/deleteEnergyAuditDocument?energyAuditId=${editId}`,
        ""
      );
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      // Remove the file from the form
      validation.setFieldValue("file", null); // Clear the file from Formik state
      setIsFileUploadDisabled(false); // Enable the file upload button
    } catch (error) {
      // Show error message
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  type AcademicYearOption = { value: string; label: string } | null;

  const validation = useFormik({
    initialValues: {
      academicYear: null as AcademicYearOption,
      file: null as File | string | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object({
        value: Yup.string().required(),
        label: Yup.string().required(),
      })
        .nullable()
        .required("Please select academic year"),
      file: Yup.mixed()
        .required("Please upload a file")
        .test("fileSize", "File size is too large", (value: any) => {
          if (typeof value === "string") return true;
          return value && value.size <= 2 * 1024 * 1024; // 2MB limit
        })
        .test("fileType", "Unsupported file format", (value: any) => {
          if (typeof value === "string") return true;
          return (
            value &&
            ["application/pdf", "image/jpeg", "image/png"].includes(value.type)
          );
        }),
    }),
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();

      formData.append("academicYear", values.academicYear?.value || "");

      // Handle the file conditionally
      if (isEditMode && typeof values.file === "string") {
        // Pass an empty Blob instead of null
        formData.append("file", new Blob([]), "empty.pdf");
      } else if (isEditMode && values.file === null) {
        formData.append("file", new Blob([]), "empty.pdf");
      } else if (values.file) {
        formData.append("file", values.file);
      }

      // If editing, include ID
      if (isEditMode && editId) {
        formData.append("energyAuditId", editId);
      }
      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/governanceEnergyAudit/update`,
            formData
          );
          toast.success(
            response.message || "Energy Audit updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/governanceEnergyAudit/save",
            formData
          );
          toast.success(response.message || "Energy Audit added successfully!");
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        setIsFileUploadDisabled(false); // Enable the file upload button
        handleListEnergyAuditClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save energy audit. Please try again.");
        console.error("Error creating energy audit:", error);
      }
    },
  });

  useEffect(() => {
  if (energyAuditData.length === 0) return; // wait until data is loaded

  const table = $("#energyAuditId").DataTable({
    destroy: true, // destroy existing instance if re-rendered
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
      {
        extend: "pdf",
        exportOptions: {
          columns: ":not(:last-child)",
        },
      },
      {
        extend: "print",
        exportOptions: {
          columns: ":not(:last-child)",
        },
      },
    ],
    searching: false,
    paging: false,
  });
  $(".dt-buttons").addClass("mb-3 gap-2");
    $(".buttons-copy").addClass("btn btn-success");
  $(".buttons-csv").addClass("btn btn-info");
  $(".buttons-pdf").addClass("btn btn-danger");
  $(".buttons-print").addClass("btn btn-warning");

  $("#energyAuditId").on("buttons-action.dt", function (e, buttonApi, dataTable, node, config) {
    if (buttonApi.text() === "Copy") {
      toast.success("Copied to clipboard!");
    }
  });

  return () => {
    table.destroy(); // clean up
  };
}, [energyAuditData]);


  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Governance" breadcrumbItem="Energy Audit" />
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

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Energy Audit Documents
                        <i
                          id="infoIcon"
                          className="bi bi-info-circle ms-2"
                          style={{ cursor: "pointer", color: "#0d6efd" }}
                        ></i>
                      </Label>
                      <Tooltip
                        placement="right"
                        isOpen={tooltipOpen}
                        target="infoIcon"
                        toggle={toggleTooltip}
                      >
                        Upload an PDF file. Max size 10MB.
                      </Tooltip>
                      <Input
                        className={`form-control ${
                          validation.touched.file && validation.errors.file
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        innerRef={fileRef}
                        onChange={(event) => {
                          validation.setFieldValue(
                            "file",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.file && validation.errors.file && (
                        <div className="text-danger">
                          {validation.errors.file}
                        </div>
                      )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.file === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.file}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.file as string
                              )
                            }
                            title="Download File"
                          >
                            <i className="bi bi-download"></i>
                          </Button>
                          <Button
                            color="link"
                            className="text-danger"
                            onClick={() => handleDeleteFile()}
                            title="Delete File"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
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
                        onClick={handleListEnergyAuditClick}
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
        {/* Modal for Listing Energy Audit Documents */}
        <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>
            List of Energy Audit Documents
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
            <Table
                         striped
                         bordered
                         hover
                         responsive
                         className="align-middle text-center"
                                     id="energyAuditId"
              innerRef={tableRef}
                       >
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>
                    Academic Year
                  </th>
                  <th>
                    Documents
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((energyAudit, index) => (
                    <tr key={energyAudit.energyAuditId}>
                      <td>{index + 1}</td>
                      <td>{energyAudit.academicYear}</td>
                      <td>
                        {energyAudit.document?.energyAudit || "No file uploaded"}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(energyAudit.energyAuditId)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            handleDelete(energyAudit.energyAuditId)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No Energy Audit data available.
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

export default EnergyAudit;
