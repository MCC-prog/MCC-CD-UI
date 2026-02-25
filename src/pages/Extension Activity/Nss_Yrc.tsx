import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import SemesterTypeDropdown from "Components/DropDowns/SemesterTypeDropdown";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
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
import GetAllProgramDropdown from "Components/DropDowns/GetAllProgramDropdown";
import axios from "axios";
import moment from "moment";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";

const api = new APIClient();

const Nss_Yrc: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nssData, setNssData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [filteredData, setFilteredData] = useState(nssData);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const tableRef = useRef<HTMLTableElement>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Calculate the paginated data
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Nss data from the backend
  const fetchNssData = async () => {
    try {
      const response = await api.get("/nss/getAll", "");
      setNssData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Nss:", error);
    }
  };

  // Open the modal and fetch data
  const handleListNssClick = () => {
    toggleModal();
    fetchNssData();
  };

  const mapValueToLabel = (
    value: string | number | null,
    options: { value: string | number; label: string }[]
  ): { value: string | number; label: string } | null => {
    if (!value) return null;
    const matchedOption = options.find((option) => option.value === value);
    return matchedOption ? matchedOption : { value, label: String(value) };
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(`/nss/edit?nssId=${id}`, "");
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
        semester: response.semester
          ? { value: response.semester, label: response.semester.toUpperCase() }
          : null,
        stream: response.streamId
          ? { value: response.streamId.toString(), label: response.streamName }
          : null,
        department: response.departmentId
          ? {
            value: response.departmentId.toString(),
            label: response.departmentName,
          }
          : null,
        program: response.courses
          ? Object.entries(response.courses).map(([key, value]) => ({
            value: key,
            label: String(value),
          }))
          : [],
        noOfParticipants: response.noOfParticipants || "",
        startDate: response.startDate ? response.startDate : "",
        endDate: response.endDate ? response.endDate : "",
        organisation: response.organisation || "",
        location: response.location || "",
        file: response.documents?.NSS || null,
      };
      // Update Formik values
      validation.setValues({
        ...mappedValues,
        file: response.documents?.NSS || null,
        academicYear: mappedValues.academicYear
          ? {
            ...mappedValues.academicYear,
            value: String(mappedValues.academicYear.value),
          }
          : null,
      });

      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      setIsFileUploadDisabled(!!response.documents?.NSS);
      toggleModal();
    } catch (error) {
      console.error("Error fetching NSS data by ID:", error);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(`/nss/deleteNSS?nssId=${id}`, "");
        setIsModalOpen(false);
        toast.success(response.message || "NSS/YRC  removed successfully!");
        fetchNssData();
      } catch (error) {
        toast.error("Failed to remove NSS/YRC. Please try again.");
        console.error("Error deleting NSS/YRC:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(`/nss/download/${fileName}`, {
          responseType: "blob",
        });

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
        `/nss/deleteNSSDocument?nssId=${editId}`,
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

  const formatDate = (date: string): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      semester: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      program: [] as { value: string; label: string }[],
      noOfParticipants: "",
      organisation: "",
      location: "",
      startDate: "",
      endDate: "",
      file: null as File | string | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select academic year"),
      semester: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select a semester type"), // Single object for single-select
      stream: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select school"),
      department: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select department"),
      file: Yup.mixed()
        .required("Please upload a file")
        .test("fileSize", "File size is too large", (value: any) => {
          if (typeof value === "string") return true;
          return value && value.size <= 10 * 1024 * 1024; // 10MB limit
        })
        .test("fileType", "Unsupported file format", (value: any) => {
          if (typeof value === "string") return true;
          return (
            value &&
            ["application/pdf", "image/jpeg", "image/png"].includes(value.type)
          );
        }),
      program: Yup.array()
        .min(1, "Please select at least one program")
        .required("Please select programs"),
      noOfParticipants: Yup.number()
        .typeError("Please enter a valid number")
        .min(0, "Number of students completed cannot be less than 0")
        .required("Please enter number of No Of Participants"),
      organisation: Yup.string().required("Please select Organization"),
      location: Yup.string().required("Please select Location"),
      startDate: Yup.string()
        .required("Start date is required"),
      endDate: Yup.string()
        .required("End date is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append(
        "courseIds",
        values.program.map((option) => option.value).join(",") || ""
      );
      formData.append("semester", values.semester?.value || "");
      formData.append("noOfParticipants", values.noOfParticipants || "");
      formData.append("organisation", values.organisation || "");
      formData.append("location", values.location || "");
      formData.append(
        "startDate",
        values.startDate || ""
      );
      formData.append(
        "endDate",
        values.endDate
         || ""
      );

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
        formData.append("id", editId);
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/nss/update`, formData);
          toast.success(response.message || "NSS/YRC updated successfully!");
        } else {
          // Call the save API
          const response = await api.create("/nss/save", formData);
          toast.success(response.message || "NSS/YRC added successfully!");
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        setIsFileUploadDisabled(false); // Enable the file upload button
        handleListNssClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save NSS/YRC. Please try again.");
        console.error("Error creating NSS/YRC:", error);
      }
    },
  });
  useEffect(() => {
    if (nssData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
      destroy: true,
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "NSS_YRC_Activity_Data",
          title: "NSS/YRC Activity Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "NSS_YRC_Activity_Data",
          title: "NSS/YRC Activity Data Export",
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
  }, [nssData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Extension Activity" breadcrumbItem="NSS/YRC" />
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Department</Label>
                      <DepartmentDropdown
                        streamId={selectedStream?.value}
                        value={validation.values.department}
                        onChange={(selectedOption) => {
                          validation.setFieldValue(
                            "department",
                            selectedOption
                          );
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
                      <Label>Program</Label>
                      <GetAllProgramDropdown
                        value={validation.values.program}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("program", selectedOption)
                        }
                        isInvalid={
                          validation.touched.program &&
                          !!validation.errors.program
                        }
                      />
                      {validation.touched.program &&
                        validation.errors.program && (
                          <div className="text-danger">
                            {Array.isArray(validation.errors.program)
                              ? validation.errors.program.join(", ")
                              : validation.errors.program}
                          </div>
                        )}
                    </div>
                  </Col>
                  {/* Semester Dropdowns */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Semester Type</Label>
                      <SemesterTypeDropdown
                        value={validation.values.semester}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("semester", selectedOption)
                        }
                        isInvalid={
                          validation.touched.semester &&
                          !!validation.errors.semester
                        }
                      />
                      {validation.touched.semester &&
                        validation.errors.semester && (
                          <div className="text-danger">
                            {validation.errors.semester}
                          </div>
                        )}
                    </div>
                  </Col>
                  {/* <Col lg={4}>
                    <div className="mb-3">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        className={`form-control ${
                          validation.touched.date && validation.errors.date
                            ? "is-invalid"
                            : ""
                        }`}
                        value={
                          validation.values.date
                            ? moment(validation.values.date).format(
                                "YYYY-MM-DD"
                              )
                            : ""
                        }
                        onChange={(e) => {
                          const isoDate = e.target.value; // e.g., "2025-08-21"
                          if (isoDate) {
                            const dateObj = moment(
                              isoDate,
                              "YYYY-MM-DD"
                            ).toDate();
                            validation.setFieldValue("date", dateObj);
                          } else {
                            validation.setFieldValue("date", "");
                          }
                        }}
                        placeholder="dd/mm/yyyy"
                      />

                      {validation.touched.date && validation.errors.date && (
                        <div className="text-danger">
                          {validation.errors.date}
                        </div>
                      )}
                    </div>
                  </Col> */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>start Date</Label>
                      <Input
                        type="date"
                        value={
                          validation.values.startDate
                            ? moment(
                              validation.values.startDate,
                              "DD/MM/YYYY"
                            ).format("YYYY-MM-DD")
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY");
                          validation.setFieldValue("startDate", formattedDate);
                        }}
                        className={
                          validation.touched.startDate &&
                            validation.errors.startDate
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.startDate &&
                        validation.errors.startDate && (
                          <div className="text-danger">
                            {validation.errors.startDate}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={
                          validation.values.endDate
                            ? moment(
                              validation.values.endDate,
                              "DD/MM/YYYY"
                            ).format("YYYY-MM-DD")
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY");
                          validation.setFieldValue("endDate", formattedDate);
                        }}
                        className={
                          validation.touched.endDate &&
                            validation.errors.endDate
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.endDate &&
                        validation.errors.endDate && (
                          <div className="text-danger">
                            {validation.errors.endDate}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>No Of Participants</Label>
                      <Input
                        type="number"
                        className={`form-control ${validation.touched.noOfParticipants &&
                            validation.errors.noOfParticipants
                            ? "is-invalid"
                            : ""
                          }`}
                        value={validation.values.noOfParticipants}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "noOfParticipants",
                            e.target.value
                          )
                        }
                        placeholder="Enter No Of Participants"
                      />
                      {validation.touched.noOfParticipants &&
                        validation.errors.noOfParticipants && (
                          <div className="text-danger">
                            {validation.errors.noOfParticipants}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Organization</Label>
                      <Input
                        type="text"
                        className={`form-control ${validation.touched.organisation &&
                            validation.errors.organisation
                            ? "is-invalid"
                            : ""
                          }`}
                        value={validation.values.organisation}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "organisation",
                            e.target.value
                          )
                        }
                        placeholder="Enter organisation"
                      />
                      {validation.touched.organisation &&
                        validation.errors.organisation && (
                          <div className="text-danger">
                            {validation.errors.organisation}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Location</Label>
                      <Input
                        type="text"
                        className={`form-control ${validation.touched.location &&
                            validation.errors.location
                            ? "is-invalid"
                            : ""
                          }`}
                        value={validation.values.location}
                        onChange={(e) =>
                          validation.setFieldValue("location", e.target.value)
                        }
                        placeholder="Enter Location"
                      />
                      {validation.touched.location &&
                        validation.errors.location && (
                          <div className="text-danger">
                            {validation.errors.location}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Nss/YRC
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
                        Upload an Excel or PDF file. Max size 10MB.
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Nss_Yrc</Label>
                      <div>
                        <a
                          href={`${process.env.PUBLIC_URL}/templateFiles/REPORT_DEPT_YEAR.docx`}
                          download
                          className="btn btn-primary btn-sm"
                        >
                          Template
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
                        onClick={handleListNssClick}
                      >
                        List NSS/YRC
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing NSS/YRC */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>List NSS/YRC</ModalHeader>
          <ModalBody>
            <Table striped bordered hover id="id" innerRef={tableRef}>
              <thead className="table-dark">
                <tr>
                  <th>Sl.No</th>
                  <th>Academic Year</th>
                  <th>School</th>
                  <th>Department</th>
                  <th>Program</th>
                  <th>Semester Type</th>
                  <th>No Of Participants</th>
                  <th>Organization</th>
                  <th>Location</th>
                  <th>startDate</th>
                  <th>endDate</th>
                  <th className="d-none">FilePath</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((nss, index) => (
                    <tr key={nss.id}>
                      <td>{index + 1}</td>
                      <td>{nss.academicYear}</td>
                      <td>{nss.streamName}</td>
                      <td>{nss.departmentName}</td>
                      <td>
                        <ul>
                          {(Object.values(nss.courses) as string[]).map(
                            (course, index) => (
                              <li key={index}>{course}</li>
                            )
                          )}
                        </ul>
                      </td>
                      <td>{nss.semester}</td>
                      <td>{nss.noOfParticipants}</td>
                      <td>{nss.organisation}</td>
                      <td>{nss.location}</td>
                      <td>{nss.startDate}</td>
                      <td>{nss.endDate}</td>
                      <td className="d-none">{nss?.filePath.NSS || "N/A"}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEdit(nss.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(nss.id)}
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
                      No NSS/YRC data available.
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

export default Nss_Yrc;
