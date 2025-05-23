import Breadcrumb from "Components/Common/Breadcrumb";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import SemesterTypeDropdown from "Components/DropDowns/SemesterTypeDropdown";
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
import GetAllProgramDropdown from "Components/DropDowns/GetAllProgramDropdown";

const api = new APIClient();

const Iks: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [iksData, setIksData] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fetch NCC data from the backend
  const fetchIksData = async () => {
    try {
      const response = await api.get("/iks/getAllIks", "");
      setIksData(response.data);
      console.log("Isrc data fetched successfully:", response.data);
    } catch (error) {
      console.error("Error fetching Isrc:", error);
    }
  };

  // Open the modal and fetch data
  const handleListIksClick = () => {
    toggleModal();
    fetchIksData();
  };

  const handleEdit = (id: string) => {
    console.log("Edit Isrc with ID:", id);
    // Add your edit logic here
  };

  const handleDelete = (id: string) => {
    console.log("Delete Isrc with ID:", id);
    // Add your delete logic here
  };

  const formatDate = (date: string): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      semesterType: null as { value: string; label: string } | null,
      stream: null as { value: string; label: string } | null,
      program: null as { value: string; label: string } | null,
      noOfParticipants: "",
      organization: "",
      location: "",
      date: "",
      file: null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select academic year"),
      semesterType: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select a semester type"), // Single object for single-select
      stream: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select school"),
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
      program: Yup.object<{ value: string; label: string }>()
        .nullable()
        .required("Please select Course"),
      noOfParticipants: Yup.number()
        .typeError("Please enter a valid number")
        .min(0, "Number of students completed cannot be less than 0")
        .required("Please enter number of No Of Participants"),
      organization: Yup.string().required("Please select Organization"),
      location: Yup.string().required("Please select Location"),
      date: Yup.date().required("Please select Date"),
    }),
    onSubmit: async (values, { resetForm }) => {
      // Create FormData object
      const formData = new FormData();

      // Append fields to FormData
      formData.append("academicYear", values.academicYear?.value || "");
      formData.append("streamId", values.stream?.value || "");
      formData.append("programId", values.program?.value || "");
      formData.append("semType", values.semesterType?.value || "");
      formData.append("noOfParticipants", values.noOfParticipants || "");
      formData.append("organization", values.organization || "");
      formData.append("location", values.location || "");
      formData.append("date", formatDate(values.date) || "");

      // Append the file
      if (values.file) {
        formData.append("iks", values.file);
      } else {
        console.error("No file selected");
      }

      try {
        const response = await api.create("/iks/saveIks", formData);
        // Display success message
        toast.success(response.message || "Iks added successfully!");
        console.log("Iks created successfully:", response.data);
        // Reset the form fields
        resetForm();
        // display the Nss List
        handleListIksClick();
      } catch (error) {
        // Display error message
        toast.error("Failed to save Iks. Please try again.");
        console.error("Error creating Iks:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="IKS" breadcrumbItem="IKS" />
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
                   <Col lg={4}>
                    <div className="mb-3">
                      <Label>Program</Label>
                      <GetAllProgramDropdown
                        value={validation.values.program}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("program", selectedOption)
                        }
                        isInvalid={
                          validation.touched.program &&
                          !!validation.errors.program
                        }
                      />
                      {validation.touched.program &&
                        validation.errors.program && (
                          <div className="text-danger">
                            {validation.errors.program}
                          </div>
                        )}
                    </div>
                  </Col>
                    {/* Semester Dropdowns */}
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Semester Type</Label>
                      <SemesterTypeDropdown
                        value={validation.values.semesterType}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("semesterType", selectedOption)
                        }
                        isInvalid={
                          validation.touched.semesterType &&
                          !!validation.errors.semesterType
                        }
                      />
                      {validation.touched.semesterType &&
                        validation.errors.semesterType && (
                          <div className="text-danger">
                            {validation.errors.semesterType}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        className={`form-control ${
                          validation.touched.date &&
                          validation.errors.date
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.date}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "date",
                            e.target.value
                          )
                        }
                      />
                      {validation.touched.date &&
                        validation.errors.date && (
                          <div className="text-danger">
                            {validation.errors.date}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>No Of Participants</Label>
                      <Input
                        type="number"
                        className={`form-control ${
                          validation.touched.noOfParticipants &&
                          validation.errors.noOfParticipants
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.noOfParticipants}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "noOfParticipants",
                            e.target.value
                          )
                        }
                        placeholder="Enter No Of Participants"
                      />
                      {validation.touched.noOfParticipants &&
                        validation.errors.noOfParticipants && (
                          <div className="text-danger">
                            {validation.errors.noOfParticipants}
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
                      <Label>Location</Label>
                      <Input
                        type="text"
                        className={`form-control ${
                          validation.touched.location &&
                          validation.errors.location
                            ? "is-invalid"
                            : ""
                        }`}
                        value={validation.values.location}
                        onChange={(e) =>
                          validation.setFieldValue(
                            "location",
                            e.target.value
                          )
                        }
                        placeholder="Enter Location"
                      />
                      {validation.touched.location &&
                        validation.errors.location && (
                          <div className="text-danger">
                            {validation.errors.location}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Upload Isrc
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
                      <Label>Download Template</Label>
                      <div>
                        <a
                          href="/templateFiles/bos.pdf"
                          download
                          className="btn btn-primary btn-sm"
                        >
                          Sample Iks
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
                        onClick={handleListIksClick}
                      >
                        List Iks
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Iks*/}
        <Modal
          isOpen={isModalOpen}
          toggle={toggleModal}
          size="lg"
          style={{ maxWidth: "100%", width: "auto" }}
        >
          <ModalHeader toggle={toggleModal}>List IKS</ModalHeader>
          <ModalBody>
            <Table bordered>
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>Academic Year</th>
                  <th>School</th>
                  <th>Program</th>
                  <th>Semester Type</th>
                  <th>Department</th>
                  <th>No Of Participants</th>
                  <th>Organization</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {iksData.length > 0 ? (
                  iksData.map((iks, index) => (
                    <tr key={iks.iksId}>
                      <td>{index + 1}</td>
                      <td>{iks.academicYear}</td>
                      <td>{iks.streamName}</td>
                      <td>{iks.programName}</td>
                      <td>{iks.semType}</td>
                      <td>{iks.noOfParticipants}</td>
                      <td>{iks.organization}</td>
                      <td>{iks.location}</td>
                      <td>{iks.date}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(iks.iksId)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(iks.iksId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center">
                      No Iks data available.
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

export default Iks;
