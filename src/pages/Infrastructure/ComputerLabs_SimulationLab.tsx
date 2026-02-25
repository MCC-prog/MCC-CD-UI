import Breadcrumb from "Components/Common/Breadcrumb";
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
  Tooltip,
} from "reactstrap";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";

const api = new APIClient();

const ComputerLabs_SimulationLab: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [computerLabsData, setComputerLabsData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState(computerLabsData);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const tableRef = useRef<HTMLTableElement>(null);


  // Toggle the modal for listing ComputerLabs_SimulationLab data
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch ComputerLabs_SimulationLab data data from the backend
  const fetchComputerLabs_SimulationLabData = async () => {
    try {
      const response = await api.get(
        "/infrastructureComputerLabs/getAllComputerLabs",
        ""
      );
      setComputerLabsData(response);
      setFilteredData(response);
    } catch (error) {
      console.error(
        "Error fetching ComputerLabs and SimulationLab data data:",
        error
      );
    }
  };

  // Open the modal and fetch data
  const handleListComputerLabs_SimulationLabClick = () => {
    toggleModal();
    fetchComputerLabs_SimulationLabData();
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
  // Fetch the data for the selected Classrooms data ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/infrastructureComputerLabs/edit?computerLabsId=${id}`,
        ""
      );
      // Map API response to Formik values
      const mappedValues = {
        blockName: response.blockName || "",
        noOfComputerLabs: response.noOfComputerLabs || "",
        noOfComputers: response.noOfComputers || "",
        file: response.document?.computerLabs || null,
      };

      // Update Formik values
      validation.setValues({
        ...mappedValues,
      });
      // In your handleEdit, after setting Formik values:
      if (response.document?.computerLabs) {
        validation.setFieldValue("file", response.document.computerLabs);
        setIsFileUploadDisabled(true);
      } else {
        validation.setFieldValue("file", null);
        setIsFileUploadDisabled(false);
      }
      setIsEditMode(true);
      setEditId(id);
      toggleModal();
      setIsFileUploadDisabled(!!response.document?.computerLabs);
    } catch (error) {
      console.error("Error fetching Classrooms data data by ID:", error);
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the ComputerLabs and SimulationLab data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/infrastructureComputerLabs/deleteComputerLabs?computerLabsId=${id}`,
          ""
        );
        setIsModalOpen(false);
        toast.success(
          response.message ||
          "ComputerLabs and SimulationLab data removed successfully!"
        );
        fetchComputerLabs_SimulationLabData();
      } catch (error) {
        toast.error(
          "Failed to remove ComputerLabs and SimulationLab data. Please try again."
        );
        console.error(
          "Error deleting ComputerLabs and SimulationLab data:",
          error
        );
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
          `/infrastructureComputerLabs/download/${fileName}`,
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
        toast.error("Failed to download  file. Please try again.");
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
        `/infrastructureComputerLabs/deleteComputerLabsDocument?computerLabsId=${editId}`,
        ""
      );

      // Show success message
      toast.success(response.message || "File deleted successfully!");
      // Remove the file from the form
      validation.setFieldValue("file", null); // Clear the file from Formik state
      setIsFileUploadDisabled(false); // Enable the file upload button
      validation.setFieldValue("file", null);
      setIsFileUploadDisabled(false);
    } catch (error) {
      // Show error message
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  // Formik validation and submission
  // Initialize Formik with validation schema and initial values
  const validation = useFormik({
    initialValues: {
      blockName: "",
      noOfComputerLabs: "",
      noOfComputers: "",
      file: null as File | string | null,
    },
    validationSchema: Yup.object({
      blockName: Yup.string().required("Please select block name"),
      noOfComputerLabs: Yup.number().required(
        "Please enter number of computer labs"
      ),
      noOfComputers: Yup.number().required("Please enter number of computers"),
      file: Yup.mixed()
        .required("Please upload a file")
        .test("fileSize", "File size is too large", (value: any) => {
          if (typeof value === "string") return true;
          return value && value.size <= 10 * 1024 * 1024; // 2MB limit
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
      // Create FormData object
      const formData = new FormData();
      // Append fields to FormData
      formData.append("computerLabsId", editId || "");
      formData.append("blockName", values.blockName);
      formData.append("noOfComputerLabs", String(values.noOfComputerLabs));
      formData.append("noOfComputers", String(values.noOfComputers));
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
        formData.append("computerLabsId", editId);
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/infrastructureComputerLabs/update`,
            formData
          );
          toast.success(
            response.message || "ComputerLabs updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/infrastructureComputerLabs/save",
            formData
          );
          toast.success(response.message || "ComputerLabs added successfully!");
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        setIsFileUploadDisabled(false); // Enable the file upload button
        handleListComputerLabs_SimulationLabClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save ComputerLabs details. Please try again.");
        console.error("Error creating ComputerLabs details:", error);
      }
    },
  });
  useEffect(() => {
    if (computerLabsData.length === 0) return; // wait until data is loaded

    const table = $("#computerLabsId").DataTable({
      destroy: true, // destroy existing instance if re-rendered
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "ComputerLabs_SimulationLab_Data",
          title: "ComputerLabs and SimulationLab Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "ComputerLabs_SimulationLab_Data",
          title: "ComputerLabs and SimulationLab Data Export",
          exportOptions: {
            columns: ":not(:last-child)",
          },
        },
      ],
    });
    $(".dt-buttons").addClass("mb-3 gap-2");
    $(".buttons-copy").addClass("btn btn-success");
    $(".buttons-csv").addClass("btn btn-info");

    $("#computerLabsId").on(
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
  }, [computerLabsData]);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Infrastructure"
            breadcrumbItem="ComputerLabs/SimulationLab"
          />
          <Card style={{ height: "350px" }}>
            <CardBody>
              <form onSubmit={validation.handleSubmit}>
                <Row>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="blockName" className="form-label">
                        Block Name
                      </Label>
                      <Input
                        type="select"
                        name="blockName"
                        id="blockName"
                        value={validation.values.blockName || ""}
                        onChange={(e) =>
                          validation.setFieldValue("blockName", e.target.value)
                        }
                        className={
                          validation.touched.blockName &&
                            validation.errors?.blockName
                            ? "is-invalid"
                            : ""
                        }
                      >
                        <option value="">Select Block Name</option>
                        <option value="DJB">DJB</option>
                        <option value="GJB">GJB</option>
                        <option value="MTB">MTB</option>
                        <option value="LSCB">LSCB</option>
                        <option value="MOC">MOC</option>
                        <option value="AB">AB</option>
                      </Input>
                      {validation.touched.blockName &&
                        validation.errors?.blockName && (
                          <div className="text-danger">
                            {validation.errors.blockName}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="noOfComputers" className="form-label">
                        No. of Computers
                      </Label>
                      <Input
                        type="number"
                        name="noOfComputers"
                        id="noOfComputers"
                        value={validation.values.noOfComputers || ""}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "noOfComputers",
                            e.target.value
                          )
                        }
                        placeholder="Enter number of computers"
                        className={
                          validation.touched.noOfComputers &&
                            validation.errors?.noOfComputers
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.noOfComputers &&
                        validation.errors?.noOfComputers && (
                          <div className="text-danger">
                            {validation.errors.noOfComputers}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="noOfComputerLabs" className="form-label">
                        No. of ComputerLabs
                      </Label>
                      <Input
                        type="number"
                        name="noOfComputerLabs"
                        id="noOfComputerLabs"
                        value={validation.values.noOfComputerLabs || ""}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "noOfComputerLabs",
                            e.target.value
                          )
                        }
                        placeholder="Enter number of computer labs"
                        className={
                          validation.touched.noOfComputerLabs &&
                            validation.errors?.noOfComputerLabs
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.noOfComputerLabs &&
                        validation.errors?.noOfComputerLabs && (
                          <div className="text-danger">
                            {validation.errors.noOfComputerLabs}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Photos
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
                        Current Year geo-tagged Photos Only.
                      </Tooltip>
                      <Input
                        className={`form-control ${validation.touched.file && validation.errors.file
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
                        disabled={isFileUploadDisabled}
                      />
                      {validation.touched.file && validation.errors.file && (
                        <div className="text-danger">
                          {validation.errors.file}
                        </div>
                      )}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Show file name, download, and delete buttons if file is a string */}
                      {typeof validation.values.file === "string" &&
                        validation.values.file && (
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
                        onClick={handleListComputerLabs_SimulationLabClick}
                      >
                        List Activities
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Classrooms data */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Computer Labs and Simulation Labs data
          </ModalHeader>
          <ModalBody>
            <Table
              striped
              bordered
              hover
              id="computerLabsId"
              innerRef={tableRef}
            >
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Block Name</th>
                  <th>No. of Computer Labs</th>
                  <th>No. of Computers</th>
                  <th className="d-none">File Path</th> {/* Hidden */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {computerLabsData.length > 0 ? (
                  computerLabsData.map((campus, index) => (
                    <tr key={campus.computerLabsId}>
                      <td>{index + 1}</td>
                      <td>{campus.blockName}</td>
                      <td>{campus.noOfComputerLabs}</td>
                      <td>{campus.noOfComputers}</td>
                      <td className="d-none">{campus?.filePath?.computerLabs || "N/A"}</td> {/* Hidden */}
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(campus.computerLabsId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(campus.computerLabsId)}
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
                      No Classrooms related data available.
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

export default ComputerLabs_SimulationLab;
