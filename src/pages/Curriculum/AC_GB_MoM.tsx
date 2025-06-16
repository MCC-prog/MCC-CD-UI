import Breadcrumb from "Components/Common/Breadcrumb";
import { useFormik } from "formik";
import React, { useRef, useState } from "react";
import Select from "react-select";
import * as Yup from "yup";
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
} from "reactstrap";
import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import moment from "moment";
import { toast, ToastContainer } from "react-toastify";
import { APIClient } from "../../helpers/api_helper";
import axios from "axios";

const api = new APIClient();

const AC_GB_MoM: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acGbMomData, setAcGbMomData] = useState<any[]>([]);
  const [isFileUploadDisabled, setIsFileUploadDisabled] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [filteredData, setFilteredData] = useState(acGbMomData);
  const [filters, setFilters] = useState({
    academicYear: "",
    date: "",
    acFile: null as string | null,
    gbFile: null as string | null,
  });
  const acFileRef = useRef<HTMLInputElement | null>(null);
  const gbFileRef = useRef<HTMLInputElement | null>(null);

  // Handle global search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = acGbMomData.filter((row) =>
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

    const filtered = acGbMomData.filter((row) =>
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

  // Fetch Ac & Gb Mom data from the backend
  const fetchAcGbMomData = async () => {
    try {
      const response = await axios.get("/acGbMom/getAllAcGbMom"); // Replace with your backend API endpoint
      setAcGbMomData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Ac & Gb Mom data:", error);
    }
  };

  // Open the modal and fetch data
  const handleListACGBClick = () => {
    toggleModal();
    fetchAcGbMomData();
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
  // Fetch the data for the selected Ac & Gb Mom ID and populate the form fields
  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(`/acGbMom?acGbMomId=${id}`, "");
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
        dates: response.date
          ? moment(response.date, "YYYY-MM-DD").format("DD/MM/YYYY")
          : "",

        acFile: response.documents?.AcademicCouncilMom || null,
        gbFile: response.documents?.GoverningBodyMom || null,
      };

      // Update Formik values
      validation.setValues({
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
        dates: mappedValues.dates || "",
        acFile: mappedValues.acFile || null,
        gbFile: mappedValues.gbFile || null,
      });
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      // Disable the file upload button if a file exists
      setIsFileUploadDisabled(!!response.document?.excel);
      toggleModal();
    } catch (error) {
      console.error("Error fetching Ac & Gb Mom data by ID:", error);
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the Ac & Gb Mom data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/acGbMom/deleteAcGbMom?acGbMomId=${id}`,
          ""
        );
        toast.success(response.message || "Ac & Gb Mom removed successfully!");
        fetchAcGbMomData();
      } catch (error) {
        toast.error("Failed to remove Ac & Gb Mom. Please try again.");
        console.error("Error deleting Ac & Gb Mom:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  // Handle file download actions
  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      try {
        // Ensure you set responseType to 'blob' to handle binary data
        const response = await axios.get(`/acGbMom/download/${fileName}`, {
          responseType: "blob",
        });

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
        toast.error("Failed to download excel file. Please try again.");
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
        `/acGbMom/deleteAcGbMomDocument?acGbMomDocumentId=${editId}`,
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

  type AcademicYearOption = { value: string; label: string } | null;

  const validation = useFormik({
    initialValues: {
      academicYear: null as { value: string; label: string } | null,
      dates: "",
      acFile: null,
      gbFile: null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select academic year"),
      dates: Yup.string().required("Please select Date"),
      acFile: Yup.mixed()
        .test("required", "Please upload a file", (value: any) => {
          return value !== null && value !== undefined;
        })
        .test("fileSize", "File size is too large", (value: any) => {
          if (typeof value === "string") return true; // Skip check for string (edit mode)
          if (!value) return true; // Let 'required' test handle null/undefined
          return value.size <= 2 * 1024 * 1024; // Max 2MB
        })
        .test("fileType", "Unsupported file format", (value: any) => {
          if (typeof value === "string") return true; // Allow URLs or previously uploaded files
          if (!value) return true; // Let 'required' test handle it
          return ["application/pdf", "image/jpeg", "image/png"].includes(
            value.type
          );
        }),

      gbFile: Yup.mixed()
        .test("required", "Please upload a file", (value: any) => {
          return value !== null && value !== undefined;
        })
        .test("fileSize", "File size is too large", (value: any) => {
          if (typeof value === "string") return true; // allow previously uploaded URLs in edit mode
          if (!value) return true; // let required() handle null
          return value.size <= 2 * 1024 * 1024; // 2MB
        })
        .test("fileType", "Unsupported file format", (value: any) => {
          if (typeof value === "string") return true; // allow previously uploaded file references
          if (!value) return true; // let required() handle null
          return ["application/pdf", "image/jpeg", "image/png"].includes(
            value.type
          );
        }),
    }),
    onSubmit: (values, { resetForm }) => {
      const formData = new FormData();
      formData.append("acGbMomId", editId || "");
      formData.append(
        "academicYear",
        values.academicYear ? values.academicYear.value : ""
      );
      formData.append(
        "date",
        moment(values.dates, "DD/MM/YYYY").format("DD/MM/YYYY") // Convert to yyyy-mm-dd for the backend
      );
      // Handle the file conditionally
      if (isEditMode && typeof values.acFile === "string") {
        // Pass an empty Blob instead of null
        formData.append(
          "academicCouncilMom",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.acFile === null) {
        formData.append(
          "academicCouncilMom",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.acFile) {
        formData.append("academicCouncilMom", values.acFile);
      }

      if (isEditMode && typeof values.gbFile === "string") {
        // Pass an empty PDF instead of null
        formData.append(
          "governingBodyMom",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.gbFile === null) {
        formData.append(
          "governingBodyMom",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.gbFile) {
        formData.append("governingBodyMom", values.gbFile);
      }

      if (isEditMode && editId) {
        // Update existing record
        api
          .put(`/acGbMom`, formData)
          .then((response) => {
            toast.success(
              response.message || "Ac & Gb Mom updated successfully!"
            );
            resetForm();
            if (acFileRef.current) acFileRef.current.value = "";
            if (gbFileRef.current) gbFileRef.current.value = "";

            setIsEditMode(false);
            setEditId(null);
            setIsFileUploadDisabled(false); // Reset file upload state
            toggleModal();
            fetchAcGbMomData();
          })
          .catch((error) => {
            toast.error("Failed to update Ac & Gb Mom. Please try again.");
            console.error("Error updating Ac & Gb Mom:", error);
          });
      } else {
        // Create new record
        api
          .create("/acGbMom", formData)
          .then((response) => {
            toast.success(
              response.message || "Ac & Gb Mom created successfully!"
            );
            resetForm();
            if (acFileRef.current) acFileRef.current.value = "";
            if (gbFileRef.current) gbFileRef.current.value = "";

            setIsEditMode(false);
            setEditId(null);
            setIsFileUploadDisabled(false); // Reset file upload state
            toggleModal(); // Close the modal after creation
            fetchAcGbMomData();
          })
          .catch((error) => {
            toast.error("Failed to create Ac & Gb Mom. Please try again.");
            console.error("Error creating Ac & Gb Mom:", error);
          });
      }
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Curriculum" breadcrumbItem="Ac & GB MoM" />
          <Card>
            <CardBody>
              <form onSubmit={validation.handleSubmit}>
                <Row>
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
                      <Label>Date</Label>
                      <Input
                        type="date" // Use native date input
                        className={`form-control ${
                          validation.touched.dates && validation.errors.dates
                            ? "is-invalid"
                            : ""
                        }`}
                        value={
                          validation.values.dates
                            ? moment(
                                validation.values.dates,
                                "DD/MM/YYYY"
                              ).format("YYYY-MM-DD") // Convert to yyyy-mm-dd for the input
                            : ""
                        }
                        onChange={(e) => {
                          const formattedDate = moment(
                            e.target.value,
                            "YYYY-MM-DD"
                          ).format("DD/MM/YYYY"); // Convert to dd/mm/yyyy
                          validation.setFieldValue("dates", formattedDate);
                        }}
                        placeholder="dd/mm/yyyy"
                      />
                      {validation.touched.dates && validation.errors.dates && (
                        <div className="text-danger">
                          {validation.errors.dates}
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Academic Council MOM
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.acFile && validation.errors.acFile
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        innerRef={acFileRef}
                        id="formFile"
                        onChange={(event) => {
                          validation.setFieldValue(
                            "acFile",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.acFile &&
                        validation.errors.acFile && (
                          <div className="text-danger">
                            {validation.errors.acFile}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.acFile === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.acFile}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                typeof validation.values.acFile === "string"
                                  ? validation.values.acFile
                                  : ""
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
                        Governing Body MoM
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.gbFile && validation.errors.gbFile
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        innerRef={gbFileRef}
                        onChange={(event) => {
                          validation.setFieldValue(
                            "gbFile",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                        disabled={isFileUploadDisabled} // Disable the button if a file exists
                      />
                      {validation.touched.gbFile &&
                        validation.errors.gbFile && (
                          <div className="text-danger">
                            {validation.errors.gbFile}
                          </div>
                        )}
                      {/* Show a message if the file upload button is disabled */}
                      {isFileUploadDisabled && (
                        <div className="text-warning mt-2">
                          Please remove the existing file to upload a new one.
                        </div>
                      )}
                      {/* Only show the file name if it is a string (from the edit API) */}
                      {typeof validation.values.gbFile === "string" && (
                        <div className="mt-2 d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{ fontWeight: "bold", color: "green" }}
                          >
                            {validation.values.gbFile}
                          </span>
                          <Button
                            color="link"
                            className="text-primary"
                            onClick={() =>
                              handleDownloadFile(
                                typeof validation.values.gbFile === "string"
                                  ? validation.values.gbFile
                                  : ""
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
                        onClick={handleListACGBClick}
                      >
                        List
                      </button>
                    </div>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
        {/* Modal for Listing Ac & Gb Mom */}
        <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>List of Ac & Gb Mom</ModalHeader>
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
                    Date
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.date || ""}
                      onChange={(e) => handleFilterChange(e, "date")}
                    />
                  </th>
                  <th>
                    File
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.acFile || ""}
                      onChange={(e) => handleFilterChange(e, "acFile")}
                    />
                  </th>
                  <th>
                    GB File
                    <Input
                      type="text"
                      placeholder="Filter"
                      value={filters.gbFile || ""}
                      onChange={(e) => handleFilterChange(e, "gbFile")}
                    />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((acgb, index) => (
                    <tr key={acgb.acGbMomId}>
                      <td>{index + 1}</td>
                      <td>{acgb.academicYear}</td>
                      <td>{acgb.date}</td>
                      <td>
                        {acgb.documents?.AcademicCouncilMom ||
                          "No file uploaded"}
                      </td>
                      <td>
                        {acgb.documents?.GoverningBodyMom ? (
                          <span>{acgb.documents.GoverningBodyMom}</span>
                        ) : (
                          "No file uploaded"
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(acgb.acGbMomId)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(acgb.acGbMomId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No Ac & Gb Mom data available.
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

export default AC_GB_MoM;
