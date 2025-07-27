<<<<<<< Updated upstream
import BootstrapTheme from "@fullcalendar/bootstrap";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import { isEmpty } from "lodash";
import React, { useEffect, useState } from "react";

import { useFormik } from "formik";
import {
  Card,
  CardBody,
  Col,
  Container,
  Form,
  FormFeedback,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import * as Yup from "yup";

//import
import {
  addNewEvent as onAddNewEvent,
  deleteEvent as onDeleteEvent,
  getCategories as onGetCategories,
  getEvents as onGetEvents,
  updateEvent as onUpdateEvent,
} from "../../slices/calendar/thunk";
=======
// import BootstrapTheme from "@fullcalendar/bootstrap";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
// import listPlugin from '@fullcalendar/list';
// import FullCalendar from "@fullcalendar/react";
// import { isEmpty } from "lodash";
// import React, { useEffect, useState } from "react";

// import { useFormik } from "formik";
// import { Card, CardBody, Col, Container, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
// import * as Yup from "yup";

// //import
// import {
//   addNewEvent as onAddNewEvent,
//   deleteEvent as onDeleteEvent,
//   getCategories as onGetCategories,
//   getEvents as onGetEvents,
//   updateEvent as onUpdateEvent
// } from "../../slices/calendar/thunk";

// import DeleteModal from "./DeleteModal";

// //redux
// import { useDispatch, useSelector } from "react-redux";
// import { createSelector } from 'reselect';

// const Calender = (props: any) => {

//   const dispatch = useDispatch<any>();

//   const selectProperties = createSelector(
//     (state: any) => state.calendar,
//     (calendar) => ({
//       events: calendar.events,
//       categories: calendar.categories,
//     })
//   );

//   const { events, categories }: any = useSelector(selectProperties);

//   const [deleteModal, setDeleteModal] = useState<boolean>(false);
//   const [modalCategory, setModalCategory] = useState<boolean>(false);
//   const [deleteId, setDeleteId] = useState();
//   const [selectedDay, setSelectedDay] = useState<any>(0);
//   const [isEdit, setIsEdit] = useState<boolean>(false);

//   useEffect(() => {
//     dispatch(onGetCategories());
//     dispatch(onGetEvents());
//   }, [dispatch]);

//   const [event, setEvent] = useState<any>({});

//   // category validation
//   const categoryValidation: any = useFormik({
//     // enableReinitialize : use this flag when initial values needs to be changed
//     enableReinitialize: true,

//     initialValues: {
//       title: (event && event.title) || '',
//       category: (event && event.category) || '',
//     },
//     validationSchema: Yup.object({
//       title: Yup.string().required("Please Enter Your Event Name"),
//       category: Yup.string().required("Please Enter Your Billing Name"),
//     }),
//     onSubmit: (values) => {
//       if (isEdit) {
//         const updateEvent = {
//           id: event.id,
//           title: values.title,
//           classNames: values.category + " text-white",
//           start: event.start,
//         };
//         // update event
//         dispatch(onUpdateEvent(updateEvent));
//         categoryValidation.resetForm();
//       } else {
//         const newEvent = {
//           id: Math.floor(Math.random() * 100),
//           title: values["title"],
//           start: selectedDay ? selectedDay.date : new Date(),
//           className: values['category']
//             ? values['category'] + " text-white"
//             : "bg-primary text-white"
//           ,
//         };
//         // save new event
//         dispatch(onAddNewEvent(newEvent));
//         categoryValidation.resetForm()
//       }
//       toggle();
//     },
//   });

//   useEffect(() => {
//     if (!modalCategory && !isEmpty(event) && !!isEdit) {
//       setTimeout(() => {
//         setEvent({});
//         setIsEdit(false);
//       }, 500);
//     }
//   }, [modalCategory, event, isEdit]);

//   /**
//    * Handling the modal state
//    */
//   const toggle = () => {
//     if (modalCategory) {
//       setModalCategory(false);
//       setEvent(null);
//       setIsEdit(false);
//     } else {
//       setModalCategory(true);
//     }
//   };

//   /**
//    * Handling date click on calendar
//    */
//   const handleDateClick = (arg: any) => {
//     const date = arg["date"];
//     const day = date.getDate();
//     const month = date.getMonth();
//     const year = date.getFullYear();

//     const currectDate = new Date();
//     const currentHour = currectDate.getHours();
//     const currentMin = currectDate.getMinutes();
//     const currentSec = currectDate.getSeconds();
//     const modifiedDate = new Date(
//       year,
//       month,
//       day,
//       currentHour,
//       currentMin,
//       currentSec
//     );
//     const modifiedData = { ...arg, date: modifiedDate };

//     setSelectedDay(modifiedData);
//     toggle();
//   };

//   /**
//    * Handling click on event on calendar
//    */
//   const handleEventClick = (arg: any) => {
//     const event = arg.event;
//     setEvent({
//       id: event.id,
//       title: event.title,
//       // title_category: event.title_category,
//       start: event.start,
//       className: event.classNames,
//       category: event.classNames[0],
//       event_category: event.classNames[0],
//     });
//     setDeleteId(event.id)
//     setIsEdit(true);
//     setModalCategory(true)
//     toggle();
//   };

//   /**
//    * On delete event
//    */
//   const handleDeleteEvent = () => {
//     if (deleteId) {
//       dispatch(onDeleteEvent(deleteId));
//     }
//     setDeleteModal(false);
//   };

//   /**
//    * On category darg event
//    */
//   const onDrag = (event: any, category: any) => {
//     event.preventDefault();
//   };

//   /**
//    * On calendar drop event
//    */
//   const onDrop = (event: any) => {
//     const date = event['date'];
//     const day = date.getDate();
//     const month = date.getMonth();
//     const year = date.getFullYear();

//     const currectDate = new Date();
//     const currentHour = currectDate.getHours();
//     const currentMin = currectDate.getMinutes();
//     const currentSec = currectDate.getSeconds();
//     const modifiedDate = new Date(year, month, day, currentHour, currentMin, currentSec);

//     const draggedEl = event.draggedEl;
//     const draggedElclass = draggedEl.className;
//     if (draggedEl.classList.contains('external-event') && draggedElclass.indexOf("fc-event-draggable") === -1) {
//       const modifiedData: any = {
//         id: Math.floor(Math.random() * 100),
//         title: draggedEl.innerText,
//         start: modifiedDate,
//         className: draggedEl.className,
//       };
//       dispatch(onAddNewEvent(modifiedData));
//     }
//   };

//   //set the local language
//   const enLocal: object = {
//     "code": "en-nz",
//     "week": {
//       "dow": 1,
//       "doy": 4
//     },
//     "buttonHints": {
//       "prev": "Previous $0",
//       "next": "Next $0",
//       "today": "This $0"
//     },
//     "viewHint": "$0 view",
//     "navLinkHint": "Go to $0"
//   };
//   const [isLocal, setIsLocal] = useState<any>(enLocal);
//   const handleChangeLocals = (value: any) => {
//     setIsLocal(value);
//   };

//   return (
//     <React.Fragment>
//       <DeleteModal
//         show={deleteModal}
//         onDeleteClick={handleDeleteEvent}
//         onCloseClick={() => setDeleteModal(false)}
//       />
//       <Container fluid={true}>
//         <Row>
//           <Col className="col-12">
//             {/* fullcalendar control */}
//             <Card style={{ height: "522px", overflow: "hidden" }}>
//               <CardBody style={{ height: "100%", padding: "10px" }}>
//                 <FullCalendar
//                   plugins={[
//                     BootstrapTheme,
//                     dayGridPlugin,
//                     listPlugin,
//                     interactionPlugin,
//                   ]}
//                   initialView="dayGridMonth"
//                   slotDuration={"00:15:00"}
//                   handleWindowResize={true}
//                   themeSystem="bootstrap"
//                   locale={isLocal}
//                   headerToolbar={{
//                     left: "prev,next today",
//                     center: "title",
//                     right: "dayGridMonth,dayGridWeek,dayGridDay,listWeek",
//                   }}
//                   events={events}
//                   editable={true}
//                   droppable={true}
//                   selectable={true}
//                   dateClick={handleDateClick}
//                   eventClick={handleEventClick}
//                   drop={onDrop}
//                   contentHeight="100%" // Ensures the calendar fits within the CardBody
//                   height="100%" // Ensures the calendar adjusts to the card height
//                 />
//               </CardBody>
//             </Card>

//             {/* New/Edit event modal */}
//             <Modal
//               isOpen={modalCategory}
//               className={props.className}
//               centered
//             >
//               <ModalHeader toggle={toggle}>
//                 <h5 className="modal-title" id="modal-title">
//                   {!!isEdit ? "Edit Event" : "Add Event"}
//                 </h5>
//               </ModalHeader>
//               <ModalBody className="p-4">
//                 <Form
//                   onSubmit={(e) => {
//                     e.preventDefault();
//                     categoryValidation.handleSubmit();
//                     return false;
//                   }}
//                 >
//                   <Row>
//                     <Col className="col-12">
//                       <div className="mb-3">
//                         <Label>Event Name</Label>
//                         <Input
//                           name="title"
//                           type="text"
//                           placeholder="Insert Event Name"
//                           onChange={categoryValidation.handleChange}
//                           onBlur={categoryValidation.handleBlur}
//                           value={categoryValidation.values.title || ""}
//                           invalid={
//                             categoryValidation.touched.title && categoryValidation.errors.title ? true : false
//                           }
//                         />
//                         {categoryValidation.touched.title && categoryValidation.errors.title ? (
//                           <FormFeedback type="invalid">{categoryValidation.errors.title}</FormFeedback>
//                         ) : null}
//                       </div>
//                     </Col>
//                     <Col className="col-12">
//                       <div className="mb-3">
//                         <Label>Category</Label>
//                         <Input
//                           type="select"
//                           name="category"
//                           placeholder="All Day Event"
//                           onChange={categoryValidation.handleChange}
//                           onBlur={categoryValidation.handleBlur}
//                           value={categoryValidation.values.category || ""}
//                           invalid={
//                             categoryValidation.touched.category && categoryValidation.errors.category ? true : false
//                           }
//                         >
//                           <option value="bg-danger">Danger</option>
//                           <option value="bg-success">Success</option>
//                           <option value="bg-primary">Primary</option>
//                           <option value="bg-info">Info</option>
//                           <option value="bg-dark">Dark</option>
//                           <option value="bg-warning">Warning</option>
//                         </Input>
//                         {categoryValidation.touched.category && categoryValidation.errors.category ? (
//                           <FormFeedback type="invalid">{categoryValidation.errors.category}</FormFeedback>
//                         ) : null}
//                       </div>
//                     </Col>
//                   </Row>

//                   <Row className="mt-2">
//                     <Col className="col-6">
//                       {isEdit &&
//                         <button type="button" className="btn btn-danger" id="btn-delete-event" onClick={() => { toggle(); setDeleteModal(true) }}>Delete</button>
//                       }
//                     </Col>

//                     <Col className="col-6 text-end">
//                       <button
//                         type="button"
//                         className="btn btn-light me-1"
//                         onClick={toggle}
//                       >
//                         Close
//                       </button>
//                       <button
//                         type="submit"
//                         className="btn btn-success"
//                         id="btn-save-event"
//                       >
//                         Save
//                       </button>
//                     </Col>
//                   </Row>
//                 </Form>
//               </ModalBody>
//             </Modal>
//           </Col>
//         </Row>
//       </Container>
//     </React.Fragment>
//   );
// };

// export default Calender;

// Calendar.tsx
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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
>>>>>>> Stashed changes

const api = new APIClient();

<<<<<<< Updated upstream
//redux
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";

const Calender = (props: any) => {
  const dispatch = useDispatch<any>();

  const selectProperties = createSelector(
    (state: any) => state.calendar,
    (calendar) => ({
      events: calendar.events,
      categories: calendar.categories,
    })
=======
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
>>>>>>> Stashed changes
  );

  const fetchEvents = async () => {
    try {
      const response = await api.getApi("/calendarEvent/getAllList");

      console.log("🧪 API raw response:", response);

      const eventData = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : response?.data?.data;

<<<<<<< Updated upstream
  const [event, setEvent] = useState<any>({});

  // category validation
  const categoryValidation: any = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      title: (event && event.title) || "",
      category: (event && event.category) || "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Please Enter Your Event Name"),
      category: Yup.string().required("Please Enter Your Billing Name"),
    }),
    onSubmit: (values) => {
      if (isEdit) {
        const updateEvent = {
          id: event.id,
          title: values.title,
          classNames: values.category + " text-white",
          start: event.start,
        };
        // update event
        dispatch(onUpdateEvent(updateEvent));
        categoryValidation.resetForm();
      } else {
        const newEvent = {
          id: Math.floor(Math.random() * 100),
          title: values["title"],
          start: selectedDay ? selectedDay.date : new Date(),
          className: values["category"]
            ? values["category"] + " text-white"
            : "bg-primary text-white",
        };
        // save new event
        dispatch(onAddNewEvent(newEvent));
        categoryValidation.resetForm();
=======
      if (!Array.isArray(eventData)) {
        console.error("❌ Event data is not an array:", eventData);
        return;
>>>>>>> Stashed changes
      }

<<<<<<< Updated upstream
=======
      const mappedEvents = eventData.map((event: any) => ({
        id: event.id,
        title: event.title,
        start: event.startDate, // FullCalendar accepts ISO string
        end: event.endDate,
        backgroundColor: event.color,
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error("🔥 Error fetching events:", error);
    }
  };

>>>>>>> Stashed changes
  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSelect = (selectInfo: DateSelectArg) => {
    setSelectedEvent(null);
    setSelectedDates(selectInfo);
    setFormData({ id: "", title: "", color: " " });
    setModalOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      startDate: event.startStr,
      endDate: event.endStr,
      color: event.backgroundColor,
    });
<<<<<<< Updated upstream
    setDeleteId(event.id);
    setIsEdit(true);
    setModalCategory(true);
    toggle();
=======
    setFormData({
      id: event.id,
      title: event.title,
      color: event.backgroundColor,
    });
    setIsEditMode(true);
    setEditId(event.id);
    setModalOpen(true);
>>>>>>> Stashed changes
  };

const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const payload: CalendarEvent = {
    ...formData,
    startDate: selectedDates?.startStr || selectedEvent?.startDate || "",
    endDate: selectedDates?.endStr || selectedEvent?.endDate || "",
  };

  try {
    if (isEditMode && editId) {
      const response = await api.put(`/calendarEvent/update`, payload);
      toast.success(response?.message || "✅ Event updated successfully!");
    } else {
      const response = await api.create("/calendarEvent/save", payload);
      toast.success(response?.message || "✅ Event created successfully!");
    }

    // success handling
    setEditId(null);
    setModalOpen(false);
    fetchEvents();
    window.location.reload();
  } catch (error: any) {
    console.error("🔥 Full error:", error);

<<<<<<< Updated upstream
  /**
   * On calendar drop event
   */
  const onDrop = (event: any) => {
    const date = event["date"];
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const currectDate = new Date();
    const currentHour = currectDate.getHours();
    const currentMin = currectDate.getMinutes();
    const currentSec = currectDate.getSeconds();
    const modifiedDate = new Date(
      year,
      month,
      day,
      currentHour,
      currentMin,
      currentSec
    );

    const draggedEl = event.draggedEl;
    const draggedElclass = draggedEl.className;
    if (
      draggedEl.classList.contains("external-event") &&
      draggedElclass.indexOf("fc-event-draggable") === -1
    ) {
      const modifiedData: any = {
        id: Math.floor(Math.random() * 100),
        title: draggedEl.innerText,
        start: modifiedDate,
        className: draggedEl.className,
      };
      dispatch(onAddNewEvent(modifiedData));
=======
    // Since interceptor returns just a string, handle it like this:
    const errMsg = typeof error === "string" ? error : "Something went wrong";

    // Custom messages based on text content
    if (errMsg.includes("403")) {
      toast.error("🚫 You are not authorized to perform this action.");
    } else if (errMsg.includes("500")) {
      toast.error("💥 Internal Server Error. Please try again.");
    } else if (errMsg.includes("404")) {
      toast.error("🔍 Resource not found.");
    } else {
      toast.error(`❌ ${errMsg}`);
>>>>>>> Stashed changes
    }

    // Close modal even on failure
    setModalOpen(false);
  }
};

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

<<<<<<< Updated upstream
  //set the local language
  const enLocal: object = {
    code: "en-nz",
    week: {
      dow: 1,
      doy: 4,
    },
    buttonHints: {
      prev: "Previous $0",
      next: "Next $0",
      today: "This $0",
    },
    viewHint: "$0 view",
    navLinkHint: "Go to $0",
  };
  const [isLocal, setIsLocal] = useState<any>(enLocal);
  const handleChangeLocals = (value: any) => {
    setIsLocal(value);
=======
  const confirmDelete = async (id: string) => {
  if (deleteId) {
    try {
      const response = await api.delete(`/calendarEvent/delete?id=${id}`, "");
      toast.success(response?.message || "✅ Event removed successfully!");
      fetchEvents();
      setModalOpen(false);
    } catch (error: any) {
      console.error("🔥 Full error (delete):", error);

      // Your interceptor returns just a string, so handle accordingly:
      const errMsg = typeof error === "string" ? error : "Something went wrong";

      if (errMsg.includes("403")) {
        toast.error("🚫 You are not authorized to delete this event.");
      } else if (errMsg.includes("500")) {
        toast.error("💥 Internal Server Error while deleting.");
      } else if (errMsg.includes("404")) {
        toast.error("🔍 Event not found or already deleted.");
      } else {
        toast.error(`❌ ${errMsg}`);
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
    startDate: info.event.start?.toISOString() || '',
    endDate: info.event.end?.toISOString() || info.event.start?.toISOString() || '',
>>>>>>> Stashed changes
  };

  try {
    const response = await api.put(`/calendarEvent/update`, updatedEvent);
    toast.success(response?.message || "✅ Event updated after drag!");
  } catch (error: any) {
    console.error("🔥 Full error:", error);

    const errMsg = typeof error === "string" ? error : "Something went wrong";

    // Show appropriate error toast
    if (errMsg.includes("403")) {
      toast.error("🚫 You are not authorized to perform this action.");
    } else if (errMsg.includes("500")) {
      toast.error("💥 Internal Server Error. Please try again.");
    } else if (errMsg.includes("404")) {
      toast.error("🔍 Resource not found.");
    } else {
      toast.error(`❌ ${errMsg}`);
    }

    // Revert the event back to original position
    info.revert();
  }
};

  return (
    <>
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
      html: `<div class="fc-event-title">${arg.event.title}</div>` // only show title
    };
  }}
/>

<<<<<<< Updated upstream
            {/* New/Edit event modal */}
            <Modal isOpen={modalCategory} className={props.className} centered>
              <ModalHeader toggle={toggle}>
                <h5 className="modal-title" id="modal-title">
                  {!!isEdit ? "Edit Event" : "Add Event"}
                </h5>
              </ModalHeader>
              <ModalBody className="p-4">
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    categoryValidation.handleSubmit();
                    return false;
                  }}
                >
                  <Row>
                    <Col className="col-12">
                      <div className="mb-3">
                        <Label>Title</Label>
                        <Input
                          name="title"
                          type="text"
                          placeholder="Enter Title"
                          onChange={categoryValidation.handleChange}
                          onBlur={categoryValidation.handleBlur}
                          value={categoryValidation.values.title || ""}
                          invalid={
                            categoryValidation.touched.title &&
                            categoryValidation.errors.title
                              ? true
                              : false
                          }
                        />
                        {categoryValidation.touched.title &&
                        categoryValidation.errors.title ? (
                          <FormFeedback type="invalid">
                            {categoryValidation.errors.title}
                          </FormFeedback>
                        ) : null}
                      </div>
                    </Col>

                    <Col className="col-12">
                      <div className="mb-3">
                        <Label>Color</Label>
                        <div className="d-flex gap-2 flex-wrap">
                          {[
                            "bg-danger",
                            "bg-success",
                            "bg-primary",
                            "bg-info",
                            "bg-dark",
                            "bg-warning",
                          ].map((color) => (
                            <div
                              key={color}
                              onClick={() =>
                                categoryValidation.setFieldValue("color", color)
                              }
                              className={`rounded-circle ${color}`}
                              style={{
                                width: "30px",
                                height: "30px",
                                cursor: "pointer",
                                border:
                                  categoryValidation.values.color === color
                                    ? "3px solid #000"
                                    : "2px solid #fff",
                              }}
                              title={color.replace("bg-", "")}
                            />
                          ))}
                        </div>
                        {categoryValidation.touched.color &&
                        categoryValidation.errors.color ? (
                          <div className="text-danger mt-1">
                            {categoryValidation.errors.color}
                          </div>
                        ) : null}
                      </div>
                    </Col>
                  </Row>

                  <Row className="mt-2">
                    <Col className="col-6">
                      {isEdit && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          id="btn-delete-event"
                          onClick={() => {
                            toggle();
                            setDeleteModal(true);
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </Col>

                    <Col className="col-6 text-end">
                      <button
                        type="button"
                        className="btn btn-light me-1"
                        onClick={toggle}
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        className="btn btn-success"
                        id="btn-save-event"
                      >
                        Save
                      </button>
                    </Col>
                  </Row>
                </Form>
              </ModalBody>
            </Modal>
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};

export default Calender;
=======
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
          <Button color="secondary" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
      <ToastContainer />
    </>
  );
};

export default CalendarComponent;
>>>>>>> Stashed changes
