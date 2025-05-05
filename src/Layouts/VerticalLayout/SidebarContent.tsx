import React, { useEffect, useRef, useCallback } from "react";
//Import Scrollbar
import SimpleBar from "simplebar-react";

// MetisMenu
import MetisMenu from "metismenujs";

import { Link } from "react-router-dom";

//i18n
import { withTranslation } from "react-i18next";
import withRouter from "../../Components/Common/withRouter";

const SidebarContent = (props: any) => {
  const ref = useRef<any>();
  const activateParentDropdown = useCallback((item: any) => {
    item.classList.add("active");
    const parent = item.parentElement;
    const parent2El = parent.childNodes[1];

    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show");
    }

    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.add("mm-show"); // ul tag

        const parent3 = parent2.parentElement; // li tag

        if (parent3) {
          parent3.classList.add("mm-active"); // li
          parent3.childNodes[0].classList.add("mm-active"); //a
          const parent4 = parent3.parentElement; // ul
          if (parent4) {
            parent4.classList.add("mm-show"); // ul
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add("mm-show"); // li
              parent5.childNodes[0].classList.add("mm-active"); // a tag
            }
          }
        }
      }
      scrollElement(item);
      return false;
    }
    scrollElement(item);
    return false;
  }, []);

  const removeActivation = (items) => {
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      const parent = items[i].parentElement;

      if (item && item.classList.contains("active")) {
        item.classList.remove("active");
      }
      if (parent) {
        const parent2El =
          parent.childNodes && parent.childNodes.lenght && parent.childNodes[1]
            ? parent.childNodes[1]
            : null;
        if (parent2El && parent2El.id !== "side-menu") {
          parent2El.classList.remove("mm-show");
        }

        parent.classList.remove("mm-active");
        const parent2 = parent.parentElement;

        if (parent2) {
          parent2.classList.remove("mm-show");

          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.remove("mm-active"); // li
            parent3.childNodes[0].classList.remove("mm-active");

            const parent4 = parent3.parentElement; // ul
            if (parent4) {
              parent4.classList.remove("mm-show"); // ul
              const parent5 = parent4.parentElement;
              if (parent5) {
                parent5.classList.remove("mm-show"); // li
                parent5.childNodes[0].classList.remove("mm-active"); // a tag
              }
            }
          }
        }
      }
    }
  };

  const activeMenu = useCallback(() => {
    const pathName = process.env.PUBLIC_URL + props.router.location.pathname;
    let matchingMenuItem = null;
    const ul: any = document.getElementById("side-menu");
    const items = ul.getElementsByTagName("a");
    removeActivation(items);

    for (let i = 0; i < items.length; ++i) {
      if (pathName === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  }, [props.router.location.pathname, activateParentDropdown]);

  useEffect(() => {
    ref.current.recalculate();
  }, []);

  useEffect(() => {
    new MetisMenu("#side-menu");
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    activeMenu();
  }, [activeMenu]);

  function scrollElement(item: any) {
    if (item) {
      const currentPosition = item.offsetTop;
      if (currentPosition > window.innerHeight) {
        ref.current.getScrollElement().scrollTop = currentPosition - 300;
      }
    }
  }

  return (
    <React.Fragment>
      <SimpleBar className="h-100" ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li className="menu-title">{props.t("Menu")} </li>
            <li>
              <Link to="/dashboard" >
                <i className="bx bx-home-circle"></i>
                <span>{props.t("Dashboard")}</span>
              </Link>
            </li>
            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-book"></i>
                <span>{props.t("CURRICULUM")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/Bos_Data">{props.t("1.	BoS ")}</Link>
                </li>
                <li>
                  <Link to="/Courses_With_Focus">{props.t("2. Courses with focus")}</Link>
                </li>
                <li>
                  <Link to="/New_Programs_Introduced">{props.t("3. New Programs Introduced ")}</Link>
                </li>
                <li>
                  <Link to="/New_Courses_Introduced">{props.t("4. New Courses Introduced ")}</Link>
                </li>
                <li>
                  <Link to="/Value_Added_Program">{props.t("5. Value Added Program ")}</Link>
                </li>
                <li>
                  <Link to="/Experimental_Learning">
                    <span className="badge rounded-pill text-bg-success float-end" key="t-new">New</span>
                    {props.t("6. Experiential Learning ")}
                  </Link>
                </li>
                <li>
                  <Link to="/Innovative_Teaching_Methodologies">{props.t("7. Innovative Teaching Methodologies ")}</Link>
                </li>
                <li>
                  <Link to="/AC_GB_MoM">{props.t("8. AC & GB MoM ")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-chalkboard"></i>
                <span>{props.t("TEACHING & LEARNING")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/Remedial_Classes">{props.t("1. Remedial Classes")}</Link>
                </li>
                <li>
                  <Link to="/Advanced_Learners">{props.t("2. Advanced Learners")}</Link>
                </li>
                <li>
                  <Link to="/Student_Centric_Teaching">{props.t("3. Student Centric Teaching Methodology")}</Link>
                </li>
                <li>
                  <Link to="/UsageOf_ICT_Tools">{props.t("4. Usage of ICT tools in classroom")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-user"></i>
                <span>{props.t("STUDENT DETAILS")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/NumberOfStudents_Enrolled">{props.t("1. Number of Students enrolled")}</Link>
                </li>
                <li>
                  <Link to="/TotalStudentsStrength">{props.t("2. Total Student Strength (UG & PG separate)")}</Link>
                </li>
                <li>
                  <Link to="/StudentStrengthProgram">{props.t("3. Student Strength Program-wise")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-group"></i>
                <span>{props.t("STAFF PROFILE")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/Teachers_Details">{props.t("1. Teachers' details")}</Link>
                </li>
                <li>
                  <Link to="/PartTime_Guest">{props.t("2. Part-time/Guest faculty")}</Link>
                </li>
                <li>
                  <Link to="/Professor_Practice">{props.t("3. Professor of Practice")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-building"></i>
                <span>{props.t("DEPARTMENT PROFILE")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/Year_Of_Establishment">{props.t("1. Year of Establishment")}</Link>
                </li>
                <li>
                  <Link to="/Staff_Profile">{props.t("2. Staff Profile")}</Link>
                </li>
                <li>
                  <Link to="/Program_By_Dept">{props.t("3. Programs offered by the Department")}</Link>
                </li>
                <li>
                  <Link to="/Number_OfBooks_Dept">{props.t("4. Number of Books in Department library")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-file"></i>
                <span>{props.t("EXAMINATION")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/#">{props.t("1. Program –wise Exam Results")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("2. Student Grievances w.r.t Exam & Action taken")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("3. Malpractice Committee report")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-search"></i>
                <span>{props.t("RESEARCH")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/#">{props.t("1. Management funded Project")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("2. Government/ NGO funded projects")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("3. Fellowships awarded for advanced learning & research")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("4. Research Guides")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("5. Research Publications")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("6. Books/Chapters")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("7. Faculty participation & presentation of Research Papers in Conference/Seminars and going as Resource Persons")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-briefcase"></i>
                <span>{props.t("INDUSTRY COLLABORATION")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/#">{props.t("1. MoUs – Agreement Copy & Activities conducted")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("2. Consultancy undertaken by Staff")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("3. Details of Programs offered/ Courses delivered in collaboration with Industry")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("4. Skill development Workshops")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-bulb"></i>
                <span>{props.t("INNOVATION & ENTREPRENUERSHIP")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/#">{props.t("1. Workshops/Seminars conducted on Research Methodology, Intellectual Property Rights (IPR), Entrepreneurship and Skills development")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("2. Innovation")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("3. Patents filed")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("4. Activities conducted by MCCIIE")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-extension"></i>
                <span>{props.t("EXTENSION ACTIVITIES")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/#">{props.t("1. CDP Activity")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("2. NSS /YRC")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("3. NCC")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("4. ISRC")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("5. IKS")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("6. Teacher/Student Award for Extension Activities")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-support"></i>
                <span>{props.t("STUDENT ACTIVITIES/ SUPPORT")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/#">{props.t("1. Capacity Development & Skills Enhancement")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("2. Conferences/Seminars/Workshops")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("3. Guest Lectures")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("4. Career Counseling & Guidance")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("5. Student Progression – Competitive Exams")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("6. Student Progression - Higher Education")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("7. Details of Students enrolled for MOOC")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("8. Intercollegiate events and awards won")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("9. Cultural & Co-Curricular activities conducted in the college")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("10. Sports Events conducted in the college")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("11. Internal Complaints Committee (ICC)")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="mdi mdi-bookshelf"></i>
                <span>{props.t("LIBRARY")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/#">{props.t("1. Databases which are subscribed")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("2. National/International Journals (hard copy)")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("3. Books (Volumes/Titles)")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("4. Annual Expenditure")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-briefcase-alt"></i>
                <span>{props.t("PLACEMENT")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/#">{props.t("1. On campus placement data")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("2. Off campus placement data")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("3. Training programs & Workshops")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("4. Internships")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("5. Career Fair")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-user-check"></i>
                <span>{props.t("STAFF ENHANCEMENT PROGRAMS")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/#">{props.t("1. FDPs")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("2. MOOCs")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("3. Skill Development Workshops")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-group"></i>
                <span>{props.t("ALUMNI")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/#">{props.t("1. Association Activities")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("2. Scholarships provided by Alumni Association")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("3. Financial Contribution by Alumni")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("4. Distinguished Alumni of the last five years")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-globe"></i>
                <span>{props.t("INSTITUTIONAL VALUES")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/#">{props.t("1. Activities hosted to build universal values of peace, truth & harmony")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("2. Gender sensitization & equity programs")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("3. Programs for imbibing Constitutional Values among students")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("4. Commemoration of major National/International Days")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("5. Best Practices")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-building-house"></i>
                <span>{props.t("INFRASTRUCTURE")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/#">{props.t("1. Classrooms")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("2. Labs")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("3. Computer labs / Simulation lab")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("4. Auditorium")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("5. Board rooms")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("6. Amphitheatre")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("7. Seminar halls - infrastructure")}</Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to="/#" className="has-arrow">
                <i className="bx bx-cog"></i>
                <span>{props.t("GOVERNANCE")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/#">{props.t("1. Policy document")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("2. AAA")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("3. Green Audit")}</Link>
                </li>
                <li>
                  <Link to="/#">{props.t("4. Energy Audit")}</Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </SimpleBar>
    </React.Fragment>
  );
};
export default withRouter(withTranslation()(SidebarContent));
