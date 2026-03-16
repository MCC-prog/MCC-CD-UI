import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import type { DateSelectArg } from "@fullcalendar/core";
import type { EventApi } from "@fullcalendar/react";
import type { EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  ModalFooter,
} from "reactstrap";
import { EventInput } from "@fullcalendar/core";
import { APIClient } from "../../helpers/api_helper";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
<<<<<<< HEAD
=======
import { Alert, Snackbar } from "@mui/material";
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181

const api = new APIClient();

interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date | string;
  endDate: Date | string;
  color: string;
}

const CalendarComponent: React.FC = () => {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<DateSelectArg | null>(
    null
  );
  const [formData, setFormData] = useState<{
    id: string;
    title: string;
    color: string;
    startDate?: Date;
    endDate?: Date;
  }>({
    id: "",
    title: "",
    color: "",
    startDate: new Date(),
    endDate: new Date(),
  });
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
<<<<<<< HEAD
=======
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("success");

  const showSnackbar = (
    msg: string,
    severity: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setSnackbarMsg(msg);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181

  const fetchEvents = async () => {
    try {
      const response = await api.getApi("/calendarEvent/getAllList");

      console.log("🧪 API raw response:", response);

      const eventData = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : response?.data?.data;

      if (!Array.isArray(eventData)) {
        console.error("Event data is not an array:", eventData);
        return;
      }

      const mappedEvents = eventData.map((event: any) => ({
        id: event.id,
        title: event.title,
        start: event.startDate, // FullCalendar accepts ISO string
        end: event.endDate,
        backgroundColor: event.color,
        allDay: true,
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedDates(null); // ✅ Clear old selection
    setSelectedEvent({
      id: event.id,
      title: event.title,
      startDate: event.startStr,
      endDate: event.endStr,
      color: event.backgroundColor,
    });
    setFormData({
      id: event.id,
      title: event.title,
      color: event.backgroundColor,
    });
    setIsEditMode(true);
    setEditId(event.id);
    setModalOpen(true);
  };

  const handleSelect = (selectInfo: DateSelectArg) => {
    setSelectedEvent(null); // ✅ Clear old event
    setSelectedDates(selectInfo);
    setFormData({
      id: "",
      title: "",
      color: "", // default color
    });
    setIsEditMode(false);
    setEditId(null);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (id: string) => {
    if (deleteId) {
      try {
        const response = await api.delete(`/calendarEvent/delete?id=${id}`, "");
<<<<<<< HEAD
        toast.success(response.message || "Event removed successfully!");
=======
        showSnackbar(response.message || "Event removed successfully!", "success");
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
        fetchEvents();
        setModalOpen(false);
      } catch (error: any) {
        console.error("Full error (delete):", error);

        // Your interceptor returns just a string, so handle accordingly:
        const errMsg =
          typeof error === "string" ? error : "Something went wrong";

        if (errMsg.includes("403")) {
<<<<<<< HEAD
          toast.error("You are not authorized to delete this event.");
        } else if (errMsg.includes("500")) {
          toast.error("Internal Server Error while deleting.");
        } else if (errMsg.includes("404")) {
          toast.error("Event not found or already deleted.");
        } else {
          toast.error(`${errMsg}`);
=======
          showSnackbar("You are not authorized to delete this event.", "error");
        } else if (errMsg.includes("500")) {
          showSnackbar("Internal Server Error while deleting.", "error");
        } else if (errMsg.includes("404")) {
          showSnackbar("Event not found or already deleted.", "error");
        } else {
          showSnackbar(`${errMsg}`, "error");
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
        }
      } finally {
        setIsDeleteModalOpen(false);
        setModalOpen(false);
        setDeleteId(null);
      }
    }
  };

  const handleEventDrop = async (info: any) => {
    const updatedEvent: CalendarEvent = {
      id: info.event.id,
      title: info.event.title,
      color: info.event.backgroundColor,
      startDate: info.event.start?.toISOString() || "",
      endDate:
        info.event.end?.toISOString() || info.event.start?.toISOString() || "",
    };

    try {
      const response = await api.put(`/calendarEvent/update`, updatedEvent);
<<<<<<< HEAD
      toast.success(response.message || "Event updated after drag!");
=======
      showSnackbar(response.message || "Event updated after drag!", "success");
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
    } catch (error: any) {
      console.error("Full error:", error);

      const errMsg = typeof error === "string" ? error : "Something went wrong";

      // Show appropriate error toast
      if (errMsg.includes("403")) {
<<<<<<< HEAD
        toast.error("You are not authorized to perform this action.");
      } else if (errMsg.includes("500")) {
        toast.error("Internal Server Error. Please try again.");
      } else if (errMsg.includes("404")) {
        toast.error("Resource not found.");
      } else {
        toast.error(`${errMsg}`);
=======
        showSnackbar("You are not authorized to perform this action.", "error");
      } else if (errMsg.includes("500")) {
        showSnackbar("Internal Server Error. Please try again.", "error");
      } else if (errMsg.includes("404")) {
        showSnackbar("Resource not found.", "error");
      } else {
        showSnackbar(`${errMsg}`, "error");
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
      }

      // Revert the event back to original position
      info.revert();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let start: Date = new Date();
      let end: Date = new Date();

      if (isEditMode && selectedEvent) {
        start = new Date(selectedEvent.startDate);
        end = new Date(selectedEvent.endDate);
      } else if (selectedDates) {
        start = new Date(selectedDates.start);
        end = selectedDates.end
          ? new Date(selectedDates.end)
          : new Date(selectedDates.start);
      }

      if (
        !isEditMode &&
        (!selectedDates?.end ||
          selectedDates.start.toDateString() ===
            selectedDates.end.toDateString())
      ) {
        end = new Date(start);
        end.setDate(end.getDate() + 1);
      }

      const payload: CalendarEvent = {
        id: formData.id || "",
        title: formData.title,
        color: formData.color,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };

      if (isEditMode && selectedEvent?.id) {
        const response = await api.put(`/calendarEvent/update`, payload);
<<<<<<< HEAD
        toast.success(response.message || "Event updated!", {
          autoClose: 2000,
        });
      } else {
        const response = await api.create("/calendarEvent/save", payload);
        toast.success(response.message || "Event created!", {
          autoClose: 2000,
        });
=======
        showSnackbar(response.message || "Event updated!", "success");
      } else {
        const response = await api.create("/calendarEvent/save", payload);
        showSnackbar(response.message || "Event created!","success");
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
      }
    } catch (error: any) {
      const errMsg = typeof error === "string" ? error : "Something went wrong";

      if (errMsg.includes("403")) {
<<<<<<< HEAD
        toast.error("You are not authorized.");
      } else if (errMsg.includes("500")) {
        toast.error("Internal Server Error.");
      } else if (errMsg.includes("404")) {
        toast.error("Resource not found.");
      } else {
        toast.error(`${errMsg}`);
=======
        showSnackbar("You are not authorized.", "error");
      } else if (errMsg.includes("500")) {
        showSnackbar("Internal Server Error.", "error");
      } else if (errMsg.includes("404")) {
        showSnackbar("Resource not found.", "error");
      } else {
        showSnackbar(`${errMsg}`, "error");
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
      }
    } finally {
      setModalOpen(false);
      setSelectedDates(null);
      setSelectedEvent(null);
      setFormData({
        id: "",
        title: "",
        color: "",
        startDate: new Date(),
        endDate: new Date(),
      });
      fetchEvents();
    }
  };

  return (
    <React.Fragment>
<<<<<<< HEAD
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, bootstrapPlugin]}
          initialView="dayGridMonth"
          themeSystem="bootstrap"
          selectable={true}
          editable={true}
          events={events}
          select={handleSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          height="auto"
          eventContent={(arg) => {
            return {
              html: `<div class="fc-event-title">${arg.event.title}</div>`, // only show title
            };
          }}
        />

        <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
          <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
            {selectedEvent ? "Edit Event" : "Add Event"}
          </ModalHeader>
          <ModalBody>
            <Form onSubmit={handleFormSubmit}>
              <FormGroup>
                <Label for="eventTitle">Title</Label>
                <Input
                  type="text"
                  id="eventTitle"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label for="eventColor">Color</Label>
                <Input
                  type="color"
                  id="eventColor"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                />
              </FormGroup>

              <div className="d-flex justify-content-between">
                {selectedEvent && (
                  <Button
                    color="danger"
                    onClick={() => handleDelete(selectedEvent.id)}
                  >
                    Delete
                  </Button>
                )}
                <div className="ms-auto">
                  <Button
                    type="button"
                    color="secondary"
                    onClick={() => setModalOpen(false)}
                    className="me-2"
                  >
                    Cancel
                  </Button>
                  <button className="btn btn-primary" type="submit">
                    {isEditMode ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </Form>
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
            <Button
              color="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>  
       <ToastContainer />
=======
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          elevation={6}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, bootstrapPlugin]}
        initialView="dayGridMonth"
        themeSystem="bootstrap"
        selectable={true}
        editable={true}
        events={events}
        select={handleSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        height="auto"
        eventContent={(arg) => {
          return {
            html: `<div class="fc-event-title">${arg.event.title}</div>`, // only show title
          };
        }}
      />

      <Modal className="popup" isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
          {selectedEvent ? "Edit Event" : "Add Event"}
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={handleFormSubmit}>
            <FormGroup>
              <Label for="eventTitle">Title</Label>
              <Input
                type="text"
                id="eventTitle"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </FormGroup>

            <FormGroup>
              <Label for="eventColor">Color</Label>
              <Input
                type="color"
                id="eventColor"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
              />
            </FormGroup>

            <div className="d-flex justify-content-between">
              {selectedEvent && (
                <Button
                  color="danger"
                  onClick={() => handleDelete(selectedEvent.id)}
                >
                  Delete
                </Button>
              )}
              <div className="ms-auto">
                <Button
                  type="button"
                  color="secondary"
                  onClick={() => setModalOpen(false)}
                  className="me-2"
                >
                  Cancel
                </Button>
                <button className="btn btn-primary" type="submit">
                  {isEditMode ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </Form>
        </ModalBody>
      </Modal>
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
          <Button color="secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
      <ToastContainer />
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
    </React.Fragment>
  );
};

<<<<<<< HEAD
export default CalendarComponent;
=======
export default CalendarComponent;
>>>>>>> 784635961ca4a9f5a0cb85a286fe0f6eec62a181
