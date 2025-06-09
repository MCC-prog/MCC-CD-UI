import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Col, Row, Input, Label, Button, CardBody, Card, Container, Nav, NavItem, NavLink, TabContent, TabPane, Modal, ModalBody, Table, ModalHeader, ModalFooter } from "reactstrap";
import Breadcrumb from 'Components/Common/Breadcrumb';
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import { APIClient } from "helpers/api_helper";
import { toast, ToastContainer } from "react-toastify";
import moment from "moment";
import axios from "axios";

const api = new APIClient();

const Fellowships_Awarded_For_AL_And_Research = () => {
  const [departmentOptions, setDepartmentOptions] = useState<{ value: string; label: string }[]>([]);
  // State variables for managing modal, edit mode, and delete confirmation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // State variable for managing file upload status
  const [isAbstractFileUploadDisabled, setIsAbstractFileUploadDisabled] = useState(false);
  const [isSanctionFileUploadDisabled, setIsSanctionFileUploadDisabled] = useState(false);
  // State variable for managing delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isMultidisciplinary, setIsMultidisciplinary] = useState<string>("No");
  const [activeTab, setActiveTab] = useState<string>("1");
  const [documentType, setDocumentType] = useState<string>("");
  // State variable for managing the modal for listing mfp
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State variable for managing the list of mfp data
  const [mfpData, setMfpData] = useState<any[]>([]);
  // State variable for managing search term and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  // State variable for managing filters
  const [filters, setFilters] = useState({
    academicYear: "",
    stream: "",
    department: "",
    facultyName: "",
    projectTitle: "",
    amount: "",
    monthOfGrant: "",
    typeOfFunding: ""
  });
  const [filteredData, setFilteredData] = useState(mfpData);

  // Fetch department data on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/getAllDepartmentEntry", "");
        const options = response.map((dept: any) => ({
          value: dept.id?.toString() || "",
          label: dept.name || ""
        }));
        setDepartmentOptions(options);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = mfpData.filter((row) =>
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

    const filtered = mfpData.filter((row) =>
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

  // Toggle the modal for listing mfp
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const validationSchema = Yup.object({
    academicYear: Yup.object<{ value: string; label: string }>().nullable().required("Please select academic year"),
    stream: Yup.object<{ value: string; label: string }>().nullable().required("Please select school"),
    department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
    otherDepartment: Yup.string().when("department", (department: any, schema) => {
      return department?.value === "Others"
        ? schema.required("Please specify the department")
        : schema;
    }),
    facultyName: Yup.string().required("Please enter faculty name"),
    projectTitle: Yup.string().required("Please enter project title"),
    amount: Yup.number()
      .typeError("Please enter a valid number")
      .min(0, "Amount cannot be less than 0")
      .required("Please enter the amount"),
    monthOfGrant: Yup.string().required("Please enter the month of grant"),
    typeOfFunding: Yup.object<{ value: string; label: string }>().nullable().required("Please select type of funding"),
    principalInvestigator: isMultidisciplinary === "Yes" && activeTab === "1"
      ? Yup.object({
        name: Yup.string().required("Please enter name"),
        qualification: Yup.string().required("Please enter qualification"),
        designation: Yup.string().required("Please enter designation"),
        department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
        date: Yup.date().required("Please select a date"),
        abstractFile: Yup.mixed().required("Please upload the abstract file"),
        sanctionOrderFile: Yup.mixed().required("Please upload the sanction order file"),
      })
      : Yup.object(),
    coInvestigator: isMultidisciplinary === "Yes" && activeTab === "2"
      ? Yup.object({
        name: Yup.string().required("Please enter name"),
        qualification: Yup.string().required("Please enter qualification"),
        designation: Yup.string().required("Please enter designation"),
        department: Yup.object<{ value: string; label: string }>().nullable().required("Please select department"),
        abstractFile: Yup.mixed().required("Please upload the abstract file"),
        sanctionOrderFile: Yup.mixed().required("Please upload the sanction order file"),
        fellowshipFile: Yup.mixed().required("Please upload the fellowship file"),
      })
      : Yup.object(),
  });

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      facultyName: "",
      projectTitle: "",
      amount: "",
      monthOfGrant: "",
      typeOfFunding: null as { value: string; label: string } | null,
      fellowshipFile: null as File | null,
      principalInvestigator: {
        name: "",
        qualification: "",
        designation: "",
        department: null as { value: string; label: string } | null,
        date: "",
        abstractFile: null as File | null,
        sanctionOrderFile: null as File | null,
      },
      coInvestigator: {
        name: "",
        qualification: "",
        designation: "",
        department: null as { value: string; label: string } | null
      },
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Prepare the JSON payload for the `dto` key
      const dtoPayload = {
        managementFundProjectId: editId || null,
        academicYear: values.academicYear?.value || 0,
        streamId: values.stream?.value || 0,
        departmentId: values.department?.value || 0,
        facultyName: values.facultyName || "",
        projectTitle: values.projectTitle || "",
        amount: values.amount || "",
        monthOfGrant: values.monthOfGrant || "",
        fundingType: values.typeOfFunding?.value || "",
        multidisciplinary: isMultidisciplinary === "Yes",
        multidisciplinaryType: activeTab === "1" ? "PrincipleInvestigatorDetails" : "CoInvestigatorDetails",
        managementFundProjectAddTabDto: {
          additionalTabId: 0, // Set this as needed, or from edit data if available
          name: activeTab === "1"
            ? values.principalInvestigator.name || ""
            : values.coInvestigator.name || "",
          qualification: activeTab === "1"
            ? values.principalInvestigator.qualification || ""
            : values.coInvestigator.qualification || "",
          designation: activeTab === "1"
            ? values.principalInvestigator.designation || ""
            : values.coInvestigator.designation || "",
          departmentId: activeTab === "1"
            ? values.principalInvestigator.department?.value || 0
            : values.coInvestigator.department?.value || 0,
          departmentName: activeTab === "1"
            ? values.principalInvestigator.department?.label || ""
            : values.coInvestigator.department?.label || ""
        }
      };

      // Append the JSON payload as a string with the key `managementFundProjectRequestDto`
      formData.append('managementFundProjectRequestDto', new Blob([JSON.stringify(dtoPayload)], { type: 'application/json' }));

      // ...append files as needed...

      try {
        const response = isEditMode && editId
          ? await api.put(`/managementFundProject/update`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          : await api.create(`/managementFundProject/save`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

        toast.success(response.message || "MFP record saved successfully!");
        // Reset the form fields
        resetForm();
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        handleListMFPClick(); // Refresh the list
      } catch (error) {
        toast.error("Failed to save MFP. Please try again.");
        console.error("Error creating/updating MFP:", error);
      }
    }
  });

  const fetchMFAData = async () => {
    try {
      const response = await api.get("/managementFundProject/getAll", '');
      setMfpData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching MFA data:", error);
    }
  }

  // Open the modal and fetch data
  const handleListMFPClick = () => {
    toggleModal();
    fetchMFAData();
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the BOS data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(`/managementFundProject/deleteManagementFundedProject?managementFundProjectId=${id}`, '');
        toast.success(response.message || "MFP record removed successfully!");
        fetchMFAData();
      } catch (error) {
        toast.error("Failed to remove MFP Record. Please try again.");
        console.error("Error deleting MFP:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  // Updated dropdowns to use departmentOptions
  const renderPrincipalInvestigatorDepartmentDropdown = () => (
    <Input
      type="select"
      name="principalInvestigator.department"
      value={validation.values.principalInvestigator.department?.value || ""}
      onChange={(e) => {
        const selected = departmentOptions.find(opt => opt.value === e.target.value) || null;
        validation.setFieldValue("principalInvestigator.department", selected);
      }}
      className={`form-control ${validation.touched.principalInvestigator?.department && validation.errors.principalInvestigator?.department ? "is-invalid" : ""}`}
    >
      <option value="">Select Department</option>
      {departmentOptions.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </Input>
  );

  const renderCoInvestigatorDepartmentDropdown = () => (
    <Input
      type="select"
      name="coInvestigator.department"
      value={validation.values.coInvestigator.department?.value || ""}
      onChange={(e) => {
        const selected = departmentOptions.find(opt => opt.value === e.target.value) || null;
        validation.setFieldValue("coInvestigator.department", selected);
      }}
      className={`form-control ${validation.touched.coInvestigator?.department && validation.errors.coInvestigator?.department ? "is-invalid" : ""}`}
    >
      <option value="">Select Department</option>
      {departmentOptions.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </Input>
  );

  // Handle file download actions
  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(`/managementFundProject/download/${fileName}`, {
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
      const response = await api.delete(`/managementFundProject/deleteManagementFundedProjectDocument?managementFundProjectId=${editId}&docType=${documentType}`, '');
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      // Remove the file from the form
      validation.setFieldValue("uploadLetter", null); // Clear the file from Formik state
    } catch (error) {
      // Show error message
      toast.error("Failed to delete the file. Please try again.");
      console.error("Error deleting file:", error);
    }
  };

  const renderPrincipalInvestigatorForm = () => (
    <Row>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Name</Label>
          <Input
            type="text"
            name="principalInvestigator.name"
            value={validation.values.principalInvestigator.name}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.principalInvestigator?.name && validation.errors.principalInvestigator?.name ? "is-invalid" : ""}`}
            placeholder="Enter Name"
          />
          {validation.touched.principalInvestigator?.name && validation.errors.principalInvestigator?.name && (
            <div className="text-danger">{validation.errors.principalInvestigator.name}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Qualification</Label>
          <Input
            type="text"
            name="principalInvestigator.qualification"
            value={validation.values.principalInvestigator.qualification}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.principalInvestigator?.qualification && validation.errors.principalInvestigator?.qualification ? "is-invalid" : ""}`}
            placeholder="Enter Qualification"
          />
          {validation.touched.principalInvestigator?.qualification && validation.errors.principalInvestigator?.qualification && (
            <div className="text-danger">{validation.errors.principalInvestigator.qualification}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Designation</Label>
          <Input
            type="text"
            name="principalInvestigator.designation"
            value={validation.values.principalInvestigator.designation}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.principalInvestigator?.designation && validation.errors.principalInvestigator?.designation ? "is-invalid" : ""}`}
            placeholder="Enter Designation"
          />
          {validation.touched.principalInvestigator?.designation && validation.errors.principalInvestigator?.designation && (
            <div className="text-danger">{validation.errors.principalInvestigator.designation}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Department</Label>
          {renderPrincipalInvestigatorDepartmentDropdown()}
          {validation.touched.principalInvestigator?.department && validation.errors.principalInvestigator?.department && (
            <div className="text-danger">{validation.errors.principalInvestigator.department}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Enter Date</Label>
          <Input
            type="date" // Use native date input
            className={`form-control ${validation.touched.principalInvestigator?.date && validation.errors.principalInvestigator?.date ? "is-invalid" : ""}`}
            value={
              validation.values.principalInvestigator.date
                ? moment(validation.values.principalInvestigator.date, "DD/MM/YYYY").format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                : ""
            }
            onChange={(e) => {
              const formattedDate = moment(e.target.value, "YYYY-MM-DD").format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
              validation.setFieldValue("principalInvestigator.date", formattedDate);
            }}
            placeholder="dd/mm/yyyy"
          />
          {validation.touched.principalInvestigator?.date && validation.errors.principalInvestigator?.date && (
            <div className="text-danger">
              {typeof validation.errors.principalInvestigator.date === "string" && validation.errors.principalInvestigator.date}
            </div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Abstract of the Project</Label>
          <Input
            type="file"
            name="principalInvestigator.abstractFile"
            onChange={(event) => validation.setFieldValue("principalInvestigator.abstractFile", event.currentTarget.files?.[0] || null)}
            className={`form-control ${validation.touched.principalInvestigator?.abstractFile && validation.errors.principalInvestigator?.abstractFile ? "is-invalid" : ""}`}
            disabled={isAbstractFileUploadDisabled} // Disable the button if a file exists
          />
          {validation.touched.principalInvestigator?.abstractFile && validation.errors.principalInvestigator?.abstractFile && (
            <div className="text-danger">{validation.errors.principalInvestigator.abstractFile}</div>
          )}
          {/* Show a message if the file upload button is disabled */}
          {isAbstractFileUploadDisabled && (
            <div className="text-warning mt-2">
              Please remove the existing file to upload a new one.
            </div>
          )}
          {/* Only show the file name if it is a string (from the edit API) */}
          {typeof validation.values.principalInvestigator.abstractFile === "string" && (
            <div className="mt-2 d-flex align-items-center">
              <span className="me-2" style={{ fontWeight: "bold", color: "green" }}>
                {validation.values.principalInvestigator.abstractFile}
              </span>
              <Button
                color="link"
                className="text-primary"
                onClick={() => {
                  if (typeof validation.values.principalInvestigator.abstractFile === "string") {
                    handleDownloadFile(validation.values.principalInvestigator.abstractFile);
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
      <Col lg={4}>
        <div className="mb-3">
          <Label>Sanction Order</Label>
          <Input
            type="file"
            name="principalInvestigator.sanctionOrderFile"
            onChange={(event) => validation.setFieldValue("principalInvestigator.sanctionOrderFile", event.currentTarget.files?.[0] || null)}
            className={`form-control ${validation.touched.principalInvestigator?.sanctionOrderFile && validation.errors.principalInvestigator?.sanctionOrderFile ? "is-invalid" : ""}`}
            disabled={isSanctionFileUploadDisabled} // Disable the button if a file exists
          />
          {validation.touched.principalInvestigator?.sanctionOrderFile && validation.errors.principalInvestigator?.sanctionOrderFile && (
            <div className="text-danger">{validation.errors.principalInvestigator.sanctionOrderFile}</div>
          )}
          {/* Show a message if the file upload button is disabled */}
          {isSanctionFileUploadDisabled && (
            <div className="text-warning mt-2">
              Please remove the existing file to upload a new one.
            </div>
          )}
          {/* Only show the file name if it is a string (from the edit API) */}
          {typeof validation.values.principalInvestigator?.sanctionOrderFile === "string" && (
            <div className="mt-2 d-flex align-items-center">
              <span className="me-2" style={{ fontWeight: "bold", color: "green" }}>
                {validation.values.principalInvestigator?.sanctionOrderFile}
              </span>
              <Button
                color="link"
                className="text-primary"
                onClick={() => {
                  if (typeof validation.values.principalInvestigator?.sanctionOrderFile === "string") {
                    handleDownloadFile(validation.values.principalInvestigator?.sanctionOrderFile);
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
  );

  const renderCoInvestigatorForm = () => (
    <Row>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Name</Label>
          <Input
            type="text"
            name="coInvestigator.name"
            value={validation.values.coInvestigator.name}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.coInvestigator?.name && validation.errors.coInvestigator?.name ? "is-invalid" : ""}`}
            placeholder="Enter Name"
          />
          {validation.touched.coInvestigator?.name && validation.errors.coInvestigator?.name && (
            <div className="text-danger">{validation.errors.coInvestigator.name}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Qualification</Label>
          <Input
            type="text"
            name="coInvestigator.qualification"
            value={validation.values.coInvestigator.qualification}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.coInvestigator?.qualification && validation.errors.coInvestigator?.qualification ? "is-invalid" : ""}`}
            placeholder="Enter Qualification"
          />
          {validation.touched.coInvestigator?.qualification && validation.errors.coInvestigator?.qualification && (
            <div className="text-danger">{validation.errors.coInvestigator.qualification}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Designation</Label>
          <Input
            type="text"
            name="coInvestigator.designation"
            value={validation.values.coInvestigator.designation}
            onChange={validation.handleChange}
            className={`form-control ${validation.touched.coInvestigator?.designation && validation.errors.coInvestigator?.designation ? "is-invalid" : ""}`}
            placeholder="Enter Designation"
          />
          {validation.touched.coInvestigator?.designation && validation.errors.coInvestigator?.designation && (
            <div className="text-danger">{validation.errors.coInvestigator.designation}</div>
          )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Department</Label>
          {renderCoInvestigatorDepartmentDropdown()}
          {validation.touched.coInvestigator?.department && validation.errors.coInvestigator?.department && (
            <div className="text-danger">{validation.errors.coInvestigator.department}</div>
          )}
        </div>
      </Col>
    </Row>
  );

  // Handle edit action
  // Fetch the data for the selected BOS ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(`/managementFundProject/edit?managementFundProjectId=${id}`, '');
      const academicYearOptions = await api.get("/getAllAcademicYear", "");

      // Filter the response where isCurrent or isCurrentForAdmission is true
      const filteredAcademicYearList = academicYearOptions.filter(
        (year: any) => year.isCurrent || year.isCurrentForAdmission
      );

      // Map the filtered data to the required format
      const academicYearList = filteredAcademicYearList.map((year: any) => ({
        value: year.year,
        label: year.display
      }));

      // Map API response to Formik values
      const mappedValues: any = {
        academicYear: mapValueToLabel(response.academicYear, academicYearList),
        stream: response.streamId
          ? { value: response.streamId.toString(), label: response.streamName }
          : null,
        department: response.departmentId
          ? { value: response.departmentId.toString(), label: response.departmentName }
          : null,
        facultyName: response.facultyName || "",
        projectTitle: response.projectTitle || "",
        amount: response.amount || "",
        monthOfGrant: response.monthOfGrant || "",
        typeOfFunding: response.fundingType
          ? { value: response.fundingType, label: response.fundingType }
          : null,
        principalInvestigator: {
          name: response.principleInvestigatorDto?.name || "",
          qualification: response.principleInvestigatorDto?.qualification || "",
          designation: response.principleInvestigatorDto?.designation || "",
          department: response.principleInvestigatorDto?.departmentId
            ? { value: response.principleInvestigatorDto.departmentId.toString(), label: response.principleInvestigatorDto.departmentName }
            : null,
          date: response.principleInvestigatorDto?.date || "",
          abstractFile: response.principleInvestigatorDto?.file?.abstractProject || null,
          sanctionOrderFile: response.principleInvestigatorDto?.file?.sanctionOrder || null,
        },
        coInvestigator: response.coInvestigatorDto
          ? {
            name: response.coInvestigatorDto.name || "",
            qualification: response.coInvestigatorDto.qualification || "",
            designation: response.coInvestigatorDto.designation || "",
            department: response.coInvestigatorDto.departmentId
              ? { value: response.coInvestigatorDto.departmentId.toString(), label: response.coInvestigatorDto.departmentName }
              : null,
          }
          : {
            name: "",
            qualification: "",
            designation: "",
            department: null,
          },
      };

      // Set multidisciplinary state and active tab
      setIsMultidisciplinary(response.multidisciplinary ? "Yes" : "No");
      if (response.multidisciplinaryType === "PrincipleInvestigatorDetails") {
        setActiveTab("1");
        setDocumentType("PrincipleInvestigatorDetails");
      } else if (response.multidisciplinaryType === "CoInvestigatorDetails") {
        setActiveTab("2");
        setDocumentType("CoInvestigatorDetails");
      }

      // Update Formik values
      validation.setValues(mappedValues);

      // Set edit mode and toggle modal
      setIsEditMode(true);
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error("Error fetching Research Publication data by ID:", error);
    }
  };

  function handleDelete(mfpDataId: any): void {
    setDeleteId(mfpDataId);
    setIsDeleteModalOpen(true);
  }

  // Map value to label for dropdowns
  const mapValueToLabel = (value: string | number | null, options: { value: string | number; label: string }[]): { value: string | number; label: string } | null => {
    if (!value) return null;
    const matchedOption = options.find((option) => option.value === value);
    return matchedOption ? matchedOption : { value, label: String(value) };
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Research" breadcrumbItem="Management_Funded_Project" />
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

                  {/* School Dropdown */}
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

                  {/* Faculty Name */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Faculty Name</Label>
                      <Input
                        type="text"
                        value={validation.values.facultyName}
                        onChange={(e) => validation.setFieldValue("facultyName", e.target.value)}
                        className={`form-control ${validation.touched.facultyName && validation.errors.facultyName ? "is-invalid" : ""
                          }`}
                        placeholder="Enter Faculty Name"
                      />
                      {validation.touched.facultyName && validation.errors.facultyName && (
                        <div className="text-danger">{validation.errors.facultyName}</div>
                      )}
                    </div>
                  </Col>

                  {/* Title of the Project */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Title of the Project</Label>
                      <Input
                        type="text"
                        value={validation.values.projectTitle}
                        onChange={(e) => validation.setFieldValue("projectTitle", e.target.value)}
                        className={`form-control ${validation.touched.projectTitle && validation.errors.projectTitle ? "is-invalid" : ""
                          }`}
                        placeholder="Enter Project Title"
                      />
                      {validation.touched.projectTitle && validation.errors.projectTitle && (
                        <div className="text-danger">{validation.errors.projectTitle}</div>
                      )}
                    </div>
                  </Col>

                  {/* Amount */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        value={validation.values.amount}
                        onChange={(e) => validation.setFieldValue("amount", e.target.value)}
                        className={`form-control ${validation.touched.amount && validation.errors.amount ? "is-invalid" : ""
                          }`}
                        placeholder="Enter Amount"
                      />
                      {validation.touched.amount && validation.errors.amount && (
                        <div className="text-danger">{validation.errors.amount}</div>
                      )}
                    </div>
                  </Col>

                  {/* Month of Grant */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Month of Grant</Label>
                      <Input
                        type="text"
                        value={validation.values.monthOfGrant}
                        onChange={(e) => validation.setFieldValue("monthOfGrant", e.target.value)}
                        className={`form-control ${validation.touched.monthOfGrant && validation.errors.monthOfGrant ? "is-invalid" : ""
                          }`}
                        placeholder="Enter Month of Grant"
                      />
                      {validation.touched.monthOfGrant && validation.errors.monthOfGrant && (
                        <div className="text-danger">{validation.errors.monthOfGrant}</div>
                      )}
                    </div>
                  </Col>

                  {/* Type of Funding Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Type of Funding</Label>
                      <Input
                        type="select"
                        value={validation.values.typeOfFunding?.value || ""}
                        onChange={(e) =>
                          validation.setFieldValue("typeOfFunding", { value: e.target.value, label: e.target.value })
                        }
                        className={`form-control ${validation.touched.typeOfFunding && validation.errors.typeOfFunding ? "is-invalid" : ""
                          }`}
                      >
                        <option value="">Select Type of Funding</option>
                        <option value="Internal">Internal</option>
                        <option value="External">External</option>
                      </Input>
                      {validation.touched.typeOfFunding && validation.errors.typeOfFunding && (
                        <div className="text-danger">{validation.errors.typeOfFunding}</div>
                      )}
                    </div>
                  </Col>
                  {/* Multidisciplinary Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Multidisciplinary</Label>
                      <Input
                        type="select"
                        value={isMultidisciplinary}
                        onChange={(e) => setIsMultidisciplinary(e.target.value)}
                        className="form-control"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </Input>
                    </div>
                  </Col>
                </Row>
                {isMultidisciplinary === "Yes" && (
                  <div>
                    <Nav tabs>
                      <NavItem>
                        <NavLink
                          className={activeTab === "1" ? "active" : ""}
                          onClick={() => setActiveTab("1")}
                        >
                          Principal Investigator Details
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={activeTab === "2" ? "active" : ""}
                          onClick={() => setActiveTab("2")}
                        >
                          Co-Investigator Details
                        </NavLink>
                      </NavItem>
                    </Nav>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId="1">{renderPrincipalInvestigatorForm()}</TabPane>
                      <TabPane tabId="2">{renderCoInvestigatorForm()}</TabPane>
                    </TabContent>
                  </div>
                )}
                <Col lg={4}>
                  <div className="mb-3">
                    <Label>Fellowship</Label>
                    <Input
                      type="file"
                      name="coInvestigator.fellowshipFile"
                      onChange={(event) => validation.setFieldValue("coInvestigator.fellowshipFile", event.currentTarget.files?.[0] || null)}
                      className={`form-control ${validation.touched.fellowshipFile && validation.errors.fellowshipFile ? "is-invalid" : ""}`}
                    />
                    {validation.touched?.fellowshipFile && validation.errors.fellowshipFile && (
                      <div className="text-danger">{validation.errors.fellowshipFile}</div>
                    )}
                  </div>
                </Col>
                <Row>
                  <Col lg={12}>
                    <div className="mt-3 d-flex justify-content-between">
                      <button className="btn btn-primary" type="submit">
                        {isEditMode ? "Update" : "Save"}
                      </button>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={handleListMFPClick}
                      >
                        List MFP
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing mfp */}
        <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg" style={{ maxWidth: "100%", width: "auto" }}>
          <ModalHeader toggle={toggleModal}>List Management Funded Project</ModalHeader>
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
                    Faculty Name
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.facultyName}
                      onChange={(e) => handleFilterChange(e, "facultyName")}
                    />
                  </th>
                  <th>
                    Project Title
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.projectTitle}
                      onChange={(e) => handleFilterChange(e, "projectTitle")}
                    />
                  </th>
                  <th>
                    Amount
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.amount}
                      onChange={(e) => handleFilterChange(e, "amount")}
                    />
                  </th>
                  <th>
                    Month of Grant
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.monthOfGrant}
                      onChange={(e) => handleFilterChange(e, "monthOfGrant")}
                    />
                  </th>
                  <th>
                    Type of Funding
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.typeOfFunding}
                      onChange={(e) => handleFilterChange(e, "typeOfFunding")}
                    />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((mfp, index) => (
                    <tr key={mfp.managementFundProjectId}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{mfp.academicYear}</td>
                      <td>{mfp.streamName}</td>
                      <td>{mfp.departmentName}</td>
                      <td>{mfp.facultyName}</td>
                      <td>{mfp.projectTitle}</td>
                      <td>{mfp.amount}</td>
                      <td>{mfp.monthOfGrant}</td>
                      <td>{mfp.fundingType}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(mfp.managementFundProjectId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(mfp.managementFundProjectId)}
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
                      No MFP data available.
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
    </React.Fragment>
  );
};

export default Fellowships_Awarded_For_AL_And_Research;