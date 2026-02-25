import React, { useEffect, useRef, useState } from "react";
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

const api = new APIClient();

const Fellowships_Awarded_For_AL_And_Research = () => {
  const [departmentOptions, setDepartmentOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isFellowshipFileUploadDisabled, setIsFellowshipFileUploadDisabled] =
    useState(false);
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
  const [fwlData, setFwlData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState(fwlData);
  const tableRef = useRef<HTMLTableElement>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const file2Ref = useRef<HTMLInputElement | null>(null);
  const file3Ref = useRef<HTMLInputElement | null>(null);

  const [editResData, setEditResData] = useState<any>(null);

  const isTabFilled = (validation: any, tab: number | null) => {
    switch (tab) {
      case 1:
        return (
          validation.values.principalInvestigator.name ||
          validation.values.principalInvestigator.qualification ||
          validation.values.principalInvestigator.designation ||
          validation.values.principalInvestigator.department ||
          validation.values.principalInvestigator.abstractFile ||
          validation.values.principalInvestigator.sanctionOrderFile
        );
      case 2:
        return (
          validation.values.coInvestigator.name ||
          validation.values.coInvestigator.qualification ||
          validation.values.coInvestigator.designation ||
          validation.values.coInvestigator.department
        );
      default:
        return false;
    }
  };

  const tabName: Record<number, string> = {
    1: "PrincipleInvestigatorDetails",
    2: "CoInvestigatorDetails",
  };

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
          `/fellowshipAwarded/deleteFellowshipAwardedTabsAndDoc?fellowshipAwardedAddTabId=${deleteId}&tabName=${encodeURIComponent(
            tabName[tab!]
          )}`,
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

          if (file3Ref.current) file3Ref.current.value = "";
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

  // Toggle the modal for listing fwl
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
    validation.setFieldValue("activeTab", tab); // <-- CRITICAL
    validation.setTouched({});
    validation.setErrors({});
  };

  const validationSchema = Yup.object({
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
    fellowshipName: Yup.string().required("Please enter fellowship name"),
    projectTitle: Yup.string().required("Please enter project title"),
    amount: Yup.number()
      .typeError("Please enter a valid number")
      .min(0, "Amount cannot be less than 0")
      .required("Please enter the amount"),
    monthOfGrant: Yup.string().required("Please enter the month of grant"),
    typeOfFunding: Yup.object<{ value: string; label: string }>()
      .nullable()
      .required("Please select type of funding"),
    fellowship: Yup.mixed().required("Please upload the fellowship file"),
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

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      otherDepartment: "",
      facultyName: "",
      fellowshipName: "",
      projectTitle: "",
      amount: "",
      monthOfGrant: "",
      typeOfFunding: null as { value: string; label: string } | null,
      fellowship: null as File | null,
      principalInvestigator: {
        pId: null,
        name: "",
        qualification: "",
        designation: "",
        department: null as { value: string; label: string } | null,
        //date: "",
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
      // Create FormData object
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

      // Prepare the JSON payload for the `dto` key
      const dtoPayload: any = {
        fellowshipAwardedId: editId || null,
        academicYear: values.academicYear?.value || null,
        streamId: values.stream?.value || null,
        departmentId: values.department?.value || null,
        facultyName: values.facultyName || null,
        fellowshipName: values.fellowshipName || null,
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
      // Append the JSON payload as a string with the key `fellowshipAwardedRequestDto`
      formData.append(
        "fellowshipAwardedRequestDto",
        new Blob([JSON.stringify(dtoPayload)], { type: "application/json" })
      );
      console.log("API PAYLOAD CHECK ==>>", dtoPayload);

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

      // append global fellowship file
      if (values.fellowship instanceof File) {
        formData.append("fellowship", values.fellowship as Blob);
      }
      try {
        const response =
          isEditMode && editId
            ? await api.put(`/fellowshipAwarded/update`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              })
            : await api.create(`/fellowshipAwarded/save`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });

        toast.success(response.message || "FWL record saved successfully!");
        // Reset the form fields
        resetForm();
        if (fileRef.current) {
          fileRef.current.value = "";
        }
        if (file2Ref.current) {
          file2Ref.current.value = "";
        }
        if (file3Ref.current) {
          file3Ref.current.value = "";
        }
        setIsFellowshipFileUploadDisabled(false);
        setIsAbstractFileUploadDisabled(false);
        setIsSanctionFileUploadDisabled(false);
        setIsEditMode(false); // Reset edit mode
        setEditId(null); // Clear the edit ID
        handleListFWLClick(); // Refresh the list
      } catch (error) {
        toast.error("Failed to save FWL. Please try again.");
        console.error("Error creating/updating FWL:", error);
      }
    },
  });

  const fetchMFAData = async () => {
    try {
      const response = await api.get("/fellowshipAwarded/getAll", "");
      setFwlData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching MFA data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListFWLClick = () => {
    toggleModal();
    fetchMFAData();
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the BOS data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/fellowshipAwarded/deleteFellowshipAwarded?fellowshipAwardedId=${id}`,
          ""
        );
        setIsModalOpen(false);
        toast.success(response.message || "FWL record removed successfully!");
        fetchMFAData();
      } catch (error) {
        toast.error("Failed to remove FWL Record. Please try again.");
        console.error("Error deleting FWL:", error);
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
          `/fellowshipAwarded/download/${fileName}`,
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
  const handleDeleteFile = async (
    fileType: "fellowship" | "abstractProject" | "sanctionOrder"
  ) => {
    try {
     
      const response = await api.delete(
        `/fellowshipAwarded/deleteFellowshipAwardedDocument?fellowshipAwardedId=${editId}&docType=${fileType}`,
        ""
      );
      toast.success(response.message || "File deleted successfully!");

      if (fileType === "fellowship") {
        validation.setFieldValue("fellowship", null);
        setIsFellowshipFileUploadDisabled(false);
      } else if (fileType === "abstractProject") {
        validation.setFieldValue("principalInvestigator.abstractFile", null);
        setIsAbstractFileUploadDisabled(false);
      } else if (fileType === "sanctionOrder") {
        validation.setFieldValue(
          "principalInvestigator.sanctionOrderFile",
          null
        );
        setIsSanctionFileUploadDisabled(false);
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
            innerRef={file2Ref}
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
                onClick={() => handleDeleteFile("abstractProject")}
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
            innerRef={file3Ref}
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
                onClick={() => handleDeleteFile("sanctionOrder")}
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
        `/fellowshipAwarded/edit?fellowshipAwardedId=${id}`,
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
        fellowshipName: response.fellowshipName || "",
        projectTitle: response.projectTitle || "",
        amount: response.amount || "",
        monthOfGrant: response.monthOfGrant || "",
        typeOfFunding: response.fundingType
          ? { value: response.fundingType, label: response.fundingType }
          : null,
        fellowship: response.globalDocument?.fellowship || null,
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
        setDocumentType("PrincipleInvestigatorDetails");
      } else if (response.multidisciplinaryType === "CoInvestigatorDetails") {
        setActiveTab("2");
        setDocumentType("CoInvestigatorDetails");
      }

      // Update Formik values
      validation.setValues(mappedValues);

      // Set file upload disabled states based on file presence
      setIsFellowshipFileUploadDisabled(!!response.globalDocument?.fellowship);
      setIsAbstractFileUploadDisabled(
        !!response.principleInvestigatorDto?.file?.abstractProject
      );
      setIsSanctionFileUploadDisabled(
        !!response.principleInvestigatorDto?.file?.sanctionOrder
      );

      // Set edit mode and toggle modal
      setIsEditMode(true);
      setEditId(id); // Store the ID of the record being edited
      toggleModal();
    } catch (error) {
      console.error("Error fetching Research Publication data by ID:", error);
    }
  };

  function handleDelete(fwlDataId: any): void {
    setDeleteId(fwlDataId);
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
    if (fwlData.length === 0) return; // wait until data is loaded

    const table = $("#fellowshipAwardedId").DataTable({
      destroy: true, // destroy existing instance if re-rendered
      scrollX: true,
      autoWidth: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "copy",
          filename: "Fellowships_Awarded_For_AL_And_Research_Data",
          title: "Fellowships Awarded For Advanced Learning & Research Data Export",
          exportOptions: {
            columns: ":not(:last-child)", // skip Actions column
          },
        },
        {
          extend: "csv",
          filename: "Fellowships_Awarded_For_AL_And_Research_Data",
          title: "Fellowships Awarded For Advanced Learning & Research Data Export",
          exportOptions: {
            columns: ":not(:last-child)",
          },
        },
      ],
    });
    $(".dt-buttons").addClass("mb-3 gap-2");
    $(".buttons-copy").addClass("btn btn-success");
    $(".buttons-csv").addClass("btn btn-info");

    $("#fellowshipAwardedId").on(
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
  }, [fwlData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Research"
            breadcrumbItem="Fellowships Awarded For Advanced Learning & Research"
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Name of the Fellowship</Label>
                      <Input
                        type="text"
                        value={validation.values.fellowshipName}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "fellowshipName",
                            e.target.value
                          )
                        }
                        className={`form-control ${
                          validation.touched.fellowshipName &&
                          validation.errors.fellowshipName
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter Name of the Fellowship"
                      />
                      {validation.touched.fellowshipName &&
                        validation.errors.fellowshipName && (
                          <div className="text-danger">
                            {validation.errors.fellowshipName}
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
                        <option value="MGMT">MGMT</option>
                        <option value="External Funding Agency">
                          External Funding Agency
                        </option>
                      </Input>
                      {validation.touched.typeOfFunding &&
                        validation.errors.typeOfFunding && (
                          <div className="text-danger">
                            {validation.errors.typeOfFunding}
                          </div>
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
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Sanction Letter
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.fellowship &&
                          validation.errors.fellowship
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="formFile"
                        innerRef={fileRef}
                        onChange={(event) => {
                          validation.setFieldValue(
                            "fellowship",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFellowshipFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.fellowship &&
                        validation.errors.fellowship && (
                          <div className="text-danger">
                            {validation.errors.fellowship}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFellowshipFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.fellowship === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.fellowship}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() => {
                              if (
                                typeof validation.values.fellowship === "string"
                              ) {
                                handleDownloadFile(
                                  validation.values.fellowship
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
                            onClick={() => handleDeleteFile("fellowship")}
                            title="Delete File"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      )}
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
                        onClick={handleListFWLClick}
                      >
                        List FWL
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing FWL */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>
            List Fellowship Awarded Learning
          </ModalHeader>
          <ModalBody>
            <Table
              striped
              bordered
              hover
              id="fellowshipAwardedId"
              innerRef={tableRef}
            >
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>School</th>
                  <th>Department</th>
                  <th>Faculty Name</th>
                  <th>Fellowship Name</th>
                  <th>Project Title</th>
                  <th>Amount</th>
                  <th>Month of Grant</th>
                  <th>Type of Funding</th>
                  <th>Multidisciplinary</th>
                  <th className="d-none">PrincipalInvestigator Sanction Letter File Path</th>
                  <th className="d-none">PrincipalInvestigator Name</th>
                  <th className="d-none">PrincipalInvestigator Qualification</th>
                  <th className="d-none">PrincipalInvestigator Designation</th>
                  <th className="d-none">PrincipalInvestigator Department</th>
                  <th className="d-none">PrincipalInvestigator Abstract File Path</th>
                  <th className="d-none">PrincipalInvestigator Sanction Order File Path</th>
                  
                  <th className="d-none">CoInvestigator  Name</th>
                  <th className="d-none">CoInvestigator  Qualification</th>
                  <th className="d-none">CoInvestigator  Designation</th>
                  <th className="d-none">CoInvestigator  Department</th>

                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fwlData.length > 0 ? (
                  fwlData.map((fw, index) => (
                    <tr key={fw.fellowshipAwardedId}>
                      <td>{index + 1}</td>
                      <td>{fw.academicYear}</td>
                      <td>{fw.streamName}</td>
                      <td>{fw.departmentName}</td>
                      <td>{fw.facultyName}</td>
                      <td>{fw.fellowshipName}</td>
                      <td>{fw.projectTitle}</td>
                      <td>{fw.amount}</td>
                      <td>{fw.monthOfGrant}</td>
                      <td>{fw.fundingType}</td>
                      <td>{fw.multidisciplinary}</td>
                      <td className="d-none">{fw?.filePath?.fellowship || "N/A"}</td>
                      <td className="d-none">{fw?.principleInvestigatorDto?.name || "N/A"}</td>
                      <td className="d-none">{fw?.principleInvestigatorDto?.qualification || "N/A"}</td>
                      <td className="d-none">{fw?.principleInvestigatorDto?.designation || "N/A"}</td>
                      <td className="d-none">{fw?.principleInvestigatorDto?.departmentName || "N/A"}</td>
                      <td className="d-none">{fw?.principleInvestigatorDto?.filePath?.abstractProject || "N/A"}</td>
                      <td className="d-none">{fw?.principleInvestigatorDto?.filePath?.sanctionOrder || "N/A"}</td>
                      
                      <td className="d-none">{fw?.coInvestigatorDto?.name || "N/A"}</td>
                      <td className="d-none">{fw?.coInvestigatorDto?.qualification || "N/A"}</td>
                      <td className="d-none">{fw?.coInvestigatorDto?.designation || "N/A"}</td>
                      <td className="d-none">{fw?.coInvestigatorDto?.departmentName || "N/A"}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(fw.fellowshipAwardedId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(fw.fellowshipAwardedId)}
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
                      No FWL data available.
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

export default Fellowships_Awarded_For_AL_And_Research;
