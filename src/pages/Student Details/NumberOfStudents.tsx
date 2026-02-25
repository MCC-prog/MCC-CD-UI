import axios from "axios";
import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import ProgramDropdown from "Components/DropDowns/ProgramDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
import SemesterDropdowns from "Components/DropDowns/SemesterDropdowns";
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
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
const api = new APIClient();

const NumberOfStudents: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nosData, setNOSData] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(nosData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    academicYear: "",
    ug: "",
    pg: "",
  });
  const tableRef = useRef<HTMLTableElement>(null);

  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [isFile2UploadDisabled, setIsFile2UploadDisabled] = useState(false);

  const fileRefUg = useRef<HTMLInputElement | null>(null);
  const fileRefPg = useRef<HTMLInputElement | null>(null);


  // Calculate the paginated data
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleDeleteFile = async (docType: string) => {
    try {
      // Call the delete API
      const response = await api.delete(
        `/studentsEnrolled/deleteStudentsEnrolledDocument?studentEnrolledId=${editId}&docType=${docType}`,
        ""
      );
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      if (docType === "ugFile") {
        validation.setFieldValue("ugFile", null); // Clear the file from Formik state
        setIsFileUploadDisabled(false); // Enable the file upload button for UG
      }
      if (docType === "pgFile") {
        validation.setFieldValue("pgFile", null); // Clear the file from Formik state
        setIsFile2UploadDisabled(false); // Enable the file upload button for PG
      }
      // Remove the file from the form
      validation.setFieldValue("file", null); // Clear the file from Formik state
      setIsFileUploadDisabled(false); // Enable the file upload button
    } catch (error) {
      // Show error message
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(
          `/studentsEnrolled/download/${fileName}`,
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

  // Fetch BOS data from the backend
  const fetchNOSData = async () => {
    try {
      const response = await axios.get(
        "/studentsEnrolled/getAllStudentsEnrolled"
      ); // Replace with your backend API endpoint
      setNOSData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching BOS data:", error);
    }
  };

  // Open the modal and fetch data
  const handleNOSClick = () => {
    toggleModal();
    fetchNOSData();
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
        `/studentsEnrolled/edit?studentEnrolledId=${id}`,
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
        NumberOfUg: response.ug || "",
        NumberOfPg: response.pg || "",

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
        ugFile: response.document?.ugFile || null,
        pgFile: response.document?.pgFile || null,
      });
      setIsFileUploadDisabled(!!response.document?.ugFile);
      setIsFile2UploadDisabled(!!response.document?.pgFile);
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
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
          `/studentsEnrolled/deleteStudentsEnrolled?studentEnrolledId=${id}`,
          ""
        );
        setIsModalOpen(false);
        toast.success(
          response.message ||
          "Number of Students Enrolled removed successfully!"
        );
        fetchNOSData();
      } catch (error) {
        toast.error(
          "Failed to remove Number of Students Enrolled. Please try again."
        );
        console.error("Error deleting BOS:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  interface FormValues {
    academicYear: { value: string; label: string } | null;
    NumberOfPg: string;
    NumberOfUg: string;
    ugFile: File | string | null;
    pgFile: File | string | null;
  }

  const validation = useFormik<FormValues>({
    initialValues: {
      academicYear: null,
      NumberOfPg: "",
      NumberOfUg: "",
      ugFile: null as File | string | null,
      pgFile: null as File | string | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .shape({
          value: Yup.string().required(),
          label: Yup.string().required(),
        })
        .nullable()
        .required("Please select academic year"),
      NumberOfPg: Yup.string().required("Please enter PG"),
      NumberOfUg: Yup.string().required("Please enter UG"),

      ugFile: Yup.mixed().test(
        "fileValidation",
        "Please upload a valid Excel file",
        function (value) {
          if (isFileUploadDisabled) return true;

          if (!value) {
            return this.createError({ message: "Please upload a file" });
          }

          // File size check (2MB)
          if (value instanceof File && value.size > 10 * 1024 * 1024) {
            return this.createError({
              message: "File size is too large (max 2MB)",
            });
          }

          // ✅ Allowed MIME types for Excel
          const allowedTypes = [
            "application/vnd.ms-excel", // .xls
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
          ];

          if (value instanceof File && !allowedTypes.includes(value.type)) {
            return this.createError({
              message: "Only Excel files are allowed",
            });
          }

          return true;
        }
      ),
      pgFile: Yup.mixed().test(
        "fileValidation",
        "Please upload a valid Excel file",
        function (value) {
          if (isFileUploadDisabled) return true;

          if (!value) {
            return this.createError({ message: "Please upload a file" });
          }

          // File size check (2MB)
          if (value instanceof File && value.size > 10 * 1024 * 1024) {
            return this.createError({
              message: "File size is too large (max 2MB)",
            });
          }

          // ✅ Allowed MIME types for Excel
          const allowedTypes = [
            "application/vnd.ms-excel", // .xls
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
          ];

          if (value instanceof File && !allowedTypes.includes(value.type)) {
            return this.createError({
              message: "Only Excel files are allowed",
            });
          }

          return true;
        }
      ),
    }),
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();
      formData.append("studentEnrolledId", editId || "");
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("pg", values.NumberOfPg || "");
      formData.append("ug", values.NumberOfUg || "");
      if (isEditMode && typeof values.pgFile === "string") {
        formData.append(
          "pgFile",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.pgFile === null) {
        formData.append(
          "pgFile",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.pgFile) {
        formData.append("pgFile", values.pgFile);
      }
      if (isEditMode && typeof values.ugFile === "string") {
        formData.append(
          "ugFile",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.ugFile === null) {
        formData.append(
          "ugFile",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.ugFile) {
        formData.append("ugFile", values.ugFile);
      }


      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/studentsEnrolled/update`, formData);
          toast.success(
            response.message ||
            "Number of Students Enrolled updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create("/studentsEnrolled/save", formData);
          toast.success(
            response.message ||
            "Number of Students Enrolled added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        if (fileRefUg.current) fileRefUg.current.value = "";
        if (fileRefPg.current) fileRefPg.current.value = "";
        setIsFileUploadDisabled(false);
        setIsFile2UploadDisabled(false);
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the BOS List
        handleNOSClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Number of Students Enrolled. Please try again."
        );
        console.error("Error creating BOS:", error);
      }
    },
  });

  useEffect(() => {
    if (nosData.length === 0) return; // wait until data is loaded

    const table = $("#id").DataTable({
     destroy: true,
    scrollX: true,
    autoWidth: false,
    dom: "Bfrtip",
    paging: true,
    pageLength: 10,
    info: true,
    searching: false,

    columnDefs: [
      { targets: [4, 5], visible: false }, // hide UG(file) & PG(file)
      { targets: 6, orderable: false, searchable: false }, // Actions column
    ],

    buttons: [
      {
        extend: "copy",
          filename: "Number_of_Students_Enrolled_Data",
          title: "Number of Students Enrolled Data Export",
        exportOptions: {
          modifier: { page: "all" },
          columns: function (idx) {
            return idx !== 6; // exclude Actions
          },
        },
      },
      {
        extend: "csv",
          filename: "Number_of_Students_Enrolled_Data",
          title: "Number of Students Enrolled Data Export",
        exportOptions: {
          modifier: { page: "all" },
          columns: function (idx) {
            return idx !== 6; // exclude Actions
          },
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
  }, [nosData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Student Details"
            breadcrumbItem="Number of Students Enrolled(Categories - wise)"
          />
          <Card style={{ height: "500px" }}>
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
                      <Label>Total count of UG</Label>
                      <Input
                        type="text"
                        className={`form-control ${validation.touched.NumberOfUg &&
                          validation.errors.NumberOfUg
                          ? "is-invalid"
                          : ""
                          }`}
                        value={validation.values.NumberOfUg}
                        onChange={(e) =>
                          validation.setFieldValue("NumberOfUg", e.target.value)
                        }
                        placeholder="Enter UG"
                      />
                      {validation.touched.NumberOfUg &&
                        validation.errors.NumberOfUg && (
                          <div className="text-danger">
                            {validation.errors.NumberOfUg}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Report of UG
                      </Label>
                      <Input
                        className={`form-control ${validation.touched.ugFile && validation.errors.ugFile
                          ? "is-invalid"
                          : ""
                          }`}
                        type="file"
                        id="formFile"
                        innerRef={fileRefUg}
                        accept=".xls, .xlsx"
                        onChange={(event) => {
                          validation.setFieldValue(
                            "ugFile",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.ugFile &&
                        validation.errors.ugFile && (
                          <div className="text-danger">
                            {validation.errors.ugFile}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.ugFile === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.ugFile}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.ugFile as string
                              )
                            }
                            title="Download File"
                          >
                            <i className="bi bi-download"></i>
                          </Button>
                          <Button
                            color="link"
                            className="text-danger"
                            onClick={() => handleDeleteFile("ugFile")}
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
                      <Label>Total count of PG</Label>
                      <Input
                        type="text"
                        className={`form-control ${validation.touched.NumberOfPg &&
                          validation.errors.NumberOfPg
                          ? "is-invalid"
                          : ""
                          }`}
                        value={validation.values.NumberOfPg}
                        onChange={(e) =>
                          validation.setFieldValue("NumberOfPg", e.target.value)
                        }
                        placeholder="Enter PG"
                      />
                      {validation.touched.NumberOfPg &&
                        validation.errors.NumberOfPg && (
                          <div className="text-danger">
                            {validation.errors.NumberOfPg}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Report of PG
                      </Label>
                      <Input
                        className={`form-control ${validation.touched.pgFile && validation.errors.pgFile
                          ? "is-invalid"
                          : ""
                          }`}
                        type="file"
                        id="formFile"
                        innerRef={fileRefPg}
                        accept=".xls, .xlsx"
                        onChange={(event) => {
                          validation.setFieldValue(
                            "pgFile",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFile2UploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.pgFile &&
                        validation.errors.pgFile && (
                          <div className="text-danger">
                            {validation.errors.pgFile}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFile2UploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.pgFile === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.pgFile}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.pgFile as string
                              )
                            }
                            title="Download File"
                          >
                            <i className="bi bi-download"></i>
                          </Button>
                          <Button
                            color="link"
                            className="text-danger"
                            onClick={() => handleDeleteFile("pgFile")}
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
                          href={`${process.env.PUBLIC_URL}/templateFiles/BOS_MoM_DeptName_Aug24.docx`}
                          download
                          className="btn btn-primary btn-sm"
                        >
                          Excel Template
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
                        onClick={handleNOSClick}
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
        {/* Modal for Listing BOS */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List of Number of Students
          </ModalHeader>
          <ModalBody>
            <Table striped bordered hover id="id" innerRef={tableRef}>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>UG</th>
                  <th>PG</th>
                  <th className="export-hidden">UG(file)</th>
                  <th className="export-hidden">PG(file)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {nosData.length > 0 ? (
                  nosData.map((bos, index) => (
                    <tr key={bos.studentEnrolledId}>
                      <td>{index + 1}</td>
                      <td>{bos.academicYear}</td>
                      <td>{bos.ug}</td>
                      <td>{bos.pg}</td>
                      <td className="export-hidden">{bos.document?.ugFile || "N/A" }</td>
                      <td className="export-hidden">{bos.document?.pgFile || "N/A"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(bos.studentEnrolledId)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(bos.studentEnrolledId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center">
                      No Number of Students Enrolled data available.
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

export default NumberOfStudents;
