import Breadcrumb from "Components/Common/Breadcrumb";
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
import GetAllDepartmentDropdown from "Components/DropDowns/GetAllDepartmentDropdown";


const api = new APIClient();

const Teacher_Student_Award: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teacherStudentAwardData, setTeacherStudentAwardData] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch teacherStudentAward data from the backend
  const fetchTeacherStudentAwardData = async () => {
    try {
      const response = await api.get("/teacherStudentAward/getAllTeacherStudentAward", "");
      setTeacherStudentAwardData(response.data);
      console.log("Teacher Student Award data fetched successfully:", response.data);
    } catch (error) {
      console.error("Error fetching Teacher Student Award:", error);
    }
  };

  // Open the modal and fetch data
  const handleListTeacherStudentAwardClick = () => {
    toggleModal();
    fetchTeacherStudentAwardData();
  };

  const handleEdit = (id: string) => {
    console.log("Edit Teacher Student Award with ID:", id);
    // Add your edit logic here
  };

  const handleDelete = (id: string) => {
    console.log("Delete Teacher Student Award with ID:", id);
    // Add your delete logic here
  };


  const validation = useFormik({
    initialValues: {
      presenterName:"",
      department: null as { value: string; label: string } | null,
      organization: "",
      year: "",
      file: null,
    },
    validationSchema: Yup.object({
      presenterName  : Yup.string().required("Please select Presenter Name"),
      department: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select department"),
      organization: Yup.string().required("Please select Organization"),
      year: Yup.string().required("Please select Year of Receiving Award"),
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
      formData.append("presenterName", values.presenterName || "");
      formData.append("departmentId", values.department?.value || "");
      formData.append("organization", values.organization || "");
      formData.append("year", values.year || "");

      // Append the file
      if (values.file) {
        formData.append("award", values.file);
      } else {
        console.error("No file selected");
      }

      try {
        const response = await api.create("/award/saveAward", formData);
        // Display success message
        toast.success(response.message || "Teacher Student Award added successfully!");
        console.log("Teacher Student Award created successfully:", response.data);
        // Reset the form fields
        resetForm();
        // display the TeacherStudentAward List
        handleListTeacherStudentAwardClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Teacher Student Award. Please try again.");
        console.error("Error creating Teacher Student Award:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Teacher Student Award" breadcrumbItem="Teacher Student Award" />
          <Card>
            <CardBody>
              <form onSubmit={validation.handleSubmit}>
                <Row>
                 <Col lg={4}>
                    <div className="mb-3">
                      <Label>Presenter Name</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.presenterName &&
                          validation.errors.presenterName
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.presenterName}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "presenterName",
                            e.target.value
                          )
                        }
                        placeholder="Enter Presenter Name"
                      />
                      {validation.touched.presenterName &&
                        validation.errors.presenterName && (
                          <div className="text-danger">
                            {validation.errors.presenterName}
                          </div>
                        )}
                    </div>
                  </Col>
                  
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Department</Label>
                      <GetAllDepartmentDropdown
                        value={validation.values.department}
                        onChange={(selectedOption) => {
                          validation.setFieldValue("department", selectedOption);
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
                      <Label>Year Of Receiving Award</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.year &&
                          validation.errors.year
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.year}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "year",
                            e.target.value
                          )
                        }
                        placeholder="Enter Year Of Receiving Award"
                      />
                      {validation.touched.year &&
                        validation.errors.year && (
                          <div className="text-danger">
                            {validation.errors.year}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload NSS
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
                        onClick={handleListTeacherStudentAwardClick}
                      >
                        List Teacher Student Award
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Award */}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>List Teacher Student Award</ModalHeader>
          <ModalBody>
            <Table bordered>
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>Presenter Name</th>
                  <th>Department</th>
                  <th>Organization</th>
                  <th>Year Of Receiving Award</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teacherStudentAwardData.length > 0 ? (
                  teacherStudentAwardData.map((award, index) => (
                    <tr key={award.awardId}>
                      <td>{index + 1}</td>
                      <td>{award.presenterName}</td>
                      <td>{award.departmentName}</td>
                      <td>{award.organization}</td>
                      <td>{award.yearOfReceivingAward}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(award.awardId)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(award.awardId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center">
                      No Teacher Student Award data available.
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

export default Teacher_Student_Award;
