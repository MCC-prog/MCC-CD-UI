import { Navigate } from "react-router-dom"
import Dashboard from "../pages/Dashboard/index";

// Auth
import Login from "pages/Authentication/login";
import Logout from "pages/Authentication/Logout";
import UserProfile from "pages/Authentication/user-profile";
import Bos from "pages/Curriculum/Bos";


const authProtectedRoutes = [
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/profile", component: <UserProfile /> },
  { path: "/Bos_Data", component: <Bos /> }
];

const publicRoutes = [
  { path: "", exact: true, component: <Navigate to="/login" /> },
  { path: "/login", component: <Login /> },
  { path: "/logout", component: <Logout /> },
]
export { authProtectedRoutes, publicRoutes };
