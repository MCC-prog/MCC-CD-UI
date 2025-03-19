import { Navigate } from "react-router-dom"
import Dashboard from "../pages/Dashboard/index";

// Auth
import Login from "pages/Authentication/login";
import Logout from "pages/Authentication/Logout";
import UserProfile from "pages/Authentication/user-profile";
import Bos from "pages/Curriculum/Bos";
import New_Programs_Introduced from "pages/Curriculum/New_Programs_Introduced";
import New_Courses_Introduced from "pages/Curriculum/New_Courses_Introduced";
import Experimental_Learning from "pages/Curriculum/Experimental_Learning";


const authProtectedRoutes = [
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/profile", component: <UserProfile /> },
  { path: "/Bos_Data", component: <Bos /> },
  {path: "/New_Programs_Introduced", component: <New_Programs_Introduced/>},
  {path: "/New_Courses_Introduced", component: <New_Courses_Introduced/>},
  {path: "/Experimental_Learning", component: <Experimental_Learning/>},
];

const publicRoutes = [
  { path: "/", exact: true, component: <Navigate to="/login" /> },
  { path: "/login", component: <Login /> },
  { path: "/logout", component: <Logout /> },
]
export { authProtectedRoutes, publicRoutes };
