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
  Tooltip,
} from "reactstrap";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast, ToastContainer } from "react-toastify";
import GetAllProgramDropdown from "Components/DropDowns/GetAllProgramDropdown";
import Select from "react-select";
import moment from "moment";

const api = new APIClient();

const Guest_Lectures: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bosData, setBosData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(bosData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

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
        courses: response.courses
          ? {
              value: response.courses.toString(),
              label: response.courses,
            }
          : null,
        semType: response.semType
          ? {
              value: response.semType.toString(),
              label: response.semType,
            }
          : null,
        date: response.date
          ? moment(response.date, "DD/MM/YYYY").format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
          : "",
        resourcePersonName: response.resourcePersonName || "",
        resourcePersonOrganization: response.resourcePersonOrganization || "",
        affiliationOrg: response.affiliationOrg || "",
        titleOfTalk: response.titleOfTalk || "",
        targetAudience: response.targetAudience || "",
        noOfParticipants: response.noOfParticipants || "",
        file: response.file || null, // Handle file upload
      };

      // Update Formik values
      validation.setValues({
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
        stream: mappedValues.stream
          ? { ...mappedValues.stream, value: String(mappedValues.stream.value) }
          : null,
        department: mappedValues.department
          ? {
              ...mappedValues.department,
              value: String(mappedValues.department.value),
            }
          : null,
        courses: mappedValues.courses
          ? {
              ...mappedValues.courses,
              value: String(mappedValues.courses.value),
            }
          : null,
        semType: mappedValues.semType
          ? {
              ...mappedValues.semType,
              value: String(mappedValues.semType.value),
            }
          : null,
        date: mappedValues.date
          ? moment(mappedValues.date, "YYYY-MM-DD").format("DD/MM/YYYY") // Convert to dd/mm/yyyy for the input
          : "",
        resourcePersonName: response.resourcePersonName || "",
        resourcePersonOrganization: response.resourcePersonOrganization || "",
        affiliationOrg: response.affiliationOrg || "",
        titleOfTalk: response.titleOfTalk || "",
        targetAudience: response.targetAudience || "",
        noOfParticipants: response.noOfParticipants || "",
        file: response.file || null, // Handle file upload
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

  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
  };

  const semType = [
    { value: "T", label: "Even" },
    { value: "P", label: "Odd" },
  ];

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      courses: null as { value: string; label: string } | null,
      semType: null as { value: string; label: string } | null,
      date: "",
      resourcePersonName: "",
      resourcePersonOrganization: "",
      affiliationOrg: "",
      titleOfTalk: "",
      targetAudience: "",
      noOfParticipants: "",
      stream: null as { value: string; label: string } | null,
      file: null as File | string | null, // Allow file to be a string for edit mode
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select academic year"),
      stream: Yup.object().nullable().required("Please select stream"),
      department: Yup.object().nullable().required("Please select department"),
      courses: Yup.object().nullable().required("Please select program"),
      semType: Yup.object().nullable().required("Please select semester"),
      date: Yup.string()
        .required("Please select date")
        .matches(
          /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
          "Date must be in dd/mm/yyyy format"
        ),
      noOfParticipants: Yup.number()
        .required("Please enter no of participants")
        .min(1, "No. of participants must be at least 1")
        .max(1000, "No. of participants cannot exceed 1000"),

      resourcePersonName: Yup.string().required(
        "Please enter resource person name"
      ),
      resourcePersonOrganization: Yup.string().required(
        "Please enter full time"
      ),
      affiliationOrg: Yup.string().required(
        "Please enter affiliation/organization"
      ),
      titleOfTalk: Yup.string().required("Please enter title of talk"),
      targetAudience: Yup.string().required("Please enter target audience"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        academicYear: values.academicYear?.value || "",
        streamId: values.stream?.value || "",
        resourcePersonName: values.resourcePersonName || "",
        resourcePersonOrganization: values.resourcePersonOrganization || "",
        affiliationOrg: values.affiliationOrg || "",
        titleOfTalk: values.titleOfTalk || "",
        targetAudience: values.targetAudience || "",
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
            breadcrumbItem="Guest Lectures"
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

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Semester</Label>
                      <Select
                        options={semType}
                        value={validation.values.semType}
                        onChange={(selectedOptions) =>
                          validation.setFieldValue("semType", selectedOptions)
                        }
                        placeholder="Select Semester"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.semType &&
                          validation.errors.semType
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.semType &&
                        validation.errors.semType && (
                          <div className="text-danger">
                            {validation.errors.semType}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        name="date"
                        value={
                          validation.values.date
                            ? moment(
                                validation.values.date,
                                "DD/MM/YYYY"
                              ).format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                            : ""
                        }
                        // onChange={validation.handleChange}
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
                          validation.setFieldValue("date", formattedDate);
                        }}
                        placeholder="Enter date"
                        className={
                          validation.touched.date && validation.errors.date
                            ? "is-invalid"
                            : ""
                        }
                      />
                      {validation.touched.date && validation.errors.date && (
                        <div className="text-danger">
                          {validation.errors.date}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Resource Person Name
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.resourcePersonName &&
                          validation.errors.resourcePersonName
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="resourcePersonName"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "resourcePersonName",
                            e.target.value
                          )
                        }
                        placeholder="Enter no of staff"
                        value={validation.values.resourcePersonName}
                      />
                      {validation.touched.resourcePersonName &&
                        validation.errors.resourcePersonName && (
                          <div className="text-danger">
                            {validation.errors.resourcePersonName}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Resource Person Designation
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.resourcePersonOrganization &&
                          validation.errors.resourcePersonOrganization
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="resourcePersonOrganization"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "resourcePersonOrganization",
                            e.target.value
                          )
                        }
                        placeholder="Enter full time"
                        value={validation.values.resourcePersonOrganization}
                      />
                      {validation.touched.resourcePersonOrganization &&
                        validation.errors.resourcePersonOrganization && (
                          <div className="text-danger">
                            {validation.errors.resourcePersonOrganization}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Affiliation/Organization
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.affiliationOrg &&
                          validation.errors.affiliationOrg
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="affiliationOrg"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "affiliationOrg",
                            e.target.value
                          )
                        }
                        placeholder="Enter part time"
                        value={validation.values.affiliationOrg}
                      />
                      {validation.touched.affiliationOrg &&
                        validation.errors.affiliationOrg && (
                          <div className="text-danger">
                            {validation.errors.affiliationOrg}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Title of the Talk
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.titleOfTalk &&
                          validation.errors.titleOfTalk
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="titleOfTalk"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "titleOfTalk",
                            e.target.value
                          )
                        }
                        placeholder="Enter guest faculty"
                        value={validation.values.titleOfTalk}
                      />
                      {validation.touched.titleOfTalk &&
                        validation.errors.titleOfTalk && (
                          <div className="text-danger">
                            {validation.errors.titleOfTalk}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Target Audience
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.targetAudience &&
                          validation.errors.targetAudience
                            ? "is-invalid"
                            : ""
                        }`}
                        type="text"
                        id="targetAudience"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "targetAudience",
                            e.target.value
                          )
                        }
                        placeholder="Enter professor of practice"
                        value={validation.values.targetAudience}
                      />
                      {validation.touched.targetAudience &&
                        validation.errors.targetAudience && (
                          <div className="text-danger">
                            {validation.errors.targetAudience}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        No. of Participants
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.noOfParticipants &&
                          validation.errors.noOfParticipants
                            ? "is-invalid"
                            : ""
                        }`}
                        type="number"
                        id="noOfParticipants"
                        onChange={(e) =>
                          validation.setFieldValue(
                            "noOfParticipants",
                            e.target.value
                          )
                        }
                        placeholder="Enter No. Of Participants"
                        value={validation.values.noOfParticipants}
                      />
                      {validation.touched.noOfParticipants &&
                        validation.errors.noOfParticipants && (
                          <div className="text-danger">
                            {validation.errors.noOfParticipants}
                          </div>
                        )}
                    </div>
                  </Col>

                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload description of the activity
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
                        Upload an PDF file. Max size 10MB.
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
                            // onClick={() =>
                            //   handleDownloadFile(
                            //     validation.values.file as string
                            //   )
                            // }
                            title="Download File"
                          >
                            <i className="bi bi-download"></i>
                          </Button>
                          <Button
                            color="link"
                            className="text-danger"
                            // onClick={() => handleDeleteFile()}
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
                          Year Dept Guest Lecture
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
                      <td>{bos.resourcePersonName}</td>
                      <td>{bos.resourcePersonOrganization}</td>
                      <td>{bos.affiliationOrg}</td>
                      <td>{bos.titleOfTalk}</td>
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

export default Guest_Lectures;
