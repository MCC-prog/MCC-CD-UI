import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import ProgramDropdown from "Components/DropDowns/ProgramDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
import SemesterDropdowns from "Components/DropDowns/SemesterDropdowns";
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
} from "reactstrap";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SEMESTER_NO_OPTIONS } from "../../Components/constants/layout";
import axios from "axios";
import moment from "moment";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";

const api = new APIClient();

const TrainingsAndWorkshops: React.FC = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variable for managing file upload status
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState({
    attendance: false,
    report: false,
  });
  // State variable for managing the modal for listing BOS
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State variable for managing the list of BOS data
  const [bosData, setBosData] = useState<any[]>([]);
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  // State variable for managing search term and pagination
  const [filteredData, setFilteredData] = useState(bosData);
  const tableRef = useRef<HTMLTableElement>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const file2Ref = useRef<HTMLInputElement | null>(null);

  // Toggle the modal for listing BOS
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch BOS data from the backend
  const fetchTrainingAndWorkshopsData = async () => {
    try {
      const response = await api.get(
        "/trainingProgramsWorkshop/getAllTrainingProgramsWorkshop",
        ""
      );
      setBosData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Training Programs/Workshop data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListTrainingAndWorkshopClick = () => {
    toggleModal();
    fetchTrainingAndWorkshopsData();
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
        `/trainingProgramsWorkshop?trainingProgramsWorkshopId=${id}`,
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
        academicTraining: response.academicTraining
          ? {
            value: response.academicTraining,
            label: response.academicTraining,
          }
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
        program: response.programName
          ? { value: response.programName, label: response.programName }
          : null,
        revisionPercentage: response.percentage || "",
        startDate: response.startDate
          ? moment(response.startDate, "YYYY-MM-DD").format("DD/MM/YYYY")
          : "",
        endDate: response.endDate
          ? moment(response.endDate, "YYYY-MM-DD").format("DD/MM/YYYY")
          : "",
        otherDepartment: "", // Add default value for otherDepartment
        targetAudience: response.targetAudience || "",
        no_ofParticipants: response.noOfParticipants || "",
        totalHours: response.totalHours || "",
        resourcePersons: response.resourcePersons || "",
        partnerOrganization: response.partneringOrganization || "",
        attendance: response.file.Attendance || null,
        report: response.file.Report || null,
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
      setIsFileUploadDisabled({
        attendance: !!response.file?.Attendance,
        report: !!response.file?.Report,
      });
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
          `/trainingProgramsWorkshop/deleteTrainingProgramsWorkshop?trainingProgramsWorkshopId=${id}`,
          ""
        );
        setIsModalOpen(false);
        toast.success(
          response.message ||
          "Training and Workshop record removed successfully!"
        );
        fetchTrainingAndWorkshopsData();
      } catch (error) {
        toast.error(
          "Failed to remove Training and Workshop record. Please try again."
        );
        console.error("Error deleting Training and Workshop record:", error);
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
          `trainingProgramsWorkshop/download/${fileName}`,
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
        toast.error("Failed to download file. Please try again.");
        console.error("Error downloading file:", error);
      }
    } else {
      toast.error("No file available for download.");
    }
  };

  // Handle file deletion
  // Clear the file from the form and show success message
  const handleDeleteFile = async (
    fileName: string,
    fileKey: "attendance" | "report"
  ) => {
    try {
      await api.delete(
        `/trainingProgramsWorkshop/deleteTrainingProgramsWorkshopDocument?fileName=${encodeURIComponent(
          fileName
        )}`,
        ""
      );
      toast.success("File deleted successfully!");
      validation.setFieldValue(fileKey, null);
      setIsFileUploadDisabled((prev) => ({ ...prev, [fileKey]: false }));
    } catch {
      toast.error("Failed to delete file.");
    }
  };

  // Formik validation and submission
  // Initialize Formik with validation schema and initial values
  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      program: null as { value: string; label: string } | null,
      academicTraining: null as { value: string; label: string } | null,
      startDate: "",
      endDate: "",
      targetAudience: "",
      no_ofParticipants: "",
      totalHours: "",
      resourcePersons: "",
      partnerOrganization: "",
      attendance: null as File | null,
      report: null as File | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select academic year"),
      stream: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select school"),
      program: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select type of funding"),
      academicTraining: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select academic training"),
      startDate: Yup.string().required("Please select start date"),
      endDate: Yup.string().required("Please select end date"),
      targetAudience: Yup.string().required("Please enter target audience"),
      no_ofParticipants: Yup.string().required(
        "Please enter number of participants"
      ),
      totalHours: Yup.string().required("Please enter total hours"),
      resourcePersons: Yup.string().required("Please enter resource persons"),
      partnerOrganization: Yup.string().required(
        "Please enter partner organization"
      ),
      attendance: Yup.mixed().test(
        "fileValidation",
        "Please upload a valid file",
        function (value) {
          // Skip validation if file upload is disabled (file exists)
          if (
            this.parent &&
            this.parent.attendance &&
            typeof this.parent.attendance === "string"
          ) {
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
      report: Yup.mixed().test(
        "fileValidation",
        "Please upload a valid file",
        function (value) {
          // Skip validation if file upload is disabled (file exists)
          if (
            this.parent &&
            this.parent.report &&
            typeof this.parent.report === "string"
          ) {
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
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append("programName", values.program?.value || "");
      formData.append("academicTraining", values.academicTraining?.value || "");
      formData.append("startDate", values.startDate);
      formData.append("endDate", values.endDate);
      formData.append("targetAudience", values.targetAudience);
      formData.append("noOfParticipants", values.no_ofParticipants);
      formData.append("totalHours", values.totalHours);
      formData.append("resourcePersons", values.resourcePersons);
      formData.append("partneringOrganization", values.partnerOrganization);
      formData.append("id", editId || "");
      // Attendance file: if string (existing file), send null; if File, send file
      if (isEditMode && typeof values.attendance === "string") {
        formData.append(
          "attendance",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.attendance === null) {
        formData.append(
          "attendance",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.attendance) {
        formData.append("attendance", values.attendance);
      }
      // Report file: if string (existing file), send null; if File, send file
      if (isEditMode && typeof values.report === "string") {
        formData.append(
          "report",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.report === null) {
        formData.append(
          "report",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.report) {
        formData.append("report", values.report);
      }

      try {
        if (isEditMode && editId) {
          await api.put("/trainingProgramsWorkshop", formData);
          toast.success("Record updated successfully!");
        } else {
          await api.create("/trainingProgramsWorkshop", formData);
          toast.success("Record saved successfully!");
        }
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        if (file2Ref.current) {
          file2Ref.current.value = "";
        }
        setIsFileUploadDisabled({ attendance: false, report: false });
        setIsEditMode(false);
        setEditId(null);
        fetchTrainingAndWorkshopsData();
      } catch (error) {
        toast.error("Failed to save record. Please try again.");
      }
    },
  });
  useEffect(() => {
    if (bosData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
      destroy: true, // destroy existing instance if re-rendered
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Trainings_and_Workshops_Data",
          title: "Trainings and Workshops Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Trainings_and_Workshops_Data",
          title: "Trainings and Workshops Data Export",
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
            title="Placement"
            breadcrumbItem="Trainings Programs And Workshop"
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
                  {/* Stream Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>School</Label>
                      <StreamDropdown
                        value={validation.values.stream}
                        onChange={(selectedOption) => {
                          validation.setFieldValue("stream", selectedOption);
                          setSelectedStream(selectedOption);
                          validation.setFieldValue("department", null);
                          setSelectedDepartment(null);
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
                      <Label>Program</Label>
                      <Input
                        type="select"
                        value={validation.values.program?.value || ""}
                        onChange={(e) =>
                          validation.setFieldValue("program", {
                            value: e.target.value,
                            label: e.target.value,
                          })
                        }
                        className={`form-control ${validation.touched.program &&
                          validation.errors.program
                          ? "is-invalid"
                          : ""
                          }`}
                      >
                        <option value="">Select Program</option>
                        <option value="UG">UG</option>
                        <option value="PG">PG</option>
                      </Input>
                      {validation.touched.program &&
                        validation.errors.program && (
                          <div className="text-danger">
                            {validation.errors.program}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Type of Training</Label>
                      <Input
                        type="select"
                        name="academicTraining"
                        value={validation.values.academicTraining?.value || ""}
                        onChange={(e) =>
                          validation.setFieldValue("academicTraining", {
                            value: e.target.value,
                            label: e.target.value,
                          })
                        }
                        className={
                          validation.touched.academicTraining &&
                            validation.errors.academicTraining
                            ? "is-invalid"
                            : ""
                        }
                      >
                        <option value="">Select Type of Training</option>
                        <option value="Recruitment training">
                          Recruitment training
                        </option>
                        <option value="Expand Talks">Expand Talks</option>
                        <option value="Seminars/workshops/Webinars">
                          Seminars/workshops/Webinars
                        </option>
                        <option value="Events and Competitions">
                          Events and Competitions
                        </option>
                        <option value="Domain Training">Domain Training</option>
                        <option value="Career Fair">Career Fair</option>
                      </Input>
                      {validation.touched.academicTraining &&
                        validation.errors.academicTraining && (
                          <div className="text-danger">
                            {validation.errors.academicTraining}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Start Date</Label>
                      <Input
                        type="date" // Use native date input
                        className={`form-control ${validation.touched.startDate &&
                          validation.errors.startDate
                          ? "is-invalid"
                          : ""
                          }`}
                        value={
                          validation.values.startDate
                            ? moment(
                              validation.values.startDate,
                              "DD/MM/YYYY"
                            ).format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
                          validation.setFieldValue("startDate", formattedDate);
                        }}
                        placeholder="dd/mm/yyyy"
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
                        type="date" // Use native date input
                        className={`form-control ${validation.touched.endDate &&
                          validation.errors.endDate
                          ? "is-invalid"
                          : ""
                          }`}
                        value={
                          validation.values.endDate
                            ? moment(
                              validation.values.endDate,
                              "DD/MM/YYYY"
                            ).format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
                          validation.setFieldValue("endDate", formattedDate);
                        }}
                        placeholder="dd/mm/yyyy"
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
                      <Label>Target Audience</Label>
                      <Input
                        type="text"
                        name="targetAudience"
                        value={validation.values.targetAudience}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "targetAudience",
                            e.target.value
                          )
                        }
                        placeholder="Enter Target Audience"
                        className={
                          validation.touched.targetAudience &&
                            validation.errors.targetAudience
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.targetAudience &&
                        validation.errors.targetAudience && (
                          <div className="text-danger">
                            {validation.errors.targetAudience}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Number of Participants</Label>
                      <Input
                        type="text"
                        name="no_ofParticipants"
                        value={validation.values.no_ofParticipants}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "no_ofParticipants",
                            e.target.value
                          )
                        }
                        placeholder="Enter No. of Participants"
                        className={
                          validation.touched.no_ofParticipants &&
                            validation.errors.no_ofParticipants
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.no_ofParticipants &&
                        validation.errors.no_ofParticipants && (
                          <div className="text-danger">
                            {validation.errors.no_ofParticipants}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Total number of hours</Label>
                      <Input
                        type="text"
                        name="totalHours"
                        value={validation.values.totalHours}
                        onChange={(e) =>
                          validation.setFieldValue("totalHours", e.target.value)
                        }
                        placeholder="Enter total number of hours"
                        className={
                          validation.touched.totalHours &&
                            validation.errors.totalHours
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.totalHours &&
                        validation.errors.totalHours && (
                          <div className="text-danger">
                            {validation.errors.totalHours}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Resource persons</Label>
                      <Input
                        type="text"
                        name="resourcePersons"
                        value={validation.values.resourcePersons}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "resourcePersons",
                            e.target.value
                          )
                        }
                        placeholder="Enter resource persons"
                        className={
                          validation.touched.resourcePersons &&
                            validation.errors.resourcePersons
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.resourcePersons &&
                        validation.errors.resourcePersons && (
                          <div className="text-danger">
                            {validation.errors.resourcePersons}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Partnering organisation</Label>
                      <Input
                        type="text"
                        name="partnerOrganization"
                        value={validation.values.partnerOrganization}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "partnerOrganization",
                            e.target.value
                          )
                        }
                        placeholder="Enter partnering organisation"
                        className={
                          validation.touched.partnerOrganization &&
                            validation.errors.partnerOrganization
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.partnerOrganization &&
                        validation.errors.partnerOrganization && (
                          <div className="text-danger">
                            {validation.errors.partnerOrganization}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="attendance" className="form-label">
                        Upload Attendance Report
                      </Label>
                      <Input
                        className={`form-control ${validation.touched.attendance &&
                          validation.errors.attendance
                          ? "is-invalid"
                          : ""
                          }`}
                        type="file"
                        id="attendance"
                        onChange={(event) => {
                          if (
                            isFileUploadDisabled.attendance &&
                            typeof validation.values.attendance === "string"
                          )
                            return;
                          validation.setFieldValue(
                            "attendance",
                            event.currentTarget.files?.[0] || null
                          );
                          validation.setFieldTouched("attendance", true, true);
                        }}
                        disabled={isFileUploadDisabled.attendance}
                        innerRef={fileRef}
                      />
                      {validation.touched.attendance &&
                        validation.errors.attendance && (
                          <div className="text-danger">
                            {validation.errors.attendance}
                          </div>
                        )}
                      {isFileUploadDisabled.attendance && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {typeof validation.values.attendance === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.attendance}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() => {
                              if (
                                typeof validation.values.attendance === "string"
                              ) {
                                handleDownloadFile(
                                  validation.values.attendance
                                );
                              }
                            }}
                            title="Download File"
                          >
                            <i className="bi bi-download"></i>
                          </Button>
                          <Button
                            color="link"
                            className="text-danger"
                            onClick={() => {
                              if (
                                typeof validation.values.attendance === "string"
                              ) {
                                handleDeleteFile(
                                  validation.values.attendance,
                                  "attendance"
                                );
                              }
                            }}
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
                      <Label htmlFor="report" className="form-label">
                        Upload Report
                      </Label>
                      <Input
                        className={`form-control ${validation.touched.report && validation.errors.report
                          ? "is-invalid"
                          : ""
                          }`}
                        type="file"
                        id="report"
                        onChange={(event) => {
                          if (
                            isFileUploadDisabled.report &&
                            typeof validation.values.report === "string"
                          )
                            return;
                          validation.setFieldValue(
                            "report",
                            event.currentTarget.files?.[0] || null
                          );
                          validation.setFieldTouched("report", true, true);
                        }}
                        disabled={isFileUploadDisabled.report}
                        innerRef={file2Ref}
                      />
                      {validation.touched.report &&
                        validation.errors.report && (
                          <div className="text-danger">
                            {validation.errors.report}
                          </div>
                        )}
                      {isFileUploadDisabled.report && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {typeof validation.values.report === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.report}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() => {
                              if (
                                typeof validation.values.report === "string"
                              ) {
                                handleDownloadFile(validation.values.report);
                              }
                            }}
                            title="Download File"
                          >
                            <i className="bi bi-download"></i>
                          </Button>
                          <Button
                            color="link"
                            className="text-danger"
                            onClick={() => {
                              if (
                                typeof validation.values.report === "string"
                              ) {
                                handleDeleteFile(
                                  validation.values.report,
                                  "report"
                                );
                              }
                            }}
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
                        onClick={handleListTrainingAndWorkshopClick}
                      >
                        List Training and Workshops
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
            List Trainings and Workshops Data
          </ModalHeader>
          <ModalBody>
            <Table
              striped
              bordered
              hover
              id="id"
              innerRef={tableRef}
            >
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>School</th>
                  <th>Program</th>
                  <th>Academic Training</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Target Audience</th>
                  <th>Number of Participants</th>
                  <th>Total Hours</th>
                  <th>Resource Persons</th>
                  <th>Partner Organization</th>
                  <th className="d-none">Attendance Report File Path</th> {/* Hidden */}
                  <th className="d-none">Report File Path</th> {/* Hidden */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bosData.length > 0 ? (
                  bosData.map((row, index) => (
                    <tr key={row.id || index}>
                      <td>{index + 1}</td>
                      <td>{row.academicYear}</td>
                      <td>{row.streamName}</td>
                      <td>{row.programName}</td>
                      <td>{row.academicTraining}</td>
                      <td>{row.startDate}</td>
                      <td>{row.endDate}</td>
                      <td>{row.targetAudience}</td>
                      <td>{row.noOfParticipants}</td>
                      <td>{row.totalHours}</td>
                      <td>{row.resourcePersons}</td>
                      <td>{row.partneringOrganization}</td>
                      <td className="d-none">{row.filePath?.Attendance || "N/A"}</td> {/* Hidden */}
                      <td className="d-none">{row.filePath?.Report || "N/A"}</td> {/* Hidden */}
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(row.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(row.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={16} className="text-center">
                      No data available.
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

export default TrainingsAndWorkshops;
