enum LAYOUT_TYPES {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

enum LAYOUT_MODE_TYPES {
  DARK = "dark",
  LIGHT = "light",
}

enum LAYOUT_WIDTH_TYPES {
  FLUID = "fluid",
  BOXED = "boxed",
  SCROLLABLE = "scrollable",
}

enum TOPBAR_THEME_TYPES {
  LIGHT = "light",
  DARK = "dark",
  COLORED = "colored",
}

enum LEFT_SIDEBAR_TYPES {
  DEFAULT = "default",
  COMPACT = "small",
  ICON = "icon",
}

enum LEFT_SIDEBAR_THEME_TYPES {
  LIGHT = "light",
  COLORED = "colored",
  DARK = "dark",
  WINTER = "winter",
  LADYLIP = "ladylip",
  PLUMPLATE = "plumplate",
  STRONGBLISS = "strongbliss",
  GREATWHALE = "greatwhale",
}

enum LEFTBAR_THEME_IMAGES_TYPES {
  NONE = "none",
  IMG1 = "img1",
  IMG2 = "img2",
  IMG3 = "img3",
  IMG4 = "img4",
}

const SEMESTER_NO_OPTIONS = [
  { value: "1", label: "I" },
  { value: "2", label: "II" },
  { value: "3", label: "III" },
  { value: "4", label: "IV" },
  { value: "5", label: "V" },
  { value: "6", label: "VI" },
];

const megaMenuContents = [
  {
    title: "CURRICULUM",
    items: [
      { label: "1. BoS", path: "/Bos_Data" },
      { label: "2. Courses with focus", path: "/Courses_With_Focus" },
      { label: "3. New Programs Introduced", path: "/New_Programs_Introduced" },
      { label: "4. New Courses Introduced", path: "/New_Courses_Introduced" },
      { label: "5. Value Added Program", path: "/Value_Added_Program" },
      { label: "6. Experiential Learning", path: "/Experiential_Learning" },
      {
        label: "7. Innovative Teaching Methodologies",
        path: "/Innovative_Teaching_Methodologies",
      },
      { label: "8. AC & GB MoM", path: "/AC_GB_MoM" },
    ],
  },
  {
    title: "TEACHING & LEARNING",
    items: [
      { label: "1. Remedial Classes", path: "/Remedial_Classes" },
      { label: "2. Advanced Learners", path: "/Advanced_Learners" },
      {
        label: "3. Student Centric Teaching Methodology",
        path: "/Student_Centric_Teaching",
      },
      {
        label: "4. Usage of ICT tools in classroom",
        path: "/UsageOf_ICT_Tools",
      },
    ],
  },
  {
    title: "STUDENT DETAILS",
    items: [
      {
        label: "1. Number of Students enrolled",
        path: "/NumberOfStudents_Enrolled",
      },
      {
        label: "2. Total Student Strength (UG & PG separate)",
        path: "/TotalStudentsStrength",
      },
      {
        label: "3. Student Strength Program-wise",
        path: "/StudentStrengthProgram",
      },
    ],
  },
  {
    title: "STAFF PROFILE",
    items: [
      {
        label: "1. Teachers' details",
        path: "/Teachers_Details",
      },
      {
        label: "2. Part Time/Guest Faculty",
        path: "/PartTime_Guest",
      },
      {
        label: "3. Professor Practice",
        path: "/Professor_Practice",
      },
    ],
  },
  {
    title: "DEPARTMENT PROFILE",
    items: [
      {
        label: "1. Year of Establishment",
        path: "/Year_Of_Establishment",
      },
      {
        label: "2. Staff Profile",
        path: "/Staff_Profile",
      },
      {
        label: "3. Programs offered by the Department",
        path: "/Program_By_Dept",
      },
      {
        label: "4. Number of Books in Department library",
        path: "/Number_OfBooks_Dept",
      },
    ],
  },
  {
    title: "EXAMINATION",
    items: [
      {
        label: "1. Program –wise Exam Results",
        path: "/examination/programWiseExamResult",
      },
      {
        label: "2. Student Grievances w.r.t Exam & Action taken",
        path: "/examination/examAndActionTaken",
      },
      {
        label: "3. Malpractice Committee report",
        path: "/malpracticeCommitteeReport",
      },
    ],
  },
  {
    title: "RESEARCH",
    items: [
      {
        label: "1. Management funded Project",
        path: "/Management_Funded_Project",
      },
      {
        label: "2. Government/ NGO funded projects",
        path: "/Government_Or_NGO_Funded_Projects",
      },
      {
        label: "3. Fellowships awarded for advanced learning & research",
        path: "/Felloships_Awarded",
      },
      { label: "4. Research Guides", path: "/Research_Guides" },
      { label: "5. Research Publications", path: "/Research_Publications" },
      { label: "6. Books/Chapters", path: "/Books_Chapters" },
      {
        label:
          "7. Faculty participation & presentation of Research Papers in Conference/Seminars and going as Resource Persons",
        path: "/FP_And_Presentation_Research_Papers",
      },
    ],
  },
  {
    title: "INDUSTRY COLLABORATION",
    items: [
      {
        label: "1. MoUs – Agreement Copy & Activities conducted",
        path: "/Mous_AgreementCopy_Activities",
      },
      {
        label: "2. Consultancy undertaken by Staff",
        path: "/Consultancy_Undertaken_by_Staff",
      },
      {
        label:
          "3. Details of Programs offered/ Courses delivered in collaboration with Industry",
        path: "/Details_of_Programs_offered",
      },
      {
        label: "4. Skill development Workshops",
        path: "/Skill_Development_Workshop",
      },
    ],
  },
  {
    title: "INNOVATION & ENTREPRENEURSHIP",
    items: [
      {
        label: "1. Workshops/Seminars conducted",
        path: "/workshopsandSeminarsConducted",
      },
      { label: "2. Innovation", path: "/innovation" },
      { label: "3. Patents filed", path: "/patentsFiled" },
      {
        label: "4. Activities conducted by MCCIE",
        path: "/enterpreneurship/activitiesConducted",
      },
    ],
  },
  {
    title: "EXTENSION ACTIVITIES",
    items: [
      { label: "1. CDP Activity", path: "/Cdp_Activites" },
      { label: "2. NSS /YRC", path: "/Nss_Yrc" },
      { label: "3. NCC", path: "/Ncc" },
      { label: "4. ISRC", path: "/Isrc" },
      { label: "5. IKS", path: "/Iks" },
      {
        label: "6. Teacher/Student Award for Extension Activities",
        path: "/Teacher_Student_Award",
      },
    ],
  },
  {
    title: "STUDENT ACTIVITIES/ SUPPORT",
    items: [
      {
        label: "1. Capacity Development & Skills Enhancement",
        path: "/CapacityDevelopment_Skills",
      },
      {
        label: "2. Conferences/ Seminars/ Workshops",
        path: "/Conference_Seminars_Workshops",
      },
      { label: "3. Guest Lectures", path: "/Guest_Lectures" },
      {
        label: "4. Career Counseling & Guidance",
        path: "/Career_Counseling_Guidance",
      },
      {
        label: "5. Student Progression – Competitive Exams",
        path: "/StudentProgression_Competitive_Exams",
      },
      {
        label: "6. Student Progression - Higher Education",
        path: "/StudentProgression_Higher_Education",
      },
      {
        label: "7. Details of Students enrolled for MOOC",
        path: "/DetailsOfStudents_MOOC",
      },
      {
        label: "8. Intercollegiate events and awards won",
        path: "/Intercollegiate_Events_Awards_Won",
      },
      {
        label:
          "9. Cultural & Co-Curricular activities conducted in the college",
        path: "/Cultural_CoCurricularActivities_Conducted",
      },
      {
        label: "10. Sports Events conducted in the college",
        path: "/SportsEvents_Conducted_College",
      },
    ],
  },
  {
    title: "LIBRARY",
    items: [
      { label: "1. Databases which are subscribed", path: "/Databases" },
      { label: "2. Research Journals", path: "/Research_Journals" },
      { label: "3. Books", path: "/Books" },
      { label: "4. Annual Expenditure", path: "/Annual_Expenditure" },
    ],
  },
  {
    title: "PLACEMENT",
    items: [
      "On campus placement data",
      "Off campus placement data",
      "Training programs & Workshops",
      "Internships",
      "Career Fair",
    ],
  },
  {
    title: "STAFF ENHANCEMENT PROGRAMS",
    items: [
      { label: "1. FDPs", path: "/Fdps" },
      { label: "2. MOOCs", path: "/Moocs" },
      {
        label: "3. Skill Development Workshops",
        path: "/Skill_Development_Workshops",
      },
    ],
  },
  {
    title: "ALUMNI",
    items: [
      "Association Activities",
      "Scholarships provided by Alumni Association",
      "Financial Contribution by Alumni",
      "Distinguished Alumni of the last five years",
    ],
  },
  {
    title: "INSTITUTIONAL VALUES",
    items: [
      "Activities hosted to build universal values of peace, truth & harmony",
      "Gender sensitization & equity programs",
      "Programs for imbibing Constitutional Values among students",
      "Commemoration of major National/International Days",
      "Best Practices",
    ],
  },
  {
    title: "INFRASTRUCTURE",
    items: [
      "Classrooms",
      "Labs",
      "Computer labs / Simulation lab",
      "Auditorium",
      "Board rooms",
      "Amphitheatre",
      "Seminar halls - infrastructure",
    ],
  },
  {
    title: "GOVERNANCE",
    items: ["Policy document", "AAA", "Green Audit", "Energy Audit"],
  },
];

export {
  LAYOUT_TYPES,
  LAYOUT_MODE_TYPES,
  LAYOUT_WIDTH_TYPES,
  TOPBAR_THEME_TYPES,
  LEFT_SIDEBAR_TYPES,
  LEFT_SIDEBAR_THEME_TYPES,
  LEFTBAR_THEME_IMAGES_TYPES,
  SEMESTER_NO_OPTIONS,
  megaMenuContents,
};
