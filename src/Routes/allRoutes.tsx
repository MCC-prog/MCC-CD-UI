import { Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard/index";

// Auth
import Login from "pages/Authentication/login";
import Logout from "pages/Authentication/Logout";
import UserProfile from "pages/Authentication/user-profile";
import Bos from "pages/Curriculum/Bos";
import New_Programs_Introduced from "pages/Curriculum/New_Programs_Introduced";
import New_Courses_Introduced from "pages/Curriculum/New_Courses_Introduced";
import Experimental_Learning from "pages/Curriculum/Experiential_Learning";
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
import Fdps from "pages/Staff Enhancement Programs/Fdps";
import Moocs from "pages/Staff Enhancement Programs/Moocs";
import Skill_Development_Work from "pages/Staff Enhancement Programs/Skill_Development_Work";
import Cdp_Activites from "pages/Extension Activity/Cdp_Activity";
import Nss_Yrc from "pages/Extension Activity/Nss_Yrc";
import Ncc from "pages/Extension Activity/Ncc";
import Isrc from "pages/Extension Activity/Isrc";
import Iks from "pages/Extension Activity/Iks";
import Teacher_Student_Award from "pages/Extension Activity/Teacher_Student_Award";
import Mous_AgreementCopy_Activities from "pages/Industry Collaboration/Mous_AgreementCopy_Activities";
import Details_of_Programs_offered from "pages/Industry Collaboration/Details_of_Programs_offered";
import Consultancy_Undertaken_by_Staff from "pages/Industry Collaboration/Consultancy_Undertaken_by_Staff";
import Skill_Development_Workshop from "pages/Industry Collaboration/Skill_Development_Workshop";
import Management_Funded_Project from "pages/Research/Management_Funded_Project";
import Books_Chapters from "pages/Research/Books_Chapters";
import Fellowships_Awarded_For_AL_And_Research from "pages/Research/Fellowships_Awarded_For_AL_And_Research";
import FP_And_Presentation_Research_Papers from "pages/Research/FP_And_Presentation_Research_Papers";
import Government_Or_NGO_Funded_Projects from "pages/Research/Government_Or_NGO_Funded_Projects";
import Research_Guides from "pages/Research/Research_Guides";
import Research_Publications from "pages/Research/Research_Publications";
import CapacityDevelopment_Skills from "pages/Student Activities & Support/CapacityDevelopment_Skills";
import Conference_Seminars_Workshops from "pages/Student Activities & Support/Conference_Seminars_Workshops";
import Career_Counseling_Guidance from "pages/Student Activities & Support/Career_Counseling_Guidance";
import Guest_Lectures from "pages/Student Activities & Support/Guest_Lectures";
import StudentProgression_Higher_Education from "pages/Student Activities & Support/StudentProgression_Higher_Education";
import StudentProgression_Competitive_Exams from "pages/Student Activities & Support/StudentProgression_Competitive_Exams";
import DetailsOfStudents_MOOC from "pages/Student Activities & Support/DetailsOfStudents_MOOC";
import Intercollegiate_Events_Awards_Won from "pages/Student Activities & Support/Intercollegiate_Events_Awards_Won";
import Cultural_CoCurricularActivities_Conducted from "pages/Student Activities & Support/Cultural_CoCurricularActivities_Conducted";
import SportsEvents_Conducted_College from "pages/Student Activities & Support/SportsEvents_Conducted_College";
import Program_Wise_Exam_Results from "pages/Examination/Program_Wise_Exam_Result";
import Exam_Action_Taken from "pages/Examination/Exam_Action_Taken";
import Malpractice_committee_Report from "pages/Examination/Malpractice_Committee_Report";
import WorkshopsOrSeminars from "pages/Innovation And Entreprenuership/WorkshopsOrSeminar";
import Innovation from "pages/Innovation And Entreprenuership/Innovation";
import PatentsOrCopyRights from "pages/Innovation And Entreprenuership/PatentsOrCopyRights";
import Activities_Conducted_MCCIE from "pages/Innovation And Entreprenuership/Activities_Conducted_MCCIE";
import OffCampus from "pages/Placement/OffCampus";
import Internships from "pages/Placement/Internships";
// import CareerFair from "pages/Placement/CareerFair";
import OnCampus from "pages/Placement/OnCampus";
import TrainingsAndWorkshops from "pages/Placement/TrainingsAndWorkshops";
import ClassRooms from "pages/Infrastructure/ClassRooms";
import Labs from "pages/Infrastructure/Labs";
import ActivitiesPeace from "pages/InstitutionValues/ActivitiesPeace";
import EquityPrograms from "pages/InstitutionValues/EquityPrograms";
import ConstitutionalValues from "pages/InstitutionValues/ConstitutionalValues";
import BestPractices from "pages/InstitutionValues/BestPractices";
import NationalInternationalDays from "../pages/InstitutionValues/NationalInternationalDays";
import AssociationActivites from "pages/Alumni/AssociationActivities";
import Scholarships from "pages/Alumni/Scholarships";
import FinancialContribution from "pages/Alumni/FinancialContribution";
import DistinguishedAlumni from "pages/Alumni/DistinguishedAlumni";
import Softwares from "pages/Infrastructure/Softwares";
import Seminar_Halls from "pages/Infrastructure/Seminar_Halls";
import Amphitheatre from "pages/Infrastructure/Amphitheatre";
import Board_Rooms from "pages/Infrastructure/Board_Rooms";
import ComputerLabs_SimulationLab from "pages/Infrastructure/ComputerLabs_SimulationLab";
import Auditorium from "pages/Infrastructure/Auditorium";
import PolicyDocument from "pages/Governance/Policy_Document";
import AAA from "pages/Governance/AAA";
import GreenAudit from "pages/Governance/Green_Audit";
import EnergyAudit from "pages/Governance/Energy_Audit";
import Annual_Expenditure from "pages/Library/Annual_Expenditure";
import Books from "pages/Library/Books";
import Research_Journals from "pages/Library/Research_Journals";
import Databases from "pages/Library/Databases";
import Boe from "pages/Curriculum/Boe";

const authProtectedRoutes = [
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/profile", component: <UserProfile /> },
  { path: "/Bos_Data", component: <Bos /> },
  { path: "/New_Programs_Introduced", component: <New_Programs_Introduced /> },
  { path: "/New_Courses_Introduced", component: <New_Courses_Introduced /> },
  { path: "/Experiential_Learning", component: <Experimental_Learning /> },
  { path: "/Courses_With_Focus", component: <Courses_With_Focus /> },
  {
    path: "/Innovative_Teaching_Methodologies",
    component: <Innovative_Teaching_Methodologies />,
  },
   { path: "/Boe_Data", component: <Boe /> },
  { path: "/AC_GB_MoM", component: <AC_GB_MoM /> },
  { path: "/Value_Added_Program", component: <Value_Added_Program /> },

  //________Teacher & Learning_________//
  { path: "/Remedial_Classes", component: <Remedial_Classes /> },
  { path: "/Advanced_Learners", component: <Advanced_Learners /> },
  {
    path: "/Student_Centric_Teaching",
    component: <Student_Centric_Teaching />,
  },
  { path: "/UsageOf_ICT_Tools", component: <UsageOf_Ict_Tools /> },

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

  //__________Staff Enhancement__________//
  { path: "/Fdps", component: <Fdps /> },
  { path: "/Moocs", component: <Moocs /> },
  {
    path: "/Skill_Development_Workshops",
    component: <Skill_Development_Work />,
  },

  //__________Extension Activites__________//
  { path: "/Cdp_Activites", component: <Cdp_Activites /> },
  { path: "/Nss_Yrc", component: <Nss_Yrc /> },
  { path: "/Ncc", component: <Ncc /> },
  { path: "/Isrc", component: <Isrc /> },
  { path: "/Iks", component: <Iks /> },
  { path: "/Teacher_Student_Award", component: <Teacher_Student_Award /> },

  //__________Industry Collaboration__________//
  {
    path: "/Mous_AgreementCopy_Activities",
    component: <Mous_AgreementCopy_Activities />,
  },
  {
    path: "/Consultancy_Undertaken_by_Staff",
    component: <Consultancy_Undertaken_by_Staff />,
  },
  {
    path: "/Details_of_Programs_offered",
    component: <Details_of_Programs_offered />,
  },
  {
    path: "/Skill_Development_Workshop",
    component: <Skill_Development_Workshop />,
  },

  //__________Research__________//
  {
    path: "/Management_Funded_Project",
    component: <Management_Funded_Project />,
  },
  { path: "/Books_Chapters", component: <Books_Chapters /> },
  {
    path: "/Felloships_Awarded",
    component: <Fellowships_Awarded_For_AL_And_Research />,
  },
  {
    path: "/FP_And_Presentation_Research_Papers",
    component: <FP_And_Presentation_Research_Papers />,
  },
  {
    path: "/Government_Or_NGO_Funded_Projects",
    component: <Government_Or_NGO_Funded_Projects />,
  },
  { path: "/Research_Guides", component: <Research_Guides /> },
  { path: "/Research_Publications", component: <Research_Publications /> },

  //_______Student Activities/Support_________//
  {
    path: "/CapacityDevelopment_Skills",
    component: <CapacityDevelopment_Skills />,
  },
  {
    path: "/Conference_Seminars_Workshops",
    component: <Conference_Seminars_Workshops />,
  },
  {
    path: "/Career_Counseling_Guidance",
    component: <Career_Counseling_Guidance />,
  },
  { path: "/Guest_Lectures", component: <Guest_Lectures /> },
  {
    path: "/StudentProgression_Higher_Education",
    component: <StudentProgression_Higher_Education />,
  },
  {
    path: "/StudentProgression_Competitive_Exams",
    component: <StudentProgression_Competitive_Exams />,
  },
  { path: "/DetailsOfStudents_MOOC", component: <DetailsOfStudents_MOOC /> },
  {
    path: "/Intercollegiate_Events_Awards_Won",
    component: <Intercollegiate_Events_Awards_Won />,
  },
  {
    path: "/Cultural_CoCurricularActivities_Conducted",
    component: <Cultural_CoCurricularActivities_Conducted />,
  },
  {
    path: "/SportsEvents_Conducted_College",
    component: <SportsEvents_Conducted_College />,
  },

  //__________Library_________//
  { path: "/Databases", component: <Databases /> },
  { path: "/Research_Journals", component: <Research_Journals /> },
  { path: "/Books", component: <Books /> },
  { path: "/Annual_Expenditure", component: <Annual_Expenditure /> },
  //_______Examination_________//
  {
    path: "/examination/programWiseExamResult",
    component: <Program_Wise_Exam_Results />,
  },
  { path: "/examination/examAndActionTaken", component: <Exam_Action_Taken /> },
  {
    path: "/malpracticeCommitteeReport",
    component: <Malpractice_committee_Report />,
  },

  //___________Innovation and Enterprenuership____________//
  {
    path: "/workshopsandSeminarsConducted",
    component: <WorkshopsOrSeminars />,
  },
  { path: "/innovation", component: <Innovation /> },
  { path: "/patentsFiled", component: <PatentsOrCopyRights /> },
  {
    path: "/enterpreneurship/activitiesConducted",
    component: <Activities_Conducted_MCCIE />,
  },

  //___________Placement____________//
  { path: "/placement/onCampus", component: <OnCampus /> },
  { path: "/placement/offCampus", component: <OffCampus /> },
  {
    path: "/placement/trainingsAndWorkshops",
    component: <TrainingsAndWorkshops />,
  },
  { path: "/placement/Internships", component: <Internships /> },
  // { path: "/placement/careerFair", component: <CareerFair /> },

  //_____________Infrastructure_____________//
  { path: "/infrastructure/classroom", component: <ClassRooms /> },
  { path: "/infrastructure/labs", component: <Labs /> },
  { path: "/infrastructure/softwares", component: <Softwares /> },
  { path: "/infrastructure/seminarHalls", component: <Seminar_Halls /> },
  { path: "/infrastructure/amphitheatre", component: <Amphitheatre /> },
  { path: "/infrastructure/boardRooms", component: <Board_Rooms /> },
  {
    path: "/infrastructure/computerLabs",
    component: <ComputerLabs_SimulationLab />,
  },
  { path: "/infrastructure/auditorium", component: <Auditorium /> },

  //_______________Institutional Values_________________//
  {
    path: "/institutionalvalues/activitiesPeace",
    component: <ActivitiesPeace />,
  },
  {
    path: "/institutionalvalues/equityPrograms",
    component: <EquityPrograms />,
  },
  {
    path: "/institutionalvalues/constitutionValues",
    component: <ConstitutionalValues />,
  },
  {
    path: "/institutionalvalues/nationalInternationalDays",
    component: <NationalInternationalDays />,
  },
  { path: "/institutionalvalues/bestPractices", component: <BestPractices /> },

  //_________________Alumni___________________________//
  {
    path: "/Alumni/associationActivities",
    component: <AssociationActivites />,
  },
  { path: "/Alumni/scholarships", component: <Scholarships /> },
  {
    path: "/Alumni/financialContribution",
    component: <FinancialContribution />,
  },
  { path: "/Alumni/distinguishedAlumni", component: <DistinguishedAlumni /> },

  //_________________GOVERNANCE___________________________//
  { path: "/policyDocument", component: <PolicyDocument /> },
  { path: "/aaa", component: <AAA /> },
  { path: "/greenAudit", component: <GreenAudit /> },
  { path: "/energyAudit", component: <EnergyAudit /> },
];

const publicRoutes = [
  { path: "", exact: true, component: <Navigate to="/login" /> },
  { path: "/login", component: <Login /> },
  { path: "/logout", component: <Logout /> },
];
export { authProtectedRoutes, publicRoutes };
