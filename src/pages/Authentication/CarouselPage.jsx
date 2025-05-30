import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Col } from "reactstrap";
import bgImage from "../../assets/images/new.png";

const CarouselPage = () => {
  return (
    <React.Fragment>
      <Col xl={9}>
        <div
          className="auth-full-bg pt-lg-5 p-4"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundColor: "#f5f9fc",
          }}
        ></div>
      </Col>
    </React.Fragment>
  );
};
export default CarouselPage;
