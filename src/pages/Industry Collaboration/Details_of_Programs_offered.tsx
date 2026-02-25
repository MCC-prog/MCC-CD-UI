import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import ProgramDropdown from "Components/DropDowns/ProgramDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
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
import axios from "axios";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import Select from "react-select";


const api = new APIClient();

const Details_of_Programs_offered: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsProgramOfferedData, setDetailsProgramOfferedData] = useState<
    any[]
  >([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [filteredData, setFilteredData] = useState(detailsProgramOfferedData);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch DetailsProgramOffered data from the backend
  const fetchDetailsProgramOfferedData = async () => {
    try {
      const response = await api.get(
        "/detailsOfProgramsOffered/getAllDetailsOfProgramsOffered",
        ""
      );
      const data = response?.data || response; // handle both shapes

      if (Array.isArray(data)) {
        setDetailsProgramOfferedData(data);
        setFilteredData(data);
      } else {
        console.error("Unexpected response format:", response);
        setDetailsProgramOfferedData([]);
      }
    } catch (error) {
      console.error("Error fetching Details Of Program Offered data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListDetailsProgramOfferedClick = () => {
    toggleModal();
    fetchDetailsProgramOfferedData();
  };

  const mapValueToLabel = (
    value: string | number | null,
    options: { value: string | number; label: string }[]
  ): { value: string | number; label: string } | null => {
    if (!value) return null;
    const matchedOption = options.find((option) => option.value === value);
    return matchedOption ? matchedOption : { value, label: String(value) };
  };

  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
  };

  const ModeType = [
    { value: "ONLINE", label: "ONLINE" },
    { value: "OFFLINE", label: "OFFLINE" },
    { value: "HYBRID", label: "HYBRID" },
  ];

  // Handle edit action
  // Fetch the data for the selected BOS ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await axios.get("/detailsOfProgramsOffered", {
        params: { detailsOfProgramsOfferedId: id },
      });

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
            label: response.departmentName,
          }
          : null,
        programType: response.programTypeId
          ? {
            value: response.programTypeId.toString(),
            label: response.programTypeName,
          }
          : null,
        degree: response.programs
          ? {
            value: String(Object.keys(response.programs)[0]),
            label: String(Object.values(response.programs)[0]),
          }
          : null,
        program: response.courses
          ? Object.entries(response.courses).map(([key, value]) => ({
            value: key,
            label: String(value),
          }))
          : [],
        agencyName: response.agencyName || "",
        numberOfStudent: response.noOfStudent || "",
        duration: response.duration || "",
        mode: response.mode
          ? {
            value: response.mode,
            label: response.mode,
          }
          : null,
        file: response.mous?.ProgramOffered || null,
      };

      // Update Formik values
      validation.setValues({
        ...mappedValues,
        file: response.mous?.ProgramOffered || null,
        academicYear: mappedValues.academicYear
          ? {
            ...mappedValues.academicYear,
            value: String(mappedValues.academicYear.value),
          }
          : null,
      });
      setSelectedDepartment(mappedValues.department);
      setSelectedStream(mappedValues.stream);
      setSelectedDegree(mappedValues.degree);
      setSelectedProgramType(mappedValues.programType);
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      // Disable the file upload button if a file exists
      setIsFileUploadDisabled(!!response.mous?.ProgramOffered);
      toggleModal();
    } catch (error) {
      console.error(
        "Error fetching Details of Programs Offered data by ID:",
        error
      );
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/detailsOfProgramsOffered/deleteDetailsOfProgramsOffered?detailsOfProgramsOfferedId=${id}`,
          ""
        );
        setIsModalOpen(false);

        toast.success(
          response.message ||
          "Details of Programs Offered removed successfully!"
        );
        fetchDetailsProgramOfferedData();
      } catch (error) {
        toast.error(
          "Failed to remove Details of Programs Offered. Please try again."
        );
        console.error("Error deleting Details of Programs Offered :", error);
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
        const response = await axios.get(
          `/detailsOfProgramsOffered/download/${fileName}`,
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
        toast.error("Failed to download MOM file. Please try again.");
        console.error("Error downloading file:", error);
      }
    } else {
      toast.error("No file available for download.");
    }
  };

  // Handle file deletion
  // Clear the file from the form and show success message
  const handleDeleteFile = async (fileName: string) => {
    try {
      // Call the delete API
      const response = await api.delete(
        `/detailsOfProgramsOffered/deleteDetailsOfProgramsOfferedDocument?fileName=${fileName}`,
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

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      programType: null as { value: string; label: string } | null,
      degree: null as { value: string; label: string } | null,
      program: [] as { value: string; label: string }[],
      agencyName: "",
      numberOfStudent: "",
      duration: "",
      mode: null as { value: string; label: string } | null,
      file: null as string | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select academic year"),
      stream: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select school"),
      department: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select department"),
      programType: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select program type"),
      degree: Yup.object().nullable().required("Please select degree"),
      program: Yup.array()
        .min(1, "Please select at least one program")
        .required("Please select programs"),
      agencyName: Yup.string().required("Please select Agency Name"),
      numberOfStudent: Yup.number()
        .typeError("Please enter a valid number")
        .min(0, "Percentage cannot be less than 0")
        .max(100, "Percentage cannot be more than 100")
        .required("Please enter revision percentage"),
      duration: Yup.string().required("Please select Duration(in Month)"),
      mode: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select Mode"),
      file: Yup.mixed()
        .required("Please upload abstract file")
        .test("fileType", "Only PDF allowed", (value) => {
          if (!value) return false;
          if (typeof value === "string") return true;
          return value instanceof File && value.type === "application/pdf";
        }),
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("programTypeId", values.programType?.value || "");
      formData.append("programId", values.degree?.value || "");
      formData.append("coursesId", values.program.map((p) => p.value).join(","));
      formData.append("agencyName", values.agencyName || "");
      formData.append("noOfStudent", values.numberOfStudent || "");
      formData.append("duration", values.duration || "");
      formData.append("mode", values.mode?.value || "");

      // Append the file
      if (isEditMode && typeof values.file === "string") {
        // Pass an empty Blob instead of null
        formData.append("mou", new Blob([]), "empty.pdf");
      } else if (isEditMode && values.file === null) {
        formData.append("mou", new Blob([]), "empty.pdf");
      } else if (values.file) {
        formData.append("mou", values.file);
      }

      if (isEditMode && editId) {
        formData.append("id", editId);
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/detailsOfProgramsOffered`, formData);
          toast.success(
            response.message ||
            "Details of Programs Offered updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/detailsOfProgramsOffered",
            formData
          );
          toast.success(
            response.message ||
            "Details of Programs Offered added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        setIsFileUploadDisabled(false); // Enable the file upload button
        handleListDetailsProgramOfferedClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Details of Programs Offered. Please try again."
        );
        console.error("Error creating Details of Programs Offered:", error);
      }
    },
  });

  useEffect(() => {
    if (detailsProgramOfferedData.length === 0) return; // wait until data is loaded

    const table = $("#detailsProgramOfferedDataId").DataTable({
      destroy: true, // destroy existing instance if re-rendered
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Details_of_Programs_Offered_Data",
          title: "Details of Programs Offered Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Details_of_Programs_Offered_Data",
          title: "Details of Programs Offered Data Export",
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
  }, [detailsProgramOfferedData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Industry Collaboration"
            breadcrumbItem="Details of Program Offered/Courses Delivered In Collaboration with Industry"
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

                  {/* Department Dropdown */}
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
                          setSelectedDepartment(selectedOption);
                          validation.setFieldValue("programType", null);
                          setSelectedProgramType(null);
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
                  {/* Program Type Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Program Type</Label>
                      <ProgramTypeDropdown
                        deptId={selectedDepartment?.value} // Pass the selected department ID
                        value={validation.values.programType}
                        onChange={(selectedOption) => {
                          validation.setFieldValue(
                            "programType",
                            selectedOption
                          );
                          setSelectedProgramType(selectedOption);
                          validation.setFieldValue("degree", null);
                        }}
                        isInvalid={
                          validation.touched.programType &&
                          !!validation.errors.programType
                        }
                      />
                      {validation.touched.programType &&
                        validation.errors.programType && (
                          <div className="text-danger">
                            {validation.errors.programType}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Degree</Label>
                      <DegreeDropdown
                        programTypeId={selectedProgramType?.value}
                        deptId={selectedDepartment?.value}
                        value={validation.values.degree}
                        onChange={(selectedOption) => {
                          validation.setFieldValue("degree", selectedOption);
                          setSelectedDegree(selectedOption);
                          validation.setFieldValue("program", null);
                        }}
                        isInvalid={
                          validation.touched.degree &&
                          !!validation.errors.degree
                        }
                      />
                      {validation.touched.degree &&
                        validation.errors.degree && (
                          <div className="text-danger">
                            {validation.errors.degree}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Program</Label>
                      <ProgramDropdown
                      programTypeId={selectedProgramType?.value}
                        deptId={selectedDepartment?.value || null}
                        degreeId={selectedDegree?.value}
                        value={validation.values.program}
                        onChange={(selectedOptions) =>
                          validation.setFieldValue("program", selectedOptions)
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Agency Name</Label>
                      <Input
                        type="text"
                        className={`form-control ${validation.touched.agencyName &&
                          validation.errors.agencyName
                          ? "is-invalid"
                          : ""
                          }`}
                        value={validation.values.agencyName}
                        onChange={(e) =>
                          validation.setFieldValue("agencyName", e.target.value)
                        }
                        placeholder="Enter Agency Name"
                      />
                      {validation.touched.agencyName &&
                        validation.errors.agencyName && (
                          <div className="text-danger">
                            {validation.errors.agencyName}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Number of Student</Label>
                      <Input
                        type="number"
                        className={`form-control ${validation.touched.numberOfStudent &&
                          validation.errors.numberOfStudent
                          ? "is-invalid"
                          : ""
                          }`}
                        value={validation.values.numberOfStudent}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "numberOfStudent",
                            e.target.value
                          )
                        }
                        placeholder="Enter Number Of Student"
                      />
                      {validation.touched.numberOfStudent &&
                        validation.errors.numberOfStudent && (
                          <div className="text-danger">
                            {validation.errors.numberOfStudent}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Duration(in Month)</Label>
                      <Input
                        type="text"
                        className={`form-control ${validation.touched.duration &&
                          validation.errors.duration
                          ? "is-invalid"
                          : ""
                          }`}
                        value={validation.values.duration}
                        onChange={(e) =>
                          validation.setFieldValue("duration", e.target.value)
                        }
                        placeholder="Enter Duration(in Month)"
                      />
                      {validation.touched.duration &&
                        validation.errors.duration && (
                          <div className="text-danger">
                            {validation.errors.duration}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Mode Type</Label>
                      <Select
                        options={ModeType}
                        value={validation.values.mode}
                        onChange={(selectedOption) =>
                          validation.setFieldValue(
                            "mode",
                            selectedOption
                          )
                        }
                        placeholder="Select Staff Mode Type"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.mode &&
                            validation.errors.mode
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.mode &&
                        validation.errors.mode && (
                          <div className="text-danger">
                            {validation.errors.mode}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Letter/MOU
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
                            onClick={() => handleDeleteFile(validation.values.file as string)}
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
                        className="btn btn-primary"
                        type="button"
                        onClick={handleListDetailsProgramOfferedClick}
                      >
                        List Details of Programs Offered
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing DetailsProgramOffered */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Details of Program Offered/Courses Delivered In Collaboration
            with Industry
          </ModalHeader>
          <ModalBody>
            <Table
              striped
              bordered
              hover
              id="detailsProgramOfferedDataId"
              innerRef={tableRef}>
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>Academic Year</th>
                  <th>Schools</th>
                  <th>Department</th>
                  <th>Program Type</th>
                  <th>Degree</th>
                  <th>Program</th>
                  <th>Agency Name</th>
                  <th>Number Of Student</th>
                  <th>Durationt</th>
                  <th>Mode Type</th>
                  <th className="d-none">Letter/MOU File Path</th> {/* Hidden */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {detailsProgramOfferedData.length > 0 ? (
                  detailsProgramOfferedData.map((detailsProgramOffered, index) => (
                    <tr key={detailsProgramOffered.detailsProgramOfferedDataId}>
                      <td>{index + 1}</td>
                      <td>{detailsProgramOffered.academicYear}</td>
                      <td>{detailsProgramOffered.streamName}</td>
                      <td>{detailsProgramOffered.departmentName}</td>
                      <td>{detailsProgramOffered.programTypeName}</td>
                      <td>{detailsProgramOffered.programName}</td>
                      <td>
                        <ul>
                          {(
                            Object.values(
                              detailsProgramOffered.courses
                            ) as string[]
                          ).map((course, index) => (
                            <li key={index}>{course}</li>
                          ))}
                        </ul>
                      </td>
                      <td>{detailsProgramOffered.agencyName}</td>
                      <td>{detailsProgramOffered.noOfStudent}</td>
                      <td>{detailsProgramOffered.duration}</td>
                      <td>{detailsProgramOffered.mode}</td>
                      <td className="d-none">{detailsProgramOffered?.filePath?.ProgramOffered || "N/A"}</td> {/* Hidden */}
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() =>
                            handleEdit(
                              detailsProgramOffered.id
                            )
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            handleDelete(
                              detailsProgramOffered.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center">
                      No Details Program Offered data available.
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

export default Details_of_Programs_offered;
