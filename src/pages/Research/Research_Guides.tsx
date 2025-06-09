import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import { useFormik } from "formik";
import * as Yup from "yup";
import React, { useState } from "react";
import { Button, Card, CardBody, Col, Container, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "reactstrap";
import Breadcrumb from 'Components/Common/Breadcrumb';
import { toast, ToastContainer } from "react-toastify";
import { APIClient } from "helpers/api_helper";
import axios from "axios";

const api = new APIClient();

const Research_Guides = () => {
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // State variable for managing file upload status
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  // State variable for managing Research Guides data
  const [researchGuideData, setResearchGuideData] = useState<any[]>([]);
  // State variables for managing selected options in dropdowns
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedProgramType, setSelectedProgramType] = useState<any>(null);
  const [selectedDegree, setSelectedDegree] = useState<any>(null);
  // State variable for managing the modal for listing BOS
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State variable for managing search term and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  // State variable for managing filters
  const [filters, setFilters] = useState({
    academicYear: "",
    stream: "",
    department: "",
    guideName: "",
    guideAffiliation: "",
    numberOfStudents: ""
  });

  const [filteredData, setFilteredData] = useState(researchGuideData);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = researchGuideData.filter((row) =>
      Object.values(row).some((val) =>
        String(val || "").toLowerCase().includes(value)
      )
    );
    setFilteredData(filtered);
  };

  // Handle column-specific filters
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>, column: string) => {
    const value = e.target.value.toLowerCase();
    const updatedFilters = { ...filters, [column]: value };
    setFilters(updatedFilters);

    const filtered = researchGuideData.filter((row) =>
      Object.values(row).some((val) =>
        String(val || "").toLowerCase().includes(value)
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

  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Toggle the modal for listing BOS
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Formik validation and submission
  // Initialize Formik with validation schema and initial values
  const [students, setStudents] = useState<any[]>([]);

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      guideName: "",
      guideAffiliation: "",
      numberOfStudents: "",
      studentDetails: [] as {
        name: string;
        joiningYear: string;
        title: string;
        fundingRecieved: string;
        scholarship: string;
        studentDetailId?: string | null;
      }[],
      uploadLetter: null as File | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>().nullable().required("Please select academic year"),
      stream: Yup.object<{ value: string; label: string }>().nullable().required("Please select school"),
      department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
      otherDepartment: Yup.string().when("department", (department: any, schema) => {
        return department?.value === "Others"
          ? schema.required("Please specify the department")
          : schema;
      }),
      guideName: Yup.string().required("Please enter guide name"),
      guideAffiliation: Yup.string().required("Please enter guide affiliation"),
      numberOfStudents: Yup.number()
        .typeError("Please enter a valid number")
        .min(1, "Number of students must be at least 1")
        .required("Please enter the number of students"),
      studentDetails: Yup.array().of(
        Yup.object({
          name: Yup.string().required("Please enter student name"),
          joiningYear: Yup.string().required("Please enter year of joining"),
          title: Yup.string().required("Please enter title"),
          fundingRecieved: Yup.string().required("Please specify funding received"),
          scholarship: Yup.string().required("Please specify scholarship"),
        })
      ),
      uploadLetter: Yup.mixed().test(
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
          if (value instanceof File && value.size > 2 * 1024 * 1024) {
            return this.createError({ message: "File size is too large" });
          }
          // Check file type
          const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
          if (value instanceof File && !allowedTypes.includes(value.type)) {
            return this.createError({ message: "Unsupported file format" });
          }
          return true;
        }
      )
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Prepare the JSON payload for the `dto` key
      const dtoPayload = {
        researchGuideId: editId || null,
        academicYear: values.academicYear?.value || "0",
        streamId: values.stream?.value || "0",
        departmentId: values.department?.value || "0",
        guideName: values.guideName || "",
        guidesAffiliation: values.guideAffiliation || "",
        noOfStudents: String(values.numberOfStudents || "0"),
        studentList: values.studentDetails.map((student) => ({
          studentDetailId: student.studentDetailId || null,
          name: student.name || "",
          joiningYear: parseInt(student.joiningYear, 10) || 0,
          title: student.title || "",
          fundingRecieved: student.fundingRecieved === "true" || false,
          scholarship: student.scholarship || "",
        })),
      };

      // Append the JSON payload as a string with the key `dto`
      formData.append('dto', new Blob([JSON.stringify(dtoPayload)], { type: 'application/json' }));

      // Append the file with the key `file`
      if (typeof values.uploadLetter === "string") {
        formData.append("file", "null");
      } else if (values.uploadLetter instanceof File) {
        formData.append("file", values.uploadLetter); // Append the file
      }

      try {
        const response = isEditMode && editId
          ? await api.put(`/researchGuide/update`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          : await api.create(`/researchGuide/save`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

        toast.success(response.message || "Research Guide record saved successfully!");
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        handleListResearchGuidesClick(); // Refresh the list
      } catch (error) {
        toast.error("Failed to save Research Guide. Please try again.");
        console.error("Error creating/updating Research Guide:", error);
      }
    }
  });

  // Handle file download actions
  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(`/researchGuide/download/${fileName}`, {
          responseType: 'blob'
        });

        // Create a Blob from the response data
        const blob = new Blob([response], { type: "*/*" });

        // Create a URL for the Blob
        const url = window.URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName; // Set the file name for the download
        document.body.appendChild(link);
        link.click();

        // Clean up the URL and remove the anchor element
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("File downloaded successfully!");
      } catch (error) {
        toast.error("Failed to download upload ltter file. Please try again.");
        console.error("Error downloading file:", error);
      }
    } else {
      toast.error("No file available for download.");
    }
  };


  // Handle file deletion
  // Clear the file from the form and show success message
  const handleDeleteFile = async () => {
    try {
      // Call the delete API
      const response = await api.delete(`/researchGuide/deleteResearchGuideDocument?researchGuideId=${editId}`, '');
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      // Remove the file from the form
      validation.setFieldValue("uploadLetter", null); // Clear the file from Formik state
      setIsFileUploadDisabled(false); // Enable the file upload button
    } catch (error) {
      // Show error message
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  const handleNumberOfStudentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);

    if (!isNaN(value) && value > 0) {
      if (value > students.length) {
        // If the number of students is increased, retain existing data and add new empty entries
        const additionalStudents = Array.from({ length: value - students.length }, () => ({
          name: "",
          joiningYear: "",
          title: "",
          fundingRecieved: "",
          scholarship: "",
        }));
        const updatedStudents = [...students, ...additionalStudents];
        validation.setFieldValue("studentDetails", updatedStudents);
        setStudents(updatedStudents);
      } else if (value < students.length) {
        // If the number of students is decreased, check if extra student details are empty
        const extraStudents = students.slice(value);
        const isExtraStudentsEmpty = extraStudents.every(
          (student) =>
            !student.name &&
            !student.joiningYear &&
            !student.title &&
            !student.fundingRecieved &&
            !student.scholarship
        );

        if (isExtraStudentsEmpty) {
          // Allow decreasing the number of students if extra student details are empty
          const updatedStudents = students.slice(0, value);
          validation.setFieldValue("studentDetails", updatedStudents);
          setStudents(updatedStudents);
        } else {
          // Prevent decreasing the number of students if extra student details are not empty
          toast.error("Please clear the extra student details before decreasing the number of students.");
          return;
        }
      } else {
        // If the number of students remains the same, do nothing
        validation.setFieldValue("numberOfStudents", value);
      }
    } else {
      // If the input is invalid, reset the student details
      validation.setFieldValue("studentDetails", []);
      setStudents([]);
    }

    validation.setFieldValue("numberOfStudents", value);
  };

  const handleStudentDetailsChange = (index: number, field: string, value: string) => {
    const updatedStudents = [...students];
    updatedStudents[index][field] = value;
    validation.setFieldValue("studentDetails", updatedStudents);
    setStudents(updatedStudents);
  };

  // Handle edit action
  // Fetch the data for the selected BOS ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(`/researchGuide/edit?researchGuideId=${id}`, '');
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
          ? { value: response.departmentId.toString(), label: response.departmentName }
          : null,
        guideName: response.guideName || "",
        guideAffiliation: response.guidesAffiliation || "",
        numberOfStudents: response.noOfStudents || "",
        otherDepartment: "", // Add default value for otherDepartment
        uploadLetter: response.document?.letter || null, // File uploads are not pre-filled
        studentDetails: response.studentList || [], // Map student list
      };

      // Update Formik values
      validation.setValues({
        ...mappedValues,
        academicYear: mappedValues.academicYear
          ? { ...mappedValues.academicYear, value: String(mappedValues.academicYear.value) }
          : null,
        stream: mappedValues.stream
          ? { ...mappedValues.stream, value: String(mappedValues.stream.value) }
          : null,
        department: mappedValues.department
          ? { ...mappedValues.department, value: String(mappedValues.department.value) }
          : null,
      });

      // Update the student list in the state
      setStudents(response.studentList || []);

      // Set edit mode and toggle modal
      setIsEditMode(true);
      setEditId(id); // Store the ID of the record being edited
      // Disable file upload if a file exists
      setIsFileUploadDisabled(!!response.document?.letter);
      toggleModal();
    } catch (error) {
      console.error("Error fetching Research Guide data by ID:", error);
    }
  };

  function handleDelete(researchGuideDataId: any): void {
    setDeleteId(researchGuideDataId);
    setIsDeleteModalOpen(true);
  }

  // Map value to label for dropdowns
  const mapValueToLabel = (value: string | number | null, options: { value: string | number; label: string }[]): { value: string | number; label: string } | null => {
    if (!value) return null;
    const matchedOption = options.find((option) => option.value === value);
    return matchedOption ? matchedOption : { value, label: String(value) };
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the BOS data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(`/researchGuide/deleteResearchGuide?researchGuideId=${id}`, '');
        toast.success(response.message || "Research Guide record removed successfully!");
        fetchResearchGuidesData();
      } catch (error) {
        toast.error("Failed to remove Research Guide Record. Please try again.");
        console.error("Error deleting Research Guide:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  }

  const fetchResearchGuidesData = async () => {
    try {
      const response = await api.get("/researchGuide/getAll", '');
      setResearchGuideData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Research Guide data:", error);
    }
  }

  // Open the modal and fetch data
  const handleListResearchGuidesClick = () => {
    toggleModal();
    fetchResearchGuidesData();
  };


  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Research" breadcrumbItem="Research Guides" />
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
                          validation.setFieldValue("academicYear", selectedOption)
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
                          validation.touched.stream && !!validation.errors.stream
                        }
                      />
                      {validation.touched.stream && validation.errors.stream && (
                        <div className="text-danger">{validation.errors.stream}</div>
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
                          validation.setFieldValue("department", selectedOption);
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
                          className={`form-control ${validation.touched.otherDepartment && validation.errors.otherDepartment ? "is-invalid" : ""
                            }`}
                          value={validation.values.otherDepartment}
                          onChange={(e) => validation.setFieldValue("otherDepartment", e.target.value)}
                          placeholder="Enter Department Name"
                        />
                        {validation.touched.otherDepartment && validation.errors.otherDepartment && (
                          <div className="text-danger">{validation.errors.otherDepartment}</div>
                        )}
                      </div>
                    </Col>
                  )}
                  {/* Guide Name */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Guide Name</Label>
                      <Input
                        type="text"
                        value={validation.values.guideName}
                        onChange={(e) => validation.setFieldValue("guideName", e.target.value)}
                        className={`form-control ${validation.touched.guideName && validation.errors.guideName ? "is-invalid" : ""}`}
                        placeholder="Enter Guide Name"
                      />
                      {validation.touched.guideName && validation.errors.guideName && (
                        <div className="text-danger">{validation.errors.guideName}</div>
                      )}
                    </div>
                  </Col>

                  {/* Guide Affiliation */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Guide Affiliation</Label>
                      <Input
                        type="text"
                        value={validation.values.guideAffiliation}
                        onChange={(e) => validation.setFieldValue("guideAffiliation", e.target.value)}
                        className={`form-control ${validation.touched.guideAffiliation && validation.errors.guideAffiliation ? "is-invalid" : ""}`}
                        placeholder="Enter Guide Affiliation"
                      />
                      {validation.touched.guideAffiliation && validation.errors.guideAffiliation && (
                        <div className="text-danger">{validation.errors.guideAffiliation}</div>
                      )}
                    </div>
                  </Col>

                  {/* Number of Students */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Number of Students</Label>
                      <Input
                        type="number"
                        value={validation.values.numberOfStudents}
                        onChange={handleNumberOfStudentsChange}
                        className={`form-control ${validation.touched.numberOfStudents && validation.errors.numberOfStudents ? "is-invalid" : ""}`}
                        placeholder="Enter Number of Students"
                      />
                      {validation.touched.numberOfStudents && validation.errors.numberOfStudents && (
                        <div className="text-danger">{validation.errors.numberOfStudents}</div>
                      )}
                    </div>
                  </Col>
                </Row>

                {/* Dynamic Student Details */}
                {students.map((student, index) => (
                  <div key={index} className="border p-3 mb-3">
                    <h5 className="mb-3">Student Details {index + 1}</h5>
                    <Row>
                      <Col lg={4}>
                        <div className="mb-3">
                          <Label>Student Name</Label>
                          <Input
                            type="text"
                            value={student.name}
                            onChange={(e) => handleStudentDetailsChange(index, "name", e.target.value)}
                            className={`form-control ${validation.touched.studentDetails?.[index]?.name &&
                              typeof validation.errors.studentDetails?.[index] === "object" &&
                              validation.errors.studentDetails?.[index]?.name
                              ? "is-invalid"
                              : ""
                              }`}
                            placeholder="Enter Student Name"
                          />
                          {validation.touched.studentDetails?.[index]?.name &&
                            typeof validation.errors.studentDetails?.[index] === "object" &&
                            validation.errors.studentDetails?.[index]?.name && (
                              <div className="text-danger">
                                {typeof validation.errors.studentDetails?.[index]?.name === "string"
                                  ? validation.errors.studentDetails?.[index]?.name
                                  : ""}
                              </div>
                            )}
                        </div>
                      </Col>
                      <Col lg={4}>
                        <div className="mb-3">
                          <Label>Year of Joining</Label>
                          <Input
                            type="text"
                            value={student.joiningYear}
                            onChange={(e) => handleStudentDetailsChange(index, "joiningYear", e.target.value)}
                            className={`form-control ${validation.touched.studentDetails?.[index]?.joiningYear &&
                              typeof validation.errors.studentDetails?.[index] === "object" &&
                              validation.errors.studentDetails?.[index]?.joiningYear
                              ? "is-invalid"
                              : ""
                              }`}
                            placeholder="Enter Year of Joining"
                          />
                          {validation.touched.studentDetails?.[index]?.joiningYear &&
                            typeof validation.errors.studentDetails?.[index] === "object" &&
                            validation.errors.studentDetails?.[index]?.joiningYear && (
                              <div className="text-danger">
                                {typeof validation.errors.studentDetails?.[index]?.joiningYear === "string"
                                  ? validation.errors.studentDetails?.[index]?.joiningYear
                                  : ""}
                              </div>
                            )}
                        </div>
                      </Col>
                      <Col lg={4}>
                        <div className="mb-3">
                          <Label>Title</Label>
                          <Input
                            type="text"
                            value={student.title}
                            onChange={(e) => handleStudentDetailsChange(index, "title", e.target.value)}
                            className={`form-control ${validation.touched.studentDetails?.[index]?.title &&
                              typeof validation.errors.studentDetails?.[index] === "object" &&
                              validation.errors.studentDetails?.[index]?.title
                              ? "is-invalid"
                              : ""
                              }`}
                            placeholder="Enter Title"
                          />
                          {validation.touched.studentDetails?.[index]?.title &&
                            typeof validation.errors.studentDetails?.[index] === "object" &&
                            validation.errors.studentDetails?.[index]?.title && (
                              <div className="text-danger">
                                {typeof validation.errors.studentDetails?.[index]?.title === "string"
                                  ? validation.errors.studentDetails?.[index]?.title
                                  : ""}
                              </div>
                            )}
                        </div>
                      </Col>
                      <Col lg={4}>
                        <div className="mb-3">
                          <Label>Funding Received</Label>
                          <Input
                            type="text"
                            value={student.fundingRecieved}
                            onChange={(e) => handleStudentDetailsChange(index, "fundingRecieved", e.target.value)}
                            className={`form-control ${validation.touched.studentDetails?.[index]?.fundingRecieved &&
                              typeof validation.errors.studentDetails?.[index] === "object" &&
                              validation.errors.studentDetails?.[index]?.fundingRecieved
                              ? "is-invalid"
                              : ""
                              }`}
                            placeholder="Enter Funding Received"
                          />
                          {validation.touched.studentDetails?.[index]?.fundingRecieved &&
                            typeof validation.errors.studentDetails?.[index] === "object" &&
                            validation.errors.studentDetails?.[index]?.fundingRecieved && (
                              <div className="text-danger">
                                {typeof validation.errors.studentDetails?.[index]?.fundingRecieved === "string"
                                  ? validation.errors.studentDetails?.[index]?.fundingRecieved
                                  : ""}
                              </div>
                            )}
                        </div>
                      </Col>
                      <Col lg={4}>
                        <div className="mb-3">
                          <Label>Scholarship</Label>
                          <Input
                            type="text"
                            value={student.scholarship}
                            onChange={(e) => handleStudentDetailsChange(index, "scholarship", e.target.value)}
                            className={`form-control ${validation.touched.studentDetails?.[index]?.scholarship &&
                              typeof validation.errors.studentDetails?.[index] === "object" &&
                              validation.errors.studentDetails?.[index]?.scholarship
                              ? "is-invalid"
                              : ""
                              }`}
                            placeholder="Enter Scholarship"
                          />
                          {validation.touched.studentDetails?.[index]?.scholarship &&
                            typeof validation.errors.studentDetails?.[index] === "object" &&
                            validation.errors.studentDetails?.[index]?.scholarship && (
                              <div className="text-danger">
                                {typeof validation.errors.studentDetails?.[index]?.scholarship === "string"
                                  ? validation.errors.studentDetails?.[index]?.scholarship
                                  : ""}
                              </div>
                            )}
                        </div>
                      </Col>
                    </Row>
                  </div>
                ))}
                {/* Upload Letter */}
                <Row>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">Upload Letter</Label>
                      <Input
                        className={`form-control ${validation.touched.uploadLetter && validation.errors.uploadLetter ? "is-invalid" : ""}`}
                        type="file"
                        id="formFile"
                        onChange={(event) => {
                          validation.setFieldValue("uploadLetter", event.currentTarget.files ? event.currentTarget.files[0] : null);
                        }}
                        disabled={isFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.uploadLetter && validation.errors.uploadLetter && (
                        <div className="text-danger">{validation.errors.uploadLetter}</div>
                      )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.uploadLetter === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span className="me-2" style={{ fontWeight: "bold", color: "green" }}>
                            {validation.values.uploadLetter}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() => {
                              if (typeof validation.values.uploadLetter === "string") {
                                handleDownloadFile(validation.values.uploadLetter);
                              }
                            }}
                            title="Download File"
                          >
                            <i className="bi bi-download"></i>
                          </Button>
                          <Button
                            color="link"
                            className="text-danger"
                            onClick={() => handleDeleteFile()}
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
                        onClick={handleListResearchGuidesClick}
                      >
                        List ResearchGuides
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing BOS */}
        <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg" style={{ maxWidth: "100%", width: "auto" }}>
          <ModalHeader toggle={toggleModal}>List BOS</ModalHeader>
          <ModalBody>
            {/* Global Search */}
            <div className="mb-3">
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            {/* Table with Pagination */}
            <Table className="table-hover custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>
                    Academic Year
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.academicYear}
                      onChange={(e) => handleFilterChange(e, "academicYear")}
                    />
                  </th>
                  <th>
                    School
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.stream}
                      onChange={(e) => handleFilterChange(e, "stream")}
                    />
                  </th>
                  <th>
                    Department
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.department}
                      onChange={(e) => handleFilterChange(e, "department")}
                    />
                  </th>
                  <th>
                    Guide Name
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.guideName}
                      onChange={(e) => handleFilterChange(e, "programType")}
                    />
                  </th>
                  <th>
                    Guide Afffiliation
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.guideAffiliation}
                      onChange={(e) => handleFilterChange(e, "program")}
                    />
                  </th>
                  <th>
                    Number of Students
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.numberOfStudents}
                      onChange={(e) => handleFilterChange(e, "yearOfIntroduction")}
                    />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((rg, index) => (
                    <tr key={rg.researchGuideId}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{rg.academicYear}</td>
                      <td>{rg.streamName}</td>
                      <td>{rg.departmentName}</td>
                      <td>{rg.guideName}</td>
                      <td>{rg.guidesAffiliation}</td>
                      <td>{rg.noOfStudents}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(rg.researchGuideId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(rg.researchGuideId)}
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
                      No Research Guide data available.
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
        <Modal isOpen={isDeleteModalOpen} toggle={() => setIsDeleteModalOpen(false)}>
          <ModalHeader toggle={() => setIsDeleteModalOpen(false)}>Confirm Deletion</ModalHeader>
          <ModalBody>
            Are you sure you want to delete this record? This action cannot be undone.
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
      </div>
      <ToastContainer />
    </React.Fragment >
  );
};

export default Research_Guides;