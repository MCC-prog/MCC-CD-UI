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
  Tooltip,
} from "reactstrap";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GetAllDepartmentDropdown from "Components/DropDowns/GetAllDepartmentDropdown";
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
import StreamDropdown from "Components/DropDowns/StreamDropdown";

const api = new APIClient();

const Teacher_Student_Award: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teacherStudentAwardData, setTeacherStudentAwardData] = useState<any[]>(
    []
  );
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [isFile2UploadDisabled, setIsFile2UploadDisabled] = useState(false);
  const [filteredData, setFilteredData] = useState(teacherStudentAwardData);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const tableRef = useRef<HTMLTableElement>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const fileRef1 = useRef<HTMLInputElement | null>(null);
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch teacherStudentAward data from the backend
  const fetchTeacherStudentAwardData = async () => {
    try {
      const response = await api.get(
        "/studentAwardExtensionActivity/getAllStudentAwardExtensionActivity",
        ""
      );
      setTeacherStudentAwardData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Teacher Student Award:", error);
    }
  };

  // Open the modal and fetch data
  const handleListTeacherStudentAwardClick = () => {
    toggleModal();
    fetchTeacherStudentAwardData();
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
      const response = await api.get(
        `/studentAwardExtensionActivity/edit?studentAwardExtensionActivityId=${id}`,
        ""
      );

      // Map API response to Formik values
      const mappedValues = {
        name: response.name || "",
        stream: response.streamId
          ? { value: response.streamId.toString(), label: response.streamName }
          : null,
        department: response.departmentId
          ? {
            value: response.departmentId.toString(),
            label: response.departmentName,
          }
          : null,
        organisation: response.organisation || "",
        awardReceivedYear: response.awardReceivedYear || "",
       // file: response.document?.recognitionCertificate || null,
        certificateFile: response.document?.certificate || null,
      };
      // Update Formik values
      validation.setValues({
        ...mappedValues,
       // file: response.document?.recognitionCertificate || null,
        certificateFile: response.document?.certificate || null,
      });

      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
    //  setIsFileUploadDisabled(!!response.document?.recognitionCertificate);
      setIsFile2UploadDisabled(!!response.document?.certificate);
      toggleModal();
    } catch (error) {
      console.error("Error fetching Student Award data by ID:", error);
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
          `/studentAwardExtensionActivity/deleteStudentAwardExtensionActivity?studentAwardExtensionActivityId=${id}`,
          ""
        );
        setIsModalOpen(false);
        toast.success(
          response.message || "Teacher Student Award  removed successfully!"
        );
        fetchTeacherStudentAwardData();
      } catch (error) {
        toast.error(
          "Failed to remove Teacher Student Award . Please try again."
        );
        console.error("Error deleting Teacher Student Award:", error);
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
          `/studentAwardExtensionActivity/download/${fileName}`,
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
  const handleDeleteFile = async (docType: string) => {
    try {
      // Call the delete API
      const response = await api.delete(
        `/studentAwardExtensionActivity/deleteStudentAwardExtensionActivityDocument?studentAwardExtensionActivityId=${editId}&docType=${docType}`,
        ""
      );
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      // Clear the file from the form
      // if (docType === "recognitionCertificate") {
      //   validation.setFieldValue("file", null);
      //   setIsFileUploadDisabled(false);
      // } else 
      if (docType === "certificate") {
        validation.setFieldValue("certificateFile", null);
        setIsFile2UploadDisabled(false);
      }
    } catch (error) {
      // Show error message
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  const validation = useFormik({
    initialValues: {
      name: "",
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      organisation: "",
      awardReceivedYear: "",
    //  file: null as File | string | null,
      certificateFile: null as File | string | null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please select Presenter Name"),
      stream: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select school"),
      department: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select department"),
      organisation: Yup.string().required("Please select Organization"),
      awardReceivedYear: Yup.string().required(
        "Please select Year of Receiving Award"
      ),
      // file: Yup.mixed()
      //   .required("Please upload a file")
      //   .test("fileSize", "File size is too large", (value: any) => {
      //     if (typeof value === "string") return true;
      //     return value && value.size <= 2 * 1024 * 1024; // 2MB limit
      //   })
      //   .test("fileType", "Unsupported file format", (value: any) => {
      //     if (typeof value === "string") return true;
      //     return (
      //       value &&
      //       ["application/pdf", "image/jpeg", "image/png"].includes(value.type)
      //     );
      //   }),
      certificateFile: Yup.mixed()
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
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("name", values.name || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("organisation", values.organisation || "");
      formData.append("awardReceivedYear", values.awardReceivedYear || "");

      // if (isEditMode && typeof values.file === "string") {
      //   // Pass an empty Blob instead of null
      //   formData.append("file", new Blob([]), "empty.pdf");
      // } else if (isEditMode && values.file === null) {
      //   formData.append("file", new Blob([]), "empty.pdf");
      // } else if (values.file) {
      //   formData.append("file", values.file);
      // }
      if (isEditMode && typeof values.certificateFile === "string") {
        // Pass an empty Blob instead of null
        formData.append("certificate", new Blob([]), "empty.pdf");
      } else if (isEditMode && values.certificateFile === null) {
        formData.append("certificate", new Blob([]), "empty.pdf");
      } else if (values.certificateFile) {
        formData.append("certificate", values.certificateFile);
      }

      // If editing, include ID
      if (isEditMode && editId) {
        formData.append("studentAwardExtensionActivityId", editId);
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/studentAwardExtensionActivity/update`,
            formData
          );
          toast.success(
            response.message || "Teacher Student Award updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/studentAwardExtensionActivity/save",
            formData
          );
          toast.success(
            response.message || "Teacher Student Award added successfully!"
          );
        }
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        if (fileRef1.current) {
          fileRef1.current.value = "";
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        setIsFileUploadDisabled(false); // Enable the file upload button
        setIsFile2UploadDisabled(false); // Enable the file upload button
        handleListTeacherStudentAwardClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Teacher Student Award. Please try again.");
        console.error("Error creating Teacher Student Award:", error);
      }
    },
  });

  useEffect(() => {
    if (teacherStudentAwardData.length === 0) return; // wait until data is loaded

    const table = $("#awardId").DataTable({
      destroy: true,
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Teacher_Student_Award_Data",
          title: "Teacher Student Award Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Teacher_Student_Award_Data",
          title: "Teacher Student Award Data Export",
          exportOptions: {
            columns: ":not(:last-child)",
          },
        },
      ],
    });
    $(".dt-buttons").addClass("mb-3 gap-2");
    $(".buttons-copy").addClass("btn btn-success");
    $(".buttons-csv").addClass("btn btn-info");

    $("#awardId").on(
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
  }, [teacherStudentAwardData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Extension Activity"
            breadcrumbItem="Teacher Student Awards"
          />
          <Card>
            <CardBody>
              <form onSubmit={validation.handleSubmit}>
                <Row>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Faculty/Student Name</Label>
                      <Input
                        type="text"
                        className={`form-control ${validation.touched.name && validation.errors.name
                          ? "is-invalid"
                          : ""
                          }`}
                        value={validation.values.name}
                        onChange={(e) =>
                          validation.setFieldValue("name", e.target.value)
                        }
                        placeholder="Enter Presenter Name"
                      />
                      {validation.touched.name && validation.errors.name && (
                        <div className="text-danger">
                          {validation.errors.name}
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
                  {/* <Col lg={4}>
                    <div className="mb-3">
                      <Label>Department</Label>
                      <GetAllDepartmentDropdown
                        value={validation.values.department}
                        onChange={(selectedOption) => {
                          validation.setFieldValue(
                            "department",
                            selectedOption
                          );
                          setSelectedDepartment(selectedOption);
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
                  </Col> */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Presenting Organization</Label>
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
                        placeholder="Enter Organization"
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
                      <Label>Year Of Receiving Award</Label>
                      <Input
                        type="number"
                        className={`form-control ${validation.touched.awardReceivedYear &&
                          validation.errors.awardReceivedYear
                          ? "is-invalid"
                          : ""
                          }`}
                        value={validation.values.awardReceivedYear}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "awardReceivedYear",
                            e.target.value
                          )
                        }
                        placeholder="Enter Year Of Receiving Award"
                      />
                      {validation.touched.awardReceivedYear &&
                        validation.errors.awardReceivedYear && (
                          <div className="text-danger">
                            {validation.errors.awardReceivedYear}
                          </div>
                        )}
                    </div>
                  </Col>
                  {/* <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Teacher Student Awards
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
                            onClick={() => handleDeleteFile("recognitionCertificate")}
                            title="Delete File"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      )}
                    </div>
                  </Col> */}
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Certificate
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
                        className={`form-control ${validation.touched.certificateFile &&
                          validation.errors.certificateFile
                          ? "is-invalid"
                          : ""
                          }`}
                        type="file"
                        id="formFile"
                        innerRef={fileRef1}
                        onChange={(event) => {
                          validation.setFieldValue(
                            "certificateFile",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFile2UploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.certificateFile &&
                        validation.errors.certificateFile && (
                          <div className="text-danger">
                            {validation.errors.certificateFile}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFile2UploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.certificateFile ===
                        "string" && (
                          <div className="mt-2 d-flex align-items-center">
                            <span
                              className="me-2"
                              style={{ fontWeight: "bold", color: "green" }}
                            >
                              {validation.values.certificateFile}
                            </span>
                            <Button
                              color="link"
                              className="text-primary"
                              onClick={() =>
                                handleDownloadFile(
                                  validation.values.certificateFile as string
                                )
                              }
                              title="Download File"
                            >
                              <i className="bi bi-download"></i>
                            </Button>
                            <Button
                              color="link"
                              className="text-danger"
                              onClick={() => handleDeleteFile("certificate")}
                              title="Delete certificateFile"
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
                        onClick={handleListTeacherStudentAwardClick}
                      >
                        List Teacher Student Award
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Award */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Teacher Student Award
          </ModalHeader>
          <ModalBody>
            <Table striped bordered hover id="awardId" innerRef={tableRef}>
              <thead className="table-dark">
                <tr>
                  <th>Sl.No</th>
                  <th>Faculty/Student Name</th>
                  <th>School</th>
                  <th>Department</th>
                  <th>Presenting Organization</th>
                  <th>Year Of Receiving Award</th>
                      {/* <th className="d-none">FilePath</th> */}
                  <th className="d-none">Certificate File</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teacherStudentAwardData.length > 0 ? (
                  teacherStudentAwardData.map((award, index) => (
                    <tr key={award.awardId}>
                      <td>{index + 1}</td>
                      <td>{award.name}</td>
                      <td>{award.streamName}</td>
                      <td>{award.departmentName}</td>
                      <td>{award.organisation}</td>
                      <td>{award.awardReceivedYear}</td>
                      {/* <td className="d-none">
                        {award?.filePath?.recognitionCertificate || "N/A"}
                      </td> */}
                      <td className="d-none">
                        {award?.filePath.certificate || "N/A"}
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() =>
                              handleEdit(award.studentAwardExtensionActivityId)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleDelete(
                                award.studentAwardExtensionActivityId
                              )
                            }
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
                      No Teacher Student Award data available.
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

export default Teacher_Student_Award;
