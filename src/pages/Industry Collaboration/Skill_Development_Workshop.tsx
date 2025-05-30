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

const Skill_Development_Workshop: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skillDevelopmentData, setSkillDevelopmentData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch Skill Development data from the backend
  const fetchSkillDevelopmentData = async () => {
    try {
      const response = await api.get("/SkillDevelopment/getAllSkillDevelopmentWorkshop", "");
      setSkillDevelopmentData(response.data);
      console.log(
        "Skill Development Workshop data fetched successfully:",
        response.data
      );
    } catch (error) {
      console.error(
        "Error fetching Skill Development Workshop data:",
        error
      );
    }
  };

  // Open the modal and fetch data
  const handleListSkillDevelopmentClick = () => {
    toggleModal();
    fetchSkillDevelopmentData();
  };

  const handleEdit = (id: string) => {
    console.log("Edit SkillDevelopment with ID:", id);
    // Add your edit logic here
  };

  const handleDelete = (id: string) => {
    console.log("Delete SkillDevelopment with ID:", id);
    // Add your delete logic here
  };

  const formatDate = (date: string): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  

    const StaffEnhancementProgramType = [
    { value: "FDP", label: "FDP" },
    { value: "MOOCS", label: "MOOCS" },
    { value: "SKILL ENHANCEMENT WORKSHOP", label: "SKILL ENHANCEMENT WORKSHOP" }
  ];
   
   const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
  };
  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      facultyName: "",
      staffEnhancementProgramType: null as { value: string; label: string } | null,
      title: "",
      organizedBy: "",
      fromDate: "",
      toDate: "",
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
      facultyName: Yup.string().required("Please select Faculty Name"),
      staffEnhancementProgramType: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select Centralised Centres"),
      title: Yup.string().required("Please select Title"),
      organizedBy: Yup.string().required(
        "Please select Organized By"
      ),
      fromDate: Yup.date().required("Please select From Date"),
      toDate: Yup.date().required("Please select To Date"),
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
      formData.append("facultyName", values.facultyName || "");
      formData.append("staffEnhancementProgramType",values.staffEnhancementProgramType?.value || "");
      formData.append("organizedBy", values.organizedBy || "");
      formData.append("title", values.title || "");
      formData.append("fromDate",formatDate(values.fromDate) || "");
      formData.append("toDate", formatDate(values.toDate) || "");
      // Append the file
      if (values.file) {
        formData.append("certificate", values.file);
      } else {
        console.error("No file selected");
      }

      try {
        const response = await api.create("/skillDevelopment/saveSkillDevelopment", formData);
        // Display success message
        toast.success(
          response.message ||
            "Skill Development Workshop added successfully!"
        );
        console.log(
          "Skill Development Workshop created successfully:",
          response.data
        );
        // Reset the form fields
        resetForm();
        // display the Skill Development List
        handleListSkillDevelopmentClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Skill Development Workshop. Please try again."
        );
        console.error(
          "Error creating Skill Development Workshop:",
          error
        );
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Skill Development Workshop" breadcrumbItem="Industry Collaboration" />
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
                      <Label>Faculty Name</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.facultyName &&
                          validation.errors.facultyName
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.facultyName}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "facultyName",
                            e.target.value
                          )
                        }
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
                                <Label>Staff Enhancement ProgramType</Label>
                                <Select
                                  options={StaffEnhancementProgramType}
                                  value={validation.values.staffEnhancementProgramType}
                                  onChange={(selectedOption) =>
                                    validation.setFieldValue(
                                      "staffEnhancementProgramType",
                                      selectedOption
                                    )
                                  }
                                  placeholder="Select Staff Enhancement ProgramType"
                                  styles={dropdownStyles}
                                  menuPortalTarget={document.body}
                                  className={
                                    validation.touched.staffEnhancementProgramType &&
                                    validation.errors.staffEnhancementProgramType
                                      ? "select-error"
                                      : ""
                                  }
                                />
                                {validation.touched.staffEnhancementProgramType &&
                                  validation.errors.staffEnhancementProgramType && (
                                    <div className="text-danger">
                                      {validation.errors.staffEnhancementProgramType}
                                    </div>
                                  )}
                              </div>
                            </Col>
                             <Col lg={4}>
                    <div className="mb-3">
                      <Label>Title</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.title &&
                          validation.errors.title
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.title}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="Enter Title"
                      />
                      {validation.touched.title &&
                        validation.errors.title && (
                          <div className="text-danger">
                            {validation.errors.title}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Organization  By</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.organizedBy &&
                          validation.errors.organizedBy
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.organizedBy}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "organizedBy",
                            e.target.value
                          )
                        }
                        placeholder="Enter Organization By"
                      />
                      {validation.touched.organizedBy &&
                        validation.errors.organizedBy && (
                          <div className="text-danger">
                            {validation.errors.organizedBy}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>From Date</Label>
                      <Input
                        type="date"
                        className={`form-control ${
                          validation.touched.fromDate &&
                          validation.errors.fromDate
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.fromDate}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "fromDate",
                            e.target.value
                          )
                        }
                      />
                      {validation.touched.fromDate &&
                        validation.errors.fromDate && (
                          <div className="text-danger">
                            {validation.errors.fromDate}
                          </div>
                        )}
                    </div>
                  </Col>
                   <Col lg={4}>
                    <div className="mb-3">
                      <Label>To Date</Label>
                      <Input
                        type="date"
                        className={`form-control ${
                          validation.touched.toDate &&
                          validation.errors.toDate
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.toDate}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "toDate",
                            e.target.value
                          )
                        }
                      />
                      {validation.touched.toDate &&
                        validation.errors.toDate && (
                          <div className="text-danger">
                            {validation.errors.toDate}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Certificate
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
                        onClick={handleListSkillDevelopmentClick}
                      >
                        List Skill Development Workshop
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Skill Development Workshop */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>List Skill Development Workshop</ModalHeader>
          <ModalBody>
            <Table bordered>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>Schools</th>
                  <th>Department</th>
                  <th>Faculty Name</th>
                  <th>Staff Enhancement ProgramType</th>
                  <th>Title</th>
                  <th>Organization By</th> 
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {skillDevelopmentData.length > 0 ? (
                  skillDevelopmentData.map((skillDevelopment, index) => (
                    <tr key={skillDevelopment.skillDevelopmentDataId}>
                      <td>{index + 1}</td>
                      <td>{skillDevelopment.academicYear}</td>
                      <td>{skillDevelopment.stream}</td>
                      <td>{skillDevelopment.department}</td>
                      <td>{skillDevelopment.facultyName}</td>
                      <td>{skillDevelopment.staffEnhancementProgramType}</td>
                      <td>{skillDevelopment.title}</td>
                      <td>{skillDevelopment.organizedBy}</td>
                      <td>{skillDevelopment.fromDate}</td>
                      <td>{skillDevelopment.toDate}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(skillDevelopment.skillDevelopmentDataId)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(skillDevelopment.skillDevelopmentDataId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center">
                      No Skill Development Workshop data available.
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

export default Skill_Development_Workshop;
