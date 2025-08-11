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

const OffCampus: React.FC = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variable for managing file upload status
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  // State variable for managing the modal for listing Off-Campus placement
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State variable for managing the list of Off-Campus placement data
  const [campusData, setCampusData] = useState<any[]>([]);
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  // State variable for managing program options in the dropdown
  // This will be used to populate the program dropdown based Off selected program
  const [programOptions, setProgramOptions] = useState<
    { value: string; label: string }[]
  >([]);
  // State variable for managing search term and pagination

  const [filteredData, setFilteredData] = useState(campusData);
  const tableRef = useRef<HTMLTableElement>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  // Toggle the modal for listing Off-Campus placement
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Off-Campus placement data from the backend
  const fetchOnCampusPlacementData = async () => {
    try {
      const response = await api.get(
        "/onOffCampusPlacementData/getAllOnOffCampusPlacementData?screenType=off",
        ""
      );
      setCampusData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Off-Campus placement data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListOnCampusClick = () => {
    toggleModal();
    fetchOnCampusPlacementData();
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
  // Fetch the data for the selected Off-Campus placement ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/onOffCampusPlacementData?OnOffCampusPlacementDataId=${id}&screenType=off`,
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
            label: response.departmentName,
          }
          : null,
        programType: response.programTypeId
          ? {
            value: response.programTypeId.toString(),
            label: response.programTypeName,
          }
          : null,

        otherDepartment: "",
      };

      // Update Formik values
      validation.setValues({
        ...mappedValues,
        file: response.documents?.mom || null,
        academicYear: mappedValues.academicYear
          ? {
            ...mappedValues.academicYear,
            value: String(mappedValues.academicYear.value),
          }
          : null,
        program: response.programId
          ? {
            value: response.programId.toString(),
            label: response.programName,
          }
          : null,
      });
      // In your handleEdit, after setting Formik values:
      if (response.file?.file) {
        validation.setFieldValue("file", response.file.file);
        setIsFileUploadDisabled(true);
      } else {
        validation.setFieldValue("file", null);
        setIsFileUploadDisabled(false);
      }
      setIsEditMode(true);
      setEditId(id);
      toggleModal();
    } catch (error) {
      console.error("Error fetching Off-Campus placement data by ID:", error);
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the Off-Campus placement data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/onOffCampusPlacementData/deleteOnOffCampusPlacementData?onOffCampusPlacementDataId=${id}`,
          ""
        );
        toast.success(
          response.message || "Off-Campus placement removed successfully!"
        );
        fetchOnCampusPlacementData();
      } catch (error) {
        toast.error("Failed to remove Off-Campus placement. Please try again.");
        console.error("Error deleting Off-Campus placement:", error);
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
          `/onOffCampusPlacementData/download/${fileName}`,
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
        `/onOffCampusPlacementData/deleteOnOffCampusPlacementDataDocument?fileName=${fileName}`,
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
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      file: null as File | string | null,
      programType: null as { value: string; label: string } | null,
      program: null as { value: string; label: string } | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select academic year"),
      stream: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select school"),
      programType: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select program type"),
      program: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select programs"),
      department: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select department"),
      otherDepartment: Yup.string().when(
        "department",
        (department: any, schema) => {
          return department?.value === "Others"
            ? schema.required("Please specify the department")
            : schema;
        }
      ),
      file: Yup.mixed()
        .required("Please upload a file")
        .test(
          "fileType",
          "Only Excel files (.xls, .xlsx) or CSV files (.csv) are allowed",
          function (value) {
            if (isFileUploadDisabled) {
              return true;
            }
            if (!value) {
              return this.createError({ message: "Please upload a file" });
            }
            if (typeof value === "string") {
              return true;
            }
            if (value instanceof File && value.size > 2 * 1024 * 1024) {
              return this.createError({ message: "File size is too large" });
            }
            const allowedTypes = [
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "text/csv",
              "application/csv"
            ];
            const allowedExtensions = [".xls", ".xlsx", ".csv"];
            const fileName = value instanceof File ? value.name : "";
            const hasValidExtension = allowedExtensions.some(ext =>
              fileName.toLowerCase().endsWith(ext)
            );
            if (
              value instanceof File &&
              !allowedTypes.includes(value.type) &&
              !hasValidExtension
            ) {
              return this.createError({
                message: "Only Excel files (.xls, .xlsx) or CSV files (.csv) are allowed"
              });
            }
            return true;
          }
        )
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("programTypeId", values.programType?.value || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append("programId", values.program?.value || "");
      formData.append("id", editId || "");
      formData.append("otherDepartment", values.otherDepartment || "");
      formData.append("screenType", "off");

      if (isEditMode && typeof values.file === "string") {
        formData.append(
          "file",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.file === null) {
        formData.append(
          "file",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.file) {
        formData.append("file", values.file);
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/onOffCampusPlacementData`, formData);
          toast.success(
            response.message || "Off-Campus placement updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/onOffCampusPlacementData",
            formData
          );
          toast.success(
            response.message || "Off-Campus placement added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the Off-Campus placement List
        handleListOnCampusClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Off-Campus placement. Please try again.");
        console.error("Error creating Off-Campus placement:", error);
      }
    },
  });

  // Fetch programs when programType changes
  useEffect(() => {
    const fetchPrograms = async () => {
      if (
        validation.values.programType &&
        validation.values.programType.value
      ) {
        try {
          const response = await api.get(
            `/ProgramsByProgramTypeId?programTypeId=${validation.values.programType.value}`,
            ""
          );
          const options = (response || []).map((item: any) => ({
            value: item.id.toString(),
            label: item.name,
          }));
          setProgramOptions(options);
        } catch (error) {
          setProgramOptions([]);
        }
      } else {
        setProgramOptions([]);
      }
    };
    fetchPrograms();
  }, [validation.values.programType]);

  useEffect(() => {
    if (campusData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
      destroy: true, // destroy existing instance if re-rendered
      scrollX: true,
      autoWidth: false,
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
  }, [campusData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Placement"
            breadcrumbItem="Off Campus Placement Data"
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
                  {validation.values.department?.value === "Others" && (
                    <Col lg={4}>
                      <div className="mb-3">
                        <Label>Specify Department</Label>
                        <Input
                          type="text"
                          className={`form-control ${validation.touched.otherDepartment &&
                            validation.errors.otherDepartment
                            ? "is-invalid"
                            : ""
                            }`}
                          value={validation.values.otherDepartment}
                          onChange={(e) =>
                            validation.setFieldValue(
                              "otherDepartment",
                              e.target.value
                            )
                          }
                          placeholder="Enter Department Name"
                        />
                        {validation.touched.otherDepartment &&
                          validation.errors.otherDepartment && (
                            <div className="text-danger">
                              {validation.errors.otherDepartment}
                            </div>
                          )}
                      </div>
                    </Col>
                  )}
                  {/* Program Type Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Program Type</Label>
                      <ProgramTypeDropdown
                        deptId={selectedDepartment?.value}
                        value={validation.values.programType}
                        onChange={(selectedOption) => {
                          validation.setFieldValue(
                            "programType",
                            selectedOption
                          );
                          setSelectedProgramType(selectedOption);
                          validation.setFieldValue("program", null);
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
                      <Label>Program</Label>
                      <Input
                        type="select"
                        name="program"
                        value={validation.values.program?.value || ""}
                        onChange={(e) => {
                          const selected = programOptions.find(
                            (opt) => opt.value === e.target.value
                          );
                          validation.setFieldValue("program", selected || null);
                        }}
                        className={
                          validation.touched.program &&
                            validation.errors.program
                            ? "is-invalid"
                            : ""
                        }
                      >
                        <option value="">Select Program</option>
                        {programOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Input>
                      {validation.touched.program &&
                        validation.errors.program && (
                          <div className="text-danger">
                            {typeof validation.errors.program === "string"
                              ? validation.errors.program
                              : ""}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Placement Details
                      </Label>
                      <Input
                        className={`form-control ${validation.touched.file && validation.errors.file ? "is-invalid" : ""}`}
                        type="file"
                        id="formFile"
                        innerRef={fileRef}
                        onChange={(event) => {
                          const file = event.currentTarget.files ? event.currentTarget.files[0] : null;
                          validation.setFieldTouched("file", true, true);
                          validation.setFieldValue("file", file, true);

                          // Reset file input if invalid file is selected
                          if (
                            file &&
                            ![".xls", ".xlsx", ".csv"].some(ext => file.name.toLowerCase().endsWith(ext))
                          ) {
                            event.target.value = "";
                          }
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
                                  validation.values.file as string
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Download Template</Label>
                      <div>
                        <a
                          href="/templateFiles/bos.pdf"
                          download
                          className="btn btn-primary btn-sm"
                        >
                          Placement Details
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
                        onClick={handleListOnCampusClick}
                      >
                        List Off-Campus placement details
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Off-Campus placement */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Off-Campus placement
          </ModalHeader>
          <ModalBody>
            <Table
              striped
              bordered
              hover
              id="id"
              innerRef={tableRef}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>Stream</th>
                  <th>Department</th>
                  <th>Program Type</th>
                  <th>Program</th>
                  <th className="d-none">File Path</th> {/* Hidden */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campusData.length > 0 ? (
                  campusData.map((campus, index) => (
                    <tr key={campus.id}>
                      <td>{index + 1}</td>
                      <td>{campus.academicYear}</td>
                      <td>{campus.streamName}</td>
                      <td>{campus.departmentName}</td>
                      <td>{campus.programTypeName}</td>
                      <td>{campus.programName}</td>
                      <td className="d-none">{campus?.filePath?.file || "N/A"}</td> {/* Hidden */}
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(campus.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(campus.id)}
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
                      No Off-Campus Placement data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
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

export default OffCampus;
