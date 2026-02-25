import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Table,
} from "reactstrap";
import { APIClient } from "../../helpers/api_helper";
import GetAllDepartmentDropdown from "Components/DropDowns/GetAllDepartmentDropdown";
import { toast, ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";

const api = new APIClient();

interface Notification {
  message: string;
}

const allowedRoleIds = [18, 26, 30, 38, 41, 146, 147, 148];

const Activity: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState({
    fromDate: "",
    fromTime: "",
    toDate: "",
    toTime: "",
    message: "",
    isForAllDepartments: "false",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const toggleModal = () => setModal(!modal);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userRoleIds = userInfo.roleId || [];
  const canEdit = userRoleIds.some((id: number) => allowedRoleIds.includes(id));
  const [getAllData, setGetAllData] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState(getAllData);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Calculate the paginated data
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const modalBodyRef = React.useRef<HTMLDivElement>(null);

  // Fetch Notification data from the backend
  const fetchGetAllData = async () => {
    try {
      const response = await api.get(
        "/notification/getAllActiveNotifications",
        ""
      );
      setGetAllData(response);
      setFilteredData(response);
    } catch (error) {
      console.error("Error fetching Notification data:", error);
    }
  };

  const handleListMCRClick = () => {
    toggleModal();
    fetchGetAllData();
  };
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get(
          "centralized/commonApi/employee/notification-info",
          ""
        );
        if (response && response.notifications) {
          setNotifications(response.notifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Poll every 1 minute (60000 ms)
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchGetAllDepartment = async () => {
      try {
        const response = await api.get("/getAllDepartmentEntry", "");

        console.log("Raw API Response:", response);

        const filteredDepartmentList = response.filter((department: any) => {
          return (
            String(department.isAcademic).toLowerCase() === "true" ||
            String(department.isAcademic) === "1"
          );
        });

        const departmentList = filteredDepartmentList.map(
          (department: any) => ({
            value: department.id,
            label: department.name,
          })
        );

        console.log("Mapped Department Options:", departmentList);

        setOptions(departmentList);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch all Department");
        setLoading(false);
      }
    };

    fetchGetAllDepartment();
  }, []);

  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await api.get(
        `/notification/getNotification?id=${id}`,
        ""
      );

      // Wait until department options are loaded before mapping
      const departmentIds = response.departmentId || [];

      const departmentValues = options.filter((option: any) =>
        departmentIds.includes(parseInt(option.value))
      );
      setFormData({
        ...formData,
        isForAllDepartments: response.isForAllDepartments ? "true" : "false",
      });

      validation.setValues({
        fromDate: response.fromDate || "",
        toDate: response.toDate || "",
        fromTime: response.fromTime?.slice(0, 5) || "",
        toTime: response.toTime?.slice(0, 5) || "",
        message: response.message || "",
        isForAllDepartments: response.isForAllDepartments ? "true" : "false",
        department: departmentValues,
      });

      setIsEditMode(true);
      setEditId(id);
      modalBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error fetching Notification data by ID:", error);
    }
  };

  // Handle delete action
  // Set the ID of the record to be deleted and open the confirmation modal
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion of the record
  // Call the delete API and refresh the Notification data
  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(
          `/notification/deleteNotification?notificationId=${id}`,
          ""
        );
        toast.success(response.message || "Notification removed successfully!");
        fetchGetAllData();
      } catch (error) {
        toast.error("Failed to remove Notification. Please try again.");
        console.error("Error deleting Notification:", error);
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  const validation = useFormik({
    initialValues: {
      fromDate: "",
      toDate: "",
      fromTime: "",
      toTime: "",
      message: "",
      department: [] as { value: string; label: string }[],
      isForAllDepartments: "false",
    },
    validationSchema: Yup.object({
      fromDate: Yup.string().required("From Date is required"),
      toDate: Yup.string().required("To Date is required"),
      fromTime: Yup.string().required("From Time is required"),
      toTime: Yup.string().required("To Time is required"),
      message: Yup.string().required("Message is required"),
      isForAllDepartments: Yup.string().required(),
      department: Yup.array()
        .of(Yup.object({ value: Yup.string(), label: Yup.string() }))
        .when("isForAllDepartments", {
          is: "false",
          then: (schema) =>
            schema.min(1, "At least one department must be selected"),
          otherwise: (schema) => schema,
        }),
    }),
    onSubmit: async (values, { resetForm }) => {
      const formatDateToDDMMYYYY = (date: string): string => {
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
      };

      try {
        const payload = {
          notificationId: isEditMode && editId ? editId : 0,
          fromDate: formatDateToDDMMYYYY(values.fromDate),
          toDate: formatDateToDDMMYYYY(values.toDate),
          fromTime: values.fromTime + ":00", // add seconds
          toTime: values.toTime + ":00", // add seconds
          message: values.message,
          isForAllDepartments: validation.values.isForAllDepartments === "true",
          departmentId: values.department.map((dept: any) =>
            parseInt(dept.value)
          ),
        };

        if (isEditMode && editId) {
          const response = await api.put(
            "/notification/updateNotification",
            payload
          );
          toast.success(
            response.message || "Notification updated successfully!"
          );
        } else {
          const response = await api.create(
            "/notification/postNotification",
            payload
          );
          toast.success(response.message || "Notification added successfully!");
        }

        resetForm();
        setFormData({
          fromDate: "",
          toDate: "",
          fromTime: "",
          toTime: "",
          message: "",
          isForAllDepartments: "false",
        });
        setIsEditMode(false);
        setEditId(null);
        handleListMCRClick();
        fetchGetAllData();
      } catch (error) {
        toast.error("Failed to save notification. Please try again.");
        console.error("Error:", error);
      }
    },
  });

  return (
    <React.Fragment>
      <Card style={{ height: "300px", overflow: "hidden" }}>
        <CardBody
          style={{ height: "100%", overflowY: "auto", padding: "10px" }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <CardTitle style={{ fontSize: "16px", marginBottom: 0 }}>
              Notification
            </CardTitle>
            {canEdit && (
              <Button size="sm" color="primary" onClick={handleListMCRClick}>
                Add Notification
              </Button>
            )}
          </div>
          <ul
            className="verti-timeline list-unstyled"
            style={{ margin: 0, padding: 0 }}
          >
            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <li
                  key={index}
                  className="event-list"
                  style={{ marginBottom: "10px" }}
                >
                  <div
                    className="event-timeline-dot"
                    style={{ marginRight: "10px" }}
                  >
                    <i className="bx bx-right-arrow-circle font-size-14" />
                  </div>
                  <div className="flex-grow-1" style={{ fontSize: "12px" }}>
                    {notif.message}
                  </div>
                </li>
              ))
            ) : (
              <li style={{ fontSize: "12px", color: "#777" }}>
                No notifications available.
              </li>
            )}
          </ul>
        </CardBody>
      </Card>

      {/* Modal for Edit */}
      <Modal
        isOpen={modal}
        toggle={toggleModal}
        size="lg"
        style={{ maxWidth: "100%", width: "auto" }}
        backdrop="static"
        keyboard={false}
      >
        <ModalHeader toggle={toggleModal}>Edit Notification</ModalHeader>
        <ModalBody innerRef={modalBodyRef}>
          <div
            ref={modalBodyRef}
            style={{ maxHeight: "80vh", overflowY: "auto" }}
          >
            <Form>
              <Row>
                {/* From Date & Time */}
                <Col lg="4">
                  <FormGroup>
                    <Label for="fromDate">From Date</Label>
                    <Input
                      type="date"
                      name="fromDate"
                      value={validation.values.fromDate}
                      onChange={(e) =>
                        validation.setFieldValue("fromDate", e.target.value)
                      }
                      className={
                        validation.touched.fromDate &&
                        validation.errors.fromDate
                          ? "is-invalid"
                          : ""
                      }
                    />
                    {validation.touched.fromDate &&
                      validation.errors.fromDate && (
                        <div className="text-danger">
                          {validation.errors.fromDate}
                        </div>
                      )}
                  </FormGroup>
                </Col>

                {/* To Date & Time */}
                <Col lg="4">
                  <FormGroup>
                    <Label for="toDate">To Date</Label>
                    <Input
                      type="date"
                      name="toDate"
                      value={validation.values.toDate}
                      onChange={(e) =>
                        validation.setFieldValue("toDate", e.target.value)
                      }
                      className={
                        validation.touched.toDate && validation.errors.toDate
                          ? "is-invalid"
                          : ""
                      }
                    />
                    {validation.touched.toDate && validation.errors.toDate && (
                      <div className="text-danger">
                        {validation.errors.toDate}
                      </div>
                    )}
                  </FormGroup>
                </Col>

                {/* Department Dropdown */}
                <Col lg="4">
                  <div className="mb-3">
                    <Label>Department</Label>
                    <Select
                      isMulti
                      styles={dropdownStyles}
                      options={options}
                      value={validation.values.department}
                      onChange={(selectedOptions) =>
                        validation.setFieldValue("department", selectedOptions)
                      }
                      className={
                        validation.touched.department &&
                        validation.errors.department
                          ? "select-error"
                          : ""
                      }
                    />
                    {validation.touched.department &&
                      validation.errors.department && (
                        <div className="text-danger">
                          {Array.isArray(validation.errors.department)
                            ? validation.errors.department.join(", ")
                            : validation.errors.department}
                        </div>
                      )}
                  </div>
                </Col>
              </Row>

              <Row>
                <Col lg="4">
                  <FormGroup>
                    <Label for="fromTime">From Time</Label>
                    <Input
                      type="time"
                      name="fromTime"
                      value={validation.values.fromTime}
                      onChange={(e) =>
                        validation.setFieldValue("fromTime", e.target.value)
                      }
                      className={
                        validation.touched.fromTime &&
                        validation.errors.fromTime
                          ? "is-invalid"
                          : ""
                      }
                    />
                    {validation.touched.fromTime &&
                      validation.errors.fromTime && (
                        <div className="text-danger">
                          {validation.errors.fromTime}
                        </div>
                      )}
                  </FormGroup>
                </Col>

                <Col lg="4">
                  <FormGroup>
                    <Label for="toTime">To Time</Label>
                    <Input
                      type="time"
                      name="toTime"
                      value={validation.values.toTime}
                      onChange={(e) =>
                        validation.setFieldValue("toTime", e.target.value)
                      }
                      className={
                        validation.touched.toTime && validation.errors.toTime
                          ? "is-invalid"
                          : ""
                      }
                    />
                    {validation.touched.toTime && validation.errors.toTime && (
                      <div className="text-danger">
                        {validation.errors.toTime}
                      </div>
                    )}
                  </FormGroup>
                </Col>

                <Col lg="4">
                  <FormGroup>
                    <Label for="isForAllDepartments">
                      Is For All Departments?
                    </Label>
                    <div>
                      <FormGroup check inline>
                        <Label check>
                          <Input
                            type="radio"
                            name="isForAllDepartments"
                            value="true"
                            checked={
                              validation.values.isForAllDepartments === "true"
                            }
                            onChange={() =>
                              validation.setFieldValue(
                                "isForAllDepartments",
                                "true"
                              )
                            }
                          />{" "}
                          Yes
                        </Label>
                      </FormGroup>
                      <FormGroup check inline>
                        <Label check>
                          <Input
                            type="radio"
                            name="isForAllDepartments"
                            value="false"
                            checked={
                              validation.values.isForAllDepartments === "false"
                            }
                            onChange={() =>
                              validation.setFieldValue(
                                "isForAllDepartments",
                                "false"
                              )
                            }
                          />{" "}
                          No
                        </Label>
                      </FormGroup>
                    </div>
                  </FormGroup>
                </Col>

                <Col lg="4">
                  <FormGroup>
                    <Label for="message">Message</Label>
                    <Input
                      type="textarea"
                      name="message"
                      value={validation.values.message}
                      onChange={(e) =>
                        validation.setFieldValue("message", e.target.value)
                      }
                      className={
                        validation.touched.message && validation.errors.message
                          ? "is-invalid"
                          : ""
                      }
                    />
                    {validation.touched.message &&
                      validation.errors.message && (
                        <div className="text-danger">
                          {validation.errors.message}
                        </div>
                      )}
                  </FormGroup>
                </Col>
              </Row>
            </Form>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <Button color="primary" onClick={() => validation.handleSubmit()}>
                {isEditMode ? "Update" : "Save"}
              </Button>
              <Button color="secondary" onClick={toggleModal}>
                Cancel
              </Button>
            </div>

            <br />
            <Table
              striped
              bordered
              hover
              responsive
              className="align-middle text-center"
            >
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>From Time</th>
                  <th>To Time</th>
                  <th>Message</th>
                  <th>Is For All Departments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((mcr, index) => (
                    <tr key={mcr.notificationId}>
                      <td>{indexOfFirstRow + index + 1}</td>
                      <td>{mcr.fromDate}</td>
                      <td>{mcr.toDate}</td>
                      <td>{mcr.fromTime}</td>
                      <td>{mcr.toTime}</td>
                      <td>{mcr.message}</td>
                      <td>{mcr.isForAllDepartments ? "Yes" : "No"}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(mcr.notificationId)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(mcr.notificationId)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center">
                      No Notification data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
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
          </div>
        </ModalBody>
      </Modal>
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
          <Button color="secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
      <ToastContainer />
    </React.Fragment>
  );
};

export default Activity;
