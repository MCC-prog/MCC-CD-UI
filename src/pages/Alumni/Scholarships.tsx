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
} from "reactstrap";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";

const api = new APIClient();

const Scholarships: React.FC = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bosData, setAssoData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState(bosData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const fetchScholarshipFileData = async () => {
    try {
      const response = await api.get(
        "/scholorshipProvidedByAlumni/getAllScholorshipProvidedByAlumni",
        ""
      );
      setAssoData(response);
      setFilteredData(response);
    } catch (error) {
      toast.error("Failed to fetch scholarship data.");
    }
  };

  // Handle file download actions
  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(
          `/scholorshipProvidedByAlumni/download/${fileName}`,
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
        toast.error("Failed to download Scholarship file. Please try again.");
        console.error("Error downloading file:", error);
      }
    } else {
      toast.error("No file available for download.");
    }
  };

  // Open the modal and fetch data
  const handleListAssoClick = async () => {
    if ($.fn.DataTable.isDataTable("#id")) {
      $("#id").DataTable().destroy();
    }
    await fetchScholarshipFileData();
    setIsModalOpen(true);
  };

  // Handle edit action
  // Fetch the data for the selected Association ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/scholorshipProvidedByAlumni?scholorshipProvidedByAlumniId=${id}`,
        ""
      );
      const academicYearOptions = await api.get("/getAllAcademicYear", "");
      // Filter the response where isCurrent or isCurrentForAdmission is true
      const filteredAcademicYearList = academicYearOptions.filter(
        (year: any) => year.isCurrent || year.isCurrentForAdmission
      );
      // Map the filtered data to the required format
      const academicYearList = filteredAcademicYearList.map((year: any) => ({
        value: String(year.year),
        label: year.display,
      }));

      // Map API response to Formik values
      const mappedValues = {
        academicYear: mapValueToLabel(response.academicYear, academicYearList),
        id: response.id || "",
        totalScholarshipAmount: response.totalScholarshipAmount || "",
        scholarshipFile: response.file?.Scholorship || null,
      };

      // Update Formik values
      validation.setValues({
        ...validation.values,
        ...mappedValues,
      });
      setIsFileUploadDisabled(!!response.file?.Scholorship);
      setIsEditMode(true);
      setEditId(id);
      toggleModal();
    } catch (error) {
      console.error("Error fetching Association data by ID:", error);
    }
  };

  // Map value to label for dropdowns
  const mapValueToLabel = (
    value: string | null,
    options: { value: string; label: string }[]
  ): { value: string; label: string } | null => {
    if (!value) return null;
    const matchedOption = options.find((option) => option.value === value);
    return matchedOption ? matchedOption : { value, label: String(value) };
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the Association data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/scholorshipProvidedByAlumni/deleteScholorshipProvidedByAlumni?scholorshipProvidedByAlumniId=${id}`,
          ""
        );
        setIsModalOpen(false);

        toast.success(
          response.message || "Scholarship Data removed successfully!"
        );
        if ($.fn.DataTable.isDataTable("#id")) {
          $("#id").DataTable().destroy();
        }
        await fetchScholarshipFileData();
      } catch (error) {
        toast.error("Failed to remove Scholarship Activity. Please try again.");
        console.error("Error deleting Association:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  const toggleModal = () => {
    setIsModalOpen((prev) => {
      if (prev && $.fn.DataTable.isDataTable("#id")) {
        $("#id").DataTable().destroy();
      }
      return !prev;
    });
  };

  useEffect(() => {
    if (!isModalOpen || filteredData.length === 0) return;

    // Destroy any existing DataTable instance
    if ($.fn.DataTable.isDataTable("#id")) {
      $("#id").DataTable().destroy();
    }

    // Use setTimeout to ensure the table is visible in the DOM
    setTimeout(() => {
      const table = $("#id").DataTable({
        destroy: true,
        scrollX: true,
        autoWidth: false,
        dom: "Bfrtip",
        buttons: [
          {
            extend: "copy",
                filename: "Scholarships",
            title: "Scholarships Export",
            exportOptions: {
              columns: ":not(:last-child)",
            },
          },
          {
            extend: "csv",
                filename: "Scholarships",
            title: "Scholarships Export",
            exportOptions: {
              columns: ":not(:last-child)",
            },
          },
        ],
      });

      $(".dt-buttons").addClass("mb-3 gap-2");
      $(".buttons-copy").addClass("btn btn-success");
      $(".buttons-csv").addClass("btn btn-info");

      $("#id").on("buttons-action.dt", function (e, buttonApi) {
        if (buttonApi.text() === "Copy") {
          toast.success("Copied to clipboard!");
        }
      });
    }, 0);

    return () => {
      if ($.fn.DataTable.isDataTable("#id")) {
        $("#id").DataTable().destroy();
      }
    };
  }, [isModalOpen, filteredData]);

  // Handle file deletion
  // Clear the file from the form and show success message
  const handleDeleteFile = async () => {
    try {
      // Call the delete API with the filename
      const response = await api.delete(
        `/scholorshipProvidedByAlumni/deleteScholorshipProvidedByAlumniDocument?fileName=${validation.values.scholarshipFile}`,
        ""
      );
      toast.success(response.message || "File deleted successfully!");
      validation.setFieldValue("scholarshipFile", null);
      setIsFileUploadDisabled(false);
    } catch (error) {
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  // Formik validation and submission
  // Initialize Formik with validation schema and initial values
  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      totalScholarshipAmount: "",
      scholarshipFile: null as File | string | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select academic year"),
      totalScholarshipAmount: Yup.number()
        .typeError("Total Scholarship Amount must be a number")
        .min(0, "Total Scholarship Amount cannot be less than 0")
        .required("Please enter total scholarship amount"),
      scholarshipFile: Yup.mixed().test(
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
      formData.append("id", editId || "");
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append(
        "totalScholarshipAmount",
        values.totalScholarshipAmount || ""
      );
      if (isEditMode) {
        if (
          typeof values.scholarshipFile === "string" || // still the original file path
          values.scholarshipFile === null // or explicitly cleared
        ) {
          formData.append("scholorship", new Blob([]), "empty.txt");
        } else if (values.scholarshipFile instanceof File) {
          formData.append("scholorship", values.scholarshipFile);
        }
      } else if (values.scholarshipFile instanceof File) {
        formData.append("scholorship", values.scholarshipFile);
      }

      try {
        const response =
          isEditMode && editId
            ? await api.put(`/scholorshipProvidedByAlumni`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            : await api.create(`/scholorshipProvidedByAlumni`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });

        toast.success(
          response.message || "scholarshipFile record saved successfully!"
        );
        // Refresh the page data to show the uploaded file
        handleListAssoClick();
        resetForm();
        setIsEditMode(false);
        setEditId(null);
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        setIsFileUploadDisabled(false);
      } catch (error) {
        toast.error("Failed to save scholarshipFile. Please try again.");
        console.error("Error creating/updating scholarshipFile:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Alumini" breadcrumbItem="Scholarships" />
          <Card style={{ height: "350px" }}>
            <CardBody>
              <form onSubmit={validation.handleSubmit}>
                <Input type="hidden" name="id" value={editId || ""} />
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
                      <Label>Total Scholarship Amount</Label>
                      <Input
                        type="number"
                        className={`form-control ${validation.touched.totalScholarshipAmount &&
                          validation.errors.totalScholarshipAmount
                          ? "is-invalid"
                          : ""
                          }`}
                        value={validation.values.totalScholarshipAmount}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "totalScholarshipAmount",
                            e.target.value
                          )
                        }
                        placeholder="Enter Total Scholarship Amount"
                      />
                      {validation.touched.totalScholarshipAmount &&
                        validation.errors.totalScholarshipAmount && (
                          <div className="text-danger">
                            {validation.errors.totalScholarshipAmount}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Scholarship Details</Label>
                      <Input
                        type="file"

                        onChange={(e) =>
                          validation.setFieldValue(
                            "scholarshipFile",
                            e.target.files?.[0] || null
                          )
                        }
                        className={`form-control ${validation.touched.scholarshipFile &&
                          validation.errors.scholarshipFile
                          ? "is-invalid"
                          : ""
                          }`}
                          innerRef={fileRef}
                        disabled={isFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.scholarshipFile &&
                        validation.errors.scholarshipFile && (
                          <div className="text-danger">
                            {validation.errors.scholarshipFile}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.scholarshipFile ===
                        "string" && (
                          <div className="mt-2 d-flex align-items-center">
                            <span
                              className="me-2"
                              style={{ fontWeight: "bold", color: "green" }}
                            >
                              {validation.values.scholarshipFile}
                            </span>
                            <Button
                              color="link"
                              className="text-primary"
                              onClick={() => {
                                if (
                                  typeof validation.values.scholarshipFile ===
                                  "string"
                                ) {
                                  handleDownloadFile(
                                    validation.values.scholarshipFile
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
                              onClick={() => setShowDeleteModal(true)}
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
                          href={`${process.env.PUBLIC_URL}/templateFiles/`}
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
                        onClick={handleListAssoClick}
                      >
                        List Scholarships
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
      </div>
      <ToastContainer />
      {/* Modal for Listing Scholarships */}
      <Modal
        isOpen={isModalOpen}
        toggle={toggleModal}
        size="lg"
        style={{ maxWidth: "100%", width: "auto" }}
      >
        <ModalHeader toggle={toggleModal}>List Activites</ModalHeader>
        <ModalBody>
          <Table striped bordered hover id="id" innerRef={tableRef}>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Academic Year</th>
                <th>Total Scholarship Amount</th>
                <th>Scholarship File</th>
                <th className="d-none">File Path</th> {/* Hidden */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((scholar, index) => (
                  <tr key={scholar.id}>
                    <td>{index + 1}</td>
                    <td>{scholar.academicYear}</td>
                    <td>{scholar.totalScholarshipAmount}</td>
                    <td>{scholar.file?.Scholorship}</td>
                    <td className="d-none">
                      {scholar?.filePath?.Scholorship || "N/A"}
                    </td>{" "}
                    {/* Hidden */}
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleEdit(scholar.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(scholar.id)}
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
                    No Activity data available.
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
          <Button color="secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={showDeleteModal} toggle={() => setShowDeleteModal(false)}>
        <ModalBody>Are you sure you want to delete this file?</ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            onClick={() => {
              handleDeleteFile();
              setShowDeleteModal(false);
            }}
          >
            Yes
          </Button>
          <Button color="secondary" onClick={() => setShowDeleteModal(false)}>
            No
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default Scholarships;
