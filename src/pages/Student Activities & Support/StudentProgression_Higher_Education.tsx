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

const StudentProgression_Higher_Education: React.FC = () => {
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
        coursePurused: response.coursePurused || "",
        heigherEduCu: response.heigherEduCu || "",
        university: response.university || "",
        location: response.location || "",
        icalepal: response.icalepal || "",
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
        coursePurused: response.coursePurused || "",
        heigherEduCu: response.heigherEduCu || "",
        university: response.university || "",
        location: response.location || "",
        icalepal: response.icalepal || "",
        courseDuration: response.courseDuration || "",
        file: response.file || null, // Assuming 'file' is a string or null
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
      coursePurused: "",
      heigherEduCu: "",
      university: "",
      location: "",
      icalepal: "",
      courseDuration: "",
      file: null as File | string | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select academic year"),
      mccRegNo: Yup.string().required("Please enter area of guidance"),
      coursePurused: Yup.number().required(
        "Please enter No. of Participants/Attendees"
      ),
      date: Yup.string().required("Please select date"),
      heigherEduCu: Yup.string().required(
        "Please enter trainer/resource person details"
      ),
      university: Yup.string().required("Please enter university"),
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
      location: Yup.string().required("Please enter location"),
      icalepal: Yup.string()
        .url("Please enter a valid URL")
        .required(
          "Please provide a link for Id Card/Acceptance/Admission Letter-Enrollment Proof"
        ),
      courseDuration: Yup.string().required("Please enter course duration"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        academicYear: values.academicYear?.value || "",
        noOfStaff: values.noOfStaff || "",
        mccRegNo: values.mccRegNo || "",
        coursePurused: values.coursePurused || "",
        heigherEduCu: values.heigherEduCu || "",
        university: values.university || "",
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
            breadcrumbItem="Student Progression - Higher Education"
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
                        Course Pursued in MCC
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.coursePurused &&
                          validation.errors.coursePurused
                            ? "is-invalid"
                            : ""
                        }`}
                        type="number"
                        id="coursePurused"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "coursePurused",
                            e.target.value
                          )
                        }
                        placeholder="Enter part time"
                        value={validation.values.coursePurused}
                      />
                      {validation.touched.coursePurused &&
                        validation.errors.coursePurused && (
                          <div className="text-danger">
                            {validation.errors.coursePurused}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Heigher Education Course
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.heigherEduCu &&
                          validation.errors.heigherEduCu
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="heigherEduCu"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "heigherEduCu",
                            e.target.value
                          )
                        }
                        placeholder="Enter guest faculty"
                        value={validation.values.heigherEduCu}
                      />
                      {validation.touched.heigherEduCu &&
                        validation.errors.heigherEduCu && (
                          <div className="text-danger">
                            {validation.errors.heigherEduCu}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        University
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.university &&
                          validation.errors.university
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="university"
                        onChange={(e) =>
                          validation.setFieldValue("university", e.target.value)
                        }
                        placeholder="Enter professor of practice"
                        value={validation.values.university}
                      />
                      {validation.touched.university &&
                        validation.errors.university && (
                          <div className="text-danger">
                            {validation.errors.university}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Location
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.location &&
                          validation.errors.location
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="location"
                        onChange={(e) =>
                          validation.setFieldValue("location", e.target.value)
                        }
                        placeholder="Enter location"
                        value={validation.values.location}
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
                        Provide a link
                      </Label>
                      <Tooltip
                        placement="right"
                        open={tooltipOpen}
                        onClose={() => setTooltipOpen(false)}
                        onOpen={() => setTooltipOpen(true)}
                        title={
                          <span>
                            Id Card/Acceptance/Admission Letter-Enrollment Proof
                          </span>
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
                          validation.touched.icalepal &&
                          validation.errors.icalepal
                            ? "is-invalid"
                            : ""
                        }`}
                        type="url"
                        id="icalepal"
                        onChange={(e) =>
                          validation.setFieldValue("icalepal", e.target.value)
                        }
                        placeholder="Enter Id Card/Acceptance/Admission Letter-Enrollment Proof-Provide a link"
                        value={validation.values.icalepal}
                      />
                      {validation.touched.icalepal &&
                        validation.errors.icalepal && (
                          <div className="text-danger">
                            {validation.errors.icalepal}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Course Duration
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.courseDuration &&
                          validation.errors.courseDuration
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="courseDuration"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "courseDuration",
                            e.target.value
                          )
                        }
                        placeholder="Enter Course Duration"
                        value={validation.values.courseDuration}
                      />
                      {validation.touched.courseDuration &&
                        validation.errors.courseDuration && (
                          <div className="text-danger">
                            {validation.errors.courseDuration}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Student Progression - Higher Education
                      </Label>
                      <Tooltip
                        placement="right"
                        open={tooltipOpen}
                        onClose={() => setTooltipOpen(false)}
                        onOpen={() => setTooltipOpen(true)}
                        title={
                          <span>Upload an Excel file. Max size 10MB.</span>
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

                  
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Download </Label>
                      <div>
                        <a
                          href="/templateFiles/bos.pdf"
                          download
                          className="btn btn-primary btn-sm"
                        >
                          Student Progression - Higher Education Template
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
                      <td>{bos.coursePurused}</td>
                      <td>{bos.heigherEduCu}</td>
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

export default StudentProgression_Higher_Education;
