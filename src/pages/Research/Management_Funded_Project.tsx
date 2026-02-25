import React, { useEffect, useState, useMemo, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Col,
  Row,
  Input,
  Label,
  Button,
  CardBody,
  Card,
  Container,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Modal,
  ModalBody,
  Table,
  ModalHeader,
  ModalFooter,
} from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import { APIClient } from "helpers/api_helper";
import { toast, ToastContainer } from "react-toastify";
import moment from "moment";
import axios from "axios";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import { aB } from "@fullcalendar/core/internal-common";
const api = new APIClient();

const Management_Funded_Project: React.FC = () => {
  const [departmentOptions, setDepartmentOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isAbstractFileUploadDisabled, setIsAbstractFileUploadDisabled] =
    useState(false);
  const [isSanctionFileUploadDisabled, setIsSanctionFileUploadDisabled] =
    useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isMultidisciplinary, setIsMultidisciplinary] = useState<string>("No");
  const [activeTab, setActiveTab] = useState<string>("1");
  const [documentType, setDocumentType] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mfpData, setMfpData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState(mfpData);
  const tableRef = useRef<HTMLTableElement>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const file2Ref = useRef<HTMLInputElement | null>(null);

  const [editResData, setEditResData] = useState<any>(null);

  const clearTabFields = async (validation: any, tab: number | null) => {
    try {
      let deleteId = null;

      if (
        tab === 1 &&
        editResData?.principleInvestigatorDto?.principleInvestigatorId
      ) {
        deleteId = editResData.principleInvestigatorDto.principleInvestigatorId;
      } else if (
        tab === 2 &&
        editResData?.coInvestigatorDto?.coInvestigatorId
      ) {
        deleteId = editResData.coInvestigatorDto.coInvestigatorId;
      }

      if (deleteId) {
        await api.delete(
          `/managementFundProject/deleteManagementFundedProjectTabsAndDoc?managementFundProjectAddTabId=${deleteId}`,
          ""
        );
      }
      switch (tab) {
        case 1:
          validation.setFieldValue("principleInvestigatorId", null);
          validation.setFieldValue("principalInvestigator", {
            name: "",
            qualification: "",
            designation: "",
            department: null,
            abstractFile: null,
            sanctionOrderFile: null,
          });
          setIsAbstractFileUploadDisabled(false);
          setIsSanctionFileUploadDisabled(false);

          if (fileRef.current) fileRef.current.value = "";
          if (file2Ref.current) file2Ref.current.value = "";
          break;
        case 2:
          validation.setFieldValue("coInvestigatorId", null);
          validation.setFieldValue("coInvestigator", {
            name: "",
            qualification: "",
            designation: "",
            department: null,
          });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Delete API failed", error);
    }
  };

  // Fetch department data on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/getAllDepartmentEntry", "");
        const options = response.map((dept: any) => ({
          value: dept.id?.toString() || "",
          label: dept.name || "",
        }));
        setDepartmentOptions(options);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
    validation.setFieldValue("activeTab", tab); // <-- CRITICAL
    validation.setTouched({});
    validation.setErrors({});
  };
  // Dynamic validation schema for nested tabs
  const validationSchema = useMemo(() => {
    return Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select academic year"),
      stream: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select school"),
      department: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select department"),
      otherDepartment: Yup.string().when(
        "department",
        (department: any, schema) => {
          return department?.value === "Others"
            ? schema.required("Please specify the department")
            : schema;
        }
      ),
      facultyName: Yup.string().required("Please enter faculty name"),
      projectTitle: Yup.string().required("Please enter project title"),
      amount: Yup.number()
        .typeError("Please enter a valid number")
        .min(0, "Amount cannot be less than 0")
        .required("Please enter the amount"),
      monthOfGrant: Yup.date().required("Please select Month Of Grant"),
      typeOfFunding: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select type of funding"),
      otherTypeOfFunding: Yup.string().when(
        "typeOfFunding",
        (typeOfFunding: any, schema) => {
          return typeOfFunding?.value === "Others"
            ? schema.required("Please specify the Type Of Funding")
            : schema;
        }
      ),
      principalInvestigator: Yup.object().when("activeTab", {
        is: (tab: string) => tab === "1",
        then: (schema) =>
          schema.shape({
            name: Yup.string().required("Please enter name"),
            qualification: Yup.string().required("Please enter qualification"),
            designation: Yup.string().required("Please enter designation"),
            department: Yup.object()
              .nullable()
              .required("Please select department"),
            abstractFile: Yup.mixed().required("Please upload abstract file"),
            sanctionOrderFile: Yup.mixed().required(
              "Please upload sanction order"
            ),
          }),
        otherwise: (schema) => schema.notRequired(),
      }),

      coInvestigator: Yup.object().when("activeTab", {
        is: (tab: string) => tab === "2",
        then: (schema) =>
          schema.shape({
            name: Yup.string().required("Please enter name"),
            qualification: Yup.string().required("Please enter qualification"),
            designation: Yup.string().required("Please enter designation"),
            department: Yup.object()
              .nullable()
              .required("Please select department"),
          }),
        otherwise: (schema) => schema.notRequired(),
      }),
    });
  }, [isMultidisciplinary, activeTab]);

  const validation = useFormik({
    initialValues: {
      activeTab: activeTab,
      isMultidisciplinary: isMultidisciplinary,
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      facultyName: "",
      projectTitle: "",
      amount: "",
      monthOfGrant: "",
      typeOfFunding: null as { value: string; label: string } | null,
      otherTypeOfFunding: "",
      principalInvestigator: {
        pId: null,
        name: "",
        qualification: "",
        designation: "",
        department: null as { value: string; label: string } | null,
        abstractFile: null as File | null,
        sanctionOrderFile: null as File | null,
      },
      coInvestigator: {
        cId: null,
        name: "",
        qualification: "",
        designation: "",
        department: null as { value: string; label: string } | null,
      },
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();

      // ------------------------------
      // 1️⃣ CHECK IF PI HAS DATA
      // ------------------------------
      const hasPI =
        values.principalInvestigator.name ||
        values.principalInvestigator.qualification ||
        values.principalInvestigator.designation ||
        values.principalInvestigator.department;

      // ------------------------------
      // 2️⃣ CHECK IF CO HAS DATA
      // ------------------------------
      const hasCO =
        values.coInvestigator.name ||
        values.coInvestigator.qualification ||
        values.coInvestigator.designation ||
        values.coInvestigator.department;

      // ------------------------------
      // 3️⃣ BASE DTO
      // ------------------------------
      const dtoPayload: any = {
        managementFundProjectId: editId || null,
        academicYear: values.academicYear?.value || null,
        streamId: values.stream?.value || null,
        departmentId: values.department?.value || null,
        facultyName: values.facultyName || null,
        projectTitle: values.projectTitle || null,
        amount: values.amount || null,
        monthOfGrant: values.monthOfGrant || null,
        fundingType: values.typeOfFunding?.value || null,
        multidisciplinary: isMultidisciplinary === "Yes",
      };

      // ------------------------------
      // 4️⃣ PI DTO (only if filled)
      // ------------------------------
      if (hasPI) {
        dtoPayload.principleFormRequestDto = {
          principleInvestigatorFormId: values.principalInvestigator.pId || null,
          name: values.principalInvestigator.name || null,
          qualification: values.principalInvestigator.qualification || null,
          designation: values.principalInvestigator.designation || null,
          departmentId: values.principalInvestigator.department?.value || null,
        };
      }

      // ------------------------------
      // 5️⃣ CO DTO (only if filled)
      // ------------------------------
      if (hasCO) {
        dtoPayload.coInvestigatorFormRequestDto = {
          coInvestigatorFormId: values.coInvestigator.cId || null,
          name: values.coInvestigator.name || null,
          qualification: values.coInvestigator.qualification || null,
          designation: values.coInvestigator.designation || null,
          departmentId: values.coInvestigator.department?.value || null,
        };
      }

      // ------------------------------
      // 6️⃣ ADD DTO TO FORMDATA
      // ------------------------------
      formData.append(
        "managementFundProjectRequestDto",
        new Blob([JSON.stringify(dtoPayload)], { type: "application/json" })
      );
      console.warn("Payload check ===>>>", dtoPayload);
      // ------------------------------
      // 7️⃣ FILES (only for PI)
      // ------------------------------
      if (values.principalInvestigator.abstractFile instanceof File) {
        formData.append(
          "abstractProject",
          values.principalInvestigator.abstractFile
        );
      }

      if (values.principalInvestigator.sanctionOrderFile instanceof File) {
        formData.append(
          "sanctionOrder",
          values.principalInvestigator.sanctionOrderFile
        );
      }

      // ------------------------------
      // 8️⃣ API CALL
      // ------------------------------
      try {
        const response =
          isEditMode && editId
            ? await api.put(`/managementFundProject/update`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              })
            : await api.create(`/managementFundProject/save`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });

        toast.success(response.message || "MFP record saved successfully!");

        // ------------------------------
        // 9️⃣ RESET FORM
        // ------------------------------
        resetForm();
        if (fileRef.current) fileRef.current.value = "";
        if (file2Ref.current) file2Ref.current.value = "";
        setIsAbstractFileUploadDisabled(false);
        setIsSanctionFileUploadDisabled(false);
        setIsEditMode(false);
        setEditId(null);

        handleListMFPClick();
      } catch (error) {
        toast.error("Failed to save MFP. Please try again.");
        console.error("Error creating/updating MFP:", error);
      }
    },
  });

  const fetchMFAData = async () => {
    try {
      const response = await api.get("/managementFundProject/getAll", "");
      setMfpData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching MFA data:", error);
    }
  };

  const handleListMFPClick = () => {
    toggleModal();
    fetchMFAData();
  };

  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/managementFundProject/deleteManagementFundedProject?managementFundProjectId=${id}`,
          ""
        );
        setIsModalOpen(false);

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

  const renderPrincipalInvestigatorDepartmentDropdown = () => (
    <Input
      type="select"
      name="principalInvestigator.department"
      value={validation.values.principalInvestigator.department?.value || ""}
      onChange={(e) => {
        const selected =
          departmentOptions.find((opt) => opt.value === e.target.value) || null;
        validation.setFieldValue("principalInvestigator.department", selected);
      }}
      className={`form-control ${
        validation.touched.principalInvestigator?.department &&
        validation.errors.principalInvestigator?.department
          ? "is-invalid"
          : ""
      }`}
    >
      <option value="">Select Department</option>
      {departmentOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Input>
  );

  const renderCoInvestigatorDepartmentDropdown = () => (
    <Input
      type="select"
      name="coInvestigator.department"
      value={validation.values.coInvestigator.department?.value || ""}
      onChange={(e) => {
        const selected =
          departmentOptions.find((opt) => opt.value === e.target.value) || null;
        validation.setFieldValue("coInvestigator.department", selected);
      }}
      className={`form-control ${
        validation.touched.coInvestigator?.department &&
        validation.errors.coInvestigator?.department
          ? "is-invalid"
          : ""
      }`}
    >
      <option value="">Select Department</option>
      {departmentOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Input>
  );

  // Handle file download actions
  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(
          `/managementFundProject/download/${fileName}`,
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
        toast.error("Failed to download upload ltter file. Please try again.");
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
      // Determine the tabId (principal investigator id) from Formik values or the loaded edit response
      const tabId =
        validation.values.principalInvestigator?.pId ||
        editResData?.principleInvestigatorDto?.principleInvestigatorId;
  
      if (!tabId) {
        toast.error("No document associated to delete.");
        return;
      }
  
      // Call the delete API
      const response = await api.delete(
        `/managementFundProject/deleteManagementFundedProjectDocument?tabId=${tabId}&docType=${docType}`,
        ""
      );
      // Show success message
      toast.success(response.message || "File deleted successfully!");
      if (docType === "sanctionOrder") {
        validation.setFieldValue(
          "principalInvestigator.sanctionOrderFile",
          null
        );
        setIsSanctionFileUploadDisabled(false);
      } else if (docType === "abstractProject") {
        validation.setFieldValue("principalInvestigator.abstractFile", null);
        setIsAbstractFileUploadDisabled(false);
      }
    } catch (error) {
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
            className={`form-control ${
              validation.touched.principalInvestigator?.name &&
              validation.errors.principalInvestigator?.name
                ? "is-invalid"
                : ""
            }`}
            placeholder="Enter Name"
          />
          {validation.touched.principalInvestigator?.name &&
            validation.errors.principalInvestigator?.name && (
              <div className="text-danger">
                {validation.errors.principalInvestigator.name}
              </div>
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
            className={`form-control ${
              validation.touched.principalInvestigator?.qualification &&
              validation.errors.principalInvestigator?.qualification
                ? "is-invalid"
                : ""
            }`}
            placeholder="Enter Qualification"
          />
          {validation.touched.principalInvestigator?.qualification &&
            validation.errors.principalInvestigator?.qualification && (
              <div className="text-danger">
                {validation.errors.principalInvestigator.qualification}
              </div>
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
            className={`form-control ${
              validation.touched.principalInvestigator?.designation &&
              validation.errors.principalInvestigator?.designation
                ? "is-invalid"
                : ""
            }`}
            placeholder="Enter Designation"
          />
          {validation.touched.principalInvestigator?.designation &&
            validation.errors.principalInvestigator?.designation && (
              <div className="text-danger">
                {validation.errors.principalInvestigator.designation}
              </div>
            )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Department</Label>
          {renderPrincipalInvestigatorDepartmentDropdown()}
          {validation.touched.principalInvestigator?.department &&
            validation.errors.principalInvestigator?.department && (
              <div className="text-danger">
                {validation.errors.principalInvestigator.department}
              </div>
            )}
        </div>
      </Col>
      {/* <Col lg={4}>
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
            </Col> */}
      <Col lg={4}>
        <div className="mb-3">
          <Label>Abstract of the Project</Label>
          <Input
            type="file"
            name="principalInvestigator.abstractFile"
            onChange={(event) =>
              validation.setFieldValue(
                "principalInvestigator.abstractFile",
                event.currentTarget.files?.[0] || null
              )
            }
            className={`form-control ${
              validation.touched.principalInvestigator?.abstractFile &&
              validation.errors.principalInvestigator?.abstractFile
                ? "is-invalid"
                : ""
            }`}
            innerRef={fileRef}
            disabled={isAbstractFileUploadDisabled} // Disable the button if a file exists
          />
          {validation.touched.principalInvestigator?.abstractFile &&
            validation.errors.principalInvestigator?.abstractFile && (
              <div className="text-danger">
                {validation.errors.principalInvestigator.abstractFile}
              </div>
            )}
          {/* Show a message if the file upload button is disabled */}
          {isAbstractFileUploadDisabled && (
            <div className="text-warning mt-2">
              Please remove the existing file to upload a new one.
            </div>
          )}
          {/* Only show the file name if it is a string (from the edit API) */}
          {typeof validation.values.principalInvestigator.abstractFile ===
            "string" && (
            <div className="mt-2 d-flex align-items-center">
              <span
                className="me-2"
                style={{ fontWeight: "bold", color: "green" }}
              >
                {validation.values.principalInvestigator.abstractFile}
              </span>
              <Button
                color="link"
                className="text-primary"
                onClick={() => {
                  if (
                    typeof validation.values.principalInvestigator
                      .abstractFile === "string"
                  ) {
                    handleDownloadFile(
                      validation.values.principalInvestigator.abstractFile
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
                onClick={() => {
                  setDocumentType("abstractProject");
                  handleDeleteFile("abstractProject");
                }}
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
            onChange={(event) =>
              validation.setFieldValue(
                "principalInvestigator.sanctionOrderFile",
                event.currentTarget.files?.[0] || null
              )
            }
            className={`form-control ${
              validation.touched.principalInvestigator?.sanctionOrderFile &&
              validation.errors.principalInvestigator?.sanctionOrderFile
                ? "is-invalid"
                : ""
            }`}
            innerRef={file2Ref}
            disabled={isSanctionFileUploadDisabled} // Disable the button if a file exists
          />
          {validation.touched.principalInvestigator?.sanctionOrderFile &&
            validation.errors.principalInvestigator?.sanctionOrderFile && (
              <div className="text-danger">
                {validation.errors.principalInvestigator.sanctionOrderFile}
              </div>
            )}
          {/* Show a message if the file upload button is disabled */}
          {isSanctionFileUploadDisabled && (
            <div className="text-warning mt-2">
              Please remove the existing file to upload a new one.
            </div>
          )}
          {/* Only show the file name if it is a string (from the edit API) */}
          {typeof validation.values.principalInvestigator?.sanctionOrderFile ===
            "string" && (
            <div className="mt-2 d-flex align-items-center">
              <span
                className="me-2"
                style={{ fontWeight: "bold", color: "green" }}
              >
                {validation.values.principalInvestigator?.sanctionOrderFile}
              </span>
              <Button
                color="link"
                className="text-primary"
                onClick={() => {
                  if (
                    typeof validation.values.principalInvestigator
                      ?.sanctionOrderFile === "string"
                  ) {
                    handleDownloadFile(
                      validation.values.principalInvestigator?.sanctionOrderFile
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
                onClick={() => {
                  setDocumentType("sanctionOrder");
                  handleDeleteFile("sanctionOrder");
                }}
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
            className={`form-control ${
              validation.touched.coInvestigator?.name &&
              validation.errors.coInvestigator?.name
                ? "is-invalid"
                : ""
            }`}
            placeholder="Enter Name"
          />
          {validation.touched.coInvestigator?.name &&
            validation.errors.coInvestigator?.name && (
              <div className="text-danger">
                {validation.errors.coInvestigator.name}
              </div>
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
            className={`form-control ${
              validation.touched.coInvestigator?.qualification &&
              validation.errors.coInvestigator?.qualification
                ? "is-invalid"
                : ""
            }`}
            placeholder="Enter Qualification"
          />
          {validation.touched.coInvestigator?.qualification &&
            validation.errors.coInvestigator?.qualification && (
              <div className="text-danger">
                {validation.errors.coInvestigator.qualification}
              </div>
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
            className={`form-control ${
              validation.touched.coInvestigator?.designation &&
              validation.errors.coInvestigator?.designation
                ? "is-invalid"
                : ""
            }`}
            placeholder="Enter Designation"
          />
          {validation.touched.coInvestigator?.designation &&
            validation.errors.coInvestigator?.designation && (
              <div className="text-danger">
                {validation.errors.coInvestigator.designation}
              </div>
            )}
        </div>
      </Col>
      <Col lg={4}>
        <div className="mb-3">
          <Label>Department</Label>
          {renderCoInvestigatorDepartmentDropdown()}
          {validation.touched.coInvestigator?.department &&
            validation.errors.coInvestigator?.department && (
              <div className="text-danger">
                {validation.errors.coInvestigator.department}
              </div>
            )}
        </div>
      </Col>
    </Row>
  );

  // Handle edit action
  // Fetch the data for the selected BOS ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/managementFundProject/edit?managementFundProjectId=${id}`,
        ""
      );
      const academicYearOptions = await api.get("/getAllAcademicYear", "");
      setEditResData(response);
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
      const mappedValues: any = {
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
        facultyName: response.facultyName || "",
        projectTitle: response.projectTitle || "",
        amount: response.amount || "",
        monthOfGrant: response.monthOfGrant || "",
        typeOfFunding: response.fundingType
          ? { value: response.fundingType, label: response.fundingType }
          : null,
        principalInvestigator: {
          pId:
            response.principleInvestigatorDto?.principleInvestigatorId || null,
          name: response.principleInvestigatorDto?.name || "",
          qualification: response.principleInvestigatorDto?.qualification || "",
          designation: response.principleInvestigatorDto?.designation || "",
          department: response.principleInvestigatorDto?.departmentId
            ? {
                value:
                  response.principleInvestigatorDto.departmentId.toString(),
                label: response.principleInvestigatorDto.departmentName,
              }
            : null,
          date: response.principleInvestigatorDto?.date || "",
          abstractFile:
            response.principleInvestigatorDto?.file?.abstractProject || null,
          sanctionOrderFile:
            response.principleInvestigatorDto?.file?.sanctionOrder || null,
        },
        coInvestigator: response.coInvestigatorDto
          ? {
              cId: response.coInvestigatorDto?.coInvestigatorId || null,
              name: response.coInvestigatorDto.name || "",
              qualification: response.coInvestigatorDto.qualification || "",
              designation: response.coInvestigatorDto.designation || "",
              department: response.coInvestigatorDto.departmentId
                ? {
                    value: response.coInvestigatorDto.departmentId.toString(),
                    label: response.coInvestigatorDto.departmentName,
                  }
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
      } else if (response.multidisciplinaryType === "CoInvestigatorDetails") {
        setActiveTab("2");
      }
      const streamOption = mapValueToLabel(response.streamId, []); // Replace [] with stream options array if available
      const departmentOption = mapValueToLabel(response.departmentId, []);
      // Update Formik values
      validation.setValues(mappedValues);

      // Set edit mode and toggle modal
      setSelectedStream(streamOption);
      setSelectedDepartment(departmentOption);
      setIsEditMode(true);
      setEditId(id); // Store the ID of the record being edited
      setIsAbstractFileUploadDisabled(
        !!response.principleInvestigatorDto?.file?.abstractProject
      );
      setIsSanctionFileUploadDisabled(
        !!response.principleInvestigatorDto?.file?.sanctionOrder
      );
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
  const mapValueToLabel = (
    value: string | number | null,
    options: { value: string | number; label: string }[]
  ): { value: string | number; label: string } | null => {
    if (!value) return null;
    const matchedOption = options.find((option) => option.value === value);
    return matchedOption ? matchedOption : { value, label: String(value) };
  };

  useEffect(() => {
    if (mfpData.length === 0) return; // wait until data is loaded

    const table = $("#managementFundProjectId").DataTable({
      destroy: true, // destroy existing instance if re-rendered
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Management_Funded_Project_Data",
          title: "Management Funded Project Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Management_Funded_Project_Data",
          title: "Management Funded Project Data Export",
          exportOptions: {
            columns: ":not(:last-child)",
          },
        },
      ],
    });
    $(".dt-buttons").addClass("mb-3 gap-2");
    $(".buttons-copy").addClass("btn btn-success");
    $(".buttons-csv").addClass("btn btn-info");

    $("#managementFundProjectId").on(
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
  }, [mfpData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Research" breadcrumbItem="Research Project" />
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
                          className={`form-control ${
                            validation.touched.otherDepartment &&
                            validation.errors.otherDepartment
                              ? "is-invalid"
                              : ""
                          }`}
                          value={validation.values.otherDepartment}
                          onChange={(e) =>
                            validation.setFieldValue(
                              "otherDepartment",
                              e.target.value
                            )
                          }
                          placeholder="Enter Department Name"
                        />
                        {validation.touched.otherDepartment &&
                          validation.errors.otherDepartment && (
                            <div className="text-danger">
                              {validation.errors.otherDepartment}
                            </div>
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
                        onChange={(e) =>
                          validation.setFieldValue(
                            "facultyName",
                            e.target.value
                          )
                        }
                        className={`form-control ${
                          validation.touched.facultyName &&
                          validation.errors.facultyName
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter Faculty Name"
                      />
                      {validation.touched.facultyName &&
                        validation.errors.facultyName && (
                          <div className="text-danger">
                            {validation.errors.facultyName}
                          </div>
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
                        onChange={(e) =>
                          validation.setFieldValue(
                            "projectTitle",
                            e.target.value
                          )
                        }
                        className={`form-control ${
                          validation.touched.projectTitle &&
                          validation.errors.projectTitle
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter Project Title"
                      />
                      {validation.touched.projectTitle &&
                        validation.errors.projectTitle && (
                          <div className="text-danger">
                            {validation.errors.projectTitle}
                          </div>
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
                        onChange={(e) =>
                          validation.setFieldValue("amount", e.target.value)
                        }
                        className={`form-control ${
                          validation.touched.amount && validation.errors.amount
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter Amount"
                      />
                      {validation.touched.amount &&
                        validation.errors.amount && (
                          <div className="text-danger">
                            {validation.errors.amount}
                          </div>
                        )}
                    </div>
                  </Col>

                  {/* Month of Grant */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Month of Grant</Label>
                      <Input
                        type="date"
                        value={validation.values.monthOfGrant}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "monthOfGrant",
                            e.target.value
                          )
                        }
                        className={`form-control ${
                          validation.touched.monthOfGrant &&
                          validation.errors.monthOfGrant
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter Month of Grant"
                      />
                      {validation.touched.monthOfGrant &&
                        validation.errors.monthOfGrant && (
                          <div className="text-danger">
                            {validation.errors.monthOfGrant}
                          </div>
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
                          validation.setFieldValue("typeOfFunding", {
                            value: e.target.value,
                            label: e.target.value,
                          })
                        }
                        className={`form-control ${
                          validation.touched.typeOfFunding &&
                          validation.errors.typeOfFunding
                            ? "is-invalid"
                            : ""
                        }`}
                      >
                        <option value="">Select Type of Funding</option>
                        <option value="Management">Management</option>
                        <option value="Government">Government</option>
                        <option value="NGO">NGO</option>
                        <option value="Industry">Industry</option>
                        <option value="Others">Others</option>
                      </Input>
                      {validation.touched.typeOfFunding &&
                        validation.errors.typeOfFunding && (
                          <div className="text-danger">
                            {validation.errors.typeOfFunding}
                          </div>
                        )}
                    </div>
                  </Col>
                  {validation.values.typeOfFunding?.value === "Others" && (
                    <Col lg={4}>
                      <div className="mb-3">
                        <Label>Specify Type of Funding</Label>
                        <Input
                          type="text"
                          className={`form-control ${
                            validation.touched.otherTypeOfFunding &&
                            validation.errors.otherTypeOfFunding
                              ? "is-invalid"
                              : ""
                          }`}
                          value={validation.values.otherTypeOfFunding}
                          onChange={(e) =>
                            validation.setFieldValue(
                              "otherTypeOfFunding",
                              e.target.value
                            )
                          }
                          placeholder="Enter Type of Funding"
                        />
                        {validation.touched.otherTypeOfFunding &&
                          validation.errors.otherTypeOfFunding && (
                            <div className="text-danger">
                              {validation.errors.otherTypeOfFunding}
                            </div>
                          )}
                      </div>
                    </Col>
                  )}

                  {/* Multidisciplinary Dropdown */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Multidisciplinary</Label>
                      <Input
                        type="select"
                        value={isMultidisciplinary}
                        onChange={(e) => {
                          setIsMultidisciplinary(e.target.value);
                          validation.setFieldValue(
                            "isMultidisciplinary",
                            e.target.value
                          ); // <-- IMPORTANT
                        }}
                        className="form-control"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </Input>
                    </div>
                  </Col>
                </Row>
                <div>
                  <Nav tabs>
                    <NavItem>
                      <NavLink
                        className={activeTab === "1" ? "active" : ""}
                        onClick={() => handleTabSwitch("1")}
                      >
                        Principal Investigator Details
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={activeTab === "2" ? "active" : ""}
                        onClick={() => handleTabSwitch("2")}
                      >
                        Co-Investigator Details
                      </NavLink>
                    </NavItem>
                  </Nav>
                  <TabContent activeTab={activeTab}>
                    <TabPane tabId="1">
                      {renderPrincipalInvestigatorForm()}
                      <div className="mb-2 mt-2">
                        <button
                          type="button"
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => clearTabFields(validation, 1)}
                        >
                          Clear
                        </button>
                      </div>
                    </TabPane>

                    <TabPane tabId="2">
                      {renderCoInvestigatorForm()}
                      <div className="mb-2 mt-2">
                        <button
                          type="button"
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => clearTabFields(validation, 2)}
                        >
                          Clear
                        </button>
                      </div>
                    </TabPane>
                  </TabContent>
                </div>
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
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Management Funded Project
          </ModalHeader>
          <ModalBody>
            {/* Table with Pagination */}
            <Table
              striped
              bordered
              hover
              id="managementFundProjectId"
              innerRef={tableRef}
            >
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>School</th>
                  <th>Department</th>
                  <th>Faculty Name</th>
                  <th>Project Title</th>
                  <th>Amount</th>
                  <th>Month of Grant</th>
                  <th>Type of Funding</th>
                  <th className="d-none">Abstract File Path</th> {/* Hidden */}
                  <th className="d-none">SanctionOrder File Path</th>{" "}
                  {/* Hidden */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mfpData.length > 0 ? (
                  mfpData.map((mfp, index) => (
                    <tr key={mfp.managementFundProjectId}>
                      <td>{index + 1}</td>
                      <td>{mfp.academicYear}</td>
                      <td>{mfp.streamName}</td>
                      <td>{mfp.departmentName}</td>
                      <td>{mfp.facultyName}</td>
                      <td>{mfp.projectTitle}</td>
                      <td>{mfp.amount}</td>
                      <td>{mfp.monthOfGrant}</td>
                      <td>{mfp.fundingType}</td>
                      <td className="d-none">
                        {mfp?.principleInvestigatorDto?.filePath
                          ?.abstractProject || "N/A"}
                      </td>{" "}
                      {/* Hidden */}
                      <td className="d-none">
                        {mfp?.principleInvestigatorDto?.filePath
                          ?.sanctionOrder || "N/A"}
                      </td>{" "}
                      {/* Hidden */}
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() =>
                              handleEdit(mfp.managementFundProjectId)
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleDelete(mfp.managementFundProjectId)
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
                      No MFP data available.
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

export default Management_Funded_Project;
