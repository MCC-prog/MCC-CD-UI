import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import { ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import React, { useState } from "react";
import Select from "react-select";
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
import axios from "axios";

const api = new APIClient();

const Mous_AgreementCopy_Activities: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agreementData, setAgreementData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [filteredData, setFilteredData] = useState(agreementData);
  const [filters, setFilters] = useState({
    academicYear: "",
    stream: "",
    department: "",
    centralisedCentres: "",
    organization: "",
    addessOrganization: "",
    yearSigningMou: "",
    mouValid: "",
    typeActivity: "",
    targetAudience: "",
    activity: null as string | null,
    mous: null as File | string | null,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = agreementData.filter((row) =>
      Object.values(row).some((val) =>
        String(val || "")
          .toLowerCase()
          .includes(value)
      )
    );
    setFilteredData(filtered);
  };
  // Handle column-specific filters
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    column: string
  ) => {
    const value = e.target.value.toLowerCase();
    const updatedFilters = { ...filters, [column]: value };
    setFilters(updatedFilters);

    const filtered = agreementData.filter((row) =>
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

  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch mous Agreement CopyActivities data from the backend
  const fetchAgreementData = async () => {
    try {
      const response = await api.get(
        "/mousAgreementCopyActivities/getAllMousAgreementCopyActivities",
        ""
      );
      setAgreementData(response.data);
      setFilteredData(response);
    } catch (error) {
      console.error(
        "Error fetching Mous Agreement Copy & Activities data:",
        error
      );
    }
  };

  // Open the modal and fetch data
  const handleListAgreementClick = () => {
    toggleModal();
    fetchAgreementData();
  };

  const mapValueToLabel = (
    value: string | number | null,
    options: { value: string | number; label: string }[]
  ): { value: string | number; label: string } | null => {
    if (!value) return null;
    const matchedOption = options.find((option) => option.value === value);
    return matchedOption ? matchedOption : { value, label: String(value) };
  };

  // Handle edit action
  // Fetch the data for the selected new Courses Introduced ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/mousAgreementCopyActivities?mousAgreementCopyActivitiesId=${id}`,
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
        stream: response.empStreamId
          ? {
              value: response.empStreamId.toString(),
              label: response.empStreamName,
            }
          : null,
        department: response.departmentId
          ? {
              value: response.departmentId.toString(),
              label: response.departmentName,
            }
          : null,
        

      };
      const streamOption = mapValueToLabel(response.streamId, []); // Replace [] with stream options array if available
      const departmentOption = mapValueToLabel(response.departmentId, []); // Replace [] with department options array if available
      // Update Formik values
      validation.setValues({
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
        stream: mappedValues.stream || null,
        department: mappedValues.department || null,
        centralisedCentres: response.centalizedCentre
          ? {
              value: response.centalizedCentre,
              label: response.centalizedCentre,
            }
          : null,
        organization: response.orgName || "",
        addessOrganization: response.orgAddress || "",
        yearSigningMou: response.yearOfSigningMou || "",
        mouValid: response.mouValidUpto || "",
        typeActivity: response.typeOfActivity || "",
        targetAudience: response.targetAudiences
          ? Array.isArray(response.targetAudiences)
            ? response.targetAudiences.map((aud: any) =>
                typeof aud === "object" ? aud : { value: aud, label: aud }
              )
            : []
          : [],
        activity: response.documents?.Activity || null,
        mous: response.documents?.Mous || null,
      });
      setSelectedStream(streamOption);
      setSelectedDepartment(departmentOption);
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      // Disable the file upload button if a file exists
      setIsFileUploadDisabled(!!response.documents?.mous);
      setIsFileUploadDisabled(!!response.documents?.activity);
      toggleModal();
    } catch (error) {
      console.error(
        "Error fetching Mous Agreement Copy & Activities data by ID:",
        error
      );
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
          `/mousAgreementCopyActivities/deleteMousAgreementCopyActivities?mousAgreementCopyActivitiesId=${id}`,
          ""
        );
        toast.success(
          response.message ||
            "Mous Agreement Copy & Activities removed successfully!"
        );
        fetchAgreementData();
      } catch (error) {
        toast.error(
          "Failed to remove Mous Agreement Copy & Activities  . Please try again."
        );
        console.error(
          "Error deleting Mous Agreement Copy & Activities :",
          error
        );
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
          `/mousAgreementCopyActivities/download/${fileName}`,
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
  const handleDeleteFile = async () => {
    try {
      // Call the delete API
      const response = await api.delete(
        `/mousAgreementCopyActivities/deleteMousAgreementCopyActivitiesDocument?mousAgreementCopyActivitiesDocumentId=${editId}`,
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

  const formatDate = (date: string): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
  };

  const CentralisedCentresOption = [
    { value: "IRC", label: "IRC" },
    { value: "MCCIIE", label: "MCCIIE" },
    { value: "RESEARCH CENTER", label: "RESEARCH CENTER" },
    { value: "IKS", label: "IKS" },
    { value: "CEE", label: "CEE" },
    { value: "ALUMNI", label: "ALUMNI" },
    { value: "CLDT", label: "CLDT" },
  ];

  const TargetAudience = [
    { value: "UG", label: "UG" },
    { value: "PG", label: "PG" },
    { value: "FACULTY", label: "FACULTY" },
  ];

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      centralisedCentres: null as { value: string; label: string } | null,
      organization: "",
      addessOrganization: "",
      yearSigningMou: "",
      mouValid: "",
      typeActivity: "",
      targetAudience: [] as { value: string; label: string }[],
      activity: null as string | null,
      mous: null as File | string | null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select academic year"),
      stream: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select school"),
      department: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select department"),
      centralisedCentres: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select Centralised Centres"),
      organization: Yup.string().required("Please select Organization Name"),
      addessOrganization: Yup.string().required(
        "Please select Addess of the Organization"
      ),
      yearSigningMou: Yup.date().required("Please select Year Signing Mou"),
      mouValid: Yup.date().required("Please select Year Mou Valid upto"),
      typeActivity: Yup.string().required("Please select Type of Activity"),
      targetAudience: Yup.array()
        .min(1, "Please select at least one Target Audience")
        .required("Please select Target Audience"),
      activity: Yup.mixed().test(
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
      ),
      mous: Yup.mixed().test(
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
      ),
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("empStreamId", values.stream?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append(
        "centalizedCentre",
        values.centralisedCentres?.value || ""
      );
      formData.append("orgName", values.organization || "");
      formData.append("orgAddress", values.addessOrganization || "");
      formData.append(
        "yearOfSigningMou",
        formatDate(values.yearSigningMou) || ""
      );
      formData.append("mouValidUpto", formatDate(values.mouValid) || "");
      formData.append("typeOfActivity", values.typeActivity || "");
      formData.append(
        "targetAudiences",
        values.targetAudience.map((option) => option.value).join(",") || ""
      );

      // Append the file
      if (isEditMode && typeof values.activity === "string") {
        // Pass an empty Blob instead of null
        formData.append("activity", new Blob([]), "empty.pdf");
      } else if (isEditMode && values.activity === null) {
        formData.append("activity", new Blob([]), "empty.pdf");
      } else if (values.activity) {
        formData.append("activity", values.activity);
      }

      if (isEditMode && typeof values.mous === "string") {
        // Pass an empty Blob instead of null
        formData.append("mous", new Blob([]), "empty.pdf");
      } else if (isEditMode && values.mous === null) {
        formData.append("mous", new Blob([]), "empty.pdf");
      } else if (values.mous) {
        formData.append("mous", values.mous);
      }

      // If editing, include ID
      if (isEditMode && editId) {
        formData.append("mousAgreementCopyActivitiesId", editId);
      }

      try {
        if (isEditMode && editId) {
          // Call the update API
          const response = await api.put(
            `/mousAgreementCopyActivities`,
            formData
          );
          toast.success(
            response.message ||
              "Mous Agreement Copy & Activities updated successfully!"
          );
        } else {
          // Call the save API
          const response = await api.create(
            "/mousAgreementCopyActivities",
            formData
          );
          toast.success(
            response.message ||
              "Mous Agreement Copy & Activities added successfully!"
          );
        }
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        setIsFileUploadDisabled(false); // Enable the file upload button
        handleListAgreementClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Mous Agreement Copy & Activities. Please try again."
        );
        console.error(
          "Error creating Mous Agreement Copy & Activities:",
          error
        );
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="MOUS" breadcrumbItem="Industry Collaboration" />
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
                      <Label>Centralised Centres</Label>
                      <Select
                        options={CentralisedCentresOption}
                        value={validation.values.centralisedCentres}
                        onChange={(selectedOption) =>
                          validation.setFieldValue(
                            "centralisedCentres",
                            selectedOption
                          )
                        }
                        placeholder="Select Project Type"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.centralisedCentres &&
                          validation.errors.centralisedCentres
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.centralisedCentres &&
                        validation.errors.centralisedCentres && (
                          <div className="text-danger">
                            {validation.errors.centralisedCentres}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Collaborating Organization</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.organization &&
                          validation.errors.organization
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.organization}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "organization",
                            e.target.value
                          )
                        }
                        placeholder="Enter Organization"
                      />
                      {validation.touched.organization &&
                        validation.errors.organization && (
                          <div className="text-danger">
                            {validation.errors.organization}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Address of the Organization</Label>
                      <Input
                        type="textarea"
                        className={`form-control ${
                          validation.touched.addessOrganization &&
                          validation.errors.addessOrganization
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.addessOrganization}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "addessOrganization",
                            e.target.value
                          )
                        }
                        placeholder="Enter Addess of the Organization"
                      />
                      {validation.touched.addessOrganization &&
                        validation.errors.addessOrganization && (
                          <div className="text-danger">
                            {validation.errors.addessOrganization}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Year Signing the Mou</Label>
                      <Input
                        type="date"
                        className={`form-control ${
                          validation.touched.yearSigningMou &&
                          validation.errors.yearSigningMou
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.yearSigningMou}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "yearSigningMou",
                            e.target.value
                          )
                        }
                      />
                      {validation.touched.yearSigningMou &&
                        validation.errors.yearSigningMou && (
                          <div className="text-danger">
                            {validation.errors.yearSigningMou}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Mou Valid Upto</Label>
                      <Input
                        type="date"
                        className={`form-control ${
                          validation.touched.mouValid &&
                          validation.errors.mouValid
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.mouValid}
                        onChange={(e) =>
                          validation.setFieldValue("mouValid", e.target.value)
                        }
                      />
                      {validation.touched.mouValid &&
                        validation.errors.mouValid && (
                          <div className="text-danger">
                            {validation.errors.mouValid}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Type of Activity</Label>
                      <Input
                        type="textarea"
                        className={`form-control ${
                          validation.touched.typeActivity &&
                          validation.errors.typeActivity
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.typeActivity}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "typeActivity",
                            e.target.value
                          )
                        }
                        placeholder="Enter Type of Activity"
                      />
                      {validation.touched.typeActivity &&
                        validation.errors.typeActivity && (
                          <div className="text-danger">
                            {validation.errors.typeActivity}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Target Audience</Label>
                      <Select
                        options={TargetAudience}
                        isMulti
                        value={validation.values.targetAudience}
                        onChange={(selectedOption) =>
                          validation.setFieldValue(
                            "targetAudience",
                            selectedOption
                          )
                        }
                        placeholder="Select Target Audience"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.targetAudience &&
                          validation.errors.targetAudience
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.targetAudience &&
                        validation.errors.targetAudience && (
                          <div className="text-danger">
                            {validation.touched.targetAudience
                              ? Array.isArray(validation.errors.targetAudience)
                                ? validation.errors.targetAudience.join(", ")
                                : validation.errors.targetAudience
                              : null}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Report of the Activity
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
                          validation.touched.activity &&
                          validation.errors.activity
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        onChange={(event) => {
                          validation.setFieldValue(
                            "activity",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.activity &&
                        validation.errors.activity && (
                          <div className="text-danger">
                            {validation.errors.activity}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.activity === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.activity}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.activity as string
                              )
                            }
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
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Letter/MOU
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
                        className={`form-control ${
                          validation.touched.mous && validation.errors.mous
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        onChange={(event) => {
                          validation.setFieldValue(
                            "mous",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.mous && validation.errors.mous && (
                        <div className="text-danger">
                          {validation.errors.mous}
                        </div>
                      )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.mous === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.mous}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                validation.values.mous as string
                              )
                            }
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Download Template of Report</Label>
                      <div>
                        <a
                          href="/templateFiles/bos.pdf"
                          download
                          className="btn btn-primary btn-sm"
                        >
                          Sample Report Template
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
                        className="btn btn-primary"
                        type="button"
                        onClick={handleListAgreementClick}
                      >
                        List MOUS Agreement Copy & Activities
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Agreement */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List MOUS Agreement Copy & Activities
          </ModalHeader>
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

            <Table bordered>
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
                    Schools
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
                    Centralised Centres
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.centralisedCentres}
                      onChange={(e) =>
                        handleFilterChange(e, "centralisedCentres")
                      }
                    />
                  </th>
                  <th>
                    Organization
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.organization}
                      onChange={(e) => handleFilterChange(e, "organization")}
                    />
                  </th>
                  <th>
                    Addess Of Organization
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.addessOrganization}
                      onChange={(e) =>
                        handleFilterChange(e, "addessOrganization")
                      }
                    />
                  </th>
                  <th>
                    Year Of Signing Mou
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.yearSigningMou}
                      onChange={(e) => handleFilterChange(e, "yearSigningMou")}
                    />
                  </th>
                  <th>
                    Mou Valid
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.mouValid}
                      onChange={(e) => handleFilterChange(e, "mouValid")}
                    />
                  </th>
                  <th>
                    Type Of Activity
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.typeActivity}
                      onChange={(e) => handleFilterChange(e, "typeActivity")}
                    />
                  </th>
                  <th>
                    Target Audience
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.targetAudience}
                      onChange={(e) => handleFilterChange(e, "targetAudience")}
                    />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((agreement, index) => (
                    <tr key={agreement.mousAgreementCopyActivitiesId}>
                      <td>{index + 1}</td>
                      <td>{agreement.academicYear}</td>
                      <td>{agreement.empStreamName}</td>
                      <td>{agreement.departmentName}</td>
                      <td>{agreement.centalizedCentre}</td>
                      <td>{agreement.orgName}</td>
                      <td>{agreement.orgAddress}</td>
                      <td>{agreement.yearOfSigningMou}</td>
                      <td>{agreement.mouValidUpto}</td>
                      <td>{agreement.typeOfActivity}</td>
                      <td>
                        <ul>
                          {(
                            Object.values(agreement.targetAudiences) as string[]
                          ).map((targetAudience, index) => (
                            <li key={index}>{targetAudience}</li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(agreement.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(agreement.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center">
                      No MOUS data available.
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
export default Mous_AgreementCopy_Activities;
