import Breadcrumb from "Components/Common/Breadcrumb";
import { useFormik } from "formik";
import React, { useState } from "react";
import Select from "react-select";
import * as Yup from "yup";
import { Card, CardBody, Col, Container, Input, Label, Row } from "reactstrap";

const AC_GB_MoM: React.FC = () => {
  const dropdownStyles = {
    menu: (provided: any) => ({
      ...provided,
      overflowY: "auto", // Enable scrolling for additional options
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Ensure the menu is above other elements
  };

  const academicYear = [
    { value: "2024", label: "2023-2024" },
    { value: "2025", label: "2024-2025" },
  ];

  const validation = useFormik({
    initialValues: {
      academicYear: null,
      dates: "",
      file: null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.object().nullable().required("Please select academic year"),
      dates: Yup.string().required("Please select Date"),
      file: Yup.mixed()
        .required("Please upload a file")
        .test("fileSize", "File size is too large", (value: any) => {
          return value && value.size <= 2 * 1024 * 1024; // 2MB limit
        })
        .test("fileType", "Unsupported file format", (value: any) => {
          return (
            value &&
            ["application/pdf", "image/jpeg", "image/png"].includes(value.type)
          );
        }),
    }),
    onSubmit: (values) => {
      console.log("Submitting form...", values);
    },
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="New Courses Introduced"
            breadcrumbItem="New Courses Introduced"
          />
          <Card>
            <CardBody>
              <form onSubmit={validation.handleSubmit}>
                <Row>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label>Academic Year</Label>
                      <Select
                        options={academicYear}
                        value={validation.values.academicYear}
                        onChange={(selectedOption) =>
                          validation.setFieldValue(
                            "academicYear",
                            selectedOption
                          )
                        }
                        placeholder="Select Academic Year"
                        styles={dropdownStyles}
                        menuPortalTarget={document.body}
                        className={
                          validation.touched.academicYear &&
                          validation.errors.academicYear
                            ? "select-error"
                            : ""
                        }
                      />
                      {validation.touched.academicYear &&
                        validation.errors.academicYear && (
                          <div className="text-danger">
                            {validation.errors.academicYear}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col lg={4}>
                    <div className="mb-3">
                      <Label> Date </Label>
                      <Input
                        type="date"
                        name="dates"
                        value={validation.values.dates}
                        onChange={validation.handleChange}
                        placeholder="Enter Year of Introduction"
                        className={
                          validation.touched.dates &&
                          validation.errors.dates
                            ? "input-error"
                            : ""
                        }
                      />
                      {validation.touched.dates &&
                        validation.errors.dates && (
                          <div className="text-danger">
                            {validation.errors.dates}
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Academic Council MOM
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.file && validation.errors.file
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="academicCouncil"
                        onChange={(event) => {
                          validation.setFieldValue(
                            "academicCouncil",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                      />
                      {validation.touched.file && validation.errors.file && (
                        <div className="text-danger">
                          {validation.errors.file}
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mb-3">
                      <Label htmlFor="formFile" className="form-label">
                        Governing Body MoM
                      </Label>
                      <Input
                        className={`form-control ${
                          validation.touched.file && validation.errors.file
                            ? "is-invalid"
                            : ""
                        }`}
                        type="file"
                        id="governingBody"
                        onChange={(event) => {
                          validation.setFieldValue(
                            "governingBody",
                            event.currentTarget.files
                              ? event.currentTarget.files[0]
                              : null
                          );
                        }}
                      />
                      {validation.touched.file && validation.errors.file && (
                        <div className="text-danger">
                          {validation.errors.file}
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
                <div className="mt-3 d-grid">
                  <button className="btn btn-primary btn-block" type="submit">
                    Submit Application
                  </button>
                </div>
              </form>
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AC_GB_MoM;