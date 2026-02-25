import { createAsyncThunk } from "@reduxjs/toolkit";

import {
    getEvents as getEventsApi,
    getCategories as getCategoriesApi,
    addNewEvent as addNewEventApi,
    deleteEvent as deleteEventApi,
    updateEvent as updateEventApi
} from "../../helpers/backend_helper";
import { toast } from "react-toastify";

export const getEvents = createAsyncThunk("calendar/getEvents", async () => {
    try {
        const response = getEventsApi();
        return response;
    } catch (error) {
        return error;
    }
});

export const getCategories = createAsyncThunk("calendar/getCategories", async () => {
    try {
        const response = getCategoriesApi();
        return response;
    } catch (error) {
        return error;
    }
});

export const addNewEvent = createAsyncThunk("calendar/addNewEvent", async (event: any) => {
    try {
        const response = addNewEventApi(event);
        toast.success("Event Added Successfully", { autoClose: 2000 });
        return response;
    } catch (error) {
        toast.error("Event Added Failed", { autoClose: 2000 });
        return error;
    }
});


export const updateEvent = createAsyncThunk("calendar/updateEvent", async (event: any) => {
    try {
        const response = updateEventApi(event);
        toast.success("Event update Successfully", { autoClose: 2000 });
        return response;
    } catch (error) {
        toast.error("Event update Failed", { autoClose: 2000 });
        return error;
    }
});  