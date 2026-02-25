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
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";

const api = new APIClient();

const Seminar_Halls: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [seminarHallsData, setSeminarHallsData] = useState<any[]>([]);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filteredData, setFilteredData] = useState(seminarHallsData);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);


  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Seminar Halls data from the backend
  const fetchSeminarHallsData = async () => {
    try {
      const response = await axios.get(
        "/infrastructureSeminarHalls/getAllSeminarHalls"
      ); // Replace with your backend API endpoint
      setSeminarHallsData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Seminar Halls data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListSeminarHallsClick = () => {
    toggleModal();
    fetchSeminarHallsData();
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
  // Fetch the data for the selected policy ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/infrastructureSeminarHalls/edit?seminarHallsId=${id}`,
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
        noOfSeminarHalls: response.noOfSeminarHalls || "",
        file: response.document?.seminarHalls || null,
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
      setIsFileUploadDisabled(!!response.document?.seminarHalls);
      toggleModal();
    } catch (error) {
      console.error("Error fetching Board Room data by ID:", error);
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
          `/infrastructureSeminarHalls/deleteSeminarHalls?seminarHallsId=${id}`,
          ""
        );
        setIsModalOpen(false);
        toast.success(response.message || "Seminar Hall removed successfully!");
        fetchSeminarHallsData();
      } catch (error) {
        toast.error("Failed to remove Seminar Hall. Please try again.");
        console.error("Error deleting Seminar Hall:", error);
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
          `/infrastructureSeminarHalls/download/${fileName}`,
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
        `/infrastructureSeminarHalls/deleteSeminarHallsDocument?seminarHallsId=${editId}`,
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
      noOfSeminarHalls: "",
      file: null as File | string | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object({
        value: Yup.string().required(),
        label: Yup.string().required(),
      })
        .nullable()
        .required("Please select academic year"),
      noOfSeminarHalls: Yup.string()
        .required("Please enter the number of seminar halls")
        .matches(/^[0-9]+$/, "Must be a number"),
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
      const formData = new FormData();

      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("noOfSeminarHalls", values.noOfSeminarHalls || "");

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
        formData.append("seminarHallsId", editId);
      }
      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/infrastructureSeminarHalls/update`,
            formData
          );
          toast.success(
            response.message || "Seminar Hall updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/infrastructureSeminarHalls/save",
            formData
          );
          toast.success(response.message || "Seminar Hall added successfully!");
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        setIsFileUploadDisabled(false); // Enable the file upload button
        handleListSeminarHallsClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Seminar Hall. Please try again.");
        console.error("Error creating Seminar Hall:", error);
      }
    },
  });
  useEffect(() => {
    if (seminarHallsData.length === 0) return; // wait until data is loaded

    const table = $("#seminarHallsId").DataTable({
      destroy: true, // destroy existing instance if re-rendered
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Seminar_Halls_Data",
          title: "Seminar Halls Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Seminar_Halls_Data",
          title: "Seminar Halls Data Export",
          exportOptions: {
            columns: ":not(:last-child)",
          },
        },
      ],
    });
    $(".dt-buttons").addClass("mb-3 gap-2");
    $(".buttons-copy").addClass("btn btn-success");
    $(".buttons-csv").addClass("btn btn-info");

    $("#seminarHallsId").on(
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
  }, [seminarHallsData]);


  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Infrastructure" breadcrumbItem="Seminar Halls" />
          <Card style={{ height: "350px" }}>
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
                  {/* Number of Seminar Halls Input */}
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="noOfSeminarHalls" className="form-label">
                        No. of Seminar Halls
                      </Label>
                      <Input
                        type="number"
                        name="noOfSeminarHalls"
                        id="noOfSeminarHalls"
                        value={validation.values.noOfSeminarHalls || ""}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "noOfSeminarHalls",
                            e.target.value
                          )
                        }
                        placeholder="Enter number of seminar halls"
                        className={
                          validation.touched.noOfSeminarHalls &&
                            validation.errors?.noOfSeminarHalls
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.noOfSeminarHalls &&
                        validation.errors?.noOfSeminarHalls && (
                          <div className="text-danger">
                            {validation.errors.noOfSeminarHalls}
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
                        onClick={handleListSeminarHallsClick}
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
        {/* Modal for Listing Policy Documents */}
        <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>List of Seminar Halls</ModalHeader>
          <ModalBody>
            <Table
              striped
              bordered
              hover
              id="seminarHallsId"
              innerRef={tableRef}
            >
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>No. of Board Rooms</th>
                  <th>Documents</th>
                  <th className="d-none">File Path</th> {/* Hidden */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {seminarHallsData.length > 0 ? (
                  seminarHallsData.map((seminarHall, index) => (
                    <tr key={seminarHall.seminarHallsId}>
                      <td>{index + 1}</td>
                      <td>{seminarHall.academicYear}</td>
                      <td>{seminarHall.noOfSeminarHalls}</td>
                      <td>
                        {seminarHall.document?.seminarHalls || "No file uploaded"}
                      </td>
                      <td className="d-none">{seminarHall.filePath?.seminarHalls || "N/A"}</td> {/* Hidden */}
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(seminarHall.seminarHallsId)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            handleDelete(seminarHall.seminarHallsId)
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
                      No Seminar Hall data available.
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

export default Seminar_Halls;
