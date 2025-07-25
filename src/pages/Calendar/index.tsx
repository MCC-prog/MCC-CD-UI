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

import DeleteModal from "./DeleteModal";

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
  );

  const { events, categories }: any = useSelector(selectProperties);

  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [modalCategory, setModalCategory] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState();
  const [selectedDay, setSelectedDay] = useState<any>(0);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  useEffect(() => {
    dispatch(onGetCategories());
    dispatch(onGetEvents());
  }, [dispatch]);

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
      }
      toggle();
    },
  });

  useEffect(() => {
    if (!modalCategory && !isEmpty(event) && !!isEdit) {
      setTimeout(() => {
        setEvent({});
        setIsEdit(false);
      }, 500);
    }
  }, [modalCategory, event, isEdit]);

  /**
   * Handling the modal state
   */
  const toggle = () => {
    if (modalCategory) {
      setModalCategory(false);
      setEvent(null);
      setIsEdit(false);
    } else {
      setModalCategory(true);
    }
  };

  /**
   * Handling date click on calendar
   */
  const handleDateClick = (arg: any) => {
    const date = arg["date"];
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
    const modifiedData = { ...arg, date: modifiedDate };

    setSelectedDay(modifiedData);
    toggle();
  };

  /**
   * Handling click on event on calendar
   */
  const handleEventClick = (arg: any) => {
    const event = arg.event;
    setEvent({
      id: event.id,
      title: event.title,
      // title_category: event.title_category,
      start: event.start,
      className: event.classNames,
      category: event.classNames[0],
      event_category: event.classNames[0],
    });
    setDeleteId(event.id);
    setIsEdit(true);
    setModalCategory(true);
    toggle();
  };

  /**
   * On delete event
   */
  const handleDeleteEvent = () => {
    if (deleteId) {
      dispatch(onDeleteEvent(deleteId));
    }
    setDeleteModal(false);
  };

  /**
   * On category darg event
   */
  const onDrag = (event: any, category: any) => {
    event.preventDefault();
  };

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
    }
  };

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
  };

  return (
    <React.Fragment>
      <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteEvent}
        onCloseClick={() => setDeleteModal(false)}
      />
      <Container fluid={true}>
        <Row>
          <Col className="col-12">
            {/* fullcalendar control */}
            <Card style={{ height: "522px", overflow: "hidden" }}>
              <CardBody style={{ height: "100%", padding: "10px" }}>
                <FullCalendar
                  plugins={[
                    BootstrapTheme,
                    dayGridPlugin,
                    listPlugin,
                    interactionPlugin,
                  ]}
                  initialView="dayGridMonth"
                  slotDuration={"00:15:00"}
                  handleWindowResize={true}
                  themeSystem="bootstrap"
                  locale={isLocal}
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,dayGridWeek,dayGridDay,listWeek",
                  }}
                  events={events}
                  editable={true}
                  droppable={true}
                  selectable={true}
                  dateClick={handleDateClick}
                  eventClick={handleEventClick}
                  drop={onDrop}
                  contentHeight="100%" // Ensures the calendar fits within the CardBody
                  height="100%" // Ensures the calendar adjusts to the card height
                />
              </CardBody>
            </Card>

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
