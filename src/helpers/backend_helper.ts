import axios from "axios";
import * as url from "./url_helper";
import { APIClient } from "./api_helper";


const api = new APIClient();

// Login Method
export const login = async (userData: any) => {
  try {
      const response = await axios.post(process.env.REACT_APP_BASE_API_URL + url.POST_LOGIN_API_URL, userData);
      return response;
  } catch (error) {
      console.error("❌ API Error:" + error);
      throw error; 
  }
};

// Gets the logged in user data from local session
export const getLoggedInUser = () => {
  const user = localStorage.getItem("userInfo");
  if (user) return JSON.parse(user);
  return null;
};

//is user is logged in
export const isUserAuthenticated = () => {
  return getLoggedInUser() !== null;
};

// Calendar
// api.get Events
export const getEvents = () => api.get(url.GET_EVENTS, null);

// api.get Events
export const getCategories = () => api.get(url.GET_CATEGORIES, null);

// add Events
export const addNewEvent = (event: any) => api.create(url.ADD_NEW_EVENT, event);

// update Event
export const updateEvent = (event: any) => api.put(url.UPDATE_EVENT, event);

// delete Event
export const deleteEvent = (event: any) => api.delete(url.DELETE_EVENT, { headers: { event } });
