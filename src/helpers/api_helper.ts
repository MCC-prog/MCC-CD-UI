import axios from "axios";

// default
axios.defaults.baseURL = process.env.REACT_APP_BASE_API_URL;

// content type
//axios.defaults.headers.post["Content-Type"] = "application/json";

// Add a request interceptor to include the Bearer token from sessionStorage
axios.interceptors.request.use(
  function (config: any) {
    // Retrieve the token from sessionStorage
    let userInfo = localStorage.getItem("userInfo");
    let token = userInfo ? JSON.parse(userInfo).token : null;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  function (error: any) {
    // Handle request error
    return Promise.reject(error);
  }
);

// intercepting to capture errors
axios.interceptors.response.use(
  function (response: any) {
    return response.data ? response.data : response;
  },
  function (error: any) {
    // Any status codes that fall outside the range of 2xx cause this function to trigger
    let message: any;
    switch (error.response?.status) {
      case 500:
        message = "Internal Server Error";
        break;
      case 401:
        message = "Invalid credentials";
        break;
      case 404:
        message = "Sorry! The data you are looking for could not be found";
        break;
      default:
        message = error.message || error;
    }
    return Promise.reject(message);
  }
);


// axios.interceptors.response.use(
//   function (response: any) {
//     // ✅ Always return the full response object so it includes status, headers, etc.
//     return response;
//   },
//   function (error: any) {
//     // ✅ Don't replace the error — attach a custom message if you want
//     if (error.response) {
//       const status = error.response.status;
//       let customMessage = '';

//       switch (status) {
//         case 500:
//           customMessage = 'Internal Server Error';
//           break;
//         case 401:
//           customMessage = 'Invalid credentials';
//           break;
//         case 404:
//           customMessage = 'Sorry! The data you are looking for could not be found';
//           break;
//         case 403:
//           customMessage = 'You are not authorized to perform this action';
//           break;
//         default:
//           customMessage = error.response.data?.message || error.message;
//       }

//       // 🔁 Attach a custom message but keep the full error object
//       error.customMessage = customMessage;
//     }

//     return Promise.reject(error);
//   }
// );

/**
 * Sets the default authorization (optional utility function)
 * @param {*} token
 */
const setAuthorization = (token: any) => {
  sessionStorage.setItem("authToken", token); // Store the token in sessionStorage
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
};

class APIClient {
  /**
   * Fetches data from given url
   */
  get = (url: any, params: any) => {
    return axios.get(url, params);
  };

  getApi = (url: string, params?: any) => {
  return axios.get(url, params ? { params } : undefined);
};

  /**
   * Post given data to url
   */
  create = (url: any, data: any, headers: any = {}) => {
    return axios.post(url, data, headers);
  };

  /**
   * Updates data
   */
  update = (url: any, data: any) => {
    return axios.patch(url, data);
  };

  put = (url: any, data: any, headers: any = {}) => {
    return axios.put(url, data, headers);
  };

  /**
   * Delete
   */
  delete = (url: any, config: any) => {
    return axios.delete(url, { ...config });
  };
}

const getLoggedinUser = () => {
  const user = localStorage.getItem("authUser");
  if (!user) {
    return null;
  } else {
    return JSON.parse(user);
  }
};

export { APIClient, setAuthorization, getLoggedinUser };