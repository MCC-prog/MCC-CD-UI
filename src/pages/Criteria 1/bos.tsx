import Breadcrumb from 'Components/Common/Breadcrumb';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Col, Container, Form, Label, Row } from 'reactstrap';

const Bos: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        age: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(formData);
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                <Breadcrumb title="BOS" breadcrumbItem="BOS" />
                    <Row className="justify-content-center">
                        <Col xl={10}>
                            <Card
                                style={{
                                    minHeight: '500px',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                    borderColor: '#800000',
                                }}
                            >
                                <CardBody>
                                    <Form>
                                        <Row className="mb-4">
                                            {/* Academic Year */}
                                            <Col lg={4}>
                                                <div className="select-container">
                                                    <Label htmlFor="academic-year" className="select-label">
                                                        Academic Year
                                                    </Label>
                                                    <select id="academic-year" className="select-dropdown">
                                                        <option value="0">Select</option>
                                                        <option value="1">2019 - 2020</option>
                                                        <option value="2">2020 - 2021</option>
                                                        <option value="3">2021 - 2022</option>
                                                        <option value="4">2022 - 2023</option>
                                                        <option value="5">2023 - 2024</option>
                                                        <option value="6">2024 - 2025</option>
                                                    </select>
                                                    <span className="select-dropdown-icon">▾</span>
                                                </div>
                                            </Col>

                                            {/* Stream */}
                                            <Col lg={4}>
                                                <div className="select-container">
                                                    <Label htmlFor="stream" className="select-label">
                                                        Stream
                                                    </Label>
                                                    <select id="stream" className="select-dropdown">
                                                        <option value="0">Select</option>
                                                        <option value="1">One</option>
                                                        <option value="2">Two</option>
                                                        <option value="3">Three</option>
                                                    </select>
                                                    <span className="select-dropdown-icon">▾</span>
                                                </div>
                                            </Col>

                                            {/* Department */}
                                            <Col lg={4}>
                                                <div className="select-container">
                                                    <Label htmlFor="department" className="select-label">
                                                        Department
                                                    </Label>
                                                    <select id="department" className="select-dropdown">
                                                        <option value="0">Select</option>
                                                        <option value="1">One</option>
                                                        <option value="2">Two</option>
                                                        <option value="3">Three</option>
                                                    </select>
                                                    <span className="select-dropdown-icon">▾</span>
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row className="mb-4">
                                            {/* Academic Year */}
                                            <Col lg={4}>
                                                <div className="select-container">
                                                    <Label htmlFor="academic-year" className="select-label">
                                                        Academic Year
                                                    </Label>
                                                    <select id="academic-year" className="select-dropdown">
                                                        <option value="0">Select</option>
                                                        <option value="1">2019 - 2020</option>
                                                        <option value="2">2020 - 2021</option>
                                                        <option value="3">2021 - 2022</option>
                                                        <option value="4">2022 - 2023</option>
                                                        <option value="5">2023 - 2024</option>
                                                        <option value="6">2024 - 2025</option>
                                                    </select>
                                                    <span className="select-dropdown-icon">▾</span>
                                                </div>
                                            </Col>

                                            {/* Stream */}
                                            <Col lg={4}>
                                                <div className="select-container">
                                                    <Label htmlFor="stream" className="select-label">
                                                        Stream
                                                    </Label>
                                                    <select id="stream" className="select-dropdown">
                                                        <option value="0">Select</option>
                                                        <option value="1">One</option>
                                                        <option value="2">Two</option>
                                                        <option value="3">Three</option>
                                                    </select>
                                                    <span className="select-dropdown-icon">▾</span>
                                                </div>
                                            </Col>

                                            {/* Department */}
                                            <Col lg={4}>
                                                <div className="select-container">
                                                    <Label htmlFor="department" className="select-label">
                                                        Department
                                                    </Label>
                                                    <select id="department" className="select-dropdown">
                                                        <option value="0">Select</option>
                                                        <option value="1">One</option>
                                                        <option value="2">Two</option>
                                                        <option value="3">Three</option>
                                                    </select>
                                                    <span className="select-dropdown-icon">▾</span>
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            {/* Program Type */}
                                            <Col lg={4}>
                                                <div className="select-container">
                                                    <Label htmlFor="program-type" className="select-label">
                                                        Program Type
                                                    </Label>
                                                    <select id="program-type" className="select-dropdown">
                                                        <option value="0">Select</option>
                                                        <option value="1">One</option>
                                                        <option value="2">Two</option>
                                                        <option value="3">Three</option>
                                                    </select>
                                                    <span className="select-dropdown-icon">▾</span>
                                                </div>
                                            </Col>

                                            {/* Program */}
                                            <Col lg={4}>
                                                <div className="select-container">
                                                    <Label htmlFor="program" className="select-label">
                                                        Program
                                                    </Label>
                                                    <select id="program" className="select-dropdown">
                                                        <option value="0">Select</option>
                                                        <option value="1">One</option>
                                                        <option value="2">Two</option>
                                                        <option value="3">Three</option>
                                                    </select>
                                                    <span className="select-dropdown-icon">▾</span>
                                                </div>
                                            </Col>
                                        </Row>

                                        <Row className="mt-4">
                                            <Col sm="4">
                                                <button
                                                    className="btn"
                                                    style={{
                                                        backgroundColor: "#800000",
                                                        color: "white",
                                                        borderColor: "#800000",
                                                        width: "100%",
                                                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
                                                    }}
                                                    onClick={() => console.log("Continue Submit")}
                                                >
                                                    Continue Submit
                                                </button>
                                            </Col>
                                            <Col sm="4">
                                                <div className="text-sm-end mt-2 mt-sm-0">
                                                    <button
                                                        onClick={() => alert("View")}
                                                        className="btn"
                                                        style={{
                                                            backgroundColor: "white",
                                                            color: "#800000",
                                                            borderColor: "#800000",
                                                            borderWidth: "2px",
                                                            width: "100%",
                                                        }}
                                                    >
                                                        View Application
                                                    </button>
                                                </div>
                                            </Col>
                                        </Row>

                                    </Form>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default Bos;