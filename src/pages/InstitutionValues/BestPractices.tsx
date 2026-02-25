import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
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

const BestPractices: React.FC = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variable for managing file upload status
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  // State variable for managing the modal for listing Best Practices
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State variable for managing the list of Best Practices data
  const [activityData, setActivityData] = useState<any[]>([]);
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  // State variable for managing search term and pagination
  const [filteredData, setFilteredData] = useState(activityData);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [associationOptions, setAssociationOptions] = useState<
    { value: string; label: string }[]
  >([]);
  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const response = await api.get("/getAllAssociation", "");
        const options = response.map((a: any) => ({
          value: String(a.associationId),
          label: a.name,
        }));
        setAssociationOptions(options);
      } catch (error) {
        console.error("Error fetching associations:", error);
      }
    };
    fetchAssociations();
  }, []);
  // Toggle the modal for listing Best Practices
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Best Practices data from the backend
  const fetchActivitiesData = async () => {
    try {
      const response = await api.get(
        "/institutionalValues/getAllInstitutionalValues?screenType=bestPractices",
        ""
      );
      setActivityData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Best Practices data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListActivityClick = () => {
    toggleModal();
    fetchActivitiesData();
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
  // Fetch the data for the selected Best Practices ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/institutionalValues?institutionalValuesId=${id}&screenType=bestPractices`,
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

      const semesterNoOptions = SEMESTER_NO_OPTIONS;

      // Map API response to Formik values
      const mappedValues = {
        academicYear: mapValueToLabel(response.academicYear, academicYearList),
        semesterNo: response.semester
          ? { value: response.semester.toString(), label: response.semester }
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
        otherDepartment: "",
        association: response.associationId
          ? {
              value: response.associationId.toString(),
              label: response.associationName,
            }
          : null,
        objective: response.eventObjective
          ? {
              value: response.eventObjective.toString(),
              label: response.eventObjective,
            }
          : null,
        file: response.file?.Institutional || null,
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
      toggleModal();
    } catch (error) {
      console.error("Error fetching Best Practices data by ID:", error);
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the Best Practices data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/institutionalValues/deleteInstitutionalValues?institutionalValuesId=${id}`,
          ""
        );
        setIsModalOpen(false);

        toast.success(
          response.message || "Best Practices removed successfully!"
        );
        fetchActivitiesData();
      } catch (error) {
        toast.error("Failed to remove Best Practices. Please try again.");
        console.error("Error deleting Best Practices:", error);
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
          `/institutionalValues/download/${fileName}`,
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
        toast.error(
          "Failed to download Best Practices file. Please try again."
        );
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
        `/institutionalValues/deleteInstitutionalValuesDocument?fileName=${fileName}`,
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

  // Formik validation and submission
  // Initialize Formik with validation schema and initial values
  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      semesterNo: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      file: null as File | string | null,
      // objective: null as { value: string; label: string } | null,
      // association: null as { value: string; label: string } | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select academic year"),
      semesterNo: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select a semesterNo number"),
      stream: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select school"),
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
      // objective: Yup.object<{ value: string; label: string }>()
      //   .nullable()
      //   .required("Please select objective of the event"),
      // association: Yup.object<{ value: string; label: string }>()
      //   .nullable()
      //   .required("Please select an association"),
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
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("id", editId || "");
      formData.append("screenType", "bestPractices");
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("semester", String(values.semesterNo?.value || ""));
      formData.append("streamId", values.stream?.value || "");
      formData.append("otherDepartment", values.otherDepartment || "");
      // formData.append("eventObjective", values.objective?.value || "");
      // formData.append("associationId", values.association?.value || "");

      if (isEditMode && typeof values.file === "string") {
        formData.append(
          "institutional",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.file === null) {
        formData.append(
          "institutional",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.file) {
        formData.append("institutional", values.file);
      }
      try {
        const response =
          isEditMode && editId
            ? await api.put(`/institutionalValues`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              })
            : await api.create(`/institutionalValues`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
        toast.success(
          response.message || "Best Practices updated successfully!"
        );
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the Best Practices List
        handleListActivityClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Best Practices. Please try again.");
        console.error("Error creating Best Practices:", error);
      }
    },
  });

  useEffect(() => {
    if (activityData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
      destroy: true, // destroy existing instance if re-rendered
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Best_Practices_Data",
          title: "Best Practices Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Best_Practices_Data",
          title: "Best Practices Data Export",
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
  }, [activityData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Institutional Values"
            breadcrumbItem="Best Practices"
          />
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
                  {/* Semester Dropdowns */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Semester</Label>
                      <Input
                        type="select"
                        name="semesterNo"
                        value={validation.values.semesterNo?.value || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          const selected = val
                            ? { value: val, label: `Semester ${val}` }
                            : null;
                          validation.setFieldValue("semesterNo", selected);
                        }}
                        className={
                          validation.touched.semesterNo &&
                          validation.errors.semesterNo
                            ? "is-invalid"
                            : ""
                        }
                      >
                        <option value="">Select Semester</option>
                        {[...Array(8)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </Input>
                      {validation.touched.semesterNo &&
                        validation.errors.semesterNo && (
                          <div className="text-danger">
                            {validation.errors.semesterNo}
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
                          className={`form-control ${
                            validation.touched.otherDepartment &&
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
                  {/* <Col lg={4}>
                    <div className="mb-3">
                      <Label>Association</Label>
                      <Input
                        type="select"
                        name="association"
                        value={validation.values.association?.value || ""}
                        onChange={(e) => {
                          const selected =
                            associationOptions.find(
                              (opt) => opt.value === e.target.value
                            ) || null;
                          validation.setFieldValue("association", selected);
                        }}
                        className={
                          validation.touched.association &&
                          validation.errors.association
                            ? "is-invalid"
                            : ""
                        }
                      >
                        <option value="">Select Association</option>
                        {associationOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Input>
                      {validation.touched.association &&
                        validation.errors.association && (
                          <div className="text-danger">
                            {validation.errors.association}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label
                        htmlFor="objective of the event"
                        className="form-label"
                      >
                        Objective of the event
                      </Label>
                      <Input
                        type="select"
                        name="objective"
                        id="objective of the event"
                        value={validation.values.objective?.value || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          const selected = val
                            ? { value: val, label: val }
                            : null;
                          validation.setFieldValue("objective", selected);
                        }}
                        className={
                          validation.touched.objective &&
                          validation.errors?.objective
                            ? "is-invalid"
                            : ""
                        }
                      >
                        <option value="">Select objective of the event</option>
                        <option value="Universal Values of peace">
                          Universal Values of peace
                        </option>
                        <option value="Truth and harmony">
                          Truth and harmony
                        </option>
                        <option value="Gender sensitization and equity">
                          Gender sensitization and equity
                        </option>
                        <option value="Constitutional values">
                          Constitutional values
                        </option>
                        <option value="Commemoration of National and international days">
                          Commemoration of National and international days{" "}
                        </option>
                        <option value="Wellness and health">
                          Wellness and health
                        </option>
                      </Input>
                      {validation.touched.objective &&
                        validation.errors?.objective && (
                          <div className="text-danger">
                            {validation.errors.objective}
                          </div>
                        )}
                    </div>
                  </Col> */}
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Report
                      </Label>
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
                        disabled={
                          !!(
                            typeof validation.values.file === "string" &&
                            validation.values.file
                          )
                        } // Disable if file name exists
                      />
                      {validation.touched.file && validation.errors.file && (
                        <div className="text-danger">
                          {validation.errors.file}
                        </div>
                      )}
                      {/* Show a message if the file upload button is disabled */}
                      {typeof validation.values.file === "string" &&
                        validation.values.file && (
                          <div className="text-warning mt-2">
                            Please remove the existing file to upload a new one.
                          </div>
                        )}
                      {/* Only show the file name if it is a string (from the edit API) */}
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
                          href={`${process.env.PUBLIC_URL}/templateFiles/YEAR_DEPT_BEST_PRACTICES.docx`}
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
                        onClick={handleListActivityClick}
                      >
                        List Best Practices
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Best Practices */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>List Best Practices</ModalHeader>
          <ModalBody>
            <Table striped bordered hover id="id" innerRef={tableRef}>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>Semester</th>
                  <th>School</th>
                  <th>Department</th>
                  {/* <th>Association</th>
                  <th>Objective</th> */}
                  <th className="d-none">File Path</th> {/* Hidden */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activityData.length > 0 ? (
                  activityData.map((activity, index) => (
                    <tr key={activity.id}>
                      <td>{index + 1}</td>
                      <td>{activity.academicYear}</td>
                      <td>{activity.semester}</td>
                      <td>{activity.streamName}</td>
                      <td>{activity.departmentName}</td>
                      {/* <td>{activity.associationName}</td>
                      <td>{activity.eventObjective}</td> */}
                      <td className="d-none">
                        {activity?.filePath?.bestPractices || "N/A"}
                      </td>{" "}
                      {/* Hidden */}
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(activity.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(activity.id)}
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
                      No Best Practices data available.
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

export default BestPractices;
