import React, { useState, useEffect } from "react";
import { Row, Col, Collapse } from "reactstrap";
import { Link } from "react-router-dom";
import classname from "classnames";
import withRouter from "../../Components/Common/withRouter"

//i18n
import { withTranslation } from "react-i18next";


const Navbar = (props: any) => {

  const [dashboard, setdashboard] = useState<boolean>(false);
  const [ui, setui] = useState<boolean>(false);
  const [app, setapp] = useState<boolean>(false);
  const [email, setemail] = useState<boolean>(false);
  const [ecommerce, setecommerce] = useState<boolean>(false);
  const [crypto, setcrypto] = useState<boolean>(false);
  const [project, setproject] = useState<boolean>(false);
  const [task, settask] = useState<boolean>(false);
  const [contact, setcontact] = useState<boolean>(false);
  const [blog, setBlog] = useState<boolean>(false);
  const [job, setJob] = useState<boolean>(false);
  const [candidate, setCandidate] = useState<boolean>(false);
  const [component, setcomponent] = useState<boolean>(false);
  const [form, setform] = useState<boolean>(false);
  const [table, settable] = useState<boolean>(false);
  const [chart, setchart] = useState<boolean>(false);
  const [icon, seticon] = useState<boolean>(false);
  const [map, setmap] = useState<boolean>(false);
  const [extra, setextra] = useState<boolean>(false);
  const [invoice, setinvoice] = useState<boolean>(false);
  const [auth, setauth] = useState<boolean>(false);
  const [utility, setutility] = useState<boolean>(false);

  useEffect(() => {
    const pathName = process.env.PUBLIC_URL + props.router.location.pathname;
    var matchingMenuItem = null;
    var ul: any = document.getElementById("navigation");
    var items = ul.getElementsByTagName("a");

    let itemsArray = [...items];
    removeActivation(itemsArray);

    for (var i = 0; i < items.length; ++i) {
      if (pathName === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  }, [props.router.location.pathname]);

  function activateParentDropdown(item: any) {
    item.classList.add("active");
    const parent = item.parentElement;
    if (parent) {
      parent.classList.add("active"); // li
      const parent2 = parent.parentElement;
      parent2.classList.add("active"); // li
      const parent3 = parent2.parentElement;
      if (parent3) {
        parent3.classList.add("active"); // li
        const parent4 = parent3.parentElement;
        if (parent4) {
          parent4.classList.add("active"); // li
          const parent5 = parent4.parentElement;
          if (parent5) {
            parent5.classList.add("active"); // li
            const parent6 = parent5.parentElement;
            if (parent6) {
              parent6.classList.add("active"); // li
            }
          }
        }
      }
    }
    return false;
  }

  const removeActivation = (items: any) => {
    let actiItems = items.filter((x: any) => x.classList.contains("active"));

    actiItems.forEach((item: any) => {
      const parent = item.parentElement

      if (item.classList.contains("dropdown-item")) {
        parent.classList.remove("active");
        const parent2 = parent.parentElement;
        parent2.classList.remove("active");

        if (!item.classList.contains("active")) {
          item.setAttribute("aria-expanded", false);
        }
        if (item.nextElementSibling) {
          item.nextElementSibling.classList.remove("show");
        }
      }
      if (item.classList.contains("nav-link")) {
        if (item.nextElementSibling) {
          item.nextElementSibling.classList.remove("show");
        }
        item.setAttribute("aria-expanded", false);
      }
      item.classList.remove("active");
    });
  };


  return (
    <React.Fragment>
      <div className="topnav">
        <div className="container-fluid">
          <nav
            className="navbar navbar-light navbar-expand-lg topnav-menu"
            id="navigation"
          >
            <Collapse isOpen={props.leftMenu} className="navbar-collapse" id="topnav-menu-content">
              <ul className="navbar-nav">
                <li className="nav-item dropdown">
                  <Link
                    className="nav-link dropdown-toggle arrow-none"
                    to="/dashboard"
                  > 
                    {props.t("Dashboard")} {props.menuOpen}
                  </Link>
                </li>
              </ul>
            </Collapse>
          </nav>
        </div>
      </div>
    </React.Fragment>
  );
};
export default withRouter(withTranslation()(Navbar));