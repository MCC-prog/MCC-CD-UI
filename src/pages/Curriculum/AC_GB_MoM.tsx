import Breadcrumb from "Components/Common/Breadcrumb";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
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
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.js";
import "datatables.net-buttons/js/buttons.print.js";
import "jszip";
import "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
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
  const FileRef = useRef<HTMLInputElement | null>(null);
 // const gbFileRef = useRef<HTMLInputElement | null>(null);

  const tableRef = useRef<HTMLTableElement>(null);

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

  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
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


  const typeOption = [
    { value: "Academic Council", label: "Academic Council" },
    { value: "Governing Body", label: "Governing Body" },
  ];


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
        date: response.date
          ? moment(response.date, "YYYY-MM-DD").format("DD/MM/YYYY")
          : "",
           type: response.type
          ? {
              value: String(response.type),
              label: String(response.type),
            }
          : null,
        acGbFile: response.documents?.mom || null,
        // gbFile: response.documents?.GoverningBodyMom || null,
      };

      // Update Formik values
      validation.setValues({
        academicYear: mappedValues.academicYear
          ? {
              ...mappedValues.academicYear,
              value: String(mappedValues.academicYear.value),
            }
          : null,
        type: mappedValues.type
          ? {
              ...mappedValues.type,
            }
          : null,
        date: mappedValues.date || "",
        // dateOfGb: mappedValues.dateOfGb || "",
        acGbFile: mappedValues.acGbFile || null,
        // gbFile: mappedValues.gbFile || null,
      });
      setIsEditMode(true); // Set edit mode
      setEditId(id); // Store the ID of the record being edited
      // Disable the file upload button if a file exists
      setIsFileUploadDisabled(!!response.documents?.mom);
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
      validation.setFieldValue("acGbFile", null); // Clear the file from Formik state
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
      type: null as { value: string; label: string } | null,
      date: "",
      // dateOfGb: "",
      acGbFile: null,
      // gbFile: null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object()
        .nullable()
        .required("Please select academic year"),
      type: Yup.object()
        .nullable()
        .required("Please select type"),
      date: Yup.string().required("Please select Date"),
      // dateOfGb: Yup.string().required("Please select Date of GB"),
      acGbFile: Yup.mixed()
        .test("required", "Please upload a file", (value: any) => {
          return value !== null && value !== undefined;
        })
        .test("fileSize", "File size is too large", (value: any) => {
          if (typeof value === "string") return true; // Skip check for string (edit mode)
          if (!value) return true; // Let 'required' test handle null/undefined
          return value.size <= 10 * 1024 * 1024; // Max 2MB
        })
        .test("fileType", "Unsupported file format", (value: any) => {
          if (typeof value === "string") return true; // Allow URLs or previously uploaded files
          if (!value) return true; // Let 'required' test handle it
          return ["application/pdf", "image/jpeg", "image/png"].includes(
            value.type
          );
        }),

      // gbFile: Yup.mixed()
      //   .test("required", "Please upload a file", (value: any) => {
      //     return value !== null && value !== undefined;
      //   })
      //   .test("fileSize", "File size is too large", (value: any) => {
      //     if (typeof value === "string") return true; // allow previously uploaded URLs in edit mode
      //     if (!value) return true; // let required() handle null
      //     return value.size <= 2 * 1024 * 1024; // 2MB
      //   })
      //   .test("fileType", "Unsupported file format", (value: any) => {
      //     if (typeof value === "string") return true; // allow previously uploaded file references
      //     if (!value) return true; // let required() handle null
      //     return ["application/pdf", "image/jpeg", "image/png"].includes(
      //       value.type
      //     );
      //   }),
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
        moment(values.date, "DD/MM/YYYY").format("DD/MM/YYYY") // Convert to yyyy-mm-dd for the backend
      );
      formData.append("type", values.type ? values.type.value : "");
      // formData.append(
      //   "dateOfGb",
      //   moment(values.dateOfGb, "DD/MM/YYYY").format("DD/MM/YYYY") // Convert to yyyy-mm-dd for the backend
      // );
      // Handle the file conditionally
      if (isEditMode && typeof values.acGbFile === "string") {
        // Pass an empty Blob instead of null
        formData.append(
          "mom",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (isEditMode && values.acGbFile === null) {
        formData.append(
          "mom",
          new Blob([], { type: "application/pdf" }),
          "empty.pdf"
        );
      } else if (values.acGbFile) {
        formData.append("mom", values.acGbFile);
      }

      // if (isEditMode && typeof values.gbFile === "string") {
      //   // Pass an empty PDF instead of null
      //   formData.append(
      //     "governingBodyMom",
      //     new Blob([], { type: "application/pdf" }),
      //     "empty.pdf"
      //   );
      // } else if (isEditMode && values.gbFile === null) {
      //   formData.append(
      //     "governingBodyMom",
      //     new Blob([], { type: "application/pdf" }),
      //     "empty.pdf"
      //   );
      // } else if (values.gbFile) {
      //   formData.append("governingBodyMom", values.gbFile);
      // }

      if (isEditMode && editId) {
        // Update existing record
        api
          .put(`/acGbMom`, formData)
          .then((response) => {
            toast.success(
              response.message || "Ac & Gb Mom updated successfully!"
            );
            resetForm();
             if (FileRef.current) {
          FileRef.current.value = "";
        }

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
            if (FileRef.current) FileRef.current.value = "";
            // if (gbFileRef.current) gbFileRef.current.value = "";

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

  useEffect(() => {
    if (acGbMomData.length === 0) return;

    const initializeDataTable = () => {
     const table = $("#bosDataId").DataTable({
      destroy: true,
      dom: "Bfrtip",
        paging: true,
        pageLength: 10,
        info: true,
        searching: false,

      columnDefs: [
        {
          targets: [5], // Export-only column
          visible: false,
        },
        {
          targets: [6], // Actions column
          orderable: false,
          searchable: false,
        },
      ],

      buttons: [
        {
          extend: "copy",
          filename: "AC_GB_MoM_Data",
            title: " AC & GB MoM Data Export",
          exportOptions: {
            modifier: { page: "all" },
            columns: function (idx) {
              return idx !== 6; // exclude Actions
            },
          },
        },
        {
          extend: "csv",
          filename: "AC_GB_MoM_Data",
          title: " AC & GB MoM Data Export",
          exportOptions: {
            modifier: { page: "all" },
            columns: function (idx) {
              return idx !== 6; // exclude Actions
            },
          },
        },
      ],
    });

      $(".dt-buttons").addClass("mb-3 gap-2");
      $(".buttons-copy").addClass("btn btn-success");
      $(".buttons-csv").addClass("btn btn-info");

      // Prevent duplicate toast triggers
      $("#bosDataId")
        .off("buttons-action.dt")
        .on("buttons-action.dt", function (e, buttonApi) {
          if (buttonApi.text() === "Copy") {
            toast.success("Copied to clipboard!");
          }
        });

      return table;
    };

    // Delay DataTable init slightly to allow DOM updates
    const timeout = setTimeout(() => {
      const table = initializeDataTable();
    }, 0);

    return () => {
      clearTimeout(timeout);
      const existingTable = $.fn.DataTable.isDataTable("#bosDataId");
      if (existingTable) {
        $("#bosDataId").DataTable().destroy();
      }
      $("#bosDataId").off("buttons-action.dt");
    };
  }, [acGbMomData]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Curriculum" breadcrumbItem="Ac & GB MoM" />
          <Card style={{ height: "350px" }}>
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
                      <Label>Type</Label>
                      <Select
                        options={typeOption}
                        value={validation.values.type}
                        onChange={(selectedOption) =>
                          validation.setFieldValue("type", selectedOption)
                        }
                        placeholder="Select Type"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.type &&
                          validation.errors.type
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.type &&
                        validation.errors.type && (
                          <div className="text-danger">
                            {typeof validation.errors.type === "string"
                              ? validation.errors.type
                              : ""}
                          </div>
                        )}
                    </div>
                  </Col>

                {(validation.values.type?.value === "Academic Council" ||
                  validation.values.type?.value === "Governing Body") && (
                  <>
                    {validation.values.type?.value === "Academic Council" && (
                      <>
                        <Col lg={4}>
                          <div className="mb-3">
                            <Label>Date Of AC</Label>
                            <Input
                              type="date"
                              className={`form-control ${
                                validation.touched.date &&
                                validation.errors.date
                                  ? "is-invalid"
                                  : ""
                              }`}
                              value={
                                validation.values.date
                                  ? moment(
                                      validation.values.date,
                                      "DD/MM/YYYY"
                                    ).format("YYYY-MM-DD")
                                  : ""
                              }
                              onChange={(e) => {
                                const formattedDate = moment(
                                  e.target.value,
                                  "YYYY-MM-DD"
                                ).format("DD/MM/YYYY");
                                validation.setFieldValue("date", formattedDate);
                              }}
                              placeholder="dd/mm/yyyy"
                            />
                            {validation.touched.date && validation.errors.date && (
                              <div className="text-danger">
                                {validation.errors.date}
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
                                validation.touched.acGbFile && validation.errors.acGbFile
                                  ? "is-invalid"
                                  : ""
                              }`}
                              type="file"
                              innerRef={FileRef}
                              id="formFile"
                              onChange={(event) => {
                                validation.setFieldValue(
                                  "acGbFile",
                                  event.currentTarget.files
                                    ? event.currentTarget.files[0]
                                    : null
                                );
                              }}
                              disabled={isFileUploadDisabled}
                            />
                            {validation.touched.acGbFile &&
                              validation.errors.acGbFile && (
                                <div className="text-danger">
                                  {validation.errors.acGbFile}
                                </div>
                              )}
                            {isFileUploadDisabled && (
                              <div className="text-warning mt-2">
                                Please remove the existing file to upload a new one.
                              </div>
                            )}
                            {typeof validation.values.acGbFile === "string" && (
                              <div className="mt-2 d-flex align-items-center">
                                <span
                                  className="me-2"
                                  style={{ fontWeight: "bold", color: "green" }}
                                >
                                  {validation.values.acGbFile}
                                </span>
                                <Button
                                  color="link"
                                  className="text-primary"
                                  onClick={() =>
                                    handleDownloadFile(
                                      typeof validation.values.acGbFile === "string"
                                        ? validation.values.acGbFile
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
                      </>
                    )}
                    {validation.values.type?.value === "Governing Body" && (
                      <>
                        <Col lg={4}>
                          <div className="mb-3">
                            <Label>Date Of GB</Label>
                            <Input
                              type="date"
                              className={`form-control ${
                                validation.touched.date && validation.errors.date
                                  ? "is-invalid"
                                  : ""
                              }`}
                              value={
                                validation.values.date
                                  ? moment(
                                      validation.values.date,
                                      "DD/MM/YYYY"
                                    ).format("YYYY-MM-DD")
                                  : ""
                              }
                              onChange={(e) => {
                                const formattedDate = moment(
                                  e.target.value,
                                  "YYYY-MM-DD"
                                ).format("DD/MM/YYYY");
                                validation.setFieldValue("date", formattedDate);
                              }}
                              placeholder="dd/mm/yyyy"
                            />
                            {validation.touched.date && validation.errors.date && (
                              <div className="text-danger">
                                {validation.errors.date}
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
                                validation.touched.acGbFile && validation.errors.acGbFile
                                  ? "is-invalid"
                                  : ""
                              }`}
                              type="file"
                              innerRef={FileRef}
                              onChange={(event) => {
                                validation.setFieldValue(
                                  "acGbFile",
                                  event.currentTarget.files
                                    ? event.currentTarget.files[0]
                                    : null
                                );
                              }}
                              disabled={isFileUploadDisabled}
                            />
                            {validation.touched.acGbFile &&
                              validation.errors.acGbFile && (
                                <div className="text-danger">
                                  {validation.errors.acGbFile}
                                </div>
                              )}
                            {isFileUploadDisabled && (
                              <div className="text-warning mt-2">
                                Please remove the existing file to upload a new one.
                              </div>
                            )}
                            {typeof validation.values.acGbFile === "string" && (
                              <div className="mt-2 d-flex align-items-center">
                                <span
                                  className="me-2"
                                  style={{ fontWeight: "bold", color: "green" }}
                                >
                                  {validation.values.acGbFile}
                                </span>
                                <Button
                                  color="link"
                                  className="text-primary"
                                  onClick={() =>
                                    handleDownloadFile(
                                      typeof validation.values.acGbFile === "string"
                                        ? validation.values.acGbFile
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
                      </>
                    )}
                  </>
                )}
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
       <Table
  striped
  bordered
  hover
  responsive
  className="align-middle text-center"
  id="bosDataId"
>
  <thead className="table-dark">
    <tr>
      <th>#</th>
      <th>Academic Year</th>
      <th>Type</th>
      <th>Date</th>
      <th>File</th>
      <th className="export-hidden">File Path (Export)</th>
      <th>Actions</th>
    </tr>
  </thead>

  <tbody>
       {acGbMomData.length > 0 ? (
      acGbMomData.map((row, index) => (
        <tr key={row.acGbMomId}>
          <td>{index + 1}</td>
          <td>{row.academicYear}</td>
          <td>{row.type}</td>
          <td>{row.date}</td>
          <td>
            {row.documents?.mom ? (
              <span>{row.documents.mom}</span>
            ) : (
              "No file uploaded"
            )}
          </td>
           <td className="export-hidden">{row.filePath?.mom || "N/A"}</td>
          <td>
             <div className="d-flex justify-content-center gap-3">
            <button
              className="btn btn-sm btn-warning me-2"
              onClick={() => handleEdit(row.acGbMomId)}
            >
              Edit
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDelete(row.acGbMomId)}
            >
              Delete
            </button>
          </div>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={7} className="text-center">
          No Ac & Gb Mom data available.
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

export default AC_GB_MoM;
