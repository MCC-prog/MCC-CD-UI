import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DegreeDropdown from "Components/DropDowns/DegreeDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import ProgramDropdown from "Components/DropDowns/ProgramDropdown";
import ProgramTypeDropdown from "Components/DropDowns/ProgramTypeDropdown";
import SemesterDropdowns from "Components/DropDowns/SemesterDropdowns";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import { ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import React, { useState } from "react";
import Select from "react-select";
import {
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Table,
} from "reactstrap";
import * as Yup from "yup";
import { APIClient } from "../../helpers/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const api = new APIClient();

const Mous_AgreementCopy_Activities: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agreementData, setAgreementData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch BOS data from the backend
  const fetchAgreementData = async () => {
    try {
      const response = await api.get("/agreement/getAllAgreement", "");
      setAgreementData(response.data);
      console.log(
        "Mous Agreement Copy & Activities data fetched successfully:",
        response.data
      );
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

  const handleEdit = (id: string) => {
    console.log("Edit Agreement with ID:", id);
    // Add your edit logic here
  };

  const handleDelete = (id: string) => {
    console.log("Delete Agreement with ID:", id);
    // Add your delete logic here
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

    const CentralisedCentres = [
    { value: "IRC", label: "IRC" },
    { value: "MCCIIE", label: "MCCIIE" },
    { value: "RESEARCH CENTER", label: "RESEARCH CENTER" },
    { value: "IKS", label: "IKS" },
    { value: "CEE", label: "CEE" },
    { value: "ALUMNI", label: "ALUMNI" },
    { value: "CLDT", label: "CLDT" },
  ];
   
  const TargetAudience =[
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
      file: null,
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
      file: Yup.mixed()
        .required("Please upload a file")
        .test("fileSize", "File size is too large", (value: any) => {
          return value && value.size <= 2 * 1024 * 1024; // 2MB limit
        })
        .test("fileType", "Unsupported file format", (value: any) => {
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
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("centralisedCentres",values.centralisedCentres?.value || "");
      formData.append("organization", values.organization || "");
      formData.append("addessOrganization", values.addessOrganization || "");
      formData.append("yearSigningMou",formatDate(values.yearSigningMou) || "");
      formData.append("mouValid", formatDate(values.mouValid) || "");
      formData.append("typeActivity", values.typeActivity || "");
      formData.append("targetAudience", values.targetAudience.map((option) => option.value).join(",") || "");
      // Append the file
      if (values.file) {
        formData.append("mom", values.file);
      } else {
        console.error("No file selected");
      }

      try {
        const response = await api.create("/agreement/saveAgreement", formData);
        // Display success message
        toast.success(
          response.message ||
            "Mous Agreement Copy & Activities added successfully!"
        );
        console.log(
          "Mous Agreement Copy & Activities created successfully:",
          response.data
        );
        // Reset the form fields
        resetForm();
        // display the Mous Agreement Copy & Activities List
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
                                  options={CentralisedCentres}
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
                      <Label>Organization</Label>
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
                          validation.setFieldValue(
                            "yearSigningMou",
                            e.target.value
                          )
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
                                      { validation.touched.targetAudience
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
                      </Label>
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
                      />
                      {validation.touched.file && validation.errors.file && (
                        <div className="text-danger">
                          {validation.errors.file}
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Letter/MOU
                      </Label>
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
                      />
                      {validation.touched.file && validation.errors.file && (
                        <div className="text-danger">
                          {validation.errors.file}
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
                        Save
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
          <ModalHeader toggle={toggleModal}>List MOUS Agreement Copy & Activities</ModalHeader>
          <ModalBody>
            <Table bordered>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>Schools</th>
                  <th>Department</th>
                  <th>Centralised Centres</th>
                  <th>Organization</th> 
                  <th>Addess Of Organization</th>
                  <th>Year Of Signing Mou</th>
                  <th>Mou Valid</th>
                  <th>Type Of Activity</th>
                  <th>Target Audience</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agreementData.length > 0 ? (
                  agreementData.map((agreement, index) => (
                    <tr key={agreement.agreementDataId}>
                      <td>{index + 1}</td>
                      <td>{agreement.academicYear}</td>
                      <td>{agreement.stream}</td>
                      <td>{agreement.department}</td>
                      <td>{agreement.centralisedCentres}</td>
                      <td>{agreement.organization}</td>
                      <td>{agreement.addessOrganization}</td>
                      <td>{agreement.yearSigningMou}</td>
                      <td>{agreement.mouValid}</td>
                      <td>{agreement.typeActivity}</td>
                      <td>{agreement.targetAudience}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(agreement.agreementDataId)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(agreement.agreementDataId)}
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
          </ModalBody>
        </Modal>
      </div>
      <ToastContainer />
    </React.Fragment>
  );
};

export default Mous_AgreementCopy_Activities;
