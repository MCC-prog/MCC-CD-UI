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
import React, { useState } from "react";
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
import GetAllProgramDropdown from "Components/DropDowns/GetAllProgramDropdown";
import moment from "moment";
import { Tooltip } from "@mui/material";

const api = new APIClient();

const DetailsOfStudents_MOOC: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bosData, setBosData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(bosData);
  const [searchTerm, setSearchTerm] = useState("");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = bosData.filter((row) =>
      Object.values(row).some((val) =>
        String(val || "")
          .toLowerCase()
          .includes(value)
      )
    );
    setFilteredData(filtered);
  };

  // Calculate the paginated data
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch BOS data from the backend
  const fetchBosData = async () => {
    try {
      const response = await axios.get("/staffProfile/getAllStaffProfile"); // Replace with your backend API endpoint
      setBosData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching BOS data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListBosClick = () => {
    toggleModal();
    fetchBosData();
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
        `/staffProfile/edit?staffProfileId=${id}`,
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
        courses: response.programId
          ? {
              value: response.programId.toString(),
              label: response.programName,
            }
          : null,
        noOfStaff: response.noOfStaff || "",
        mccRegNo: response.mccRegNo || "",
        studentName: response.studentName || "",
        offeredBy: response.offeredBy || "",
        moocCourseRegId: response.moocCourseRegId || "",
        moocCoursePursued: response.moocCoursePursued || "",
        duration: response.duration || "",
        courseDuration: response.courseDuration || "",
        file: response.file || null, // Assuming 'file' is a string or null
      };

      // Update Formik values
      validation.setValues({
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
        noOfStaff: response.noOfStaff || "",
        mccRegNo: response.mccRegNo || "",
        studentName: response.studentName || "",
        offeredBy: response.offeredBy || "",
        moocCourseRegId: response.moocCourseRegId || "",
        moocCoursePursued: response.moocCoursePursued || "",
        duration: response.duration || "",
        courseDuration: response.courseDuration || "",
        file: response.file || null, // Assuming 'file' is a string or null
        courses: response.programId
          ? {
              value: response.programId.toString(),
              label: response.programName,
            }
          : null,
      });
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error("Error fetching BOS data by ID:", error);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Call the delete API and refresh the BOS data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/staffProfile/deleteStaffProfile?staffProfileId=${id}`,
          ""
        );
        toast.success(
          response.message || "Staff Profile removed successfully!"
        );
        fetchBosData();
      } catch (error) {
        toast.error("Failed to remove Staff Profile. Please try again.");
        console.error("Error deleting BOS:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      noOfStaff: "",
      mccRegNo: "",
      studentName: "",
      offeredBy: "",
      moocCourseRegId: "",
      moocCoursePursued: "",
      duration: "",
      courseDuration: "",
      file: null as File | string | null,
        courses: null as { value: string; label: string } | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select academic year"),
      mccRegNo: Yup.string().required("Please enter MCC Register number"),
      studentName: Yup.number().required(
        "Please enter student name"
      ),
      date: Yup.string().required("Please select date"),
      offeredBy: Yup.string().required(
        "Please enter offered by"
      ),
      moocCourseRegId: Yup.string().required("Please enter Mooc Course Id/Registration Number"),
     file: Yup.mixed()
        .required("Please upload a file")
        .test("fileSize", "File size is too large", (value: any) => {
          // Skip size validation if file is a string (from existing data)
          if (typeof value === "string") return true;
          return value && value.size <= 50 * 1024 * 1024; // 50MB
        })
        .test("fileType", "Unsupported file format", (value: any) => {
          // Skip type validation if file is a string
          if (typeof value === "string") return true;
          return (
            value &&
            [
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ].includes(value.type)
          );
        }),
      moocCoursePursued: Yup.string().required(
        "Please enter Mooc Course Pursued"
      ),
      duration: Yup.string()
        .url("Please enter a valid URL")
        .required(
          "Please enter Duration"
        ),
      courses: Yup.object().nullable().required("Please select a program"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        academicYear: values.academicYear?.value || "",
        noOfStaff: values.noOfStaff || "",
        mccRegNo: values.mccRegNo || "",
        studentName: values.studentName || "",
        offeredBy: values.offeredBy || "",
        moocCourseRegId: values.moocCourseRegId || "",
      };

      // If editing, include the ID
      if (isEditMode && editId) {
        payload["staffProfileId"] = editId;
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(`/staffProfile/update`, payload);
          toast.success(
            response.message || "Staff Profile updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create("/staffProfile/save", payload);
          toast.success(
            response.message || "Staff Profile added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        // display the BOS List
        handleListBosClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Staff Profile. Please try again.");
        console.error("Error creating BOS:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Student Activities & Support"
            breadcrumbItem="Details of Students Enrolled for MOOC"
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

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        MCC Register number
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.mccRegNo &&
                          validation.errors.mccRegNo
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="mccRegNo"
                        onChange={(e) =>
                          validation.setFieldValue("mccRegNo", e.target.value)
                        }
                        placeholder="Enter full time"
                        value={validation.values.mccRegNo}
                      />
                      {validation.touched.mccRegNo &&
                        validation.errors.mccRegNo && (
                          <div className="text-danger">
                            {validation.errors.mccRegNo}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Student Name
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.studentName &&
                          validation.errors.studentName
                            ? "is-invalid"
                            : ""
                        }`}
                        type="number"
                        id="studentName"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "studentName",
                            e.target.value
                          )
                        }
                        placeholder="Enter Student Name"
                        value={validation.values.studentName}
                      />
                      {validation.touched.studentName &&
                        validation.errors.studentName && (
                          <div className="text-danger">
                            {validation.errors.studentName}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Program</Label>
                      <GetAllProgramDropdown
                        value={validation.values.courses}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("courses", selectedOption)
                        }
                        isInvalid={
                          validation.touched.courses &&
                          !!validation.errors.courses
                        }
                      />
                      {validation.touched.courses &&
                        validation.errors.courses && (
                          <div className="text-danger">
                            {Array.isArray(validation.errors.courses)
                              ? validation.errors.courses.join(", ")
                              : validation.errors.courses}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Offered By
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.offeredBy &&
                          validation.errors.offeredBy
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="offeredBy"
                        onChange={(e) =>
                          validation.setFieldValue("offeredBy", e.target.value)
                        }
                        placeholder="Enter offered by"
                        value={validation.values.offeredBy}
                      />
                      {validation.touched.offeredBy &&
                        validation.errors.offeredBy && (
                          <div className="text-danger">
                            {validation.errors.offeredBy}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Mooc Course Id/Registration Number
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.moocCourseRegId &&
                          validation.errors.moocCourseRegId
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="moocCourseRegId"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "moocCourseRegId",
                            e.target.value
                          )
                        }
                        placeholder="Enter Mooc Course Id/Registration Number"
                        value={validation.values.moocCourseRegId}
                      />
                      {validation.touched.moocCourseRegId &&
                        validation.errors.moocCourseRegId && (
                          <div className="text-danger">
                            {validation.errors.moocCourseRegId}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Mooc Course Pursued
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.moocCoursePursued &&
                          validation.errors.moocCoursePursued
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="moocCoursePursued"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "moocCoursePursued",
                            e.target.value
                          )
                        }
                        placeholder="Enter Mooc Course Pursued"
                        value={validation.values.moocCoursePursued}
                      />
                      {validation.touched.moocCoursePursued &&
                        validation.errors.moocCoursePursued && (
                          <div className="text-danger">
                            {validation.errors.moocCoursePursued}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Duration
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.duration &&
                          validation.errors.duration
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="duration"
                        onChange={(e) =>
                          validation.setFieldValue("duration", e.target.value)
                        }
                        placeholder="Enter Duration"
                        value={validation.values.duration}
                      />
                      {validation.touched.duration &&
                        validation.errors.duration && (
                          <div className="text-danger">
                            {validation.errors.duration}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Certificate of Completion
                      </Label>
                      <Tooltip
                        placement="right"
                        open={tooltipOpen}
                        onClose={() => setTooltipOpen(false)}
                        onOpen={() => setTooltipOpen(true)}
                        title={
                          <span>Upload file. Max size 10MB.</span>
                        }
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
                        id="formFile"
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
                            //   onClick={() =>
                            //     handleDownloadFile(
                            //       validation.values.file as string
                            //     )
                            //   }
                            title="Download File"
                          >
                            <i className="bi bi-download"></i>
                          </Button>
                          <Button
                            color="link"
                            className="text-danger"
                            //   onClick={() => handleDeleteFile()}
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
                        onClick={handleListBosClick}
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
        <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>List Staff Profile</ModalHeader>
          <ModalBody>
            <Table className="table-hover custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>Stream</th>
                  <th>No.Of Staff</th>
                  <th>Full Time</th>
                  <th>Part Time</th>
                  <th>Guest Faculty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bosData.length > 0 ? (
                  bosData.map((bos, index) => (
                    <tr key={bos.id}>
                      <td>{index + 1}</td>
                      <td>{bos.academicYear}</td>
                      <td>{bos.streamName}</td>
                      <td>{bos.noOfStaff}</td>
                      <td>{bos.mccRegNo}</td>
                      <td>{bos.studentName}</td>
                      <td>{bos.offeredBy}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEdit(bos.staffProfileId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(bos.staffProfileId)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No BOS data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            {/* Pagination Controls */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Button
                color="primary"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <div>
                Page {currentPage} of {totalPages}
              </div>
              <Button
                color="primary"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
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

export default DetailsOfStudents_MOOC;
