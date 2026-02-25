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
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";

const api = new APIClient();

const Internships: React.FC = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [bosData, setAssoData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState(bosData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const file2Ref = useRef<HTMLInputElement | null>(null);
  const file3Ref = useRef<HTMLInputElement | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState({
    placementFile: false,
    departmentFile: false,
    personalFile: false,
  });
  const [showDeleteModal, setShowDeleteModal] = useState<
    null | "placementFile" | "departmentFile" | "personalFile"
  >(null);
  const fileRefs = {
    placementFile: useRef<HTMLInputElement | null>(null),
    departmentFile: useRef<HTMLInputElement | null>(null),
    personalFile: useRef<HTMLInputElement | null>(null),
  };
  const tableRef = useRef<HTMLTableElement>(null);

  // Fetch internships on initial load
  const fetchInternships = async () => {
    try {
      const response = await api.get("/internship/getAllInternship", "");
      setAssoData(response);
      setFilteredData(response);
    } catch (error) {
      toast.error("Failed to fetch Internship data.");
    }
  };

  // Download file
  // Handle file download actions
  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(`/internship/download/${fileName}`, {
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
        toast.error("Failed to download file. Please try again.");
        console.error("Error downloading file:", error);
      }
    } else {
      toast.error("No file available for download.");
    }
  };

  // Delete file
  const handleDeleteFile = async (
    fileKey: "placementFile" | "departmentFile" | "personalFile"
  ) => {
    try {
      const fileName = validation.values[fileKey];
      if (!fileName || typeof fileName !== "string") {
        toast.error("No file to delete.");
        return;
      }
      await api.delete(
        `internship/deleteInternshipDocument?fileName=${fileName}`,
        ""
      );
      toast.success("File deleted successfully!");
      validation.setFieldValue(fileKey, null);
      setIsFileUploadDisabled((prev) => ({ ...prev, [fileKey]: false }));
      setShowDeleteModal(null);
      // Optionally, clear the file input
      if (fileRefs[fileKey].current) fileRefs[fileKey].current!.value = "";
    } catch (error) {
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  // Open the modal and fetch data
  const handleListAssoClick = async () => {
    if ($.fn.DataTable.isDataTable("#id")) {
      $("#id").DataTable().destroy();
    }
    await fetchInternships();
    setIsModalOpen(true);
  };

  // Handle edit action
  // Fetch the data for the selected Association ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(`/internship?internshipId=${id}`, "");
      const academicYearOptions = await api.get("/getAllAcademicYear", "");
      const filteredAcademicYearList = academicYearOptions.filter(
        (year: any) => year.isCurrent || year.isCurrentForAdmission
      );
      const academicYearList = filteredAcademicYearList.map((year: any) => ({
        value: String(year.year),
        label: year.display,
      }));

      // Map API response to Formik values
      const mappedValues = {
        academicYear: mapValueToLabel(response.academicYear, academicYearList),
        placementFile: response.file?.PlacementCell || null,
        departmentFile: response.file?.Department || null,
        personalFile: response.file?.Pepartment || null,
      };

      // Update Formik values
      validation.setValues({
        ...validation.values,
        ...mappedValues,
      });

      // Disable upload if file exists
      setIsFileUploadDisabled({
        placementFile: !!response.file?.PlacementCell,
        departmentFile: !!response.file?.Department,
        personalFile: !!response.file?.Pepartment,
      });

      setIsEditMode(true);
      setEditId(id);
      toggleModal();
    } catch (error) {
      console.error("Error fetching Internship data by ID:", error);
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
          `/internship/deleteInternship?internshipId=${id}`,
          ""
        );
        setIsModalOpen(false);

        toast.success(
          response.message || "Scholarship Data removed successfully!"
        );
        if ($.fn.DataTable.isDataTable("#id")) {
          $("#id").DataTable().destroy();
        }
        await fetchInternships();
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
            filename: "Internships_Data",
            title: "Internships Data Export",
            exportOptions: {
              columns: ":not(:last-child)",
            },
          },
          {
            extend: "csv",

            filename: "Internships_Data",
            title: "Internships Data Export",
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

  // Formik validation and submission
  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      placementFile: null as File | string | null,
      departmentFile: null as File | string | null,
      personalFile: null as File | string | null,
    },
    validationSchema: Yup.object({
      placementFile: Yup.mixed().test(
        "fileValidation",
        "Please upload a valid file",
        function (value) {
          if (isFileUploadDisabled.placementFile) return true;
          if (!value)
            return this.createError({ message: "Please upload a file" });
          if (value instanceof File && value.size > 10 * 1024 * 1024) {
            return this.createError({ message: "File size is too large" });
          }
          const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
          if (value instanceof File && !allowedTypes.includes(value.type)) {
            return this.createError({ message: "Unsupported file format" });
          }
          return true;
        }
      ),
      departmentFile: Yup.mixed().test(
        "fileValidation",
        "Please upload a valid file",
        function (value) {
          if (isFileUploadDisabled.departmentFile) return true;
          if (!value)
            return this.createError({ message: "Please upload a file" });
          if (value instanceof File && value.size > 10 * 1024 * 1024) {
            return this.createError({ message: "File size is too large" });
          }
          const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
          if (value instanceof File && !allowedTypes.includes(value.type)) {
            return this.createError({ message: "Unsupported file format" });
          }
          return true;
        }
      ),
      personalFile: Yup.mixed().test(
        "fileValidation",
        "Please upload a valid file",
        function (value) {
          if (isFileUploadDisabled.personalFile) return true;
          if (!value)
            return this.createError({ message: "Please upload a file" });
          if (value instanceof File && value.size > 10 * 1024 * 1024) {
            return this.createError({ message: "File size is too large" });
          }
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
      formData.append("id", editId || "");
      formData.append("academicYear", values.academicYear?.value || "");
      if (values.placementFile && values.placementFile instanceof File) {
        formData.append("placementCell", values.placementFile);
      }
      if (values.departmentFile && values.departmentFile instanceof File) {
        formData.append("department", values.departmentFile);
      }
      if (values.personalFile && values.personalFile instanceof File) {
        formData.append("personal", values.personalFile);
      }

      try {
        if (isEditMode && editId) {
          await api.put("/internship", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Internship updated successfully!");
        } else {
          await api.create("/internship", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Internship added successfully!");
        }
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        if (file2Ref.current) {
          file2Ref.current.value = "";
        }
        if (file3Ref.current) {
          file3Ref.current.value = "";
        }
        handleListAssoClick();
        resetForm();
        setIsEditMode(false);
        setEditId(null);
        setIsFileUploadDisabled({
          placementFile: false,
          departmentFile: false,
          personalFile: false,
        });
      } catch (error) {
        toast.error("Failed to save Internship. Please try again.");
        console.error("Error saving Internship:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Placement" breadcrumbItem="Internships" />
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
                  {/* Placement File */}
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="placementFile" className="form-label">
                        Upload Placement Cell
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.placementFile &&
                          validation.errors.placementFile
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="placementFile"
                        innerRef={fileRef}
                        onChange={(event) => {
                          validation.setFieldValue(
                            "placementFile",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFileUploadDisabled.placementFile}
                      />
                      {validation.touched.placementFile &&
                        validation.errors.placementFile && (
                          <div className="text-danger">
                            {validation.errors.placementFile}
                          </div>
                        )}
                      {isFileUploadDisabled.placementFile && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {typeof validation.values.placementFile === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.placementFile}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.placementFile as string
                              )
                            }
                            title="Download File"
                          >
                            <i className="bi bi-download"></i>
                          </Button>
                          <Button
                            color="link"
                            className="text-danger"
                            onClick={() => setShowDeleteModal("placementFile")}
                            title="Delete File"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      )}
                    </div>
                  </Col>
                  {/* Department File */}
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="departmentFile" className="form-label">
                        Upload Department
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.departmentFile &&
                          validation.errors.departmentFile
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="departmentFile"
                        innerRef={file2Ref}
                        onChange={(event) => {
                          validation.setFieldValue(
                            "departmentFile",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFileUploadDisabled.departmentFile}
                      />
                      {validation.touched.departmentFile &&
                        validation.errors.departmentFile && (
                          <div className="text-danger">
                            {validation.errors.departmentFile}
                          </div>
                        )}
                      {isFileUploadDisabled.departmentFile && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {typeof validation.values.departmentFile === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.departmentFile}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.departmentFile as string
                              )
                            }
                            title="Download File"
                          >
                            <i className="bi bi-download"></i>
                          </Button>
                          <Button
                            color="link"
                            className="text-danger"
                            onClick={() => setShowDeleteModal("departmentFile")}
                            title="Delete File"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      )}
                    </div>
                  </Col>
                  {/* Personal File */}
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="personalFile" className="form-label">
                        Upload Personal
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.personalFile &&
                          validation.errors.personalFile
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="personalFile"
                        innerRef={file3Ref}
                        onChange={(event) => {
                          validation.setFieldValue(
                            "personalFile",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFileUploadDisabled.personalFile}
                      />
                      {validation.touched.personalFile &&
                        validation.errors.personalFile && (
                          <div className="text-danger">
                            {validation.errors.personalFile}
                          </div>
                        )}
                      {isFileUploadDisabled.personalFile && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {typeof validation.values.personalFile === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.personalFile}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.personalFile as string
                              )
                            }
                            title="Download File"
                          >
                            <i className="bi bi-download"></i>
                          </Button>
                          <Button
                            color="link"
                            className="text-danger"
                            onClick={() => setShowDeleteModal("personalFile")}
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
                        onClick={handleListAssoClick}
                      >
                        List Internships
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
      </div>
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
                <th>Placement File</th>
                <th className="d-none">Placement File Path</th> {/* Hidden */}
                <th>Department File</th>
                <th className="d-none">Department File Path</th> {/* Hidden */}
                <th>Personal File</th>
                <th className="d-none">PlacementCell File Path</th>{" "}
                {/* Hidden */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((internship, index) => (
                  <tr key={internship.id}>
                    <td>{index + 1}</td>
                    <td>{internship.academicYear}</td>
                    <td>{internship.file?.PlacementCell}</td>
                    <td className="d-none">
                      {internship?.filePath?.PlacementCell || "N/A"}
                    </td>{" "}
                    {/* Hidden */}
                    <td>{internship.file?.Department}</td>
                    <td className="d-none">
                      {internship?.filePath?.Department || "N/A"}
                    </td>{" "}
                    {/* Hidden */}
                    <td>{internship.file?.Pepartment}</td>
                    <td className="d-none">
                      {internship?.filePath?.Personal || "N/A"}
                    </td>{" "}
                    {/* Hidden */}
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleEdit(internship.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(internship.id)}
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
      {/* Confirmation Modal for record */}
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
      {/* Confirmation Modal fro file */}
      <Modal isOpen={!!showDeleteModal} toggle={() => setShowDeleteModal(null)}>
        <ModalBody>Are you sure you want to delete this file?</ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            onClick={() => {
              if (showDeleteModal) handleDeleteFile(showDeleteModal);
            }}
          >
            Yes
          </Button>
          <Button color="secondary" onClick={() => setShowDeleteModal(null)}>
            No
          </Button>
        </ModalFooter>
      </Modal>
      <ToastContainer />
    </React.Fragment>
  );
};

export default Internships;
