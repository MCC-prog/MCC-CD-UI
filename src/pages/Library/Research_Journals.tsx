import axios from "axios";
import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import Select from "react-select";
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
import moment from "moment";
import { Tooltip } from "@mui/material";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
const api = new APIClient();

const Research_Journals: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cswData, setCSWData] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(cswData);
  const [filters, setFilters] = useState({
    academicYear: "",
    level: "",
    type: "",
    noOfParticipants: "",
    hostingClgNme: "",
    studentName: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

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

  // Fetch Research Journals data from the backend
  const fetchCSWData = async () => {
    try {
      const response = await axios.get(
        "/researchJournals/getAllResearchJournals"
      ); // Replace with your backend API endpoint
      setCSWData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Research Journals data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListCSWClick = () => {
    toggleModal();
    fetchCSWData();
  };

  const mentorShipOpt = [
    { value: "National", label: "National" },
    { value: "International", label: "International" },
  ];

  const TypePublishing = [
    { value: "E-Journal", label: "E-Journal" },
    { value: "Print Journal", label: "Print Journal" },
  ];

  // Handle edit action
  // Fetch the data for the selected Research Journals ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/researchJournals?researchJournalsId=${id}`,
        ""
      );
      if (!response) {
        toast.error("No data found for the selected ID.");
        return;
      }

      // Map API response to Formik values
      const mappedValues = {
        academicYear: response.academicYear
          ? {
              value: response.academicYear,
              label: response.academicYear,
            }
          : null,
        file: response.file?.ResearchJournal || null,
        level: response.journalType
          ? {
              value: response.journalType,
              label: response.journalType,
            }
          : null,
        typeOfPublish: response.typeOfPublish
          ? {
              value: response.typeOfPublish, 
              label: response.typeOfPublish,
            }
          : null,
      };

      // Update Formik values
      validation.setValues({
        ...mappedValues,
      });
      setIsFileUploadDisabled(!!response.file?.ResearchJournal); // Disable file upload if a file exists
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error("Error fetching Research Journals data by ID:", error);
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the Research Journals data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/researchJournals/deleteResearchJournals?researchJournalsId=${id}`,
          ""
        );
        setIsModalOpen(false);
        toast.success(
          response.message || "Research Journals removed successfully!"
        );
        fetchCSWData();
      } catch (error) {
        toast.error("Failed to remove Research Journals. Please try again.");
        console.error("Error deleting Research Journals:", error);
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

  // Handle file download actions
  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(
          `/researchJournals/download/${fileName}`,
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
        toast.error("Failed to download excel file. Please try again.");
        console.error("Error downloading file:", error);
      }
    } else {
      toast.error("No file available for download.");
    }
  };

  // Handle file deletion
  // Clear the file from the form and show success message
  const handleDeleteFile = async (fileName: string, docType: string) => {
    try {
      const response = await api.delete(
        `/researchJournals/deleteResearchJournalsDocument?fileName=${fileName}`,
        ""
      );
toast.success(response.message || "File deleted successfully!");
      if (docType === "ResearchJournal") {
        validation.setFieldValue("file", null);
      }
      setIsFileUploadDisabled(false); // Enable the file upload button
    } catch (error) {
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  // Define a type for the select option
  type SelectOption = { value: string; label: string };

  const validation = useFormik<{
    academicYear: SelectOption | null;
    typeOfPublish: SelectOption | null;
    level: SelectOption | null;
    file: File | string | null;
  }>({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      level: null,
      typeOfPublish: null,
      file: null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select an academic year"),
      file: Yup.mixed().test(
        "fileValidation",
        "Please upload a valid file",
        function (value) {
          // Skip validation if the file upload is disabled (file exists)
          if (isFileUploadDisabled) {
            return true;
          }
          // Perform validation if the file upload is enabled (file doesn't exist)
          if (!value) {
            return this.createError({ message: "Please upload a file" });
          }
          // Check file size (2MB limit)
          if (value instanceof File && value.size > 10 * 1024 * 1024) {
            return this.createError({ message: "File size is too large" });
          }
          // Check file type
          const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
          if (value instanceof File && !allowedTypes.includes(value.type)) {
            return this.createError({ message: "Unsupported file format" });
          }
          return true;
        }
      ),
      level: Yup.object().nullable().required("Please select mentorship"),
      typeOfPublish: Yup.object()
        .nullable()
        .required("Please select Type of publishing"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("academicYear", values.academicYear?.value || "");
        formData.append("journalType", values.level?.value || "");
        formData.append(
          "typeOfPublish",
          values.typeOfPublish?.value || ""
        );
        if (isEditMode && typeof values.file === "string") {
          // Pass an empty PDF instead of null
          formData.append(
            "researchJournal",
            new Blob([], { type: "application/pdf" }),
            "empty.pdf"
          );
        } else if (isEditMode && values.file === null) {
          formData.append(
            "researchJournal",
            new Blob([], { type: "application/pdf" }),
            "empty.pdf"
          );
        } else if (values.file) {
          formData.append("researchJournal", values.file);
        }

        // If in edit mode, append the edit ID
        if (isEditMode && editId) {
          formData.append("id", editId);
        }

        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/researchJournals`, formData);
          toast.success(
            response.message || "Research Journals updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create("/researchJournals", formData);
          toast.success(
            response.message || "Research Journals added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }

        setIsFileUploadDisabled(false);
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        handleListCSWClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Research Journals. Please try again.");
        console.error("Error creating Research Journals:", error);
      }
    },
  });

  useEffect(() => {
    if (cswData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
      destroy: true,
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Research_Journals_Data",
          title: "Research Journals Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Research_Journals_Data",
          title: "Research Journals Data Export",
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
  }, [cswData]);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Library" breadcrumbItem="Research Journals" />
          <Card style={{ height: "350px" }}>
            <CardBody>
              <form onSubmit={validation.handleSubmit}>
                <Row>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Academic Year</Label>
                      <br />
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
                      <Label>Type Of Publishing</Label>
                      <Select
                        options={TypePublishing}
                        value={validation.values.typeOfPublish}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("typeOfPublish", selectedOption)
                        }
                        placeholder="Select Type Of Publishing"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.typeOfPublish && validation.errors.typeOfPublish
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.typeOfPublish && validation.errors.typeOfPublish && (
                        <div className="text-danger">
                          {typeof validation.errors.typeOfPublish === "string"
                            ? validation.errors.typeOfPublish
                            : ""}
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Journal Type</Label>
                      <Select
                        options={mentorShipOpt}
                        value={validation.values.level}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("level", selectedOption)
                        }
                        placeholder="Select Journal Type"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.level && validation.errors.level
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.level && validation.errors.level && (
                        <div className="text-danger">
                          {typeof validation.errors.level === "string"
                            ? validation.errors.level
                            : ""}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Journal List
                      </Label>
                      <Tooltip
                        placement="right"
                        open={tooltipOpen}
                        onClose={() => setTooltipOpen(false)}
                        onOpen={() => setTooltipOpen(true)}
                        title={
                          <span>Include only for current academic year.</span>
                        }
                        arrow
                      >
                        <i
                          id="infoIcon"
                          className="bi bi-info-circle ms-2"
                          style={{ cursor: "pointer", color: "#0d6efd" }}
                        ></i>
                      </Tooltip>
                      <Input
                        className={`form-control ${
                          validation.touched.file && validation.errors.file
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        innerRef={fileRef}
                        id="formFile"
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
                            onClick={() =>
                              handleDeleteFile(
                                validation.values.file as string,
                                "ResearchJournal"
                              )
                            }
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
                        onClick={handleListCSWClick}
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
        {/* Modal for Listing Research Journals */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>List Research Journals</ModalHeader>
          <ModalBody>
            {/* Global Search */}
            <Table striped bordered hover id="id" innerRef={tableRef}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>Type Of Publishing</th>
                  <th>Journal Type </th>
                  <th className="d-none">File </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cswData.length > 0 ? (
                  cswData.map((cds, index) => (
                    <tr key={cds.id}>
                      <td>{index + 1}</td>
                      <td>{cds.academicYear}</td>
                      <td>{cds.typeOfPublish}</td>
                      <td>{cds.journalType}</td>
                      <td className="d-none">
                        {cds?.filePath.ResearchJournal || "N/A"}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(cds.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(cds.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No Research Journals data available.
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

export default Research_Journals;
