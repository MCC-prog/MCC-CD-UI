import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import DepartmentDropdown from "Components/DropDowns/DepartmentDropdown";
import StreamDropdown from "Components/DropDowns/StreamDropdown";
import { ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import React, { useState } from "react";
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

const Consultancy_Undertaken_by_Staff: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consultancyUndertakenData, setConsultancyUndertakenData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch  data from the backend
  const fetchConsultancyUndertakenData = async () => {
    try {
      const response = await api.get("/consultancyUndertaken/getAllConsultancyUndertaken", "");
      setConsultancyUndertakenData(response.data);
      console.log(
        "Consultancy Undertaken By Staff data fetched successfully:",
        response.data
      );
    } catch (error) {
      console.error(
        "Error fetching Consultancy Undertaken By Staff data:",
        error
      );
    }
  };

  // Open the modal and fetch data
  const handleListConsultancyUndertakenClick = () => {
    toggleModal();
    fetchConsultancyUndertakenData();
  };

  const handleEdit = (id: string) => {
    console.log("Edit Agreement with ID:", id);
    // Add your edit logic here
  };

  const handleDelete = (id: string) => {
    console.log("Delete Agreement with ID:", id);
    // Add your delete logic here
  };

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      department: null as { value: string; label: string } | null,
      facultyName: "",
      agencyName: "",
      titleProject: "",
      numberTrainees: "",
      addressAgency: "",
      revenueGenerated: "",
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
      agencyName: Yup.string().required(
        "Please select Agency Name"
      ),
       titleProject: Yup.string().required("Please select Title of the Project"),
       numberTrainees: Yup.string().required("Please Number of  Trainees"),
       addressAgency: Yup.string().required("Please select Address of the Agency"),
       revenueGenerated: Yup.string().required("Please select Revenue Generated"),
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
      formData.append("facultyName",values.facultyName || "");
      formData.append("agencyName", values.agencyName || "");
      formData.append("titleProject", values.titleProject || "");
      formData.append("numberTrainees",values.numberTrainees || "");
      formData.append("addressAgency", values.addressAgency || "");
      formData.append("revenueGenerated", values.revenueGenerated || "");

      // Append the file
      if (values.file) {
        formData.append("certificate", values.file);
      } else {
        console.error("No file selected");
      }

      try {
        const response = await api.create("/consultancyUndertaken/saveConsultancyUndertaken", formData);
        // Display success message
        toast.success(
          response.message ||
            "Consultancy Undertaken By Staff added successfully!"
        );
        console.log(
          "Consultancy Undertaken By Staff created successfully:",
          response.data
        );
        // Reset the form fields
        resetForm();
        // display the Mous Agreement Copy & Activities List
        handleListConsultancyUndertakenClick();
      } catch (error) {
        // Display error message
        toast.error(
          "Failed to save Consultancy Undertaken by Staff . Please try again."
        );
        console.error(
          "Error creating Consultancy Undertaken by Staff:",
          error
        );
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="CONSULTANCY UNDERTAKEN BY STAFF" breadcrumbItem="Industry Collaboration" />
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
                      <Label>Agency Name</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.agencyName &&
                          validation.errors.agencyName
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.agencyName}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "agencyName",
                            e.target.value
                          )
                        }
                        placeholder="Enter Agency Name"
                      />
                      {validation.touched.agencyName &&
                        validation.errors.agencyName && (
                          <div className="text-danger">
                            {validation.errors.agencyName}
                          </div>
                        )}
                    </div>
                  </Col>
                   <Col lg={4}>
                    <div className="mb-3">
                      <Label>Title of the Project</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.titleProject &&
                          validation.errors.titleProject
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.titleProject}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "titleProject",
                            e.target.value
                          )
                        }
                        placeholder="Enter Title of the Project"
                      />
                      {validation.touched.titleProject &&
                        validation.errors.titleProject && (
                          <div className="text-danger">
                            {validation.errors.titleProject}
                          </div>
                        )}
                    </div>
                  </Col>
                 <Col lg={4}>
                    <div className="mb-3">
                      <Label>Number of Trainees</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.numberTrainees &&
                          validation.errors.numberTrainees
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.numberTrainees}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "numberTrainees",
                            e.target.value
                          )
                        }
                        placeholder="Enter Number of Trainees"
                      />
                      {validation.touched.numberTrainees &&
                        validation.errors.numberTrainees && (
                          <div className="text-danger">
                            {validation.errors.numberTrainees}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Address of the Agency</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.addressAgency &&
                          validation.errors.addressAgency
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.addressAgency}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "addressAgency",
                            e.target.value
                          )
                        }
                        placeholder="Enter Address of the Agency"
                      />
                      {validation.touched.addressAgency &&
                        validation.errors.addressAgency && (
                          <div className="text-danger">
                            {validation.errors.addressAgency}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Revenue Generated</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.revenueGenerated &&
                          validation.errors.revenueGenerated
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.revenueGenerated}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "revenueGenerated",
                            e.target.value
                          )
                        }
                        placeholder="Enter Revenue Generated"
                      />
                      {validation.touched.revenueGenerated &&
                        validation.errors.revenueGenerated && (
                          <div className="text-danger">
                            {validation.errors.revenueGenerated}
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
                        onClick={handleListConsultancyUndertakenClick}
                      >
                        List Consultancy Undertaken By Staff
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Consultancy Undertaken */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>List Consultancy Undertaken By Staff</ModalHeader>
          <ModalBody>
            <Table bordered>
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>Academic Year</th>
                  <th>Schools</th>
                  <th>Department</th>
                  <th>Faculty Name</th>
                  <th>Agency Name</th> 
                  <th>Title Project</th>
                  <th>Number Trainees</th>
                  <th>Address Agency</th>
                  <th>Revenue Generated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {consultancyUndertakenData.length > 0 ? (
                  consultancyUndertakenData.map((consultancyUndertaken, index) => (
                    <tr key={consultancyUndertaken.consultancyUndertakenDataId}>
                      <td>{index + 1}</td>
                      <td>{consultancyUndertaken.academicYear}</td>
                      <td>{consultancyUndertaken.stream}</td>
                      <td>{consultancyUndertaken.department}</td>
                      <td>{consultancyUndertaken.facultyName}</td>
                      <td>{consultancyUndertaken.agencyName}</td>
                      <td>{consultancyUndertaken.titleProject}</td>
                      <td>{consultancyUndertaken.numberTrainees}</td>
                      <td>{consultancyUndertaken.addressAgency}</td>
                      <td>{consultancyUndertaken.revenueGenerated}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(consultancyUndertaken.consultancyUndertakenDataId)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(consultancyUndertaken.consultancyUndertakenDataId)}
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

export default Consultancy_Undertaken_by_Staff;
