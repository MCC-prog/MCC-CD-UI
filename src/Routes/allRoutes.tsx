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
import Courses_With_Focus from "pages/Curriculum/Courses_With_Focus";
import Innovative_Teaching_Methodologies from "pages/Curriculum/Innovative_Teaching_Methodologies";
import AC_GB_MoM from "pages/Curriculum/AC_GB_MoM";
import Remedial_Classes from "pages/Teacher & Learning/Remedial_Classes";
import Advanced_Learners from "pages/Teacher & Learning/Advanced_Learners";
import Value_Added_Program from "pages/Curriculum/Value_Added_Program";
import StudentStrengthProgram from "pages/Student Details/StudentStrengthProgram";
import NumberOfStudents from "pages/Student Details/NumberOfStudents";
import TotalStudentsStrength from "pages/Student Details/TotalStudentsStrength";
import UsageOf_Ict_Tools from "pages/Teacher & Learning/UsageOf_Ict_Tools";
import Student_Centric_Teaching from "pages/Teacher & Learning/Student_Centric_Teaching";
import Teachers_Details from "pages/Staff Profile/Teachers_Details";
import PartTime_Guest from "pages/Staff Profile/PartTime_Guest";
import Professor_Practice from "pages/Staff Profile/Professor_Practice";
import Year_Of_Establishment from "pages/Department Profile/Year_Of_Establishment";
import Staff_Profile from "pages/Department Profile/Staff_Profile";
import Program_By_Dept from "pages/Department Profile/Program_By_Dept";
import Number_OfBooks_Dept from "pages/Department Profile/Number_OfBooks_Dept";


const authProtectedRoutes = [
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/profile", component: <UserProfile /> },
  { path: "/Bos_Data", component: <Bos /> },
  { path: "/New_Programs_Introduced", component: <New_Programs_Introduced /> },
  { path: "/New_Courses_Introduced", component: <New_Courses_Introduced /> },
  { path: "/Experimental_Learning", component: <Experimental_Learning /> },
  { path: "/Courses_With_Focus", component: <Courses_With_Focus /> },
  { path: "/Innovative_Teaching_Methodologies", component: <Innovative_Teaching_Methodologies /> },
  { path: "/AC_GB_MoM", component: <AC_GB_MoM /> },
  { path: "/Value_Added_Program", component: <Value_Added_Program /> },

  //________Teacher & Learning_________//
  { path: "/Remedial_Classes", component: <Remedial_Classes /> },
  { path: "/Advanced_Learners", component: <Advanced_Learners /> },
  { path: "/Student_Centric_Teaching", component: <Student_Centric_Teaching /> },
  {path: "/UsageOf_ICT_Tools", component: <UsageOf_Ict_Tools /> },

  //__________Student Details_________//
  { path: "/NumberOfStudents_Enrolled", component: <NumberOfStudents /> },
  { path: "/TotalStudentsStrength", component: <TotalStudentsStrength /> },
  { path: "/StudentStrengthProgram", component: <StudentStrengthProgram /> },

  //___________Staff Profile____________//
  { path: "/Teachers_Details", component: <Teachers_Details /> },
  { path: "/PartTime_Guest", component: <PartTime_Guest /> },
  { path: "/Professor_Practice", component: <Professor_Practice /> },

  //__________Department Profile__________//
  { path: "/Year_Of_Establishment", component: <Year_Of_Establishment /> },
  { path: "/Staff_Profile", component: <Staff_Profile /> },
  { path: "/Program_By_Dept", component: <Program_By_Dept /> },
  { path: "/Number_OfBooks_Dept", component: <Number_OfBooks_Dept /> },
];

const publicRoutes = [
  { path: "", exact: true, component: <Navigate to="/login" /> },
  { path: "/login", component: <Login /> },
  { path: "/logout", component: <Logout /> },
]
export { authProtectedRoutes, publicRoutes };
