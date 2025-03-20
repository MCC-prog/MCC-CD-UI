import Breadcrumb from 'Components/Common/Breadcrumb';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import Select from 'react-select';
import * as Yup from "yup";
import { Card, CardBody, Col, Container, Input, Label, Row } from 'reactstrap';

const Innovative_Teaching_Methodologies: React.FC = () => {
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
    const semester:any = [
        { value: "1", label: "I" },
        { value: "2", label: "II" },
        { value: "3", label: "III" },
        { value: "4", label: "IV" },
        { value: "5", label: "V" },
        { value: "6", label: "VI" },
    ];

    const semType = [
        { value: "T", label: "ODD" },
        { value: "P", label: "EVEN" },
      ];
     const courses = [
        { value: "T", label: "HEP" },
        { value: "P", label: "HES" },
      ];

    const validation = useFormik({
        initialValues: {
            academicYear: null,
            semType : null,
            semester: [],
            courses : null,
            courseName : "",
            file : null,
        },
        validationSchema: Yup.object({
            academicYear: Yup.object().nullable().required("Please select academic year"),
            semType: Yup.object().nullable().required("Please select semester type"),
            semester: Yup.array().min(1, "Please select at least one semester").required("Please select semester"),
            courses: Yup.object().nullable().required("Please select Program"),
            courseName:  Yup.string().required("Please enter Course Name"),
            file: Yup.mixed()
                .required("Please upload a file")
                .test("fileSize", "File size is too large", (value:any) => {
                    return value && value.size <= 2 * 1024 * 1024; // 2MB limit
                })
                .test("fileType", "Unsupported file format", (value:any) => {
                    return value && ["application/pdf", "image/jpeg", "image/png"].includes(value.type);
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
            <Breadcrumb title="BOS" breadcrumbItem="BOS" />
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
                        <Label>Semester No</Label>
                        <Select
                          options={semester}
                          value={validation.values.semester}
                          onChange={(selectedOptions) =>
                            validation.setFieldValue(
                              "semester",
                              selectedOptions
                            )
                          }
                          placeholder="Select Semesters"
                          isMulti
                          styles={dropdownStyles}
                          menuPortalTarget={document.body}
                          className={
                            validation.touched.semester &&
                            validation.errors.semester
                              ? "select-error"
                              : ""
                          }
                        />
                        {validation.touched.semester &&
                          validation.errors.semester && (
                            <div className="text-danger">
                              {validation.errors.semester}
                            </div>
                          )}
                      </div>
                    </Col>
                    <Col lg={4}>
                      <div className="mb-3">
                        <Label>Semester Type</Label>
                        <Select
                          options={semType}
                          value={validation.values.semType}
                          onChange={(selectedOption) =>
                            validation.setFieldValue("semType", selectedOption)
                          }
                          placeholder="Select Semester Type"
                          styles={dropdownStyles}
                          menuPortalTarget={document.body}
                          className={
                            validation.touched.semType &&
                            validation.errors.semType
                              ? "select-error"
                              : ""
                          }
                        />
                        {validation.touched.semType &&
                          validation.errors.semType && (
                            <div className="text-danger">
                              {validation.errors.semType}
                            </div>
                          )}
                      </div>
                    </Col>
                    <Col lg={4}>
                      <div className="mb-3">
                        <Label>Program</Label>
                        <Select
                          options={courses}
                          value={validation.values.courses}
                          onChange={(selectedOption) =>
                            validation.setFieldValue("courses", selectedOption)
                          }
                          placeholder="Select Program"
                          styles={dropdownStyles}
                          menuPortalTarget={document.body}
                          className={
                            validation.touched.courses &&
                            validation.errors.courses
                              ? "select-error"
                              : ""
                          }
                        />
                        {validation.touched.courses &&
                          validation.errors.courses && (
                            <div className="text-danger">
                              {validation.errors.courses}
                            </div>
                          )}
                      </div>
                    </Col>
                    <Col lg={4}>
                      <div className="mb-3">
                        <Label>Course Name</Label>
                        <Input
                          type="text"
                          name="courseName"
                          value={validation.values.courseName}
                          onChange={validation.handleChange}
                          placeholder="Enter Course Name"
                          className={
                            validation.touched.courseName &&
                            validation.errors.courseName
                              ? "input-error"
                              : ""
                          }
                        />
                        {validation.touched.courseName &&
                          validation.errors.courseName && (
                            <div className="text-danger">
                              {validation.errors.courseName}
                            </div>
                          )}
                      </div>
                    </Col>
                    <Col sm={4}>
                      <div className="mb-3">
                        <Label htmlFor="formFile" className="form-label">
                          Innovative Pedagogy
                        </Label>
                        <Input
                          className={`form-control ${
                            validation.touched.file && validation.errors.file
                              ? "is-invalid"
                              : ""
                          }`}
                          type="file"
                          id="innovativePedagogy"
                          onChange={(event) => {
                            validation.setFieldValue(
                              "innovativePedagogy",
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

export default Innovative_Teaching_Methodologies;