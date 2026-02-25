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

const Databases: React.FC = () => {
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
    noOfTeachers: "",
    hostingClgNme: "",
    studentName: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFile2UploadDisabled, setIsFile2UploadDisabled] = useState(false);
  const [disabledUploads, setDisabledUploads] = useState<
    Record<string, boolean>
  >({});
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const fileRef = useRef<HTMLInputElement | null>(null);
  // const excelRef = useRef<HTMLInputElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Calculate the paginated data
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Databases which are Subscribed data from the backend
  const fetchCSWData = async () => {
    try {
      const response = await axios.get(
        "/dataBasesSubscribed/getAllDataBasesSubscribed"
      ); // Replace with your backend API endpoint
      setCSWData(response);
      setFilteredData(response);
    } catch (error) {
      console.error(
        "Error fetching Databases which are Subscribed data:",
        error
      );
    }
  };

  // Open the modal and fetch data
  const handleListCSWClick = () => {
    toggleModal();
    fetchCSWData();
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
  // Fetch the data for the selected Databases which are Subscribed ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/dataBasesSubscribed?dataBasesSubscribedId=${id}`,
        ""
      );
      if (!response) {
        toast.error("No data found for the selected ID.");
        return;
      }
      const files = response.file || {};

      const subscriptionFileKeys = Object.keys(response.file || {}).filter(
        (key) =>
          [
            "Daily",
            "Weekly",
            "Fortnightly",
            "Bimonthly",
            "Monthly",
            "Quarterly",
            "Halfyearly",
            "Annual",
          ].includes(key)
      );

      // Map API response to Formik values
      const mappedValues = {
        academicYear: response.academicYear
          ? {
              value: String(response.academicYear),
              label: String(response.academicYear),
            }
          : null,
        noOfTeachers: response.noOfTeachersUsingLibPerDay || "",
        noOfStudents: response.noOfStudentsUsingLibPerDay || "",
        file: files.DayRegister || null,
        // excel: files.Subscription || null,
        subscriptionDetails: subscriptionFileKeys,
        subscriptionFileNames: files, // ✅ Add this (NEW KEY!)
        subscriptionFiles: {}, // This is for newly uploaded filesre
      };

      // Update Formik values
      validation.setValues({
        ...validation.initialValues,
        ...mappedValues,
        subscriptionDetails: subscriptionFileKeys,
        subscriptionFiles: {}, // optional; will be populated later
      });
      // Disable upload for each subscription type that already has a file
      const disableMap: Record<string, boolean> = {};
      subscriptionFileKeys.forEach((type) => {
        if (files[type]) {
          disableMap[type] = true;
        }
      });
      setDisabledUploads(disableMap);
      setIsFile2UploadDisabled(!!files.DayRegister);
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
      console.log("Mapped subscription details:", subscriptionFileKeys);
    } catch (error) {
      console.error(
        "Error fetching Databases which are Subscribed data by ID:",
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
  // Call the delete API and refresh the Databases which are Subscribed data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/dataBasesSubscribed/deleteDataBasesSubscribed?dataBasesSubscribedId=${id}`,
          ""
        );
        setIsModalOpen(false);

        toast.success(
          response.message ||
            "Databases which are Subscribed removed successfully!"
        );
        fetchCSWData();
      } catch (error) {
        toast.error(
          "Failed to remove Databases which are Subscribed. Please try again."
        );
        console.error("Error deleting Databases which are Subscribed:", error);
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
          `/dataBasesSubscribed/download/${fileName}`,
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
        `/dataBasesSubscribed/deleteDataBasesSubscribedDocument?fileName=${fileName}`,
        ""
      );
      toast.success(response.message || "File deleted successfully!");
      if (docType === "DayRegister") {
        validation.setFieldValue("file", null);
      }
      if (docType === "Subscription") {
        validation.setFieldValue("excel", null);
      }
      setDisabledUploads((prev) => ({
        ...prev,
        [docType]: false,
      }));
      if (
        [
          "Daily",
          "Weekly",
          "Fortnightly",
          "Bimonthly",
          "Monthly",
          "Quarterly",
          "Halfyearly",
          "Annual",
        ].includes(docType)
      ) {
        const updated = { ...validation.values.subscriptionFileNames };
        delete updated[docType];
        validation.setFieldValue("subscriptionFileNames", updated);
      }
      setIsFile2UploadDisabled(false); // Enable the file upload button
    } catch (error) {
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      noOfTeachers: "",
      noOfStudents: "",
      file: null as File | string | null,
      // excel: null as File | string | null,
      subscriptionDetails: [] as string[], // Checkbox values
      subscriptionFiles: {} as Record<string, File | null>, // For uploading new files
      subscriptionFileNames: {} as Record<string, string>,
    },
    validationSchema: Yup.object({
      subscriptionDetails: Yup.array()
        .of(Yup.string())
        .min(1, "Select at least one subscription detail"),

      subscriptionFiles: Yup.object().test(
        "subscriptionFilesValidation",
        function (value) {
          const { subscriptionDetails, subscriptionFileNames } = this.parent;

          const errors: Record<string, string> = {};

          for (const key of subscriptionDetails) {
            const file = value?.[key];
            const existing = subscriptionFileNames?.[key];

            // Skip existing API file
            if (!file && existing) continue;

            // Required
            if (!file) {
              errors[key] = `Please upload a file for ${key}`;
              continue;
            }

            // File size
            if (file instanceof File && file.size > 10 * 1024 * 1024) {
              errors[key] = `File size too large for ${key} (max 2MB)`;
              continue;
            }

            // Allowed types
            const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
            if (file instanceof File && !allowedTypes.includes(file.type)) {
              errors[key] = `Unsupported file format for ${key}`;
              continue;
            }
          }

          // Inject per-field errors
          if (Object.keys(errors).length > 0) {
            return this.createError({
              message: errors,
            });
          }

          return true;
        }
      ),

      noOfStudents: Yup.string().required("Please enter noOfStudents"),
      noOfTeachers: Yup.string().required("Please enter no. of participants"),
      file: Yup.mixed().test(
        "fileValidation",
        "Please upload a valid file",
        function (value) {
          // Skip validation if the file upload is disabled (file exists)
          if (isFile2UploadDisabled) {
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
    }),
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      console.log("Submitting values:", values);
      const allSubscriptionTypes = [
        "Daily",
        "Weekly",
        "Fortnightly",
        "Bimonthly",
        "Monthly",
        "Quarterly",
        "Halfyearly",
        "Annual",
      ];

      try {
        const formData = new FormData();
        formData.append("academicYear", values.academicYear?.value || "");
        formData.append("noOfStudentsUsingLibPerDay", values.noOfStudents);
        formData.append(
          "noOfTeachersUsingLibPerDay",
          values.noOfTeachers || ""
        );
        allSubscriptionTypes.forEach((type) => {
          const file = values.subscriptionFiles?.[type] || null;
          const fieldKey = type.toLowerCase(); // API expects lowercase keys like 'weekly'

          if (file instanceof File) {
            formData.append(fieldKey, file);
          } else {
            // Empty PDF if no file uploaded
            formData.append(
              fieldKey,
              new Blob([], { type: "application/pdf" }),
              "empty.pdf"
            );
          }
        });
        if (isEditMode && typeof values.file === "string") {
          // Pass an empty PDF instead of null
          formData.append(
            "dayRegister",
            new Blob([], { type: "application/pdf" }),
            "empty.pdf"
          );
        } else if (isEditMode && values.file === null) {
          formData.append(
            "dayRegister",
            new Blob([], { type: "application/pdf" }),
            "empty.pdf"
          );
        } else if (values.file) {
          formData.append("dayRegister", values.file);
        }

        // If in edit mode, append the edit ID
        if (isEditMode && editId) {
          formData.append("id", editId);
        }

        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/dataBasesSubscribed`, formData);
          toast.success(
            response.message ||
              "Databases which are Subscribed updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create("/dataBasesSubscribed", formData);
          toast.success(
            response.message ||
              "Databases which are Subscribed added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsFile2UploadDisabled(false);

        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        handleListCSWClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Databases which are Subscribed. Please try again."
        );
        console.error("Error creating Databases which are Subscribed:", error);
      }
    },
  });

  useEffect(() => {
    console.log("Validation Errors:", validation.errors);
  }, [validation.errors]);

  useEffect(() => {
    if (cswData.length === 0) return; // wait until data is loaded

    const table = $("#DbId").DataTable({
      destroy: true,
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Databases_Subscribed_Data",
          title: "Databases Subscribed Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Databases_Subscribed_Data",
          title: "Databases Subscribed Data Export",
          exportOptions: {
            columns: ":not(:last-child)",
          },
        },
      ],
    });
    $(".dt-buttons").addClass("mb-3 gap-2");
    $(".buttons-copy").addClass("btn btn-success");
    $(".buttons-csv").addClass("btn btn-info");

    $("#DbId").on(
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
          <Breadcrumb
            title="Library"
            breadcrumbItem="Databases which are Subscribed"
          />
          <Card>
            <CardBody>
              <form onSubmit={validation.handleSubmit}>
                <Row>
                  {/* Academic Year Dropdown */}
                  <Col
                    lg={4}
                    className="d-flex flex-column justify-content-end"
                  >
                    <div className="mb-3" style={{ marginTop: "24px" }}>
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

                  <Col
                    lg={4}
                    className="d-flex flex-column justify-content-end"
                  >
                    <div className="mb-3">
                      <Label>
                        Number of teachers using the library per day during the
                        year
                      </Label>
                      <Input
                        type="number"
                        className={`form-control ${
                          validation.touched.noOfTeachers &&
                          validation.errors.noOfTeachers
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.noOfTeachers}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "noOfTeachers",
                            e.target.value
                          )
                        }
                        placeholder="Enter No. of Teachers"
                      />
                      {validation.touched.noOfTeachers &&
                        validation.errors.noOfTeachers && (
                          <div className="text-danger">
                            {validation.errors.noOfTeachers}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col
                    lg={4}
                    className="d-flex flex-column justify-content-end"
                  >
                    <div className="mb-3">
                      <Label>
                        Number of students using the library per day during the
                        year
                      </Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.noOfStudents &&
                          validation.errors.noOfStudents
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.noOfStudents}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "noOfStudents",
                            e.target.value
                          )
                        }
                        placeholder="Enter No. of Students"
                      />
                      {validation.touched.noOfStudents &&
                        validation.errors.noOfStudents && (
                          <div className="text-danger">
                            {validation.errors.noOfStudents}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Scanned copy of the day register
                      </Label>
                      <Tooltip
                        placement="right"
                        open={tooltipOpen}
                        onClose={() => setTooltipOpen(false)}
                        onOpen={() => setTooltipOpen(true)}
                        title={<span>Upload file. Max size 10MB.</span>}
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
                        disabled={isFile2UploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.file && validation.errors.file && (
                        <div className="text-danger">
                          {validation.errors.file}
                        </div>
                      )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFile2UploadDisabled && (
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
                                "DayRegister"
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

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label className="form-label">
                        Details of Subscription
                      </Label>
                      <div className="d-flex flex-wrap gap-2">
                        {[
                          "Daily",
                          "Weekly",
                          "Fortnightly",
                          "Bimonthly",
                          "Monthly",
                          "Quarterly",
                          "Halfyearly",
                          "Annual",
                        ].map((type) => (
                          <div key={type} className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`subscription-${type}`}
                              value={type}
                              checked={validation.values.subscriptionDetails.includes(
                                type
                              )}
                              onChange={(e) => {
                                const { checked, value } = e.target;
                                const current = [
                                  ...validation.values.subscriptionDetails,
                                ];
                                if (checked) {
                                  validation.setFieldValue(
                                    "subscriptionDetails",
                                    [...current, value]
                                  );
                                } else {
                                  validation.setFieldValue(
                                    "subscriptionDetails",
                                    current.filter((item) => item !== value)
                                  );
                                  validation.setFieldValue(
                                    `subscriptionFiles.${value}`,
                                    null
                                  ); // Remove file
                                }
                              }}
                            />
                            <Label
                              className="form-check-label"
                              htmlFor={`subscription-${type}`}
                            >
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>

                      {/* Show validation error if no checkboxes selected */}
                      {validation.touched.subscriptionDetails &&
                        validation.errors.subscriptionDetails && (
                          <div className="text-danger">
                            {validation.errors.subscriptionDetails}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Row>
                    {validation.values.subscriptionDetails.map((type) => (
                      <Col sm={4} key={type}>
                        <div className="mb-3">
                          <Label
                            htmlFor={`upload-${type}`}
                            className="form-label"
                          >
                            Upload file for {type}
                          </Label>
                          <Input
                            type="file"
                            id={`upload-${type}`}
                            className={`form-control ${
                              validation.errors.subscriptionFiles?.[type]
                                ? "is-invalid"
                                : ""
                            }`}
                            disabled={disabledUploads[type] === true}
                            onChange={(e) =>
                              validation.setFieldValue(
                                `subscriptionFiles.${type}`,
                                e.currentTarget.files?.[0] || null
                              )
                            }
                          />
                          {validation.errors.subscriptionFiles?.[type] && (
                            <div className="text-danger">
                              {validation.errors.subscriptionFiles[type]}
                            </div>
                          )}

                          {/* ✅ Show existing file from API if it's a string */}
                          {typeof validation.values.subscriptionFileNames ===
                            "object" &&
                            validation.values.subscriptionFileNames[type] && (
                              <div className="mt-2 d-flex align-items-center">
                                <span
                                  className="me-2"
                                  style={{ fontWeight: "bold", color: "green" }}
                                >
                                  {
                                    validation.values.subscriptionFileNames[
                                      type
                                    ]
                                  }
                                </span>
                                <Button
                                  color="link"
                                  className="text-primary"
                                  onClick={() =>
                                    handleDownloadFile(
                                      validation.values.subscriptionFileNames[
                                        type
                                      ]
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
                                      validation.values.subscriptionFileNames[
                                        type
                                      ],
                                      type
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
                    ))}
                  </Row>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Download Template</Label>
                      <div>
                        <a
                          href="/templateFiles/bos.pdf"
                          download
                          className="btn btn-primary btn-sm"
                        >
                          Details
                        </a>
                      </div>
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
        {/* Modal for Listing Databases which are Subscribed */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Databases which are Subscribed
          </ModalHeader>
          <ModalBody>
            <Table striped bordered hover id="DbId" innerRef={tableRef}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Academic Year </th>
                  <th>Number of teachers</th>
                  <th>Number of students</th>
                   <th className="d-none">Day Register</th>
                  <th className="d-none">Annual</th>
                  <th className="d-none">Bimonthly</th>
                  <th className="d-none">Monthly</th>
                  <th className="d-none">Fortnightly</th>
                  <th className="d-none">Weekly</th>
                  <th className="d-none">Daily</th>
                  <th className="d-none">Halfyearly</th>
                  <th className="d-none">Subscription</th>
                  <th className="d-none">DayRegister</th>
                  <th className="d-none">Quarterly</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cswData.length > 0 ? (
                  cswData.map((cds, index) => (
                    <tr key={cds.id}>
                      <td>{index + 1}</td>
                      <td>{cds.academicYear}</td>
                      <td>{cds.noOfTeachersUsingLibPerDay}</td>
                      <td>{cds.noOfStudentsUsingLibPerDay}</td>
                       <td className="d-none">
                        {cds.filePath?.DayRegister || "N/A"}
                      </td>
                      <td className="d-none">
                        {cds.filePath?.Annual || "N/A"}
                      </td>
                      <td className="d-none">
                        {cds.filePath?.Bimonthly || "N/A"}
                      </td>
                      <td className="d-none">
                        {cds.filePath?.Monthly || "N/A"}
                      </td>
                      <td className="d-none">
                        {cds.filePath?.Fortnightly || "N/A"}
                      </td>
                      <td className="d-none">
                        {cds.filePath?.Weekly || "N/A"}
                      </td>
                      <td className="d-none">{cds.filePath?.Daily || "N/A"}</td>
                      <td className="d-none">
                        {cds.filePath?.Halfyearly || "N/A"}
                      </td>
                      <td className="d-none">
                        {cds.filePath?.Subscription || "N/A"}
                      </td>
                      <td className="d-none">
                        {cds.filePath?.Daily || "N/A"}
                      </td>
                      <td className="d-none">
                        {cds.filePath?.Quarterly || "N/A"}
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
                    <td colSpan={5} className="text-center">
                      No Databases which are Subscribed data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
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

export default Databases;
