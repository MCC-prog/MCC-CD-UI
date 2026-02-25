import React, { useState } from "react";
import { Col, Row, Label } from "reactstrap";
import SemesterTypeDropdown from "./SemesterTypeDropdown";
import Select from "react-select";

interface SemesterDropdownsProps {
  semesterTypeValue: any; // Single object for single-select
  semesterNoValue: any; // Single object for single-select
  onSemesterTypeChange: (selectedOption: any) => void;
  onSemesterNoChange: (selectedOption: any) => void; // Single object
  isSemesterTypeInvalid?: boolean;
  isSemesterNoInvalid?: boolean;
  semesterTypeError?: string | null;
  semesterNoError?: string | null;
  semesterTypeTouched?: boolean;
  semesterNoTouched?: boolean;
}

const SemesterDropdowns: React.FC<SemesterDropdownsProps> = ({
  semesterTypeValue,
  semesterNoValue,
  onSemesterTypeChange,
  onSemesterNoChange,
  isSemesterTypeInvalid = false,
  isSemesterNoInvalid = false,
  semesterTypeError = null,
  semesterNoError = null,
  semesterTypeTouched = false,
  semesterNoTouched = false,
}) => {
  const [semesterNoOptions, setSemesterNoOptions] = useState<{ value: string; label: string }[]>([]);

  // Handle Semester Type Change
  const handleSemesterTypeChange = (selectedOption: any) => {
    onSemesterTypeChange(selectedOption);

    // Update SemesterNo options based on the selected SemesterType
    const options: { value: string; label: string }[] = [];

    if (selectedOption?.value === "odd") {
      options.push(
        { value: "1", label: "I" },
        { value: "3", label: "III" },
        { value: "5", label: "V" },
        { value: "7", label: "VII" }
      );
    }

    if (selectedOption?.value === "even") {
      options.push(
        { value: "2", label: "II" },
        { value: "4", label: "IV" },
        { value: "6", label: "VI" },
        { value: "8", label: "VIII" }
      );
    }

    setSemesterNoOptions(options);

    // Reset the SemesterNo field when SemesterType changes
    onSemesterNoChange(null);
  };

  return (
    <Row>
      {/* Semester Type Dropdown */}
      <Col lg={6}>
        <div className="mb-3">
          <Label>Semester Type</Label>
          <SemesterTypeDropdown
            value={semesterTypeValue}
            onChange={handleSemesterTypeChange}
            isInvalid={isSemesterTypeInvalid}
          />
          {semesterTypeTouched && semesterTypeError && (
            <div className="text-danger">{semesterTypeError}</div>
          )}
        </div>
      </Col>

      {/* Semester No Dropdown */}
      <Col lg={6}>
        <div className="mb-3">
          <Label>Semester No.</Label>
          <Select
            options={semesterNoOptions}
            value={semesterNoValue}
            onChange={(selectedOption) => onSemesterNoChange(selectedOption)}
            placeholder="Select Semester Number"
            className={isSemesterNoInvalid ? "select-error" : ""}
          />
          {semesterNoTouched && semesterNoError && (
            <div className="text-danger">{semesterNoError}</div>
          )}
        </div>
      </Col>
    </Row>
  );
};

export default SemesterDropdowns;